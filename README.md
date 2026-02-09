# GeoGossip React Native Map

Expo-powered React Native app that runs on Android, iOS, and the web via React Native Web. The home screen shows a Google Map centered on Hyderabad plus an interactive gossip bottom sheet that expands to list mock messages.

## Prerequisites
- Node.js 18+ (with npm 10+)
- Expo CLI (`npm install -g expo-cli`) optional but recommended
- Google Maps JavaScript + native SDK API key(s)

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Provide API keys:
   - Create `.env` (or export vars) with:
     ```bash
     EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_web_key
     IOS_MAPS_API_KEY=your_ios_key
     ANDROID_MAPS_API_KEY=your_android_key
     ```
   - These feed `app.config.ts` and the `MapView` component.
3. Run in your target environment:
   ```bash
   npm run start        # interactive menu
   npm run web          # browser
   npm run ios          # iOS simulator (macOS only)
   npm run android      # Android emulator/device
   ```

## Notes
- `react-native-maps` powers the Google Map on all platforms; it needs a valid API key.
- On the web, the key must allow `http://localhost:8081` (Expo) or whichever origin you use.
- Native builds pull keys from `app.config.ts` so they can be configured per-platform.
