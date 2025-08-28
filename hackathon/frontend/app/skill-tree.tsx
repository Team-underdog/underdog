import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CampusCredoBottomNav } from '../components/CampusCredoBottomNav';
import { ModernSkillTree } from '../components/skill-tree/ModernSkillTree';
import { HollandProfileChart } from '../components/skill-tree/HollandProfileChart';
import { colors, typography, spacing, shadows, borderRadius } from '../components/ui/theme';

const { width: screenWidth } = Dimensions.get('window');

interface SkillNode {
  id: string;
  name: string;
  level: number;
  maxLevel: number;
  currentXP: number;
  maxXP: number;
  category: string;
  icon: string;
  color: string;
  description: string;
  benefits: string[];
  unlocked: boolean;
  position: { x: number; y: number };
  connections: string[];
}

export default function SkillTreePage() {
  const [showHollandProfile, setShowHollandProfile] = useState(false);
  const [totalLevel, setTotalLevel] = useState(0);
  const [totalXP, setTotalXP] = useState(0);

  // Mock Holland 성향 프로필 데이터
  const mockHollandProfile = {
    R: 65, // 현실형
    I: 85, // 탐구형
    A: 45, // 예술형
    S: 70, // 사회형
    E: 60, // 진취형
    C: 40, // 관습형
  };

  // Mock 스킬 트리 데이터 (새로운 구조)
  const skillTree: SkillNode[] = [
    // 학업 스킬
    {
      id: 'academic_1',
      name: '출석관리',
      level: 8,
      maxLevel: 10,
      currentXP: 800,
      maxXP: 1000,
      category: '학업',
      icon: '📚',
      color: '#6366f1',
      description: '꾸준한 출석으로 학업 의지를 보여주는 기본 스킬',
      benefits: ['출석 보상 +20%', 'Credo 보너스 +5'],
      unlocked: true,
      position: { x: 200, y: 150 },
      connections: ['academic_2']
    },
    {
      id: 'academic_2',
      name: '시험준비',
      level: 6,
      maxLevel: 10,
      currentXP: 600,
      maxXP: 1000,
      category: '학업',
      icon: '📚',
      color: '#6366f1',
      description: '체계적인 시험 준비로 학업 성취도를 높이는 스킬',
      benefits: ['학습 효율 +15%', '시험 보상 +25%'],
      unlocked: true,
      position: { x: 400, y: 200 },
      connections: ['academic_1', 'academic_3']
    },
    {
      id: 'academic_3',
      name: '프로젝트 수행',
      level: 4,
      maxLevel: 10,
      currentXP: 400,
      maxXP: 1000,
      category: '학업',
      icon: '📚',
      color: '#6366f1',
      description: '팀 프로젝트와 과제 수행 능력',
      benefits: ['팀워크 +20%', '창의성 +15%'],
      unlocked: true,
      position: { x: 600, y: 150 },
      connections: ['academic_2']
    },
    
    // 금융 스킬
    {
      id: 'financial_1',
      name: '예산관리',
      level: 7,
      maxLevel: 10,
      currentXP: 700,
      maxXP: 1000,
      category: '금융',
      icon: '💰',
      color: '#10b981',
      description: '체계적인 예산 계획과 지출 관리',
      benefits: ['지출 효율 +25%', '저축 보너스 +30%'],
      unlocked: true,
      position: { x: 150, y: 350 },
      connections: ['financial_2']
    },
    {
      id: 'financial_2',
      name: '투자기초',
      level: 5,
      maxLevel: 10,
      currentXP: 500,
      maxXP: 1000,
      category: '금융',
      icon: '💰',
      color: '#10b981',
      description: '기본적인 투자 상품 이해와 리스크 관리',
      benefits: ['투자 수익 +15%', '리스크 감소 +20%'],
      unlocked: true,
      position: { x: 350, y: 400 },
      connections: ['financial_1', 'financial_3']
    },
    {
      id: 'financial_3',
      name: '신용관리',
      level: 3,
      maxLevel: 10,
      currentXP: 300,
      maxXP: 1000,
      category: '금융',
      icon: '💰',
      color: '#10b981',
      description: '신용점수 향상과 대출 관리',
      benefits: ['신용점수 +50', '대출 이율 -10%'],
      unlocked: true,
      position: { x: 550, y: 350 },
      connections: ['financial_2']
    },
    
    // 건강 스킬
    {
      id: 'health_1',
      name: '운동습관',
      level: 6,
      maxLevel: 10,
      currentXP: 600,
      maxXP: 1000,
      category: '건강',
      icon: '💪',
      color: '#f59e0b',
      description: '규칙적인 운동과 체력 관리',
      benefits: ['체력 +20%', '스트레스 감소 +25%'],
      unlocked: true,
      position: { x: 650, y: 300 },
      connections: ['health_2']
    },
    {
      id: 'health_2',
      name: '영양관리',
      level: 4,
      maxLevel: 10,
      currentXP: 400,
      maxXP: 1000,
      category: '건강',
      icon: '💪',
      color: '#f59e0b',
      description: '균형 잡힌 영양소 섭취와 식단 관리',
      benefits: ['에너지 +30%', '면역력 +20%'],
      unlocked: true,
      position: { x: 750, y: 350 },
      connections: ['health_1']
    },
    
    // 사회 스킬
    {
      id: 'social_1',
      name: '의사소통',
      level: 8,
      maxLevel: 10,
      currentXP: 800,
      maxXP: 1000,
      category: '사회',
      icon: '🤝',
      color: '#8b5cf6',
      description: '효과적인 의사전달과 경청 능력',
      benefits: ['협업 효율 +25%', '관계 개선 +30%'],
      unlocked: true,
      position: { x: 100, y: 250 },
      connections: ['social_2']
    },
    {
      id: 'social_2',
      name: '리더십',
      level: 5,
      maxLevel: 10,
      currentXP: 500,
      maxXP: 1000,
      category: '사회',
      icon: '🤝',
      color: '#8b5cf6',
      description: '팀을 이끌고 목표를 달성하는 능력',
      benefits: ['팀 성과 +20%', '동기부여 +25%'],
      unlocked: true,
      position: { x: 250, y: 300 },
      connections: ['social_1']
    },
    
    // 창의 스킬
    {
      id: 'creative_1',
      name: '아이디어 발상',
      level: 7,
      maxLevel: 10,
      currentXP: 700,
      maxXP: 1000,
      category: '창의',
      icon: '🎨',
      color: '#ec4899',
      description: '창의적인 아이디어를 생성하고 발전시키는 능력',
      benefits: ['창의성 +30%', '문제해결 +25%'],
      unlocked: true,
      position: { x: 500, y: 100 },
      connections: ['creative_2']
    },
    {
      id: 'creative_2',
      name: '디자인 사고',
      level: 4,
      maxLevel: 10,
      currentXP: 400,
      maxXP: 1000,
      category: '창의',
      icon: '🎨',
      color: '#ec4899',
      description: '사용자 중심의 문제 해결 방법론',
      benefits: ['사용자 경험 +20%', '혁신 +15%'],
      unlocked: true,
      position: { x: 700, y: 100 },
      connections: ['creative_1']
    }
  ];

  useEffect(() => {
    // 전체 레벨과 XP 계산
    const total = skillTree.reduce((sum, skill) => sum + skill.level, 0);
    const totalExp = skillTree.reduce((sum, skill) => sum + skill.currentXP, 0);
    setTotalLevel(total);
    setTotalXP(totalExp);
  }, []);

  const handleSkillPress = (skill: SkillNode) => {
    console.log('스킬 선택:', skill.name);
    // 여기에 스킬 상세 정보나 퀘스트 연동 로직 추가
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>스킬 트리</Text>
        <TouchableOpacity
          style={styles.hollandButton}
          onPress={() => setShowHollandProfile(!showHollandProfile)}
        >
          <Feather name="bar-chart-2" size={20} color={colors.primary[500]} />
          <Text style={styles.hollandButtonText}>성향 분석</Text>
        </TouchableOpacity>
      </View>

      {/* 통계 카드 */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalLevel}</Text>
          <Text style={styles.statLabel}>총 레벨</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalXP.toLocaleString()}</Text>
          <Text style={styles.statLabel}>총 XP</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{skillTree.length}</Text>
          <Text style={styles.statLabel}>활성 스킬</Text>
        </View>
      </View>

      {/* Holland 성향 차트 (토글) */}
      {showHollandProfile && (
        <View style={styles.hollandSection}>
          <HollandProfileChart profile={mockHollandProfile} />
        </View>
      )}

      {/* 스킬 트리 */}
      <View style={styles.skillTreeContainer}>
        <ModernSkillTree
          skills={skillTree}
          onSkillPress={handleSkillPress}
        />
      </View>

      {/* 하단 네비게이션 */}
      <CampusCredoBottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  
  title: {
    fontSize: typography.heading.fontSize.xl,
    fontWeight: typography.heading.fontWeight.bold,
    color: colors.neutral[900],
  },
  
  hollandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  
  hollandButtonText: {
    fontSize: typography.body.fontSize.sm,
    fontWeight: typography.body.fontWeight.medium,
    color: colors.primary[500],
  },
  
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[200],
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  
  statValue: {
    fontSize: typography.heading.fontSize.lg,
    fontWeight: typography.heading.fontWeight.bold,
    color: colors.primary[600],
    marginBottom: spacing.xs,
  },
  
  statLabel: {
    fontSize: typography.body.fontSize.xs,
    color: colors.neutral[600],
    fontWeight: typography.body.fontWeight.medium,
  },
  
  hollandSection: {
    backgroundColor: 'white',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  
  skillTreeContainer: {
    flex: 1,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: colors.neutral[200],
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
});
