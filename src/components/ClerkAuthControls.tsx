import React from 'react';
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/react';

/**
 * Clerk controls are only mounted when the publishable key is configured.
 * This keeps local previews usable while Vercel environment setup is pending.
 */
export const ClerkAuthControls: React.FC = () => {
  const configured = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

  if (!configured) {
    return (
      <span
        className="hidden sm:inline-flex items-center rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-[10px] font-semibold text-amber-300"
        title="Set VITE_CLERK_PUBLISHABLE_KEY in the deployment environment to enable sign-in"
      >
        AUTH SETUP PENDING
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-cyan-400 hover:text-white">
            Sign in
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button className="rounded-lg bg-cyan-400 px-3 py-2 text-xs font-bold text-slate-950 transition-colors hover:bg-cyan-300">
            Sign up
          </button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <UserButton />
      </Show>
    </div>
  );
};
