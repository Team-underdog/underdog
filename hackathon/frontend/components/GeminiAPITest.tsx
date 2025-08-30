import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GEMINI_API_KEY } from '../config/apiKeys';

interface TestResult {
  testName: string;
  success: boolean;
  response?: string;
  error?: string;
  timestamp: string;
}

const GeminiAPITest: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');

  // Gemini API 직접 호출
  const callGeminiAPI = async (prompt: string, maxTokens: number = 1024): Promise<string> => {
    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: maxTokens,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('응답에서 답변을 찾을 수 없습니다.');
    }
  };

  // 테스트 실행
  const runTest = async (testName: string, testFunction: () => Promise<string>) => {
    setIsLoading(true);
    setCurrentTest(testName);
    
    try {
      const response = await testFunction();
      
      const result: TestResult = {
        testName,
        success: true,
        response,
        timestamp: new Date().toLocaleTimeString(),
      };
      
      setResults(prev => [result, ...prev]);
      Alert.alert('✅ 성공', `${testName} 테스트가 성공했습니다!`);
      
    } catch (error) {
      const result: TestResult = {
        testName,
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류',
        timestamp: new Date().toLocaleTimeString(),
      };
      
      setResults(prev => [result, ...prev]);
      Alert.alert('❌ 실패', `${testName} 테스트가 실패했습니다.\n\n오류: ${result.error}`);
    } finally {
      setIsLoading(false);
      setCurrentTest('');
    }
  };

  // 기본 연결 테스트
  const testBasicConnection = async () => {
    return callGeminiAPI("안녕하세요! 간단히 'Hello World'라고 한국어로 답변해주세요.", 100);
  };

  // 금융 상담 테스트
  const testFinancialAdvice = async () => {
    const prompt = `당신은 한국의 전문 금융 상담사입니다. 
대학생이 월 50만원 용돈으로 어떻게 100만원을 모을 수 있을지 간단한 조언을 3가지만 한국어로 답변해주세요.

답변 형식:
- 핵심 답변
- 구체적 조언 (3개)
- 주의사항
- 다음 단계`;

    return callGeminiAPI(prompt);
  };

  // 예산 분석 테스트
  const testBudgetAnalysis = async () => {
    const prompt = `월 소득 100만원을 기준으로 예산 분석 및 조언을 제공해주세요.

현재 지출 현황:
- 식비: 30만원
- 교통비: 10만원
- 통신비: 5만원
- 기타: 15만원

목표: 6개월 내 200만원 모으기

다음 사항을 분석해주세요:
1. 지출 패턴 분석
2. 절약 기회
3. 목표 달성을 위한 예산 계획
4. 구체적인 절약 방법
5. 다음 달 예산 제안`;

    return callGeminiAPI(prompt);
  };

  // 모든 테스트 실행
  const runAllTests = async () => {
    const tests = [
      { name: '기본 연결', func: testBasicConnection },
      { name: '금융 상담', func: testFinancialAdvice },
      { name: '예산 분석', func: testBudgetAnalysis },
    ];

    for (const test of tests) {
      await runTest(test.name, test.func);
      // API 호출 간격 조절
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  // 결과 초기화
  const clearResults = () => {
    setResults([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <Text style={styles.title}>🤖 Gemini API 테스트</Text>
            <Text style={styles.subtitle}>React Native에서 직접 API 호출</Text>
          </View>

          {/* API 키 상태 */}
          <View style={styles.apiKeySection}>
            <Text style={styles.sectionTitle}>🔑 API 키 상태</Text>
            <Text style={styles.apiKeyStatus}>
              {GEMINI_API_KEY ? '✅ 설정됨' : '❌ 설정되지 않음'}
            </Text>
            <Text style={styles.apiKeyInfo}>
              {GEMINI_API_KEY ? GEMINI_API_KEY.substring(0, 20) + '...' : 'API 키를 설정하세요'}
            </Text>
          </View>

          {/* 테스트 버튼들 */}
          <View style={styles.testSection}>
            <Text style={styles.sectionTitle}>🧪 테스트 실행</Text>
            
            <TouchableOpacity
              style={styles.testButton}
              onPress={() => runTest('기본 연결', testBasicConnection)}
              disabled={isLoading}
            >
              <Ionicons name="checkmark-circle" size={20} color="white" />
              <Text style={styles.buttonText}>기본 연결 테스트</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.testButton}
              onPress={() => runTest('금융 상담', testFinancialAdvice)}
              disabled={isLoading}
            >
              <Ionicons name="cash" size={20} color="white" />
              <Text style={styles.buttonText}>금융 상담 테스트</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.testButton}
              onPress={() => runTest('예산 분석', testBudgetAnalysis)}
              disabled={isLoading}
            >
              <Ionicons name="analytics" size={20} color="white" />
              <Text style={styles.buttonText}>예산 분석 테스트</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.testButton, styles.primaryButton]}
              onPress={runAllTests}
              disabled={isLoading}
            >
              <Ionicons name="rocket" size={20} color="white" />
              <Text style={styles.buttonText}>모든 테스트 실행</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.testButton, styles.clearButton]}
              onPress={clearResults}
              disabled={isLoading}
            >
              <Ionicons name="trash" size={20} color="white" />
              <Text style={styles.buttonText}>결과 초기화</Text>
            </TouchableOpacity>
          </View>

          {/* 로딩 상태 */}
          {isLoading && (
            <View style={styles.loadingSection}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingText}>
                {currentTest} 테스트 실행 중...
              </Text>
            </View>
          )}

          {/* 테스트 결과 */}
          {results.length > 0 && (
            <View style={styles.resultsSection}>
              <Text style={styles.sectionTitle}>📊 테스트 결과</Text>
              {results.map((result, index) => (
                <View
                  key={index}
                  style={[
                    styles.resultItem,
                    result.success ? styles.successResult : styles.errorResult
                  ]}
                >
                  <View style={styles.resultHeader}>
                    <Ionicons
                      name={result.success ? 'checkmark-circle' : 'close-circle'}
                      size={20}
                      color={result.success ? '#00ff88' : '#ff4757'}
                    />
                    <Text style={styles.resultTitle}>{result.testName}</Text>
                    <Text style={styles.resultTime}>{result.timestamp}</Text>
                  </View>
                  
                  {result.success && result.response && (
                    <Text style={styles.resultResponse}>
                      {result.response.substring(0, 200)}
                      {result.response.length > 200 ? '...' : ''}
                    </Text>
                  )}
                  
                  {!result.success && result.error && (
                    <Text style={styles.resultError}>
                      오류: {result.error}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  apiKeySection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  apiKeyStatus: {
    fontSize: 16,
    color: 'white',
    marginBottom: 5,
  },
  apiKeyInfo: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'monospace',
  },
  testSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  primaryButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.8)',
    borderColor: 'rgba(255, 107, 107, 0.5)',
  },
  clearButton: {
    backgroundColor: 'rgba(255, 71, 87, 0.8)',
    borderColor: 'rgba(255, 71, 87, 0.5)',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  loadingSection: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
  },
  resultsSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  resultItem: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderLeftWidth: 4,
  },
  successResult: {
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderLeftColor: '#00ff88',
  },
  errorResult: {
    backgroundColor: 'rgba(255, 71, 87, 0.1)',
    borderLeftColor: '#ff4757',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  resultTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
    flex: 1,
  },
  resultTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  resultResponse: {
    color: 'white',
    fontSize: 14,
    lineHeight: 20,
  },
  resultError: {
    color: '#ff4757',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default GeminiAPITest;
