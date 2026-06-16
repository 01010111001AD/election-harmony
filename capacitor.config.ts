import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.21e969711dcf472893b0e81f9590ec7e',
  appName: 'ElectaCore',
  webDir: 'dist',
  server: {
    // Hot-reload from the Lovable sandbox preview. Remove this block to ship
    // a fully offline build of the bundled `dist/` web assets.
    url: 'https://21e96971-1dcf-4728-93b0-e81f9590ec7e.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  ios: {
    contentInset: 'always',
  },
};

export default config;
