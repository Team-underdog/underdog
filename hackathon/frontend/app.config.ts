import type { ExpoConfig } from '@expo/config-types';

const config: ExpoConfig = {
  name: 'Underdog Hackathon',
  slug: 'underdog-hackathon',
  scheme: 'underdog',
  version: '1.0.0',
  orientation: 'portrait',
  platforms: ['ios', 'android'],
  assetBundlePatterns: ['**/*'],
  plugins: ['expo-secure-store'],
  extra: {
    apiBaseUrl: 'http://172.20.10.8:8000',
  },
};

export default config;
