import React, { FormEvent, useState } from 'react';
import { useFirebaseAuth } from './firebaseAuth';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const auth = useFirebaseAuth();
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (auth.loading) return <div className="min-h-screen bg-[#0b100c] text-white grid place-items-center">Loading your secure session…</div>;
  if (auth.user && !auth.isPasswordRecovery) return <>{children}</>;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if ((mode === 'signup' || auth.isPasswordRecovery) && password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }
    setBusy(true);
    setError('');
    setMessage('');
    try {
      if (auth.isPasswordRecovery) {
        await auth.updatePassword(password);
        setPassword('');
        setConfirmPassword('');
        setMessage('Your password has been updated. You can now sign in.');
        setMode('signin');
      } else if (mode === 'signin') {
        await auth.signIn(email.trim(), password);
      } else if (mode === 'signup') {
        await auth.signUp(email.trim(), password);
        setMessage('Your Glitch account is ready.');
      } else {
        await auth.sendPasswordReset(email.trim());
        setMessage('If an account exists for that email, a password-reset link has been sent.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const heading = auth.isPasswordRecovery ? 'Choose a new password' :
    mode === 'signin' ? 'Welcome back' : mode === 'signup' ? 'Create your account' : 'Reset password';

  return (
    <main className="min-h-screen bg-[#0b100c] text-[#f3f5ee] flex items-center justify-center px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-[#a4be9d]/20 bg-[#151c16] p-7 shadow-2xl">
        <div className="mb-7">
          <div className="text-xs font-bold tracking-[0.3em] text-[#8fca83]">GLITCH CREATOR STUDIO</div>
          <h1 className="mt-3 text-3xl font-black">{heading}</h1>
          <p className="mt-2 text-sm text-[#b2b9ad]">{auth.isPasswordRecovery ? 'Enter and confirm your new password.' : 'Sign in securely with your Glitch account.'}</p>
        </div>

        {!auth.configured ? (
          <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
            <strong>Firebase setup required.</strong>
            <p className="mt-2">Add your Firebase Web App settings to the Vercel environment: <code>VITE_FIREBASE_API_KEY</code>, <code>VITE_FIREBASE_AUTH_DOMAIN</code>, <code>VITE_FIREBASE_PROJECT_ID</code>, and <code>VITE_FIREBASE_APP_ID</code>. Enable Email/Password in Firebase Authentication.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            {!auth.isPasswordRecovery && mode !== 'reset' && <label className="block text-sm font-semibold">Email
              <input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#8fca83]" placeholder="you@example.com" />
            </label>}
            {!auth.isPasswordRecovery && mode === 'reset' && <label className="block text-sm font-semibold">Email
              <input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#8fca83]" placeholder="you@example.com" />
            </label>}
            {(auth.isPasswordRecovery || mode !== 'reset') && <label className="block text-sm font-semibold">Password
              <input type="password" autoComplete={auth.isPasswordRecovery || mode === 'signup' ? 'new-password' : 'current-password'} required minLength={8} value={password} onChange={e => setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#8fca83]" placeholder="At least 8 characters" />
            </label>}
            {(auth.isPasswordRecovery || mode === 'signup') && <label className="block text-sm font-semibold">Confirm password
              <input type="password" autoComplete="new-password" required minLength={8} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#8fca83]" placeholder="Repeat your password" />
            </label>}
            {error && <p role="alert" className="rounded-xl bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
            {message && <p role="status" className="rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-200">{message}</p>}
            <button disabled={busy} className="w-full rounded-xl bg-[#8fca83] px-4 py-3 font-extrabold text-[#102010] disabled:opacity-60">
              {busy ? 'Please wait…' : auth.isPasswordRecovery ? 'Update password' : mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send reset link'}
            </button>
          </form>
        )}

        {!auth.isPasswordRecovery && <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-[#b2b9ad]">
          {mode === 'signin' ? <>
            <button type="button" onClick={() => { setMode('signup'); setMessage(''); setError(''); }} className="hover:text-white">Create account</button>
            <button type="button" onClick={() => { setMode('reset'); setMessage(''); setError(''); }} className="hover:text-white">Forgot password?</button>
          </> : <button type="button" onClick={() => { setMode('signin'); setMessage(''); setError(''); }} className="hover:text-white">Back to sign in</button>}
        </div>}
        <p className="mt-7 text-center text-xs text-[#7f897d]">Authentication powered by Firebase</p>
      </section>
    </main>
  );
}
