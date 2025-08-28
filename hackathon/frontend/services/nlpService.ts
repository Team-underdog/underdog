/**
 * AI 기반 의미적 유사도 매칭 NLP 서비스
 * React Native 환경에 최적화된 경량 자연어 처리 시스템
 */

// Holland 직업흥미 유형 정의
export enum HollandType {
  R = 'R', // 현실형 (Realistic)
  I = 'I', // 탐구형 (Investigative)
  A = 'A', // 예술형 (Artistic)
  S = 'S', // 사회형 (Social)
  E = 'E', // 진취형 (Enterprising)
  C = 'C'  // 관습형 (Conventional)
}

// Holland 유형별 설명
export const HOLLAND_DESCRIPTIONS = {
  [HollandType.R]: {
    name: '현실형',
    description: '구체적이고 체계적인 작업을 선호',
    skills: ['실행', '제작', '기술', '기계조작', '건설'],
    keywords: ['수리', '제작', '건설', '기계', '기술', '실용적', '체계적']
  },
  [HollandType.I]: {
    name: '탐구형',
    description: '논리적이고 분석적인 작업을 선호',
    skills: ['문제해결', '분석', '연구', '논리적사고', '창의적사고'],
    keywords: ['분석', '연구', '문제해결', '논리', '창의', '탐구', '실험']
  },
  [HollandType.A]: {
    name: '예술형',
    description: '자유롭고 창의적인 표현을 선호',
    skills: ['창작', '디자인', '표현', '혁신', '예술적감각'],
    keywords: ['창작', '디자인', '표현', '혁신', '예술', '창의', '자유']
  },
  [HollandType.S]: {
    name: '사회형',
    description: '사람들과의 상호작용을 선호',
    skills: ['소통', '교육', '상담', '협력', '공감'],
    keywords: ['소통', '교육', '상담', '협력', '공감', '도움', '사람']
  },
  [HollandType.E]: {
    name: '진취형',
    description: '리더십과 설득을 통한 성과 달성을 선호',
    skills: ['리더십', '설득', '계획', '조직', '의사결정'],
    keywords: ['리더십', '설득', '계획', '조직', '의사결정', '성과', '도전']
  },
  [HollandType.C]: {
    name: '관습형',
    description: '정확하고 체계적인 업무 처리를 선호',
    skills: ['정리', '계산', '기록', '검토', '품질관리'],
    keywords: ['정리', '계산', '기록', '검토', '품질', '정확', '체계']
  }
};

// 심리검사 문항 데이터베이스 (커리어넷 API에서 가져올 예정)
export interface QuestionItem {
  id: string;
  text: string;
  type: HollandType;
  category: string;
  weight: number;
  keywords: string[];
}

// 사용자 피드 분석 결과
export interface FeedAnalysisResult {
  feedText: string;
  matchedQuestions: Array<{
    question: QuestionItem;
    similarity: number;
    score: number;
  }>;
  hollandScores: {
    [key in HollandType]: number;
  };
  totalScore: number;
  recommendedSkills: string[];
}

/**
 * 경량화된 텍스트 임베딩 및 유사도 계산 서비스
 */
export class NLPService {
  private static instance: NLPService;
  private questionDatabase: QuestionItem[] = [];
  private initialized: boolean = false;

  private constructor() {}

  public static getInstance(): NLPService {
    if (!NLPService.instance) {
      NLPService.instance = new NLPService();
    }
    return NLPService.instance;
  }

  /**
   * 서비스 초기화 - 질문 데이터베이스 구축
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // 1. 커리어넷 API에서 심리검사 문항 요청
      await this.loadQuestionsFromCareerNet();
      
      // 2. 기본 질문 데이터베이스 구축 (API 실패 시 대체)
      if (this.questionDatabase.length === 0) {
        this.buildDefaultQuestionDatabase();
      }

      this.initialized = true;
      console.log(`NLP 서비스 초기화 완료: ${this.questionDatabase.length}개 문항 로드`);
    } catch (error) {
      console.error('NLP 서비스 초기화 실패:', error);
      // 기본 데이터베이스로 폴백
      this.buildDefaultQuestionDatabase();
      this.initialized = true;
    }
  }

  /**
   * 커리어넷 API에서 심리검사 문항 로드
   */
  private async loadQuestionsFromCareerNet(): Promise<void> {
    try {
      // 커리어넷 API 서비스 import
      const { default: careerNetService } = await import('./careerNetService');
      
      console.log('커리어넷 API에서 직업흥미검사(H) 문항 로드 시작...');
      
      // 1. 직업흥미검사(H) 문항들 조회
      const hollandData = await careerNetService.getHollandTestQuestions();
      
      // 2. 문항들을 Holland 유형별로 파싱
      if (hollandData.questions && hollandData.questions.length > 0) {
        this.questionDatabase = this.parseCareerNetQuestions(hollandData.questions);
        console.log(`커리어넷 API에서 ${this.questionDatabase.length}개 문항 로드 완료`);
      } else {
        console.log('커리어넷 API에서 문항을 가져올 수 없어 기본 데이터베이스 사용');
        throw new Error('API 응답에 문항이 없습니다');
      }
    } catch (error) {
      console.error('커리어넷 API 문항 로드 실패:', error);
      throw error;
    }
  }

  /**
   * 커리어넷 API 응답을 파싱하여 질문 데이터베이스 구축
   * @param apiResponse 커리어넷 API 응답 데이터
   */
  private parseCareerNetQuestions(apiResponse: any[]): QuestionItem[] {
    const questions: QuestionItem[] = [];
    
    try {
      // API 응답 구조에 따라 파싱 로직 구현
      // 실제 응답 구조를 확인한 후 정확한 파싱 로직으로 수정 필요
      
      apiResponse.forEach((item, index) => {
        // 기본 구조 (실제 API 응답에 맞게 수정 필요)
        const question: QuestionItem = {
          id: item.qno?.toString() || `Q${index + 1}`,
          text: item.question || item.text || `문항 ${index + 1}`,
          type: this.determineHollandType(item), // Holland 유형 자동 판별
          category: item.category || '일반',
          weight: 1.0,
          keywords: this.extractKeywords(item.question || item.text || '')
        };
        
        questions.push(question);
      });
      
      console.log(`API 응답 파싱 완료: ${questions.length}개 문항`);
      return questions;
    } catch (error) {
      console.error('API 응답 파싱 실패:', error);
      return [];
    }
  }

  /**
   * 문항 텍스트를 분석하여 Holland 유형 판별
   * @param questionText 문항 텍스트
   */
  private determineHollandType(item: any): HollandType {
    const text = (item.question || item.text || '').toLowerCase();
    
    // 각 Holland 유형별 키워드 매칭
    const typeKeywords = {
      [HollandType.R]: ['수리', '기계', '건설', '제작', '기술', '물건', '도구', '작업'],
      [HollandType.I]: ['분석', '연구', '문제', '논리', '실험', '탐구', '가설', '검증'],
      [HollandType.A]: ['창작', '디자인', '표현', '혁신', '예술', '창의', '자유'],
      [HollandType.S]: ['가르치기', '상담', '협력', '소통', '도움', '사람', '팀'],
      [HollandType.E]: ['이끌기', '계획', '설득', '리더', '프로젝트', '사업', '목표'],
      [HollandType.C]: ['정리', '계산', '기록', '검토', '품질', '정확', '체계', '관리']
    };

    // 가장 많은 키워드가 매칭되는 유형 선택
    let maxMatches = 0;
    let selectedType = HollandType.R;

    Object.entries(typeKeywords).forEach(([type, keywords]) => {
      const matches = keywords.filter(keyword => text.includes(keyword)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        selectedType = type as HollandType;
      }
    });

    return selectedType;
  }

  /**
   * 문항 텍스트에서 핵심 키워드 추출
   * @param text 문항 텍스트
   */
  private extractKeywords(text: string): string[] {
    // 한국어 형태소 분석을 위한 간단한 키워드 추출
    const keywords: string[] = [];
    const words = text.split(/[\s,\.!?]+/);
    
    words.forEach(word => {
      if (word.length >= 2 && word.length <= 10) {
        // 의미있는 단어만 키워드로 선택
        if (!['이', '가', '을', '를', '의', '에', '로', '와', '과', '도', '만'].includes(word)) {
          keywords.push(word);
        }
      }
    });

    return keywords.slice(0, 5); // 최대 5개 키워드 반환
  }

  /**
   * 기본 질문 데이터베이스 구축 (커리어넷 API 실패 시 대체)
   */
  private buildDefaultQuestionDatabase(): void {
    this.questionDatabase = [
      // 현실형 (R) 문항들
      {
        id: 'R001',
        text: '고장 난 물건을 직접 수리하기',
        type: HollandType.R,
        category: '기술수리',
        weight: 1.0,
        keywords: ['수리', '고장', '물건', '직접', '기술']
      },
      {
        id: 'R002',
        text: '기계나 도구를 사용하여 작업하기',
        type: HollandType.R,
        category: '기계조작',
        weight: 1.0,
        keywords: ['기계', '도구', '사용', '작업', '조작']
      },
      {
        id: 'R003',
        text: '건물이나 구조물을 설계하고 건설하기',
        type: HollandType.R,
        category: '건설',
        weight: 1.0,
        keywords: ['건물', '구조물', '설계', '건설', '건축']
      },

      // 탐구형 (I) 문항들
      {
        id: 'I001',
        text: '복잡한 문제를 논리적으로 분석하기',
        type: HollandType.I,
        category: '문제해결',
        weight: 1.0,
        keywords: ['복잡', '문제', '논리', '분석', '해결']
      },
      {
        id: 'I002',
        text: '새로운 아이디어나 이론을 연구하기',
        type: HollandType.I,
        category: '연구',
        weight: 1.0,
        keywords: ['새로운', '아이디어', '이론', '연구', '탐구']
      },
      {
        id: 'I003',
        text: '실험을 통해 가설을 검증하기',
        type: HollandType.I,
        category: '실험',
        weight: 1.0,
        keywords: ['실험', '가설', '검증', '과학', '탐구']
      },

      // 예술형 (A) 문항들
      {
        id: 'A001',
        text: '창의적인 작품을 제작하기',
        type: HollandType.A,
        category: '창작',
        weight: 1.0,
        keywords: ['창의적', '작품', '제작', '예술', '창작']
      },
      {
        id: 'A002',
        text: '새로운 디자인이나 아이디어를 표현하기',
        type: HollandType.A,
        category: '디자인',
        weight: 1.0,
        keywords: ['새로운', '디자인', '아이디어', '표현', '창의']
      },
      {
        id: 'A003',
        text: '자유롭고 혁신적인 방법으로 문제 해결하기',
        type: HollandType.A,
        category: '혁신',
        weight: 1.0,
        keywords: ['자유', '혁신', '방법', '문제', '해결']
      },

      // 사회형 (S) 문항들
      {
        id: 'S001',
        text: '다른 사람에게 지식이나 기술을 가르치기',
        type: HollandType.S,
        category: '교육',
        weight: 1.0,
        keywords: ['다른', '사람', '지식', '기술', '가르치기']
      },
      {
        id: 'S002',
        text: '사람들의 문제를 상담하고 도움을 주기',
        type: HollandType.S,
        category: '상담',
        weight: 1.0,
        keywords: ['사람', '문제', '상담', '도움', '지원']
      },
      {
        id: 'S003',
        text: '팀원들과 협력하여 목표를 달성하기',
        type: HollandType.S,
        category: '협력',
        weight: 1.0,
        keywords: ['팀원', '협력', '목표', '달성', '협업']
      },

      // 진취형 (E) 문항들
      {
        id: 'E001',
        text: '팀을 이끌고 목표를 달성하기',
        type: HollandType.E,
        category: '리더십',
        weight: 1.0,
        keywords: ['팀', '이끌기', '목표', '달성', '리더']
      },
      {
        id: 'E002',
        text: '새로운 사업이나 프로젝트를 계획하고 실행하기',
        type: HollandType.E,
        category: '계획',
        weight: 1.0,
        keywords: ['새로운', '사업', '프로젝트', '계획', '실행']
      },
      {
        id: 'E003',
        text: '다른 사람을 설득하여 동의를 얻기',
        type: HollandType.E,
        category: '설득',
        weight: 1.0,
        keywords: ['다른', '사람', '설득', '동의', '협상']
      },

      // 관습형 (C) 문항들
      {
        id: 'C001',
        text: '정확하고 체계적으로 자료를 정리하기',
        type: HollandType.C,
        category: '정리',
        weight: 1.0,
        keywords: ['정확', '체계적', '자료', '정리', '정돈']
      },
      {
        id: 'C002',
        text: '숫자나 데이터를 계산하고 분석하기',
        type: HollandType.C,
        category: '계산',
        weight: 1.0,
        keywords: ['숫자', '데이터', '계산', '분석', '통계']
      },
      {
        id: 'C003',
        text: '업무의 품질을 검토하고 관리하기',
        type: HollandType.C,
        category: '품질관리',
        weight: 1.0,
        keywords: ['업무', '품질', '검토', '관리', '감독']
      }
    ];
  }

  /**
   * 사용자 피드 분석 - 의미적 유사도 매칭
   */
  async analyzeFeed(feedText: string): Promise<FeedAnalysisResult> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // 1. 피드 텍스트 전처리
      const processedText = this.preprocessText(feedText);
      
      // 2. 유사도 계산
      const matchedQuestions = this.calculateSimilarities(processedText);
      
      // 3. Holland 점수 계산
      const hollandScores = this.calculateHollandScores(matchedQuestions);
      
      // 4. 총점 계산
      const totalScore = Object.values(hollandScores).reduce((sum, score) => sum + score, 0);
      
      // 5. 추천 스킬 생성
      const recommendedSkills = this.generateRecommendedSkills(hollandScores);

      return {
        feedText,
        matchedQuestions,
        hollandScores,
        totalScore,
        recommendedSkills
      };
    } catch (error) {
      console.error('피드 분석 실패:', error);
      throw error;
    }
  }

  /**
   * 텍스트 전처리
   */
  private preprocessText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s가-힣]/g, ' ') // 특수문자 제거
      .replace(/\s+/g, ' ') // 연속 공백 제거
      .trim();
  }

  /**
   * 의미적 유사도 계산 (키워드 기반 + 텍스트 유사도)
   */
  private calculateSimilarities(processedText: string): Array<{
    question: QuestionItem;
    similarity: number;
    score: number;
  }> {
    const similarities = this.questionDatabase.map(question => {
      // 1. 키워드 매칭 점수
      const keywordScore = this.calculateKeywordScore(processedText, question.keywords);
      
      // 2. 텍스트 유사도 점수 (간단한 문자열 유사도)
      const textSimilarity = this.calculateTextSimilarity(processedText, question.text);
      
      // 3. 종합 점수 (키워드 70% + 텍스트 유사도 30%)
      const totalScore = (keywordScore * 0.7) + (textSimilarity * 0.3);
      
      return {
        question,
        similarity: totalScore,
        score: totalScore * question.weight
      };
    });

    // 유사도 높은 순으로 정렬하고 상위 3개 반환
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3);
  }

  /**
   * 키워드 매칭 점수 계산
   */
  private calculateKeywordScore(text: string, keywords: string[]): number {
    let score = 0;
    const textWords = text.split(' ');
    
    keywords.forEach(keyword => {
      if (textWords.some(word => word.includes(keyword) || keyword.includes(word))) {
        score += 1;
      }
    });
    
    return Math.min(score / keywords.length, 1.0);
  }

  /**
   * 텍스트 유사도 계산 (Jaccard 유사도 기반)
   */
  private calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.split(' '));
    const words2 = new Set(text2.split(' '));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  /**
   * Holland 점수 계산
   */
  private calculateHollandScores(matchedQuestions: Array<{
    question: QuestionItem;
    similarity: number;
    score: number;
  }>): { [key in HollandType]: number } {
    const scores: { [key in HollandType]: number } = {
      [HollandType.R]: 0,
      [HollandType.I]: 0,
      [HollandType.A]: 0,
      [HollandType.S]: 0,
      [HollandType.E]: 0,
      [HollandType.C]: 0
    };

    matchedQuestions.forEach(({ question, score }) => {
      scores[question.type] += score;
    });

    return scores;
  }

  /**
   * 추천 스킬 생성
   */
  private generateRecommendedSkills(hollandScores: { [key in HollandType]: number }): string[] {
    const skills: string[] = [];
    
    // 점수가 높은 상위 3개 유형의 스킬 추천
    const sortedTypes = Object.entries(hollandScores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    sortedTypes.forEach(([type, score]) => {
      if (score > 0) {
        const hollandType = type as HollandType;
        const description = HOLLAND_DESCRIPTIONS[hollandType];
        skills.push(...description.skills);
      }
    });

    return [...new Set(skills)]; // 중복 제거
  }

  /**
   * 질문 데이터베이스 상태 확인
   */
  getDatabaseStatus(): { totalQuestions: number; types: { [key in HollandType]: number } } {
    const types: { [key in HollandType]: number } = {
      [HollandType.R]: 0,
      [HollandType.I]: 0,
      [HollandType.A]: 0,
      [HollandType.S]: 0,
      [HollandType.E]: 0,
      [HollandType.C]: 0
    };

    this.questionDatabase.forEach(question => {
      types[question.type]++;
    });

    return {
      totalQuestions: this.questionDatabase.length,
      types
    };
  }

  /**
   * 특정 유형의 질문들 조회
   */
  getQuestionsByType(type: HollandType): QuestionItem[] {
    return this.questionDatabase.filter(question => question.type === type);
  }

  /**
   * 질문 데이터베이스 업데이트
   */
  updateQuestionDatabase(questions: QuestionItem[]): void {
    this.questionDatabase = questions;
    console.log(`질문 데이터베이스 업데이트 완료: ${questions.length}개 문항`);
  }
}

// 싱글톤 인스턴스 export
export default NLPService.getInstance();
