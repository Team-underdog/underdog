import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, typography, spacing, shadows, borderRadius } from '../ui/theme';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface SkillHighlight {
  id: string;
  name: string;
  level: number;
  maxLevel: number;
  experience: number;
  category: string;
  icon: string;
  color: string;
}

interface GrowthHighlightProps {
  topSkills: SkillHighlight[];
  onSkillPress?: (skill: SkillHighlight) => void;
  onViewAllPress?: () => void;
}

export const GrowthHighlight: React.FC<GrowthHighlightProps> = ({
  topSkills,
  onSkillPress,
  onViewAllPress,
}) => {
  const getSkillIcon = (iconName: string) => {
    const iconMap: { [key: string]: string } = {
      'communication': 'message-circle',
      'mathematics': 'calculator',
      'problem-solving': 'target',
      'self-development': 'trending-up',
      'resource-management': 'database',
      'interpersonal': 'users',
      'information': 'info',
      'technology': 'code',
      'organization': 'layers',
      'ethics': 'award',
    };
    return iconMap[iconName] || 'star';
  };

  const getSkillColor = (category: string) => {
    const colorMap: { [key: string]: string } = {
      '의사소통능력': colors.primary[500],
      '수리능력': colors.success[500],
      '문제해결능력': colors.warning[500],
      '자기개발능력': colors.accent.purple,
      '자원관리능력': colors.accent.cyan,
      '대인관계능력': colors.accent.pink,
      '정보능력': colors.accent.lime,
      '기술능력': colors.accent.orange,
      '조직이해능력': colors.primary[600],
      '직업윤리': colors.success[600],
    };
    return colorMap[category] || colors.neutral[500];
  };

  const getProgressPercentage = (experience: number, level: number, maxLevel: number) => {
    const currentLevelXP = (level - 1) * 1000; // 각 레벨당 1000 XP 가정
    const nextLevelXP = level * 1000;
    const progress = experience - currentLevelXP;
    const levelXP = nextLevelXP - currentLevelXP;
    return Math.min((progress / levelXP) * 100, 100);
  };

  return (
    <Animated.View style={styles.container} entering={FadeInUp.delay(300)}>
      <View style={styles.header}>
        <Text style={styles.title}>성장 하이라이트</Text>
        <TouchableOpacity onPress={onViewAllPress} style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>전체보기</Text>
          <Feather name="chevron-right" size={16} color={colors.primary[500]} />
        </TouchableOpacity>
      </View>

      <View style={styles.skillsContainer}>
        {topSkills.map((skill, index) => (
          <TouchableOpacity
            key={skill.id}
            style={styles.skillCard}
            onPress={() => onSkillPress?.(skill)}
            activeOpacity={0.7}
          >
            <View style={styles.skillHeader}>
              <View style={[styles.skillIcon, { backgroundColor: getSkillColor(skill.category) }]}>
                <Feather name={getSkillIcon(skill.icon) as any} size={20} color="white" />
              </View>
              <View style={styles.skillInfo}>
                <Text style={styles.skillName} numberOfLines={1}>
                  {skill.category}
                </Text>
                <Text style={styles.skillLevel}>
                  Lv.{skill.level} / {skill.maxLevel}
                </Text>
              </View>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${getProgressPercentage(skill.experience, skill.level, skill.maxLevel)}%`,
                      backgroundColor: getSkillColor(skill.category),
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {skill.experience.toLocaleString()} XP
              </Text>
            </View>

            <View style={styles.skillStats}>
              <View style={styles.statItem}>
                <Feather name="trending-up" size={14} color={colors.success[500]} />
                <Text style={styles.statText}>
                  {skill.level === skill.maxLevel ? 'MAX' : `다음 레벨까지 ${1000 - (skill.experience % 1000)} XP`}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {topSkills.length === 0 && (
        <View style={styles.emptyState}>
          <Feather name="bar-chart-2" size={48} color={colors.neutral[300]} />
          <Text style={styles.emptyText}>아직 성장 기록이 없습니다</Text>
          <Text style={styles.emptySubtext}>활동을 시작해보세요!</Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    padding: spacing[5],
    marginHorizontal: spacing[4],
    marginBottom: spacing[4],
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  title: {
    ...typography.heading.h4,
    color: colors.neutral[900],
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    ...typography.body.sm,
    color: colors.primary[500],
    marginRight: spacing[1],
  },
  skillsContainer: {
    gap: spacing[3],
  },
  skillCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  skillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  skillIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  skillInfo: {
    flex: 1,
  },
  skillName: {
    ...typography.body.base,
    fontWeight: typography.body.fontWeight.semibold,
    color: colors.neutral[900],
    marginBottom: spacing[1],
  },
  skillLevel: {
    ...typography.body.sm,
    color: colors.neutral[600],
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    ...typography.body.xs,
    fontWeight: typography.body.fontWeight.bold,
    color: colors.primary[600],
  },
  progressContainer: {
    marginBottom: spacing[3],
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.neutral[200],
    borderRadius: 4,
    marginBottom: spacing[2],
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    ...typography.body.sm,
    color: colors.neutral[600],
    textAlign: 'right',
  },
  skillStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    ...typography.body.xs,
    color: colors.neutral[600],
    marginLeft: spacing[2],
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing[8],
  },
  emptyText: {
    ...typography.body.base,
    color: colors.neutral[500],
    marginTop: spacing[3],
    marginBottom: spacing[1],
  },
  emptySubtext: {
    ...typography.body.sm,
    color: colors.neutral[400],
  },
});
