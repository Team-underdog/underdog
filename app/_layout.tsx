import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

/**
 * 백엔드 개발자가 채워야 할 인증 서비스 클래스입니다.
 */
class AuthService {
  static login(id, password) {
    // TODO: 백엔드 친구가 여기에 로그인 API 연동 로직을 구현합니다.
    console.log(`로그인 시도: ID=${id}`);
    Alert.alert('로그인 버튼 클릭', '백엔드 기능이 연동될 부분입니다.');
  }

  static signUp(id, password) {
    console.log(`회원가입 시도: ID=${id}`);
    // TODO: 백엔드 친구가 여기에 회원가입 API 연동 로직을 구현합니다.
    Alert.alert('회원가입 버튼 클릭', '백엔드 기능이 연동될 부분입니다.');
  }
}

export default function App() {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!id || !password) {
      Alert.alert('오류', '아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }
    AuthService.login(id, password);
  };

  // 회원가입 텍스트를 눌렀을 때 실행될 함수
  const handleSignUpPress = () => {
    // 실제 앱에서는 아이디, 비밀번호를 입력받는 별도의 회원가입 화면으로
    // 이동하는 로직을 여기에 추가할 수 있습니다.
    // 지금은 AuthService의 signUp 함수를 바로 호출합니다.
    AuthService.signUp(id, password);
  };

  return (
    <LinearGradient
      colors={['#D4ACED', '#F1948A']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}
      >
        <StatusBar barStyle="light-content" />

        {/* 앱 로고/제목 */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>Campus Chronicle</Text>
          <Text style={styles.slogan}>퀘스트 꿰고, 레벨업하는 캠퍼스 생활!</Text>
        </View>

        {/* 입력창 */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="아이디"
            placeholderTextColor="#eee"
            value={id}
            onChangeText={setId}
          />
          <TextInput
            style={styles.input}
            placeholder="비밀번호"
            placeholderTextColor="#eee"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
          />
        </View>

        {/* 로그인 버튼 (단색으로 수정) */}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.buttonText}>로그인</Text>
        </TouchableOpacity>

        {/* 회원가입 안내 문구 */}
        <TouchableOpacity
          style={styles.signUpContainer}
          onPress={handleSignUpPress}
        >
          <Text style={styles.signUpText}>아직 계정이 없으신가요? </Text>
          <Text style={[styles.signUpText, styles.signUpButtonText]}>회원가입</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  logo: {
    fontSize: 42,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 2, height: 3 },
    textShadowRadius: 6,
    marginBottom: 10,
  },
  slogan: {
    fontSize: 16,
    color: '#f5f5f5',
    fontStyle: 'italic',
    textAlign: 'center',
    opacity: 0.9,
  },
  inputContainer: {
    width: '90%',
    marginBottom: 25,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    fontSize: 16,
    color: 'white',
    marginBottom: 15,
  },
  loginButton: {
    width: '90%',
    backgroundColor: '#4AAFF7', // 그라데이션 제거 후 단색으로 변경
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 30,
    marginTop: 10,
    elevation: 5,
    // iOS용 그림자 효과
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  signUpContainer: {
    marginTop: 20,
    flexDirection: 'row', // 텍스트를 가로로 배열
  },
  signUpText: {
    fontSize: 14,
    color: 'white',
    opacity: 0.8,
  },
  signUpButtonText: {
    fontWeight: 'bold', // '회원가입' 글자만 굵게
    opacity: 1,
  },
});
