import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CampusCredoBottomNav } from '../components/CampusCredoBottomNav';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import Svg, { Line, Circle, Path } from 'react-native-svg';
import { HollandProfileChart } from '../components/skill-tree/HollandProfileChart';

const { width: screenWidth } = Dimensions.get('window');

interface SkillNode {
  id: string;
  name: string;
  level: number;
  maxLevel: number;
  experience: number;
  category: string;
  icon: string;
  position: { x: number; y: number };
  prerequisites?: string[];
  description: string;
  benefits: string[];
  unlocked: boolean;
}

interface SkillTree {
  [category: string]: SkillNode[];
}

export default function SkillTreePage() {
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);
  const [showNodeModal, setShowNodeModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [showHollandProfile, setShowHollandProfile] = useState(false);

  // Mock Holland 성향 프로필 데이터
  const mockHollandProfile = {
    R: 65, // 현실형
    I: 85, // 탐구형
    A: 45, // 예술형
    S: 70, // 사회형
    E: 60, // 진취형
    C: 40, // 관습형
  };

  // Mock 스킬 트리 데이터
  const skillTree: SkillTree = {
    '학업': [
      {
        id: 'academic_1',
        name: '출석관리',
        level: 8,
        maxLevel: 10,
        experience: 80,
        category: '학업',
        icon: 'check-circle',
        position: { x: 0.2, y: 0.1 },
        description: '꾸준한 출석으로 학업 의지를 보여주는 기본 스킬',
        benefits: ['출석 보상 +20%', 'Credo 보너스 +5'],
        unlocked: true
      },
      {
        id: 'academic_2',
        name: '시험준비',
        level: 6,
        maxLevel: 10,
        experience: 60,
        category: '학업',
        icon: 'book',
        position: { x: 0.4, y: 0.2 },
        prerequisites: ['academic_1'],
        description: '체계적인 시험 준비로 학업 성취도를 높이는 스킬',
        benefits: ['학습 효율 +15%', '시험 보상 +25%'],
        unlocked: true
      },
      {
        id: 'academic_3',
        name: '프로젝트 수행',
        level: 4,
        maxLevel: 10,
        experience: 40,
        category: '학업',
        icon: 'folder',
        position: { x: 0.6, y: 0.1 },
        prerequisites: ['academic_2'],
        description: '팀 프로젝트와 과제 수행 능력',
        benefits: ['팀워크 +20%', '창의성 +15%'],
        unlocked: true
      },
      {
        id: 'academic_4',
        name: '연구역량',
        level: 0,
        maxLevel: 10,
        experience: 0,
        category: '학업',
        icon: 'search',
        position: { x: 0.8, y: 0.2 },
        prerequisites: ['academic_3'],
        description: '논문 작성과 연구 방법론 습득',
        benefits: ['논리적 사고 +30%', '분석 능력 +25%'],
        unlocked: false
      }
    ],
    '재무관리': [
      {
        id: 'finance_1',
        name: '가계부 작성',
        level: 5,
        maxLevel: 10,
        experience: 50,
        category: '재무관리',
        icon: 'dollar-sign',
        position: { x: 0.2, y: 0.4 },
        description: '수입과 지출을 체계적으로 관리하는 기초 스킬',
        benefits: ['지출 추적 정확도 +90%', '절약 의식 강화'],
        unlocked: true
      },
      {
        id: 'finance_2',
        name: '예산 계획',
        level: 3,
        maxLevel: 10,
        experience: 30,
        category: '재무관리',
        icon: 'pie-chart',
        position: { x: 0.4, y: 0.5 },
        prerequisites: ['finance_1'],
        description: '월별, 연별 예산을 세우고 관리하는 능력',
        benefits: ['예산 달성률 +80%', '재무 안정성 증대'],
        unlocked: true
      },
      {
        id: 'finance_3',
        name: '투자 기초',
        level: 1,
        maxLevel: 10,
        experience: 10,
        category: '재무관리',
        icon: 'trending-up',
        position: { x: 0.6, y: 0.4 },
        prerequisites: ['finance_2'],
        description: '기본적인 투자 지식과 리스크 관리',
        benefits: ['투자 수익률 +5%', '리스크 인식 개선'],
        unlocked: true
      },
      {
        id: 'finance_4',
        name: '재테크 전문가',
        level: 0,
        maxLevel: 10,
        experience: 0,
        category: '재무관리',
        icon: 'award',
        position: { x: 0.8, y: 0.5 },
        prerequisites: ['finance_3'],
        description: '고급 투자 전략과 자산 관리 전문 지식',
        benefits: ['포트폴리오 최적화', '장기 자산 증식'],
        unlocked: false
      }
    ],
    '자기계발': [
      {
        id: 'development_1',
        name: '독서 습관',
        level: 7,
        maxLevel: 10,
        experience: 70,
        category: '자기계발',
        icon: 'book-open',
        position: { x: 0.2, y: 0.7 },
        description: '꾸준한 독서로 지식과 교양을 쌓는 스킬',
        benefits: ['지식 흡수력 +25%', '어휘력 증진'],
        unlocked: true
      },
      {
        id: 'development_2',
        name: '온라인 학습',
        level: 4,
        maxLevel: 10,
        experience: 40,
        category: '자기계발',
        icon: 'monitor',
        position: { x: 0.4, y: 0.8 },
        prerequisites: ['development_1'],
        description: '온라인 강의와 디지털 학습 도구 활용',
        benefits: ['학습 속도 +30%', '디지털 리터러시 향상'],
        unlocked: true
      },
      {
        id: 'development_3',
        name: '외국어',
        level: 2,
        maxLevel: 10,
        experience: 20,
        category: '자기계발',
        icon: 'globe',
        position: { x: 0.6, y: 0.7 },
        prerequisites: ['development_2'],
        description: '외국어 실력 향상으로 글로벌 역량 강화',
        benefits: ['의사소통 능력 확장', '국제적 기회 증가'],
        unlocked: true
      },
      {
        id: 'development_4',
        name: '전문 자격증',
        level: 0,
        maxLevel: 10,
        experience: 0,
        category: '자기계발',
        icon: 'award',
        position: { x: 0.8, y: 0.8 },
        prerequisites: ['development_3'],
        description: '전문 분야 자격증 취득으로 경쟁력 강화',
        benefits: ['전문성 인증', '취업 경쟁력 +50%'],
        unlocked: false
      }
    ],
    '대외활동': [
      {
        id: 'social_1',
        name: '동아리 활동',
        level: 3,
        maxLevel: 10,
        experience: 30,
        category: '대외활동',
        icon: 'users',
        position: { x: 0.1, y: 0.4 },
        description: '동아리를 통한 인맥 형성과 협업 경험',
        benefits: ['네트워킹 +40%', '팀워크 스킬 향상'],
        unlocked: true
      },
      {
        id: 'social_2',
        name: '봉사활동',
        level: 2,
        maxLevel: 10,
        experience: 20,
        category: '대외활동',
        icon: 'heart',
        position: { x: 0.3, y: 0.6 },
        prerequisites: ['social_1'],
        description: '지역사회 기여를 통한 사회적 책임감 함양',
        benefits: ['공감 능력 +35%', '사회 기여도 인정'],
        unlocked: true
      },
      {
        id: 'social_3',
        name: '리더십',
        level: 1,
        maxLevel: 10,
        experience: 10,
        category: '대외활동',
        icon: 'flag',
        position: { x: 0.5, y: 0.4 },
        prerequisites: ['social_1', 'social_2'],
        description: '팀을 이끌고 목표를 달성하는 리더십 역량',
        benefits: ['조직 운영 능력', '의사결정력 +40%'],
        unlocked: true
      },
      {
        id: 'social_4',
        name: '멘토링',
        level: 0,
        maxLevel: 10,
        experience: 0,
        category: '대외활동',
        icon: 'user-check',
        position: { x: 0.7, y: 0.6 },
        prerequisites: ['social_3'],
        description: '후배나 동료를 지도하고 성장시키는 능력',
        benefits: ['교육 능력 개발', '영향력 확대'],
        unlocked: false
      }
    ]
  };

  const categories = ['전체', '학업', '재무관리', '자기계발', '대외활동'];

  const getFilteredSkills = () => {
    if (selectedCategory === '전체') {
      return Object.values(skillTree).flat();
    }
    return skillTree[selectedCategory] || [];
  };

  const getSkillColor = (skill: SkillNode) => {
    if (!skill.unlocked) return '#9CA3AF';
    
    switch (skill.category) {
      case '학업': return '#3B82F6';
      case '재무관리': return '#10B981';
      case '자기계발': return '#8B5CF6';
      case '대외활동': return '#EC4899';
      default: return '#6B7280';
    }
  };

  const getNodeSize = (level: number, maxLevel: number) => {
    const baseSize = 50;
    const sizeIncrease = (level / maxLevel) * 20;
    return baseSize + sizeIncrease;
  };

  const calculateTotalLevel = () => {
    return Object.values(skillTree).flat().reduce((total, skill) => total + skill.level, 0);
  };

  const calculateAverageLevel = () => {
    const allSkills = Object.values(skillTree).flat();
    const totalLevel = allSkills.reduce((total, skill) => total + skill.level, 0);
    return Math.round((totalLevel / allSkills.length) * 10) / 10;
  };

  const SkillNodeModal = () => (
    <Modal
      visible={showNodeModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowNodeModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowNodeModal(false)}>
            <Feather name="x" size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>스킬 상세</Text>
          <View style={{ width: 24 }} />
        </View>

        {selectedNode && (
          <ScrollView style={styles.modalContent}>
            <View style={styles.skillDetailCard}>
              <View style={styles.skillDetailHeader}>
                <View style={styles.skillIconContainer}>
                  <View style={[
                    styles.skillIconBg,
                    { backgroundColor: getSkillColor(selectedNode) + '20' }
                  ]}>
                    <Feather 
                      name={selectedNode.icon as any} 
                      size={32} 
                      color={getSkillColor(selectedNode)} 
                    />
                  </View>
                </View>
                <View style={styles.skillInfo}>
                  <Text style={styles.skillDetailName}>{selectedNode.name}</Text>
                  <Text style={styles.skillCategory}>{selectedNode.category}</Text>
                  <View style={styles.skillLevelInfo}>
                    <Text style={styles.skillLevel}>Lv. {selectedNode.level}/{selectedNode.maxLevel}</Text>
                    <Text style={styles.skillExp}>{selectedNode.experience}% XP</Text>
                  </View>
                </View>
              </View>

              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${selectedNode.experience}%`,
                        backgroundColor: getSkillColor(selectedNode)
                      }
                    ]} 
                  />
                </View>
              </View>

              <Text style={styles.skillDescription}>{selectedNode.description}</Text>

              {selectedNode.benefits.length > 0 && (
                <View style={styles.benefitsSection}>
                  <Text style={styles.sectionTitle}>스킬 효과</Text>
                  {selectedNode.benefits.map((benefit, index) => (
                    <View key={index} style={styles.benefitItem}>
                      <Feather name="check" size={16} color="#10B981" />
                      <Text style={styles.benefitText}>{benefit}</Text>
                    </View>
                  ))}
                </View>
              )}

              {selectedNode.prerequisites && selectedNode.prerequisites.length > 0 && (
                <View style={styles.prerequisitesSection}>
                  <Text style={styles.sectionTitle}>선행 조건</Text>
                  {selectedNode.prerequisites.map((prereq, index) => {
                    const prereqSkill = Object.values(skillTree).flat().find(s => s.id === prereq);
                    return (
                      <View key={index} style={styles.prerequisiteItem}>
                        <Feather name="arrow-right" size={16} color="#6B7280" />
                        <Text style={styles.prerequisiteText}>
                          {prereqSkill?.name || prereq} (레벨 {prereqSkill?.level || 0})
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}

              {!selectedNode.unlocked && (
                <View style={styles.lockedSection}>
                  <Feather name="lock" size={20} color="#EF4444" />
                  <Text style={styles.lockedText}>
                    선행 조건을 만족하면 잠금 해제됩니다
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
      {/* 헤더 */}
      <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>스킬 트리</Text>
          <Text style={styles.headerSubtitle}>
            총 레벨: {calculateTotalLevel()} | 평균: {calculateAverageLevel()}
          </Text>
        </View>
        <View style={styles.headerStats}>
          <Feather name="trending-up" size={20} color="#8B5CF6" />
        </View>
      </Animated.View>

      {/* Holland 성향 분석 차트 */}
      {showHollandProfile && (
        <Animated.View entering={FadeInDown.delay(150)}>
          <HollandProfileChart
            profile={mockHollandProfile}
            isVisible={true}
          />
        </Animated.View>
      )}

      {/* 카테고리 필터 */}
      <Animated.View entering={FadeInDown.delay(200)} style={styles.categoryContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollContainer}
        >
          {categories.map((category) => (
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
      </Animated.View>

      {/* 스킬 트리 시각화 */}
      <ScrollView style={styles.treeContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.treeContent}>
          <Svg width={screenWidth - 40} height={600} style={styles.treeSvg}>
            {/* 연결선 그리기 */}
            {getFilteredSkills().map((skill) => {
              if (!skill.prerequisites) return null;
              
              return skill.prerequisites.map((prereqId) => {
                const prereqSkill = getFilteredSkills().find(s => s.id === prereqId);
                if (!prereqSkill) return null;

                const startX = prereqSkill.position.x * (screenWidth - 40);
                const startY = prereqSkill.position.y * 600;
                const endX = skill.position.x * (screenWidth - 40);
                const endY = skill.position.y * 600;

                return (
                  <Line
                    key={`${prereqId}-${skill.id}`}
                    x1={startX}
                    y1={startY}
                    x2={endX}
                    y2={endY}
                    stroke={skill.unlocked ? "#D1D5DB" : "#F3F4F6"}
                    strokeWidth={2}
                    strokeDasharray={skill.unlocked ? "0" : "5,5"}
                  />
                );
              });
            })}
          </Svg>

          {/* 스킬 노드들 */}
          {getFilteredSkills().map((skill, index) => (
            <Animated.View
              key={skill.id}
              entering={FadeInDown.delay(300 + index * 50)}
              style={[
                styles.skillNode,
                {
                  left: skill.position.x * (screenWidth - 40) - getNodeSize(skill.level, skill.maxLevel) / 2,
                  top: skill.position.y * 600 - getNodeSize(skill.level, skill.maxLevel) / 2,
                  width: getNodeSize(skill.level, skill.maxLevel),
                  height: getNodeSize(skill.level, skill.maxLevel),
                  backgroundColor: skill.unlocked ? getSkillColor(skill) + '20' : '#F3F4F6',
                  borderColor: getSkillColor(skill),
                  borderWidth: skill.unlocked ? 2 : 1,
                  opacity: skill.unlocked ? 1 : 0.6,
                }
              ]}
            >
              <TouchableOpacity
                style={styles.nodeButton}
                onPress={() => {
                  setSelectedNode(skill);
                  setShowNodeModal(true);
                }}
              >
                <Feather 
                  name={skill.icon as any} 
                  size={getNodeSize(skill.level, skill.maxLevel) * 0.4} 
                  color={getSkillColor(skill)} 
                />
                
                {/* 레벨 표시 */}
                {skill.level > 0 && (
                  <View style={styles.levelBadge}>
                    <Text style={styles.levelText}>{skill.level}</Text>
                  </View>
                )}
                
                {/* 잠금 표시 */}
                {!skill.unlocked && (
                  <View style={styles.lockIcon}>
                    <Feather name="lock" size={12} color="#EF4444" />
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          ))}

          {/* 스킬 이름 라벨 */}
          {getFilteredSkills().map((skill) => (
            <View
              key={`${skill.id}-label`}
              style={[
                styles.skillLabel,
                {
                  left: skill.position.x * (screenWidth - 40) - 40,
                  top: skill.position.y * 600 + getNodeSize(skill.level, skill.maxLevel) / 2 + 5,
                }
              ]}
            >
              <Text style={[
                styles.skillLabelText,
                { color: skill.unlocked ? '#1F2937' : '#9CA3AF' }
              ]}>
                {skill.name}
              </Text>
            </View>
          ))}
        </View>

        {/* 하단 패딩 */}
        <View style={{ height: 100 }} />
      </ScrollView>
      </View>

      {/* 하단 네비게이션 */}
      <CampusCredoBottomNav />
      
      <SkillNodeModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  headerStats: {
    padding: 8,
  },
  categoryContainer: {
    backgroundColor: 'white',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryScrollContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  categoryTabActive: {
    backgroundColor: '#8B5CF6',
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  categoryTabTextActive: {
    color: 'white',
  },
  treeContainer: {
    flex: 1,
  },
  treeContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    minHeight: 600,
    position: 'relative',
  },
  treeSvg: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  skillNode: {
    position: 'absolute',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nodeButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  levelBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  lockIcon: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: 'white',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skillLabel: {
    position: 'absolute',
    width: 80,
    alignItems: 'center',
  },
  skillLabelText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  skillDetailCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  skillDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  skillIconContainer: {
    marginRight: 16,
  },
  skillIconBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skillInfo: {
    flex: 1,
  },
  skillDetailName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  skillCategory: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  skillLevelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  skillLevel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
  },
  skillExp: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  skillDescription: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 20,
  },
  benefitsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
  prerequisitesSection: {
    marginBottom: 20,
  },
  prerequisiteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  prerequisiteText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    flex: 1,
  },
  lockedSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  lockedText: {
    fontSize: 14,
    color: '#DC2626',
    marginLeft: 8,
    fontWeight: '500',
  },
});
