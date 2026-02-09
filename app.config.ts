import type { ExpoConfig } from '@expo/config';

const defineConfig = (): ExpoConfig => ({
  name: 'GeoGossipMap',
  slug: 'geogossip-map',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  scheme: 'geogossipmap',
  splash: {
    resizeMode: 'contain',
    backgroundColor: '#020617',
  },
  expo: {
    android: {
      permissions: [
        "android.permission.DETECT_SCREEN_CAPTURE"
      ],
      package: "com.geogossip.app"
    }
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.geogossip.app',
    config: {
      googleMapsApiKey: process.env.IOS_MAPS_API_KEY || 'ADD_IOS_KEY',
    },
  },
  android: {
    package: 'com.geogossip.app',
    permissions: [
      'android.permission.INTERNET',
      'android.permission.DETECT_SCREEN_CAPTURE',
    ],
    config: {
      googleMaps: {
        apiKey: process.env.ANDROID_MAPS_API_KEY || 'ADD_ANDROID_KEY',
      },
    },
  },
  web: {
    bundler: 'metro',
  },
  extra: {
    expoPublicGoogleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  },
});

export default defineConfig;
