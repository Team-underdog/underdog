import type { ExpoConfig } from '@expo/config-types';

const config: ExpoConfig = {
  name: 'Campus Chronicle',
  slug: 'underdog-hackathon',
  scheme: 'underdog',
  version: '1.0.0',
  orientation: 'portrait',
  platforms: ['ios', 'android'],
  assetBundlePatterns: ['**/*'],
  plugins: [
    'expo-secure-store',
    'expo-dev-client',
    'expo-router'
  ],
  splash: {
    backgroundColor: '#FF6B6B',
    resizeMode: 'contain',
  },
  ios: {
    bundleIdentifier: 'com.underdog.campuschronicle',
  },
  android: {
    package: 'com.underdog.campuschronicle',
  },
  extra: {
    apiBaseUrl: 'http://localhost:8000',
    eas: {
      projectId: '99114cb0-5ad7-4e2f-99a0-c8ba236a69df',
    },
  },
  // Dev Client 설정
  developmentClient: {
    silentLaunch: true,
  },
  // Expo Router 설정
  experiments: {
    typedRoutes: true,
  },
};

export default config;
