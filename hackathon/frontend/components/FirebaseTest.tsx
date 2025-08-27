import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { testAPIConnection, monitorAPIConnection } from '../config/api';
import { signInWithEmail, signUpWithEmail } from '../services/authService';

const APITest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<string>('확인 중...');
  const [testEmail] = useState('test@example.com');
  const [testPassword] = useState('testpassword123');

  useEffect(() => {
    // 백엔드 API 연결 모니터링 시작
    const connectionMonitor = monitorAPIConnection();
    
    // 컴포넌트 언마운트 시 정리
    return () => {
      if (connectionMonitor.cleanup) {
        connectionMonitor.cleanup();
      }
    };
  }, []);

  const testConnection = async () => {
    try {
      setConnectionStatus('연결 테스트 중...');
      const isConnected = await testAPIConnection();
      
      if (isConnected) {
        setConnectionStatus('✅ 백엔드 API 연결 성공!');
        Alert.alert('성공', '백엔드 API에 정상적으로 연결되었습니다!');
      } else {
        setConnectionStatus('❌ 백엔드 API 연결 실패');
        Alert.alert('실패', '백엔드 API 연결에 실패했습니다. 서버가 실행 중인지 확인해주세요.');
      }
    } catch (error) {
      setConnectionStatus('❌ 연결 오류 발생');
      Alert.alert('오류', `연결 테스트 중 오류가 발생했습니다: ${error}`);
    }
  };

  const testSignUp = async () => {
    try {
      setConnectionStatus('회원가입 테스트 중...');
      const user = await signUpWithEmail(testEmail, testPassword, '테스트 사용자');
      setConnectionStatus(`✅ 회원가입 성공: ${user.id}`);
      Alert.alert('성공', `회원가입이 완료되었습니다!\nID: ${user.id}`);
    } catch (error: any) {
      setConnectionStatus('❌ 회원가입 실패');
      Alert.alert('실패', error.message || '회원가입 실패');
    }
  };

  const testSignIn = async () => {
    try {
      setConnectionStatus('로그인 테스트 중...');
      const user = await signInWithEmail(testEmail, testPassword);
      setConnectionStatus(`✅ 로그인 성공: ${user.id}`);
      Alert.alert('성공', `로그인이 완료되었습니다!\nID: ${user.id}`);
    } catch (error: any) {
      setConnectionStatus('❌ 로그인 실패');
      Alert.alert('실패', error.message || '로그인 실패');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>백엔드 API 연결 테스트</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>연결 상태:</Text>
        <Text style={styles.statusText}>{connectionStatus}</Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={testConnection}>
          <Text style={styles.buttonText}>연결 테스트</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.signUpButton]} onPress={testSignUp}>
          <Text style={styles.buttonText}>회원가입 테스트</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.signInButton]} onPress={testSignIn}>
          <Text style={styles.buttonText}>로그인 테스트</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>테스트 계정:</Text>
        <Text style={styles.infoText}>이메일: {testEmail}</Text>
        <Text style={styles.infoText}>비밀번호: {testPassword}</Text>
      </View>
      
      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>🌐 백엔드 API 연결 팁:</Text>
        <Text style={styles.tipsText}>• 백엔드 서버가 실행 중인지 확인</Text>
        <Text style={styles.tipsText}>• http://localhost:8000 접속 가능한지 확인</Text>
        <Text style={styles.tipsText}>• 방화벽 설정 확인</Text>
        <Text style={styles.tipsText}>• 네트워크 연결 상태 확인</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#1e3a8a',
  },
  statusContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#374151',
  },
  statusText: {
    fontSize: 16,
    color: '#6b7280',
  },
  buttonContainer: {
    gap: 15,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#1e3a8a',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  signUpButton: {
    backgroundColor: '#10b981',
  },
  signInButton: {
    backgroundColor: '#f59e0b',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  tipsContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1e3a8a',
  },
  tipsText: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 5,
  },
});

export default APITest;
