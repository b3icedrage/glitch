import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
export interface GlitchUser { id: string; email?: string; user_metadata?: Record<string, unknown>; }
interface FirebaseSession { access_token: string; refresh_token: string; expires_at: number; user: GlitchUser; }
interface AuthContextValue {
 user: GlitchUser | null; session: FirebaseSession | null; loading: boolean; configured: boolean; isPasswordRecovery: boolean;
 signIn:(email:string,password:string)=>Promise<void>; signUp:(email:string,password:string)=>Promise<boolean>;
 signOut:()=>Promise<void>; sendPasswordReset:(email:string)=>Promise<void>; updatePassword:(password:string)=>Promise<void>; clearPasswordRecovery:()=>void;
}
const AuthContext=createContext<AuthContextValue|null>(null);
const API_KEY=import.meta.env.VITE_FIREBASE_API_KEY||'';
const configured=Boolean(API_KEY&&import.meta.env.VITE_FIREBASE_PROJECT_ID&&import.meta.env.VITE_FIREBASE_APP_ID);
const STORAGE_KEY='glitch.firebase.session';
const IDENTITY_URL='https://identitytoolkit.googleapis.com/v1';
const TOKEN_URL='https://securetoken.googleapis.com/v1/token';
type FirebaseResponse={idToken?:string;refreshToken?:string;expiresIn?:string;localId?:string;email?:string;displayName?:string;error?:{message?:string};users?:Array<{localId:string;email?:string;displayName?:string}>};
function firebaseMessage(code:string):string {
 const messages:Record<string,string>={EMAIL_EXISTS:'An account already exists for this email. Sign in instead.',EMAIL_NOT_FOUND:'No account exists for this email. Create an account first.',INVALID_PASSWORD:'The email or password is incorrect.',INVALID_LOGIN_CREDENTIALS:'The email or password is incorrect.',INVALID_EMAIL:'Enter a valid email address.',WEAK_PASSWORD:'Choose a stronger password with at least 8 characters.',TOO_MANY_ATTEMPTS_TRY_LATER:'Too many attempts. Wait a little and try again.',OPERATION_NOT_ALLOWED:'Email/password sign-in is not enabled in Firebase Authentication.',EXPIRED_OOB_CODE:'This password-reset link has expired. Request a new one.',INVALID_OOB_CODE:'This password-reset link is invalid or has expired. Request a new one.',USER_DISABLED:'This account has been disabled. Contact support.',API_KEY_INVALID:'The Firebase API key is invalid. Check VITE_FIREBASE_API_KEY.',PROJECT_NOT_FOUND:'The Firebase project could not be found. Check VITE_FIREBASE_PROJECT_ID.'};
 return messages[code]||code.replace(/_/g,' ').toLowerCase();
}
async function firebaseRequest<T extends FirebaseResponse>(endpoint:string,body:Record<string,unknown>):Promise<T>{
 let response:Response;
 try{response=await fetch(`${IDENTITY_URL}/${endpoint}?key=${encodeURIComponent(API_KEY)}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});}
 catch{throw new Error('Could not reach Firebase. Check your internet connection and Firebase project settings.');}
 const data=await response.json().catch(()=>({})) as T;
 if(!response.ok)throw new Error(firebaseMessage(data.error?.message||'AUTHENTICATION_FAILED'));
 return data;
}
function mapUser(data:{localId:string;email?:string;displayName?:string}):GlitchUser{return{id:data.localId,email:data.email,user_metadata:{display_name:data.displayName||data.email?.split('@')[0]||''}};}
function saveSession(value:FirebaseSession|null){if(value)localStorage.setItem(STORAGE_KEY,JSON.stringify(value));else localStorage.removeItem(STORAGE_KEY);}
function readSession():FirebaseSession|null{try{const raw=localStorage.getItem(STORAGE_KEY);return raw?JSON.parse(raw) as FirebaseSession:null;}catch{localStorage.removeItem(STORAGE_KEY);return null;}}
export function FirebaseAuthProvider({children}:{children:React.ReactNode}){
 const[session,setSession]=useState<FirebaseSession|null>(null);const[loading,setLoading]=useState(true);const[isPasswordRecovery,setIsPasswordRecovery]=useState(false);const[recoveryCode,setRecoveryCode]=useState('');
 const applySession=useCallback((next:FirebaseSession|null)=>{setSession(next);saveSession(next);},[]);
 const refreshSession=useCallback(async(current:FirebaseSession)=>{
  const result=await fetch(`${TOKEN_URL}?key=${encodeURIComponent(API_KEY)}`,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'refresh_token',refresh_token:current.refresh_token}).toString()});
  const tokens=await result.json() as {id_token?:string;refresh_token?:string;expires_in?:string;error?:{message?:string}};
  if(!result.ok||!tokens.id_token||!tokens.refresh_token)throw new Error(tokens.error?.message||'Could not refresh your Firebase session.');
  const lookup=await firebaseRequest<FirebaseResponse>('accounts:lookup',{idToken:tokens.id_token});const account=lookup.users?.[0];
  if(!account)throw new Error('Your Firebase session is no longer valid. Sign in again.');
  const next={access_token:tokens.id_token,refresh_token:tokens.refresh_token,expires_at:Date.now()+Number(tokens.expires_in||3600)*1000,user:mapUser(account)};
  applySession(next);return next;
 },[applySession]);
 useEffect(()=>{
  let active=true;
  const initialize=async()=>{
   if(!configured){setLoading(false);return;}
   const params=new URLSearchParams(window.location.search);
   if(params.get('mode')==='resetPassword'&&params.get('oobCode')){setRecoveryCode(params.get('oobCode')||'');setIsPasswordRecovery(true);}
   const stored=readSession();if(!stored){if(active)setLoading(false);return;}
   try{
    let current=stored;
    if(current.expires_at<Date.now()+60000)current=await refreshSession(current);
    else{const lookup=await firebaseRequest<FirebaseResponse>('accounts:lookup',{idToken:current.access_token});const account=lookup.users?.[0];if(!account)throw new Error('Invalid Firebase session.');current={...current,user:mapUser(account)};applySession(current);}
    if(active)setSession(current);
   }catch{if(active)applySession(null);}finally{if(active)setLoading(false);}
  };
  initialize();return()=>{active=false;};
 },[applySession,refreshSession]);
 useEffect(()=>{if(!session?.refresh_token)return;const timer=window.setInterval(()=>{if(session.expires_at<Date.now()+90000)refreshSession(session).catch(()=>applySession(null));},30000);return()=>window.clearInterval(timer);},[session,refreshSession,applySession]);
 const signIn=useCallback(async(email:string,password:string)=>{
  if(!configured)throw new Error('Firebase is not configured. Add the VITE_FIREBASE_* web app settings to Vercel and redeploy.');
  const r=await firebaseRequest<FirebaseResponse>('accounts:signInWithPassword',{email,password,returnSecureToken:true});
  if(!r.idToken||!r.refreshToken||!r.localId)throw new Error('Firebase returned an incomplete sign-in response.');
  applySession({access_token:r.idToken,refresh_token:r.refreshToken,expires_at:Date.now()+Number(r.expiresIn||3600)*1000,user:mapUser({localId:r.localId,email:r.email,displayName:r.displayName})});
 },[applySession]);
 const signUp=useCallback(async(email:string,password:string)=>{
  if(!configured)throw new Error('Firebase is not configured. Add the VITE_FIREBASE_* web app settings to Vercel and redeploy.');
  const r=await firebaseRequest<FirebaseResponse>('accounts:signUp',{email,password,returnSecureToken:true});
  if(!r.idToken||!r.refreshToken||!r.localId)throw new Error('Firebase returned an incomplete account-creation response.');
  const profile=await firebaseRequest<FirebaseResponse>('accounts:update',{idToken:r.idToken,displayName:email.split('@')[0],returnSecureToken:true});
  applySession({access_token:profile.idToken||r.idToken,refresh_token:profile.refreshToken||r.refreshToken,expires_at:Date.now()+Number(profile.expiresIn||r.expiresIn||3600)*1000,user:mapUser({localId:r.localId,email:r.email,displayName:profile.displayName||email.split('@')[0]})});
  return true;
 },[applySession]);
 const signOut=useCallback(async()=>{applySession(null);},[applySession]);
 const sendPasswordReset=useCallback(async(email:string)=>{if(!configured)throw new Error('Firebase is not configured.');await firebaseRequest<FirebaseResponse>('accounts:sendOobCode',{requestType:'PASSWORD_RESET',email,continueUrl:window.location.origin});},[]);
 const updatePassword=useCallback(async(password:string)=>{
  if(!recoveryCode)throw new Error('Your password-reset link is missing or expired. Request a new reset link.');
  await firebaseRequest<FirebaseResponse>('accounts:resetPassword',{oobCode:recoveryCode,newPassword:password});
  setRecoveryCode('');setIsPasswordRecovery(false);window.history.replaceState({},document.title,window.location.pathname);
 },[recoveryCode]);
 const clearPasswordRecovery=useCallback(()=>{setIsPasswordRecovery(false);setRecoveryCode('');window.history.replaceState({},document.title,window.location.pathname);},[]);
 const value=useMemo<AuthContextValue>(()=>({user:session?.user||null,session,loading,configured,isPasswordRecovery,signIn,signUp,signOut,sendPasswordReset,updatePassword,clearPasswordRecovery}),[session,loading,isPasswordRecovery,signIn,signUp,signOut,sendPasswordReset,updatePassword,clearPasswordRecovery]);
 return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useFirebaseAuth(){const value=useContext(AuthContext);if(!value)throw new Error('useFirebaseAuth must be used inside FirebaseAuthProvider.');return value;}
