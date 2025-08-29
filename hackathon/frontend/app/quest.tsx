import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CampusCredoBottomNav } from '../components/CampusCredoBottomNav';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as SecureStore from 'expo-secure-store';
import { colors } from '../components/ui/theme';
import { financialService, type FinancialSummary } from '../services/financialService';
import { questService, type Quest as QuestType } from '../services/questService';
import questRecommendationService, { QuestRecommendation } from '../services/questRecommendationService';

interface Quest {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  rewards: {
    credo: number;
    xp: number;
    skillType: string;
  };
  requirements: string[];
  timeLimit?: number; // 시간 (시간 단위)
  progress?: number; // 0-100 (진행 중 퀘스트용)
  maxProgress?: number;
  currentProgress?: number;
  status: 'available' | 'inProgress' | 'completed';
  dueDate?: string;
}

function QuestPage() {
  const [selectedTab, setSelectedTab] = useState<'recommended' | 'inProgress' | 'completed'>('recommended');
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [showQuestModal, setShowQuestModal] = useState(false);
  const [realQuests, setRealQuests] = useState<QuestType[]>([]);
  const [financialData, setFinancialData] = useState<FinancialSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiRecommendedQuests, setAiRecommendedQuests] = useState<QuestRecommendation[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // Mock 퀘스트 데이터
  const [quests, setQuests] = useState<Quest[]>([
    {
      id: 1,
      title: '백준 알고리즘 문제 3개 풀기',
      description: '코딩 실력 향상을 위해 백준 온라인 저지에서 알고리즘 문제를 해결해보세요. 단계별로 접근하면 더 쉽게 풀 수 있습니다.',
      category: '학업',
      difficulty: 'medium',
      rewards: {
        credo: 50,
        xp: 100,
        skillType: '학업'
      },
      requirements: [
        '백준 계정 필요',
        '기본적인 프로그래밍 지식',
        '하루 내 완료 권장'
      ],
      timeLimit: 24,
      status: 'available'
    },
    {
      id: 2,
      title: '이번 달 지출 50만원 이하로 관리하기',
      description: '건전한 소비 습관을 기르고 재무 관리 능력을 향상시키세요. 매일 지출을 기록하고 예산을 지켜보세요.',
      category: '재무관리',
      difficulty: 'hard',
      rewards: {
        credo: 100,
        xp: 200,
        skillType: '재무관리'
      },
      requirements: [
        '신한카드 연동 필요',
        '매일 지출 확인',
        '월말까지 유지'
      ],
      timeLimit: 720, // 30일
      status: 'available'
    },
    {
      id: 3,
      title: '온라인 강의 1개 완주하기',
      description: 'Coursera, edX, 유데미 등에서 관심 분야의 강의를 선택하여 완주해보세요.',
      category: '자기계발',
      difficulty: 'easy',
      rewards: {
        credo: 30,
        xp: 80,
        skillType: '자기계발'
      },
      requirements: [
        '강의 플랫폼 가입',
        '주 3회 이상 수강',
        '수료증 획득'
      ],
      timeLimit: 168, // 7일
      status: 'available'
    },
    {
      id: 4,
      title: '동아리 프로젝트 완성하기',
      description: '팀원들과 협력하여 의미있는 프로젝트를 완성해보세요.',
      category: '대외활동',
      difficulty: 'medium',
      rewards: {
        credo: 75,
        xp: 150,
        skillType: '대외활동'
      },
      requirements: [
        '팀원 3명 이상',
        'GitHub 저장소 생성',
        '발표 자료 준비'
      ],
      currentProgress: 2,
      maxProgress: 5,
      status: 'inProgress',
      dueDate: '2024-09-15'
    },
    {
      id: 5,
      title: '도서관에서 10시간 자습하기',
      description: '집중력 향상과 학습 습관 형성을 위해 도서관에서 꾸준히 공부해보세요.',
      category: '학업',
      difficulty: 'easy',
      rewards: {
        credo: 40,
        xp: 90,
        skillType: '학업'
      },
      requirements: [
        '도서관 출입 인증',
        '연속 2시간 이상 이용',
        '주 3회 이상'
      ],
      currentProgress: 6,
      maxProgress: 10,
      status: 'inProgress',
      dueDate: '2024-08-30'
    },
    {
      id: 6,
      title: '영어 회화 스터디 참여',
      description: '영어 실력 향상을 위해 회화 스터디에 꾸준히 참여했습니다.',
      category: '자기계발',
      difficulty: 'medium',
      rewards: {
        credo: 60,
        xp: 120,
        skillType: '자기계발'
      },
      requirements: [
        '스터디 그룹 가입',
        '주 2회 참석',
        '4주 이상 지속'
      ],
      status: 'completed'
    }
  ]);

  useEffect(() => {
    loadQuestData();
    loadAIRecommendations();
  }, []);

  const loadQuestData = async () => {
    try {
      setIsLoading(true);
      
      // 사용자 토큰 가져오기
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) {
        console.log('❌ 토큰이 없어서 퀘스트 로딩 불가');
        return;
      }

      // 금융 데이터 로딩
      console.log('💰 퀘스트용 금융 데이터 로딩 시작');
      const summary = await financialService.getUserFinancialSummary(token);
      
      // summary가 유효한지 확인
      if (!summary || !summary.accounts || summary.accounts.length === 0) {
        console.log('⚠️ 금융 데이터가 없어서 기본 퀘스트만 표시');
        setFinancialData(null);
        setRealQuests([]);
        return;
      }
      
      setFinancialData(summary);

      // 최근 거래내역 로딩 (안전한 처리)
      let transactions = [];
      try {
        if (summary && summary.accounts && summary.accounts.length > 0) {
          transactions = await financialService.getRecentTransactionsWithToken(token, 30);
        } else {
          // 계좌 정보가 없으면 기본값으로 거래내역 조회
          transactions = await financialService.getRecentTransactionsWithToken(token, 30);
        }
      } catch (error) {
        console.log('⚠️ 거래내역 로딩 실패, 빈 배열 사용:', error);
        transactions = [];
      }

      // 개인화된 퀘스트 생성 (안전한 처리)
      let personalizedQuests = [];
      try {
        if (summary && transactions) {
          personalizedQuests = questService.generatePersonalizedQuests(summary, transactions);
        } else {
          personalizedQuests = [];
        }
      } catch (error) {
        console.log('⚠️ 개인화 퀘스트 생성 실패, 기본 퀘스트 사용:', error);
        personalizedQuests = [];
      }
      
      // 퀘스트 진행 상황 업데이트 (안전한 처리)
      let updatedQuests = [];
      try {
        if (personalizedQuests && transactions && summary) {
          updatedQuests = questService.updateQuestProgress(personalizedQuests, transactions, summary);
        } else {
          updatedQuests = personalizedQuests;
        }
      } catch (error) {
        console.log('⚠️ 퀘스트 진행상황 업데이트 실패, 원본 퀘스트 사용:', error);
        updatedQuests = personalizedQuests;
      }
      
      setRealQuests(updatedQuests);
      
      console.log('✅ 퀘스트 데이터 로딩 완료:', updatedQuests.length, '개 퀘스트');
      
    } catch (error) {
      // error 객체를 안전하게 처리
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ 퀘스트 데이터 로딩 실패:', errorMessage);
    } finally {
      setIsLoading(false);
    }
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

  // AI 추천 퀘스트 로드
  const loadAIRecommendations = async () => {
    try {
      setIsLoadingAI(true);
      const recommendations = await questRecommendationService.generatePersonalizedQuests(3);
      
      // 디버깅: 현재 퀘스트 상태 확인
      console.log('🔍 현재 realQuests 상태:', realQuests.map(q => ({
        title: q.title,
        isActive: q.isActive,
        isCompleted: q.isCompleted
      })));
      
      console.log('🔍 AI 추천 퀘스트 원본:', recommendations.map(q => ({
        title: q.title,
        description: q.description
      })));
      
      // 진행중이거나 완료된 퀘스트는 AI 추천에서 제외
      const filteredRecommendations = recommendations.filter(aiQuest => {
        const isInProgress = realQuests.some(realQuest => {
          // 제목과 설명을 모두 비교해서 더 정확한 매칭
          const titleMatch = realQuest.title === aiQuest.title;
          const descriptionMatch = realQuest.description === aiQuest.description;
          const isActiveOrCompleted = realQuest.isActive || realQuest.isCompleted;
          
          if (titleMatch || descriptionMatch) {
            console.log('🔍 퀘스트 매칭 발견:', {
              aiQuest: aiQuest.title,
              realQuest: realQuest.title,
              titleMatch,
              descriptionMatch,
              isActiveOrCompleted
            });
          }
          
          return (titleMatch || descriptionMatch) && isActiveOrCompleted;
        });
        
        if (isInProgress) {
          console.log('❌ AI 추천에서 제외 (진행중/완료):', aiQuest.title);
        }
        
        return !isInProgress;
      });
      
      setAiRecommendedQuests(filteredRecommendations);
      console.log('✅ AI 추천 퀘스트 로드 완료:', filteredRecommendations.length, '개 (필터링 후)');
    } catch (error) {
      console.error('❌ AI 추천 퀘스트 로드 실패:', error);
      setAiRecommendedQuests([]);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case '학업': return 'book-open';
      case '재무관리': return 'credit-card';
      case '자기계발': return 'trending-up';
      case '대외활동': return 'users';
      default: return 'target';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '학업': return '#3B82F6';
      case '재무관리': return '#10B981';
      case '자기계발': return '#8B5CF6';
      case '대외활동': return '#EC4899';
      default: return '#6B7280';
    }
  };

  const getFilteredQuests = () => {
    // 실제 퀘스트 데이터를 사용 (realQuests 우선, 없으면 Mock 데이터)
    const questsToUse = realQuests && realQuests.length > 0 ? realQuests : quests;
    
    if (realQuests && realQuests.length > 0) {
      // 실제 퀘스트 시스템 사용
      switch (selectedTab) {
        case 'recommended':
          // 추천 퀘스트 탭에서는 빈 배열 반환 (AI 추천 퀘스트는 별도 섹션에서 표시)
          return [];
        case 'inProgress':
          return questsToUse.filter(quest => quest.isActive && !quest.isCompleted);
        case 'completed':
          return questService.getCompletedQuests(questsToUse);
        default:
          return questsToUse;
      }
    } else {
      // Mock 데이터 사용
      return quests.filter(quest => quest.status === selectedTab || (selectedTab === 'recommended' && quest.status === 'available'));
    }
  };

  const handleQuestAction = (quest: Quest) => {
    if (quest.status === 'available') {
      Alert.alert(
        '퀘스트 수락',
        `"${quest.title}" 퀘스트를 시작하시겠습니까?`,
        [
          { text: '취소', style: 'cancel' },
          { 
            text: '수락', 
            onPress: () => {
              // 퀘스트 상태를 진행중으로 변경
              setQuests(prev => prev.map(q => 
                q.id === quest.id 
                  ? { ...q, status: 'inProgress' as const, currentProgress: 0 }
                  : q
              ));
              Alert.alert('퀘스트 시작!', '새로운 퀘스트가 시작되었습니다. 파이팅! 💪');
            }
          }
        ]
      );
    } else if (quest.status === 'inProgress') {
      setSelectedQuest(quest);
      setShowQuestModal(true);
    } else {
      Alert.alert('완료된 퀘스트', '이미 완료된 퀘스트입니다. 🎉');
    }
  };

  const handleQuestComplete = (quest: Quest) => {
    const credoReward = quest.rewards?.credo || 50;
    const xpReward = quest.rewards?.xp || 100;
    
    Alert.alert(
      '퀘스트 완료',
      `정말로 "${quest.title}" 퀘스트를 완료하시겠습니까?\n\n보상: ${credoReward} Credo, ${xpReward} XP`,
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '완료', 
          onPress: () => {
            setQuests(prev => prev.map(q => 
              q.id === quest.id 
                ? { ...q, status: 'completed' as const }
                : q
            ));
            setShowQuestModal(false);
            Alert.alert('축하합니다! 🎉', `퀘스트를 완료하여 ${credoReward} Credo를 획득했습니다!`);
          }
        }
      ]
    );
  };

  const QuestModal = () => (
    <Modal
      visible={showQuestModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowQuestModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowQuestModal(false)}>
            <Feather name="x" size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>퀘스트 상세</Text>
          <View style={{ width: 24 }} />
        </View>

        {selectedQuest && (
          <ScrollView style={styles.modalContent}>
            <View style={styles.questDetailCard}>
              <View style={styles.questDetailHeader}>
                <View style={styles.questCategory}>
                  <Feather 
                    name={getCategoryIcon(selectedQuest.category) as any} 
                    size={16} 
                    color={getCategoryColor(selectedQuest.category)} 
                  />
                  <Text style={[styles.questCategoryText, { color: getCategoryColor(selectedQuest.category) }]}>
                    {selectedQuest.category}
                  </Text>
                </View>
                <View style={[
                  styles.difficultyBadge, 
                  { backgroundColor: getDifficultyColor(selectedQuest.difficulty) }
                ]}>
                  <Text style={styles.difficultyText}>
                    {getDifficultyText(selectedQuest.difficulty)}
                  </Text>
                </View>
              </View>

              <Text style={styles.questDetailTitle}>{selectedQuest.title}</Text>
              <Text style={styles.questDetailDescription}>{selectedQuest.description}</Text>

              {/* 진행률 */}
              {selectedQuest.currentProgress !== undefined && selectedQuest.maxProgress && (
                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressTitle}>진행 상황</Text>
                    <Text style={styles.progressText}>
                      {selectedQuest.currentProgress}/{selectedQuest.maxProgress}
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${(selectedQuest.currentProgress / selectedQuest.maxProgress) * 100}%` }
                      ]} 
                    />
                  </View>
                </View>
              )}

              {/* 요구사항 */}
              <View style={styles.requirementsSection}>
                <Text style={styles.sectionTitle}>완료 조건</Text>
                {selectedQuest.requirements.map((req, index) => (
                  <View key={index} style={styles.requirementItem}>
                    <Feather name="check-circle" size={16} color="#10B981" />
                    <Text style={styles.requirementText}>{req}</Text>
                  </View>
                ))}
              </View>

              {/* 보상 */}
              <View style={styles.rewardsSection}>
                <Text style={styles.sectionTitle}>보상</Text>
                <View style={styles.rewardsList}>
                  <View style={styles.rewardItem}>
                    <Feather name="zap" size={16} color="#F59E0B" />
                    <Text style={styles.rewardText}>{selectedQuest.rewards?.credo || 50} Credo</Text>
                  </View>
                  <View style={styles.rewardItem}>
                    <Feather name="star" size={16} color="#8B5CF6" />
                    <Text style={styles.rewardText}>{selectedQuest.rewards?.xp || 100} XP</Text>
                  </View>
                  <View style={styles.rewardItem}>
                    <Feather name="trending-up" size={16} color="#3B82F6" />
                    <Text style={styles.rewardText}>{selectedQuest.rewards?.skillType || '기본'} 스킬</Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        )}

        <View style={styles.modalActions}>
          <TouchableOpacity 
            style={styles.completeButton}
            onPress={() => selectedQuest && handleQuestComplete(selectedQuest)}
          >
            <Feather name="check" size={20} color="white" />
            <Text style={styles.completeButtonText}>완료하기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );

  const handleRealQuestAction = (quest: QuestType) => {
    if (quest.isCompleted) {
      // 보상 받기
      const result = questService.claimQuestReward(quest);
      Alert.alert(
        result.success ? '보상 획득!' : '오류',
        result.message,
        [{ text: '확인' }]
      );
    } else if (quest.isActive) {
      // 퀘스트 진행 상황을 상세 모달로 표시
      const questForModal: Quest = {
        id: quest.id,
        title: quest.title,
        description: quest.description,
        category: quest.category,
        difficulty: quest.difficulty,
        reward: quest.reward,
        progress: quest.progress,
        isCompleted: quest.isCompleted,
        isActive: quest.isActive,
        trackingType: quest.trackingType,
        trackingParams: quest.trackingParams,
        status: 'inProgress',
        currentProgress: quest.progress.current,
        maxProgress: quest.progress.target,
        rewards: {
          credo: quest.reward.credo,
          xp: quest.reward.xp
        },
        requirements: [
          `${quest.progress.target.toLocaleString()}${quest.trackingType === 'balance_target' ? '원' : quest.trackingType === 'spending_limit' ? '원' : '건'} 달성하기`
        ]
      };
      
      setSelectedQuest(questForModal);
      setShowQuestModal(true);
    } else {
      // 퀘스트 활성화
      setRealQuests(prev => prev.map(q => 
        q.id === quest.id ? { ...q, isActive: true } : q
      ));
      Alert.alert(
        '퀘스트 시작!',
        `"${quest.title}" 퀘스트를 시작했습니다.`,
        [{ text: '확인' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        alwaysBounceVertical={false}
      >
        {/* 헤더 */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
          <Text style={styles.headerTitle}>퀘스트</Text>
          <Text style={styles.headerSubtitle}>도전하고 성장하세요!</Text>
        </Animated.View>

        {/* 탭 네비게이션 */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'recommended' && styles.tabActive]}
            onPress={() => setSelectedTab('recommended')}
          >
            <Text style={[styles.tabText, selectedTab === 'recommended' && styles.tabTextActive]}>
              추천 퀘스트
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'inProgress' && styles.tabActive]}
            onPress={() => setSelectedTab('inProgress')}
          >
            <Text style={[styles.tabText, selectedTab === 'inProgress' && styles.tabTextActive]}>
              진행중
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'completed' && styles.tabActive]}
            onPress={() => setSelectedTab('completed')}
          >
            <Text style={[styles.tabText, selectedTab === 'completed' && styles.tabTextActive]}>
              완료
            </Text>
          </TouchableOpacity>
        </Animated.View>


      {/* AI 추천 퀘스트 섹션 */}
      {selectedTab === 'recommended' && aiRecommendedQuests.length > 0 && (
        <Animated.View entering={FadeInDown.delay(250)} style={styles.aiRecommendationSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Feather name="cpu" size={20} color={colors.primary[500]} />
              <Text style={styles.sectionTitle}>AI 맞춤 추천</Text>
            </View>
            <Text style={styles.sectionSubtitle}>
              당신의 성장 패턴을 분석한 개인화된 퀘스트
            </Text>
          </View>
          
          {aiRecommendedQuests.map((quest, index) => (
            <TouchableOpacity
              key={quest.id}
              style={styles.aiQuestCard}
              onPress={() => {
                // AI 퀘스트 상세 모달 표시
                Alert.alert(
                  quest.title,
                  `${quest.description}\n\n${quest.aiReason}\n\n완료 조건:\n${quest.completionCriteria.join('\n')}\n\n보상: ${quest.xpReward} XP`,
                  [{ text: '확인' }]
                );
              }}
            >
              <View style={styles.aiQuestHeader}>
                <View style={styles.aiQuestCategory}>
                  <Feather 
                    name={getCategoryIcon(quest.category) as any} 
                    size={16} 
                    color={getCategoryColor(quest.category)} 
                  />
                  <Text style={[styles.aiQuestCategoryText, { color: getCategoryColor(quest.category) }]}>
                    {quest.category}
                  </Text>
                </View>
                <View style={[
                  styles.difficultyBadge, 
                  { backgroundColor: getDifficultyColor(quest.difficulty) }
                ]}>
                  <Text style={styles.difficultyText}>
                    {getDifficultyText(quest.difficulty)}
                  </Text>
                </View>
              </View>

              <Text style={styles.aiQuestTitle}>{quest.title}</Text>
              <Text style={styles.aiQuestDescription}>{quest.description}</Text>
              
              {/* AI 추천 이유 */}
              <View style={styles.aiReasonContainer}>
                <Feather name="zap" size={14} color={colors.warning[500]} />
                <Text style={styles.aiReasonText}>{quest.aiReason}</Text>
              </View>

              {/* 스킬 보상 */}
              <View style={styles.skillRewardsContainer}>
                <Text style={styles.skillRewardsTitle}>스킬 보상:</Text>
                {Object.entries(quest.skillRewards).map(([skillName, amount]) => (
                  <View key={skillName} style={styles.skillRewardItem}>
                    <Text style={styles.skillRewardText}>
                      {skillName} +{amount}XP
                    </Text>
                  </View>
                ))}
              </View>

              {/* 퀘스트 태그 */}
              <View style={styles.questTagsContainer}>
                {quest.tags.map((tag, tagIndex) => (
                  <View key={tagIndex} style={styles.questTag}>
                    <Text style={styles.questTagText}>{tag}</Text>
                  </View>
                ))}
              </View>

              {/* 보상 및 시간 */}
              <View style={styles.aiQuestFooter}>
                <View style={styles.aiQuestRewards}>
                  <View style={styles.rewardItem}>
                    <Feather name="zap" size={14} color={colors.warning[500]} />
                    <Text style={styles.rewardText}>{quest.xpReward} XP</Text>
                  </View>
                  <View style={styles.rewardItem}>
                    <Feather name="clock" size={14} color={colors.neutral[500]} />
                    <Text style={styles.rewardText}>{quest.estimatedDuration}분</Text>
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={styles.startAIQuestButton}
                  onPress={() => {
                    // AI 퀘스트 시작 로직
                    Alert.alert(
                      '퀘스트 시작',
                      `"${quest.title}" 퀘스트를 시작하시겠습니까?`,
                      [
                        { text: '취소', style: 'cancel' },
                        { 
                          text: '시작', 
                          onPress: () => {
                            // AI 퀘스트를 실제 퀘스트로 변환하여 추가
                            const newQuest = {
                              id: quest.id,
                              title: quest.title,
                              description: quest.description,
                              category: quest.category,
                              difficulty: quest.difficulty,
                              reward: {
                                credo: quest.xpReward * 0.5,
                                xp: quest.xpReward,
                                skillName: Object.keys(quest.skillRewards)[0] || '일반'
                              },
                              progress: {
                                current: 0,
                                target: 1,
                                percentage: 0
                              },
                              isCompleted: false,
                              isActive: true,
                              trackingType: 'transaction_count' as const,
                              trackingParams: {},
                              status: 'inProgress' as const,
                              currentProgress: 0,
                              rewards: {
                                credo: quest.xpReward * 0.5,
                                xp: quest.xpReward
                              }
                            };
                            
                            // realQuests에 새 퀘스트 추가
                            setRealQuests(prev => [...prev, newQuest]);
                            
                            // AI 추천에서 해당 퀘스트 제거
                            setAiRecommendedQuests(prev => 
                              prev.filter(q => q.id !== quest.id)
                            );
                            
                            Alert.alert('퀘스트 시작!', '새로운 퀘스트가 시작되었습니다. 파이팅! 💪');
                          }
                        }
                      ]
                    );
                  }}
                >
                  <Text style={styles.startAIQuestButtonText}>시작하기</Text>
                  <Feather name="arrow-right" size={16} color={colors.white} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}

        {/* 퀘스트 리스트 */}
        <View style={styles.questContainer}>
          {getFilteredQuests().map((quest, index) => {
            // 실제 퀘스트 데이터인지 확인
            const isRealQuest = realQuests.length > 0;
            
            return (
              <Animated.View 
                key={isRealQuest ? quest.id : (quest as any).id}
                entering={FadeInDown.delay(300 + index * 100)}
              >
                <TouchableOpacity 
                  style={styles.questCard}
                  onPress={() => isRealQuest ? handleRealQuestAction(quest as QuestType) : handleQuestAction(quest as Quest)}
                >
                  <View style={styles.questHeader}>
                    <View style={styles.questCategory}>
                      <Feather 
                        name={getCategoryIcon(isRealQuest ? quest.category : (quest as Quest).category) as any} 
                        size={16} 
                        color={getCategoryColor(isRealQuest ? quest.category : (quest as Quest).category)} 
                      />
                      <Text style={[styles.questCategoryText, { color: getCategoryColor(isRealQuest ? quest.category : (quest as Quest).category) }]}>
                        {isRealQuest ? quest.category : (quest as Quest).category}
                      </Text>
                    </View>
                    <View style={[
                      styles.difficultyBadge, 
                      { backgroundColor: getDifficultyColor(quest.difficulty) }
                    ]}>
                      <Text style={styles.difficultyText}>
                        {getDifficultyText(quest.difficulty)}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.questTitle}>{quest.title}</Text>
                  <Text style={styles.questDescription}>{quest.description}</Text>

                  {/* 실제 퀘스트의 진행률 표시 */}
                  {isRealQuest && (quest as QuestType).progress && (
                    <View style={styles.progressSection}>
                      <View style={styles.progressBar}>
                        <View 
                          style={[
                            styles.progressFill, 
                            { width: `${Math.min((quest as QuestType).progress.percentage, 100)}%` }
                          ]} 
                        />
                      </View>
                      <Text style={styles.progressText}>
                        {(quest as QuestType).progress.current.toLocaleString()} / {(quest as QuestType).progress.target.toLocaleString()}
                        {(quest as QuestType).trackingType === 'balance_target' && '원'}
                        {(quest as QuestType).trackingType === 'spending_limit' && '원'}
                        {(quest as QuestType).trackingType === 'transaction_count' && '건'}
                      </Text>
                    </View>
                  )}

                {/* 진행률 (진행중 퀘스트만) */}
                {quest.status === 'inProgress' && quest.currentProgress !== undefined && quest.maxProgress && (
                  <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressTitle}>진행률</Text>
                      <Text style={styles.progressText}>
                        {quest.currentProgress}/{quest.maxProgress}
                      </Text>
                    </View>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { width: `${(quest.currentProgress / quest.maxProgress) * 100}%` }
                        ]} 
                      />
                    </View>
                  </View>
                )}

                {/* 보상 */}
                <View style={styles.questRewards}>
                  <View style={styles.rewardItem}>
                    <Feather name="zap" size={12} color="#F59E0B" />
                    <Text style={styles.rewardText}>
                      +{isRealQuest 
                        ? ((quest as QuestType).rewards?.credo || 50)
                        : ((quest as Quest).rewards?.credo || 50)
                      } Credo
                    </Text>
                  </View>
                  <View style={styles.rewardItem}>
                    <Feather name="star" size={12} color="#8B5CF6" />
                    <Text style={styles.rewardText}>
                      +{isRealQuest 
                        ? ((quest as QuestType).rewards?.xp || 100)
                        : ((quest as Quest).rewards?.xp || 100)
                      } XP
                    </Text>
                  </View>
                </View>

                {/* 액션 버튼 */}
                <View style={styles.questAction}>
                  {quest.status === 'available' && (
                    <>
                      <Text style={styles.actionButtonText}>수락하기</Text>
                      <Feather name="plus" size={16} color="white" />
                    </>
                  )}
                  {quest.status === 'inProgress' && (
                    <>
                      <Text style={styles.actionButtonText}>상세보기</Text>
                      <Feather name="arrow-right" size={16} color="white" />
                    </>
                  )}
                  {quest.status === 'completed' && (
                    <>
                      <Text style={styles.actionButtonText}>완료됨</Text>
                      <Feather name="check" size={16} color="white" />
                    </>
                  )}
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
          })}
        </View>

        {/* 하단 패딩 - 하단 네비게이션과 겹치지 않도록 충분한 여백 확보 */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* 하단 네비게이션 */}
      <CampusCredoBottomNav />
      
      <QuestModal />
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabTextActive: {
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  questList: {
    flex: 1,
  },
  questContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 16,
  },
  questCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  questHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  questCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  questCategoryText: {
    fontSize: 12,
    fontWeight: '500',
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
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  questDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  questRewards: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 4,
  },
  questAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  questDetailCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  questDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  questDetailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  questDetailDescription: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 24,
  },
  requirementsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
  rewardsSection: {
    marginBottom: 20,
  },
  rewardsList: {
    flexDirection: 'row',
    gap: 20,
  },
  modalActions: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // AI 추천 퀘스트 스타일
  aiRecommendationSection: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  
  sectionHeader: {
    marginBottom: 16,
  },
  
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.neutral[800],
  },
  
  sectionSubtitle: {
    fontSize: 14,
    color: colors.neutral[600],
    fontStyle: 'italic',
  },
  
  aiQuestCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.primary[200],
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  
  aiQuestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  aiQuestCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  
  aiQuestCategoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  
  aiQuestTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.neutral[900],
    marginBottom: 4,
    lineHeight: 20,
  },
  
  aiQuestDescription: {
    fontSize: 14,
    color: colors.neutral[700],
    marginBottom: 8,
    lineHeight: 24,
  },
  
  aiReasonContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    backgroundColor: colors.warning[50],
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  
  aiReasonText: {
    fontSize: 12,
    color: colors.warning[700],
    flex: 1,
    lineHeight: 15,
  },
  
  skillRewardsContainer: {
    marginBottom: 8,
  },
  
  skillRewardsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral[700],
    marginBottom: 4,
  },
  
  skillRewardItem: {
    marginBottom: 4,
  },
  
  skillRewardText: {
    fontSize: 12,
    color: colors.success[600],
    fontWeight: '500',
  },
  
  questTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 8,
  },
  
  questTag: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 8,
  },
  
  questTagText: {
    fontSize: 12,
    color: colors.primary[700],
    fontWeight: '500',
  },
  
  aiQuestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  aiQuestRewards: {
    flexDirection: 'row',
    gap: 16,
  },
  
  startAIQuestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary[500],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  
  startAIQuestButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
});

export default QuestPage;
