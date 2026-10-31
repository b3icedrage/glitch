import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth, onIdTokenChanged, setPersistence, browserLocalPersistence,
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut,
  sendPasswordResetEmail, confirmPasswordReset, updateProfile, User as FirebaseUser,
} from 'firebase/auth';

export interface GlitchUser {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}
interface GlitchSession { access_token: string; user: GlitchUser; }
interface AuthContextValue {
  user: GlitchUser | null;
  session: GlitchSession | null;
  loading: boolean;
  configured: boolean;
  isPasswordRecovery: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  clearPasswordRecovery: () => void;
}
const AuthContext = createContext<AuthContextValue | null>(null);
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
};
const configured = Boolean(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId);
const app = configured ? (getApps()[0] || initializeApp(firebaseConfig)) : null;
const firebaseAuth = app ? getAuth(app) : null;

function requireAuth() {
  if (!firebaseAuth) throw new Error('Firebase is not configured. Add the VITE_FIREBASE_* web app settings to Vercel and redeploy.');
  return firebaseAuth;
}
function toGlitchUser(user: FirebaseUser): GlitchUser {
  return { id: user.uid, email: user.email || undefined, user_metadata: { display_name: user.displayName || user.email?.split('@')[0] || '' } };
}
function authError(error: unknown): Error {
  const code = typeof error === 'object' && error && 'code' in error ? String((error as { code: unknown }).code) : '';
  const messages: Record<string, string> = {
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/invalid-credential': 'The email or password is incorrect.',
    'auth/user-not-found': 'No account exists for this email. Create an account first.',
    'auth/wrong-password': 'The email or password is incorrect.',
    'auth/email-already-in-use': 'An account already exists for this email. Sign in instead.',
    'auth/weak-password': 'Choose a stronger password with at least 8 characters.',
    'auth/too-many-requests': 'Too many attempts. Wait a little and try again.',
    'auth/network-request-failed': 'Could not reach Firebase. Check your internet connection and try again.',
    'auth/invalid-action-code': 'This password-reset link is invalid or has expired. Request a new one.',
    'auth/expired-action-code': 'This password-reset link has expired. Request a new one.',
    'auth/operation-not-allowed': 'Email/password sign-in is not enabled in Firebase Authentication.',
    'auth/configuration-not-found': 'Firebase Authentication is not enabled for this project yet.',
  };
  return new Error(messages[code] || (error instanceof Error ? error.message : 'Authentication failed. Please try again.'));
}

export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<GlitchUser | null>(null);
  const [session, setSession] = useState<GlitchSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');

  useEffect(() => {
    if (!firebaseAuth) { setLoading(false); return; }
    let active = true;
    let unsubscribe: (() => void) | undefined;
    setPersistence(firebaseAuth, browserLocalPersistence).then(() => {
      if (!active) return;
      unsubscribe = onIdTokenChanged(firebaseAuth, async (firebaseUser) => {
        if (!firebaseUser) {
          if (active) { setUser(null); setSession(null); setLoading(false); }
          return;
        }
        try {
          const accessToken = await firebaseUser.getIdToken();
          if (active) {
            const mapped = toGlitchUser(firebaseUser);
            setUser(mapped);
            setSession({ access_token: accessToken, user: mapped });
            setLoading(false);
          }
        } catch {
          if (active) { setUser(null); setSession(null); setLoading(false); }
        }
      });
    }).catch(() => { if (active) setLoading(false); });
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'resetPassword' && params.get('oobCode')) {
      setRecoveryCode(params.get('oobCode') || '');
      setIsPasswordRecovery(true);
    }
    return () => { active = false; unsubscribe?.(); };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try { await signInWithEmailAndPassword(requireAuth(), email, password); }
    catch (error) { throw authError(error); }
  }, []);
  const signUp = useCallback(async (email: string, password: string) => {
    try {
      const credential = await createUserWithEmailAndPassword(requireAuth(), email, password);
      await updateProfile(credential.user, { displayName: email.split('@')[0] });
      await credential.user.getIdToken(true);
      return true;
    } catch (error) { throw authError(error); }
  }, []);
  const signOut = useCallback(async () => {
    try { await firebaseSignOut(requireAuth()); }
    catch (error) { throw authError(error); }
  }, []);
  const sendPasswordReset = useCallback(async (email: string) => {
    try { await sendPasswordResetEmail(requireAuth(), email, { url: window.location.origin, handleCodeInApp: false }); }
    catch (error) { throw authError(error); }
  }, []);
  const updatePassword = useCallback(async (password: string) => {
    if (!recoveryCode) throw new Error('Your password-reset link is missing or expired. Request a new reset link.');
    try {
      await confirmPasswordReset(requireAuth(), recoveryCode, password);
      setRecoveryCode('');
      setIsPasswordRecovery(false);
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) { throw authError(error); }
  }, [recoveryCode]);
  const clearPasswordRecovery = useCallback(() => {
    setIsPasswordRecovery(false);
    setRecoveryCode('');
    window.history.replaceState({}, document.title, window.location.pathname);
  }, []);
  const value = useMemo<AuthContextValue>(() => ({
    user, session, loading, configured, isPasswordRecovery,
    signIn, signUp, signOut, sendPasswordReset, updatePassword, clearPasswordRecovery,
  }), [user, session, loading, isPasswordRecovery, signIn, signUp, signOut, sendPasswordReset, updatePassword, clearPasswordRecovery]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useFirebaseAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useFirebaseAuth must be used inside FirebaseAuthProvider.');
  return value;
}
