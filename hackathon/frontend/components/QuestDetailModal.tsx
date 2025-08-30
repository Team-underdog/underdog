import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from './ui/theme';
import Animated, { FadeInUp, SlideInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export interface QuestDetail {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  rewards: {
    credo: number;
    xp: number;
    skillType: string;
    items?: string[];
  };
  requirements: string[];
  timeLimit?: number; // 시간 (시간 단위)
  progress?: number | { current: number; target: number; percentage: number }; // 진행률 (숫자 또는 객체)
  maxProgress?: number;
  currentProgress?: number;
  status: 'available' | 'inProgress' | 'completed';
  dueDate?: string;
  tags?: string[];
  story?: string;
  tips?: string[];
}

interface QuestDetailModalProps {
  visible: boolean;
  quest: QuestDetail | null;
  onClose: () => void;
  onStartQuest: (quest: QuestDetail) => void;
  onCompleteQuest: (quest: QuestDetail) => void;
  onAbandonQuest: (quest: QuestDetail) => void;
}

export const QuestDetailModal: React.FC<QuestDetailModalProps> = ({
  visible,
  quest,
  onClose,
  onStartQuest,
  onCompleteQuest,
  onAbandonQuest,
}) => {
  const [showStory, setShowStory] = useState(false);

  if (!quest) return null;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case '학업': return 'book';
      case '재무관리': return 'dollar-sign';
      case '건강': return 'heart';
      case '취미': return 'music';
      case '소셜': return 'users';
      case '개발': return 'code';
      default: return 'star';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '학업': return '#3B82F6';
      case '재무관리': return '#10B981';
      case '건강': return '#EF4444';
      case '취미': return '#8B5CF6';
      case '소셜': return '#F59E0B';
      case '개발': return '#06B6D4';
      default: return '#6B7280';
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
      default: return '알 수 없음';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '🌱';
      case 'medium': return '🔥';
      case 'hard': return '⚡';
      default: return '❓';
    }
  };

  const formatTimeLimit = (hours: number) => {
    if (hours < 24) return `${hours}시간`;
    if (hours < 168) return `${Math.floor(hours / 24)}일`;
    return `${Math.floor(hours / 168)}주`;
  };

  const handleStartQuest = () => {
    Alert.alert(
      '퀘스트 시작',
      `"${quest.title}" 퀘스트를 시작하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        { text: '시작', onPress: () => onStartQuest(quest) }
      ]
    );
  };

  const handleCompleteQuest = () => {
    Alert.alert(
      '퀘스트 완료',
      `"${quest.title}" 퀘스트를 완료하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        { text: '완료', onPress: () => onCompleteQuest(quest) }
      ]
    );
  };

  const handleAbandonQuest = () => {
    Alert.alert(
      '퀘스트 포기',
      `"${quest.title}" 퀘스트를 포기하시겠습니까?\n진행 상황이 모두 사라집니다.`,
      [
        { text: '취소', style: 'cancel' },
        { text: '포기', style: 'destructive', onPress: () => onAbandonQuest(quest) }
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Feather name="x" size={24} color={colors.neutral[600]} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>퀘스트 상세</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* 퀘스트 카드 */}
          <Animated.View entering={FadeInUp.delay(100)} style={styles.questCard}>
            {/* 카테고리 & 난이도 */}
            <View style={styles.questHeader}>
              <View style={styles.categoryContainer}>
                <Feather 
                  name={getCategoryIcon(quest.category) as any} 
                  size={16} 
                  color={getCategoryColor(quest.category)} 
                />
                <Text style={[styles.categoryText, { color: getCategoryColor(quest.category) }]}>
                  {quest.category}
                </Text>
              </View>
              <View style={styles.difficultyContainer}>
                <Text style={styles.difficultyIcon}>{getDifficultyIcon(quest.difficulty)}</Text>
                <View style={[
                  styles.difficultyBadge, 
                  { backgroundColor: getDifficultyColor(quest.difficulty) }
                ]}>
                  <Text style={styles.difficultyText}>
                    {getDifficultyText(quest.difficulty)}
                  </Text>
                </View>
              </View>
            </View>

            {/* 제목 */}
            <Text style={styles.questTitle}>{quest.title}</Text>

            {/* 설명 */}
            <Text style={styles.questDescription}>{quest.description}</Text>

            {/* 태그 */}
            {quest.tags && quest.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {quest.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* 진행률 */}
            {quest.status === 'inProgress' && (
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>진행률</Text>
                  <Text style={styles.progressText}>
                    {typeof quest.progress === 'number' 
                      ? `${quest.progress}%` 
                      : quest.progress?.percentage 
                        ? `${quest.progress.percentage}%`
                        : quest.currentProgress && quest.maxProgress
                          ? `${Math.round((quest.currentProgress / quest.maxProgress) * 100)}%`
                          : '0%'
                    }
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: typeof quest.progress === 'number'
                          ? `${quest.progress}%`
                          : quest.progress?.percentage
                            ? `${quest.progress.percentage}%`
                            : quest.currentProgress && quest.maxProgress
                              ? `${Math.round((quest.currentProgress / quest.maxProgress) * 100)}%`
                              : '0%'
                      } 
                    ]} 
                  />
                </View>
                {quest.currentProgress !== undefined && quest.maxProgress !== undefined && (
                  <Text style={styles.progressDetail}>
                    {quest.currentProgress} / {quest.maxProgress}
                  </Text>
                )}
              </View>
            )}

            {/* 시간 제한 */}
            {quest.timeLimit && (
              <View style={styles.timeLimitContainer}>
                <Feather name="clock" size={16} color={colors.neutral[500]} />
                <Text style={styles.timeLimitText}>
                  제한 시간: {formatTimeLimit(quest.timeLimit)}
                </Text>
              </View>
            )}

            {/* 마감일 */}
            {quest.dueDate && (
              <View style={styles.dueDateContainer}>
                <Feather name="calendar" size={16} color={colors.neutral[500]} />
                <Text style={styles.dueDateText}>
                  마감일: {new Date(quest.dueDate).toLocaleDateString('ko-KR')}
                </Text>
              </View>
            )}
          </Animated.View>

          {/* 스토리 섹션 */}
          {quest.story && (
            <Animated.View entering={FadeInUp.delay(200)} style={styles.section}>
              <TouchableOpacity 
                style={styles.sectionHeader} 
                onPress={() => setShowStory(!showStory)}
              >
                <Text style={styles.sectionTitle}>📖 퀘스트 스토리</Text>
                <Feather 
                  name={showStory ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={colors.neutral[500]} 
                />
              </TouchableOpacity>
              {showStory && (
                <Text style={styles.storyText}>{quest.story}</Text>
              )}
            </Animated.View>
          )}

          {/* 요구사항 섹션 */}
          <Animated.View entering={FadeInUp.delay(300)} style={styles.section}>
            <Text style={styles.sectionTitle}>📋 요구사항</Text>
            <View style={styles.requirementsList}>
              {quest.requirements.map((requirement, index) => (
                <View key={index} style={styles.requirementItem}>
                  <View style={styles.requirementBullet} />
                  <Text style={styles.requirementText}>{requirement}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* 보상 섹션 */}
          <Animated.View entering={FadeInUp.delay(400)} style={styles.section}>
            <Text style={styles.sectionTitle}>🎁 보상</Text>
            <View style={styles.rewardsGrid}>
              <View style={styles.rewardItem}>
                <View style={[styles.rewardIcon, { backgroundColor: colors.primary[100] }]}>
                  <Feather name="award" size={20} color={colors.primary[600]} />
                </View>
                <Text style={styles.rewardLabel}>크레도</Text>
                <Text style={styles.rewardValue}>+{quest.rewards.credo}</Text>
              </View>
              <View style={styles.rewardItem}>
                <View style={[styles.rewardIcon, { backgroundColor: colors.success[100] }]}>
                  <Feather name="trending-up" size={20} color={colors.success[600]} />
                </View>
                <Text style={styles.rewardLabel}>XP</Text>
                <Text style={styles.rewardValue}>+{quest.rewards.xp}</Text>
              </View>
              <View style={styles.rewardItem}>
                <View style={[styles.rewardIcon, { backgroundColor: colors.warning[100] }]}>
                  <Feather name="zap" size={20} color={colors.warning[600]} />
                </View>
                <Text style={styles.rewardLabel}>스킬</Text>
                <Text style={styles.rewardValue}>{quest.rewards.skillType}</Text>
              </View>
            </View>
            {quest.rewards.items && quest.rewards.items.length > 0 && (
              <View style={styles.itemsContainer}>
                <Text style={styles.itemsLabel}>추가 아이템:</Text>
                <View style={styles.itemsList}>
                  {quest.rewards.items.map((item, index) => (
                    <View key={index} style={styles.itemTag}>
                      <Text style={styles.itemText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </Animated.View>

          {/* 팁 섹션 */}
          {quest.tips && quest.tips.length > 0 && (
            <Animated.View entering={FadeInUp.delay(500)} style={styles.section}>
              <Text style={styles.sectionTitle}>💡 성공 팁</Text>
              <View style={styles.tipsList}>
                {quest.tips.map((tip, index) => (
                  <View key={index} style={styles.tipItem}>
                    <View style={styles.tipIcon}>
                      <Feather name="lightbulb" size={16} color={colors.warning[500]} />
                    </View>
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            </Animated.View>
          )}
        </ScrollView>

        {/* 액션 버튼들 */}
        <Animated.View entering={SlideInUp.delay(600)} style={styles.actions}>
          {quest.status === 'available' && (
            <TouchableOpacity style={styles.startButton} onPress={handleStartQuest}>
              <Feather name="play" size={20} color="white" />
              <Text style={styles.startButtonText}>퀘스트 시작</Text>
            </TouchableOpacity>
          )}
          
          {quest.status === 'inProgress' && (
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.completeButton} onPress={handleCompleteQuest}>
                <Feather name="check" size={20} color="white" />
                <Text style={styles.completeButtonText}>완료하기</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.abandonButton} onPress={handleAbandonQuest}>
                <Feather name="x" size={20} color={colors.neutral[600]} />
                <Text style={styles.abandonButtonText}>포기하기</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {quest.status === 'completed' && (
            <View style={styles.completedContainer}>
              <Feather name="check-circle" size={24} color={colors.success[500]} />
              <Text style={styles.completedText}>퀘스트 완료!</Text>
            </View>
          )}
        </Animated.View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral[800],
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  questCard: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  questHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  difficultyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  difficultyIcon: {
    fontSize: 20,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  questTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.neutral[900],
    marginBottom: 12,
    lineHeight: 32,
  },
  questDescription: {
    fontSize: 16,
    color: colors.neutral[700],
    lineHeight: 24,
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: colors.neutral[100],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: colors.neutral[600],
    fontWeight: '500',
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
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[700],
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary[600],
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.neutral[200],
    borderRadius: 4,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: 4,
  },
  progressDetail: {
    fontSize: 12,
    color: colors.neutral[500],
    textAlign: 'center',
  },
  timeLimitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  timeLimitText: {
    fontSize: 14,
    color: colors.neutral[600],
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dueDateText: {
    fontSize: 14,
    color: colors.neutral[600],
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral[800],
    marginBottom: 16,
  },
  storyText: {
    fontSize: 16,
    color: colors.neutral[700],
    lineHeight: 24,
    fontStyle: 'italic',
  },
  requirementsList: {
    gap: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  requirementBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary[500],
    marginTop: 6,
  },
  requirementText: {
    fontSize: 15,
    color: colors.neutral[700],
    lineHeight: 22,
    flex: 1,
  },
  rewardsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  rewardItem: {
    alignItems: 'center',
    gap: 8,
  },
  rewardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardLabel: {
    fontSize: 12,
    color: colors.neutral[600],
    fontWeight: '500',
  },
  rewardValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.neutral[800],
  },
  itemsContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    paddingTop: 16,
  },
  itemsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[700],
    marginBottom: 8,
  },
  itemsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  itemTag: {
    backgroundColor: colors.warning[100],
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  itemText: {
    fontSize: 12,
    color: colors.warning[700],
    fontWeight: '500',
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  tipIcon: {
    marginTop: 2,
  },
  tipText: {
    fontSize: 15,
    color: colors.neutral[700],
    lineHeight: 22,
    flex: 1,
  },
  actions: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[500],
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  completeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success[500],
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  abandonButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[100],
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  abandonButtonText: {
    color: colors.neutral[600],
    fontSize: 16,
    fontWeight: '600',
  },
  completedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  completedText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.success[600],
  },
});
