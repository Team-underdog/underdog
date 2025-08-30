import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  withSequence,
  FadeInUp,
  FadeInDown
} from 'react-native-reanimated';
import Svg, { Rect, Circle, Path } from 'react-native-svg';
import { colors, typography, spacing, shadows, borderRadius } from './ui/theme';

const { width: screenWidth } = Dimensions.get('window');

interface RoomItem {
  id: string;
  name: string;
  type: 'furniture' | 'trophy' | 'decoration';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
  position: { x: number; y: number };
  unlocked: boolean;
  unlockCondition: string;
}

interface CharacterStats {
  level: number;
  totalXP: number;
  credoScore: number;
  hollandType: string;
  achievements: string[];
  currentMood: 'happy' | 'neutral' | 'sleepy' | 'excited';
}

interface PixelCharacterRoomProps {
  characterStats: CharacterStats;
  onCharacterPress?: () => void;
  onItemPress?: (item: RoomItem) => void;
}

export const PixelCharacterRoom: React.FC<PixelCharacterRoomProps> = ({
  characterStats,
  onCharacterPress,
  onItemPress,
}) => {
  const [selectedItem, setSelectedItem] = useState<RoomItem | null>(null);
  const [showStats, setShowStats] = useState(false);

  // 애니메이션 값들
  const characterScale = useSharedValue(1);
  const roomGlow = useSharedValue(0);
  const itemFloat = useSharedValue(0);

  // 캐릭터 상태에 따른 애니메이션
  useEffect(() => {
    if (characterStats.currentMood === 'excited') {
      characterScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        false
      );
    } else if (characterStats.currentMood === 'happy') {
      characterScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        false
      );
    }
  }, [characterStats.currentMood]);

  // 룸 아이템 데이터
  const roomItems: RoomItem[] = [
    {
      id: 'desk_1',
      name: '학습 책상',
      type: 'furniture',
      rarity: 'common',
      icon: 'book-open',
      position: { x: 0.3, y: 0.6 },
      unlocked: true,
      unlockCondition: '기본 제공',
    },
    {
      id: 'trophy_1',
      name: '해커톤 우승 트로피',
      type: 'trophy',
      rarity: 'epic',
      icon: 'award',
      position: { x: 0.7, y: 0.3 },
      unlocked: characterStats.achievements.includes('해커톤 우승'),
      unlockCondition: '해커톤 우승 달성',
    },
    {
      id: 'plant_1',
      name: '성장 식물',
      type: 'decoration',
      rarity: 'rare',
      icon: 'leaf',
      position: { x: 0.2, y: 0.8 },
      unlocked: characterStats.level >= 5,
      unlockCondition: '레벨 5 달성',
    },
    {
      id: 'computer_1',
      name: '고성능 컴퓨터',
      type: 'furniture',
      rarity: 'legendary',
      icon: 'monitor',
      position: { x: 0.8, y: 0.7 },
      unlocked: characterStats.credoScore >= 1000,
      unlockCondition: '크레도 점수 1000 달성',
    },
  ];

  // 캐릭터 애니메이션 스타일
  const characterAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: characterScale.value }],
  }));

  // 룸 글로우 애니메이션
  const roomGlowStyle = useAnimatedStyle(() => ({
    shadowOpacity: 0.1 + roomGlow.value * 0.1,
    shadowRadius: 8 + roomGlow.value * 4,
  }));

  // 캐릭터 터치 핸들러
  const handleCharacterPress = () => {
    setShowStats(!showStats);
    onCharacterPress?.();
    
    // 터치 피드백 애니메이션
    characterScale.value = withSequence(
      withTiming(1.2, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
  };

  // 아이템 터치 핸들러
  const handleItemPress = (item: RoomItem) => {
    if (item.unlocked) {
      setSelectedItem(item);
      onItemPress?.(item);
    }
  };

  // 캐릭터 상태에 따른 색상
  const getMoodColor = () => {
    switch (characterStats.currentMood) {
      case 'excited': return colors.warning[500];
      case 'happy': return colors.success[500];
      case 'neutral': return colors.primary[500];
      case 'sleepy': return colors.neutral[400];
      default: return colors.primary[500];
    }
  };

  // 성취도에 따른 룸 배경
  const getRoomBackground = () => {
    if (characterStats.credoScore >= 1500) return colors.primary[50];
    if (characterStats.credoScore >= 1000) return colors.success[50];
    if (characterStats.credoScore >= 500) return colors.warning[50];
    return colors.neutral[50];
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.View 
        style={[
          styles.roomContainer,
          { backgroundColor: getRoomBackground() },
          roomGlowStyle
        ]}
        entering={FadeInUp.delay(200)}
      >
        {/* 룸 제목 */}
        <View style={styles.roomHeader}>
          <Text style={styles.roomTitle}>나의 성장 아지트</Text>
          <Text style={styles.roomSubtitle}>
            {characterStats.hollandType}형 모험가의 공간
          </Text>
        </View>

        {/* 룸 내부 */}
        <View style={styles.roomInterior}>
          {/* 룸 아이템들 */}
          {roomItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.roomItem,
                {
                  left: item.position.x * screenWidth * 0.8,
                  top: item.position.y * 300,
                  opacity: item.unlocked ? 1 : 0.3,
                },
              ]}
              onPress={() => handleItemPress(item)}
              disabled={!item.unlocked}
            >
              <View style={[
                styles.itemIcon,
                { backgroundColor: item.unlocked ? getRarityColor(item.rarity) : colors.neutral[300] }
              ]}>
                <Feather name={item.icon as any} size={20} color="white" />
              </View>
              {!item.unlocked && (
                <View style={styles.lockOverlay}>
                  <Feather name="lock" size={16} color={colors.neutral[500]} />
                </View>
              )}
            </TouchableOpacity>
          ))}

          {/* 메인 캐릭터 */}
          <TouchableOpacity
            style={styles.characterContainer}
            onPress={handleCharacterPress}
            activeOpacity={0.8}
          >
            <Animated.View style={[styles.character, characterAnimatedStyle]}>
              <Svg width={120} height={120} viewBox="0 0 48 48">
                {/* 캐릭터 기본 모양 */}
                <Rect x="16" y="8" width="16" height="16" fill="#FFB6C1" />
                <Rect x="12" y="12" width="24" height="10" fill="#FFB6C1" />
                
                {/* 머리카락 */}
                <Rect x="12" y="6" width="24" height="6" fill="#8B4513" />
                <Rect x="8" y="8" width="32" height="4" fill="#8B4513" />
                
                {/* 눈 */}
                {characterStats.currentMood === 'excited' ? (
                  <>
                    <Rect x="18" y="12" width="3" height="3" fill="#000" />
                    <Rect x="27" y="12" width="3" height="3" fill="#000" />
                    <Rect x="17" y="13" width="5" height="1" fill="#000" />
                    <Rect x="26" y="13" width="5" height="1" fill="#000" />
                  </>
                ) : characterStats.currentMood === 'happy' ? (
                  <>
                    <Rect x="18" y="12" width="3" height="3" fill="#000" />
                    <Rect x="27" y="12" width="3" height="3" fill="#000" />
                    <Rect x="17" y="13" width="5" height="1" fill="#000" />
                    <Rect x="26" y="13" width="5" height="1" fill="#000" />
                  </>
                ) : (
                  <>
                    <Rect x="18" y="12" width="3" height="2" fill="#000" />
                    <Rect x="27" y="12" width="3" height="2" fill="#000" />
                  </>
                )}
                
                {/* 입 */}
                {characterStats.currentMood === 'excited' ? (
                  <>
                    <Rect x="22" y="18" width="4" height="2" fill="#000" />
                    <Rect x="21" y="17" width="1" height="1" fill="#000" />
                    <Rect x="26" y="17" width="1" height="1" fill="#000" />
                  </>
                ) : characterStats.currentMood === 'happy' ? (
                  <Rect x="23" y="18" width="2" height="1" fill="#000" />
                ) : (
                  <Rect x="21" y="19" width="1" height="1" fill="#000" />
                )}
                
                {/* 몸체 */}
                <Rect x="20" y="24" width="8" height="16" fill={getMoodColor()} />
                <Rect x="18" y="26" width="12" height="12" fill={getMoodColor()} />
              </Svg>
              
              {/* 레벨 표시 */}
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>Lv.{characterStats.level}</Text>
              </View>
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* 캐릭터 상태창 */}
        {showStats && (
          <Animated.View style={styles.statsPanel} entering={FadeInDown.delay(100)}>
            <View style={styles.statsHeader}>
              <Text style={styles.statsTitle}>캐릭터 상태</Text>
              <TouchableOpacity onPress={() => setShowStats(false)}>
                <Feather name="x" size={20} color={colors.neutral[500]} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.statsContent}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>레벨</Text>
                <Text style={styles.statValue}>{characterStats.level}</Text>
              </View>
              <View style={styles.statRow}>
                        <Text style={styles.statLabel}>총 크레도</Text>
        <Text style={styles.statValue}>{characterStats.totalXP.toLocaleString()}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>크레도 점수</Text>
                <Text style={styles.statValue}>{characterStats.credoScore}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>성향 유형</Text>
                <Text style={styles.statValue}>{characterStats.hollandType}</Text>
              </View>
            </View>

            <View style={styles.achievementsSection}>
              <Text style={styles.achievementsTitle}>최근 성취</Text>
              {characterStats.achievements.slice(0, 3).map((achievement, index) => (
                <View key={index} style={styles.achievementItem}>
                  <Feather name="award" size={16} color={colors.warning[500]} />
                  <Text style={styles.achievementText}>{achievement}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* 룸 가이드 */}
        <View style={styles.roomGuide}>
          <Text style={styles.guideTitle}>💡 아지트 활용 팁</Text>
          <Text style={styles.guideText}>
            • 캐릭터를 터치하면 상세 정보를 볼 수 있어요{'\n'}
            • 성과에 따라 새로운 가구와 장식품이 해금돼요{'\n'}
            • 꾸준한 활동으로 아지트를 더욱 아름답게 만들어보세요!
          </Text>
        </View>
      </Animated.View>

      {/* 아이템 상세 모달 */}
      {selectedItem && (
        <View style={styles.itemModal}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedItem.name}</Text>
              <TouchableOpacity onPress={() => setSelectedItem(null)}>
                <Feather name="x" size={24} color={colors.neutral[500]} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.itemDetails}>
              <View style={styles.itemIconLarge}>
                <Feather name={selectedItem.icon as any} size={32} color="white" />
              </View>
              <Text style={styles.itemType}>{selectedItem.type}</Text>
              <Text style={styles.itemRarity}>{selectedItem.rarity}</Text>
              <Text style={styles.unlockCondition}>
                해금 조건: {selectedItem.unlockCondition}
              </Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

// 희귀도별 색상
const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'legendary': return colors.warning[500];
    case 'epic': return colors.accent.purple;
    case 'rare': return colors.accent.cyan;
    case 'common': return colors.neutral[500];
    default: return colors.neutral[500];
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[100],
  },
  roomContainer: {
    minHeight: 600,
    margin: spacing[4],
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    ...shadows.lg,
  },
  roomHeader: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  roomTitle: {
    ...typography.heading.h2,
    color: colors.neutral[900],
    marginBottom: spacing[2],
  },
  roomSubtitle: {
    ...typography.body.base,
    color: colors.neutral[600],
  },
  roomInterior: {
    position: 'relative',
    height: 400,
    marginBottom: spacing[6],
  },
  roomItem: {
    position: 'absolute',
    alignItems: 'center',
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  lockOverlay: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: colors.neutral[200],
    borderRadius: 10,
    padding: 2,
  },
  characterContainer: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: [{ translateX: -60 }, { translateY: -60 }],
  },
  character: {
    alignItems: 'center',
  },
  levelBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: colors.primary[500],
    borderRadius: 12,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
  },
  levelText: {
    ...typography.body.xs,
    color: colors.white,
    fontWeight: typography.body.fontWeight.bold,
  },
  statsPanel: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing[5],
    marginBottom: spacing[4],
    ...shadows.md,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  statsTitle: {
    ...typography.heading.h4,
    color: colors.neutral[900],
  },
  statsContent: {
    marginBottom: spacing[4],
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  statLabel: {
    ...typography.body.base,
    color: colors.neutral[600],
  },
  statValue: {
    ...typography.body.base,
    fontWeight: typography.body.fontWeight.semibold,
    color: colors.neutral[900],
  },
  achievementsSection: {
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
    paddingTop: spacing[4],
  },
  achievementsTitle: {
    ...typography.body.base,
    fontWeight: typography.body.fontWeight.semibold,
    color: colors.neutral[900],
    marginBottom: spacing[3],
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  achievementText: {
    ...typography.body.sm,
    color: colors.neutral[700],
    marginLeft: spacing[2],
  },
  roomGuide: {
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.md,
    padding: spacing[4],
    borderLeftWidth: 4,
    borderLeftColor: colors.primary[500],
  },
  guideTitle: {
    ...typography.body.base,
    fontWeight: typography.body.fontWeight.semibold,
    color: colors.primary[700],
    marginBottom: spacing[2],
  },
  guideText: {
    ...typography.body.sm,
    color: colors.primary[600],
    lineHeight: 20,
  },
  itemModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing[5],
    margin: spacing[4],
    maxWidth: screenWidth * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  modalTitle: {
    ...typography.heading.h4,
    color: colors.neutral[900],
  },
  itemDetails: {
    alignItems: 'center',
  },
  itemIconLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: getRarityColor('epic'),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  itemType: {
    ...typography.body.sm,
    color: colors.neutral[600],
    marginBottom: spacing[1],
  },
  itemRarity: {
    ...typography.body.base,
    fontWeight: typography.body.fontWeight.semibold,
    color: colors.primary[600],
    marginBottom: spacing[3],
  },
  unlockCondition: {
    ...typography.body.sm,
    color: colors.neutral[700],
    textAlign: 'center',
  },
});
