# GLITCH

**Glitch is an Android-first creator community app** for short videos, live moments, stories, long-form video, and direct messages.

The repository contains the React + TypeScript application and its Android packaging configuration. The Android app is built with Capacitor and runs the Glitch interface inside a native Android WebView, with Android status-bar, splash-screen, keyboard, safe-area, and touch behavior configured for phones.

## Android APK

Every push to `main` and every manual run triggers **Build Glitch Android APK** in GitHub Actions.

1. Open the repository's **Actions** tab.
2. Select **Build Glitch Android APK**.
3. Open the successful workflow run.
4. Under **Artifacts**, download `glitch-android-debug-apk`.
5. Extract the ZIP and install `app-debug.apk` on an Android device.

This workflow currently produces a **debug APK** for testing and sideloading. A signed release APK/AAB requires a private Android signing key and passwords stored as GitHub Actions secrets; never commit those secrets.

## Build locally

Requirements: Node.js 22, Java 21, Android SDK, and Android platform build tools.

```bash
npm install
npm run android:build
```

To open the generated Android project in Android Studio:

```bash
npm run android:open
```

## App identity and Android settings

- Application ID: `com.glitch.creator`
- Display name: `Glitch`
- Web assets: `dist/`
- Android wrapper: Capacitor
- Theme: dark forest green with soft peach accents
- Android status bar and splash screen use the Glitch dark theme
- Keyboard resizes the native viewport for messaging and forms

## Product features

- Sparks vertical short-video feed
- Following feed and stories
- Explore and creator discovery
- Live-room interface
- Cinema long-form video browsing
- Direct messages
- Creator uploads, comments, notifications, and profiles
- Firebase email/password authentication
- Server-side billing and optional AI integrations

## Backend and production notes

The APK is a client. It does **not** embed the Express server, API credentials, Firebase service-account keys, payment secrets, or other server-only configuration. Those remain on the hosted backend.

Firebase client authentication is used from the Android WebView. Any API/proxy CORS allowlist must explicitly permit the Capacitor Android origin (`https://localhost` / `capacitor://localhost`) before those API calls can work in the APK. Payment checkout and account portal flows must be tested in the Android app and opened in a supported external browser when required.

The prototype still uses local device storage and mock/demo content for parts of the social experience. A native APK package does not by itself make posts, messages, uploads, or follows synchronize across users. A persistent authenticated database, media storage, moderation, and server-side authorization are still required before public launch.

## Web preview

The GitHub Pages deployment remains available as a browser preview. It is not the Android APK and does not replace the Android build workflow.
