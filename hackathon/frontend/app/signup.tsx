import React from 'react';
import { SafeAreaView, View, StyleSheet } from 'react-native';
import { SignupForm } from '../components/SignupForm';
import { PixelLogo } from '../components/PixelLogo';
import { router } from 'expo-router';

export default function SignupScreen() {
  const handleSwitchToLogin = () => {
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <PixelLogo />
      </View>
      
      <View style={styles.content}>
        <SignupForm onSwitchToLogin={handleSwitchToLogin} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 20,
  },
});