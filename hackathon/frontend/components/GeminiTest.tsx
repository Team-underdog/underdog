import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import GeminiService, { QuestRecommendation, FinancialAdvice, LearningGuide } from '../services/geminiService';

const GeminiTest: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [questRecommendations, setQuestRecommendations] = useState<QuestRecommendation[]>([]);
  const [financialAdvice, setFinancialAdvice] = useState<FinancialAdvice | null>(null);
  const [learningGuide, setLearningGuide] = useState<LearningGuide | null>(null);
  const [generalAdvice, setGeneralAdvice] = useState<string>('');

  const geminiService = GeminiService.getInstance();

  // Gemini API 키 설정 확인
  const checkGeminiConfig = () => {
    if (geminiService.isConfigured()) {
      Alert.alert('✅ 설정 완료', 'Gemini API 키가 정상적으로 설정되었습니다!');
    } else {
      Alert.alert('❌ 설정 필요', 'Gemini API 키를 설정해주세요.');
    }
  };

  // Gemini API 연결 테스트
  const testGeminiConnection = async () => {
    setIsLoading(true);
    try {
      const isConnected = await geminiService.testConnection();
      if (isConnected) {
        Alert.alert('✅ 연결 성공', 'Gemini API에 정상적으로 연결되었습니다!');
      } else {
        Alert.alert('❌ 연결 실패', 'Gemini API 연결에 실패했습니다. 콘솔 로그를 확인해주세요.');
      }
    } catch (error) {
      console.error('연결 테스트 오류:', error);
      Alert.alert('❌ 오류', '연결 테스트 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 개인화된 퀘스트 추천 테스트
  const testQuestRecommendations = async () => {
    setIsLoading(true);
    try {
      const mockUserProfile = {
        display_name: '테스트 사용자',
        currentLevel: 3,
        currentCredo: 250
      };

      const mockFinancialData = {
        total_assets: 5000000,
        monthly_income: 800000,
        monthly_spending: 600000,
        credit_score: { grade: 'B+' }
      };

      const mockAcademicData = {
        university: 'SSAFY 대학교',
        department: '소프트웨어 개발',
        grade: 2
      };

      const quests = await geminiService.generatePersonalizedQuests(
        mockUserProfile,
        mockFinancialData,
        mockAcademicData
      );

      setQuestRecommendations(quests);
      Alert.alert('🎯 퀘스트 추천 완료', `${quests.length}개의 개인화된 퀘스트를 생성했습니다!`);
    } catch (error) {
      console.error('퀘스트 추천 테스트 오류:', error);
      Alert.alert('❌ 오류', '퀘스트 추천 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 금융 조언 테스트
  const testFinancialAdvice = async () => {
    setIsLoading(true);
    try {
      const mockFinancialData = {
        total_assets: 5000000,
        total_balance: 2000000,
        total_liabilities: 1000000,
        credit_score: { grade: 'B+', score: 720 }
      };

      const mockUserGoals = ['대학원 진학', '해외 여행', '투자 시작'];

      const advice = await geminiService.generateFinancialAdvice(
        mockFinancialData,
        mockUserGoals
      );

      setFinancialAdvice(advice);
      Alert.alert('💰 금융 조언 완료', 'AI가 분석한 금융 조언을 확인하세요!');
    } catch (error) {
      console.error('금융 조언 테스트 오류:', error);
      Alert.alert('❌ 오류', '금융 조언 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 학습 가이드 테스트
  const testLearningGuide = async () => {
    setIsLoading(true);
    try {
      const mockAcademicData = {
        university: 'SSAFY 대학교',
        department: '소프트웨어 개발',
        grade: 2
      };

      const mockCurrentSkills = {
        programming: '중급',
        teamwork: '고급',
        presentation: '초급'
      };

      const mockTargetSkills = ['AI/ML', '클라우드 개발', '프로젝트 관리'];

      const guide = await geminiService.generateLearningGuide(
        mockAcademicData,
        mockCurrentSkills,
        mockTargetSkills
      );

      setLearningGuide(guide);
      Alert.alert('📚 학습 가이드 완료', 'AI가 제안한 학습 계획을 확인하세요!');
    } catch (error) {
      console.error('학습 가이드 테스트 오류:', error);
      Alert.alert('❌ 오류', '학습 가이드 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 일반 상담 테스트
  const testGeneralAdvice = async () => {
    setIsLoading(true);
    try {
      const advice = await geminiService.getGeneralAdvice(
        '학업',
        '시험 기간에 집중력이 떨어져요. 어떻게 하면 좋을까요?',
        { currentGrade: 'B+', targetGrade: 'A', studyTime: '하루 4시간' }
      );

      setGeneralAdvice(advice);
      Alert.alert('💡 AI 상담 완료', 'AI가 제안한 해결책을 확인하세요!');
    } catch (error) {
      console.error('일반 상담 테스트 오류:', error);
      Alert.alert('❌ 오류', 'AI 상담 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Feather name="cpu" size={24} color="#8B5CF6" />
          <Text style={styles.headerTitle}>Gemini AI 테스트</Text>
          <Text style={styles.headerSubtitle}>AI 기능을 테스트해보세요</Text>
        </View>

        {/* 설정 확인 */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.configButton} onPress={checkGeminiConfig}>
            <Feather name="settings" size={20} color="white" />
            <Text style={styles.buttonText}>Gemini 설정 확인</Text>
          </TouchableOpacity>
        </View>

        {/* 테스트 버튼들 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI 기능 테스트</Text>
          
          {/* 설정 및 연결 테스트 버튼들 */}
          <View style={styles.configButtonContainer}>
            <TouchableOpacity 
              style={[styles.configButton, styles.primaryButton]} 
              onPress={checkGeminiConfig}
            >
              <Feather name="settings" size={20} color="white" />
              <Text style={styles.buttonText}>설정 확인</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.configButton, styles.secondaryButton]} 
              onPress={testGeminiConnection}
              disabled={isLoading}
            >
              <Feather name="wifi" size={20} color="white" />
              <Text style={styles.buttonText}>연결 테스트</Text>
            </TouchableOpacity>
          </View>

          {/* AI 기능 테스트 버튼들 */}
          <TouchableOpacity 
            style={[styles.testButton, isLoading && styles.disabledButton]} 
            onPress={testQuestRecommendations}
            disabled={isLoading}
          >
            <Feather name="target" size={20} color="white" />
            <Text style={styles.buttonText}>퀘스트 추천 테스트</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.testButton, isLoading && styles.disabledButton]} 
            onPress={testFinancialAdvice}
            disabled={isLoading}
          >
            <Feather name="dollar-sign" size={20} color="white" />
            <Text style={styles.buttonText}>금융 조언 테스트</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.testButton, isLoading && styles.disabledButton]} 
            onPress={testLearningGuide}
            disabled={isLoading}
          >
            <Feather name="book-open" size={20} color="white" />
            <Text style={styles.buttonText}>학습 가이드 테스트</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.testButton, isLoading && styles.disabledButton]} 
            onPress={testGeneralAdvice}
            disabled={isLoading}
          >
            <Feather name="message-circle" size={20} color="white" />
            <Text style={styles.buttonText}>AI 상담 테스트</Text>
          </TouchableOpacity>
        </View>

        {/* 로딩 인디케이터 */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text style={styles.loadingText}>AI가 분석 중입니다...</Text>
          </View>
        )}

        {/* 결과 표시 */}
        {questRecommendations.length > 0 && (
          <View style={styles.resultSection}>
            <Text style={styles.resultTitle}>🎯 AI 추천 퀘스트</Text>
            {questRecommendations.map((quest, index) => (
              <View key={index} style={styles.questCard}>
                <Text style={styles.questTitle}>{quest.title}</Text>
                <Text style={styles.questDescription}>{quest.description}</Text>
                <View style={styles.questMeta}>
                  <Text style={styles.questMetaText}>난이도: {quest.difficulty}</Text>
                  <Text style={styles.questMetaText}>카테고리: {quest.category}</Text>
                  <Text style={styles.questMetaText}>소요시간: {quest.estimatedDuration}</Text>
                </View>
                <Text style={styles.questReason}>AI 추천 이유: {quest.aiReason}</Text>
                <View style={styles.questRewards}>
                  <Text style={styles.rewardText}>🎯 +{quest.rewards.credo} Credo</Text>
                  <Text style={styles.rewardText}>⭐ +{quest.rewards.xp} 크레도</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {financialAdvice && (
          <View style={styles.resultSection}>
            <Text style={styles.resultTitle}>💰 AI 금융 조언</Text>
            <View style={styles.adviceCard}>
              <Text style={styles.adviceTitle}>분석</Text>
              <Text style={styles.adviceContent}>{financialAdvice.analysis}</Text>
              
              <Text style={styles.adviceTitle}>권장사항</Text>
              {financialAdvice.recommendations.map((rec, index) => (
                <Text key={index} style={styles.adviceContent}>• {rec}</Text>
              ))}
              
              <View style={styles.adviceMeta}>
                <Text style={styles.adviceMetaText}>위험도: {financialAdvice.riskLevel}</Text>
                <Text style={styles.adviceMetaText}>우선순위: {financialAdvice.priority}</Text>
              </View>
            </View>
          </View>
        )}

        {learningGuide && (
          <View style={styles.resultSection}>
            <Text style={styles.resultTitle}>📚 AI 학습 가이드</Text>
            <View style={styles.adviceCard}>
              <Text style={styles.adviceTitle}>현재 상황</Text>
              <Text style={styles.adviceContent}>{learningGuide.currentStatus}</Text>
              
              <Text style={styles.adviceTitle}>권장사항</Text>
              {learningGuide.recommendations.map((rec, index) => (
                <Text key={index} style={styles.adviceContent}>• {rec}</Text>
              ))}
              
              <Text style={styles.adviceTitle}>학습 계획</Text>
              <Text style={styles.adviceContent}>{learningGuide.studyPlan}</Text>
              
              <Text style={styles.adviceTitle}>예상 개선도</Text>
              <Text style={styles.adviceContent}>{learningGuide.estimatedImprovement}</Text>
            </View>
          </View>
        )}

        {generalAdvice && (
          <View style={styles.resultSection}>
            <Text style={styles.resultTitle}>💡 AI 상담 결과</Text>
            <View style={styles.adviceCard}>
              <Text style={styles.adviceContent}>{generalAdvice}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 10,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 5,
  },
  section: {
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 20,
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  configButtonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  configButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
  },
  secondaryButton: {
    backgroundColor: '#10B981',
  },
  testButton: {
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#6B7280',
  },
  resultSection: {
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 20,
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  questCard: {
    backgroundColor: '#F3F4F6',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  questTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  questDescription: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 10,
    lineHeight: 20,
  },
  questMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  questMetaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  questReason: {
    fontSize: 12,
    color: '#8B5CF6',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  questRewards: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  rewardText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  adviceCard: {
    backgroundColor: '#F3F4F6',
    padding: 15,
    borderRadius: 8,
  },
  adviceTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 10,
    marginBottom: 5,
  },
  adviceContent: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 10,
  },
  adviceMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  adviceMetaText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
});

export default GeminiTest;
