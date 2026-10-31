# Firebase Authentication setup for Glitch

## 1. Create and configure Firebase

1. Open https://console.firebase.google.com/ and create a project.
2. Go to **Authentication → Sign-in method** and enable **Email/Password**.
3. Go to **Project settings → General → Your apps**.
4. Register a Web app (</>), then copy its Firebase config.
5. Under **Authentication → Settings → Authorized domains**, add `glitch-bice.vercel.app`, your production custom domain, and the Vercel preview hostname(s) used for testing.

## 2. Configure Vercel

In the Glitch Vercel project, open **Settings → Environment Variables**. Add these for both Production and Preview:

- `VITE_FIREBASE_API_KEY` — Firebase web API key
- `VITE_FIREBASE_AUTH_DOMAIN` — normally `PROJECT_ID.firebaseapp.com`
- `VITE_FIREBASE_PROJECT_ID` — Firebase project ID
- `VITE_FIREBASE_APP_ID` — Web app ID
- `VITE_FIREBASE_MESSAGING_SENDER_ID` — optional
- `VITE_FIREBASE_STORAGE_BUCKET` — optional

For server-side billing token validation, add `FIREBASE_API_KEY` as a separate Google API key restricted to the Firebase Identity Toolkit API. It is not a service-account key. Never add a service-account JSON or private key to any `VITE_*` variable.

Redeploy after adding the variables. Vite embeds `VITE_*` values at build time.

## 3. Password reset email handler

In **Authentication → Templates → Password reset**, configure the custom action URL to `https://glitch-bice.vercel.app/` (or your current Glitch production domain) so the app receives Firebase's `mode` and `oobCode` query parameters and can display its password-reset form.

## 4. Test

1. Open the deployed Glitch website.
2. Create an account with an email address and a password of at least 8 characters.
3. Sign out, then sign in again.
4. Test the password-reset email.
5. Confirm protected billing endpoints reject requests without a valid Firebase ID token.

## Account migration note

Supabase passwords cannot be copied into Firebase. Existing users must create Firebase accounts or complete a separately planned migration using a secure, supported identity migration process. Do not ask users to send passwords to support.
