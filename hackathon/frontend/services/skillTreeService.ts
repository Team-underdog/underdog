import { API_ENDPOINTS } from '../config/api';
import CredoService from './credoService';

// 스킬 카테고리 타입
export type SkillCategory = 'academic' | 'financial' | 'chronicle';

// 스킬 노드 인터페이스
export interface SkillNode {
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
export interface HollandProfile {
  realistic: number;    // 현실형
  investigative: number; // 탐구형
  artistic: number;     // 예술형
  social: number;       // 사회형
  enterprising: number; // 진취형
  conventional: number; // 관습형
}

// AI 분석 결과 타입
export interface AIAnalysis {
  strengths: string[];
  weaknesses: string[];
  personality: string[];
  recommendations: string[];
  careerSuggestions: string[];
}

// 학사 데이터 타입
export interface AcademicData {
  attendance: {
    total: number;
    present: number;
    absent: number;
    rate: number;
  };
  grades: {
    average: number;
    totalCredits: number;
    completedCredits: number;
  };
  assignments: {
    total: number;
    completed: number;
    pending: number;
  };
}

// 금융 데이터 타입
export interface FinancialData {
  accounts: {
    totalBalance: number;
    accountCount: number;
  };
  transactions: {
    total: number;
    income: number;
    expense: number;
  };
  creditScore: {
    score: number;
    grade: string;
  };
  savings: {
    monthly: number;
    total: number;
  };
}

// 크로니클 데이터 타입
export interface ChronicleData {
  posts: {
    total: number;
    likes: number;
    comments: number;
  };
  activities: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  rewards: {
    total: number;
    available: number;
  };
}

// 확장된 스킬트리 데이터 구조
export interface SkillTreeTier {
  tier: number;
  icon: string;
  skillName: string;
  levelUpConditions: string[];
  dependencySkills: string[];
  isUnlocked: boolean;
  currentProgress: number;
  maxProgress: number;
  rewards: {
    credo: number;
    credits: number;
    title?: string;
  };
}

export interface SkillTreeCategory {
  name: string;
  description: string;
  icon: string;
  tiers: SkillTreeTier[];
}

export interface ExpandedSkillTree {
  academic: {
    basicSkills: SkillTreeCategory;
    majorDeepening: SkillTreeCategory;
    selfDirectedLearning: SkillTreeCategory;
  };
  financial: {
    consumptionSavings: SkillTreeCategory;
    investmentCredit: SkillTreeCategory;
    financialKnowledge: SkillTreeCategory;
  };
}

// 확장된 스킬트리 데이터
export const EXPANDED_SKILL_TREE_DATA: ExpandedSkillTree = {
  academic: {
    basicSkills: {
      name: "기초 학업 능력",
      description: "학업의 기본이 되는 핵심 능력을 단계별로 향상시킵니다",
      icon: "📚",
      tiers: [
        {
          tier: 1,
          icon: "📚",
          skillName: "출석 마스터",
          levelUpConditions: [
            "누적 출석 30회 달성",
            "2주 연속 100% 출석"
          ],
          dependencySkills: [],
          isUnlocked: true,
          currentProgress: 0,
          maxProgress: 30,
          rewards: { credo: 100, credits: 50, title: "출석왕" }
        },
        {
          tier: 2,
          icon: "⏱️",
          skillName: "시간 관리",
          levelUpConditions: [
            "'주간 학습 계획' 퀘스트 5회",
            "지각/결석 없이 한 달"
          ],
          dependencySkills: ["출석 마스터"],
          isUnlocked: false,
          currentProgress: 0,
          maxProgress: 5,
          rewards: { credo: 200, credits: 100, title: "시간의 지배자" }
        },
        {
          tier: 3,
          icon: "✍️",
          skillName: "과제 전문가",
          levelUpConditions: [
            "A학점 과제 3회 이상",
            "제출 기한 100% 준수"
          ],
          dependencySkills: ["시간 관리"],
          isUnlocked: false,
          currentProgress: 0,
          maxProgress: 3,
          rewards: { credo: 300, credits: 150, title: "과제 마스터" }
        },
        {
          tier: 4,
          icon: "💯",
          skillName: "성적 우수",
          levelUpConditions: [
            "전체 학점 3.8 이상 달성",
            "'성적 향상' 퀘스트 완료"
          ],
          dependencySkills: ["과제 전문가"],
          isUnlocked: false,
          currentProgress: 0,
          maxProgress: 3.8,
          rewards: { credo: 500, credits: 300, title: "학업의 달인" }
        }
      ]
    },
    majorDeepening: {
      name: "전공 심화",
      description: "전공 분야의 전문성을 단계별로 심화시킵니다",
      icon: "🎓",
      tiers: [
        {
          tier: 2,
          icon: "📖",
          skillName: "전공 기초",
          levelUpConditions: [
            "전공 필수 과목 B+ 이상",
            "전공 관련 도서 5권 완독"
          ],
          dependencySkills: ["시간 관리"],
          isUnlocked: false,
          currentProgress: 0,
          maxProgress: 5,
          rewards: { credo: 250, credits: 120, title: "전공 입문자" }
        },
        {
          tier: 3,
          icon: "💻",
          skillName: "프로그래밍",
          levelUpConditions: [
            "'알고리즘 문제 풀기' 퀘스트 10회",
            "프로그래밍 관련 과목 A학점"
          ],
          dependencySkills: ["전공 기초"],
          isUnlocked: false,
          currentProgress: 0,
          maxProgress: 10,
          rewards: { credo: 400, credits: 200, title: "코딩 마스터" }
        },
        {
          tier: 4,
          icon: "🔬",
          skillName: "연구 참여",
          levelUpConditions: [
            "교수님 연구 프로젝트 참여",
            "'학회 논문 탐색' 퀘스트 완료"
          ],
          dependencySkills: ["프로그래밍"],
          isUnlocked: false,
          currentProgress: 0,
          maxProgress: 1,
          rewards: { credo: 600, credits: 350, title: "연구원" }
        },
        {
          tier: 5,
          icon: "🏆",
          skillName: "공모전 수상",
          levelUpConditions: [
            "교내/외 공모전 입상",
            "팀 프로젝트 리더 역할 수행"
          ],
          dependencySkills: ["연구 참여"],
          isUnlocked: false,
          currentProgress: 0,
          maxProgress: 1,
          rewards: { credo: 800, credits: 500, title: "공모전 챔피언" }
        }
      ]
    },
    selfDirectedLearning: {
      name: "자기주도 학습",
      description: "자발적이고 체계적인 학습 능력을 개발합니다",
      icon: "🚀",
      tiers: [
        {
          tier: 2,
          icon: "🏛️",
          skillName: "도서관 활용",
          levelUpConditions: [
            "누적 도서관 이용 50시간",
            "논문 검색 서비스 10회 이용"
          ],
          dependencySkills: ["시간 관리"],
          isUnlocked: false,
          currentProgress: 0,
          maxProgress: 50,
          rewards: { credo: 250, credits: 120, title: "도서관 탐험가" }
        },
        {
          tier: 3,
          icon: "🌐",
          skillName: "온라인 강의",
          levelUpConditions: [
            "K-MOOC 등 온라인 강의 3개 수료",
            "'나만의 학습 노트' 퀘스트 완료"
          ],
          dependencySkills: ["도서관 활용"],
          isUnlocked: false,
          currentProgress: 0,
          maxProgress: 3,
          rewards: { credo: 400, credits: 200, title: "온라인 학습자" }
        },
        {
          tier: 4,
          icon: "🗣️",
          skillName: "스터디 그룹",
          levelUpConditions: [
            "스터디 그룹 3개월 이상 활동",
            "'스터디 발표' 퀘스트 5회 완료"
          ],
          dependencySkills: ["온라인 강의"],
          isUnlocked: false,
          currentProgress: 0,
          maxProgress: 5,
          rewards: { credo: 600, credits: 350, title: "스터디 리더" }
        },
        {
          tier: 5,
          icon: "🧑‍🏫",
          skillName: "학업 튜터링",
          levelUpConditions: [
            "교내 튜터링 프로그램 참여 (튜터)",
            "후배에게 전공 지식 공유"
          ],
          dependencySkills: ["스터디 그룹"],
          isUnlocked: false,
          currentProgress: 0,
          maxProgress: 1,
          rewards: { credo: 800, credits: 500, title: "튜터 마스터" }
        }
      ]
    }
  },
  financial: {
    consumptionSavings: {
      name: "소비 및 저축 관리",
      description: "체계적인 소비와 저축 습관을 기릅니다",
      icon: "💰",
      tiers: [
        {
          tier: 1,
          icon: "💵",
          skillName: "예산 수립",
          levelUpConditions: [
            "'월간 예산 설정' 퀘스트 3회",
            "예산 내 지출 성공률 80%"
          ],
          dependencySkills: [],
          isUnlocked: true,
          currentProgress: 0,
          maxProgress: 3,
          rewards: { credo: 100, credits: 50, title: "예산 관리자" }
        },
        {
          tier: 2,
          icon: "📊",
          skillName: "소비 분석",
          levelUpConditions: [
            "주간/월간 소비 리포트 확인 10회",
            "'불필요 지출 찾기' 퀘스트 완료"
          ],
          dependencySkills: ["예산 수립"],
          isUnlocked: false,
          currentProgress: 0,
          maxProgress: 10,
          rewards: { credo: 200, credits: 100, title: "소비 분석가" }
        },
        {
          tier: 3,
          icon: "🐷",
          skillName: "소액 저축",
          levelUpConditions: [
            "'잔돈 저축' 퀘스트 20회 달성",
            "비상금 30만원 모으기"
          ],
          dependencySkills: ["소비 분석"],
          isUnlocked: false,
          currentProgress: 0,
          maxProgress: 20,
          rewards: { credo: 300, credits: 150, title: "저축 마스터" }
        },
        {
          tier: 4,
          icon: "🏦",
          skillName: "목표 저축",
          levelUpConditions: [
            "'한 학기 100만원 모으기' 달성",
            "주택청약종합저축 가입 및 유지"
          ],
          dependencySkills: ["소액 저축"],
          isUnlocked: false,
          currentProgress: 0,
          maxProgress: 1000000,
          rewards: { credo: 500, credits: 300, title: "저축 달인" }
        }
      ]
    },
    investmentCredit: {
      name: "투자 및 신용 관리",
      description: "투자와 신용 관리의 기초를 다집니다",
      icon: "📈",
      tiers: [
        {
          tier: 2,
          icon: "💳",
          skillName: "신용 점수 관리",
          levelUpConditions: [
            "신용점수 800점 이상 달성",
            "'내 신용점수 확인' 퀘스트 5회"
          ],
          dependencySkills: ["소비 분석"],
          isUnlocked: false,
          currentProgress: 0,
          maxProgress: 800,
          rewards: { credo: 250, credits: 120, title: "신용 관리자" }
        },
        {
          tier: 3,
          icon: "📈",
          skillName: "모의 투자",
          levelUpConditions: [
            "모의 투자 수익률 5% 달성",
            "'경제 뉴스 스크랩' 퀘스트 10회"
          ],
          dependencySkills: ["신용 점수 관리"],
          isUnlocked: false,
          currentProgress: 0,
          maxProgress: 5,
          rewards: { credo: 400, credits: 200, title: "투자 연습생" }
        },
        {
          tier: 4,
          icon: "💹",
          skillName: "실전 투자",
          levelUpConditions: [
            "소액 투자 시작 (주식, 펀드 등)",
            "'나만의 투자 원칙 세우기' 퀘스트"
          ],
          dependencySkills: ["모의 투자"],
          isUnlocked: false,
          currentProgress: 0,
          maxProgress: 1,
          rewards: { credo: 600, credits: 350, title: "실전 투자자" }
        },
        {
          tier: 5,
          icon: "🛡️",
          skillName: "리스크 관리",
          levelUpConditions: [
            "분산 투자 포트폴리오 구성",
            "'금융 사기 예방' 퀘스트 완료"
          ],
          dependencySkills: ["실전 투자"],
          isUnlocked: false,
          currentProgress: 0,
          maxProgress: 1,
          rewards: { credo: 800, credits: 500, title: "리스크 마스터" }
        }
      ]
    },
    financialKnowledge: {
      name: "금융 지식",
      description: "체계적인 금융 지식을 습득합니다",
      icon: "🎓",
      tiers: [
        {
          tier: 2,
          icon: "📰",
          skillName: "경제 기사 읽기",
          levelUpConditions: [
            "경제 기사 주 3회 이상 읽기",
            "'경제 용어 퀴즈' 퀘스트 통과"
          ],
          dependencySkills: ["소비 분석"],
          isUnlocked: false,
          currentProgress: 0,
          maxProgress: 3,
          rewards: { credo: 250, credits: 120, title: "경제 독서가" }
        },
        {
          tier: 3,
          icon: "🏛️",
          skillName: "금융 상품 이해",
          levelUpConditions: [
            "예/적금 상품 비교분석 퀘스트",
            "'나에게 맞는 카드 찾기' 퀘스트"
          ],
          dependencySkills: ["경제 기사 읽기"],
          isUnlocked: false,
          currentProgress: 0,
          maxProgress: 2,
          rewards: { credo: 400, credits: 200, title: "금융 상품 전문가" }
        },
        {
          tier: 4,
          icon: "⚖️",
          skillName: "세금과 연금",
          levelUpConditions: [
            "'연말정산 기초' 퀘스트 완료",
            "'국민연금 알아보기' 퀘스트 완료"
          ],
          dependencySkills: ["금융 상품 이해"],
          isUnlocked: false,
          currentProgress: 0,
          maxProgress: 2,
          rewards: { credo: 600, credits: 350, title: "세무 전문가" }
        },
        {
          tier: 5,
          icon: "🎓",
          skillName: "금융 전문가",
          levelUpConditions: [
            "금융 관련 자격증(AFPK 등) 준비",
            "'금융 포트폴리오 발표' 퀘스트"
          ],
          dependencySkills: ["세금과 연금"],
          isUnlocked: false,
          currentProgress: 0,
          maxProgress: 1,
          rewards: { credo: 800, credits: 500, title: "금융 마스터" }
        }
      ]
    }
  }
};

class SkillTreeService {
  // 학사 스킬트리 데이터 가져오기
  async getAcademicSkills(): Promise<SkillNode[]> {
    try {
      // 실제 API에서 학사 데이터 가져오기
      const academicData = await this.fetchAcademicData();
      
      // 데이터를 기반으로 스킬 레벨 계산
      const attendanceLevel = this.calculateAttendanceLevel(academicData.attendance.rate);
      const studyPlanLevel = this.calculateStudyPlanLevel(academicData.grades.average);
      const examPrepLevel = this.calculateExamPrepLevel(academicData.grades.average);
      const assignmentLevel = this.calculateAssignmentLevel(academicData.assignments.completed, academicData.assignments.total);
      
      return [
        {
          id: 'attendance',
          name: '출석관리',
          level: attendanceLevel,
          maxLevel: 10,
          currentXP: attendanceLevel * 100,
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
          realData: academicData.attendance,
        },
        {
          id: 'study_plan',
          name: '학업계획',
          level: studyPlanLevel,
          maxLevel: 10,
          currentXP: studyPlanLevel * 100,
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
          realData: academicData.grades,
        },
        {
          id: 'exam_prep',
          name: '시험준비',
          level: examPrepLevel,
          maxLevel: 10,
          currentXP: examPrepLevel * 100,
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
          realData: academicData.grades,
        },
        {
          id: 'assignment',
          name: '과제완성',
          level: assignmentLevel,
          maxLevel: 10,
          currentXP: assignmentLevel * 100,
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
          realData: academicData.assignments,
        },
      ];
    } catch (error) {
      console.error('학사 스킬 데이터 가져오기 실패:', error);
      return this.getDefaultAcademicSkills();
    }
  }

  // 금융 스킬트리 데이터 가져오기
  async getFinancialSkills(): Promise<SkillNode[]> {
    try {
      // 실제 API에서 금융 데이터 가져오기
      const financialData = await this.fetchFinancialData();
      
      // 데이터를 기반으로 스킬 레벨 계산
      const budgetLevel = this.calculateBudgetLevel(financialData.transactions.expense, financialData.transactions.income);
      const investmentLevel = this.calculateInvestmentLevel(financialData.accounts.totalBalance);
      const creditLevel = this.calculateCreditLevel(financialData.creditScore.score);
      const savingLevel = this.calculateSavingLevel(financialData.savings.monthly, financialData.transactions.income);
      
      return [
        {
          id: 'budget_management',
          name: '예산관리',
          level: budgetLevel,
          maxLevel: 10,
          currentXP: budgetLevel * 100,
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
          realData: financialData.transactions,
        },
        {
          id: 'investment_knowledge',
          name: '투자지식',
          level: investmentLevel,
          maxLevel: 10,
          currentXP: investmentLevel * 100,
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
          realData: financialData.accounts,
        },
        {
          id: 'credit_management',
          name: '신용관리',
          level: creditLevel,
          maxLevel: 10,
          currentXP: creditLevel * 100,
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
          realData: financialData.creditScore,
        },
        {
          id: 'saving_habit',
          name: '절약습관',
          level: savingLevel,
          maxLevel: 10,
          currentXP: savingLevel * 100,
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
          realData: financialData.savings,
        },
      ];
    } catch (error) {
      console.error('금융 스킬 데이터 가져오기 실패:', error);
      return this.getDefaultFinancialSkills();
    }
  }

  // Holland 성향 프로필 가져오기
  async getHollandProfile(): Promise<HollandProfile> {
    try {
      // 실제 API에서 크로니클 데이터 가져오기
      const chronicleData = await this.fetchChronicleData();
      
      // 크로니클 활동을 기반으로 Holland 성향 계산
      return this.calculateHollandProfile(chronicleData);
    } catch (error) {
      console.error('Holland 프로필 가져오기 실패:', error);
      return this.getDefaultHollandProfile();
    }
  }

  // AI 분석 실행
  async runAIAnalysis(): Promise<AIAnalysis> {
    try {
      // 실제 AI API 호출
      const response = await fetch(API_ENDPOINTS.AI_ADVISOR.GENERATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          academicSkills: await this.getAcademicSkills(),
          financialSkills: await this.getFinancialSkills(),
          hollandProfile: await this.getHollandProfile(),
          chronicleData: await this.fetchChronicleData(),
        }),
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('AI 분석 API 응답 오류');
      }
    } catch (error) {
      console.error('AI 분석 실행 실패:', error);
      return this.getMockAIAnalysis();
    }
  }

  // 학사 데이터 가져오기
  private async fetchAcademicData(): Promise<AcademicData> {
    const response = await fetch(API_ENDPOINTS.ACADEMIC.RECORDS);
    if (!response.ok) {
      throw new Error('학사 데이터 가져오기 실패');
    }
    return await response.json();
  }

  // 금융 데이터 가져오기
  private async fetchFinancialData(): Promise<FinancialData> {
    const response = await fetch(API_ENDPOINTS.FINANCIAL.SUMMARY);
    if (!response.ok) {
      throw new Error('금융 데이터 가져오기 실패');
    }
    return await response.json();
  }

  // 크로니클 데이터 가져오기
  private async fetchChronicleData(): Promise<ChronicleData> {
    const response = await fetch(API_ENDPOINTS.CHRONICLE.POSTS);
    if (!response.ok) {
      throw new Error('크로니클 데이터 가져오기 실패');
    }
    return await response.json();
  }

  // 스킬 레벨 계산 함수들
  private calculateAttendanceLevel(rate: number): number {
    if (rate >= 95) return 10;
    if (rate >= 90) return 9;
    if (rate >= 85) return 8;
    if (rate >= 80) return 7;
    if (rate >= 75) return 6;
    if (rate >= 70) return 5;
    if (rate >= 65) return 4;
    if (rate >= 60) return 3;
    if (rate >= 55) return 2;
    return 1;
  }

  private calculateStudyPlanLevel(average: number): number {
    if (average >= 4.5) return 10;
    if (average >= 4.0) return 9;
    if (average >= 3.5) return 8;
    if (average >= 3.0) return 7;
    if (average >= 2.5) return 6;
    if (average >= 2.0) return 5;
    if (average >= 1.5) return 4;
    if (average >= 1.0) return 3;
    if (average >= 0.5) return 2;
    return 1;
  }

  private calculateExamPrepLevel(average: number): number {
    return this.calculateStudyPlanLevel(average);
  }

  private calculateAssignmentLevel(completed: number, total: number): number {
    const rate = (completed / total) * 100;
    if (rate >= 95) return 10;
    if (rate >= 90) return 9;
    if (rate >= 85) return 8;
    if (rate >= 80) return 7;
    if (rate >= 75) return 6;
    if (rate >= 70) return 5;
    if (rate >= 65) return 4;
    if (rate >= 60) return 3;
    if (rate >= 55) return 2;
    return 1;
  }

  private calculateBudgetLevel(expense: number, income: number): number {
    const ratio = expense / income;
    if (ratio <= 0.7) return 10;
    if (ratio <= 0.8) return 9;
    if (ratio <= 0.85) return 8;
    if (ratio <= 0.9) return 7;
    if (ratio <= 0.95) return 6;
    if (ratio <= 1.0) return 5;
    if (ratio <= 1.1) return 4;
    if (ratio <= 1.2) return 3;
    if (ratio <= 1.3) return 2;
    return 1;
  }

  private calculateInvestmentLevel(balance: number): number {
    if (balance >= 10000000) return 10;
    if (balance >= 5000000) return 9;
    if (balance >= 2000000) return 8;
    if (balance >= 1000000) return 7;
    if (balance >= 500000) return 6;
    if (balance >= 200000) return 5;
    if (balance >= 100000) return 4;
    if (balance >= 50000) return 3;
    if (balance >= 20000) return 2;
    return 1;
  }

  private calculateCreditLevel(score: number): number {
    if (score >= 900) return 10;
    if (score >= 850) return 9;
    if (score >= 800) return 8;
    if (score >= 750) return 7;
    if (score >= 700) return 6;
    if (score >= 650) return 5;
    if (score >= 600) return 4;
    if (score >= 550) return 3;
    if (score >= 500) return 2;
    return 1;
  }

  private calculateSavingLevel(monthly: number, income: number): number {
    const rate = (monthly / income) * 100;
    if (rate >= 30) return 10;
    if (rate >= 25) return 9;
    if (rate >= 20) return 8;
    if (rate >= 15) return 7;
    if (rate >= 10) return 6;
    if (rate >= 5) return 5;
    if (rate >= 0) return 4;
    return 1;
  }

  // Holland 성향 계산
  private calculateHollandProfile(chronicleData: ChronicleData): HollandProfile {
    // 크로니클 활동을 기반으로 성향 계산 (예시)
    const social = Math.min(100, Math.max(20, 50 + (chronicleData.posts.total * 2)));
    const artistic = Math.min(100, Math.max(20, 40 + (chronicleData.activities.weekly * 3)));
    const enterprising = Math.min(100, Math.max(20, 60 + (chronicleData.rewards.total * 2)));
    
    return {
      realistic: 75,
      investigative: 60,
      artistic: Math.round(artistic),
      social: Math.round(social),
      enterprising: Math.round(enterprising),
      conventional: 40,
    };
  }

  // 기본값들
  private getDefaultAcademicSkills(): SkillNode[] {
    return [
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
      },
      // ... 다른 기본 스킬들
    ];
  }

  private getDefaultFinancialSkills(): SkillNode[] {
    return [
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
      },
      // ... 다른 기본 스킬들
    ];
  }

  private getDefaultHollandProfile(): HollandProfile {
    return {
      realistic: 75,
      investigative: 60,
      artistic: 45,
      social: 80,
      enterprising: 65,
      conventional: 40,
    };
  }

  private getMockAIAnalysis(): AIAnalysis {
    return {
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
  }

  // 확장된 스킬트리 관련 메서드들
  getExpandedSkillTree(): ExpandedSkillTree {
    return EXPANDED_SKILL_TREE_DATA;
  }

  // 특정 카테고리의 스킬트리 가져오기
  getSkillTreeCategory(category: keyof ExpandedSkillTree, subCategory: string): SkillTreeCategory | null {
    const tree = this.getExpandedSkillTree();
    const mainCategory = tree[category];
    
    if (mainCategory && mainCategory[subCategory as keyof typeof mainCategory]) {
      return mainCategory[subCategory as keyof typeof mainCategory];
    }
    
    return null;
  }

  // 사용자 진행도 업데이트
  updateUserProgress(
    category: keyof ExpandedSkillTree,
    subCategory: string,
    skillName: string,
    progress: number
  ): boolean {
    const categoryData = this.getSkillTreeCategory(category, subCategory);
    if (!categoryData) return false;

    const skill = categoryData.tiers.find(tier => tier.skillName === skillName);
    if (!skill) return false;

    skill.currentProgress = Math.min(progress, skill.maxProgress);
    
    // 진행도가 100%에 도달하면 스킬 해금
    if (skill.currentProgress >= skill.maxProgress) {
      skill.isUnlocked = true;
      this.unlockDependentSkills(category, subCategory, skillName);
      return true; // 스킬 해금됨
    }

    return false;
  }

  // 의존 스킬 해금
  private unlockDependentSkills(
    category: keyof ExpandedSkillTree,
    subCategory: string,
    unlockedSkillName: string
  ): void {
    const categoryData = this.getSkillTreeCategory(category, subCategory);
    if (!categoryData) return;

    // 의존 스킬이 해금된 스킬을 가진 스킬들을 찾아서 해금 가능 여부 확인
    categoryData.tiers.forEach(tier => {
      if (tier.dependencySkills.includes(unlockedSkillName)) {
        // 모든 의존 스킬이 해금되었는지 확인
        const allDependenciesUnlocked = tier.dependencySkills.every(depSkill => {
          const depTier = categoryData.tiers.find(t => t.skillName === depSkill);
          return depTier?.isUnlocked || false;
        });

        if (allDependenciesUnlocked) {
          tier.isUnlocked = true;
        }
      }
    });
  }

  // 사용자 진행도 가져오기
  getUserProgress(
    category: keyof ExpandedSkillTree,
    subCategory: string
  ): { unlocked: number; total: number; percentage: number } {
    const categoryData = this.getSkillTreeCategory(category, subCategory);
    if (!categoryData) return { unlocked: 0, total: 0, percentage: 0 };

    const unlocked = categoryData.tiers.filter(tier => tier.isUnlocked).length;
    const total = categoryData.tiers.length;
    const percentage = total > 0 ? Math.round((unlocked / total) * 100) : 0;

    return { unlocked, total, percentage };
  }

  // 전체 스킬트리 진행도
  getOverallProgress(): { academic: number; financial: number; total: number } {
    const academicProgress = this.getAcademicProgress();
    const financialProgress = this.getFinancialProgress();
    
    const total = (academicProgress + financialProgress) / 2;
    
    return {
      academic: academicProgress,
      financial: financialProgress,
      total: Math.round(total)
    };
  }

  // 학업 스킬트리 진행도
  private getAcademicProgress(): number {
    const basicSkills = this.getUserProgress('academic', 'basicSkills');
    const majorDeepening = this.getUserProgress('academic', 'majorDeepening');
    const selfDirectedLearning = this.getUserProgress('academic', 'selfDirectedLearning');

    return Math.round((basicSkills.percentage + majorDeepening.percentage + selfDirectedLearning.percentage) / 3);
  }

  // 금융 스킬트리 진행도
  private getFinancialProgress(): number {
    const consumptionSavings = this.getUserProgress('financial', 'consumptionSavings');
    const investmentCredit = this.getUserProgress('financial', 'investmentCredit');
    const financialKnowledge = this.getUserProgress('financial', 'financialKnowledge');

    return Math.round((consumptionSavings.percentage + investmentCredit.percentage + financialKnowledge.percentage) / 3);
  }

  // 스킬 해금 시 보상 지급
  getSkillRewards(
    category: keyof ExpandedSkillTree,
    subCategory: string,
    skillName: string
  ): { credo: number; credits: number; title?: string } | null {
    const categoryData = this.getSkillTreeCategory(category, subCategory);
    if (!categoryData) return null;

    const skill = categoryData.tiers.find(tier => tier.skillName === skillName);
    return skill?.rewards || null;
  }

  // 스킬 해금 시 크레도 지급 (중앙 서비스 연동)
  unlockSkillWithRewards(
    category: keyof ExpandedSkillTree,
    subCategory: string,
    skillName: string
  ): boolean {
    const rewards = this.getSkillRewards(category, subCategory, skillName);
    if (!rewards) return false;

    // 중앙 크레도 서비스에 크레도 지급
    const credoService = CredoService.getInstance();
    const success = credoService.earnCredo(
      rewards.credo, 
      'skill_unlock', 
      `${category} - ${subCategory} - ${skillName} 스킬 해금`
    );

    if (success) {
      console.log(`🎉 스킬 해금 보상 지급: ${rewards.credo} 크레도`);
    }

    return success;
  }

  // 다음 해금 가능한 스킬 찾기
  getNextUnlockableSkills(
    category: keyof ExpandedSkillTree,
    subCategory: string
  ): SkillTreeTier[] {
    const categoryData = this.getSkillTreeCategory(category, subCategory);
    if (!categoryData) return [];

    return categoryData.tiers.filter(tier => {
      if (tier.isUnlocked) return false;
      
      // 의존 스킬이 모두 해금되었는지 확인
      return tier.dependencySkills.every(depSkill => {
        const depTier = categoryData.tiers.find(t => t.skillName === depSkill);
        return depTier?.isUnlocked || false;
      });
    });
  }

  // 스킬트리 시각화 데이터 생성
  getSkillTreeVisualization(
    category: keyof ExpandedSkillTree,
    subCategory: string
  ): {
    nodes: Array<{
      id: string;
      label: string;
      icon: string;
      tier: number;
      isUnlocked: boolean;
      progress: number;
    }>;
    edges: Array<{
      from: string;
      to: string;
      type: 'dependency' | 'progression';
    }>;
  } {
    const categoryData = this.getSkillTreeCategory(category, subCategory);
    if (!categoryData) return { nodes: [], edges: [] };

    const nodes = categoryData.tiers.map(tier => ({
      id: tier.skillName,
      label: tier.skillName,
      icon: tier.icon,
      tier: tier.tier,
      isUnlocked: tier.isUnlocked,
      progress: tier.currentProgress
    }));

    const edges: Array<{ from: string; to: string; type: 'dependency' | 'progression' }> = [];
    
    categoryData.tiers.forEach(tier => {
      tier.dependencySkills.forEach(depSkill => {
        edges.push({
          from: depSkill,
          to: tier.skillName,
          type: 'dependency'
        });
      });
    });

    return { nodes, edges };
  }
}

export default new SkillTreeService();
