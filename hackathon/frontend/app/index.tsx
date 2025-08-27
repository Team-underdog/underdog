import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    checkAuthToken();
  }, []);

  const checkAuthToken = async () => {
    try {
      console.log('🔍 토큰 확인 시작...');
      const token = await SecureStore.getItemAsync('authToken');
      console.log('🔑 토큰 존재 여부:', !!token);
      setHasToken(!!token);
    } catch (error) {
      console.error('❌ 토큰 확인 실패:', error);
      setHasToken(false);
    } finally {
      setIsLoading(false);
      console.log('✅ 토큰 확인 완료');
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#0b0c1a" />
      </View>
    );
  }

  console.log('🚀 리다이렉션 시도:', hasToken ? '/home' : '/login');
  return <Redirect href={hasToken ? "/home" : "/login"} />;
}
