# Glitch Android APK

Glitch is packaged for Android with Capacitor. The Android app uses the existing production Glitch website as its web runtime:

- App ID: `com.glitch.creator`
- Display name: `Glitch`
- Production web app: `https://glitch-bice.vercel.app`
- Android build output: `android/app/build/outputs/apk/debug/app-debug.apk`

## Build an APK in GitHub Actions

1. Open the repository's **Actions** tab.
2. Select **Build Glitch Android APK**.
3. Select **Run workflow** and choose the `android/apk-wrapper` branch.
4. Wait for the workflow to complete successfully.
5. Open the completed run and download the **Glitch-Android-APK** artifact.
6. Extract the ZIP and install `app-debug.apk` on your Android device. Allow installation from the browser or file manager if Android asks.

The workflow builds a debug APK. It is suitable for installation and testing; a Play Store release needs a separately signed release build and store listing.

## Local Android build

Requirements: Node.js 22+, Java 21, Android Studio and Android SDK.

```bash
npm install
npm run build
npx cap add android
npx cap sync android
cd android
./gradlew assembleDebug
```

## Important runtime behavior

This first APK is an online native shell around the deployed Glitch app. It loads the production website so existing server-side routes and hosted services continue to work. An internet connection is required, and the app will show the deployed site's current version rather than bundling an offline copy. Changes must be deployed to the website before they appear in the APK.

The APK does not independently repair unfinished backend or demo functionality. Keep credentials and API secrets on the server; do not put them in the Android package.
