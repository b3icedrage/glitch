import { FormEvent, useEffect, useState } from "react";
import { authClient } from "../lib/auth-client";
import {
  identifyAnalyticsUser,
  resetAnalyticsUser,
} from "../lib/analytics";

export function BetterAuthGate({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const [mode, setMode] = useState<"signin" | "signup" | "reset" | "new-password">(
    new URLSearchParams(window.location.search).has("token") ? "new-password" : "signin",
  );
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (session?.user?.id) identifyAnalyticsUser(session.user.id);
    else resetAnalyticsUser();
  }, [session?.user?.id]);

  if (isPending) {
    return <div className="min-h-screen bg-[#0b100c] text-white grid place-items-center">Loading your secure session…</div>;
  }

  if (session?.user && mode !== "new-password") return <>{children}</>;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (mode === "signin") {
        const result = await authClient.signIn.email({ email: email.trim(), password });
        if (result.error) throw new Error(result.error.message || "Sign in failed.");
      } else if (mode === "signup") {
        if (password !== confirmPassword) throw new Error("The passwords do not match.");
        const result = await authClient.signUp.email({
          email: email.trim(),
          password,
          name: name.trim() || email.split("@")[0],
        });
        if (result.error) throw new Error(result.error.message || "Account creation failed.");
        setMessage("Your account has been created. You can now sign in.");
        setMode("signin");
        setPassword("");
        setConfirmPassword("");
      } else if (mode === "reset") {
        const result = await authClient.requestPasswordReset({
          email: email.trim(),
          redirectTo: window.location.origin,
        });
        if (result.error) throw new Error(result.error.message || "Could not request a password reset.");
        setMessage("If an account exists for that email, a reset link has been sent.");
      } else {
        const token = new URLSearchParams(window.location.search).get("token");
        if (!token) throw new Error("This password-reset link is invalid or expired.");
        if (password !== confirmPassword) throw new Error("The passwords do not match.");
        const result = await authClient.resetPassword({ newPassword: password, token });
        if (result.error) throw new Error(result.error.message || "Could not reset your password.");
        window.history.replaceState({}, document.title, window.location.pathname);
        setMode("signin");
        setPassword("");
        setConfirmPassword("");
        setMessage("Password updated. Please sign in.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setBusy(false);
    }
  };

  const heading = mode === "signin" ? "Welcome back"
    : mode === "signup" ? "Create your account"
    : mode === "reset" ? "Reset password" : "Choose a new password";

  return (
    <main className="min-h-screen bg-[#0b100c] text-[#f3f5ee] flex items-center justify-center px-4 py-10">
      <section className="w-full max-w-md rounded-3xl border border-[#a4be9d]/20 bg-[#151c16] p-7 shadow-2xl">
        <div className="mb-7">
          <div className="text-xs font-bold tracking-[0.3em] text-[#8fca83]">GLITCH CREATOR STUDIO</div>
          <h1 className="mt-3 text-3xl font-black">{heading}</h1>
          <p className="mt-2 text-sm text-[#b2b9ad]">Your creator community, securely connected.</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          {(mode === "signin" || mode === "signup" || mode === "reset") && (
            <label className="block text-sm font-semibold">Email
              <input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#8fca83]" placeholder="you@example.com" />
            </label>
          )}
          {mode === "signup" && (
            <label className="block text-sm font-semibold">Display name
              <input type="text" autoComplete="name" value={name} onChange={e => setName(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#8fca83]" placeholder="Your name" />
            </label>
          )}
          {(mode === "signin" || mode === "signup" || mode === "new-password") && (
            <label className="block text-sm font-semibold">Password
              <input type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} required minLength={8} value={password} onChange={e => setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#8fca83]" placeholder="At least 8 characters" />
            </label>
          )}
          {(mode === "signup" || mode === "new-password") && (
            <label className="block text-sm font-semibold">Confirm password
              <input type="password" autoComplete="new-password" required minLength={8} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#8fca83]" placeholder="Repeat your password" />
            </label>
          )}
          {error && <p role="alert" className="rounded-xl bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
          {message && <p role="status" className="rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-200">{message}</p>}
          <button disabled={busy} className="w-full rounded-xl bg-[#8fca83] px-4 py-3 font-extrabold text-[#102010] disabled:opacity-60">
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : mode === "reset" ? "Send reset link" : "Update password"}
          </button>
        </form>
        {mode !== "new-password" && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-[#b2b9ad]">
            {mode === "signin" ? (
              <>
                <button onClick={() => { setMode("signup"); setMessage(""); setError(""); }} className="hover:text-white">Create account</button>
                <button onClick={() => { setMode("reset"); setMessage(""); setError(""); }} className="hover:text-white">Forgot password?</button>
              </>
            ) : (
              <button onClick={() => { setMode("signin"); setMessage(""); setError(""); }} className="hover:text-white">Back to sign in</button>
            )}
          </div>
        )}
        <p className="mt-7 text-center text-xs text-[#7f897d]">Authentication powered by Better Auth + Convex</p>
      </section>
    </main>
  );
}
