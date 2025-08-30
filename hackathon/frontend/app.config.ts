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
    // iOS 네트워크 보안 설정 강화
    infoPlist: {
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: true,
        NSAllowsArbitraryLoadsInWebContent: true,
        NSExceptionDomains: {
          'generativelanguage.googleapis.com': {
            NSExceptionAllowsInsecureHTTPLoads: false,
            NSExceptionMinimumTLSVersion: '1.2',
            NSExceptionRequiresForwardSecrecy: true,
            NSIncludesSubdomains: true,
            NSExceptionAllowsArbitraryLoads: true
          },
          'googleapis.com': {
            NSExceptionAllowsInsecureHTTPLoads: false,
            NSExceptionMinimumTLSVersion: '1.2',
            NSExceptionRequiresForwardSecrecy: true,
            NSIncludesSubdomains: true,
            NSExceptionAllowsArbitraryLoads: true
          }
        }
      }
    }
  },
  android: {
    package: 'com.underdog.campuschronicle',
    // Android 네트워크 보안 설정 강화
    permissions: [
      'INTERNET',
      'ACCESS_NETWORK_STATE',
      'ACCESS_WIFI_STATE'
    ],
    // Android 네트워크 보안 설정
    networkSecurityConfig: {
      domainConfig: {
        'generativelanguage.googleapis.com': {
          cleartextTrafficPermitted: false,
          networkSecurityConfig: {
            domainConfig: {
              'generativelanguage.googleapis.com': {
                cleartextTrafficPermitted: false
              }
            }
          }
        },
        'googleapis.com': {
          cleartextTrafficPermitted: false,
          networkSecurityConfig: {
            domainConfig: {
              'googleapis.com': {
                cleartextTrafficPermitted: false
              }
            }
          }
        }
      }
    }
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
  // 네트워크 보안 설정
  web: {
    bundler: 'metro'
  }
};

export default config;
