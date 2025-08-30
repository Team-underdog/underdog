/**
 * 크레도 점수와 홀랜드 점수를 기반으로 한 금융 혜택 계산 서비스
 */

import { HollandType } from './nlpService';

export interface FinancialBenefit {
  type: 'scholarship' | 'deposit' | 'savings' | 'loan';
  name: string;
  description: string;
  benefit: string;
  requirements: string;
  score: number;
}

export interface BenefitRecommendation {
  scholarships: FinancialBenefit[];
  deposits: FinancialBenefit[];
  savings: FinancialBenefit[];
  loans: FinancialBenefit[];
  totalScore: number;
  recommendations: string[];
}

export class BenefitService {
  private static instance: BenefitService;

  private constructor() {}

  public static getInstance(): BenefitService {
    if (!BenefitService.instance) {
      BenefitService.instance = new BenefitService();
    }
    return BenefitService.instance;
  }

  /**
   * 크레도 점수와 홀랜드 점수를 기반으로 혜택 추천
   */
  public calculateBenefits(
    credoScore: number,
    hollandScores: { [key in HollandType]: number }
  ): BenefitRecommendation {
    const totalScore = Object.values(hollandScores).reduce((sum, score) => sum + score, 0);
    const dominantType = this.getDominantHollandType(hollandScores);
    
    const scholarships = this.calculateScholarships(credoScore, dominantType);
    const deposits = this.calculateDeposits(credoScore, dominantType);
    const savings = this.calculateSavings(credoScore, dominantType);
    const loans = this.calculateLoans(credoScore, dominantType);

    const recommendations = this.generateRecommendations(credoScore, dominantType);

    return {
      scholarships,
      deposits,
      savings,
      loans,
      totalScore,
      recommendations
    };
  }

  /**
   * 장학금 혜택 계산
   */
  private calculateScholarships(credoScore: number, dominantType: HollandType): FinancialBenefit[] {
    const scholarships: FinancialBenefit[] = [];

    // 크레도 기반 장학금
    if (credoScore >= 1000) {
      scholarships.push({
        type: 'scholarship',
        name: '우수학생 장학금',
        description: '크레도 점수가 높은 학생을 위한 장학금',
        benefit: '학비 50% 지원',
        requirements: '크레도 1000점 이상',
        score: 95
      });
    }

    if (credoScore >= 500) {
      scholarships.push({
        type: 'scholarship',
        name: '성장 장학금',
        description: '지속적인 성장을 보여주는 학생을 위한 장학금',
        benefit: '학비 30% 지원',
        requirements: '크레도 500점 이상',
        score: 85
      });
    }

    // 홀랜드 유형별 장학금
    switch (dominantType) {
      case HollandType.I:
        scholarships.push({
          type: 'scholarship',
          name: '연구 장학금',
          description: '탐구형 성향을 가진 학생을 위한 연구 지원 장학금',
          benefit: '연구비 100만원 + 학비 20% 지원',
          requirements: '탐구형 성향 우수',
          score: 90
        });
        break;
      case HollandType.A:
        scholarships.push({
          type: 'scholarship',
          name: '창의성 장학금',
          description: '예술형 성향을 가진 학생을 위한 창작 활동 지원 장학금',
          benefit: '창작 활동비 80만원 + 학비 25% 지원',
          requirements: '예술형 성향 우수',
          score: 88
        });
        break;
      case HollandType.S:
        scholarships.push({
          type: 'scholarship',
          name: '봉사 장학금',
          description: '사회형 성향을 가진 학생을 위한 봉사 활동 지원 장학금',
          benefit: '봉사 활동비 60만원 + 학비 20% 지원',
          requirements: '사회형 성향 우수',
          score: 85
        });
        break;
    }

    return scholarships.sort((a, b) => b.score - a.score);
  }

  /**
   * 예금 혜택 계산
   */
  private calculateDeposits(credoScore: number, dominantType: HollandType): FinancialBenefit[] {
    const deposits: FinancialBenefit[] = [];

    // 크레도 기반 예금 혜택
    if (credoScore >= 800) {
      deposits.push({
        type: 'deposit',
        name: '프리미엄 예금',
        description: '크레도 점수가 높은 학생을 위한 특별 예금 상품',
        benefit: '연 3.5% 금리 (기본 금리 + 0.5%p)',
        requirements: '크레도 800점 이상',
        score: 90
      });
    }

    if (credoScore >= 400) {
      deposits.push({
        type: 'deposit',
        name: '스마트 예금',
        description: '학생을 위한 스마트 예금 상품',
        benefit: '연 3.0% 금리 (기본 금리 + 0.2%p)',
        requirements: '크레도 400점 이상',
        score: 80
      });
    }

    // 홀랜드 유형별 예금 혜택
    switch (dominantType) {
      case HollandType.E:
        deposits.push({
          type: 'deposit',
          name: '투자형 예금',
          description: '진취형 성향을 가진 학생을 위한 투자 연계 예금',
          benefit: '연 3.8% 금리 + 투자 수익 배당',
          requirements: '진취형 성향 우수',
          score: 92
        });
        break;
      case HollandType.C:
        deposits.push({
          type: 'deposit',
          name: '안정형 예금',
          description: '관습형 성향을 가진 학생을 위한 안정적인 예금',
          benefit: '연 3.2% 금리 + 자동 이체 혜택',
          requirements: '관습형 성향 우수',
          score: 85
        });
        break;
    }

    return deposits.sort((a, b) => b.score - a.score);
  }

  /**
   * 적금 혜택 계산
   */
  private calculateSavings(credoScore: number, dominantType: HollandType): FinancialBenefit[] {
    const savings: FinancialBenefit[] = [];

    // 크레도 기반 적금 혜택
    if (credoScore >= 600) {
      savings.push({
        type: 'savings',
        name: '성장 적금',
        description: '크레도 점수가 높은 학생을 위한 성장 지향 적금',
        benefit: '연 4.0% 금리 + 만기 보너스 5만원',
        requirements: '크레도 600점 이상',
        score: 88
      });
    }

    if (credoScore >= 300) {
      savings.push({
        type: 'savings',
        name: '학생 적금',
        description: '학생을 위한 기본 적금 상품',
        benefit: '연 3.5% 금리 + 중도 해지 시 이자 보장',
        requirements: '크레도 300점 이상',
        score: 75
      });
    }

    // 홀랜드 유형별 적금 혜택
    switch (dominantType) {
      case HollandType.R:
        savings.push({
          type: 'savings',
          name: '체계형 적금',
          description: '현실형 성향을 가진 학생을 위한 체계적인 적금',
          benefit: '연 3.8% 금리 + 자동 납입 혜택',
          requirements: '현실형 성향 우수',
          score: 85
        });
        break;
      case HollandType.S:
        savings.push({
          type: 'savings',
          name: '공동체 적금',
          description: '사회형 성향을 가진 학생을 위한 공동체 연계 적금',
          benefit: '연 4.2% 금리 + 봉사 활동 연계 혜택',
          requirements: '사회형 성향 우수',
          score: 90
        });
        break;
    }

    return savings.sort((a, b) => b.score - a.score);
  }

  /**
   * 대출 혜택 계산
   */
  private calculateLoans(credoScore: number, dominantType: HollandType): FinancialBenefit[] {
    const loans: FinancialBenefit[] = [];

    // 크레도 기반 대출 혜택
    if (credoScore >= 700) {
      loans.push({
        type: 'loan',
        name: '우수학생 대출',
        description: '크레도 점수가 높은 학생을 위한 특별 대출 상품',
        benefit: '연 2.5% 금리 (기본 금리 - 1.0%p)',
        requirements: '크레도 700점 이상',
        score: 92
      });
    }

    if (credoScore >= 400) {
      loans.push({
        type: 'loan',
        name: '학생 대출',
        description: '학생을 위한 기본 대출 상품',
        benefit: '연 3.0% 금리 (기본 금리 - 0.5%p)',
        requirements: '크레도 400점 이상',
        score: 80
      });
    }

    // 홀랜드 유형별 대출 혜택
    switch (dominantType) {
      case HollandType.I:
        loans.push({
          type: 'loan',
          name: '연구 대출',
          description: '탐구형 성향을 가진 학생을 위한 연구 활동 지원 대출',
          benefit: '연 2.8% 금리 + 연구비 연계 지원',
          requirements: '탐구형 성향 우수',
          score: 88
        });
        break;
      case HollandType.A:
        loans.push({
          type: 'loan',
          name: '창작 대출',
          description: '예술형 성향을 가진 학생을 위한 창작 활동 지원 대출',
          benefit: '연 3.2% 금리 + 창작 활동비 지원',
          requirements: '예술형 성향 우수',
          score: 85
        });
        break;
    }

    return loans.sort((a, b) => b.score - a.score);
  }

  /**
   * 지배적인 홀랜드 유형 찾기
   */
  private getDominantHollandType(hollandScores: { [key in HollandType]: number }): HollandType {
    let dominantType = HollandType.R;
    let maxScore = 0;

    Object.entries(hollandScores).forEach(([type, score]) => {
      if (score > maxScore) {
        maxScore = score;
        dominantType = type as HollandType;
      }
    });

    return dominantType;
  }

  /**
   * 개인화된 추천사항 생성
   */
  private generateRecommendations(credoScore: number, dominantType: HollandType): string[] {
    const recommendations: string[] = [];

    // 크레도 점수 기반 추천
    if (credoScore >= 1000) {
      recommendations.push('🎯 크레도 점수가 매우 높습니다! 최고 등급 혜택을 모두 이용할 수 있어요.');
    } else if (credoScore >= 600) {
      recommendations.push('📈 크레도 점수가 높습니다! 프리미엄 혜택을 이용해보세요.');
    } else if (credoScore >= 300) {
      recommendations.push('💪 크레도 점수가 양호합니다! 기본 혜택을 꾸준히 활용해보세요.');
    } else {
      recommendations.push('🌱 크레도 점수를 더 높여보세요! 더 많은 혜택을 받을 수 있어요.');
    }

    // 홀랜드 유형 기반 추천
    switch (dominantType) {
      case HollandType.R:
        recommendations.push('🔧 현실형 성향을 활용한 체계적인 금융 계획을 세워보세요.');
        break;
      case HollandType.I:
        recommendations.push('🔬 탐구형 성향을 활용한 다양한 금융 상품을 분석해보세요.');
        break;
      case HollandType.A:
        recommendations.push('🎨 예술형 성향을 활용한 창의적인 금융 접근을 시도해보세요.');
        break;
      case HollandType.S:
        recommendations.push('🤝 사회형 성향을 활용한 공동체 연계 금융 상품을 고려해보세요.');
        break;
      case HollandType.E:
        recommendations.push('🚀 진취형 성향을 활용한 도전적인 금융 상품에 도전해보세요.');
        break;
      case HollandType.C:
        recommendations.push('📊 관습형 성향을 활용한 안정적인 금융 계획을 세워보세요.');
        break;
    }

    return recommendations;
  }
}
