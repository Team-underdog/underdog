import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { PixelCharacter } from '../components/PixelCharacter';
import { SkillGauge } from '../components/SkillGauge';
import { CampusCredoBottomNav } from '../components/CampusCredoBottomNav';
import { getCurrentUser, signOutUser } from '../services/authService';
import { financialService, type FinancialSummary } from '../services/financialService';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

interface UserData {
  id: number;
  email: string;
  display_name: string;
  current_university: string;
  current_department: string;
  grade_level: number;
  is_verified: boolean;
  created_at: string;
  last_login_at: string;
  profile_image?: string;
}

interface QuestData {
  id: number;
  title: string;
  description: string;
  category: string;
  reward: {
    credo: number;
    xp: number;
  };
  difficulty: 'easy' | 'medium' | 'hard';
  isCompleted?: boolean;
}

export default function CampusCredoHome() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [financialData, setFinancialData] = useState<FinancialSummary | null>(null);
  const [credoScore, setCredoScore] = useState(850);

  // Mock data - 실제로는 API에서 가져올 데이터
  const mockUserStats = {
    credoScore: 1247,
    level: 5,
    nextLevelCredoRequired: 1500,
    skills: [
      { 
        name: '학업', 
        level: 7, 
        maxLevel: 10, 
        experience: 75, 
        color: 'bg-blue-500' 
      },
      { 
        name: '재무관리', 
        level: 4, 
        maxLevel: 10, 
        experience: 40, 
        color: 'bg-green-500' 
      },
      { 
        name: '자기계발', 
        level: 3, 
        maxLevel: 10, 
        experience: 60, 
        color: 'bg-purple-500' 
      },
      { 
        name: '대외활동', 
        level: 2, 
        maxLevel: 10, 
        experience: 30, 
        color: 'bg-yellow-500' 
      },
    ],
    todayActivities: [
      { activity: '데이터베이스 수업 출석', credo: 10, time: '09:10' },
      { activity: '도서관 이용', credo: 5, time: '14:30' },
      { activity: '카페 결제', credo: 2, time: '16:45' },
    ]
  };

  const recommendedQuests: QuestData[] = [
    {
      id: 1,
      title: '백준 알고리즘 문제 3개 풀기',
      description: '코딩 실력 향상으로 학업 스킬을 성장시키세요',
      category: '학업',
      difficulty: 'medium',
      reward: { credo: 50, xp: 100 }
    },
    {
      id: 2,
      title: '이번 달 지출 50만원 이하 관리',
      description: '건전한 소비 습관으로 재무 관리 스킬을 키워보세요',
      category: '재무관리',
      difficulty: 'hard',
      reward: { credo: 75, xp: 150 }
    }
  ];

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      console.log('👤 사용자 프로필 로딩 시작');
      
      const token = await SecureStore.getItemAsync('authToken');
      console.log('🔑 토큰 존재 여부:', !!token);
      
      if (!token) {
        router.replace('/login');
        return;
      }

      const apiBaseUrl = 'http://localhost:8000';
      console.log('🔗 API URL:', `${apiBaseUrl}/api/auth/me`);

      const response = await fetch(`${apiBaseUrl}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 API 응답 상태:', response.status);
      console.log('📡 API 응답 헤더:', response.headers);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ 사용자 데이터 수신:', data);
        setUserData(data);
        
        // 금융 데이터 로딩
        await loadFinancialData(token);
      } else {
        console.log('❌ API 응답 실패:', response.status);
        if (response.status === 401) {
          await SecureStore.deleteItemAsync('authToken');
          router.replace('/login');
        }
      }
    } catch (error) {
      console.log('❌ 프로필 로딩 에러:', error);
      Alert.alert('오류', '사용자 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFinancialData = async (userKey: string) => {
    try {
      console.log('💰 금융 데이터 로딩 시작');
      const summary = await financialService.getUserFinancialSummary(userKey);
      setFinancialData(summary);
      
      // 금융 데이터를 기반으로 크레도 점수 계산
      const calculatedScore = financialService.calculateCredoScore(summary);
      setCredoScore(calculatedScore);
      
      console.log('✅ 금융 데이터 로딩 완료:', summary);
      console.log('🎯 계산된 크레도 점수:', calculatedScore);
    } catch (error) {
      console.error('❌ 금융 데이터 로딩 실패:', error);
      // 에러 시 기본값 유지
    }
  };

  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('userInfo');
      router.replace('/login');
    } catch (error) {
      Alert.alert('오류', '로그아웃 중 문제가 발생했습니다.');
    }
  };

  const handleQuestStart = (quest: QuestData) => {
    Alert.alert(
      '퀘스트 시작',
      `"${quest.title}" 퀘스트를 시작하시겠습니까?\n\n보상: ${quest.reward.credo} Credo, ${quest.reward.xp} XP`,
      [
        { text: '취소', style: 'cancel' },
        { text: '시작', onPress: () => console.log('퀘스트 시작:', quest.id) }
      ]
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'hard': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '쉬움';
      case 'medium': return '보통';
      case 'hard': return '어려움';
      default: return '보통';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>캠퍼스 크레도를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>
              안녕하세요, {userData?.display_name || '캠퍼스 크로니클러'}님!
            </Text>
            <Text style={styles.subGreeting}>오늘도 성장하는 하루 되세요</Text>
          </View>
          <View style={styles.credoScore}>
            <Feather name="zap" size={16} color="white" />
            <Text style={styles.credoText}>{credoScore.toLocaleString()}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Feather name="log-out" size={20} color="#6B7280" />
          </TouchableOpacity>
        </Animated.View>

        {/* 캐릭터 영역 */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.characterSection}>
          <View style={styles.characterContainer}>
            <PixelCharacter 
              level={financialData ? Math.floor(credoScore / 200) + 1 : mockUserStats.level} 
              credoScore={credoScore} 
            />
            <Text style={styles.characterTitle}>
              레벨 {mockUserStats.level} 캠퍼스 크로니클러
            </Text>
            <Text style={styles.characterSubtitle}>
              다음 레벨까지 {mockUserStats.nextLevelCredoRequired - mockUserStats.credoScore} Credo 남음
            </Text>
          </View>
        </Animated.View>

        {/* 오늘의 활동 요약 */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.todaySection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>오늘의 활동</Text>
            <Feather name="activity" size={20} color="#8B5CF6" />
          </View>
          <View style={styles.activityList}>
            {mockUserStats.todayActivities.map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityName}>{activity.activity}</Text>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
                <View style={styles.activityReward}>
                  <Feather name="zap" size={12} color="#F59E0B" />
                  <Text style={styles.activityCredo}>+{activity.credo}</Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* 금융 요약 정보 */}
        {financialData ? (
          <Animated.View entering={FadeInDown.delay(300)} style={styles.financialSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>💰 내 금융 현황</Text>
              <Feather name="credit-card" size={20} color="#10B981" />
            </View>
            <View style={styles.financialContainer}>
              <View style={styles.balanceCard}>
                <Text style={styles.balanceLabel}>총 잔액</Text>
                <Text style={styles.balanceAmount}>
                  {financialData.total_balance?.toLocaleString() || '0'}원
                </Text>
                <Text style={styles.accountInfo}>
                  {financialData.accounts?.[0]?.bank_name || 'N/A'} · {financialData.accounts?.[0]?.account_name || 'N/A'}
                </Text>
              </View>
              
              <View style={styles.financialStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>이번 달 수입</Text>
                  <Text style={styles.statValue}>
                    +{financialData.monthly_income?.toLocaleString() || '0'}원
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>이번 달 지출</Text>
                  <Text style={[styles.statValue, { color: '#EF4444' }]}>
                    -{financialData.monthly_spending?.toLocaleString() || '0'}원
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>신용등급</Text>
                  <Text style={styles.statValue}>{financialData.credit_grade || 'N/A'}</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.delay(300)} style={styles.financialSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>💰 내 금융 현황</Text>
              <Feather name="credit-card" size={20} color="#10B981" />
            </View>
            <View style={styles.financialContainer}>
              <View style={styles.balanceCard}>
                <Text style={styles.balanceLabel}>총 잔액</Text>
                <Text style={styles.balanceAmount}>로딩 중...</Text>
                <Text style={styles.accountInfo}>계정 정보 로딩 중...</Text>
              </View>
              
              <View style={styles.financialStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>이번 달 수입</Text>
                  <Text style={styles.statValue}>로딩 중...</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>이번 달 지출</Text>
                  <Text style={[styles.statValue, { color: '#EF4444' }]}>로딩 중...</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>신용등급</Text>
                  <Text style={styles.statValue}>로딩 중...</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        )}

        {/* 스킬 현황 */}
        <Animated.View entering={FadeInDown.delay(400)} style={styles.skillSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>나의 성장 현황</Text>
            <Feather name="trending-up" size={20} color="#10B981" />
          </View>
          <View style={styles.skillList}>
            {mockUserStats.skills.map((skill, index) => (
              <SkillGauge key={skill.name} skill={skill} delay={index} />
            ))}
          </View>
        </Animated.View>

        {/* 추천 퀘스트 */}
        <Animated.View entering={FadeInDown.delay(500)} style={styles.questSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>추천 퀘스트</Text>
            <TouchableOpacity style={styles.moreButton}>
              <Text style={styles.moreText}>더보기</Text>
              <Feather name="arrow-right" size={14} color="#3B82F6" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.questList}>
            {recommendedQuests.map((quest) => (
              <TouchableOpacity 
                key={quest.id} 
                style={styles.questCard}
                onPress={() => handleQuestStart(quest)}
              >
                <View style={styles.questHeader}>
                  <View style={styles.questCategory}>
                    <Feather 
                      name={quest.category === '학업' ? 'book-open' : 'credit-card'} 
                      size={14} 
                      color={quest.category === '학업' ? '#3B82F6' : '#10B981'} 
                    />
                    <Text style={styles.questCategoryText}>{quest.category}</Text>
                  </View>
                  <View 
                    style={[
                      styles.difficultyBadge, 
                      { backgroundColor: getDifficultyColor(quest.difficulty) }
                    ]}
                  >
                    <Text style={styles.difficultyText}>
                      {getDifficultyText(quest.difficulty)}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.questTitle}>{quest.title}</Text>
                <Text style={styles.questDescription}>{quest.description}</Text>
                
                <View style={styles.questRewards}>
                  <View style={styles.rewardItem}>
                    <Feather name="zap" size={12} color="#F59E0B" />
                    <Text style={styles.rewardText}>+{quest.reward.credo} Credo</Text>
                  </View>
                  <View style={styles.rewardItem}>
                    <Feather name="star" size={12} color="#8B5CF6" />
                    <Text style={styles.rewardText}>+{quest.reward.xp} XP</Text>
                  </View>
                </View>
                
                <View style={styles.questAction}>
                  <Text style={styles.startButtonText}>시작하기</Text>
                  <Feather name="play" size={16} color="white" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* 하단 패딩 */}
        <View style={{ height: 100 }} />
        </ScrollView>
      </View>
      
      {/* 하단 네비게이션 */}
      <CampusCredoBottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subGreeting: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  credoScore: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  credoText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  logoutButton: {
    padding: 8,
  },
  characterSection: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  characterContainer: {
    alignItems: 'center',
  },
  characterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
  },
  characterSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  todaySection: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  skillSection: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  questSection: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  activityTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  activityReward: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activityCredo: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
    marginLeft: 4,
  },
  skillList: {
    gap: 8,
  },
  financialSection: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  financialContainer: {
    gap: 16,
  },
  balanceCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
  },
  accountInfo: {
    fontSize: 12,
    color: '#64748B',
  },
  financialStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moreText: {
    fontSize: 14,
    color: '#3B82F6',
    marginRight: 4,
  },
  questList: {
    gap: 16,
  },
  questCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  questHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  questCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  questCategoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 4,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  questTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  questDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
  },
  questRewards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 4,
  },
  questAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  startButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});