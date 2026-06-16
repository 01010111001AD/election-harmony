# Run ElectaCore as a native mobile app

This project is now wrapped with [Capacitor](https://capacitorjs.com), so the same web app can be built and installed as a real iOS / Android application.

The Lovable sandbox can't run Xcode or the Android SDK, so the native build steps happen on **your own computer** after you export the project to GitHub.

## One-time setup (on your machine)

1. In Lovable click **GitHub → Export to GitHub** and clone the repo locally.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Add the native platforms you want:
   ```bash
   npx cap add ios       # macOS + Xcode required
   npx cap add android   # Android Studio required
   ```
4. Build the web bundle and copy it into the native projects:
   ```bash
   npm run build
   npx cap sync
   ```

## Run on a device or simulator

- **iOS**: `npx cap run ios` (or `npx cap open ios` to open Xcode)
- **Android**: `npx cap run android` (or `npx cap open android` to open Android Studio)

## Hot reload from the Lovable preview

`capacitor.config.ts` points `server.url` at the Lovable sandbox preview, so the app on your phone reloads automatically every time you edit in Lovable — no rebuild needed.

When you are ready to ship a real release to the App Store / Play Store, **delete the entire `server` block** in `capacitor.config.ts`, then re-run:

```bash
npm run build && npx cap sync
```

The app will then run the bundled `dist/` assets fully offline.

## After every `git pull`

```bash
npm install
npm run build
npx cap sync
```

That's it — `npx cap sync` re-copies the latest web build into iOS and Android.
