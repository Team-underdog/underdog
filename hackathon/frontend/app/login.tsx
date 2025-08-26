import { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const apiBaseUrl: string = (Constants.expoConfig?.extra as any)?.apiBaseUrl || 'http://localhost:8000';

export default function LoginScreen() {
  const [userId, setUserId] = useState('ssafy-user');

  const onLogin = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      const token = data?.access_token || 'demo-token';
      await SecureStore.setItemAsync('authToken', token);
      Alert.alert('로그인 성공', '토큰 저장 완료');
    } catch (e) {
      Alert.alert('로그인 실패', '오프라인 데모 토큰 사용');
      await SecureStore.setItemAsync('authToken', 'demo-token');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>로그인</Text>
      <TextInput value={userId} onChangeText={setUserId} placeholder="아이디" style={styles.input} />
      <TouchableOpacity style={styles.btn} onPress={onLogin}>
        <Text style={styles.btnText}>로그인</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  input: { width: '80%', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12 },
  btn: { backgroundColor: '#2b6ef2', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  btnText: { color: '#fff', fontWeight: '700' },
});
