import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Animated,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// 스킬 카테고리 타입
type SkillCategory = 'academic' | 'financial' | 'chronicle';

// 스킬 노드 인터페이스
interface SkillNode {
  id: string;
  name: string;
  level: number;
  maxLevel: number;
  currentXP: number;
  maxXP: number;
  category: SkillCategory;
  icon: string;
  color: string;
  description: string;
  benefits: string[];
  unlocked: boolean;
  position: { x: number; y: number };
  connections: string[];
  apiEndpoint?: string;
  realData?: any;
}

// Holland 성향 타입
interface HollandProfile {
  realistic: number;    // 현실형
  investigative: number; // 탐구형
  artistic: number;     // 예술형
  social: number;       // 사회형
  enterprising: number; // 진취형
  conventional: number; // 관습형
}

// AI 분석 결과 타입
interface AIAnalysis {
  strengths: string[];
  weaknesses: string[];
  personality: string[];
  recommendations: string[];
  careerSuggestions: string[];
}

const NewSkillTreeSystem: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory>('academic');
  const [selectedSkill, setSelectedSkill] = useState<SkillNode | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [hollandProfile, setHollandProfile] = useState<HollandProfile>({
    realistic: 75,
    investigative: 60,
    artistic: 45,
    social: 80,
    enterprising: 65,
    conventional: 40,
  });

  // 애니메이션 값들
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    // 컴포넌트 마운트 시 애니메이션
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // 애니메이션 값들
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    // 컴포넌트 마운트 시 애니메이션
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // 학사 스킬트리 데이터
  const academicSkills: SkillNode[] = [
    {
      id: 'attendance',
      name: '출석관리',
      level: 8,
      maxLevel: 10,
      currentXP: 800,
      maxXP: 1000,
      category: 'academic',
      icon: '📚',
      color: '#6366f1',
      description: '꾸준한 출석으로 학업 의지를 보여주는 기본 스킬',
      benefits: ['출석 보상 +20%', 'Credo 보너스 +5'],
      unlocked: true,
      position: { x: 200, y: 150 },
      connections: ['study_plan'],
      apiEndpoint: '/api/academic/attendance',
    },
    {
      id: 'study_plan',
      name: '학업계획',
      level: 6,
      maxLevel: 10,
      currentXP: 600,
      maxXP: 1000,
      category: 'academic',
      icon: '📋',
      color: '#8b5cf6',
      description: '체계적인 학습 계획 수립 및 실행 능력',
      benefits: ['학습 효율 +15%', '스트레스 감소'],
      unlocked: true,
      position: { x: 400, y: 150 },
      connections: ['attendance', 'exam_prep'],
      apiEndpoint: '/api/academic/study-plans',
    },
    {
      id: 'exam_prep',
      name: '시험준비',
      level: 7,
      maxLevel: 10,
      currentXP: 700,
      maxXP: 1000,
      category: 'academic',
      icon: '📝',
      color: '#ec4899',
      description: '효과적인 시험 준비 및 성적 향상',
      benefits: ['시험 성적 +25%', '자신감 증가'],
      unlocked: true,
      position: { x: 300, y: 300 },
      connections: ['study_plan', 'assignment'],
      apiEndpoint: '/api/academic/exam-results',
    },
    {
      id: 'assignment',
      name: '과제완성',
      level: 5,
      maxLevel: 10,
      currentXP: 500,
      maxXP: 1000,
      category: 'academic',
      icon: '📖',
      color: '#f59e0b',
      description: '과제 완성도 및 품질 향상',
      benefits: ['과제 점수 +30%', '창의력 향상'],
      unlocked: true,
      position: { x: 500, y: 300 },
      connections: ['exam_prep'],
      apiEndpoint: '/api/academic/assignments',
    },
  ];

  // 금융 스킬트리 데이터
  const financialSkills: SkillNode[] = [
    {
      id: 'budget_management',
      name: '예산관리',
      level: 9,
      maxLevel: 10,
      currentXP: 900,
      maxXP: 1000,
      category: 'financial',
      icon: '💰',
      color: '#10b981',
      description: '체계적인 예산 수립 및 지출 관리',
      benefits: ['절약 효과 +25%', '재정 안정성'],
      unlocked: true,
      position: { x: 200, y: 150 },
      connections: ['investment_knowledge'],
      apiEndpoint: '/api/financial/budget',
    },
    {
      id: 'investment_knowledge',
      name: '투자지식',
      level: 4,
      maxLevel: 10,
      currentXP: 400,
      maxXP: 1000,
      category: 'financial',
      icon: '📈',
      color: '#059669',
      description: '다양한 투자 상품에 대한 이해와 지식',
      benefits: ['투자 수익률 +20%', '리스크 관리'],
      unlocked: true,
      position: { x: 400, y: 150 },
      connections: ['budget_management', 'credit_management'],
      apiEndpoint: '/api/financial/investments',
    },
    {
      id: 'credit_management',
      name: '신용관리',
      level: 6,
      maxLevel: 10,
      currentXP: 600,
      maxXP: 1000,
      category: 'financial',
      icon: '💳',
      color: '#0d9488',
      description: '신용점수 향상 및 신용카드 관리',
      benefits: ['신용점수 +30%', '대출 조건 개선'],
      unlocked: true,
      position: { x: 300, y: 300 },
      connections: ['investment_knowledge', 'saving_habit'],
      apiEndpoint: '/api/financial/credit-score',
    },
    {
      id: 'saving_habit',
      name: '절약습관',
      level: 8,
      maxLevel: 10,
      currentXP: 800,
      maxXP: 1000,
      category: 'financial',
      icon: '🏦',
      color: '#047857',
      description: '지속적인 절약 및 저축 습관',
      benefits: ['저축률 +35%', '재정 목표 달성'],
      unlocked: true,
      position: { x: 500, y: 300 },
      connections: ['credit_management'],
      apiEndpoint: '/api/financial/savings',
    },
  ];

  // 현재 선택된 스킬트리
  const getCurrentSkills = () => {
    switch (selectedCategory) {
      case 'academic':
        return academicSkills;
      case 'financial':
        return financialSkills;
      case 'chronicle':
        return [];
      default:
        return academicSkills;
    }
  };

  // 스킬 노드 렌더링
  const renderSkillNode = (skill: SkillNode, index: number) => {
    const progress = (skill.currentXP / skill.maxXP) * 100;
    const size = 90;
    
    // 스킬별 애니메이션 지연
    const delay = index * 100;
    
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
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: slideAnim }
            ]
          }
        ]}
      >
        <TouchableOpacity
          style={styles.skillTouchable}
          onPress={() => setSelectedSkill(skill)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[skill.color, skill.color + '80', skill.color + '40']}
            style={[styles.skillGradient, { borderRadius: size / 2 }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* 스킬 아이콘 */}
            <Text style={styles.skillIcon}>{skill.icon}</Text>
            
            {/* 레벨 배지 */}
            <View style={[styles.levelBadge, { backgroundColor: getLevelColor(skill.level) }]}>
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
                    borderWidth: 8,
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    borderTopColor: progress >= 100 ? '#10b981' : '#fbbf24',
                    transform: [{ rotate: `${-90 + (progress / 100) * 360}deg` }]
                  }
                ]} 
              />
            </View>
            
            {/* 글로우 효과 */}
            <View style={[styles.glowEffect, { backgroundColor: skill.color + '20' }]} />
          </LinearGradient>
          
          {/* 스킬 이름 */}
          <Text style={styles.skillName} numberOfLines={1}>
            {skill.name}
          </Text>
          
          {/* XP 표시 */}
          <Text style={styles.skillXP}>
            {skill.currentXP.toLocaleString()} / {skill.maxXP.toLocaleString()} XP
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // 레벨별 색상
  const getLevelColor = (level: number) => {
    if (level >= 8) return '#10b981';
    if (level >= 6) return '#f59e0b';
    if (level >= 4) return '#f97316';
    return '#ef4444';
  };

  // 연결선 렌더링
  const renderConnections = () => {
    const skills = getCurrentSkills();
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

  // Holland 다각형 차트 렌더링
  const renderHollandChart = () => {
    const centerX = 300;
    const centerY = 200;
    const radius = 100;
    
    const points = [
      { angle: 0, value: hollandProfile.realistic, label: '현실형', color: '#6366f1' },
      { angle: 60, value: hollandProfile.investigative, label: '탐구형', color: '#8b5cf6' },
      { angle: 120, value: hollandProfile.artistic, label: '예술형', color: '#ec4899' },
      { angle: 180, value: hollandProfile.social, label: '사회형', color: '#10b981' },
      { angle: 240, value: hollandProfile.enterprising, label: '진취형', color: '#f59e0b' },
      { angle: 300, value: hollandProfile.conventional, label: '관습형', color: '#ef4444' },
    ];

    const chartPoints = points.map(point => {
      const x = centerX + (point.value / 100) * radius * Math.cos((point.angle - 90) * Math.PI / 180);
      const y = centerY + (point.value / 100) * radius * Math.sin((point.angle - 90) * Math.PI / 180);
      return { x, y, label: point.label, value: point.value, color: point.color };
    });

    return (
      <View style={styles.hollandChart}>
        <Text style={styles.chartTitle}>🎯 Holland 성향 분석</Text>
        <Text style={styles.chartSubtitle}>당신의 성향을 파악하고 맞춤형 추천을 받아보세요</Text>
        
        <View style={styles.chartContainer}>
          {/* 배경 원형 그리드 */}
          <View style={[styles.backgroundCircle, { width: radius * 2, height: radius * 2, left: centerX - radius, top: centerY - radius }]} />
          <View style={[styles.backgroundCircle, { width: radius * 1.5, height: radius * 1.5, left: centerX - radius * 0.75, top: centerY - radius * 0.75 }]} />
          <View style={[styles.backgroundCircle, { width: radius, height: radius, left: centerX - radius * 0.5, top: centerY - radius * 0.5 }]} />
          
          {/* 다각형 그리기 */}
          <View style={styles.polygon}>
            {chartPoints.map((point, index) => (
              <View key={index} style={[styles.chartPoint, { left: point.x - 8, top: point.y - 8, backgroundColor: point.color }]}>
                <Text style={styles.pointValue}>{point.value}</Text>
              </View>
            ))}
          </View>
          
          {/* 레이블 */}
          {chartPoints.map((point, index) => (
            <View
              key={`label-${index}`}
              style={[
                styles.chartLabelContainer,
                { left: point.x - 30, top: point.y + 15 }
              ]}
            >
              <Text style={[styles.chartLabel, { color: point.color }]}>
                {point.label}
              </Text>
            </View>
          ))}
        </View>
        
        {/* 성향 설명 */}
        <View style={styles.hollandDescription}>
          <Text style={styles.descriptionTitle}>성향별 특징</Text>
          <View style={styles.descriptionGrid}>
            <View style={styles.descriptionItem}>
              <Text style={[styles.descriptionDot, { backgroundColor: '#6366f1' }]}>●</Text>
              <Text style={styles.descriptionText}>현실형: 실용적이고 체계적인 성향</Text>
            </View>
            <View style={styles.descriptionItem}>
              <Text style={[styles.descriptionDot, { backgroundColor: '#8b5cf6' }]}>●</Text>
              <Text style={styles.descriptionText}>탐구형: 분석적이고 연구하는 성향</Text>
            </View>
            <View style={styles.descriptionItem}>
              <Text style={[styles.descriptionDot, { backgroundColor: '#ec4899' }]}>●</Text>
              <Text style={styles.descriptionText}>예술형: 창의적이고 표현하는 성향</Text>
            </View>
            <View style={styles.descriptionItem}>
              <Text style={[styles.descriptionDot, { backgroundColor: '#10b981' }]}>●</Text>
              <Text style={styles.descriptionText}>사회형: 협력적이고 도움을 주는 성향</Text>
            </View>
            <View style={styles.descriptionItem}>
              <Text style={[styles.descriptionDot, { backgroundColor: '#f59e0b' }]}>●</Text>
              <Text style={styles.descriptionText}>진취형: 리더십 있고 설득하는 성향</Text>
            </View>
            <View style={styles.descriptionItem}>
              <Text style={[styles.descriptionDot, { backgroundColor: '#ef4444' }]}>●</Text>
              <Text style={styles.descriptionText}>관습형: 정확하고 규칙을 따르는 성향</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // Holland 각도별 레이블
  const getHollandLabel = (angle: number) => {
    switch (angle) {
      case 0: return '현실형';
      case 60: return '탐구형';
      case 120: return '예술형';
      case 180: return '사회형';
      case 240: return '진취형';
      case 300: return '관습형';
      default: return '';
    }
  };

  // AI 분석 실행
  const runAIAnalysis = async () => {
    try {
      // 실제로는 AI API를 호출하여 분석
      const mockAnalysis: AIAnalysis = {
        strengths: [
          '사회적 상호작용 능력이 뛰어남',
          '체계적인 계획 수립 능력',
          '지속적인 학습 의지'
        ],
        weaknesses: [
          '예술적 창의성 부족',
          '관습적 사고 패턴',
          '리스크 감수 성향 부족'
        ],
        personality: [
          '협력적이고 친화적인 성격',
          '논리적이고 체계적인 사고',
          '안정성과 확실성을 추구'
        ],
        recommendations: [
          '창의적 사고 훈련 프로그램 참여',
          '새로운 경험 도전',
          '다양한 관점에서 문제 접근'
        ],
        careerSuggestions: [
          '교육자, 상담사, 사회복지사',
          '프로젝트 매니저, 분석가',
          '공무원, 연구원'
        ]
      };
      
      setAiAnalysis(mockAnalysis);
      setShowAnalysis(true);
    } catch (error) {
      Alert.alert('오류', 'AI 분석을 실행할 수 없습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      {/* 헤더 */}
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>🎯 스킬트리 시스템</Text>
            <Text style={styles.subtitle}>당신의 성장을 시각화하고 분석하세요</Text>
          </View>
          <TouchableOpacity
            style={styles.analysisButton}
            onPress={runAIAnalysis}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#6366f1', '#8b5cf6']}
              style={styles.analysisButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialIcons name="psychology" size={20} color="white" />
              <Text style={styles.analysisButtonText}>나 알아보기</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* 카테고리 선택 */}
      <Animated.View 
        style={[
          styles.categorySelector,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <TouchableOpacity
          style={[
            styles.categoryButton,
            selectedCategory === 'academic' && styles.selectedCategory
          ]}
          onPress={() => setSelectedCategory('academic')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={selectedCategory === 'academic' ? ['#e0e7ff', '#c7d2fe'] : ['#f1f5f9', '#e2e8f0']}
            style={styles.categoryButtonGradient}
          >
            <MaterialIcons name="school" size={24} color={selectedCategory === 'academic' ? '#6366f1' : '#6b7280'} />
            <Text style={[styles.categoryText, selectedCategory === 'academic' && styles.selectedCategoryText]}>
              학사
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.categoryButton,
            selectedCategory === 'financial' && styles.selectedCategory
          ]}
          onPress={() => setSelectedCategory('financial')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={selectedCategory === 'financial' ? ['#d1fae5', '#a7f3d0'] : ['#f1f5f9', '#e2e8f0']}
            style={styles.categoryButtonGradient}
          >
            <MaterialIcons name="account-balance" size={24} color={selectedCategory === 'financial' ? '#10b981' : '#6b7280'} />
            <Text style={[styles.categoryText, selectedCategory === 'financial' && styles.selectedCategoryText]}>
              금융
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.categoryButton,
            selectedCategory === 'chronicle' && styles.selectedCategory
          ]}
          onPress={() => setSelectedCategory('chronicle')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={selectedCategory === 'chronicle' ? ['#fef3c7', '#fde68a'] : ['#f1f5f9', '#e2e8f0']}
            style={styles.categoryButtonGradient}
          >
            <MaterialIcons name="insights" size={24} color={selectedCategory === 'chronicle' ? '#f59e0b' : '#6b7280'} />
            <Text style={[styles.categoryText, selectedCategory === 'chronicle' && styles.selectedCategoryText]}>
              크로니클
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* 스킬트리 컨테이너 */}
      <ScrollView 
        style={styles.skillTreeContainer} 
        contentContainerStyle={styles.skillTreeContent}
        showsVerticalScrollIndicator={false}
      >
        {selectedCategory === 'chronicle' ? (
          // 크로니클 - Holland 차트
          renderHollandChart()
        ) : (
          // 학사/금융 - 스킬트리
          <View style={styles.skillTree}>
            {renderConnections()}
            {getCurrentSkills().map((skill, index) => renderSkillNode(skill, index))}
          </View>
        )}
      </ScrollView>

      {/* 스킬 상세 정보 모달 */}
      {selectedSkill && (
        <Animated.View 
          style={[
            styles.modal,
            { opacity: fadeAnim }
          ]}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modalTitle}>{selectedSkill.name}</Text>
                <Text style={styles.modalSubtitle}>{selectedSkill.description}</Text>
              </View>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setSelectedSkill(null)}
                activeOpacity={0.7}
              >
                <MaterialIcons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.skillInfo}>
              <View style={styles.progressSection}>
                <Text style={styles.progressLabel}>진행률</Text>
                <View style={styles.progressBar}>
                  <LinearGradient
                    colors={[selectedSkill.color, selectedSkill.color + '80']}
                    style={[
                      styles.progressFill,
                      { 
                        width: `${(selectedSkill.currentXP / selectedSkill.maxXP) * 100}%`
                      }
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                </View>
                <Text style={styles.progressText}>
                  {selectedSkill.currentXP.toLocaleString()} / {selectedSkill.maxXP.toLocaleString()} XP
                </Text>
              </View>
              
              <View style={styles.benefitsSection}>
                <Text style={styles.benefitsLabel}>✨ 스킬 효과</Text>
                {selectedSkill.benefits.map((benefit, index) => (
                  <View key={index} style={styles.benefitItem}>
                    <Text style={styles.benefitIcon}>🎯</Text>
                    <Text style={styles.benefitText}>{benefit}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </Animated.View>
      )}

      {/* AI 분석 결과 모달 */}
      {showAnalysis && aiAnalysis && (
        <Animated.View 
          style={[
            styles.modal,
            { opacity: fadeAnim }
          ]}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modalTitle}>🤖 AI 개인 분석 결과</Text>
                <Text style={styles.modalSubtitle}>당신만의 맞춤형 분석 리포트</Text>
              </View>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowAnalysis(false)}
                activeOpacity={0.7}
              >
                <MaterialIcons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.analysisContent} showsVerticalScrollIndicator={false}>
              <View style={styles.analysisSection}>
                <Text style={styles.analysisSectionTitle}>💪 강점</Text>
                {aiAnalysis.strengths.map((strength, index) => (
                  <View key={index} style={styles.analysisItem}>
                    <Text style={styles.analysisIcon}>✅</Text>
                    <Text style={styles.analysisText}>{strength}</Text>
                  </View>
                ))}
              </View>
              
              <View style={styles.analysisSection}>
                <Text style={styles.analysisSectionTitle}>⚠️ 개선점</Text>
                {aiAnalysis.weaknesses.map((weakness, index) => (
                  <View key={index} style={styles.analysisItem}>
                    <Text style={styles.analysisIcon}>🔧</Text>
                    <Text style={styles.analysisText}>{weakness}</Text>
                  </View>
                ))}
              </View>
              
              <View style={styles.analysisSection}>
                <Text style={styles.analysisSectionTitle}>🎭 성향</Text>
                {aiAnalysis.personality.map((trait, index) => (
                  <View key={index} style={styles.analysisItem}>
                    <Text style={styles.analysisIcon}>🎨</Text>
                    <Text style={styles.analysisText}>{trait}</Text>
                  </View>
                ))}
              </View>
              
              <View style={styles.analysisSection}>
                <Text style={styles.analysisSectionTitle}>💡 추천사항</Text>
                {aiAnalysis.recommendations.map((rec, index) => (
                  <View key={index} style={styles.analysisItem}>
                    <Text style={styles.analysisIcon}>💡</Text>
                    <Text style={styles.analysisText}>{rec}</Text>
                  </View>
                ))}
              </View>
              
              <View style={styles.analysisSection}>
                <Text style={styles.analysisSectionTitle}>🚀 직업 추천</Text>
                {aiAnalysis.careerSuggestions.map((career, index) => (
                  <View key={index} style={styles.analysisItem}>
                    <Text style={styles.analysisIcon}>🎯</Text>
                    <Text style={styles.analysisText}>{career}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingTop: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  analysisButton: {
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  analysisButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  analysisButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
  },
  categorySelector: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    gap: 12,
  },
  categoryButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedCategory: {
    elevation: 4,
    shadowOpacity: 0.2,
  },
  categoryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  categoryText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  selectedCategoryText: {
    color: '#1e293b',
  },
  skillTreeContainer: {
    flex: 1,
  },
  skillTreeContent: {
    padding: 20,
  },
  skillTree: {
    position: 'relative',
    width: 600,
    height: 500,
  },
  skillNode: {
    position: 'absolute',
    alignItems: 'center',
  },
  skillTouchable: {
    alignItems: 'center',
  },
  skillGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  skillIcon: {
    fontSize: 36,
    marginBottom: 4,
  },
  levelBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  levelText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressRing: {
    position: 'absolute',
    borderRadius: 45,
  },
  progressArc: {
    position: 'absolute',
    borderRadius: 45,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  glowEffect: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 45,
    opacity: 0.3,
  },
  skillName: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    maxWidth: 90,
  },
  skillXP: {
    marginTop: 4,
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
    textAlign: 'center',
  },
  connectionLine: {
    position: 'absolute',
    backgroundColor: '#cbd5e1',
    height: 3,
    borderRadius: 2,
    opacity: 0.6,
  },
  hollandChart: {
    alignItems: 'center',
    padding: 20,
  },
  chartTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  chartSubtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 30,
    textAlign: 'center',
  },
  chartContainer: {
    position: 'relative',
    width: 400,
    height: 300,
    marginBottom: 30,
  },
  backgroundCircle: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 1000,
    opacity: 0.3,
  },
  polygon: {
    position: 'absolute',
    width: 400,
    height: 300,
  },
  chartPoint: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  pointValue: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  chartLabelContainer: {
    position: 'absolute',
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  chartLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  hollandDescription: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  descriptionGrid: {
    gap: 12,
  },
  descriptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  descriptionDot: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  descriptionText: {
    fontSize: 14,
    color: '#4b5563',
    flex: 1,
  },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxHeight: '85%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  modalTitleContainer: {
    flex: 1,
    marginRight: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skillInfo: {
    gap: 20,
  },
  progressSection: {
    gap: 12,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  progressBar: {
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  benefitsSection: {
    gap: 12,
  },
  benefitsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  benefitIcon: {
    fontSize: 16,
  },
  benefitText: {
    fontSize: 14,
    color: '#4b5563',
    flex: 1,
    lineHeight: 20,
  },
  analysisContent: {
    maxHeight: 500,
  },
  analysisSection: {
    marginBottom: 24,
  },
  analysisSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  analysisItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
    paddingVertical: 4,
  },
  analysisIcon: {
    fontSize: 16,
    marginTop: 2,
  },
  analysisText: {
    fontSize: 14,
    color: '#4b5563',
    flex: 1,
    lineHeight: 20,
  },
});

export default NewSkillTreeSystem;
