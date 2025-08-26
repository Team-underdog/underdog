import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack initialRouteName="login" screenOptions={{ headerShown: true }}>
      <Stack.Screen name="login" options={{ title: 'Login' }} />
    </Stack>
  );
}
