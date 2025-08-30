import { getCurrentUser } from './authService';
import GeminiService from './geminiService';

export interface QuestRecommendation {
  id: string;
  title: string;
  description: string;
  category: 'academic' | 'financial' | 'personal' | 'social' | 'career';
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedDuration: number; // 분 단위
  xpReward: number;
  skillRewards: { [skillName: string]: number };
  prerequisites?: string[];
  tags: string[];
  aiReason: string; // AI가 이 퀘스트를 추천하는 이유
  completionCriteria: string[];
  isPersonalized: boolean;
}

export interface UserProfile {
  academicLevel: number;
  financialHealth: number;
  topSkills: { name: string; level: number }[];
  weakSkills: { name: string; level: number }[];
  recentActivities: string[];
  preferences: string[];
  goals: string[];
}

class QuestRecommendationService {
  private static instance: QuestRecommendationService;
  
  private constructor() {}
  
  static getInstance(): QuestRecommendationService {
    if (!QuestRecommendationService.instance) {
      QuestRecommendationService.instance = new QuestRecommendationService();
    }
    return QuestRecommendationService.instance;
  }

  // 사용자 프로필 분석
  async analyzeUserProfile(): Promise<UserProfile> {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('사용자 정보를 가져올 수 없습니다.');
      }

      // 실제로는 백엔드 API에서 사용자 데이터를 가져와야 함
      // 여기서는 목업 데이터를 사용
      return {
        academicLevel: 7,
        financialHealth: 6,
        topSkills: [
          { name: '자기개발능력', level: 8 },
          { name: '의사소통능력', level: 7 },
          { name: '문제해결능력', level: 6 },
        ],
        weakSkills: [
          { name: '자원관리능력', level: 3 },
          { name: '수리능력', level: 4 },
          { name: '기술능력', level: 4 },
        ],
        recentActivities: [
          '해커톤 참여',
          '도서관 이용',
          '카페 지출',
          '온라인 강의 수강',
        ],
        preferences: ['기술', '창의성', '팀워크'],
        goals: ['취업 준비', '금융 독립', '전문성 향상'],
      };
    } catch (error) {
      console.error('사용자 프로필 분석 실패:', error);
      throw error;
    }
  }

  // AI 기반 퀘스트 추천 생성
  async generatePersonalizedQuests(count: number = 3): Promise<QuestRecommendation[]> {
    try {
      const userProfile = await this.analyzeUserProfile();
      
      // Gemini AI를 사용한 퀘스트 생성 시도
      try {
        const geminiService = GeminiService.getInstance();
        if (geminiService.isConfigured()) {
          console.log('🤖 Gemini AI를 사용하여 퀘스트 생성 중...');
          
          // 실제 사용자 데이터로 Gemini AI 호출
          const geminiQuests = await geminiService.generatePersonalizedQuests(
            userProfile,
            {}, // 금융 데이터 (실제로는 financialService에서 가져와야 함)
            {} // 학업 데이터 (실제로는 userService에서 가져와야 함)
          );
          
          if (geminiQuests.length > 0) {
            console.log('✅ Gemini AI 퀘스트 생성 성공:', geminiQuests.length);
            // Gemini AI 응답을 QuestRecommendation 형식으로 변환
            return geminiQuests.map((geminiQuest, index) => ({
              id: `gemini-${Date.now()}-${index}`,
              title: geminiQuest.title,
              description: geminiQuest.description,
              category: this.mapCategory(geminiQuest.category),
              difficulty: this.mapDifficulty(geminiQuest.difficulty),
              estimatedDuration: this.parseDuration(geminiQuest.estimatedDuration),
              xpReward: geminiQuest.rewards.xp,
              skillRewards: { [geminiQuest.category]: geminiQuest.rewards.credo * 0.1 },
              prerequisites: [],
              tags: [geminiQuest.category, geminiQuest.difficulty],
              aiReason: geminiQuest.aiReason,
              completionCriteria: [`${geminiQuest.estimatedDuration} 동안 ${geminiQuest.title} 완료`],
              isPersonalized: true,
            }));
          }
        }
      } catch (geminiError) {
        console.warn('⚠️ Gemini AI 퀘스트 생성 실패, 기본 퀘스트 사용:', geminiError);
      }

      // Gemini AI 실패 시 기본 퀘스트 생성
      console.log('🔄 기본 퀘스트 생성 시스템 사용');
      const recommendations: QuestRecommendation[] = [];

      // 약점 스킬 보완 퀘스트
      if (userProfile.weakSkills.length > 0) {
        const weakSkill = userProfile.weakSkills[0];
        recommendations.push(this.createSkillImprovementQuest(weakSkill, userProfile));
      }

      // 강점 스킬 활용 퀘스트
      if (userProfile.topSkills.length > 0) {
        const topSkill = userProfile.topSkills[0];
        recommendations.push(this.createSkillUtilizationQuest(topSkill, userProfile));
      }

      // 금융 건강 개선 퀘스트
      if (userProfile.financialHealth < 7) {
        recommendations.push(this.createFinancialHealthQuest(userProfile));
      }

      // 학업 성과 향상 퀘스트
      if (userProfile.academicLevel < 8) {
        recommendations.push(this.createAcademicImprovementQuest(userProfile));
      }

      // 개인적 성장 퀘스트
      recommendations.push(this.createPersonalGrowthQuest(userProfile));

      // 최대 개수만큼 반환
      return recommendations.slice(0, count);
      
    } catch (error) {
      console.error('개인화 퀘스트 생성 실패:', error);
      return this.getFallbackQuests();
    }
  }

  // Gemini AI 카테고리를 QuestRecommendation 카테고리로 매핑
  private mapCategory(geminiCategory: string): 'academic' | 'financial' | 'personal' | 'social' | 'career' {
    switch (geminiCategory.toLowerCase()) {
      case 'academic':
        return 'academic';
      case 'financial':
        return 'financial';
      case 'personal':
        return 'personal';
      case 'social':
        return 'social';
      default:
        return 'personal';
    }
  }

  // Gemini AI 난이도를 QuestRecommendation 난이도로 매핑
  private mapDifficulty(geminiDifficulty: string): 'easy' | 'medium' | 'hard' {
    switch (geminiDifficulty.toLowerCase()) {
      case 'easy':
        return 'easy';
      case 'normal':
        return 'medium';
      case 'hard':
        return 'hard';
      default:
        return 'medium';
    }
  }

  // Gemini AI 소요시간을 분 단위로 파싱
  private parseDuration(durationText: string): number {
    if (durationText.includes('주')) {
      const weeks = parseInt(durationText.match(/(\d+)주/)?.[1] || '1');
      return weeks * 7 * 24 * 60; // 주를 분으로 변환
    } else if (durationText.includes('개월')) {
      const months = parseInt(durationText.match(/(\d+)개월/)?.[1] || '1');
      return months * 30 * 24 * 60; // 개월을 분으로 변환
    } else if (durationText.includes('일')) {
      const days = parseInt(durationText.match(/(\d+)일/)?.[1] || '1');
      return days * 24 * 60; // 일을 분으로 변환
    } else {
      return 60; // 기본값: 1시간
    }
  }

  // 스킬 개선 퀘스트 생성
  private createSkillImprovementQuest(
    weakSkill: { name: string; level: number },
    profile: UserProfile
  ): QuestRecommendation {
    const questTemplates = {
      '자원관리능력': {
        title: '스마트한 소비 습관 형성하기',
        description: '1주일간 모든 지출을 기록하고 카테고리별 분석을 통해 절약 포인트를 찾아보세요.',
        category: 'financial' as const,
        difficulty: 'easy' as const,
        estimatedDuration: 30,
        xpReward: 150,
        skillRewards: { '자원관리능력': 100, '직업윤리': 50 },
        tags: ['절약', '기록', '분석'],
        completionCriteria: ['7일간 지출 기록', '카테고리별 분석 리포트 작성', '절약 계획 수립'],
      },
      '수리능력': {
        title: '데이터 분석 기초 다지기',
        description: '온라인 통계 강의를 수강하고 간단한 데이터 분석 프로젝트를 완성해보세요.',
        category: 'academic' as const,
        difficulty: 'medium' as const,
        estimatedDuration: 120,
        xpReward: 200,
        skillRewards: { '수리능력': 120, '정보능력': 80 },
        tags: ['통계', '분석', '프로젝트'],
        completionCriteria: ['통계 강의 수강 완료', '데이터 분석 프로젝트 제출', '학습 노트 작성'],
      },
      '기술능력': {
        title: '코딩 기초 학습하기',
        description: 'Python 기초 강의를 수강하고 간단한 프로그램을 만들어보세요.',
        category: 'career' as const,
        difficulty: 'medium' as const,
        estimatedDuration: 180,
        xpReward: 250,
        skillRewards: { '기술능력': 150, '문제해결능력': 100 },
        tags: ['프로그래밍', 'Python', '알고리즘'],
        completionCriteria: ['Python 기초 강의 완료', '간단한 프로그램 3개 작성', '코드 리뷰 참여'],
      },
    };

    const template = questTemplates[weakSkill.name as keyof typeof questTemplates] || questTemplates['기술능력'];

    return {
      id: `skill_improvement_${weakSkill.name}_${Date.now()}`,
      ...template,
      aiReason: `현재 ${weakSkill.name}이 Lv.${weakSkill.level}로 상대적으로 낮습니다. 이 퀘스트를 통해 ${weakSkill.name}을 향상시키고 균형 잡힌 성장을 도모할 수 있습니다.`,
      isPersonalized: true,
    };
  }

  // 강점 스킬 활용 퀘스트 생성
  private createSkillUtilizationQuest(
    topSkill: { name: string; level: number },
    profile: UserProfile
  ): QuestRecommendation {
    const questTemplates = {
      '자기개발능력': {
        title: '멘토링 프로그램 참여하기',
        description: '자신의 강점을 활용하여 후배들을 멘토링하고, 동시에 리더십을 기를 수 있습니다.',
        category: 'social' as const,
        difficulty: 'medium' as const,
        estimatedDuration: 240,
        xpReward: 300,
        skillRewards: { '자기개발능력': 150, '대인관계능력': 100, '조직이해능력': 50 },
        tags: ['멘토링', '리더십', '성장'],
        completionCriteria: ['멘토링 프로그램 신청', '월 4회 멘토링 진행', '멘티 피드백 수집'],
      },
      '의사소통능력': {
        title: '프레젠테이션 챌린지',
        description: '복잡한 주제를 5분 내에 명확하게 설명하는 프레젠테이션을 준비해보세요.',
        category: 'career' as const,
        difficulty: 'hard' as const,
        estimatedDuration: 300,
        xpReward: 400,
        skillRewards: { '의사소통능력': 200, '자기개발능력': 100, '정보능력': 100 },
        tags: ['프레젠테이션', '커뮤니케이션', '자신감'],
        completionCriteria: ['주제 선정 및 자료 조사', '5분 프레젠테이션 준비', '동료들 앞에서 발표'],
      },
      '문제해결능력': {
        title: '실생활 문제 해결 프로젝트',
        description: '일상에서 발견한 문제점을 정의하고, 창의적인 해결책을 제안하는 프로젝트를 진행해보세요.',
        category: 'personal' as const,
        difficulty: 'hard' as const,
        estimatedDuration: 480,
        xpReward: 500,
        skillRewards: { '문제해결능력': 250, '창의성': 150, '기술능력': 100 },
        tags: ['문제해결', '창의성', '프로젝트'],
        completionCriteria: ['문제 정의 및 분석', '해결책 아이디어 도출', '프로토타입 제작 및 테스트'],
      },
    };

    const template = questTemplates[topSkill.name as keyof typeof questTemplates] || questTemplates['자기개발능력'];

    return {
      id: `skill_utilization_${topSkill.name}_${Date.now()}`,
      ...template,
      aiReason: `현재 ${topSkill.name}이 Lv.${topSkill.level}로 높은 수준입니다. 이 강점을 활용하여 더 큰 성과를 창출하고 다른 영역으로 확장할 수 있습니다.`,
      isPersonalized: true,
    };
  }

  // 금융 건강 개선 퀘스트 생성
  private createFinancialHealthQuest(profile: UserProfile): QuestRecommendation {
    return {
      id: `financial_health_${Date.now()}`,
      title: '건전한 저축 습관 형성하기',
      description: '3개월간 월 소득의 20% 이상을 저축하고, 저축 목표를 설정하여 달성해보세요.',
      category: 'financial',
      difficulty: 'medium',
      estimatedDuration: 4320, // 3개월
      xpReward: 300,
      skillRewards: { '자원관리능력': 200, '직업윤리': 100 },
      tags: ['저축', '목표설정', '재무계획'],
      completionCriteria: ['월 저축 목표 설정', '3개월간 지속적인 저축', '저축 성과 분석 리포트 작성'],
      aiReason: '현재 금융 건강도가 6점으로 개선의 여지가 있습니다. 체계적인 저축 습관을 통해 금융 독립성을 높일 수 있습니다.',
      isPersonalized: true,
    };
  }

  // 학업 성과 향상 퀘스트 생성
  private createAcademicImprovementQuest(profile: UserProfile): QuestRecommendation {
    return {
      id: `academic_improvement_${Date.now()}`,
      title: '학습 효율성 향상 프로젝트',
      description: '현재 학습 방법을 분석하고, 더 효율적인 학습 전략을 개발하여 적용해보세요.',
      category: 'academic',
      difficulty: 'hard',
      estimatedDuration: 1440, // 1일
      xpReward: 400,
      skillRewards: { '정보능력': 200, '자기개발능력': 150, '문제해결능력': 50 },
      tags: ['학습전략', '효율성', '자기분석'],
      completionCriteria: ['현재 학습 방법 분석', '새로운 학습 전략 개발', '1주일간 적용 및 효과 측정'],
      aiReason: '현재 학업 수준이 7점으로 양호하지만, 더 체계적이고 효율적인 학습 방법을 통해 8점 이상으로 향상시킬 수 있습니다.',
      isPersonalized: true,
    };
  }

  // 개인적 성장 퀘스트 생성
  private createPersonalGrowthQuest(profile: UserProfile): QuestRecommendation {
    return {
      id: `personal_growth_${Date.now()}`,
      title: '자기계발 로드맵 작성하기',
      description: '현재 상황과 목표를 분석하여 1년간의 자기계발 계획을 수립하고 실행해보세요.',
      category: 'personal',
      difficulty: 'hard',
      estimatedDuration: 2880, // 2일
      xpReward: 500,
      skillRewards: { '자기개발능력': 250, '정보능력': 150, '문제해결능력': 100 },
      tags: ['자기계발', '계획수립', '목표달성'],
      completionCriteria: ['현재 상황 분석', '1년간 목표 설정', '단계별 실행 계획 수립', '월간 진행상황 점검'],
      aiReason: '사용자의 강점과 약점을 종합적으로 분석한 결과, 체계적인 자기계발 계획을 통해 균형 잡힌 성장을 도모할 수 있습니다.',
      isPersonalized: true,
    };
  }

  // 기본 퀘스트 반환 (에러 발생 시)
  private getFallbackQuests(): QuestRecommendation[] {
    return [
      {
        id: `fallback_${Date.now()}`,
        title: '기본 퀘스트',
        description: '시스템 오류로 인해 기본 퀘스트가 제공됩니다.',
        category: 'personal',
        difficulty: 'easy',
        estimatedDuration: 60,
        xpReward: 50,
        skillRewards: { '자기개발능력': 30 },
        tags: ['기본', '시스템'],
        completionCriteria: ['기본 활동 완료'],
        aiReason: '시스템 오류로 인한 기본 퀘스트입니다.',
        isPersonalized: false,
      },
    ];
  }
}

export default QuestRecommendationService.getInstance();
