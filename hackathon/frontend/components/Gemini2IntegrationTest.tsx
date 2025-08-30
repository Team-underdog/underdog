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
import GeminiService from '../services/geminiService';
import SkillTreeAnalysisService from '../services/skillTreeAnalysisService';
import QuestRecommendationService from '../services/questRecommendationService';

interface TestResult {
  testName: string;
  success: boolean;
  response?: string;
  error?: string;
  timestamp: string;
}

const Gemini2IntegrationTest: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');

  // 테스트 실행
  const runTest = async (testName: string, testFunction: () => Promise<any>) => {
    setIsLoading(true);
    setCurrentTest(testName);
    
    try {
      const response = await testFunction();
      
      const result: TestResult = {
        testName,
        success: true,
        response: typeof response === 'string' ? response : JSON.stringify(response, null, 2),
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

  // 1. Gemini API 기본 연결 테스트
  const testGeminiConnection = async () => {
    const geminiService = GeminiService.getInstance();
    return await geminiService.testConnection();
  };

  // 2. AI 금융 상담 테스트
  const testFinancialAdvice = async () => {
    const geminiService = GeminiService.getInstance();
    const prompt = `당신은 한국의 전문 금융 상담사입니다. 
대학생이 월 50만원 용돈으로 어떻게 100만원을 모을 수 있을지 간단한 조언을 3가지만 한국어로 답변해주세요.`;
    
    const response = await geminiService.callGeminiAPI(prompt);
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.error || 'AI 응답 실패');
    }
  };

  // 3. 추천 퀘스트 생성 테스트
  const testQuestRecommendation = async () => {
    const questService = QuestRecommendationService.getInstance();
    const userProfile = {
      display_name: '테스트 사용자',
      currentLevel: 5,
      currentCredo: 1250,
    };
    const financialData = {
      total_assets: 500000,
      monthly_income: 300000,
      monthly_spending: 250000,
      credit_score: { grade: 'A' }
    };
    const academicData = {
      university: 'SSAFY',
      department: '소프트웨어 개발',
      grade: '2학년'
    };
    
    const quests = await questService.generatePersonalizedQuests(
      userProfile,
      financialData,
      academicData
    );
    
    return quests;
  };

  // 4. 스킬트리 분석 테스트
  const testSkillTreeAnalysis = async () => {
    const skillService = SkillTreeAnalysisService.getInstance();
    const userProfile = {
      credoData: {
        currentCredo: 1250,
        currentLevel: 5,
        totalCredo: 2500,
        currentXP: 850,
        totalXP: 1800,
      },
      financialData: {
        monthlyIncome: 300000,
        monthlySpending: 250000,
        savingsRate: 0.17,
        investmentAmount: 100000,
        debtAmount: 0,
      },
      academicData: {
        gpa: 3.8,
        completedCourses: 12,
        studyHours: 25,
        certifications: ['SQLD', '정보처리기사'],
      },
      questData: {
        completedQuests: 15,
        activeQuests: 3,
        questCategories: ['academic', 'financial', 'personal'],
        questSuccessRate: 0.87,
      },
      chronicleData: {
        totalPosts: 8,
        engagementRate: 0.75,
        postCategories: ['성장일기', '학습노트', '금융팁'],
      },
    };
    
    const analysis = await skillService.generatePersonalizedAnalysis(userProfile);
    return analysis;
  };

  // 5. 개인 맞춤형 학습 가이드 테스트
  const testLearningGuide = async () => {
    const geminiService = GeminiService.getInstance();
    const prompt = `당신은 대학생을 위한 개인 맞춤형 학습 가이드를 제공하는 AI 상담사입니다.

사용자 정보:
- 대학교: SSAFY
- 전공: 소프트웨어 개발
- 학년: 2학년
- 현재 GPA: 3.8
- 목표: 취업 준비 및 전문성 향상

위 정보를 바탕으로 다음을 제공해주세요:
1. 현재 학습 상태 분석
2. 개선이 필요한 영역
3. 구체적인 학습 계획
4. 추천 학습 자료
5. 다음 3개월 로드맵

한국어로 친근하고 구체적으로 답변해주세요.`;

    const response = await geminiService.callGeminiAPI(prompt);
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.error || 'AI 응답 실패');
    }
  };

  // 6. 모든 테스트 실행
  const runAllTests = async () => {
    const tests = [
      { name: 'Gemini API 연결', func: testGeminiConnection },
      { name: 'AI 금융 상담', func: testFinancialAdvice },
      { name: '추천 퀘스트', func: testQuestRecommendation },
      { name: '스킬트리 분석', func: testSkillTreeAnalysis },
      { name: '학습 가이드', func: testLearningGuide },
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
            <Text style={styles.title}>🚀 Gemini 2.0 통합 테스트</Text>
            <Text style={styles.subtitle}>추천 퀘스트 + 나 알아보기 기능</Text>
          </View>

          {/* 테스트 버튼들 */}
          <View style={styles.testSection}>
            <Text style={styles.sectionTitle}>🧪 개별 테스트</Text>
            
            <TouchableOpacity
              style={styles.testButton}
              onPress={() => runTest('Gemini API 연결', testGeminiConnection)}
              disabled={isLoading}
            >
              <Ionicons name="wifi" size={20} color="white" />
              <Text style={styles.buttonText}>Gemini API 연결 테스트</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.testButton}
              onPress={() => runTest('AI 금융 상담', testFinancialAdvice)}
              disabled={isLoading}
            >
              <Ionicons name="cash" size={20} color="white" />
              <Text style={styles.buttonText}>AI 금융 상담 테스트</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.testButton}
              onPress={() => runTest('추천 퀘스트', testQuestRecommendation)}
              disabled={isLoading}
            >
              <Ionicons name="trophy" size={20} color="white" />
              <Text style={styles.buttonText}>추천 퀘스트 생성 테스트</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.testButton}
              onPress={() => runTest('스킬트리 분석', testSkillTreeAnalysis)}
              disabled={isLoading}
            >
              <Ionicons name="analytics" size={20} color="white" />
              <Text style={styles.buttonText}>스킬트리 분석 테스트</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.testButton}
              onPress={() => runTest('학습 가이드', testLearningGuide)}
              disabled={isLoading}
            >
              <Ionicons name="school" size={20} color="white" />
              <Text style={styles.buttonText}>개인 맞춤형 학습 가이드</Text>
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
                      {result.response.substring(0, 300)}
                      {result.response.length > 300 ? '...' : ''}
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
  testSection: {
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

export default Gemini2IntegrationTest;
