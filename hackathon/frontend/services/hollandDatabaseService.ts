/**
 * Holland 데이터베이스 관리 서비스
 * 구축된 데이터베이스를 사용하여 사용자 피드 분석 및 경험치 계산
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { buildHollandDatabase, validateHollandDatabase } from '../scripts/buildHollandDatabase';

// 기본 Holland 데이터베이스 (오프라인용)
import defaultHollandDatabase from '../data/hollandDatabase.json';

// Holland 유형 정의
export enum HollandType {
  R = 'R', // 현실형 (Realistic)
  I = 'I', // 탐구형 (Investigative)
  A = 'A', // 예술형 (Artistic)
  S = 'S', // 사회형 (Social)
  E = 'E', // 진취형 (Enterprising)
  C = 'C'  // 관습형 (Conventional)
}

// Holland 데이터베이스 구조
export interface HollandQuestion {
  id: string;
  originalText: string;
  type: HollandType;
  confidence: number;
  matchedKeywords: string[];
  category: string;
  weight: number;
}

export interface HollandDatabase {
  version: string;
  lastUpdated: string;
  totalQuestions: number;
  hollandDatabase: {
    [key in HollandType]: HollandQuestion[];
  };
  metadata: {
    source: string;
    testType: string;
    testNumber: number;
    keywords: any;
  };
}

// 사용자 피드 분석 결과
export interface FeedAnalysisResult {
  feedText: string;
  matchedQuestions: Array<{
    question: HollandQuestion;
    similarity: number;
    score: number;
  }>;
  hollandScores: {
    [key in HollandType]: number;
  };
  totalScore: number;
  recommendedSkills: string[];
  experienceGains: {
    [key in HollandType]: number;
  };
}

// Holland 유형별 설명 및 스킬
export const HOLLAND_DESCRIPTIONS = {
  [HollandType.R]: {
    name: '현실형',
    description: '구체적이고 체계적인 작업을 선호',
    skills: ['실행', '제작', '기술', '기계조작', '건설', '수리', '설치', '운영'],
    color: '#FF6B6B'
  },
  [HollandType.I]: {
    name: '탐구형',
    description: '논리적이고 분석적인 작업을 선호',
    skills: ['문제해결', '분석', '연구', '논리적사고', '창의적사고', '실험', '탐구'],
    color: '#4ECDC4'
  },
  [HollandType.A]: {
    name: '예술형',
    description: '자유롭고 창의적인 표현을 선호',
    skills: ['창작', '디자인', '표현', '혁신', '예술적감각', '상상력', '창의력'],
    color: '#45B7D1'
  },
  [HollandType.S]: {
    name: '사회형',
    description: '사람들과의 상호작용을 선호',
    skills: ['소통', '교육', '상담', '협력', '공감', '지원', '치료', '봉사'],
    color: '#96CEB4'
  },
  [HollandType.E]: {
    name: '진취형',
    description: '리더십과 설득을 통한 성과 달성을 선호',
    skills: ['리더십', '설득', '계획', '조직', '의사결정', '경영', '관리', '마케팅'],
    color: '#FFEAA7'
  },
  [HollandType.C]: {
    name: '관습형',
    description: '정확하고 체계적인 업무 처리를 선호',
    skills: ['정리', '계산', '기록', '검토', '품질관리', '체계화', '표준화', '관리'],
    color: '#DDA0DD'
  }
};

/**
 * Holland 데이터베이스 관리 서비스
 */
export class HollandDatabaseService {
  private static instance: HollandDatabaseService;
  private database: HollandDatabase | null = null;
  private initialized: boolean = false;

  private constructor() {}

  public static getInstance(): HollandDatabaseService {
    if (!HollandDatabaseService.instance) {
      HollandDatabaseService.instance = new HollandDatabaseService();
    }
    return HollandDatabaseService.instance;
  }

  /**
   * 서비스 초기화 - 데이터베이스 로드 또는 구축
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      console.log('🚀 Holland 데이터베이스 서비스 초기화 시작...');
      
      // 1. 로컬 스토리지에서 기존 데이터베이스 확인
      const existingDatabase = await this.loadFromStorage();
      
      if (existingDatabase && this.isDatabaseValid(existingDatabase)) {
        this.database = existingDatabase;
        console.log(`✅ 기존 Holland 데이터베이스 로드 완료: ${existingDatabase.totalQuestions}개 문항`);
      } else {
        try {
          // 2. 기존 데이터베이스가 없거나 유효하지 않으면 새로 구축 시도
          console.log('🔄 Holland 데이터베이스 구축 시도...');
          this.database = await buildHollandDatabase();
          
          // 3. 새로 구축된 데이터베이스를 로컬 스토리지에 저장
          await this.saveToStorage(this.database);
          console.log('💾 새로 구축된 Holland 데이터베이스 저장 완료');
        } catch (error) {
          // 4. 구축 실패 시 기본 데이터베이스 사용
          console.log('⚠️ Holland 데이터베이스 구축 실패, 기본 데이터베이스 사용:', error);
          this.database = defaultHollandDatabase;
          await this.saveToStorage(this.database);
          console.log('💾 기본 Holland 데이터베이스 저장 완료');
        }
      }
      
      this.initialized = true;
      console.log('🎉 Holland 데이터베이스 서비스 초기화 완료');
      
    } catch (error) {
      console.error('❌ Holland 데이터베이스 서비스 초기화 실패:', error);
      throw error;
    }
  }

  /**
   * 로컬 스토리지에서 데이터베이스 로드
   */
  private async loadFromStorage(): Promise<HollandDatabase | null> {
    try {
      const stored = await AsyncStorage.getItem('hollandDatabase');
      if (stored) {
        return JSON.parse(stored);
      }
      return null;
    } catch (error) {
      console.error('로컬 스토리지에서 데이터베이스 로드 실패:', error);
      return null;
    }
  }

  /**
   * 데이터베이스를 로컬 스토리지에 저장
   */
  private async saveToStorage(database: HollandDatabase): Promise<void> {
    try {
      await AsyncStorage.setItem('hollandDatabase', JSON.stringify(database));
    } catch (error) {
      console.error('로컬 스토리지에 데이터베이스 저장 실패:', error);
    }
  }

  /**
   * 데이터베이스 유효성 검사
   */
  private isDatabaseValid(database: any): database is HollandDatabase {
    return validateHollandDatabase(database);
  }

  /**
   * 사용자 피드 분석 - Holland 유형별 점수 및 경험치 계산
   */
  async analyzeFeed(feedText: string): Promise<FeedAnalysisResult> {
    if (!this.initialized || !this.database) {
      await this.initialize();
    }

    if (!this.database) {
      throw new Error('Holland 데이터베이스가 초기화되지 않았습니다.');
    }

    try {
      console.log('🧠 사용자 피드 분석 시작:', feedText.substring(0, 50) + '...');
      
      // 1. 피드 텍스트 전처리
      const processedText = this.preprocessText(feedText);
      
      // 2. 모든 Holland 유형의 문항들과 유사도 계산
      const matchedQuestions = this.calculateSimilarities(processedText);
      
      // 3. Holland 유형별 점수 계산
      const hollandScores = this.calculateHollandScores(matchedQuestions);
      
      // 4. 총점 계산
      const totalScore = Object.values(hollandScores).reduce((sum, score) => sum + score, 0);
      
      // 5. 추천 스킬 생성
      const recommendedSkills = this.generateRecommendedSkills(hollandScores);
      
      // 6. 경험치 획득량 계산
      const experienceGains = this.calculateExperienceGains(matchedQuestions);

      const result: FeedAnalysisResult = {
        feedText,
        matchedQuestions,
        hollandScores,
        totalScore,
        recommendedSkills,
        experienceGains
      };

      console.log('✅ 피드 분석 완료:', {
        totalScore: result.totalScore.toFixed(2),
        topType: this.getTopHollandType(result.hollandScores),
        experienceGained: Object.values(result.experienceGains).reduce((sum, exp) => sum + exp, 0)
      });

      return result;
      
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
   * 피드와 모든 문항 간의 유사도 계산
   */
  private calculateSimilarities(processedText: string): Array<{
    question: HollandQuestion;
    similarity: number;
    score: number;
  }> {
    const similarities: Array<{
      question: HollandQuestion;
      similarity: number;
      score: number;
    }> = [];

    // 모든 Holland 유형의 문항들과 유사도 계산
    Object.values(this.database!.hollandDatabase).forEach(questions => {
      questions.forEach(question => {
        // 1. 키워드 매칭 점수 (70% 가중치)
        const keywordScore = this.calculateKeywordScore(processedText, question.matchedKeywords);
        
        // 2. 텍스트 유사도 점수 (30% 가중치)
        const textSimilarity = this.calculateTextSimilarity(processedText, question.originalText);
        
        // 3. 종합 점수 계산
        const totalScore = (keywordScore * 0.7) + (textSimilarity * 0.3);
        
        // 4. 신뢰도 가중치 적용
        const finalScore = totalScore * question.confidence * question.weight;
        
        similarities.push({
          question,
          similarity: totalScore,
          score: finalScore
        });
      });
    });

    // 유사도 높은 순으로 정렬하고 상위 5개 반환
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);
  }

  /**
   * 키워드 매칭 점수 계산
   */
  private calculateKeywordScore(text: string, keywords: string[]): number {
    if (keywords.length === 0) return 0;
    
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
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Holland 유형별 점수 계산
   */
  private calculateHollandScores(matchedQuestions: Array<{
    question: HollandQuestion;
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
   * 경험치 획득량 계산
   */
  private calculateExperienceGains(matchedQuestions: Array<{
    question: HollandQuestion;
    similarity: number;
    score: number;
  }>): { [key in HollandType]: number } {
    const experienceGains: { [key in HollandType]: number } = {
      [HollandType.R]: 0,
      [HollandType.I]: 0,
      [HollandType.A]: 0,
      [HollandType.S]: 0,
      [HollandType.E]: 0,
      [HollandType.C]: 0
    };

    matchedQuestions.forEach(({ question, similarity }) => {
      // 유사도에 비례하여 경험치 계산
      // 최대 100 XP, 최소 10 XP
      const baseXP = Math.max(10, Math.min(100, Math.round(similarity * 100)));
      const confidenceBonus = Math.round(baseXP * question.confidence);
      
      experienceGains[question.type] += confidenceBonus;
    });

    return experienceGains;
  }

  /**
   * 가장 높은 점수의 Holland 유형 반환
   */
  private getTopHollandType(hollandScores: { [key in HollandType]: number }): HollandType {
    return Object.entries(hollandScores).reduce((a, b) => 
      hollandScores[a[0] as HollandType] > hollandScores[b[0] as HollandType] ? a : b
    )[0] as HollandType;
  }

  /**
   * 데이터베이스 상태 확인
   */
  getDatabaseStatus(): { 
    isInitialized: boolean; 
    totalQuestions: number; 
    types: { [key in HollandType]: number };
    lastUpdated: string | null;
  } {
    if (!this.database) {
      return {
        isInitialized: false,
        totalQuestions: 0,
        types: { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 },
        lastUpdated: null
      };
    }

    const types: { [key in HollandType]: number } = {
      [HollandType.R]: 0,
      [HollandType.I]: 0,
      [HollandType.A]: 0,
      [HollandType.S]: 0,
      [HollandType.E]: 0,
      [HollandType.C]: 0
    };

    Object.entries(this.database.hollandDatabase).forEach(([type, questions]) => {
      types[type as HollandType] = questions.length;
    });

    return {
      isInitialized: this.initialized,
      totalQuestions: this.database.totalQuestions,
      types,
      lastUpdated: this.database.lastUpdated
    };
  }

  /**
   * 특정 유형의 문항들 조회
   */
  getQuestionsByType(type: HollandType): HollandQuestion[] {
    if (!this.database) return [];
    return this.database.hollandDatabase[type] || [];
  }

  /**
   * 데이터베이스 강제 재구축
   */
  async rebuildDatabase(): Promise<void> {
    try {
      console.log('🔄 Holland 데이터베이스 강제 재구축 시작...');
      
      this.database = await buildHollandDatabase();
      await this.saveToStorage(this.database);
      this.initialized = true;
      
      console.log('✅ Holland 데이터베이스 재구축 완료');
    } catch (error) {
      console.error('❌ Holland 데이터베이스 재구축 실패:', error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스 export
export default HollandDatabaseService.getInstance();
