import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CampusCredoBottomNav } from '../components/CampusCredoBottomNav';
import { PixelCharacterRoom } from '../components/PixelCharacterRoom';
import { colors, typography, spacing } from '../components/ui/theme';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface CharacterStats {
  level: number;
  totalXP: number;
  credoScore: number;
  hollandType: string;
  achievements: string[];
  currentMood: 'happy' | 'neutral' | 'sleepy' | 'excited';
}

export default function CharacterRoomPage() {
  const [characterStats, setCharacterStats] = useState<CharacterStats>({
    level: 15,
    totalXP: 12500,
    credoScore: 2850,
    hollandType: '탐구-진취형',
    achievements: [
      '해커톤 우승',
      '일주일 연속 달성',
      '스킬 마스터',
      '금융 독립',
      '학업 우수상',
    ],
    currentMood: 'excited',
  });

  const handleCharacterPress = () => {
    console.log('캐릭터 상세 정보');
  };

  const handleItemPress = (item: any) => {
    console.log('아이템 상세 정보:', item.name);
  };

  // 크레도 점수에 따른 캐릭터 기분 업데이트
  useEffect(() => {
    if (characterStats.credoScore >= 2000) {
      setCharacterStats(prev => ({ ...prev, currentMood: 'excited' }));
    } else if (characterStats.credoScore >= 1000) {
      setCharacterStats(prev => ({ ...prev, currentMood: 'happy' }));
    } else if (characterStats.credoScore >= 500) {
      setCharacterStats(prev => ({ ...prev, currentMood: 'neutral' }));
    } else {
      setCharacterStats(prev => ({ ...prev, currentMood: 'sleepy' }));
    }
  }, [characterStats.credoScore]);

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>나의 성장 아지트</Text>
          <Text style={styles.headerSubtitle}>
            {characterStats.hollandType} 모험가의 개인 공간
          </Text>
        </View>
        <View style={styles.headerStats}>
          <View style={styles.statItem}>
            <Feather name="star" size={16} color={colors.warning[500]} />
            <Text style={styles.statText}>Lv.{characterStats.level}</Text>
          </View>
          <View style={styles.statItem}>
            <Feather name="award" size={16} color={colors.primary[500]} />
            <Text style={styles.statText}>{characterStats.credoScore}</Text>
          </View>
        </View>
      </Animated.View>

      {/* 캐릭터 룸 */}
      <PixelCharacterRoom
        characterStats={characterStats}
        onCharacterPress={handleCharacterPress}
        onItemPress={handleItemPress}
      />

      {/* 하단 네비게이션 */}
      <CampusCredoBottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[100],
  },
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    ...typography.heading.h2,
    color: colors.neutral[900],
    marginBottom: spacing[1],
  },
  headerSubtitle: {
    ...typography.body.base,
    color: colors.neutral[600],
  },
  headerStats: {
    flexDirection: 'row',
    gap: spacing[4],
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  statText: {
    ...typography.body.base,
    fontWeight: typography.body.fontWeight.semibold,
    color: colors.neutral[700],
  },
});
