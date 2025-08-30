import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import GeminiService from '../services/geminiService';

export default function RealGeminiTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [apiResponse, setApiResponse] = useState<any>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [...prev, `${timestamp}: ${message}`]);
  };

  const testRealGeminiAPI = async () => {
    setIsLoading(true);
    setTestResults([]);
    setApiResponse(null);
    
    addLog('🚀 실제 Gemini API 연결 테스트 시작...');
    
    try {
      const geminiService = GeminiService.getInstance();
      
      if (!geminiService.isConfigured()) {
        addLog('❌ API 키가 설정되지 않음');
        return;
      }
      
      addLog('✅ API 키 확인 완료');
      
      // 실제 API 호출 테스트
      addLog('📡 Gemini API 직접 호출 중...');
      const response = await geminiService.callGeminiAPI('안녕하세요. 간단한 테스트입니다.');
      
      addLog(`📊 API 응답 결과: ${response.success ? '성공' : '실패'}`);
      
      if (response.success) {
        addLog(`📝 응답 내용: ${response.data}`);
        setApiResponse(response);
      } else {
        addLog(`❌ 오류: ${response.error}`);
      }
      
    } catch (error) {
      addLog(`❌ 테스트 중 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
      console.error('테스트 오류 상세:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testDirectFetch = async () => {
    setIsLoading(true);
    addLog('🔍 직접 fetch로 Gemini API 테스트...');
    
    try {
      const apiKey = 'AIzaSyDFKAfEDMhqiGcJuOz5jjuEAUGg3Yvn46k';
      const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
      
      const requestBody = {
        contents: [{
          parts: [{
            text: 'Hello, this is a test message.'
          }]
        }]
      };
      
      addLog(`🌐 엔드포인트: ${endpoint}`);
      addLog(`🔑 API 키: ${apiKey.substring(0, 10)}...`);
      addLog(`📤 요청 본문: ${JSON.stringify(requestBody)}`);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': apiKey,
        },
        body: JSON.stringify(requestBody)
      });
      
      addLog(`📡 응답 상태: ${response.status}`);
      addLog(`📡 응답 헤더: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`);
      
      if (response.ok) {
        const data = await response.json();
        addLog('✅ 직접 fetch 성공!');
        addLog(`📊 응답 데이터: ${JSON.stringify(data, null, 2)}`);
        setApiResponse(data);
      } else {
        const errorText = await response.text();
        addLog(`❌ 응답 오류: ${response.status} - ${errorText}`);
      }
      
    } catch (error) {
      addLog(`❌ 직접 fetch 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
      console.error('직접 fetch 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.title}>🔗 실제 Gemini API 테스트</Text>
        <Text style={styles.subtitle}>직접 API 연결을 테스트합니다</Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={testRealGeminiAPI}
            disabled={isLoading}
          >
            <Feather name="play" size={20} color="white" />
            <Text style={styles.buttonText}>
              {isLoading ? '테스트 중...' : 'GeminiService 테스트'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary, isLoading && styles.buttonDisabled]}
            onPress={testDirectFetch}
            disabled={isLoading}
          >
            <Feather name="zap" size={20} color="white" />
            <Text style={styles.buttonText}>
              {isLoading ? '테스트 중...' : '직접 fetch 테스트'}
            </Text>
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
            <Text style={styles.sectionTitle}>📊 API 응답</Text>
            <ScrollView style={styles.responseContainer}>
              <Text style={styles.responseText}>
                {JSON.stringify(apiResponse, null, 2)}
              </Text>
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 140,
    justifyContent: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#FF9500',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
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
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace',
  },
});
