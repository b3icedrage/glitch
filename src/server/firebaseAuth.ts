import type { Request, Response, NextFunction } from 'express';
const IDENTITY_URL='https://identitytoolkit.googleapis.com/v1';
export async function requireFirebaseUser(req:Request,res:Response,next:NextFunction){
 const raw=req.headers.authorization;const authorization=Array.isArray(raw)?(raw[0]||''):(raw||'');
 const token=authorization.toLowerCase().startsWith('bearer ')?authorization.slice(7).trim():'';
 if(!token)return res.status(401).json({success:false,error:'Sign in is required.'});
 const apiKey=process.env.FIREBASE_API_KEY||process.env.VITE_FIREBASE_API_KEY||'';
 if(!apiKey)return res.status(503).json({success:false,error:'Firebase server verification is not configured.'});
 try{
  const response=await fetch(`${IDENTITY_URL}/accounts:lookup?key=${encodeURIComponent(apiKey)}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({idToken:token})});
  const data=await response.json() as {users?:Array<{localId?:string;email?:string;emailVerified?:boolean}>};
  const user=data.users?.[0];
  if(!response.ok||!user?.localId||!user.email)return res.status(401).json({success:false,error:'Your session is invalid or expired. Please sign in again.'});
  (req as any).firebaseUser=user;return next();
 }catch(error){console.error('[Firebase Auth] Token verification failed:',error);return res.status(503).json({success:false,error:'Firebase authentication is temporarily unavailable.'});}
}
