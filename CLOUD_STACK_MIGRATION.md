# Glitch infrastructure migration

Target architecture:

- **Frontend:** React + Vite on Cloudflare Pages.
- **Backend and database:** Convex.
- **Authentication:** Better Auth using the official Convex component.
- **Media storage:** Cloudflare R2, with short-lived signed upload URLs issued by authenticated Convex actions.
- **Product analytics:** PostHog.

## Current migration status

This branch introduces the initial infrastructure foundation. It does not yet cut production traffic over.

- [x] Add Convex + Better Auth component configuration.
- [x] Add the Better Auth HTTP routes and React client.
- [x] Add the first application data schema for profiles, posts, follows, reactions, comments, stories, messages, notifications and live rooms.
- [x] Add an authenticated R2 upload URL action with MIME type and size validation.
- [x] Add PostHog analytics helpers with autocapture disabled.
- [x] Add Cloudflare Pages build configuration and SPA fallback.
- [ ] Generate Convex files and validate the Better Auth component against a real dev deployment.
- [ ] Wire the React root and existing sign-in UI to Convex + Better Auth.
- [ ] Migrate application data access from mock/local state to Convex queries and mutations.
- [ ] Move Gemini, billing, payment callbacks and any remaining Express endpoints to suitable managed endpoints before disabling Express.
- [ ] Configure R2 CORS, custom media domain, lifecycle rules and private-media access.
- [ ] Configure PostHog project key, host, consent/privacy rules and production events.
- [ ] Configure Cloudflare Pages production and preview environments.
- [ ] Test sign-up, sign-in, sign-out, session expiry, uploads, feeds, stories, DMs and mobile layouts end-to-end.
- [ ] Cut over production only after parity checks and data migration.

## Environment variables

### Cloudflare Pages

- `VITE_CONVEX_URL`
- `VITE_CONVEX_SITE_URL`
- `VITE_POSTHOG_KEY`
- `VITE_POSTHOG_HOST` (optional; defaults to PostHog US)

Only public client values belong in `VITE_*` variables. Never put secrets in Cloudflare Pages browser-exposed variables.

### Convex deployment

- `SITE_URL` — exact frontend origin for the environment.
- `BETTER_AUTH_SECRET` — unique, high-entropy secret (32+ characters).
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET`
- `R2_PUBLIC_BASE_URL`

Use separate development and production values. Do not commit credentials.

## Local setup

1. Install dependencies with `npm install`.
2. Run `npx convex dev` and follow the prompts to link/create the Convex project.
3. Set the Convex environment variables listed above with `npx convex env set NAME VALUE`.
4. Put the generated Convex deployment URL and site URL in local `.env.local` as `VITE_CONVEX_URL` and `VITE_CONVEX_SITE_URL`.
5. Generate the Better Auth component schema using the official Convex + Better Auth React guide, then run `npx convex dev` again.
6. Configure the R2 bucket CORS policy to allow PUT from the local frontend and the production Pages domain, including the `Content-Type` request header.
7. Run `npm run lint` and `npm run build`.

## Upload security

The browser receives only a five-minute, single-object signed PUT URL. The Convex action requires an authenticated identity, enforces a media MIME allowlist and size limits, and scopes object keys to the authenticated user. For private media, do not expose a public bucket URL: replace public URL generation with authenticated short-lived download URLs and authorization checks.

## Deployment

Cloudflare Pages builds the Vite frontend with `npm run build` and publishes `dist`. The existing Express server is intentionally retained during migration because billing, Gemini and payment callback routes still depend on it. Do not switch off the current backend or claim the Pages deployment is production-ready until those routes have been migrated and verified.
