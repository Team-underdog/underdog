import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, shadows, borderRadius } from '../ui/theme';

interface PlayerStatusProps {
  nickname: string;
  level: number;
  currentXP: number;
  nextLevelXP: number;
  avatar?: string;
  onAvatarPress?: () => void;
}

export const PlayerStatus: React.FC<PlayerStatusProps> = ({
  nickname,
  level,
  currentXP,
  nextLevelXP,
  avatar,
  onAvatarPress
}) => {
  const progressPercentage = Math.min((currentXP / nextLevelXP) * 100, 100);
  
  return (
    <View style={styles.container}>
      {/* 아바타 및 기본 정보 */}
      <View style={styles.avatarSection}>
        <TouchableOpacity 
          style={styles.avatarContainer} 
          onPress={onAvatarPress}
          activeOpacity={0.8}
        >
          {avatar ? (
            <View style={styles.avatar}>
              {/* 실제 아바타 이미지가 있을 때 */}
              <Text style={styles.avatarText}>🎮</Text>
            </View>
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>👤</Text>
            </View>
          )}
          
          {/* 레벨 배지 */}
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{level}</Text>
          </View>
        </TouchableOpacity>
        
        <View style={styles.infoContainer}>
          <Text style={styles.nickname}>{nickname}</Text>
          <Text style={styles.levelLabel}>Level {level}</Text>
        </View>
      </View>
      
      {/* XP 프로그레스 바 */}
      <View style={styles.xpSection}>
        <View style={styles.xpHeader}>
          <Text style={styles.xpLabel}>XP</Text>
          <Text style={styles.xpProgress}>
            {currentXP.toLocaleString()} / {nextLevelXP.toLocaleString()}
          </Text>
        </View>
        
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${progressPercentage}%` }
              ]} 
            />
          </View>
          
          {/* 픽셀 스타일의 XP 표시 */}
          <View style={styles.xpPixelDisplay}>
            <Text style={styles.xpPixelText}>
              {progressPercentage.toFixed(1)}%
            </Text>
          </View>
        </View>
        
        {/* 다음 레벨까지 남은 XP */}
        <Text style={styles.nextLevelText}>
          다음 레벨까지 {nextLevelXP - currentXP} XP 필요
        </Text>
      </View>
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
  
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  
  avatar: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.primary[300],
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  
  avatarText: {
    fontSize: 28,
    color: colors.primary[600],
  },
  
  levelBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: colors.warning[500],
    borderRadius: borderRadius.full,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: colors.warning[500],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  
  levelText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: typography.pixel.fontFamily,
  },
  
  infoContainer: {
    flex: 1,
  },
  
  nickname: {
    fontSize: typography.body.fontSize.lg,
    fontWeight: typography.body.fontWeight.bold,
    color: colors.neutral[800],
    marginBottom: spacing.xs,
  },
  
  levelLabel: {
    fontSize: typography.body.fontSize.sm,
    color: colors.primary[600],
    fontWeight: typography.body.fontWeight.medium,
  },
  
  xpSection: {
    marginTop: spacing.sm,
  },
  
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  
  xpLabel: {
    fontSize: typography.body.fontSize.sm,
    fontWeight: typography.body.fontWeight.semibold,
    color: colors.neutral[600],
  },
  
  xpProgress: {
    fontSize: typography.body.fontSize.sm,
    color: colors.primary[600],
    fontWeight: typography.body.fontWeight.medium,
    fontFamily: typography.pixel.fontFamily,
  },
  
  progressBarContainer: {
    position: 'relative',
    marginBottom: spacing.sm,
  },
  
  progressBar: {
    height: 12,
    backgroundColor: colors.neutral[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.neutral[300],
  },
  
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.full,
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2,
  },
  
  xpPixelDisplay: {
    position: 'absolute',
    top: -8,
    right: 0,
    backgroundColor: colors.warning[500],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.base,
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: colors.warning[500],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  
  xpPixelText: {
    color: 'white',
    fontSize: typography.body.fontSize.xs,
    fontWeight: typography.body.fontWeight.bold,
    fontFamily: typography.pixel.fontFamily,
  },
  
  nextLevelText: {
    fontSize: typography.body.fontSize.sm,
    color: colors.neutral[500],
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default PlayerStatus;
