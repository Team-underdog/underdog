import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Polygon, Circle, Text as SvgText, Line } from 'react-native-svg';
import { colors, typography, spacing } from '../ui/theme';

const { width: screenWidth } = Dimensions.get('window');
const chartSize = Math.min(screenWidth - 40, 300);
const centerX = chartSize / 2;
const centerY = chartSize / 2;
const radius = chartSize / 2 - 40;

interface HollandProfile {
  R: number; // Realistic (현실형)
  I: number; // Investigative (탐구형)
  A: number; // Artistic (예술형)
  S: number; // Social (사회형)
  E: number; // Enterprising (진취형)
  C: number; // Conventional (관습형)
}

interface HollandProfileChartProps {
  profile: HollandProfile;
  isVisible: boolean;
}

const hollandTypes = [
  { key: 'R', label: '현실형', description: '만드는 사람', color: colors.primary[500] },
  { key: 'I', label: '탐구형', description: '생각하는 사람', color: colors.success[500] },
  { key: 'A', label: '예술형', description: '창조하는 사람', color: colors.accent.purple },
  { key: 'S', label: '사회형', description: '돕는 사람', color: colors.accent.pink },
  { key: 'E', label: '진취형', description: '설득하는 사람', color: colors.warning[500] },
  { key: 'C', label: '관습형', description: '조직하는 사람', color: colors.accent.cyan },
];

export const HollandProfileChart: React.FC<HollandProfileChartProps> = ({
  profile,
  isVisible,
}) => {
  if (!isVisible) return null;

  // 육각형 꼭짓점 계산
  const getHexagonPoints = () => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i * 60 - 90) * (Math.PI / 180);
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    return points.join(' ');
  };

  // 사용자 프로필 육각형 꼭짓점 계산
  const getUserProfilePoints = () => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const type = hollandTypes[i].key as keyof HollandProfile;
      const value = profile[type];
      const angle = (i * 60 - 90) * (Math.PI / 180);
      const userRadius = (value / 100) * radius;
      const x = centerX + userRadius * Math.cos(angle);
      const y = centerY + userRadius * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    return points.join(' ');
  };

  // 성향 유형별 위치 계산
  const getTypePosition = (index: number) => {
    const angle = (index * 60 - 90) * (Math.PI / 180);
    const x = centerX + (radius + 20) * Math.cos(angle);
    const y = centerY + (radius + 20) * Math.sin(angle);
    return { x, y };
  };

  // 주요 성향 유형 찾기
  const getDominantTypes = () => {
    const sorted = Object.entries(profile)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2);
    return sorted.map(([key, value]) => {
      const type = hollandTypes.find(t => t.key === key);
      return { ...type, value };
    });
  };

  const dominantTypes = getDominantTypes();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>성향 분석</Text>
      <Text style={styles.subtitle}>
        {dominantTypes[0]?.label}-{dominantTypes[1]?.label}형 {dominantTypes[0]?.description}
      </Text>
      
      <View style={styles.chartContainer}>
        <Svg width={chartSize} height={chartSize} viewBox={`0 0 ${chartSize} ${chartSize}`}>
          {/* 배경 육각형 그리드 */}
          {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale, index) => (
            <Polygon
              key={index}
              points={(() => {
                const points = [];
                for (let i = 0; i < 6; i++) {
                  const angle = (i * 60 - 90) * (Math.PI / 180);
                  const x = centerX + (radius * scale) * Math.cos(angle);
                  const y = centerY + (radius * scale) * Math.sin(angle);
                  points.push(`${x},${y}`);
                }
                return points.join(' ');
              })()}
              fill="none"
              stroke={colors.neutral[200]}
              strokeWidth={1}
              opacity={0.3}
            />
          ))}

          {/* 메인 육각형 */}
          <Polygon
            points={getHexagonPoints()}
            fill="none"
            stroke={colors.neutral[400]}
            strokeWidth={2}
          />

          {/* 사용자 프로필 육각형 */}
          <Polygon
            points={getUserProfilePoints()}
            fill={colors.primary[100]}
            fillOpacity={0.6}
            stroke={colors.primary[500]}
            strokeWidth={3}
          />

          {/* 성향 유형 라벨 */}
          {hollandTypes.map((type, index) => {
            const pos = getTypePosition(index);
            return (
              <View key={type.key}>
                <SvgText
                  x={pos.x}
                  y={pos.y}
                  fontSize="12"
                  fontWeight="bold"
                  textAnchor="middle"
                  fill={type.color}
                >
                  {type.label}
                </SvgText>
                <SvgText
                  x={pos.x}
                  y={pos.y + 15}
                  fontSize="10"
                  textAnchor="middle"
                  fill={colors.neutral[600]}
                >
                  {profile[type.key as keyof HollandProfile]}
                </SvgText>
              </View>
            );
          })}

          {/* 중심점 */}
          <Circle
            cx={centerX}
            cy={centerY}
            r={4}
            fill={colors.primary[500]}
          />
        </Svg>
      </View>

      {/* 성향 유형별 상세 정보 */}
      <View style={styles.typeDetails}>
        {hollandTypes.map((type) => (
          <View key={type.key} style={styles.typeItem}>
            <View style={[styles.typeColor, { backgroundColor: type.color }]} />
            <View style={styles.typeInfo}>
              <Text style={styles.typeLabel}>{type.label}</Text>
              <Text style={styles.typeDescription}>{type.description}</Text>
            </View>
            <Text style={styles.typeScore}>{profile[type.key as keyof HollandProfile]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral[50],
    borderRadius: 16,
    padding: spacing[6],
    margin: spacing[4],
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    ...typography.heading.h3,
    textAlign: 'center',
    marginBottom: spacing[2],
    color: colors.neutral[900],
  },
  subtitle: {
    ...typography.body.base,
    textAlign: 'center',
    marginBottom: spacing[6],
    color: colors.neutral[600],
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  typeDetails: {
    gap: spacing[3],
  },
  typeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
  typeColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing[3],
  },
  typeInfo: {
    flex: 1,
  },
  typeLabel: {
    ...typography.body.sm,
    fontWeight: typography.body.fontWeight.semibold,
    color: colors.neutral[900],
  },
  typeDescription: {
    ...typography.body.xs,
    color: colors.neutral[600],
  },
  typeScore: {
    ...typography.body.lg,
    fontWeight: typography.body.fontWeight.bold,
    color: colors.primary[600],
  },
});
