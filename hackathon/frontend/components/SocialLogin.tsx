import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Button } from './ui/Button';

interface SocialLoginProps {
  onGoogleLogin?: () => void;
  onAppleLogin?: () => void;
}

export function SocialLogin({ onGoogleLogin, onAppleLogin }: SocialLoginProps) {
  return (
    <View style={styles.container}>
      <Button
        variant="outline"
        style={styles.socialButton}
        onPress={onGoogleLogin}
      >
        <View style={styles.buttonContent}>
          <Image 
            source={require('../assets/images/icons8-구글-로고-48.png')} 
            style={styles.socialIcon} 
          />
          <Text style={styles.buttonText}>Google로 계속하기</Text>
        </View>
      </Button>
      
      <Button
        variant="outline"
        style={styles.socialButton}
        onPress={onAppleLogin}
      >
        <View style={styles.buttonContent}>
          <Image 
            source={require('../assets/images/icons8-맥-os-30.png')} 
            style={styles.socialIcon} 
          />
          <Text style={styles.buttonText}>Apple로 계속하기</Text>
        </View>
      </Button>
      
      {/* 구분선 */}
      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>또는</Text>
        <View style={styles.dividerLine} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  socialButton: {
    marginBottom: 12,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#d1d5db',
  },
  dividerText: {
    fontSize: 12,
    color: '#6b7280',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    textTransform: 'uppercase',
  },
});
