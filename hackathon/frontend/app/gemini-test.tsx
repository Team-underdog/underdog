import React from 'react';
import { SafeAreaView } from 'react-native';
import GeminiConnectionTest from '../components/GeminiConnectionTest';

export default function GeminiTestPage() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <GeminiConnectionTest />
    </SafeAreaView>
  );
}
