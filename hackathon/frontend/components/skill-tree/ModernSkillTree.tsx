import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../ui/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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

interface SkillTreeProps {
  skills: SkillNode[];
  onSkillPress: (skill: SkillNode) => void;
}

export const ModernSkillTree: React.FC<SkillTreeProps> = ({
  skills,
  onSkillPress
}) => {
  const [selectedSkill, setSelectedSkill] = useState<SkillNode | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [zoom, setZoom] = useState(1);
  const panRef = useRef(new Animated.ValueXY()).current;
  
  const categories = ['전체', '학업', '금융', '건강', '사회', '창의'];
  
  const filteredSkills = selectedCategory === '전체' 
    ? skills 
    : skills.filter(skill => skill.category === selectedCategory);

  const getSkillIcon = (iconName: string) => {
    const iconMap: Record<string, string> = {
      'academic': '📚',
      'financial': '💰',
      'health': '💪',
      'social': '🤝',
      'creative': '🎨',
      'default': '⭐'
    };
    return iconMap[iconName] || iconMap.default;
  };

  const getSkillColor = (category: string) => {
    const colorMap: Record<string, string> = {
      '학업': '#6366f1', // indigo
      '금융': '#10b981', // emerald
      '건강': '#f59e0b', // amber
      '사회': '#8b5cf6', // violet
      '창의': '#ec4899', // pink
      'default': '#6b7280' // gray
    };
    return colorMap[category] || colorMap.default;
  };

  const getSkillSize = (level: number) => {
    return Math.max(60, Math.min(100, 60 + level * 3));
  };

  const getProgressPercentage = (current: number, max: number) => {
    return Math.min(100, (current / max) * 100);
  };

  const getProgressWidth = (current: number, max: number, containerWidth: number = 200) => {
    const percentage = Math.min(100, (current / max) * 100);
    return (percentage / 100) * containerWidth;
  };

  const getLevelColor = (level: number) => {
    if (level >= 8) return '#fbbf24'; // gold
    if (level >= 6) return '#10b981'; // emerald
    if (level >= 4) return '#3b82f6'; // blue
    if (level >= 2) return '#8b5cf6'; // violet
    return '#6b7280'; // gray
  };

  const renderSkillNode = (skill: SkillNode) => {
    const size = getSkillSize(skill.level);
    const progress = getProgressPercentage(skill.currentXP, skill.maxXP);
    const levelColor = getLevelColor(skill.level);
    
    // 색상 값 검증
    const primaryColor = skill.color || '#6366f1';
    const secondaryColor = primaryColor + '80';
    
    return (
      <TouchableOpacity
        key={skill.id}
        style={[
          styles.skillNode,
          {
            width: size,
            height: size,
            left: skill.position.x - size / 2,
            top: skill.position.y - size / 2,
          }
        ]}
        onPress={() => {
          setSelectedSkill(skill);
          setShowSkillModal(true);
          onSkillPress(skill);
        }}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[primaryColor, secondaryColor]}
          style={[styles.skillGradient, { borderRadius: size / 2 }]}
        >
          {/* 스킬 아이콘 */}
          <Text style={[styles.skillIcon, { fontSize: size * 0.3 }]}>
            {getSkillIcon(skill.category)}
          </Text>
          
          {/* 레벨 배지 */}
          <View style={[styles.levelBadge, { backgroundColor: levelColor }]}>
            <Text style={styles.levelText}>{skill.level}</Text>
          </View>
          
          {/* 진행률 링 */}
          <View style={[styles.progressRing, { width: size, height: size }]}>
            <View 
              style={[
                styles.progressArc,
                { 
                  width: size,
                  height: size,
                  borderWidth: size * 0.08,
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  borderTopColor: progress >= 100 ? '#10b981' : '#fbbf24',
                  transform: [{ rotate: `${-90 + (progress / 100) * 360}deg` }]
                }
              ]} 
            />
          </View>
        </LinearGradient>
        
        {/* 스킬 이름 */}
        <Text style={styles.skillName} numberOfLines={1}>
          {skill.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderConnections = () => {
    return skills.map(skill => 
      skill.connections.map(connectionId => {
        const targetSkill = skills.find(s => s.id === connectionId);
        if (!targetSkill) return null;
        
        const startX = skill.position.x;
        const startY = skill.position.y;
        const endX = targetSkill.position.x;
        const endY = targetSkill.position.y;
        
        return (
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
      })
    ).flat().filter(Boolean);
  };

  const renderSkillModal = () => {
    if (!selectedSkill) return null;
    
    const progress = getProgressPercentage(selectedSkill.currentXP, selectedSkill.maxXP);
    const levelColor = getLevelColor(selectedSkill.level);
    
    return (
      <Modal
        visible={showSkillModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSkillModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={[selectedSkill.color || '#6366f1', (selectedSkill.color || '#6366f1') + '80']}
              style={styles.modalHeader}
            >
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowSkillModal(false)}
              >
                <Feather name="x" size={24} color="white" />
              </TouchableOpacity>
              
              <Text style={styles.modalIcon}>
                {getSkillIcon(selectedSkill.category)}
              </Text>
              
              <Text style={styles.modalTitle}>{selectedSkill.name}</Text>
              
              <View style={styles.modalLevelInfo}>
                <View style={[styles.modalLevelBadge, { backgroundColor: levelColor }]}>
                  <Text style={styles.modalLevelText}>Lv.{selectedSkill.level}</Text>
                </View>
                <Text style={styles.modalCategory}>{selectedSkill.category}</Text>
              </View>
            </LinearGradient>
            
            <View style={styles.modalBody}>
              <Text style={styles.modalDescription}>{selectedSkill.description}</Text>
              
              <View style={styles.progressSection}>
                <Text style={styles.progressLabel}>진행률</Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill,
                      { 
                        width: getProgressWidth(selectedSkill.currentXP, selectedSkill.maxXP, 200),
                        backgroundColor: progress >= 100 ? '#10b981' : '#fbbf24'
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {selectedSkill.currentXP} / {selectedSkill.maxXP} XP
                </Text>
              </View>
              
              <View style={styles.benefitsSection}>
                <Text style={styles.benefitsTitle}>스킬 효과</Text>
                {selectedSkill.benefits.map((benefit, index) => (
                  <View key={index} style={styles.benefitItem}>
                    <MaterialIcons name="check-circle" size={20} color="#10b981" />
                    <Text style={styles.benefitText}>{benefit}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      {/* 카테고리 탭 */}
      <View style={styles.categoryTabs}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryTab,
                selectedCategory === category && styles.categoryTabActive
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryTabText,
                selectedCategory === category && styles.categoryTabTextActive
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {/* 스킬 트리 캔버스 */}
      <View style={styles.canvas}>
        {/* 연결선들 */}
        {renderConnections()}
        
        {/* 스킬 노드들 */}
        <Animated.View
          style={[
            styles.skillNodesContainer,
            {
              transform: [
                { translateX: panRef.x },
                { translateY: panRef.y },
                { scale: zoom }
              ]
            }
          ]}
        >
          {filteredSkills.map(renderSkillNode)}
        </Animated.View>
      </View>
      
      {/* 줌 컨트롤 */}
      <View style={styles.zoomControls}>
        <TouchableOpacity
          style={styles.zoomButton}
          onPress={() => setZoom(Math.min(zoom + 0.2, 2))}
        >
          <Ionicons name="add" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.zoomButton}
          onPress={() => setZoom(Math.max(zoom - 0.2, 0.5))}
        >
          <Ionicons name="remove" size={20} color="white" />
        </TouchableOpacity>
      </View>
      
      {/* 범례 */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>스킬 레벨</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#8b5cf6' }]} />
            <Text style={styles.legendText}>초급 (1-3)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#3b82f6' }]} />
            <Text style={styles.legendText}>중급 (4-6)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
            <Text style={styles.legendText}>고급 (7-9)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#fbbf24' }]} />
            <Text style={styles.legendText}>마스터 (10+)</Text>
          </View>
        </View>
      </View>
      
      {/* 스킬 상세 모달 */}
      {renderSkillModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  
  categoryTabs: {
    backgroundColor: 'white',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  
  categoryTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[100],
  },
  
  categoryTabActive: {
    backgroundColor: colors.primary[500],
  },
  
  categoryTabText: {
    fontSize: typography.body.fontSize.sm,
    color: colors.neutral[600],
    fontWeight: typography.body.fontWeight.medium,
  },
  
  categoryTabTextActive: {
    color: 'white',
    fontWeight: typography.body.fontWeight.semibold,
  },
  
  canvas: {
    flex: 1,
    position: 'relative',
    backgroundColor: colors.neutral[50],
  },
  
  skillNodesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  
  skillNode: {
    position: 'absolute',
    alignItems: 'center',
  },
  
  skillGradient: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  
  skillIcon: {
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  
  levelBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    borderRadius: borderRadius.full,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  
  levelText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  progressRing: {
    position: 'absolute',
    borderRadius: borderRadius.full,
  },
  
  progressArc: {
    position: 'absolute',
    borderRadius: borderRadius.full,
    borderStyle: 'solid',
  },
  
  skillName: {
    marginTop: spacing.xs,
    fontSize: typography.body.fontSize.xs,
    color: colors.neutral[700],
    fontWeight: typography.body.fontWeight.medium,
    textAlign: 'center',
    maxWidth: 80,
  },
  
  connectionLine: {
    position: 'absolute',
    backgroundColor: colors.neutral[300],
    height: 2,
    opacity: 0.2,
  },
  
  zoomControls: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    flexDirection: 'column',
    gap: spacing.sm,
  },
  
  zoomButton: {
    width: 44,
    height: 44,
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
  
  legend: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    backgroundColor: 'white',
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
  
  // 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modalContent: {
    backgroundColor: 'white',
    borderRadius: borderRadius.xl,
    width: screenWidth * 0.9,
    maxHeight: screenHeight * 0.8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  
  modalHeader: {
    padding: spacing.xl,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    alignItems: 'center',
    position: 'relative',
  },
  
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modalIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  
  modalTitle: {
    fontSize: typography.heading.fontSize.lg,
    fontWeight: typography.heading.fontWeight.bold,
    color: 'white',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  
  modalLevelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  
  modalLevelBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  
  modalLevelText: {
    color: 'white',
    fontSize: typography.body.fontSize.sm,
    fontWeight: typography.body.fontWeight.bold,
  },
  
  modalCategory: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: typography.body.fontSize.sm,
    fontWeight: typography.body.fontWeight.medium,
  },
  
  modalBody: {
    padding: spacing.xl,
  },
  
  modalDescription: {
    fontSize: typography.body.fontSize.base,
    color: colors.neutral[700],
    lineHeight: 24,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  
  progressSection: {
    marginBottom: spacing.lg,
  },
  
  progressLabel: {
    fontSize: typography.body.fontSize.sm,
    fontWeight: typography.body.fontWeight.semibold,
    color: colors.neutral[700],
    marginBottom: spacing.sm,
  },
  
  progressBar: {
    height: 8,
    backgroundColor: colors.neutral[200],
    borderRadius: borderRadius.full,
    marginBottom: spacing.xs,
  },
  
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  
  progressText: {
    fontSize: typography.body.fontSize.xs,
    color: colors.neutral[500],
    textAlign: 'center',
  },
  
  benefitsSection: {
    marginBottom: spacing.lg,
  },
  
  benefitsTitle: {
    fontSize: typography.body.fontSize.sm,
    fontWeight: typography.body.fontWeight.semibold,
    color: colors.neutral[700],
    marginBottom: spacing.sm,
  },
  
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  
  benefitText: {
    fontSize: typography.body.fontSize.sm,
    color: colors.neutral[600],
    flex: 1,
  },
});

export default ModernSkillTree;
