import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack initialRouteName="login" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="profile-edit" options={{ headerShown: false }} />
      <Stack.Screen name="test" options={{ headerShown: false }} />
      <Stack.Screen name="test-home" options={{ headerShown: false }} />
      <Stack.Screen name="test-dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="chronicle" options={{ headerShown: false }} />
      <Stack.Screen name="quest" options={{ headerShown: false }} />
      <Stack.Screen name="campus-credo" options={{ headerShown: false }} />
      <Stack.Screen name="my-campus-credo" options={{ headerShown: false }} />
      <Stack.Screen name="home-campus-credo" options={{ headerShown: false }} />
      <Stack.Screen name="skill-tree" options={{ headerShown: false }} />
      <Stack.Screen name="gemini-test" options={{ headerShown: false }} />

    </Stack>
  );
}
