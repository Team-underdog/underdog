import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default function WorkingGeminiTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [apiResponse, setApiResponse] = useState<string>('');
  const [prompt, setPrompt] = useState('안녕하세요. 간단한 테스트입니다.');
  const [apiKey, setApiKey] = useState('AIzaSyDFKAfEDMhqiGcJuOz5jjuEAUGg3Yvn46k');

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [...prev, `${timestamp}: ${message}`]);
  };

  const testWithOfficialSDK = async () => {
    setIsLoading(true);
    setTestResults([]);
    setApiResponse('');
    
    addLog('🚀 Google 공식 SDK로 Gemini API 테스트 시작...');
    
    try {
      addLog('🔑 API 키 확인 중...');
      if (!apiKey || apiKey.length < 10) {
        addLog('❌ API 키가 유효하지 않음');
        return;
      }
      addLog('✅ API 키 확인 완료');
      
      addLog('🔧 GoogleGenerativeAI 초기화 중...');
      const genAI = new GoogleGenerativeAI(apiKey);
      addLog('✅ GoogleGenerativeAI 초기화 완료');
      
      addLog('🤖 Gemini 모델 로드 중...');
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
      addLog('✅ Gemini 모델 로드 완료');
      
      addLog(`📝 프롬프트 전송: "${prompt}"`);
      addLog('🌐 API 호출 중...');
      
      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      addLog('✅ API 호출 성공!');
      addLog(`📝 응답 길이: ${response.length}자`);
      
      setApiResponse(response);
      
    } catch (error) {
      addLog(`❌ SDK 테스트 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
      console.error('SDK 테스트 오류 상세:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testWithDirectFetch = async () => {
    setIsLoading(true);
    setTestResults([]);
    setApiResponse('');
    
    addLog('🔍 직접 fetch로 Gemini API 테스트...');
    
    try {
      addLog('🔑 API 키 확인 중...');
      if (!apiKey || apiKey.length < 10) {
        addLog('❌ API 키가 유효하지 않음');
        return;
      }
      addLog('✅ API 키 확인 완료');
      
      // 여러 엔드포인트 시도 (React Native 호환성 향상)
      const endpoints = [
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`
      ];
      
      const requestBody = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      };
      
      addLog(`📤 요청 본문: ${JSON.stringify(requestBody)}`);
      
      // 각 엔드포인트 시도
      for (const endpoint of endpoints) {
        try {
          addLog(`🌐 엔드포인트 시도: ${endpoint}`);
          
          addLog('🌐 fetch 요청 시작...');
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'User-Agent': 'Expo/ReactNative'
            },
            body: JSON.stringify(requestBody)
          });
          
          addLog(`📡 응답 상태: ${response.status}`);
          
          if (response.ok) {
            const data = await response.json();
            addLog('✅ 직접 fetch 성공!');
            addLog(`📊 응답 데이터 구조: ${Object.keys(data).join(', ')}`);
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
              const text = data.candidates[0].content.parts[0].text;
              addLog(`📝 추출된 텍스트: ${text.substring(0, 100)}...`);
              setApiResponse(text);
              return; // 성공 시 종료
            } else {
              addLog('⚠️ 응답 데이터 구조가 예상과 다름');
              addLog(`📊 전체 응답: ${JSON.stringify(data, null, 2)}`);
            }
          } else {
            const errorText = await response.text();
            addLog(`❌ 응답 오류: ${response.status} - ${errorText}`);
            
            // HTTP 상태 코드별 상세 정보
            if (response.status === 400) {
              addLog('❌ 400 Bad Request - 요청 형식 오류');
            } else if (response.status === 401) {
              addLog('❌ 401 Unauthorized - API 키 인증 실패');
            } else if (response.status === 403) {
              addLog('❌ 403 Forbidden - API 키 권한 부족');
            } else if (response.status === 429) {
              addLog('❌ 429 Too Many Requests - 요청 한도 초과');
            }
          }
        } catch (endpointError) {
          addLog(`⚠️ ${endpoint} 호출 실패: ${endpointError instanceof Error ? endpointError.message : '알 수 없는 오류'}`);
          
          // React Native에서의 구체적인 에러 정보
          if (endpointError instanceof TypeError) {
            if (endpointError.message.includes('Network request failed')) {
              addLog('🌐 네트워크 요청 실패 - React Native 환경');
              addLog('   - 인터넷 연결 확인');
              addLog('   - API 키 유효성 확인');
              addLog('   - 방화벽/프록시 설정 확인');
              addLog('   - React Native 네트워크 설정 확인');
            } else if (endpointError.message.includes('fetch')) {
              addLog('🌐 fetch API 오류 - React Native 환경');
            }
          }
        }
      }
      
      addLog('❌ 모든 엔드포인트 시도 실패');
      
    } catch (error) {
      addLog(`❌ 직접 fetch 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
      console.error('직접 fetch 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testNetworkConnection = async () => {
    setIsLoading(true);
    addLog('🌐 네트워크 연결 상태 테스트...');
    
    try {
      // 간단한 HTTP 요청으로 네트워크 연결 테스트
      addLog('🔍 HTTP 연결 테스트 중...');
      const testResponse = await fetch('https://httpbin.org/get', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (testResponse.ok) {
        addLog('✅ 기본 HTTP 연결 성공!');
        addLog('🌐 인터넷 연결 정상');
      } else {
        addLog(`⚠️ HTTP 연결 테스트 응답: ${testResponse.status}`);
      }
      
      // Google 서버 연결 테스트
      addLog('🔍 Google 서버 연결 테스트 중...');
      const googleResponse = await fetch('https://www.google.com', {
        method: 'GET'
      });
      
      if (googleResponse.ok) {
        addLog('✅ Google 서버 연결 성공!');
        addLog('🌐 Google 서비스 접근 가능');
      } else {
        addLog(`⚠️ Google 서버 연결 테스트 응답: ${googleResponse.status}`);
      }
      
    } catch (error) {
      addLog(`❌ 네트워크 연결 테스트 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
      addLog('🌐 네트워크 연결에 문제가 있을 수 있습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const clearLogs = () => {
    setTestResults([]);
    setApiResponse('');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.title}>🔗 실제 작동하는 Gemini API</Text>
        <Text style={styles.subtitle}>Google 공식 SDK와 직접 fetch 테스트</Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>API 키:</Text>
          <TextInput
            style={styles.apiKeyInput}
            value={apiKey}
            onChangeText={setApiKey}
            placeholder="Gemini API 키를 입력하세요"
            secureTextEntry={false}
          />
          
          <Text style={styles.inputLabel}>테스트 프롬프트:</Text>
          <TextInput
            style={styles.promptInput}
            value={prompt}
            onChangeText={setPrompt}
            placeholder="Gemini에게 보낼 메시지"
            multiline
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary, isLoading && styles.buttonDisabled]}
            onPress={testWithOfficialSDK}
            disabled={isLoading}
          >
            <Feather name="zap" size={20} color="white" />
            <Text style={styles.buttonText}>
              {isLoading ? '테스트 중...' : '공식 SDK 테스트'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary, isLoading && styles.buttonDisabled]}
            onPress={testWithDirectFetch}
            disabled={isLoading}
          >
            <Feather name="globe" size={20} color="white" />
            <Text style={styles.buttonText}>
              {isLoading ? '테스트 중...' : '직접 fetch 테스트'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonNetwork, isLoading && styles.buttonDisabled]}
            onPress={testNetworkConnection}
            disabled={isLoading}
          >
            <Feather name="wifi" size={20} color="white" />
            <Text style={styles.buttonText}>
              {isLoading ? '테스트 중...' : '네트워크 테스트'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonClear]}
            onPress={clearLogs}
          >
            <Feather name="trash-2" size={20} color="white" />
            <Text style={styles.buttonText}>로그 지우기</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.logSection}>
          <Text style={styles.sectionTitle}>📋 테스트 로그</Text>
          <ScrollView style={styles.logContainer}>
            {testResults.map((log, index) => (
              <Text key={index} style={styles.logEntry}>
                {log}
              </Text>
            ))}
          </ScrollView>
        </View>

        {apiResponse && (
          <View style={styles.responseSection}>
            <Text style={styles.sectionTitle}>📊 Gemini 응답</Text>
            <ScrollView style={styles.responseContainer}>
              <Text style={styles.responseText}>{apiResponse}</Text>
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  apiKeyInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 14,
  },
  promptInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    justifyContent: 'center',
    marginBottom: 10,
  },
  buttonPrimary: {
    backgroundColor: '#007AFF',
  },
  buttonSecondary: {
    backgroundColor: '#FF9500',
  },
  buttonNetwork: {
    backgroundColor: '#34C759',
  },
  buttonClear: {
    backgroundColor: '#FF3B30',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
  logSection: {
    flex: 1,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  logContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    maxHeight: 200,
  },
  logEntry: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  responseSection: {
    flex: 1,
  },
  responseContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    maxHeight: 200,
  },
  responseText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});
