/**
 * 동적 콘텐츠 생성 서비스
 * 매번 다른 질문과 분석을 생성하여 AI 응답의 다양성 확보
 */

export interface DynamicUserProfile {
  // 기본 정보
  name: string;
  age: number;
  university: string;
  department: string;
  grade: number;
  
  // 현재 상황 (랜덤 생성)
  currentMood: string;
  currentChallenge: string;
  recentAchievement: string;
  
  // 금융 상황 (랜덤 생성)
  financialStatus: 'excellent' | 'good' | 'fair' | 'challenging';
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsGoal: number;
  investmentInterest: string;
  
  // 학업 상황 (랜덤 생성)
  academicPerformance: 'excellent' | 'good' | 'fair' | 'needs_improvement';
  studyMotivation: number; // 1-10
  timeManagement: number; // 1-10
  careerGoals: string[];
  
  // 개인적 상황 (랜덤 생성)
  stressLevel: number; // 1-10
  socialLife: 'very_active' | 'active' | 'moderate' | 'quiet';
  hobbies: string[];
  personalGoals: string[];
}

export interface DynamicQuestion {
  category: 'financial' | 'academic' | 'personal' | 'career' | 'social';
  question: string;
  context: string;
  difficulty: 'easy' | 'medium' | 'hard';
  expectedInsight: string;
}

export interface DynamicAnalysis {
  focusArea: string;
  currentStrengths: string[];
  improvementAreas: string[];
  specificRecommendations: string[];
  timeline: string;
  successMetrics: string[];
}

class DynamicContentService {
  private static instance: DynamicContentService;
  
  private constructor() {}
  
  static getInstance(): DynamicContentService {
    if (!DynamicContentService.instance) {
      DynamicContentService.instance = new DynamicContentService();
    }
    return DynamicContentService.instance;
  }

  /**
   * 랜덤 사용자 프로필 생성
   */
  generateRandomUserProfile(): DynamicUserProfile {
    const names = ['김민수', '이지은', '박준호', '최수진', '정현우', '한소영', '윤도현', '임서연'];
    const universities = ['SSAFY', '서울대학교', '연세대학교', '고려대학교', '한양대학교', '성균관대학교'];
    const departments = ['소프트웨어개발', '컴퓨터공학', '정보보안', '데이터사이언스', 'AI융합학과', '디지털경영'];
    const moods = ['열정적', '차분한', '도전적인', '신중한', '창의적인', '체계적인'];
    const challenges = [
      '시간 관리의 어려움',
      '금융 계획 수립',
      '학업과 아르바이트 균형',
      '진로 결정의 고민',
      '인간관계 개선',
      '자기계발 동기부여'
    ];
    const achievements = [
      '프로젝트 완성',
      '목표 저축 달성',
      '학점 향상',
      '새로운 기술 습득',
      '봉사활동 참여',
      '네트워킹 확장'
    ];
    const investmentInterests = [
      '주식 투자',
      '펀드 투자',
      '부동산',
      '가상화폐',
      '저축',
      '보험'
    ];
    const careerGoals = [
      '대기업 취업',
      '스타트업 창업',
      '공무원',
      '프리랜서',
      '연구원',
      '강사'
    ];
    const hobbies = [
      '독서',
      '운동',
      '음악 감상',
      '게임',
      '요리',
      '여행',
      '사진 촬영',
      '그림 그리기'
    ];
    const personalGoals = [
      '외국어 마스터',
      '건강한 라이프스타일',
      '독서 습관 형성',
      '창의력 향상',
      '리더십 개발',
      '감정 관리'
    ];

    return {
      name: names[Math.floor(Math.random() * names.length)],
      age: 20 + Math.floor(Math.random() * 5), // 20-24세
      university: universities[Math.floor(Math.random() * universities.length)],
      department: departments[Math.floor(Math.random() * departments.length)],
      grade: 1 + Math.floor(Math.random() * 4), // 1-4학년
      
      currentMood: moods[Math.floor(Math.random() * moods.length)],
      currentChallenge: challenges[Math.floor(Math.random() * challenges.length)],
      recentAchievement: achievements[Math.floor(Math.random() * achievements.length)],
      
      financialStatus: ['excellent', 'good', 'fair', 'challenging'][Math.floor(Math.random() * 4)] as any,
      monthlyIncome: 200000 + Math.floor(Math.random() * 800000), // 20만원-100만원
      monthlyExpenses: 150000 + Math.floor(Math.random() * 600000), // 15만원-75만원
      savingsGoal: 500000 + Math.floor(Math.random() * 2000000), // 50만원-250만원
      investmentInterest: investmentInterests[Math.floor(Math.random() * investmentInterests.length)],
      
      academicPerformance: ['excellent', 'good', 'fair', 'needs_improvement'][Math.floor(Math.random() * 4)] as any,
      studyMotivation: 1 + Math.floor(Math.random() * 10), // 1-10
      timeManagement: 1 + Math.floor(Math.random() * 10), // 1-10
      careerGoals: this.getRandomSubset(careerGoals, 2, 4),
      
      stressLevel: 1 + Math.floor(Math.random() * 10), // 1-10
      socialLife: ['very_active', 'active', 'moderate', 'quiet'][Math.floor(Math.random() * 4)] as any,
      hobbies: this.getRandomSubset(hobbies, 3, 6),
      personalGoals: this.getRandomSubset(personalGoals, 2, 4),
    };
  }

  /**
   * 랜덤 하위 집합 선택
   */
  private getRandomSubset<T>(array: T[], min: number, max: number): T[] {
    const count = min + Math.floor(Math.random() * (max - min + 1));
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * 동적 금융 질문 생성
   */
  generateFinancialQuestion(profile: DynamicUserProfile): DynamicQuestion {
    const questions = [
      {
        question: `현재 ${profile.currentMood}한 상태에서 월 ${profile.monthlyIncome.toLocaleString()}원 수입으로 ${profile.savingsGoal.toLocaleString()}원을 모으려면 어떻게 해야 할까요?`,
        context: `${profile.name}님은 ${profile.university} ${profile.department} ${profile.grade}학년으로, 현재 ${profile.currentChallenge}을 겪고 있습니다.`,
        difficulty: 'medium' as const,
        expectedInsight: '현실적인 절약 계획과 수입 증대 방안'
      },
      {
        question: `${profile.investmentInterest}에 관심이 있는데, 학생 신분에서 어떻게 시작할 수 있을까요?`,
        context: `${profile.name}님은 ${profile.financialStatus === 'challenging' ? '금융 상황이 어려운' : '금융 계획을 세우고 싶은'} 상태입니다.`,
        difficulty: 'easy' as const,
        expectedInsight: '학생에게 적합한 투자 방법과 위험 관리'
      },
      {
        question: `월 ${profile.monthlyExpenses.toLocaleString()}원 지출을 줄여서 ${profile.savingsGoal.toLocaleString()}원 목표를 달성하려면 어떤 카테고리부터 시작해야 할까요?`,
        context: `${profile.name}님은 ${profile.recentAchievement}을 달성했으며, 다음 목표로 저축을 계획하고 있습니다.`,
        difficulty: 'hard' as const,
        expectedInsight: '지출 분석과 우선순위별 절약 전략'
      }
    ];

    return questions[Math.floor(Math.random() * questions.length)];
  }

  /**
   * 동적 학업 질문 생성
   */
  generateAcademicQuestion(profile: DynamicUserProfile): DynamicQuestion {
    const questions = [
      {
        question: `${profile.academicPerformance === 'needs_improvement' ? '학업 성적을 향상시키기 위해' : '더 높은 성과를 위해'} 어떤 학습 전략을 사용해야 할까요?`,
        context: `${profile.name}님은 현재 학습 동기 ${profile.studyMotivation}/10, 시간 관리 ${profile.timeManagement}/10 수준입니다.`,
        difficulty: 'medium' as const,
        expectedInsight: '개인 맞춤형 학습 방법과 시간 관리 전략'
      },
      {
        question: `${profile.careerGoals.join(', ')}을 목표로 하는데, ${profile.department} 전공자로서 어떤 준비를 해야 할까요?`,
        context: `${profile.name}님은 ${profile.grade}학년으로 진로 결정의 중요한 시기를 맞고 있습니다.`,
        difficulty: 'hard' as const,
        expectedInsight: '전공과 진로 연계 및 구체적 준비 방안'
      },
      {
        question: `현재 ${profile.stressLevel}/10의 스트레스 수준을 관리하면서 학업과 개인 생활의 균형을 어떻게 맞출 수 있을까요?`,
        context: `${profile.name}님은 ${profile.socialLife}한 사회생활을 하고 있으며, ${profile.hobbies.join(', ')} 등의 취미를 가지고 있습니다.`,
        difficulty: 'medium' as const,
        expectedInsight: '스트레스 관리와 균형잡힌 라이프스타일'
      }
    ];

    return questions[Math.floor(Math.random() * questions.length)];
  }

  /**
   * 동적 개인 성장 질문 생성
   */
  generatePersonalGrowthQuestion(profile: DynamicUserProfile): DynamicQuestion {
    const questions = [
      {
        question: `${profile.personalGoals.join(', ')}을 달성하기 위해 ${profile.currentMood}한 마음가짐으로 어떤 계획을 세워야 할까요?`,
        context: `${profile.name}님은 최근 ${profile.recentAchievement}을 통해 자신감을 얻었습니다.`,
        difficulty: 'easy' as const,
        expectedInsight: '목표 달성을 위한 구체적 계획과 동기부여'
      },
      {
        question: `${profile.socialLife === 'quiet' ? '사회적 활동을 늘리면서' : '더 의미 있는 인간관계를 만들기 위해'} 어떤 노력을 해야 할까요?`,
        context: `${profile.name}님은 ${profile.hobbies.join(', ')} 등의 취미를 통해 개인적 성장을 추구하고 있습니다.`,
        difficulty: 'medium' as const,
        expectedInsight: '사회적 기술 개발과 의미있는 관계 형성'
      },
      {
        question: `현재 ${profile.currentChallenge}을 극복하고 ${profile.personalGoals.join(', ')}을 달성하기 위한 단계별 계획을 어떻게 세울 수 있을까요?`,
        context: `${profile.name}님은 ${profile.age}세의 ${profile.university} 학생으로, 다양한 도전과 성장을 추구하고 있습니다.`,
        difficulty: 'hard' as const,
        expectedInsight: '문제 해결과 목표 달성을 위한 체계적 접근'
      }
    ];

    return questions[Math.floor(Math.random() * questions.length)];
  }

  /**
   * 동적 분석 프롬프트 생성
   */
  generateAnalysisPrompt(profile: DynamicUserProfile, question: DynamicQuestion): string {
    return `당신은 ${profile.name}님을 위한 개인 맞춤형 AI 상담사입니다.

## 📋 사용자 프로필
- **이름**: ${profile.name} (${profile.age}세)
- **학교**: ${profile.university} ${profile.department} ${profile.grade}학년
- **현재 상태**: ${profile.currentMood}, ${profile.currentChallenge} 겪는 중
- **최근 성과**: ${profile.recentAchievement}

## 💰 금융 상황
- **월 수입**: ${profile.monthlyIncome.toLocaleString()}원
- **월 지출**: ${profile.monthlyExpenses.toLocaleString()}원
- **저축 목표**: ${profile.savingsGoal.toLocaleString()}원
- **투자 관심**: ${profile.investmentInterest}
- **재정 상태**: ${profile.financialStatus === 'excellent' ? '매우 양호' : profile.financialStatus === 'good' ? '양호' : profile.financialStatus === 'fair' ? '보통' : '개선 필요'}

## 📚 학업 상황
- **학업 성과**: ${profile.academicPerformance === 'excellent' ? '우수' : profile.academicPerformance === 'good' ? '양호' : profile.academicPerformance === 'fair' ? '보통' : '개선 필요'}
- **학습 동기**: ${profile.studyMotivation}/10
- **시간 관리**: ${profile.timeManagement}/10
- **진로 목표**: ${profile.careerGoals.join(', ')}

## 🎯 개인적 상황
- **스트레스 수준**: ${profile.stressLevel}/10
- **사회생활**: ${profile.socialLife === 'very_active' ? '매우 활발' : profile.socialLife === 'active' ? '활발' : profile.socialLife === 'moderate' ? '보통' : '조용함'}
- **취미**: ${profile.hobbies.join(', ')}
- **개인 목표**: ${profile.personalGoals.join(', ')}

## ❓ 상담 질문
**카테고리**: ${question.category === 'financial' ? '💰 금융' : question.category === 'academic' ? '📚 학업' : question.category === 'personal' ? '🎯 개인성장' : question.category === 'career' ? '🚀 진로' : '👥 사회관계'}

**질문**: ${question.question}

**상황 설명**: ${question.context}

**난이도**: ${question.difficulty === 'easy' ? '쉬움' : question.difficulty === 'medium' ? '보통' : '어려움'}

## 💡 답변 요청사항
위 정보를 종합하여 ${profile.name}님에게 가장 적합한 맞춤형 조언을 제공해주세요:

1. **현재 상황 분석**: ${profile.name}님의 현재 상태와 도전과제
2. **구체적 해결방안**: 단계별 실행 가능한 방법들
3. **개인 맞춤 전략**: ${profile.name}님의 특성을 고려한 접근법
4. **예상 결과**: 이 방법을 따를 때 기대할 수 있는 변화
5. **다음 단계**: 즉시 시작할 수 있는 행동

${profile.name}님의 ${profile.currentMood}한 마음가짐과 ${profile.recentAchievement}을 바탕으로, 동기부여가 되는 답변을 한국어로 친근하게 제공해주세요.`;
  }

  /**
   * 동적 퀘스트 생성
   */
  generateDynamicQuest(profile: DynamicUserProfile): any {
    const questTemplates = [
      {
        title: `${profile.currentChallenge} 극복하기`,
        description: `${profile.currentChallenge}을 해결하여 ${profile.personalGoals[0]}을 달성하는 퀘스트`,
        category: 'personal' as const,
        difficulty: 'medium' as const,
        estimatedDuration: '2주',
        aiReason: `${profile.name}님이 현재 겪고 있는 ${profile.currentChallenge}을 해결하면 ${profile.personalGoals[0]} 달성에 큰 도움이 될 것입니다.`,
        rewards: { credo: 150, xp: 200 }
      },
      {
        title: `${profile.savingsGoal.toLocaleString()}원 저축 달성`,
        description: `월 ${profile.monthlyIncome.toLocaleString()}원 수입으로 ${profile.savingsGoal.toLocaleString()}원을 모으는 금융 퀘스트`,
        category: 'financial' as const,
        difficulty: profile.financialStatus === 'challenging' ? 'hard' : 'medium' as const,
        estimatedDuration: '3개월',
        aiReason: `${profile.name}님의 현재 재정 상태(${profile.financialStatus})를 고려할 때, 체계적인 저축 계획이 필요합니다.`,
        rewards: { credo: 200, xp: 250 }
      },
      {
        title: `${profile.careerGoals[0]} 준비하기`,
        description: `${profile.department} 전공자로서 ${profile.careerGoals[0]}을 위한 구체적 준비`,
        category: 'career' as const,
        difficulty: 'hard' as const,
        estimatedDuration: '6개월',
        aiReason: `${profile.name}님의 진로 목표(${profile.careerGoals.join(', ')})를 달성하기 위해 체계적인 준비가 필요합니다.`,
        rewards: { credo: 300, xp: 400 }
      }
    ];

    return questTemplates[Math.floor(Math.random() * questTemplates.length)];
  }
}

export default DynamicContentService;
