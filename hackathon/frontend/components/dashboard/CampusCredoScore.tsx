import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, shadows, borderRadius, animations } from '../ui/theme';

interface CampusCredoScoreProps {
  totalScore: number;
  grade: string;
  rankPercentage: number;
  onPress?: () => void;
}

export const CampusCredoScore: React.FC<CampusCredoScoreProps> = ({
  totalScore,
  grade,
  rankPercentage,
  onPress
}) => {
  // 등급별 색상 및 아이콘
  const getGradeInfo = (grade: string) => {
    switch (grade) {
      case 'S+':
        return { color: colors.accent.purple, icon: '👑', glow: colors.accent.purple };
      case 'S':
        return { color: colors.accent.purple, icon: '⭐', glow: colors.accent.purple };
      case 'A+':
        return { color: colors.success[500], icon: '🏆', glow: colors.success[500] };
      case 'A':
        return { color: colors.success[500], icon: '🎯', glow: colors.success[500] };
      case 'B+':
        return { color: colors.primary[500], icon: '🎖️', glow: colors.primary[500] };
      case 'B':
        return { color: colors.primary[500], icon: '🏅', glow: colors.primary[500] };
      case 'C+':
        return { color: colors.warning[500], icon: '📈', glow: colors.warning[500] };
      case 'C':
        return { color: colors.warning[500], icon: '📊', glow: colors.warning[500] };
      default:
        return { color: colors.neutral[500], icon: '📝', glow: colors.neutral[500] };
    }
  };

  const gradeInfo = getGradeInfo(grade);
  
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>캠퍼스 크레도</Text>
        <View style={styles.gradeContainer}>
          <Text style={[styles.gradeIcon, { color: gradeInfo.color }]}>
            {gradeInfo.icon}
          </Text>
          <Text style={[styles.grade, { color: gradeInfo.color }]}>
            {grade}
          </Text>
        </View>
      </View>
      
      {/* 메인 점수 */}
      <View style={styles.scoreSection}>
        <Text style={styles.scoreLabel}>총점</Text>
        <Text style={styles.totalScore}>
          {totalScore.toLocaleString()}
        </Text>
        
        {/* 픽셀 스타일 점수 표시 */}
        <View style={styles.pixelScoreDisplay}>
          <Text style={styles.pixelScoreText}>
            {totalScore}
          </Text>
        </View>
      </View>
      
      {/* 랭킹 정보 */}
      <View style={styles.rankingSection}>
        <View style={styles.rankInfo}>
          <Text style={styles.rankLabel}>상위</Text>
          <Text style={styles.rankPercentage}>
            {rankPercentage.toFixed(1)}%
          </Text>
        </View>
        
        {/* 랭킹 시각화 */}
        <View style={styles.rankBar}>
          <View 
            style={[
              styles.rankFill, 
              { 
                width: `${100 - rankPercentage}%`,
                backgroundColor: gradeInfo.color 
              }
            ]} 
          />
        </View>
      </View>
      
      {/* 점수 분해 */}
      <View style={styles.breakdownSection}>
        <Text style={styles.breakdownLabel}>세부 점수</Text>
        <View style={styles.scoreBreakdown}>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreItemLabel}>학사</Text>
            <View style={styles.scoreBar}>
              <View 
                style={[
                  styles.scoreBarFill, 
                  { 
                    width: `${(totalScore / 4000) * 100}%`,
                    backgroundColor: colors.success[500]
                  }
                ]} 
              />
            </View>
          </View>
          
          <View style={styles.scoreItem}>
            <Text style={styles.scoreItemLabel}>금융</Text>
            <View style={styles.scoreBar}>
              <View 
                style={[
                  styles.scoreBarFill, 
                  { 
                    width: `${(totalScore / 4000) * 100}%`,
                    backgroundColor: colors.primary[500]
                  }
                ]} 
              />
            </View>
          </View>
          
          <View style={styles.scoreItem}>
            <Text style={styles.scoreItemLabel}>스킬</Text>
            <View style={styles.scoreBar}>
              <View 
                style={[
                  styles.scoreBarFill, 
                  { 
                    width: `${(totalScore / 4000) * 100}%`,
                    backgroundColor: colors.warning[500]
                  }
                ]} 
              />
            </View>
          </View>
          
          <View style={styles.scoreItem}>
            <Text style={styles.scoreItemLabel}>활동</Text>
            <View style={styles.scoreBar}>
              <View 
                style={[
                  styles.scoreBarFill, 
                  { 
                    width: `${(totalScore / 4000) * 100}%`,
                    backgroundColor: colors.accent.purple
                  }
                ]} 
              />
            </View>
          </View>
        </View>
      </View>
      
      {/* 터치 힌트 */}
      <View style={styles.hintSection}>
        <Text style={styles.hintText}>
          터치하여 상세 분석 보기 📊
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    minHeight: 280,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  
  title: {
    fontSize: typography.body.fontSize.lg,
    fontWeight: typography.body.fontWeight.bold,
    color: colors.neutral[800],
  },
  
  gradeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.neutral[300],
  },
  
  gradeIcon: {
    fontSize: 20,
    marginRight: spacing.xs,
  },
  
  grade: {
    fontSize: typography.body.fontSize.lg,
    fontWeight: typography.body.fontWeight.bold,
    fontFamily: typography.pixel.fontFamily,
  },
  
  scoreSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    position: 'relative',
  },
  
  scoreLabel: {
    fontSize: typography.body.fontSize.sm,
    color: colors.neutral[600],
    marginBottom: spacing.xs,
  },
  
  totalScore: {
    fontSize: typography.heading.fontSize['2xl'],
    fontWeight: typography.heading.fontWeight.bold,
    color: colors.neutral[900],
    fontFamily: typography.pixel.fontFamily,
    textShadowColor: colors.neutral[400],
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  
  pixelScoreDisplay: {
    position: 'absolute',
    top: -10,
    right: -20,
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
            transform: [{ rotate: '15deg' }],
  },
  
  pixelScoreText: {
    color: 'white',
    fontSize: typography.body.fontSize.xs,
    fontWeight: typography.body.fontWeight.bold,
    fontFamily: typography.pixel.fontFamily,
  },
  
  rankingSection: {
    marginBottom: spacing.md,
  },
  
  rankInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  
  rankLabel: {
    fontSize: typography.body.fontSize.sm,
    color: colors.neutral[600],
  },
  
  rankPercentage: {
    fontSize: typography.body.fontSize.sm,
    fontWeight: typography.body.fontWeight.semibold,
    color: colors.primary[600],
    fontFamily: typography.pixel.fontFamily,
  },
  
  rankBar: {
    height: 6,
    backgroundColor: colors.neutral[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  
  rankFill: {
    height: '100%',
    borderRadius: borderRadius.full,
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2,
  },
  
  breakdownSection: {
    marginBottom: spacing.md,
  },
  
  breakdownLabel: {
    fontSize: typography.body.fontSize.sm,
    fontWeight: typography.body.fontWeight.semibold,
    color: colors.neutral[700],
    marginBottom: spacing.sm,
  },
  
  scoreBreakdown: {
    gap: spacing.sm,
  },
  
  scoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  scoreItemLabel: {
    fontSize: typography.body.fontSize.xs,
    color: colors.neutral[600],
    width: 40,
    marginRight: spacing.sm,
  },
  
  scoreBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.neutral[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  
  scoreBarFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  
  hintSection: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  
  hintText: {
    fontSize: typography.body.fontSize.xs,
    color: colors.neutral[500],
    fontStyle: 'italic',
  },
});

export default CampusCredoScore;
