import React from "react";
import { createRoot } from "react-dom/client";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import App from "./App";
import "./index.css";
import { BetterAuthGate } from "./auth/BetterAuthGate";
import { convex } from "./lib/convex";
import { authClient } from "./lib/auth-client";
import { initializeAnalytics } from "./lib/analytics";

initializeAnalytics();

function ApplicationRoot() {
  if (!convex || !import.meta.env.VITE_CONVEX_SITE_URL) {
    return (
      <main className="min-h-screen bg-[#0b100c] text-white grid place-items-center px-6">
        <section className="max-w-xl rounded-2xl border border-white/10 bg-[#151c16] p-6">
          <h1 className="text-2xl font-black">Glitch setup required</h1>
          <p className="mt-3 text-sm text-[#b2b9ad]">
            Configure VITE_CONVEX_URL and VITE_CONVEX_SITE_URL in your local environment or Cloudflare Pages settings to connect Glitch to its Convex backend.
          </p>
        </section>
      </main>
    );
  }

  return (
    <ConvexBetterAuthProvider client={convex} authClient={authClient}>
      <BetterAuthGate>
        <App />
      </BetterAuthGate>
    </ConvexBetterAuthProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ApplicationRoot />
  </React.StrictMode>,
);
