import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors, typography, spacing, shadows, borderRadius } from '../ui/theme';

interface Quest {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  skillRewards: Record<string, number>;
  difficulty: string;
  progress: number;
  status: 'available' | 'in_progress' | 'completed';
}

interface TodaysQuestsProps {
  quests: Quest[];
  onQuestPress: (quest: Quest) => void;
  onStartQuest: (quest: Quest) => void;
}

export const TodaysQuests: React.FC<TodaysQuestsProps> = ({
  quests,
  onQuestPress,
  onStartQuest
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case '쉬움':
        return colors.success[500];
      case '보통':
        return colors.warning[500];
      case '어려움':
        return colors.status.error;
      case '매우어려움':
        return colors.accent.purple;
      default:
        return colors.neutral[500];
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case '쉬움':
        return '🌱';
      case '보통':
        return '🌿';
      case '어려움':
        return '🌳';
      case '매우어려움':
        return '🏔️';
      default:
        return '📝';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return colors.primary[500];
      case 'in_progress':
        return colors.warning[500];
      case 'completed':
        return colors.success[500];
      default:
        return colors.neutral[500];
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return '도전하기';
      case 'in_progress':
        return '진행중';
      case 'completed':
        return '완료!';
      default:
        return '알 수 없음';
    }
  };

  const renderQuestCard = (quest: Quest) => (
    <TouchableOpacity
      key={quest.id}
      style={styles.questCard}
      onPress={() => onQuestPress(quest)}
      activeOpacity={0.8}
    >
      {/* 퀘스트 헤더 */}
      <View style={styles.questHeader}>
        <View style={styles.titleSection}>
          <Text style={styles.questTitle}>{quest.title}</Text>
          <View style={styles.difficultyBadge}>
            <Text style={styles.difficultyIcon}>
              {getDifficultyIcon(quest.difficulty)}
            </Text>
            <Text style={[
              styles.difficultyText,
              { color: getDifficultyColor(quest.difficulty) }
            ]}>
              {quest.difficulty}
            </Text>
          </View>
        </View>
        
        {/* XP 보상 */}
        <View style={styles.xpReward}>
          <Text style={styles.xpLabel}>XP</Text>
          <Text style={styles.xpAmount}>{quest.xpReward}</Text>
        </View>
      </View>
      
      {/* 퀘스트 설명 */}
      <Text style={styles.questDescription}>{quest.description}</Text>
      
      {/* 스킬 보상 */}
      {Object.keys(quest.skillRewards).length > 0 && (
        <View style={styles.skillRewards}>
          <Text style={styles.skillRewardsLabel}>스킬 보상:</Text>
          <View style={styles.skillTags}>
            {Object.entries(quest.skillRewards).map(([skill, amount]) => (
              <View key={skill} style={styles.skillTag}>
                <Text style={styles.skillTagText}>
                  {skill} +{amount}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
      
      {/* 진행률 */}
      {quest.status === 'in_progress' && (
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>진행률</Text>
            <Text style={styles.progressPercentage}>{quest.progress}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${quest.progress}%` }
              ]} 
            />
          </View>
        </View>
      )}
      
      {/* 액션 버튼 */}
      <TouchableOpacity
        style={[
          styles.actionButton,
          { backgroundColor: getStatusColor(quest.status) }
        ]}
        onPress={() => onStartQuest(quest)}
        disabled={quest.status === 'completed'}
        activeOpacity={0.8}
      >
        <Text style={styles.actionButtonText}>
          {getStatusText(quest.status)}
        </Text>
        
        {/* 상태별 아이콘 */}
        {quest.status === 'available' && (
          <Text style={styles.actionIcon}>🚀</Text>
        )}
        {quest.status === 'in_progress' && (
          <Text style={styles.actionIcon}>⏳</Text>
        )}
        {quest.status === 'completed' && (
          <Text style={styles.actionIcon}>✅</Text>
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* 섹션 헤더 */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>오늘의 퀘스트</Text>
        <Text style={styles.sectionSubtitle}>
          AI가 추천하는 맞춤형 성장 미션
        </Text>
      </View>
      
      {/* 퀘스트 목록 */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.questsContainer}
      >
        {quests.length > 0 ? (
          quests.map(renderQuestCard)
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={styles.emptyTitle}>오늘의 퀘스트가 없습니다</Text>
            <Text style={styles.emptyDescription}>
              새로운 활동을 시작하면 맞춤형 퀘스트가 생성됩니다
            </Text>
          </View>
        )}
      </ScrollView>
      
      {/* 더보기 버튼 */}
      <TouchableOpacity style={styles.moreButton}>
        <Text style={styles.moreButtonText}>전체 퀘스트 보기</Text>
        <Text style={styles.moreButtonIcon}>→</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
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
    fontSize: typography.body.fontSize.lg,
    fontWeight: typography.body.fontWeight.bold,
    color: colors.neutral[800],
    marginBottom: spacing.xs,
  },
  
  sectionSubtitle: {
    fontSize: typography.body.fontSize.sm,
    color: colors.neutral[600],
    fontStyle: 'italic',
  },
  
  questsContainer: {
    paddingRight: spacing.lg,
    gap: spacing.md,
  },
  
  questCard: {
    backgroundColor: 'white',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    width: 280,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  
  questHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  
  titleSection: {
    flex: 1,
    marginRight: spacing.sm,
  },
  
  questTitle: {
    fontSize: typography.body.fontSize.base,
    fontWeight: typography.body.fontWeight.semibold,
    color: colors.neutral[800],
    marginBottom: spacing.xs,
    lineHeight: typography.body.lineHeight.tight,
  },
  
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  
  difficultyIcon: {
    fontSize: 12,
    marginRight: spacing.xs,
  },
  
  difficultyText: {
    fontSize: typography.body.fontSize.xs,
    fontWeight: typography.body.fontWeight.medium,
  },
  
  xpReward: {
    alignItems: 'center',
    backgroundColor: colors.warning[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.warning[200],
  },
  
  xpLabel: {
    fontSize: typography.body.fontSize.xs,
    color: colors.warning[600],
    fontWeight: typography.body.fontWeight.medium,
  },
  
  xpAmount: {
    fontSize: typography.body.fontSize.lg,
    fontWeight: typography.body.fontWeight.bold,
    color: colors.warning[700],
    fontFamily: typography.pixel.fontFamily,
  },
  
  questDescription: {
    fontSize: typography.body.fontSize.sm,
    color: colors.neutral[600],
    lineHeight: typography.body.lineHeight.normal,
    marginBottom: spacing.sm,
  },
  
  skillRewards: {
    marginBottom: spacing.sm,
  },
  
  skillRewardsLabel: {
    fontSize: typography.body.fontSize.xs,
    color: colors.neutral[600],
    marginBottom: spacing.xs,
  },
  
  skillTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  
  skillTag: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  
  skillTagText: {
    fontSize: typography.body.fontSize.xs,
    color: colors.primary[700],
    fontWeight: typography.body.fontWeight.medium,
  },
  
  progressSection: {
    marginBottom: spacing.sm,
  },
  
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  
  progressLabel: {
    fontSize: typography.body.fontSize.xs,
    color: colors.neutral[600],
  },
  
  progressPercentage: {
    fontSize: typography.body.fontSize.xs,
    fontWeight: typography.body.fontWeight.semibold,
    color: colors.primary[600],
    fontFamily: typography.pixel.fontFamily,
  },
  
  progressBar: {
    height: 4,
    backgroundColor: colors.neutral[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.full,
  },
  
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.base,
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  actionButtonText: {
    color: 'white',
    fontSize: typography.body.fontSize.sm,
    fontWeight: typography.body.fontWeight.semibold,
    marginRight: spacing.xs,
  },
  
  actionIcon: {
    fontSize: 16,
  },
  
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    width: 280,
  },
  
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  
  emptyTitle: {
    fontSize: typography.body.fontSize.base,
    fontWeight: typography.body.fontWeight.semibold,
    color: colors.neutral[700],
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  
  emptyDescription: {
    fontSize: typography.body.fontSize.sm,
    color: colors.neutral[500],
    textAlign: 'center',
    lineHeight: typography.body.lineHeight.normal,
  },
  
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.neutral[300],
  },
  
  moreButtonText: {
    fontSize: typography.body.fontSize.sm,
    color: colors.neutral[600],
    fontWeight: typography.body.fontWeight.medium,
    marginRight: spacing.xs,
  },
  
  moreButtonIcon: {
    fontSize: typography.body.fontSize.sm,
    color: colors.neutral[600],
    fontWeight: typography.body.fontWeight.bold,
  },
});

export default TodaysQuests;
