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
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import SkillService, { SkillNode } from '../../services/skillService';

const { width, height } = Dimensions.get('window');

// 스킬 카테고리 타입
type SkillCategory = 'academic' | 'financial' | 'chronicle';

// SkillNode 인터페이스는 skillService.ts에서 import하여 사용

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
  const [networkStatus, setNetworkStatus] = useState<boolean>(true);
  
  // API 데이터를 저장할 상태들
  const [academicSkills, setAcademicSkills] = useState<SkillNode[]>([]);
  const [financialSkills, setFinancialSkills] = useState<SkillNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 사용자 기본 데이터 (실제로는 API에서 가져올 데이터)
  const [academicData, setAcademicData] = useState({
    grade: 3,
    department: '컴퓨터소프트웨어공학과',
    university: 'SSAFY 대학교'
  });

  const [financialData, setFinancialData] = useState({
    total_assets: 8000000,
    monthly_income: 2000000,
    monthly_spending: 1500000,
    credit_score: { grade: 'B' }
  });

  const [skillData, setSkillData] = useState({
    skills: {
      programming: 85,
      analysis: 75,
      communication: 80,
      leadership: 70
    }
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
    
    // 네트워크 상태 주기적 확인
    const checkNetwork = async () => {
      const status = await checkNetworkStatus();
      setNetworkStatus(status);
    };
    
    checkNetwork(); // 초기 확인
    const interval = setInterval(checkNetwork, 30000); // 30초마다 확인
    
    // API에서 스킬 데이터 가져오기
    fetchSkillData();
    
    return () => clearInterval(interval);
  }, []);

  // 기본 학사 스킬 데이터 (API 로드 실패 시 폴백용)
  const defaultAcademicSkills: SkillNode[] = [
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

  // 기본 금융 스킬 데이터 (API 로드 실패 시 폴백용)
  const defaultFinancialSkills: SkillNode[] = [
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

  // API에서 스킬 데이터 가져오기
  const fetchSkillData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🚀 스킬 데이터 로드 시작...');
      
      const skillService = SkillService.getInstance();
      
      // 백엔드 서버 연결 테스트
      const isConnected = await skillService.testConnection();
      if (!isConnected) {
        console.log('⚠️ 백엔드 서버 연결 실패, 기본 데이터 사용');
        setAcademicSkills(defaultAcademicSkills);
        setFinancialSkills(defaultFinancialSkills);
        setIsLoading(false);
        return;
      }
      
      // Promise.all을 사용해 여러 API를 동시에 호출
      const [academicData, financialData] = await Promise.all([
        skillService.fetchAcademicSkills(),
        skillService.fetchFinancialSkills()
      ]);
      
      console.log('✅ 스킬 데이터 로드 성공');
      setAcademicSkills(academicData);
      setFinancialSkills(financialData);
      
    } catch (error) {
      console.error('❌ 스킬 데이터 로드 실패:', error);
      setError('스킬 데이터를 불러오는 중 오류가 발생했습니다.');
      
      // 오류 발생 시 기본 데이터 사용
      setAcademicSkills(defaultAcademicSkills);
      setFinancialSkills(defaultFinancialSkills);
      
      Alert.alert(
        "데이터 로딩 실패", 
        "스킬 데이터를 불러오는 중 오류가 발생했습니다. 기본 데이터를 사용합니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 스킬 데이터 새로고침
  const refreshSkillData = async () => {
    setIsRefreshing(true);
    await fetchSkillData();
    setIsRefreshing(false);
  };

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

  // 사용자 데이터 기반 분석 생성
  const generateUserBasedAnalysis = (): AIAnalysis => {
    const analysis: AIAnalysis = {
      strengths: [],
      weaknesses: [],
      personality: [],
      recommendations: [],
      careerSuggestions: []
    };

    // Holland 성향 분석 (가장 중요한 요소)
    if (hollandProfile) {
      const { realistic, investigative, artistic, social, enterprising, conventional } = hollandProfile;
      
      // 가장 높은 점수 찾기
      const scores = [
        { type: '현실형(R)', value: realistic, color: '#6366f1' },
        { type: '탐구형(I)', value: investigative, color: '#8b5cf6' },
        { type: '예술형(A)', value: artistic, color: '#ec4899' },
        { type: '사회형(S)', value: social, color: '#10b981' },
        { type: '진취형(E)', value: enterprising, color: '#f59e0b' },
        { type: '관습형(C)', value: conventional, color: '#ef4444' }
      ];
      
      scores.sort((a, b) => b.value - a.value);
      const dominantType = scores[0];
      const secondType = scores[1];
      
      // 주요 성향 분석
      analysis.personality.push(`${dominantType.type} 성향이 가장 강함 (${dominantType.value}점)`);
      if (secondType.value > 70) {
        analysis.personality.push(`${secondType.type} 성향도 함께 발달 (${secondType.value}점)`);
      }
      
      // 성향별 강점 분석
      if (dominantType.type === '현실형(R)') {
        analysis.strengths.push('실용적이고 체계적인 문제 해결 능력');
        analysis.strengths.push('기술적이고 정확한 작업 수행 능력');
        analysis.careerSuggestions.push('엔지니어, 기술자, 건축가, 농부');
      } else if (dominantType.type === '탐구형(I)') {
        analysis.strengths.push('논리적 사고와 분석적 문제 해결 능력');
        analysis.strengths.push('연구와 탐구에 대한 깊은 호기심');
        analysis.careerSuggestions.push('연구원, 과학자, 의사, 수학자');
      } else if (dominantType.type === '예술형(A)') {
        analysis.strengths.push('창의적 사고와 예술적 감각');
        analysis.strengths.push('자유로운 표현과 혁신적 아이디어');
        analysis.careerSuggestions.push('디자이너, 예술가, 작가, 음악가');
      } else if (dominantType.type === '사회형(S)') {
        analysis.strengths.push('사람들과의 소통과 협력 능력');
        analysis.strengths.push('타인을 돕고 가르치는 능력');
        analysis.careerSuggestions.push('교사, 상담사, 사회복지사, 간호사');
      } else if (dominantType.type === '진취형(E)') {
        analysis.strengths.push('리더십과 설득 능력');
        analysis.strengths.push('도전적이고 혁신적인 사고');
        analysis.careerSuggestions.push('경영자, 영업원, 정치인, 기업가');
      } else if (dominantType.type === '관습형(C)') {
        analysis.strengths.push('체계적이고 정확한 업무 처리 능력');
        analysis.strengths.push('규칙과 절차 준수 능력');
        analysis.careerSuggestions.push('회계사, 사무원, 도서관사서, 행정직');
      }
      
      // 성향별 개선점 분석
      if (dominantType.type === '현실형(R)') {
        analysis.weaknesses.push('창의적 사고와 유연성 부족');
        analysis.recommendations.push('예술적 활동과 창의적 사고 훈련');
      } else if (dominantType.type === '탐구형(I)') {
        analysis.weaknesses.push('사람들과의 소통 부족');
        analysis.recommendations.push('팀워크와 소통 능력 향상 훈련');
      } else if (dominantType.type === '예술형(A)') {
        analysis.weaknesses.push('체계적이고 실용적인 접근 부족');
        analysis.recommendations.push('체계적 사고와 실용적 문제 해결 훈련');
      } else if (dominantType.type === '사회형(S)') {
        analysis.weaknesses.push('기술적이고 분석적 사고 부족');
        analysis.recommendations.push('기술적 역량과 분석적 사고 훈련');
      } else if (dominantType.type === '진취형(E)') {
        analysis.weaknesses.push('세부사항과 정확성 부족');
        analysis.recommendations.push('세부사항 관리와 정확성 향상 훈련');
      } else if (dominantType.type === '관습형(C)') {
        analysis.weaknesses.push('창의성과 혁신성 부족');
        analysis.recommendations.push('창의적 사고와 혁신적 접근 훈련');
      }
    }

    // 학업 데이터 기반 분석
    if (academicData) {
      if (academicData.grade && academicData.grade >= 3) {
        analysis.strengths.push('학업 지속성과 완성도가 높음');
        analysis.strengths.push('체계적인 학습 계획 수립 능력');
      } else if (academicData.grade && academicData.grade >= 2) {
        analysis.strengths.push('학업에 대한 적극적인 의지');
        analysis.strengths.push('지속적인 학습 노력');
      }

      if (academicData.department) {
        const dept = academicData.department.toLowerCase();
        if (dept.includes('컴퓨터') || dept.includes('소프트웨어') || dept.includes('정보')) {
          analysis.strengths.push('기술적 사고와 논리적 분석 능력');
          analysis.careerSuggestions.push('소프트웨어 개발자, 데이터 분석가, IT 컨설턴트');
        } else if (dept.includes('경영') || dept.includes('경제') || dept.includes('무역')) {
          analysis.strengths.push('비즈니스 인사이트와 전략적 사고');
          analysis.careerSuggestions.push('경영 컨설턴트, 마케팅 매니저, 금융 분석가');
        } else if (dept.includes('교육') || dept.includes('사범')) {
          analysis.strengths.push('소통 능력과 지도력');
          analysis.careerSuggestions.push('교사, 교육 컨설턴트, 트레이너');
        } else if (dept.includes('의학') || dept.includes('간호')) {
          analysis.strengths.push('의료 지식과 환자 케어 능력');
          analysis.careerSuggestions.push('의사, 간호사, 의료 연구원');
        }
      }
    }

    // 금융 데이터 기반 분석
    if (financialData) {
      if (financialData.total_assets && financialData.total_assets > 10000000) {
        analysis.strengths.push('재무 관리 능력과 자산 축적 의지');
      } else if (financialData.total_assets && financialData.total_assets > 5000000) {
        analysis.strengths.push('안정적인 재무 계획 수립');
      }

      if (financialData.credit_score && financialData.credit_score.grade) {
        const grade = financialData.credit_score.grade;
        if (grade === 'A' || grade === 'B') {
          analysis.strengths.push('신용 관리 능력과 책임감');
        } else if (grade === 'C' || grade === 'D') {
          analysis.weaknesses.push('신용 관리 개선 필요');
          analysis.recommendations.push('신용 점수 향상을 위한 체계적인 계획 수립');
        }
      }

      if (financialData.monthly_income && financialData.monthly_spending) {
        const savingsRate = (financialData.monthly_income - financialData.monthly_spending) / financialData.monthly_income;
        if (savingsRate > 0.3) {
          analysis.strengths.push('높은 저축률과 재무 계획 능력');
        } else if (savingsRate < 0.1) {
          analysis.weaknesses.push('저축률 개선 필요');
          analysis.recommendations.push('지출 관리와 예산 계획 수립');
        }
      }
    }

    // 스킬 데이터 기반 분석
    if (skillData && skillData.skills) {
      const skills = skillData.skills;
      
      // 기술적 스킬
      if (skills.programming && skills.programming > 70) {
        analysis.strengths.push('프로그래밍 능력이 뛰어남');
        analysis.careerSuggestions.push('소프트웨어 엔지니어, 웹 개발자');
      }
      
      if (skills.analysis && skills.analysis > 70) {
        analysis.strengths.push('데이터 분석 능력이 뛰어남');
        analysis.careerSuggestions.push('데이터 사이언티스트, 비즈니스 분석가');
      }
      
      if (skills.communication && skills.communication > 70) {
        analysis.strengths.push('의사소통 능력이 뛰어남');
        analysis.careerSuggestions.push('영업 매니저, 고객 서비스 매니저');
      }
      
      if (skills.leadership && skills.leadership > 70) {
        analysis.strengths.push('리더십과 팀 관리 능력');
        analysis.careerSuggestions.push('프로젝트 매니저, 팀 리더');
      }
    }

    // 기본값 설정 (데이터가 부족한 경우)
    if (analysis.strengths.length === 0) {
      analysis.strengths = [
        '학업에 대한 적극적인 의지',
        '지속적인 성장 추구',
        '새로운 도전에 대한 열정'
      ];
    }

    if (analysis.weaknesses.length === 0) {
      analysis.weaknesses = [
        '경험 부족으로 인한 실무 능력 향상 필요',
        '전문 분야에 대한 심화 학습 필요',
        '다양한 분야에 대한 폭넓은 이해 필요'
      ];
    }

    if (analysis.personality.length === 0) {
      analysis.personality = [
        '학습에 대한 열정과 호기심',
        '목표 달성을 위한 끈기와 인내',
        '새로운 지식 습득에 대한 적극성'
      ];
    }

    if (analysis.recommendations.length === 0) {
      analysis.recommendations = [
        '전문 분야에 대한 심화 학습',
        '실무 경험을 통한 역량 강화',
        '다양한 분야에 대한 폭넓은 이해'
      ];
    }

    if (analysis.careerSuggestions.length === 0) {
      analysis.careerSuggestions = [
        '전문 분야 전문가',
        '연구원 또는 컨설턴트',
        '교육자 또는 트레이너'
      ];
    }

    return analysis;
  };

  // 네트워크 상태 확인
  const checkNetworkStatus = async () => {
    try {
      const response = await fetch('https://httpbin.org/status/200', {
        method: 'HEAD',
        mode: 'no-cors'
      });
      return true;
    } catch (error) {
      console.error('네트워크 상태 확인 실패:', error);
      return false;
    }
  };

  // AI 분석 실행
  const runAIAnalysis = async () => {
    try {
      // 네트워크 상태 먼저 확인
      const isNetworkAvailable = await checkNetworkStatus();
      if (!isNetworkAvailable) {
        Alert.alert(
          '네트워크 오류',
          '인터넷 연결을 확인할 수 없습니다. 네트워크 상태를 확인하고 다시 시도해주세요.',
          [{ text: '확인' }]
        );
        return;
      }
      
      // 사용자에게 로딩 상태 표시
      Alert.alert(
        'AI 분석 시작',
        'AI를 통해 개인 맞춤형 분석을 진행하고 있습니다...',
        [{ text: '확인' }]
      );
      
      // 사용자 데이터 기반 분석 생성
      const userAnalysis = generateUserBasedAnalysis();
      
      // AI 연결 시도
      try {
        console.log('🤖 AI 분석 시도 중...');
        
        // GeminiService를 사용하여 실제 AI API 호출
        const GeminiService = (await import('../../services/geminiService')).default;
        const geminiService = GeminiService.getInstance();
        
        if (geminiService.isConfigured()) {
          const aiPrompt = `
사용자 정보를 분석하여 개인 맞춤형 조언을 제공해주세요.

사용자 Holland 성향:
- 현실형: ${hollandProfile.realistic}점
- 탐구형: ${hollandProfile.investigative}점  
- 예술형: ${hollandProfile.artistic}점
- 사회형: ${hollandProfile.social}점
- 진취형: ${hollandProfile.enterprising}점
- 관습형: ${hollandProfile.conventional}점

학업 상황: ${academicData.department} ${academicData.grade}학년
금융 상황: 총 자산 ${financialData.total_assets?.toLocaleString()}원

위 정보를 바탕으로 강점, 개선점, 성향, 추천사항, 직업 추천을 분석해주세요.
`;

          const aiResponse = await geminiService.callGeminiAPI(aiPrompt);
          
          if (aiResponse.success && aiResponse.data) {
            console.log('✅ AI 분석 성공:', aiResponse.data);
            
            // AI 응답을 파싱하여 분석 결과에 반영
            const enhancedAnalysis = {
              ...userAnalysis,
              aiInsights: aiResponse.data,
              isAIEnhanced: true
            };
            
            setAiAnalysis(enhancedAnalysis);
            setShowAnalysis(true);
            return; // AI 분석 성공 시 여기서 종료
          }
        }
      } catch (aiError) {
        console.log('⚠️ AI 연결 실패, 사용자 데이터 기반 분석 사용:', aiError);
        
        // 사용자에게 AI 연결 실패 알림
        Alert.alert(
          'AI 연결 실패',
          'AI 서비스에 일시적으로 연결할 수 없어 기본 분석 결과를 제공합니다. 네트워크 상태를 확인하고 잠시 후 다시 시도해주세요.',
          [{ text: '확인' }]
        );
      }
      
      // AI 분석이 실패했거나 성공하지 못한 경우 기본 분석 결과 표시
      setAiAnalysis(userAnalysis);
      setShowAnalysis(true);
    } catch (error) {
      console.error('분석 실행 오류:', error);
      
      // 사용자에게 오류 알림
      Alert.alert(
        '분석 오류',
        '분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        [{ text: '확인' }]
      );
      
      // 오류가 발생해도 기본 분석 결과 표시
      const fallbackAnalysis = generateUserBasedAnalysis();
      setAiAnalysis(fallbackAnalysis);
      setShowAnalysis(true);
    }
  };

  // 로딩 중일 때 로딩 인디케이터 표시
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>스킬 데이터를 불러오는 중...</Text>
        <Text style={styles.loadingSubtext}>잠시만 기다려주세요</Text>
      </View>
    );
  }

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
            <View style={styles.networkStatusContainer}>
              <View style={[styles.networkStatusDot, { backgroundColor: networkStatus ? '#10b981' : '#ef4444' }]} />
              <Text style={[styles.networkStatusText, { color: networkStatus ? '#10b981' : '#ef4444' }]}>
                {networkStatus ? '온라인' : '오프라인'}
              </Text>
            </View>
          </View>
                      <View style={styles.headerButtons}>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={refreshSkillData}
                activeOpacity={0.8}
                disabled={isRefreshing}
              >
                <LinearGradient
                  colors={['#10b981', '#059669']}
                  style={styles.refreshButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <MaterialIcons 
                    name="refresh" 
                    size={18} 
                    color="white" 
                    style={isRefreshing ? styles.rotatingIcon : undefined}
                  />
                  <Text style={styles.refreshButtonText}>
                    {isRefreshing ? '새로고침 중...' : '새로고침'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              
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
              
              {/* AI 인사이트 표시 */}
              {(aiAnalysis as any).aiInsights && (
                <View style={styles.analysisSection}>
                  <Text style={styles.analysisSectionTitle}>🤖 AI 인사이트</Text>
                  <View style={styles.aiInsightContainer}>
                    <Text style={styles.aiInsightText}>
                      {(aiAnalysis as any).aiInsights}
                    </Text>
                    <View style={styles.aiEnhancedBadge}>
                      <MaterialIcons name="auto-awesome" size={16} color="#6366f1" />
                      <Text style={styles.aiEnhancedText}>AI 강화 분석</Text>
                    </View>
                  </View>
                </View>
              )}
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
  networkStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  networkStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  networkStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 20,
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#64748b',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  refreshButton: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  refreshButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 14,
  },
  rotatingIcon: {
    transform: [{ rotate: '360deg' }],
  },
  aiInsightContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
  },
  aiInsightText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  aiEnhancedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  aiEnhancedText: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default NewSkillTreeSystem;
