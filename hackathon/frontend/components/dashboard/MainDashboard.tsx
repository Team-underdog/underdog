import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import PlayerStatus from './PlayerStatus';
import CampusCredoScore from './CampusCredoScore';
import TodaysQuests from './TodaysQuests';
import { GrowthHighlight } from './GrowthHighlight';
import { HollandProfileChart } from '../skill-tree/HollandProfileChart';
import { colors, typography, spacing, shadows, borderRadius } from '../ui/theme';
import { formatKRW, formatKRWWithUnit } from '../../utils/currency';
import { Feather } from '@expo/vector-icons';
// 목업 데이터
const mockPlayerData = {
  nickname: '성장하는 학생',
  level: 15,
  currentXP: 12500,
  nextLevelXP: 15000,
  avatar: null,
};

const mockCredoData = {
  totalScore: 2850,
  grade: 'A+',
  rankPercentage: 25.5,
};

const mockQuests = [
  {
    id: '1',
    title: '학업 성실성 증명',
    description: '이번 학기 출석률 90% 이상 달성하기',
    xpReward: 200,
    skillRewards: { '성실도': 100, '자기개발능력': 100 },
    difficulty: '보통',
    progress: 0,
    status: 'available' as const,
  },
  {
    id: '2',
    title: '저축 습관 형성',
    description: '연속 3개월 월 저축률 20% 이상 달성하기',
    xpReward: 300,
    skillRewards: { '자원관리능력': 150, '직업윤리': 150 },
    difficulty: '어려움',
    progress: 45,
    status: 'in_progress' as const,
  },
  {
    id: '3',
    title: '탐구형 성향 강화',
    description: '연구 논문 1편 읽고 요약하기',
    xpReward: 150,
    skillRewards: { '탐구능력': 100, '정보능력': 50 },
    difficulty: '쉬움',
    progress: 0,
    status: 'available' as const,
  },
];

// 성장 하이라이트 데이터
const mockTopSkills = [
  {
    id: '1',
    name: '자기개발능력',
    level: 8,
    maxLevel: 10,
    experience: 8500,
    category: '자기개발능력',
    icon: 'trending-up',
    color: colors.accent.purple,
  },
  {
    id: '2',
    name: '의사소통능력',
    level: 7,
    maxLevel: 10,
    experience: 7200,
    category: '의사소통능력',
    icon: 'message-circle',
    color: colors.primary[500],
  },
  {
    id: '3',
    name: '문제해결능력',
    level: 6,
    maxLevel: 10,
    experience: 6500,
    category: '문제해결능력',
    icon: 'target',
    color: colors.warning[500],
  },
];

// Holland 성향 프로필 데이터
const mockHollandProfile = {
  R: 65, // 현실형
  I: 85, // 탐구형
  A: 45, // 예술형
  S: 70, // 사회형
  E: 60, // 진취형
  C: 40, // 관습형
};

interface MainDashboardProps {
  onNavigateToSkillTree?: () => void;
  onNavigateToChronicle?: () => void;
  onNavigateToQuests?: () => void;
  onNavigateToProfile?: () => void;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({
  onNavigateToSkillTree,
  onNavigateToChronicle,
  onNavigateToQuests,
  onNavigateToProfile,
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const [playerData, setPlayerData] = useState(mockPlayerData);
  const [credoData, setCredoData] = useState(mockCredoData);
  const [quests, setQuests] = useState(mockQuests);
  const [showHollandProfile, setShowHollandProfile] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: 실제 API 호출로 데이터 새로고침
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleQuestPress = (quest: any) => {
    console.log('퀘스트 상세 보기:', quest.title);
    // TODO: 퀘스트 상세 모달 또는 화면으로 이동
  };

  const handleStartQuest = (quest: any) => {
    if (quest.status === 'available') {
      // 퀘스트 시작 로직
      const updatedQuests = quests.map(q => 
        q.id === quest.id 
          ? { ...q, status: 'in_progress' as const, progress: 0 }
          : q
      );
      setQuests(updatedQuests);
      console.log('퀘스트 시작:', quest.title);
    } else if (quest.status === 'in_progress') {
      // 퀘스트 진행 상황 업데이트
      console.log('퀘스트 진행 상황 확인:', quest.title);
    }
  };

  const handleSkillPress = (skill: any) => {
    console.log('스킬 상세 보기:', skill.name);
    onNavigateToSkillTree?.();
  };

  const handleViewAllSkills = () => {
    onNavigateToSkillTree?.();
  };

  const toggleHollandProfile = () => {
    setShowHollandProfile(!showHollandProfile);
  };

  const handleCredoPress = () => {
    console.log('캠퍼스 크레도 상세 분석');
    // TODO: 크레도 상세 분석 화면으로 이동
  };

  const handleAvatarPress = () => {
    console.log('프로필 화면으로 이동');
    onNavigateToProfile?.();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary[500]]}
          tintColor={colors.primary[500]}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* 상단 환영 메시지 */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>
          안녕하세요, {playerData.nickname}님! 👋
        </Text>
        <Text style={styles.welcomeSubtitle}>
          오늘도 성장하는 하루를 만들어보세요
        </Text>
      </View>

      {/* 상단 핵심 위젯들 */}
      <View style={styles.topSection}>
        {/* 플레이어 상태 */}
        <View style={styles.playerStatusContainer}>
          <PlayerStatus
            nickname={playerData.nickname}
            level={playerData.level}
            currentXP={playerData.currentXP}
            nextLevelXP={playerData.nextLevelXP}
            avatar={playerData.avatar}
            onAvatarPress={handleAvatarPress}
          />
        </View>

        {/* 캠퍼스 크레도 */}
        <View style={styles.credoContainer}>
          <CampusCredoScore
            totalScore={credoData.totalScore}
            grade={credoData.grade}
            rankPercentage={credoData.rankPercentage}
            onPress={handleCredoPress}
          />
        </View>
      </View>

      {/* 오늘의 퀘스트 */}
      <View style={styles.questsSection}>
        <TodaysQuests
          quests={quests}
          onQuestPress={handleQuestPress}
          onStartQuest={handleStartQuest}
        />
      </View>

      {/* 최근 크로니클 */}
      <View style={styles.chronicleSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>최근 크로니클</Text>
          <Text style={styles.sectionSubtitle}>
            자동으로 기록된 성장 활동들
          </Text>
        </View>
        
        <View style={styles.chronicleCards}>
          <View style={styles.chronicleCard}>
            <View style={styles.chronicleIcon}>
              <Text style={styles.chronicleIconText}>📚</Text>
            </View>
            <View style={styles.chronicleContent}>
              <Text style={styles.chronicleTitle}>중앙도서관에서 2시간 집중 학습</Text>
              <Text style={styles.chronicleTime}>오후 2:00</Text>
              <View style={styles.chronicleRewards}>
                <Text style={styles.chronicleReward}>+10 Credo</Text>
                <Text style={styles.chronicleReward}>자기개발능력 +50XP</Text>
              </View>
            </View>
          </View>

          <View style={styles.chronicleCard}>
            <View style={styles.chronicleIcon}>
              <Text style={styles.chronicleIconText}>💰</Text>
            </View>
            <View style={styles.chronicleContent}>
              <Text style={styles.chronicleTitle}>월 저축 목표 달성</Text>
              <Text style={styles.chronicleTime}>오전 9:00</Text>
              <View style={styles.chronicleRewards}>
                <Text style={styles.chronicleReward}>+15 Credo</Text>
                <Text style={styles.chronicleReward}>자원관리능력 +75XP</Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.moreButton}
          onPress={onNavigateToChronicle}
        >
          <Text style={styles.moreButtonText}>전체 크로니클 보기</Text>
          <Text style={styles.moreButtonIcon}>→</Text>
        </TouchableOpacity>
      </View>

      {/* 성장 하이라이트 위젯 */}
      <GrowthHighlight
        topSkills={mockTopSkills}
        onSkillPress={handleSkillPress}
        onViewAllPress={handleViewAllSkills}
      />

      {/* Holland 성향 프로필 차트 */}
      <HollandProfileChart
        profile={mockHollandProfile}
        isVisible={showHollandProfile}
      />

      {/* 성향 분석 토글 버튼 */}
      <TouchableOpacity
        style={styles.hollandToggleButton}
        onPress={toggleHollandProfile}
      >
        <Text style={styles.hollandToggleText}>
          {showHollandProfile ? '성향 분석 숨기기' : '성향 분석 보기'}
        </Text>
        <Feather 
          name={showHollandProfile ? 'eye-off' : 'eye'} 
          size={20} 
          color={colors.primary[500]} 
        />
      </TouchableOpacity>

      {/* 성장 하이라이트 */}
      <View style={styles.highlightsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>성장 하이라이트</Text>
          <Text style={styles.sectionSubtitle}>
            현재 가장 높은 레벨의 NCS 스킬
          </Text>
        </View>
        
        <View style={styles.highlightsGrid}>
          <View style={styles.highlightCard}>
            <View style={styles.highlightIcon}>
              <Text style={styles.highlightIconText}>💬</Text>
            </View>
            <Text style={styles.highlightName}>의사소통능력</Text>
            <View style={styles.highlightLevel}>
              <Text style={styles.highlightLevelText}>Lv. 8</Text>
            </View>
            <View style={styles.highlightProgress}>
              <View 
                style={[
                  styles.highlightProgressFill, 
                  { width: '75%' }
                ]} 
              />
            </View>
          </View>

          <View style={styles.highlightCard}>
            <View style={styles.highlightIcon}>
              <Text style={styles.highlightIconText}>🔍</Text>
            </View>
            <Text style={styles.highlightName}>정보능력</Text>
            <View style={styles.highlightLevel}>
              <Text style={styles.highlightLevelText}>Lv. 7</Text>
            </View>
            <View style={styles.highlightProgress}>
              <View 
                style={[
                  styles.highlightProgressFill, 
                  { width: '60%' }
                ]} 
              />
            </View>
          </View>

          <View style={styles.highlightCard}>
            <View style={styles.highlightIcon}>
              <Text style={styles.highlightIconText}>⚙️</Text>
            </View>
            <Text style={styles.highlightName}>기술능력</Text>
            <View style={styles.highlightLevel}>
              <Text style={styles.highlightLevelText}>Lv. 6</Text>
            </View>
            <View style={styles.highlightProgress}>
              <View 
                style={[
                  styles.highlightProgressFill, 
                  { width: '45%' }
                ]} 
              />
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.moreButton}
          onPress={onNavigateToSkillTree}
        >
          <Text style={styles.moreButtonText}>전체 스킬 트리 보기</Text>
          <Text style={styles.moreButtonIcon}>→</Text>
        </TouchableOpacity>
      </View>

      {/* 하단 여백 */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[100],
  },
  
  contentContainer: {
    padding: spacing.md,
  },
  
  welcomeSection: {
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.neutral[800],
    marginBottom: spacing.xs,
  },
  
  welcomeSubtitle: {
    fontSize: 16,
    color: colors.neutral[600],
    lineHeight: 20,
  },
  
  topSection: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  
  playerStatusContainer: {
    flex: 1,
  },
  
  credoContainer: {
    flex: 1,
  },
  
  questsSection: {
    marginBottom: spacing.lg,
  },
  
  chronicleSection: {
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  
  sectionHeader: {
    marginBottom: spacing.md,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.neutral[800],
    marginBottom: spacing.xs,
  },
  
  sectionSubtitle: {
    fontSize: 14,
    color: colors.neutral[600],
    fontStyle: 'italic',
  },
  
  chronicleCards: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  
  chronicleCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  
  chronicleIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  
  chronicleIconText: {
    fontSize: 24,
  },
  
  chronicleContent: {
    flex: 1,
  },
  
  chronicleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[800],
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  
  chronicleTime: {
    fontSize: 14,
    color: colors.neutral[500],
    marginBottom: spacing.xs,
  },
  
  chronicleRewards: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  
  chronicleReward: {
    fontSize: 12,
    color: colors.success[600],
    backgroundColor: colors.success[100],
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.success[200],
  },
  
  highlightsSection: {
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  
  highlightsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  
  highlightCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[200],
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  
  highlightIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  
  highlightIconText: {
    fontSize: 20,
  },
  
  highlightName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[800],
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  
  highlightLevel: {
    backgroundColor: colors.warning[100],
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  
  highlightLevelText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.warning[700],
  },
  
  highlightProgress: {
    width: '100%',
    height: 4,
    backgroundColor: colors.neutral[200],
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  
  highlightProgressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.md,
  },
  
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral[300],
  },
  
  moreButtonText: {
    fontSize: 14,
    color: colors.neutral[600],
    fontWeight: '500',
    marginRight: spacing.xs,
  },
  
  moreButtonIcon: {
    fontSize: 14,
    color: colors.neutral[600],
    fontWeight: 'bold',
  },
  
  hollandToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary[200],
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  
  hollandToggleText: {
    fontSize: 16,
    color: colors.primary[700],
    fontWeight: '500',
    marginRight: spacing.sm,
  },
  
  bottomSpacing: {
    height: spacing.xl,
  },
});

export default MainDashboard;
