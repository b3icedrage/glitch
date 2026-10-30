# Supabase Auth setup for Glitch

This branch adds email/password authentication with Supabase Auth. It does not require a Supabase service-role key.

## 1. Create the Supabase project

1. Create a project at https://supabase.com/dashboard.
2. Open **Project Settings → API** (or the API Keys page).
3. Copy the project URL and the publishable/anon public key.
4. In **Authentication → Providers**, enable Email.
5. Configure the email-confirmation behavior you want. If confirmation is enabled, users must confirm their email before they can sign in.

## 2. Configure Vercel project `glitch`

Add these variables to the Vercel project named `glitch` only:

| Variable | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase publishable/anon key |
| `SUPABASE_URL` | Same Supabase project URL |
| `SUPABASE_ANON_KEY` | Same publishable/anon key |

Set them for Preview first so the feature branch can be tested. Add them to Production only when you are ready to release. The anon/publishable key is intended for public clients; never use a service-role/secret key in a `VITE_` variable or in browser code.

## 3. Authentication URLs

In **Authentication → URL Configuration**, set the Site URL to the production Glitch URL and add the current Vercel preview URL to the Redirect URLs allow-list while testing. The password-reset flow redirects back to the site origin.

## 4. What this branch changes

- Email/password sign-up and sign-in screen.
- Password-reset email request.
- Persistent browser session with refresh-token renewal.
- Sign-out control in the desktop header.
- Express verifies Supabase access tokens against Supabase Auth before serving Kelviq checkout, portal, entitlements, and usage routes.
- Kelviq customer IDs are derived from the verified Supabase user ID, not browser cookies or a shared demo identity.

## 5. Current limitations

- Google OAuth is not wired yet. This first pass is email/password.
- Social content and profiles are still prototype/local-storage data; authentication does not yet migrate them into a database.
- Kelviq webhook lifecycle processing and durable event idempotency remain separate work.
- This branch must be tested in its Vercel Preview environment before any production release.
