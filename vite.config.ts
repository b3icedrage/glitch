import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

// Firebase Web App config is public client configuration, not a server secret.
// Environment values override these defaults when a CI/build environment provides them.
const firebaseBuildConfig = {
  VITE_FIREBASE_API_KEY: process.env.VITE_FIREBASE_API_KEY || 'AIzaSyA7zgBy1olktrDGfQcgaNu7jJiHM4sA8Qk',
  VITE_FIREBASE_AUTH_DOMAIN: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'glitch-platform-938b5.firebaseapp.com',
  VITE_FIREBASE_PROJECT_ID: process.env.VITE_FIREBASE_PROJECT_ID || 'glitch-platform-938b5',
  VITE_FIREBASE_APP_ID: process.env.VITE_FIREBASE_APP_ID || '1:800113367718:web:157f1fa570f80ee7737267',
};

export default defineConfig(() => {
  return {
    base: process.env.GITHUB_PAGES === 'true' ? '/glitch/' : '/',
    plugins: [react(), tailwindcss()],
    define: Object.fromEntries(
      Object.entries(firebaseBuildConfig).map(([key, value]) => [`import.meta.env.${key}`, JSON.stringify(value)]),
    ),
    resolve: {
      alias: {
        '@': path.resolve(rootDir, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
