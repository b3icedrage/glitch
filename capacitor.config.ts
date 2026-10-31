import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.glitch.creator',
  appName: 'Glitch',
  webDir: 'dist',
  server: {
    // Keep the existing hosted app and backend as the source of truth.
    // The APK is a native Android shell around the deployed Glitch experience.
    url: 'https://glitch-bice.vercel.app',
    cleartext: false,
    allowNavigation: ['glitch-bice.vercel.app'],
  },
  android: {
    backgroundColor: '#070b10',
    allowMixedContent: false,
  },
};

export default config;
