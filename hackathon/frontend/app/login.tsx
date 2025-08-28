import { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Alert, ActivityIndicator, Image, Pressable, Animated, TouchableOpacity } from 'react-native';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { signInWithEmail } from '../services/authService';
import { API_ENDPOINTS } from '../config/api';

import { Feather } from '@expo/vector-icons';
import { PixelLogo } from '../components/PixelLogo';
import { Input } from '../components/ui/Input';

const apiBaseUrl: string = API_ENDPOINTS.AUTH.LOGIN.replace('/api/auth/login', '');

function isValidEmail(value: string): boolean {
  const re = /[^\s@]+@[^\s@]+\.[^\s@]+/;
  return re.test(String(value).toLowerCase());
}

function mapSsafyError(errorText?: string): string {
  if (!errorText) return '일시적인 오류가 발생했어요. 잠시 후 다시 시도해주세요.';
  try {
    const obj = JSON.parse(errorText);
    const code = obj.responseCode as string | undefined;
    if (code === 'E4001') return '입력 형식을 확인해주세요.';
    if (code === 'E4002') return '이미 SSAFY API에 등록된 이메일입니다. (이미 가입된 이메일)';
    if (code === 'E4004') return 'SSAFY API 키가 올바르지 않습니다. 관리자에게 문의하세요.';
    if (code === 'Q1001') return 'SSAFY API 요청 형식이 올바르지 않습니다.';
    return obj.responseMessage || '일시적인 오류가 발생했어요. 잠시 후 다시 시도해주세요.';
  } catch (_) {
    if (errorText.includes('E4001')) return '입력 형식을 확인해주세요.';
    if (errorText.includes('E4002')) return '이미 SSAFY API에 등록된 이메일입니다. (이미 가입된 이메일)';
    if (errorText.includes('E4004')) return 'SSAFY API 키가 올바르지 않습니다. 관리자에게 문의하세요.';
    if (errorText.includes('Q1001')) return 'SSAFY API 요청 형식이 올바르지 않습니다.';
    return '일시적인 오류가 발생했어요. 잠시 후 다시 시도해주세요.';
  }
}

async function fetchWithTimeout(url: string, opts: RequestInit & { timeoutMs?: number }) {
  const { timeoutMs = 10000, ...rest } = opts;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...rest, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

export default function LoginScreen() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastTriedId, setLastTriedId] = useState<string | null>(null);

  const emailValid = useMemo(() => isValidEmail(userId), [userId]);
  const canSubmit = emailValid && password.length >= 1 && !loading;

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const onChangeEmail = useCallback((v: string) => {
    setUserId(v);
    if (!touched) setTouched(true);
    if (errorMsg) setErrorMsg(null);
  }, [touched, errorMsg]);

  const handleLogin = async () => {
    if (!userId || !password) {
      setErrorMsg('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setLastTriedId(userId);
    
    try {
      console.log('🏭 백엔드 API 로그인 시도:', userId);
      
      // 백엔드 API 로그인 시도
      const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userId,
          password: password,
        }),
      });

      if (response.ok) {
        const backendResult = await response.json();
        console.log('🏭 백엔드 API 로그인 성공:', backendResult);
        
        // 백엔드 로그인 성공 - JWT 토큰 사용
        await SecureStore.setItemAsync('authToken', backendResult.access_token);
        await SecureStore.setItemAsync('userInfo', JSON.stringify({
          id: backendResult.user.id,
          email: backendResult.user.email,
          display_name: backendResult.user.display_name,
          current_university: backendResult.user.current_university,
          current_department: backendResult.user.current_department,
          grade_level: backendResult.user.grade_level,
          auth_method: 'backend'
        }));
        
        // 로그인 성공 - 홈 화면으로 이동
        router.replace('/home');
      } else {
        const errorData = await response.json();
        console.error('❌ 백엔드 로그인 실패:', errorData);
        
        // SSAFY API 연동 관련 에러 메시지 처리
        let errorMessage = errorData.detail || '로그인에 실패했습니다.';
        
        if (errorData.responseCode) {
          errorMessage = mapSsafyError(JSON.stringify(errorData));
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        setErrorMsg(errorMessage);
      }
    } catch (error) {
      console.error('❌ 로그인 오류:', error);
      setErrorMsg('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = useCallback(() => {
    if (!emailValid) {
      setTouched(true);
      setErrorMsg('이메일 형식을 확인해주세요.');
      return;
    }
    if (!password) {
      setErrorMsg('비밀번호를 입력해주세요.');
      return;
    }
    handleLogin();
  }, [emailValid, password]);

  const onRetry = useCallback(() => {
    if (lastTriedId) handleLogin();
  }, [lastTriedId]);

  const onGoogle = () => Alert.alert('안내','Google 로그인은 데모에서 비활성화되었습니다.');
  const onApple = () => Alert.alert('안내','Apple 로그인은 데모에서 비활성화되었습니다.');

    return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <PixelLogo />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>환영합니다!</Text>
        <Text style={styles.sub}>계정에 로그인하여 캠퍼스 크로니클을 시작하세요</Text>

        <Animated.View style={[styles.card, { opacity: fadeAnim }]}> 
        <View style={styles.cardContent}>
        <Pressable
          style={({ pressed }) => [
            styles.btnNeutral,
            pressed ? { transform: [{ scale: 0.98 }], opacity: 0.9 } : null,
          ]}
          onPress={onGoogle}
        >
          <View style={styles.rowCenter}>
            <Image source={require('../assets/images/icons8-구글-로고-48.png')} style={styles.socialLogo} />
            <Text style={styles.btnNeutralText}>Google로 계속하기</Text>
          </View>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.btnNeutral,
            pressed ? { transform: [{ scale: 0.98 }], opacity: 0.9 } : null,
          ]}
          onPress={onApple}
        >
          <View style={styles.rowCenter}>
            <Image source={require('../assets/images/icons8-맥-os-30.png')} style={styles.socialLogo} />
            <Text style={styles.btnNeutralText}>Apple로 계속하기</Text>
          </View>
        </Pressable>

        <View style={styles.dividerWrap}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>또는</Text>
          <View style={styles.divider} />
        </View>

        <Input
          label="이메일"
          placeholder="name@example.com"
          value={userId}
          onChangeText={onChangeEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          leftIcon={<Feather name="mail" size={18} color="#6b7280" />}
          error={touched && !emailValid ? '이메일 형식을 확인해주세요.' : undefined}
          editable={!loading}
          onBlur={() => setTouched(true)}
        />

        <Input
          label="비밀번호"
          placeholder="비밀번호를 입력하세요"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPw}
          autoCapitalize="none"
          leftIcon={<Feather name="lock" size={18} color="#6b7280" />}
          rightIcon={
            <TouchableOpacity onPress={() => setShowPw(p => !p)} disabled={loading}>
              <Feather name={showPw ? 'eye-off' : 'eye'} size={18} color="#6b7280" />
            </TouchableOpacity>
          }
          editable={!loading}
        />

        {errorMsg && (
          <View style={{ marginTop: 8 }}>
            <Text style={styles.helpError}>{errorMsg}</Text>
            {errorMsg.includes('네트워크') && (
              <TouchableOpacity onPress={onRetry} disabled={loading}>
                <Text style={[styles.smallLinkText, { textAlign: 'right', marginTop: 4 }]}>재시도</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={{ alignItems: 'flex-end', marginTop: 8 }}>
          <TouchableOpacity onPress={() => Alert.alert('도움말','비밀번호 재설정은 문의를 통해 진행됩니다.')}> 
            <Text style={styles.smallLinkText}>비밀번호를 잊으셨나요?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.btnPrimary, !canSubmit && styles.btnPrimaryDisabled]} disabled={!canSubmit} onPress={onSubmit}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>로그인</Text>}
        </TouchableOpacity>
        </View>
      </Animated.View>

      <View style={styles.footerContainer}>
        <Text style={{ color: '#6b7280' }}>
          계정이 없으신가요?{' '}
          <Text 
            style={styles.linkBold} 
            onPress={() => router.push('/signup')}
          >
            회원가입
          </Text>
        </Text>
      </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { 
    alignItems: 'center', 
    paddingVertical: 16, 
    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
    borderBottomWidth: 1, 
    borderBottomColor: '#e5e7eb' 
  },
  content: { 
    flex: 1, 
    paddingHorizontal: 28, 
    paddingTop: 20 
  },
  socialLogo: { width: 18, height: 18, marginRight: 8 },
  title: { color: '#0f1220', fontSize: 24, marginTop: 16, fontWeight: '800', textAlign: 'center' },
  sub: { color: '#6b7280', fontSize: 14, marginTop: 8, marginBottom: 24, textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#e6eaf2', marginBottom: 16 },
  cardContent: { padding: 16 },
  rowCenter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  help: { color: '#9aa4b2', fontSize: 12, marginTop: 12, textAlign: 'center' },
  helpError: { color: '#d93025', fontSize: 12, marginTop: 8, textAlign: 'right' },
  btnNeutral: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#dfe3ea', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 8 },
  btnNeutralText: { color: '#111', fontWeight: '700' },
  dividerWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 12 },
  divider: { flex: 1, height: 1, backgroundColor: '#e6eaf2' },
  dividerText: { color: '#9aa4b2', fontSize: 12 },
  smallLinkText: { color: '#2b6ef2', fontSize: 12, textDecorationLine: 'underline' },
  btnPrimary: { marginTop: 16, backgroundColor: '#0b0c1a', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  btnPrimaryDisabled: { backgroundColor: '#9aa4b2' },
  btnPrimaryText: { color: '#fff', fontWeight: '800' },
  linkBold: { color: '#111', fontWeight: '700', textDecorationLine: 'underline' },
  footerContainer: { alignItems: 'center', marginTop: 16 },
});