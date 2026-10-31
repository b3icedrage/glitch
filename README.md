# GLITCH

**A creator-first social playground for short video, live moments, stories, and community.**

Glitch brings fast, expressive creator experiences into a deep forest-green interface with soft peach accents. Explore the Sparks vertical feed, browse the following feed, discover creators, watch long-form videos, join live rooms, share stories, and message your community.

> This repository is an actively evolving product prototype. Review the configuration and server integrations before using it with real users or processing payments.

## What’s inside

- **Sparks** — a vertical short-form video experience.
- **Following feed & stories** — creator posts and story viewing.
- **Explore** — discover posts, reels, and channels.
- **Live** — interactive live-room UI with chat and creator tipping flows.
- **Cinema** — long-form video browsing and channel subscriptions.
- **Direct messages** — conversation inbox and messaging UI.
- **Creator tools** — upload/create flows, comments, notifications, and profile views.
- **Sound Hub & effects** — sound discovery and client-side audio/visual effects.
- **Optional integrations** — server routes for Gemini-powered features and Kelviq billing/usage.

## Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS 4
- Lucide icons
- Express + TypeScript server
- Google GenAI SDK and Kelviq Node SDK for optional integrations

## Firebase Authentication setup

Glitch uses Firebase Authentication for email/password accounts. The frontend calls Firebase's Identity Toolkit REST API and stores Firebase ID tokens with refresh tokens in browser local storage. Protected Kelviq routes validate ID tokens with Firebase before continuing.

1. Create a Firebase project in [Firebase Console](https://console.firebase.google.com/).
2. Open **Authentication → Sign-in method** and enable **Email/Password**.
3. In **Project settings → General → Your apps**, register a Web app and copy its config values.
4. Add these Vercel environment variables for **Production** and **Preview**, then redeploy:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID` (optional)
   - `VITE_FIREBASE_STORAGE_BUCKET` (optional)
5. In **Authentication → Settings → Authorized domains**, add the Glitch production domain and any preview domain used for testing.
6. The server reads `FIREBASE_API_KEY` to validate ID tokens for protected billing routes. Use a separate Google API key restricted to the Firebase Identity Toolkit API; never use a service-account private key in frontend configuration.

Do not put Firebase service-account credentials or private keys in frontend variables or Git. Existing Supabase accounts are not copied automatically; users must create Firebase accounts unless a separate secure user migration is completed.

## Run locally

Requirements: Node.js compatible with the versions in `package.json` and npm.

```bash
npm install
cp .env.example .env
npm run dev
```

Open the local URL printed by Vite/the development server. Add only the credentials for integrations you actually intend to use; never commit your real `.env` file or API keys.

## Useful commands

```bash
npm run dev    # Start the development server
npm run build  # Build the production frontend
npm run preview # Preview the built frontend
npm run lint   # Type-check the TypeScript project
```

## Configuration

See [`.env.example`](./.env.example) for supported environment variables. Keep server-only credentials on the server. Do not put secret keys in frontend variables or browser code.

## Payment safety status\n\n- Kelviq checkout and portal sessions are created server-side, but webhook subscription lifecycle handling is still TODO and must be completed before production use.\n- PesaPal direct-payment simulation has been disabled because it previously returned fabricated success and settlement details.\n- PesaPal authentication no longer returns provider credentials to the browser, and failed checkout responses no longer generate fake checkout URLs.\n- Configure valid provider credentials and implement durable order storage plus server-side transaction-status verification before granting credits or creator payouts.\n\n## Before production

- Replace demo/mock content with a persistent, authenticated data layer.
- Verify authentication, authorization, upload limits, moderation, and rate limiting.
- Test payment webhooks and confirm payment status server-side before granting entitlements or issuing receipts.
- Review privacy, data retention, accessibility, and mobile layouts.
- Run the build and type-check commands, then exercise the main user flows on a real device.
- Configure production secrets in your hosting provider rather than in source control.

## Project structure

```text
src/
  components/   UI views, drawers, and modals
  data/         Demo content and seed data
  services/     Client-side feature services
  server/       Server integration helpers
  types/        Shared TypeScript types
  App.tsx       Application state and view routing
  index.css     Global styles and design foundations
server.ts       Express development/server entry point
```

## Contributing

Keep changes focused, use the existing component patterns, and run `npm run lint` and `npm run build` before opening a pull request. Prefer accessible labels, useful empty/error states, and small reusable components over one-off UI hacks.

---

Built for creators. Designed for the scroll.
