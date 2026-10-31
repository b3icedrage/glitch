import React, { FormEvent, useState } from 'react';
import { useSupabaseAuth } from './supabaseAuth';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const auth = useSupabaseAuth();
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (auth.loading) {
    return <div className="min-h-screen bg-[#0b100c] text-white grid place-items-center">Loading your secure session…</div>;
  }

  if (auth.user && !auth.isPasswordRecovery) return <>{children}</>;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (auth.isPasswordRecovery && password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }
    setBusy(true);
    setError('');
    setMessage('');
    try {
      if (auth.isPasswordRecovery) {
        await auth.updatePassword(password);
        auth.clearPasswordRecovery();
        setPassword('');
        setConfirmPassword('');
        setMessage('Your password has been updated.');
      } else if (mode === 'signin') {
        await auth.signIn(email.trim(), password);
      } else if (mode === 'signup') {
        const signedIn = await auth.signUp(email.trim(), password);
        setMessage(signedIn ? 'Your account is ready.' : 'Check your email to confirm your account, then sign in.');
        if (!signedIn) setMode('signin');
      } else {
        await auth.sendPasswordReset(email.trim());
        setMessage('If an account exists for that email, a password-reset link has been sent.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setBusy(false);
    }
  };

  const heading = auth.isPasswordRecovery
    ? 'Choose a new password'
    : mode === 'signin' ? 'Welcome back' : mode === 'signup' ? 'Create your account' : 'Reset password';

  return (
    <main className="min-h-screen bg-[#0b100c] text-[#f3f5ee] flex items-center justify-center px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-[#a4be9d]/20 bg-[#151c16] p-7 shadow-2xl">
        <div className="mb-7">
          <div className="text-xs font-bold tracking-[0.3em] text-[#8fca83]">GLITCH CREATOR STUDIO</div>
          <h1 className="mt-3 text-3xl font-black">{heading}</h1>
          <p className="mt-2 text-sm text-[#b2b9ad]">
            {auth.isPasswordRecovery ? 'Enter and confirm your new password to secure your account.' : 'Sign in securely with your Glitch account.'}
          </p>
        </div>

        {!auth.configured ? (
          <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
            <strong>Supabase setup required.</strong>
            <p className="mt-2">Create a Supabase project, then add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to the Glitch Vercel project. Never put a service-role key in these variables.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            {!auth.isPasswordRecovery && <label className="block text-sm font-semibold">Email
              <input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#8fca83]" placeholder="you@example.com" />
            </label>}
            {(auth.isPasswordRecovery || mode !== 'reset') && <label className="block text-sm font-semibold">Password
              <input type="password" autoComplete={auth.isPasswordRecovery ? 'new-password' : mode === 'signin' ? 'current-password' : 'new-password'} required minLength={8} value={password} onChange={e => setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#8fca83]" placeholder="At least 8 characters" />
            </label>}
            {error && <p role="alert" className="rounded-xl bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
            {message && <p role="status" className="rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-200">{message}</p>}
            <button disabled={busy} className="w-full rounded-xl bg-[#8fca83] px-4 py-3 font-extrabold text-[#102010] disabled:opacity-60">
              {busy ? 'Please wait…' : auth.isPasswordRecovery ? 'Update password' : mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send reset link'}
            </button>
          </form>
        )}

        {!auth.isPasswordRecovery && <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-[#b2b9ad]">
          {mode === 'signin' ? (
            <>
              <button onClick={() => { setMode('signup'); setMessage(''); setError(''); }} className="hover:text-white">Create account</button>
              <button onClick={() => { setMode('reset'); setMessage(''); setError(''); }} className="hover:text-white">Forgot password?</button>
            </>
          ) : (
            <button onClick={() => { setMode('signin'); setMessage(''); setError(''); }} className="hover:text-white">Back to sign in</button>
          )}
        </div>}
        <p className="mt-7 text-center text-xs text-[#7f897d]">Authentication powered by Supabase</p>
      </section>
    </main>
  );
}
