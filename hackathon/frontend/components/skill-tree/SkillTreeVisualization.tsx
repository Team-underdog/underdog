import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, PanGestureHandler, State, Animated } from 'react-native';
import { colors, typography, spacing, shadows, borderRadius } from '../ui/theme';

interface SkillNode {
  id: string;
  name: string;
  level: number;
  currentXP: number;
  maxXP: number;
  icon: string;
  color: string;
  position: { x: number; y: number };
  connections: string[];
}

interface SkillTreeVisualizationProps {
  skills: SkillNode[];
  onSkillPress: (skill: SkillNode) => void;
}

export const SkillTreeVisualization: React.FC<SkillTreeVisualizationProps> = ({
  skills,
  onSkillPress
}) => {
  const [selectedSkill, setSelectedSkill] = useState<SkillNode | null>(null);
  const [zoom, setZoom] = useState(1);
  const panRef = useRef(new Animated.ValueXY()).current;
  
  // NCS 10대 직업기초능력 기본 위치 (별자리 형태)
  const defaultSkillPositions: Record<string, { x: number; y: number }> = {
    '의사소통능력': { x: 0, y: -120 },
    '수리능력': { x: 80, y: -80 },
    '문제해결능력': { x: 120, y: 0 },
    '자기개발능력': { x: 80, y: 80 },
    '자원관리능력': { x: 0, y: 120 },
    '대인관계능력': { x: -80, y: 80 },
    '정보능력': { x: -120, y: 0 },
    '기술능력': { x: -80, y: -80 },
    '조직이해능력': { x: -40, y: -40 },
    '직업윤리': { x: 40, y: -40 },
  };

  const getSkillIcon = (skillName: string) => {
    const iconMap: Record<string, string> = {
      '의사소통능력': '💬',
      '수리능력': '🧮',
      '문제해결능력': '🎯',
      '자기개발능력': '📚',
      '자원관리능력': '💼',
      '대인관계능력': '🤝',
      '정보능력': '🔍',
      '기술능력': '⚙️',
      '조직이해능력': '🏢',
      '직업윤리': '⚖️',
    };
    return iconMap[skillName] || '⭐';
  };

  const getSkillColor = (skillName: string) => {
    const colorMap: Record<string, string> = {
      '의사소통능력': colors.primary[500],
      '수리능력': colors.success[500],
      '문제해결능력': colors.warning[500],
      '자기개발능력': colors.accent.purple,
      '자원관리능력': colors.accent.orange,
      '대인관계능력': colors.accent.cyan,
      '정보능력': colors.accent.lime,
      '기술능력': colors.accent.pink,
      '조직이해능력': colors.neutral[500],
      '직업윤리': colors.success[600],
    };
    return colorMap[skillName] || colors.primary[500];
  };

  const getSkillSize = (level: number) => {
    // 레벨에 따른 크기 계산 (기본 40px, 최대 80px)
    return Math.max(40, Math.min(80, 40 + level * 4));
  };

  const getSkillGlow = (level: number) => {
    // 레벨에 따른 글로우 효과
    if (level >= 8) return shadows.glow.purple;
    if (level >= 6) return shadows.glow.gold;
    if (level >= 4) return shadows.glow.green;
    if (level >= 2) return shadows.glow.blue;
    return 'none';
  };

  const renderSkillNode = (skill: SkillNode) => {
    const size = getSkillSize(skill.level);
    const glow = getSkillGlow(skill.level);
    const progress = (skill.currentXP / skill.maxXP) * 100;
    
    return (
      <Animated.View
        key={skill.id}
        style={[
          styles.skillNode,
          {
            width: size,
            height: size,
            left: skill.position.x - size / 2,
            top: skill.position.y - size / 2,
            backgroundColor: skill.color,
            shadowColor: skill.color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: skill.level >= 4 ? 0.6 : 0.3,
            shadowRadius: skill.level >= 4 ? 8 : 4,
            elevation: skill.level >= 4 ? 8 : 4,
          }
        ]}
      >
        {/* 스킬 아이콘 */}
        <Text style={[styles.skillIcon, { fontSize: size * 0.4 }]}>
          {skill.icon}
        </Text>
        
        {/* 레벨 표시 */}
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>{skill.level}</Text>
        </View>
        
        {/* 진행률 링 */}
        <View style={styles.progressRing}>
          <View 
            style={[
              styles.progressArc,
              { 
                width: size,
                height: size,
                borderWidth: size * 0.1,
                borderColor: colors.warning[500],
                borderTopColor: progress >= 100 ? colors.success[500] : colors.warning[500],
                transform: [{ rotate: `${-90 + (progress / 100) * 360}deg` }]
              }
            ]} 
          />
        </View>
        
        {/* 스킬 이름 (호버 시 표시) */}
        {selectedSkill?.id === skill.id && (
          <View style={styles.skillTooltip}>
            <Text style={styles.skillName}>{skill.name}</Text>
            <Text style={styles.skillXP}>
              {skill.currentXP} / {skill.maxXP} XP
            </Text>
            <Text style={styles.skillProgress}>
              {progress.toFixed(1)}% 완료
            </Text>
          </View>
        )}
      </Animated.View>
    );
  };

  const renderConnections = () => {
    const connections: JSX.Element[] = [];
    
    skills.forEach(skill => {
      skill.connections.forEach(connectionId => {
        const targetSkill = skills.find(s => s.id === connectionId);
        if (targetSkill) {
          const startX = skill.position.x;
          const startY = skill.position.y;
          const endX = targetSkill.position.x;
          const endY = targetSkill.position.y;
          
          // 연결선 그리기
          connections.push(
            <View
              key={`${skill.id}-${connectionId}`}
              style={[
                styles.connectionLine,
                {
                  left: Math.min(startX, endX),
                  top: Math.min(startY, endY),
                  width: Math.abs(endX - startX),
                  height: Math.abs(endY - startY),
                  transform: [
                    { rotate: `${Math.atan2(endY - startY, endX - startX)}rad` }
                  ]
                }
              ]}
            />
          );
        }
      });
    });
    
    return connections;
  };

  const handleSkillPress = (skill: SkillNode) => {
    setSelectedSkill(selectedSkill?.id === skill.id ? null : skill);
    onSkillPress(skill);
  };

  return (
    <View style={styles.container}>
      {/* 스킬 트리 캔버스 */}
      <View style={styles.canvas}>
        {/* 연결선들 */}
        {renderConnections()}
        
        {/* 스킬 노드들 */}
        {skills.map(skill => (
          <Animated.View
            key={skill.id}
            style={[
              styles.skillNodeContainer,
              {
                transform: [
                  { translateX: panRef.x },
                  { translateY: panRef.y },
                  { scale: zoom }
                ]
              }
            ]}
          >
            {renderSkillNode(skill)}
          </Animated.View>
        ))}
      </View>
      
      {/* 줌 컨트롤 */}
      <View style={styles.zoomControls}>
        <TouchableOpacity
          style={styles.zoomButton}
          onPress={() => setZoom(Math.min(zoom + 0.2, 2))}
        >
          <Text style={styles.zoomButtonText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.zoomButton}
          onPress={() => setZoom(Math.max(zoom - 0.2, 0.5))}
        >
          <Text style={styles.zoomButtonText}>-</Text>
        </TouchableOpacity>
      </View>
      
      {/* 범례 */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>스킬 레벨</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.primary[500] }]} />
            <Text style={styles.legendText}>초급 (1-3)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.success[500] }]} />
            <Text style={styles.legendText}>중급 (4-6)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.warning[500] }]} />
            <Text style={styles.legendText}>고급 (7-9)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.accent.purple }]} />
            <Text style={styles.legendText}>마스터 (10+)</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[100],
  },
  
  canvas: {
    flex: 1,
    position: 'relative',
    backgroundColor: colors.neutral[50],
  },
  
  skillNodeContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  
  skillNode: {
    position: 'absolute',
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  
  skillIcon: {
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  
  levelBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: colors.warning[500],
    borderRadius: borderRadius.full,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  
  levelText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: typography.pixel.fontFamily,
  },
  
  progressRing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  
  progressArc: {
    position: 'absolute',
    borderRadius: borderRadius.full,
    borderStyle: 'solid',
  },
  
  skillTooltip: {
    position: 'absolute',
    top: '100%',
    left: '50%',
    transform: [{ translateX: -50 }],
    backgroundColor: colors.neutral[800],
    padding: spacing.sm,
    borderRadius: borderRadius.base,
    minWidth: 120,
    alignItems: 'center',
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  skillName: {
    color: 'white',
    fontSize: typography.body.fontSize.sm,
    fontWeight: typography.body.fontWeight.semibold,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  
  skillXP: {
    color: colors.warning[300],
    fontSize: typography.body.fontSize.xs,
    fontFamily: typography.pixel.fontFamily,
    marginBottom: spacing.xs,
  },
  
  skillProgress: {
    color: colors.neutral[300],
    fontSize: typography.body.fontSize.xs,
    fontStyle: 'italic',
  },
  
  connectionLine: {
    position: 'absolute',
    backgroundColor: colors.neutral[300],
    height: 2,
    opacity: 0.3,
  },
  
  zoomControls: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    flexDirection: 'column',
    gap: spacing.sm,
  },
  
  zoomButton: {
    width: 40,
    height: 40,
    backgroundColor: colors.neutral[800],
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  
  zoomButtonText: {
    color: 'white',
    fontSize: typography.body.fontSize.lg,
    fontWeight: typography.body.fontWeight.bold,
  },
  
  legend: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    backgroundColor: colors.neutral[50],
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  legendTitle: {
    fontSize: typography.body.fontSize.sm,
    fontWeight: typography.body.fontWeight.semibold,
    color: colors.neutral[800],
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  
  legendItems: {
    gap: spacing.xs,
  },
  
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: borderRadius.full,
  },
  
  legendText: {
    fontSize: typography.body.fontSize.xs,
    color: colors.neutral[600],
  },
});

export default SkillTreeVisualization;
