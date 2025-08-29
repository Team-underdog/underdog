// 스킬의 상태 정의: 'acquired'(습득), 'unlockable'(활성화 가능), 'locked'(잠김)
export const SKILLS_DATA = {
  'academics': [
    { 
      id: 'attendance', 
      name: '출석 관리', 
      icon: '📚', 
      status: 'acquired', 
      x: 180, 
      y: 80,
      level: 5,
      maxLevel: 5,
      description: '매일 출석하여 기본 학점 확보',
      benefits: ['기본 학점 획득', '성실성 인증'],
      requirements: ['출석률 90% 이상']
    },
    { 
      id: 'study_plan', 
      name: '학습 계획', 
      icon: '📋', 
      status: 'acquired', 
      x: 180, 
      y: 180,
      level: 3,
      maxLevel: 5,
      description: '체계적인 학습 계획 수립',
      benefits: ['학습 효율성 향상', '목표 달성'],
      requirements: ['월간 학습 계획서 작성']
    },
    { 
      id: 'exam_prep', 
      name: '시험 준비', 
      icon: '✏️', 
      status: 'unlockable', 
      x: 80, 
      y: 280,
      level: 2,
      maxLevel: 5,
      description: '체계적인 시험 준비 전략',
      benefits: ['성적 향상', '시험 스트레스 감소'],
      requirements: ['학습 계획 완료']
    },
    { 
      id: 'assignment', 
      name: '과제 완성', 
      icon: '📝', 
      status: 'unlockable', 
      x: 280, 
      y: 280,
      level: 1,
      maxLevel: 5,
      description: '창의적이고 완성도 높은 과제 작성',
      benefits: ['창의력 향상', '학점 획득'],
      requirements: ['학습 계획 완료']
    },
    { 
      id: 'research', 
      name: '연구 활동', 
      icon: '🔬', 
      status: 'locked', 
      x: 180, 
      y: 380,
      level: 0,
      maxLevel: 5,
      description: '학술 연구 및 논문 작성',
      benefits: ['연구 능력 향상', '대학원 진학 준비'],
      requirements: ['과제 완성 3개 이상']
    }
  ],
  'finance': [
    { 
      id: 'budget_management', 
      name: '예산 관리', 
      icon: '💰', 
      status: 'acquired', 
      x: 180, 
      y: 80,
      level: 4,
      maxLevel: 5,
      description: '체계적인 개인 재무 관리',
      benefits: ['지출 통제', '저축 증가'],
      requirements: ['월 예산 계획서 작성']
    },
    { 
      id: 'investment_knowledge', 
      name: '투자 지식', 
      icon: '📈', 
      status: 'unlockable', 
      x: 80, 
      y: 180,
      level: 2,
      maxLevel: 5,
      description: '다양한 투자 상품 이해',
      benefits: ['수익률 향상', '재무 지식 확장'],
      requirements: ['예산 관리 완료']
    },
    { 
      id: 'credit_management', 
      name: '신용 관리', 
      icon: '💳', 
      status: 'unlockable', 
      x: 280, 
      y: 180,
      level: 3,
      maxLevel: 5,
      description: '신용 점수 향상 및 관리',
      benefits: ['대출 조건 개선', '신용 한도 증가'],
      requirements: ['예산 관리 완료']
    },
    { 
      id: 'saving_habit', 
      name: '저축 습관', 
      icon: '🏦', 
      status: 'locked', 
      x: 180, 
      y: 280,
      level: 1,
      maxLevel: 5,
      description: '지속적인 저축 습관 형성',
      benefits: ['비상금 확보', '목표 달성'],
      requirements: ['투자 지식 3레벨 이상']
    },
    { 
      id: 'financial_planning', 
      name: '재무 설계', 
      icon: '🎯', 
      status: 'locked', 
      x: 180, 
      y: 380,
      level: 0,
      maxLevel: 5,
      description: '장기적인 재무 목표 설정 및 달성',
      benefits: ['재무 자유', '미래 준비'],
      requirements: ['저축 습관 3레벨 이상']
    }
  ]
};

// 스킬 간의 연결 관계 정의
export const SKILLS_CONNECTIONS = {
  'academics': [
    { from: 'attendance', to: 'study_plan' },
    { from: 'study_plan', to: 'exam_prep' },
    { from: 'study_plan', to: 'assignment' },
    { from: 'exam_prep', to: 'research' },
    { from: 'assignment', to: 'research' }
  ],
  'finance': [
    { from: 'budget_management', to: 'investment_knowledge' },
    { from: 'budget_management', to: 'credit_management' },
    { from: 'investment_knowledge', to: 'saving_habit' },
    { from: 'credit_management', to: 'saving_habit' },
    { from: 'saving_habit', to: 'financial_planning' }
  ]
};
