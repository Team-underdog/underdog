
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
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Svg, Polygon, Defs, LinearGradient as SvgLinearGradient, Stop, Text as SvgText, Circle, Line, Rect, G } from 'react-native-svg';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import AcademicsTab from './AcademicsTab';
import FinanceTab from './FinanceTab';

const { width, height } = Dimensions.get('window');

type SkillCategory = 'academics' | 'finance' | 'chronicle';

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
  requirements: string[]; // 달성 조건 추가
  status: 'locked' | 'unlockable' | 'pending' | 'acquired'; // 상태 추가
  unlocked: boolean;
  position: { x: number; y: number };
  connections: string[];
  unlockCondition?: string; // 해금 조건
}

interface HollandProfile {
  realistic: number;
  investigative: number;
  artistic: number;
  social: number;
  enterprising: number;
  conventional: number;
}

interface AIAnalysis {
  strengths: string[];
  weaknesses: string[];
  personality: string[];
  recommendations: string[];
  careerSuggestions: string[];
}

const OptimizedSkillTree: React.FC = () => {
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'academics', title: '학사', icon: 'school' },
    { key: 'finance', title: '금융', icon: 'bank' },
    { key: 'chronicle', title: '크로니클', icon: 'chart-timeline-variant' },
  ]);
  
  const [selectedSkill, setSelectedSkill] = useState<SkillNode | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  
  // Holland 차트 애니메이션 상태
  const [chartAnimationProgress, setChartAnimationProgress] = useState(0);
  const [showChartElements, setShowChartElements] = useState(false);
  const [chartScale, setChartScale] = useState(0.8);
  const [chartRotation, setChartRotation] = useState(0);
  
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 80, friction: 5, useNativeDriver: true }),
    ]).start();
  }, []);

  // Holland 차트 애니메이션 효과
  useEffect(() => {
    // 차트 스케일 및 회전 애니메이션
    const scaleTimer = setTimeout(() => {
      setChartScale(1);
      setChartRotation(360);
    }, 100);

    // 차트 페이드인 애니메이션
    const fadeInTimer = setTimeout(() => {
      setShowChartElements(true);
    }, 200);

    // 점진적 애니메이션
    const progressTimer = setTimeout(() => {
      const duration = 800; // 0.8초 (2초에서 대폭 단축!)
      const interval = 16; // 60fps
      let progress = 0;
      
      const animate = () => {
        progress += interval / duration;
        if (progress <= 1) {
          setChartAnimationProgress(progress);
          requestAnimationFrame(animate);
        } else {
          setChartAnimationProgress(1);
        }
      };
      
      animate();
    }, 300);

    return () => {
      clearTimeout(scaleTimer);
      clearTimeout(fadeInTimer);
      clearTimeout(progressTimer);
    };
  }, []);

  const academicSkills: SkillNode[] = [
    {
      id: 'attendance',
      name: '출석관리',
      level: 8,
      maxLevel: 10,
      currentXP: 800,
      maxXP: 1000,
      category: 'academics',
      icon: '📚',
      color: '#6366f1',
      description: '꾸준한 출석으로 학업 의지를 보여주는 기본 스킬',
      benefits: ['출석 보상 +20%', 'Credo 보너스 +5'],
      requirements: ['출석률 90% 이상 유지'],
      status: 'acquired',
      unlocked: true,
      position: { x: width * 0.25, y: 150 },
      connections: ['study_plan'],
      unlockCondition: '출석률 90% 이상 달성'
    },
    {
      id: 'study_plan',
      name: '학업계획',
      level: 6,
      maxLevel: 10,
      currentXP: 600,
      maxXP: 1000,
      category: 'academics',
      icon: '📋',
      color: '#7c3aed',
      description: '체계적인 학습 계획 수립 및 실행 능력',
      benefits: ['학습 효율 +15%', '스트레스 감소'],
      requirements: ['학기별 학습계획서 작성', '출석관리 스킬 해금'],
      status: 'acquired',
      unlocked: true,
      position: { x: width * 0.75, y: 150 },
      connections: ['attendance', 'exam_prep'],
      unlockCondition: '학기별 학습계획서 작성 완료'
    },
    {
      id: 'exam_prep',
      name: '시험준비',
      level: 7,
      maxLevel: 10,
      currentXP: 700,
      maxXP: 1000,
      category: 'academics',
      icon: '📝',
      color: '#8b5cf6',
      description: '효과적인 시험 준비 및 성적 향상',
      benefits: ['시험 성적 +25%', '자신감 증가'],
      requirements: ['학업계획 스킬 해금', '시험 성적표 인증'],
      status: 'pending',
      unlocked: false,
      position: { x: width * 0.5, y: 300 },
      connections: ['study_plan', 'assignment'],
      unlockCondition: '시험 성적표 업로드 및 인증'
    },
    {
      id: 'assignment',
      name: '과제완성',
      level: 5,
      maxLevel: 10,
      currentXP: 500,
      maxXP: 1000,
      category: 'academics',
      icon: '📖',
      color: '#a855f7',
      description: '과제 완성도 및 품질 향상',
      benefits: ['과제 점수 +30%', '창의력 향상'],
      requirements: ['시험준비 스킬 해금', '과제 완성 인증'],
      status: 'locked',
      unlocked: false,
      position: { x: width * 0.75, y: 300 },
      connections: ['exam_prep'],
      unlockCondition: '과제 완성 및 제출 인증'
    },
  ];

  const financialSkills: SkillNode[] = [
    {
      id: 'budget_management',
      name: '예산관리',
      level: 9,
      maxLevel: 10,
      currentXP: 900,
      maxXP: 1000,
      category: 'finance',
      icon: '💰',
      color: '#10b981',
      description: '체계적인 예산 수립 및 지출 관리',
      benefits: ['절약 효과 +25%', '재정 안정성'],
      requirements: ['월 예산 계획서 작성', '지출 내역 기록 3개월'],
      status: 'acquired',
      unlocked: true,
      position: { x: width * 0.25, y: 150 },
      connections: ['investment_knowledge'],
      unlockCondition: '월 예산 계획서 작성 및 지출 기록'
    },
    {
      id: 'investment_knowledge',
      name: '투자지식',
      level: 4,
      maxLevel: 10,
      currentXP: 400,
      maxXP: 1000,
      category: 'finance',
      icon: '📈',
      color: '#059669',
      description: '다양한 투자 상품에 대한 이해와 지식',
      benefits: ['투자 수익률 +20%', '리스크 관리'],
      requirements: ['예산관리 스킬 해금', '투자 관련 자격증 취득'],
      status: 'unlockable',
      unlocked: false,
      position: { x: 400, y: 150 },
      connections: ['budget_management', 'credit_management'],
      unlockCondition: '투자 관련 자격증 취득 및 인증'
    },
    {
      id: 'credit_management',
      name: '신용관리',
      level: 6,
      maxLevel: 10,
      currentXP: 600,
      maxXP: 1000,
      category: 'finance',
      icon: '💳',
      color: '#0d9488',
      description: '신용점수 향상 및 신용카드 관리',
      benefits: ['신용점수 +30%', '대출 조건 개선'],
      requirements: ['투자지식 스킬 해금', '신용점수 향상 증명'],
      status: 'locked',
      unlocked: false,
      position: { x: 300, y: 300 },
      connections: ['investment_knowledge', 'saving_habit'],
      unlockCondition: '신용점수 향상 증명서 업로드'
    },
    {
      id: 'saving_habit',
      name: '절약습관',
      level: 8,
      maxLevel: 10,
      currentXP: 800,
      maxXP: 1000,
      category: 'finance',
      icon: '🏦',
      color: '#047857',
      description: '지속적인 절약 및 저축 습관',
      benefits: ['저축률 +35%', '재정 목표 달성'],
      requirements: ['신용관리 스킬 해금', '저축 목표 달성 인증'],
      status: 'locked',
      unlocked: false,
      position: { x: 500, y: 300 },
      connections: ['credit_management'],
      unlockCondition: '저축 목표 달성 및 인증'
    },
  ];

  const getCurrentSkills = () => {
    switch (routes[index].key) {
      case 'academics': return academicSkills;
      case 'finance': return financialSkills;
      default: return academicSkills;
    }
  };

  const getTabColor = (key: string) => {
    switch (key) {
      case 'academics':
        return { active: '#6366f1', inactive: '#f1f5f9' };
      case 'finance':
        return { active: '#10b981', inactive: '#f1f5f9' };
      case 'chronicle':
        return { active: '#f59e0b', inactive: '#f1f5f9' };
      default:
        return { active: '#6366f1', inactive: '#f1f5f9' };
    }
  };

  const getLevelColor = (level: number) => {
    if (level >= 8) return '#10b981';
    if (level >= 6) return '#f59e0b';
    if (level >= 4) return '#f97316';
    return '#ef4444';
  };

  const renderSkillNode = (skill: SkillNode, index: number) => {
    const progress = (skill.currentXP / skill.maxXP) * 100;
    const size = Math.min(width * 0.2, 90);
    const delay = index * 100;
    
    // 상태별 스타일 결정
    const getNodeStyle = () => {
      switch (skill.status) {
        case 'locked':
          return {
            backgroundColor: '#f1f5f9',
            borderColor: '#e2e8f0',
            iconColor: '#9ca3af',
            textColor: '#6b7280'
          };
        case 'unlockable':
          return {
            backgroundColor: '#fef3c7',
            borderColor: '#fbbf24',
            iconColor: '#d97706',
            textColor: '#92400e'
          };
        case 'pending':
          return {
            backgroundColor: '#fef3c7',
            borderColor: '#f59e0b',
            iconColor: '#d97706',
            textColor: '#92400e'
          };
        case 'acquired':
          return {
            backgroundColor: skill.color,
            borderColor: skill.color,
            iconColor: 'white',
            textColor: 'white'
          };
        default:
          return {
            backgroundColor: '#f1f5f9',
            borderColor: '#e2e8f0',
            iconColor: '#9ca3af',
            textColor: '#6b7280'
          };
      }
    };
    
    const nodeStyle = getNodeStyle();
    
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
            transform: [{ scale: scaleAnim }, { translateY: slideAnim }]
          }
        ]}
      >
        <TouchableOpacity
          style={styles.skillTouchable}
          onPress={() => setSelectedSkill(skill)}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.skillContainer,
              {
                width: size,
                height: size,
                backgroundColor: nodeStyle.backgroundColor,
                borderColor: nodeStyle.borderColor,
                borderWidth: 3,
                borderRadius: size / 2
              }
            ]}
          >
            {/* 상태별 아이콘 */}
            <Text style={[styles.skillIcon, { color: nodeStyle.iconColor }]}>
              {skill.status === 'pending' ? '⏳' : skill.icon}
            </Text>
            
            {/* 레벨 배지 */}
            <View style={[styles.levelBadge, { backgroundColor: getLevelColor(skill.level) }]}>
              <Text style={styles.levelText}>{skill.level}</Text>
            </View>
            
            {/* 상태별 인디케이터 */}
            {skill.status === 'unlockable' && (
              <View style={styles.unlockIndicator}>
                <Text style={styles.unlockText}>🔓</Text>
              </View>
            )}
            
            {skill.status === 'pending' && (
              <View style={styles.pendingIndicator}>
                <Text style={styles.pendingText}>⏳</Text>
              </View>
            )}
          </View>
          
          <Text style={[styles.skillName, { color: nodeStyle.textColor }]} numberOfLines={1}>
            {skill.name}
          </Text>
          
          <Text style={[styles.skillStatus, { color: nodeStyle.textColor }]}>
            {skill.status === 'locked' && '잠김'}
            {skill.status === 'unlockable' && '해금 가능'}
            {skill.status === 'pending' && '인증 대기중'}
            {skill.status === 'acquired' && '획득 완료'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

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
                transform: [{ rotate: `${Math.atan2(endY - startY, endX - startX)}rad` }]
              }
            ]}
          />
        );
      })
    ).flat().filter(Boolean);
  };

  const renderHollandChart = () => {
    // Holland 성향 데이터 (순서가 중요: 시계방향)
    const chartData = [
      { value: 75, label: '현실형' },
      { value: 60, label: '탐구형' },
      { value: 45, label: '예술형' },
      { value: 80, label: '사회형' },
      { value: 65, label: '진취형' },
      { value: 40, label: '관습형' },
    ];

    // 차트 설정 - 픽셀아트 스타일
    const PRIMARY_COLOR = '#6366F1'; // 픽셀아트 보라색
    const SECONDARY_COLOR = '#8B5CF6'; // 픽셀아트 연보라
    const ACCENT_COLOR = '#06B6D4'; // 픽셀아트 사이안
    const PIXEL_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']; // 픽셀아트 팔레트
    const CHART_SIZE = 280; // 차트 전체 크기
    const CENTER = CHART_SIZE / 2;
    const RADIUS = 90; // 차트 반지름

    // 1. 데이터 기반으로 각 꼭짓점의 좌표 계산 (x, y) - 애니메이션 적용
    const points = chartData.map((item, index) => {
      const angle = (Math.PI / 3) * index - Math.PI / 2; // 6각형 각도 계산
      const valueRatio = (item.value / 100) * chartAnimationProgress; // 애니메이션 진행도 적용
      const x = CENTER + RADIUS * valueRatio * Math.cos(angle);
      const y = CENTER + RADIUS * valueRatio * Math.sin(angle);
      return { ...item, x, y, originalValue: item.value };
    });

    // 2. Polygon을 위한 points 문자열 생성
    const polygonPoints = points.map(p => `${p.x},${p.y}`).join(' ');

    // 3. 배경 눈금선 좌표 계산 (4단계) - 애니메이션 적용
    const backgroundLines = [];
    for (let i = 1; i <= 4; i++) {
      const ratio = (i / 4) * chartAnimationProgress;
      const linePoints = chartData.map((_, index) => {
        const angle = (Math.PI / 3) * index - Math.PI / 2;
        const x = CENTER + RADIUS * ratio * Math.cos(angle);
        const y = CENTER + RADIUS * ratio * Math.sin(angle);
        return { x, y };
      });
      backgroundLines.push(linePoints);
    }

    return (
      <View style={styles.hollandChartCard}>
        <View style={styles.chartHeader}>
          <View style={styles.chartTitleContainer}>
            <Text style={styles.chartTitle}>🎯 Holland 성향 분석</Text>
            <Text style={styles.chartSubtitle}>당신의 성향을 파악하고 맞춤형 추천을 받아보세요</Text>
          </View>
        </View>
        
        <View style={styles.chartContainer}>
          {/* SVG 기반 Holland 차트 - 신한은행 스타일 */}
          <Animated.View style={{
            transform: [
              { scale: chartScale },
              { rotate: `${chartRotation}deg` }
            ]
          }}>
            <Svg width={CHART_SIZE} height={CHART_SIZE}>
              <Defs>
                {/* 파스텔톤 블루 그라데이션 */}
                <SvgLinearGradient id="fillGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop offset="0%" stopColor="#E0F2FE" stopOpacity={0.8} />
                  <Stop offset="25%" stopColor="#BAE6FD" stopOpacity={0.7} />
                  <Stop offset="50%" stopColor="#93C5FD" stopOpacity={0.6} />
                  <Stop offset="75%" stopColor="#7DD3FC" stopOpacity={0.5} />
                  <Stop offset="100%" stopColor="#67E8F9" stopOpacity={0.4} />
                </SvgLinearGradient>
                
                {/* 파스텔톤 블루 외곽선 */}
                <SvgLinearGradient id="strokeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#0EA5E9" />
                  <Stop offset="50%" stopColor="#38BDF8" />
                  <Stop offset="100%" stopColor="#67E8F9" />
                </SvgLinearGradient>
              </Defs>
              
              {/* 픽셀아트 배경 눈금선 */}
              {backgroundLines.map((line, lineIndex) => (
                <Polygon
                  key={`bg-line-${lineIndex}`}
                  points={line.map(p => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke={PIXEL_COLORS[lineIndex % PIXEL_COLORS.length]}
                  strokeWidth="2"
                  opacity={0.6}
                  strokeDasharray="4,4"
                />
              ))}
              
              {/* 데이터 영역 채우기 (그라데이션) */}
              <Polygon
                points={polygonPoints}
                fill="url(#fillGradient)"
                opacity={1}
              />
              
              {/* 연한 외곽선 */}
              <Polygon
                points={polygonPoints}
                fill="none"
                stroke="url(#strokeGradient)"
                strokeWidth="2"
                strokeOpacity={0.6}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* 작은 검은 점 꼭짓점 마커 */}
              {points.map((point, index) => {
                const shouldShow = showChartElements && chartAnimationProgress > 0.3;
                
                return (
                  <Circle
                    key={`point-${index}`}
                    cx={point.x}
                    cy={point.y}
                    r={shouldShow ? 3 : 0}
                    fill="#1e293b"
                    stroke="white"
                    strokeWidth="1"
                    opacity={shouldShow ? 1 : 0}
                  />
                );
              })}
              
              {/* 점수 텍스트 */}
              {points.map((point, index) => {
                return (
                  <SvgText
                    key={`score-${index}`}
                    x={point.x}
                    y={point.y - 15}
                    fontSize="16"
                    fontWeight="900"
                    fill="#1e293b"
                    textAnchor="middle"
                    stroke="white"
                    strokeWidth="1"
                    opacity={1}
                  >
                    {Math.round(point.originalValue * chartAnimationProgress)}
                  </SvgText>
                );
              })}
              
              {/* 라벨 텍스트 - 신한은행 스타일 */}
              {points.map((point, index) => {
                const angle = (Math.PI / 3) * index - Math.PI / 2;
                const labelRadius = RADIUS + 25; // 30 → 25로 줄임
                const labelX = CENTER + labelRadius * Math.cos(angle);
                const labelY = CENTER + labelRadius * Math.sin(angle);
                
                return (
                  <SvgText
                    key={`label-${index}`}
                    x={labelX}
                    y={labelY}
                    fontSize="15" // 16 → 15로 줄임
                    fontWeight="700"
                    fill="#374151"
                    textAnchor="middle"
                    opacity={1}
                  >
                    {point.label}
                  </SvgText>
                );
              })}
            </Svg>
          </Animated.View>
        </View>
        
        {/* 성향 요약 정보 - 3개씩 가로 2줄로 배치 */}
        <View style={styles.profileSummary}>
          <Text style={styles.summaryTitle}>📊 성향 요약</Text>
          <View style={styles.summaryGrid}>
            {/* 첫 번째 줄: 현실형, 탐구형, 예술형 */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <View style={[styles.summaryDot, { backgroundColor: PRIMARY_COLOR }]} />
                <Text style={styles.summaryLabel}>{chartData[0].label}</Text>
                <Text style={styles.summaryValue}>{chartData[0].value}</Text>
              </View>
              <View style={styles.summaryItem}>
                <View style={[styles.summaryDot, { backgroundColor: PRIMARY_COLOR }]} />
                <Text style={styles.summaryLabel}>{chartData[1].label}</Text>
                <Text style={styles.summaryValue}>{chartData[1].value}</Text>
              </View>
              <View style={styles.summaryItem}>
                <View style={[styles.summaryDot, { backgroundColor: PRIMARY_COLOR }]} />
                <Text style={styles.summaryLabel}>{chartData[2].label}</Text>
                <Text style={styles.summaryValue}>{chartData[2].value}</Text>
              </View>
            </View>
            
            {/* 두 번째 줄: 사회형, 진취형, 관습형 */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <View style={[styles.summaryDot, { backgroundColor: PRIMARY_COLOR }]} />
                <Text style={styles.summaryLabel}>{chartData[3].label}</Text>
                <Text style={styles.summaryValue}>{chartData[3].value}</Text>
              </View>
              <View style={styles.summaryItem}>
                <View style={[styles.summaryDot, { backgroundColor: PRIMARY_COLOR }]} />
                <Text style={styles.summaryLabel}>{chartData[4].label}</Text>
                <Text style={styles.summaryValue}>{chartData[4].value}</Text>
              </View>
              <View style={styles.summaryItem}>
                <View style={[styles.summaryDot, { backgroundColor: PRIMARY_COLOR }]} />
                <Text style={styles.summaryLabel}>{chartData[5].label}</Text>
                <Text style={styles.summaryValue}>{chartData[5].value}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const runAIAnalysis = async () => {
    try {
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
      
      // 모달 애니메이션을 위해 fadeAnim을 1로 설정
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    } catch (error) {
      Alert.alert('오류', 'AI 분석을 실행할 수 없습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={2}>🎯 스킬트리 시스템</Text>
            <Text style={styles.subtitle} numberOfLines={2}>당신의 성장을 시각화하고 분석하세요</Text>
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
      </View>

      {/* TabView 네비게이션 */}
      <TabView
        navigationState={{ index, routes }}
        renderScene={SceneMap({
          academics: () => <AcademicsTab skills={academicSkills} />,
          finance: () => <FinanceTab skills={financialSkills} />,
          chronicle: () => renderHollandChart(),
        })}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            style={styles.tabBar}
            indicatorStyle={{ backgroundColor: '#3B82F6', height: 2 }}
            activeColor="#1F2937"
            inactiveColor="#9CA3AF"
          />
        )}
      />

      {/* 스킬 상세 정보 모달 */}
      {selectedSkill && (
        <Animated.View style={[styles.modal, { opacity: fadeAnim }]}>
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
                      { width: `${(selectedSkill.currentXP / selectedSkill.maxXP) * 100}%` }
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
        <Animated.View style={[styles.modal, { opacity: 1 }]}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modalTitle}>🤖 AI 개인 분석 결과</Text>
                <Text style={styles.modalSubtitle}>당신만의 맞춤형 분석 리포트</Text>
              </View>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => {
                  setShowAnalysis(false);
                  // 모달 닫기 애니메이션
                  Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
                }}
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
    borderBottomColor: '#E5E7EB',
    paddingTop: 12,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 60,
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
    minWidth: 0, // 글자 잘림 방지
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 4,
    letterSpacing: -0.3,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  subtitle: {
    fontSize: 14,
    color: '#1F2937',
    marginTop: 2,
    fontWeight: '500',
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  analysisButton: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    minWidth: 100,
  },
  analysisButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  analysisButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 14,
    letterSpacing: -0.2,
  },
  categorySelector: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
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
   activeIndicator: {
     position: 'absolute',
     bottom: -16,
     left: '50%',
     width: 20,
     height: 3,
     backgroundColor: '#6366f1',
     borderRadius: 2,
     transform: [{ translateX: -10 }],
   },
  skillTreeContainer: {
    flex: 1,
    paddingBottom: 16, // 하단 네비게이션 바와의 간격 조정
  },
  skillTreeContent: {
    padding: 16,
    paddingBottom: 30, // 하단 여백 조정
  },
  tabBar: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 8,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabButtonContainer: {
    flex: 1,
    alignItems: 'center',
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    width: '90%',
    minHeight: 36,
  },
  tabLabel: {
    marginLeft: 6,
    fontWeight: '600',
    fontSize: 15,
    color: '#6B7280',
  },
  skillTreeSection: {
    width: '100%',
    padding: 20,
  },
  progressHeader: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  progressFill: {
    height: '100%',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.2,
  },
  skillTree: {
    position: 'relative',
    width: '100%',
    minHeight: 500,
    alignItems: 'center',
  },
  skillNode: {
    position: 'absolute',
    alignItems: 'center',
  },
  skillTouchable: {
    alignItems: 'center',
  },
  skillContainer: {
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
  skillStatus: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  unlockIndicator: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fbbf24',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  unlockText: {
    fontSize: 12,
    color: 'white',
  },
  pendingIndicator: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f59e0b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  pendingText: {
    fontSize: 12,
    color: 'white',
  },
  connectionLine: {
    position: 'absolute',
    backgroundColor: '#cbd5e1',
    height: 3,
    borderRadius: 2,
    opacity: 0.6,
  },
  hollandChartCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16, // 24 -> 16으로 줄임
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    alignItems: 'center',
    width: '100%',
    marginHorizontal: 0,
  },
  chartHeader: {
    alignItems: 'center',
    marginBottom: 16, // 24 -> 16으로 줄임
  },
  chartTitleContainer: {
    alignItems: 'center',
  },
     chartTitle: {
     fontSize: 26,
     fontWeight: '900',
     color: '#1e293b',
     marginBottom: 6,
     letterSpacing: -0.5,
   },
   chartSubtitle: {
     fontSize: 14,
     color: '#64748b',
     textAlign: 'center',
     fontWeight: '500',
     lineHeight: 20,
   },
  chartContainer: {
    position: 'relative',
    width: '100%',
    height: 320, // 300 → 320으로 증가하여 더 여유로운 공간
    marginBottom: 20,
    alignItems: 'center',
    // 기본 라벨 숨김을 위한 스타일
    overflow: 'visible', // hidden → visible로 변경하여 잘리지 않도록
    borderRadius: 20,
    padding: 20,
  },
  backgroundCircle: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 1000,
    opacity: 0.3,
  },
  axisLine: {
    position: 'absolute',
    backgroundColor: '#e2e8f0',
    height: 1,
    borderRadius: 0.5,
    opacity: 0.5,
  },
     radarPolygon: {
     position: 'absolute',
     width: '100%',
     height: 300,
   },
  radarVertex: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: 'transparent',
  },
  radarFill: {
    position: 'absolute',
    width: 400,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  radarFillPoint: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'transparent',
  },
  scoreDisplay: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
     scoreText: {
     fontSize: 18,
     fontWeight: '900',
     textShadowColor: 'rgba(0, 0, 0, 0.1)',
     textShadowOffset: { width: 0, height: 1 },
     textShadowRadius: 2,
   },
  profileSummary: {
    marginTop: 16, // 24 -> 16으로 줄임
    width: '100%',
    paddingHorizontal: 10,
  },
           summaryTitle: {
     fontSize: 20,
     fontWeight: '900',
     color: '#1e293b',
     marginBottom: 12, // 16 -> 12로 줄임
     textAlign: 'center',
     letterSpacing: -0.3,
   },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12, // 20 -> 12로 줄임
    paddingHorizontal: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // 10 -> 8로 줄임
    minWidth: '30%', // 3열 구조를 위해 30%로 설정
    justifyContent: 'center',
  },
  summaryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
     summaryLabel: {
     fontSize: 15,
     color: '#374151',
     fontWeight: '600',
   },
     summaryValue: {
     fontSize: 18,
     fontWeight: '800',
   },
   chartLabelContainer: {
     position: 'absolute',
     backgroundColor: 'rgba(255, 255, 255, 0.98)',
     paddingHorizontal: 12,
     paddingVertical: 8,
     borderRadius: 18,
     elevation: 5,
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 3 },
     shadowOpacity: 0.25,
     shadowRadius: 8,
     borderWidth: 2,
     borderColor: 'rgba(99, 102, 241, 0.4)',
     minWidth: 60,
     alignItems: 'center',
   },
   chartLabel: {
     fontSize: 14,
     fontWeight: '900',
     color: '#1e293b',
     textShadowColor: 'rgba(255, 255, 255, 0.9)',
     textShadowOffset: { width: 0, height: 1 },
     textShadowRadius: 3,
     letterSpacing: -0.3,
   },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
    opacity: 1,
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
     spiderPolygon: {
     position: 'absolute',
     width: '100%',
     height: 320,
   },
     polygonLine: {
     position: 'absolute',
     backgroundColor: '#6366f1',
     height: 2,
     borderRadius: 1,
     opacity: 0.8,
   },
   scoreOverlay: {
     position: 'absolute',
     width: '100%',
     height: '100%',
   },
  chartLabelsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
});

export default OptimizedSkillTree;
