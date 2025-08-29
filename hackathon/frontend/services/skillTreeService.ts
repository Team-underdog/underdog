import { API_ENDPOINTS } from '../config/api';

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
      const response = await fetch(API_ENDPOINTS.HEALTH.STATUS + '/ai-analysis', {
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
}

export default new SkillTreeService();
