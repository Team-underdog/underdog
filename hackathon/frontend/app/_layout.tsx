import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { getCurrentUser } from '../services/authService';

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('login');

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        console.log('✅ 자동 로그인 성공:', user.email);
        setInitialRoute('home');
      } else {
        console.log('ℹ️ 로그인 필요');
        setInitialRoute('login');
      }
    } catch (error) {
      console.error('❌ 인증 상태 확인 실패:', error);
      setInitialRoute('login');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null; // 로딩 중에는 아무것도 표시하지 않음
  }

  return (
    <Stack initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="profile-edit" options={{ headerShown: false }} />
      <Stack.Screen name="chronicle" options={{ headerShown: false }} />
      <Stack.Screen name="quest" options={{ headerShown: false }} />
      <Stack.Screen name="campus-credo" options={{ headerShown: false }} />
      <Stack.Screen name="my-campus-credo" options={{ headerShown: false }} />
      <Stack.Screen name="home-campus-credo" options={{ headerShown: false }} />
      <Stack.Screen name="skill-tree" options={{ headerShown: false }} />
    </Stack>
  );
}
