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
import DynamicContentService, { DynamicUserProfile } from '../services/dynamicContentService';

interface TestResult {
  testName: string;
  success: boolean;
  userProfile?: DynamicUserProfile;
  response?: string;
  error?: string;
  timestamp: string;
}

const DynamicGeminiTest: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [currentProfile, setCurrentProfile] = useState<DynamicUserProfile | null>(null);

  const dynamicService = DynamicContentService.getInstance();
  const geminiService = GeminiService.getInstance();

  // 테스트 실행
  const runTest = async (testName: string, testFunction: () => Promise<any>) => {
    setIsLoading(true);
    setCurrentTest(testName);
    
    try {
      const response = await testFunction();
      
      const result: TestResult = {
        testName,
        success: true,
        userProfile: currentProfile || undefined,
        response: typeof response === 'string' ? response : JSON.stringify(response, null, 2),
        timestamp: new Date().toLocaleTimeString(),
      };
      
      setResults(prev => [result, ...prev]);
      Alert.alert('✅ 성공', `${testName} 테스트가 성공했습니다!`);
      
    } catch (error) {
      const result: TestResult = {
        testName,
        success: false,
        userProfile: currentProfile || undefined,
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

  // 1. 새로운 사용자 프로필 생성
  const generateNewProfile = () => {
    const newProfile = dynamicService.generateRandomUserProfile();
    setCurrentProfile(newProfile);
    Alert.alert('🆕 새 프로필 생성', 
      `${newProfile.name}님의 프로필이 생성되었습니다!\n\n` +
      `학교: ${newProfile.university} ${newProfile.department} ${newProfile.grade}학년\n` +
      `현재 상태: ${newProfile.currentMood}, ${newProfile.currentChallenge}\n` +
      `금융: 월 ${newProfile.monthlyIncome.toLocaleString()}원 수입, ${newProfile.savingsGoal.toLocaleString()}원 목표`
    );
  };

  // 2. 동적 금융 상담 테스트 - 실제 사용자 데이터 사용
  const testDynamicFinancialAdvice = async () => {
    if (!currentProfile) {
      throw new Error('먼저 사용자 프로필을 생성해주세요.');
    }
    
    // 실제 사용자 데이터로 Gemini API 호출
    const prompt = `당신은 ${currentProfile.name}님을 위한 전문 금융 상담사입니다.

## 📋 사용자 실제 프로필
- **이름**: ${currentProfile.name} (${currentProfile.age}세)
- **학교**: ${currentProfile.university} ${currentProfile.department} ${currentProfile.grade}학년
- **현재 상태**: ${currentProfile.currentMood}, ${currentProfile.currentChallenge} 겪는 중
- **최근 성과**: ${currentProfile.recentAchievement}

## 💰 실제 금융 상황
- **월 수입**: ${currentProfile.monthlyIncome.toLocaleString()}원
- **월 지출**: ${currentProfile.monthlyExpenses.toLocaleString()}원
- **저축 목표**: ${currentProfile.savingsGoal.toLocaleString()}원
- **투자 관심**: ${currentProfile.investmentInterest}
- **재정 상태**: ${currentProfile.financialStatus === 'excellent' ? '매우 양호' : currentProfile.financialStatus === 'good' ? '양호' : currentProfile.financialStatus === 'fair' ? '보통' : '개선 필요'}

## 🎯 구체적 상담 요청
${currentProfile.name}님이 현재 ${currentProfile.currentChallenge}을 겪고 계시는데, 
월 ${currentProfile.monthlyIncome.toLocaleString()}원 수입으로 ${currentProfile.savingsGoal.toLocaleString()}원을 모으려면 어떻게 해야 할까요?

## 💡 답변 요청사항
1. **현재 상황 분석**: ${currentProfile.name}님의 구체적인 금융 상황과 도전과제
2. **실행 가능한 해결방안**: ${currentProfile.name}님의 수입과 지출을 고려한 현실적인 방법들
3. **단계별 계획**: 1개월, 3개월, 6개월 단위로 구체적인 목표와 방법
4. **개인 맞춤 전략**: ${currentProfile.name}님의 ${currentProfile.currentMood}한 성격과 ${currentProfile.recentAchievement}을 고려한 접근법
5. **즉시 실행 가능한 행동**: 오늘부터 시작할 수 있는 구체적인 행동들

${currentProfile.name}님의 ${currentProfile.currentMood}한 마음가짐과 ${currentProfile.recentAchievement}을 바탕으로, 
동기부여가 되는 구체적이고 실용적인 금융 조언을 한국어로 친근하게 제공해주세요.`;

    const response = await geminiService.callGeminiAPI(prompt);
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.error || 'AI 응답 실패');
    }
  };

  // 3. 동적 학업 상담 테스트 - 실제 사용자 데이터 사용
  const testDynamicAcademicAdvice = async () => {
    if (!currentProfile) {
      throw new Error('먼저 사용자 프로필을 생성해주세요.');
    }
    
    // 실제 사용자 데이터로 Gemini API 호출
    const prompt = `당신은 ${currentProfile.name}님을 위한 전문 학업 상담사입니다.

## 📋 사용자 실제 프로필
- **이름**: ${currentProfile.name} (${currentProfile.age}세)
- **학교**: ${currentProfile.university} ${currentProfile.department} ${currentProfile.grade}학년
- **현재 상태**: ${currentProfile.currentMood}, ${currentProfile.currentChallenge} 겪는 중
- **최근 성과**: ${currentProfile.recentAchievement}

## 📚 실제 학업 상황
- **학업 성과**: ${currentProfile.academicPerformance === 'excellent' ? '우수' : currentProfile.academicPerformance === 'good' ? '양호' : currentProfile.academicPerformance === 'fair' ? '보통' : '개선 필요'}
- **학습 동기**: ${currentProfile.studyMotivation}/10
- **시간 관리**: ${currentProfile.timeManagement}/10
- **진로 목표**: ${currentProfile.careerGoals.join(', ')}

## 🎯 구체적 상담 요청
${currentProfile.name}님이 ${currentProfile.department} 전공자로서 ${currentProfile.careerGoals.join(', ')}을 목표로 하고 계시는데,
현재 학습 동기 ${currentProfile.studyMotivation}/10, 시간 관리 ${currentProfile.timeManagement}/10 수준입니다.

## 💡 답변 요청사항
1. **현재 학업 상태 분석**: ${currentProfile.name}님의 구체적인 학습 상황과 개선점
2. **전공-진로 연계 전략**: ${currentProfile.department} 전공과 ${currentProfile.careerGoals.join(', ')}을 연결하는 구체적 방법
3. **학습 동기 향상 방안**: ${currentProfile.studyMotivation}/10에서 10/10으로 만드는 실용적 전략
4. **시간 관리 개선**: ${currentProfile.timeManagement}/10에서 효율적인 학습 계획 수립 방법
5. **구체적 학습 계획**: ${currentProfile.grade}학년 ${currentProfile.name}님이 지금부터 할 수 있는 구체적 행동들

${currentProfile.name}님의 ${currentProfile.currentMood}한 마음가짐과 ${currentProfile.recentAchievement}을 바탕으로, 
동기부여가 되는 구체적이고 실용적인 학업 조언을 한국어로 친근하게 제공해주세요.`;

    const response = await geminiService.callGeminiAPI(prompt);
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.error || 'AI 응답 실패');
    }
  };

  // 4. 동적 개인 성장 상담 테스트 - 실제 사용자 데이터 사용
  const testDynamicPersonalGrowth = async () => {
    if (!currentProfile) {
      throw new Error('먼저 사용자 프로필을 생성해주세요.');
    }
    
    // 실제 사용자 데이터로 Gemini API 호출
    const prompt = `당신은 ${currentProfile.name}님을 위한 전문 개인 성장 상담사입니다.

## 📋 사용자 실제 프로필
- **이름**: ${currentProfile.name} (${currentProfile.age}세)
- **학교**: ${currentProfile.university} ${currentProfile.department} ${currentProfile.grade}학년
- **현재 상태**: ${currentProfile.currentMood}, ${currentProfile.currentChallenge} 겪는 중
- **최근 성과**: ${currentProfile.recentAchievement}

## 🎯 실제 개인적 상황
- **스트레스 수준**: ${currentProfile.stressLevel}/10
- **사회생활**: ${currentProfile.socialLife === 'very_active' ? '매우 활발' : currentProfile.socialLife === 'active' ? '활발' : currentProfile.socialLife === 'moderate' ? '보통' : '조용함'}
- **취미**: ${currentProfile.hobbies.join(', ')}
- **개인 목표**: ${currentProfile.personalGoals.join(', ')}

## 🎯 구체적 상담 요청
${currentProfile.name}님이 현재 ${currentProfile.currentChallenge}을 극복하고 ${currentProfile.personalGoals.join(', ')}을 달성하려고 하시는데,
현재 스트레스 수준 ${currentProfile.stressLevel}/10, ${currentProfile.socialLife}한 사회생활을 하고 계십니다.

## 💡 답변 요청사항
1. **현재 상황 종합 분석**: ${currentProfile.name}님의 구체적인 도전과제와 개인적 상황
2. **스트레스 관리 전략**: ${currentProfile.stressLevel}/10에서 균형잡힌 상태로 만드는 방법
3. **개인 목표 달성 계획**: ${currentProfile.personalGoals.join(', ')}을 위한 단계별 실행 계획
4. **사회생활 개선**: ${currentProfile.socialLife}한 상태에서 더 의미있는 인간관계를 만드는 방법
5. **취미 활용 전략**: ${currentProfile.hobbies.join(', ')}을 통한 개인 성장과 스트레스 해소 방법
6. **즉시 실행 가능한 행동**: 오늘부터 시작할 수 있는 구체적인 행동들

${currentProfile.name}님의 ${currentProfile.currentMood}한 마음가짐과 ${currentProfile.recentAchievement}을 바탕으로, 
동기부여가 되는 구체적이고 실용적인 개인 성장 조언을 한국어로 친근하게 제공해주세요.`;

    const response = await geminiService.callGeminiAPI(prompt);
    if (response.success && response.data) {
      return response.data;
    } else {
      throw new Error(response.error || 'AI 응답 실패');
    }
  };

  // 5. 동적 퀘스트 생성 테스트
  const testDynamicQuestGeneration = async () => {
    if (!currentProfile) {
      throw new Error('먼저 사용자 프로필을 생성해주세요.');
    }
    
    const quest = dynamicService.generateDynamicQuest(currentProfile);
    return quest;
  };

  // 6. 모든 동적 테스트 실행
  const runAllDynamicTests = async () => {
    if (!currentProfile) {
      Alert.alert('⚠️ 프로필 필요', '먼저 사용자 프로필을 생성해주세요.');
      return;
    }
    
    const tests = [
      { name: '동적 금융 상담', func: testDynamicFinancialAdvice },
      { name: '동적 학업 상담', func: testDynamicAcademicAdvice },
      { name: '동적 개인 성장', func: testDynamicPersonalGrowth },
      { name: '동적 퀘스트 생성', func: testDynamicQuestGeneration },
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
            <Text style={styles.title}>🎲 실제 사용자 데이터 기반 Gemini 2.0 테스트</Text>
            <Text style={styles.subtitle}>실제 사용자 정보로 맞춤형 AI 상담</Text>
          </View>

          {/* 현재 프로필 표시 */}
          <View style={styles.profileSection}>
            <Text style={styles.sectionTitle}>👤 현재 사용자 프로필</Text>
            {currentProfile ? (
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {currentProfile.name} ({currentProfile.age}세)
                </Text>
                <Text style={styles.profileDetail}>
                  {currentProfile.university} {currentProfile.department} {currentProfile.grade}학년
                </Text>
                <Text style={styles.profileDetail}>
                  현재: {currentProfile.currentMood}, {currentProfile.currentChallenge}
                </Text>
                <Text style={styles.profileDetail}>
                  금융: 월 {currentProfile.monthlyIncome.toLocaleString()}원 수입, {currentProfile.savingsGoal.toLocaleString()}원 목표
                </Text>
              </View>
            ) : (
              <Text style={styles.noProfile}>프로필이 생성되지 않았습니다.</Text>
            )}
            
            <TouchableOpacity
              style={[styles.testButton, styles.profileButton]}
              onPress={generateNewProfile}
            >
              <Ionicons name="person-add" size={20} color="white" />
              <Text style={styles.buttonText}>새 프로필 생성</Text>
            </TouchableOpacity>
          </View>

          {/* 테스트 버튼들 */}
          <View style={styles.testSection}>
            <Text style={styles.sectionTitle}>🧪 실제 사용자 데이터 기반 테스트</Text>
            
            <TouchableOpacity
              style={styles.testButton}
              onPress={() => runTest('동적 금융 상담', testDynamicFinancialAdvice)}
              disabled={isLoading || !currentProfile}
            >
              <Ionicons name="cash" size={20} color="white" />
              <Text style={styles.buttonText}>실제 사용자 금융 상담 테스트</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.testButton}
              onPress={() => runTest('동적 학업 상담', testDynamicAcademicAdvice)}
              disabled={isLoading || !currentProfile}
            >
              <Ionicons name="school" size={20} color="white" />
              <Text style={styles.buttonText}>실제 사용자 학업 상담 테스트</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.testButton}
              onPress={() => runTest('동적 개인 성장', testDynamicPersonalGrowth)}
              disabled={isLoading || !currentProfile}
            >
              <Ionicons name="trending-up" size={20} color="white" />
              <Text style={styles.buttonText}>실제 사용자 개인 성장 테스트</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.testButton}
              onPress={() => runTest('동적 퀘스트 생성', testDynamicQuestGeneration)}
              disabled={isLoading || !currentProfile}
            >
              <Ionicons name="trophy" size={20} color="white" />
              <Text style={styles.buttonText}>실제 사용자 퀘스트 생성 테스트</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.testButton, styles.primaryButton]}
              onPress={runAllDynamicTests}
              disabled={isLoading || !currentProfile}
            >
              <Ionicons name="rocket" size={20} color="white" />
              <Text style={styles.buttonText}>모든 실제 사용자 테스트 실행</Text>
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
              <Text style={styles.sectionTitle}>📊 실제 사용자 데이터 기반 테스트 결과</Text>
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
                  
                  {result.userProfile && (
                    <View style={styles.resultProfile}>
                      <Text style={styles.resultProfileText}>
                        👤 {result.userProfile.name}님의 실제 데이터 기반 맞춤형 상담
                      </Text>
                    </View>
                  )}
                  
                  {result.success && result.response && (
                    <Text style={styles.resultResponse}>
                      {result.response.substring(0, 400)}
                      {result.response.length > 400 ? '...' : ''}
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
  profileSection: {
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
  profileInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  profileName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  profileDetail: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    marginBottom: 3,
  },
  noProfile: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 15,
  },
  profileButton: {
    backgroundColor: 'rgba(0, 255, 136, 0.8)',
    borderColor: 'rgba(0, 255, 136, 0.5)',
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
  resultProfile: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 8,
    borderRadius: 5,
    marginBottom: 10,
  },
  resultProfileText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
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

export default DynamicGeminiTest;
