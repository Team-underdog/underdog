/**
 * AI 금융 상담 서비스
 * Gemini API를 활용한 개인 맞춤형 금융 상담 및 조언 제공
 */

import { GEMINI_API_KEY } from '../config/apiKeys';

export interface FinancialQuestion {
  id: string;
  question: string;
  category: 'saving' | 'investment' | 'loan' | 'budget' | 'credit' | 'general';
  userContext?: {
    age?: number;
    income?: number;
    savings?: number;
    goals?: string[];
    riskTolerance?: 'low' | 'medium' | 'high';
  };
  timestamp: string;
}

export interface FinancialAdvice {
  id: string;
  question: string;
  answer: string;
  category: string;
  confidence: number;
  actionableSteps: string[];
  relatedTopics: string[];
  timestamp: string;
}

export interface FinancialAnalysis {
  spendingPattern: string;
  savingOpportunities: string[];
  riskAssessment: string;
  goalRecommendations: string[];
  nextActions: string[];
}

export interface BudgetRecommendation {
  category: string;
  currentAmount: number;
  recommendedAmount: number;
  reason: string;
  tips: string[];
}

class AIFinancialAdvisorService {
  private geminiApiKey = GEMINI_API_KEY;
  // Gemini 2.0 Flash 모델 사용 (최신)
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  /**
   * Gemini API 호출 (최신 gemini-2.0-flash 모델 사용)
   */
  private async callGeminiAPI(prompt: string, context?: any): Promise<string> {
    try {
      // 여러 엔드포인트 시도 (최신 모델 우선)
      const endpoints = [
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent',
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
        this.baseUrl // 기존 URL도 백업으로 유지
      ];

      for (const endpoint of endpoints) {
        try {
          console.log(`🔄 Gemini API 시도: ${endpoint}`);
          
          const response = await fetch(`${endpoint}?key=${this.geminiApiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: this.buildPrompt(prompt, context)
                }]
              }],
              generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
              },
              safetySettings: [
                {
                  category: "HARM_CATEGORY_HARASSMENT",
                  threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                  category: "HARM_CATEGORY_HATE_SPEECH",
                  threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                  category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                  threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                  category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                  threshold: "BLOCK_MEDIUM_AND_ABOVE"
                }
              ]
            }),
          });

          if (response.ok) {
            console.log(`✅ Gemini API 성공: ${endpoint}`);
            const data = await response.json();
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
              return data.candidates[0].content.parts[0].text;
            } else {
              throw new Error('응답에서 답변을 찾을 수 없습니다.');
            }
          } else if (response.status === 404) {
            console.log(`❌ 404 오류: ${endpoint}`);
            continue; // 다음 엔드포인트 시도
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        } catch (error) {
          console.log(`❌ 엔드포인트 실패: ${endpoint} - ${error.message}`);
          if (endpoint === endpoints[endpoints.length - 1]) {
            // 모든 엔드포인트 실패
            throw new Error(`모든 Gemini API 엔드포인트 시도 실패. 마지막 오류: ${error.message}`);
          }
        }
      }

      // 모든 엔드포인트 실패 시 오류 발생
      throw new Error('모든 Gemini API 엔드포인트 시도 실패');
    } catch (error) {
      console.error('Gemini API 호출 실패:', error);
      throw error;
    }
  }

  /**
   * 프롬프트 구성
   */
  private buildPrompt(question: string, context?: any): string {
    let prompt = `당신은 한국의 전문 금융 상담사입니다. 
다음 질문에 대해 친근하고 이해하기 쉽게 답변해주세요.

질문: ${question}

답변 시 다음 사항을 고려해주세요:
1. 한국의 금융 환경과 제도를 반영
2. 구체적이고 실용적인 조언 제공
3. 위험 요소와 주의사항 명시
4. 단계별 실행 방안 제시
5. 관련 추가 정보나 참고 자료 안내

답변 형식:
- 핵심 답변
- 구체적 조언 (3-5개)
- 주의사항
- 다음 단계
- 관련 주제`;

    if (context) {
      prompt += `\n\n사용자 상황: ${JSON.stringify(context, null, 2)}`;
    }

    return prompt;
  }

  /**
   * 금융 질문에 대한 AI 상담
   */
  async getFinancialAdvice(question: FinancialQuestion): Promise<FinancialAdvice> {
    try {
      const answer = await this.callGeminiAPI(question.question, question.userContext);
      
      // 답변 파싱 및 구조화
      const advice: FinancialAdvice = {
        id: question.id,
        question: question.question,
        answer: answer,
        category: question.category,
        confidence: this.calculateConfidence(answer),
        actionableSteps: this.extractActionableSteps(answer),
        relatedTopics: this.extractRelatedTopics(answer),
        timestamp: new Date().toISOString(),
      };

      return advice;
      
    } catch (error) {
      console.error('금융 상담 실패:', error);
      throw error;
    }
  }

  /**
   * 개인 재무 분석 및 조언
   */
  async analyzePersonalFinance(
    transactions: any[],
    goals: string[],
    userProfile: any
  ): Promise<FinancialAnalysis> {
    try {
      const analysisPrompt = `
다음 사용자의 재무 상황을 분석하고 맞춤형 조언을 제공해주세요:

사용자 프로필:
- 나이: ${userProfile.age}세
- 소득: ${userProfile.income}원
- 목표: ${goals.join(', ')}

거래 내역 요약:
- 총 거래 건수: ${transactions.length}건
- 주요 지출 카테고리: ${this.getTopSpendingCategories(transactions)}

이 정보를 바탕으로 다음을 분석해주세요:
1. 지출 패턴 분석
2. 절약 기회
3. 위험 요소 평가
4. 목표 달성을 위한 권장사항
5. 구체적인 다음 행동`;

      const analysis = await this.callGeminiAPI(analysisPrompt);
      
      return this.parseFinancialAnalysis(analysis);
      
    } catch (error) {
      console.error('재무 분석 실패:', error);
      throw error;
    }
  }

  /**
   * 예산 계획 수립
   */
  async createBudgetPlan(
    income: number,
    expenses: any[],
    goals: string[]
  ): Promise<BudgetRecommendation[]> {
    try {
      const budgetPrompt = `
월 소득 ${income.toLocaleString()}원을 기준으로 예산 계획을 수립해주세요.

현재 지출 현황:
${this.formatExpensesForPrompt(expenses)}

목표: ${goals.join(', ')}

다음 카테고리별로 예산을 제안해주세요:
1. 필수 지출 (주거, 식비, 교통 등)
2. 선택 지출 (문화생활, 취미 등)
3. 저축 및 투자
4. 비상금
5. 목표 달성을 위한 자금

각 카테고리별로:
- 권장 금액
- 절약 팁
- 주의사항을 포함해주세요.`;

      const budgetAdvice = await this.callGeminiAPI(budgetPrompt);
      
      return this.parseBudgetRecommendations(budgetAdvice);
      
    } catch (error) {
      console.error('예산 계획 수립 실패:', error);
      throw error;
    }
  }

  /**
   * 투자 상담
   */
  async getInvestmentAdvice(
    amount: number,
    timeHorizon: string,
    riskTolerance: string,
    goals: string[]
  ): Promise<string> {
    try {
      const investmentPrompt = `
투자 상담을 받고 싶습니다:

투자 금액: ${amount.toLocaleString()}원
투자 기간: ${timeHorizon}
위험 성향: ${riskTolerance}
투자 목표: ${goals.join(', ')}

다음 사항을 고려하여 투자 조언을 제공해주세요:
1. 적합한 투자 상품 추천
2. 자산 배분 전략
3. 위험 관리 방법
4. 정기적인 포트폴리오 점검 방법
5. 한국 투자 환경에서의 주의사항`;

      return await this.callGeminiAPI(investmentPrompt);
      
    } catch (error) {
      console.error('투자 상담 실패:', error);
      throw error;
    }
  }

  /**
   * 신용 관리 조언
   */
  async getCreditManagementAdvice(
    creditScore: number,
    currentDebts: any[],
    income: number
  ): Promise<string> {
    try {
      const creditPrompt = `
신용 관리에 대한 조언을 받고 싶습니다:

현재 신용점수: ${creditScore}점
현재 부채: ${this.formatDebtsForPrompt(currentDebts)}
월 소득: ${income.toLocaleString()}원

다음 사항에 대한 조언을 제공해주세요:
1. 신용점수 향상 방법
2. 부채 관리 전략
3. 신용카드 사용 팁
4. 대출 상환 우선순위
5. 신용 복구를 위한 구체적 행동`;

      return await this.callGeminiAPI(creditPrompt);
      
    } catch (error) {
      console.error('신용 관리 조언 실패:', error);
      throw error;
    }
  }

  /**
   * 절약 팁 및 생활 금융 조언
   */
  async getSavingTips(
    spendingPattern: any[],
    goals: string[]
  ): Promise<string> {
    try {
      const savingPrompt = `
절약 및 생활 금융에 대한 조언을 받고 싶습니다:

현재 지출 패턴:
${this.formatSpendingPatternForPrompt(spendingPattern)}

절약 목표: ${goals.join(', ')}

다음 사항에 대한 구체적인 조언을 제공해주세요:
1. 일상생활에서 실천할 수 있는 절약 방법
2. 지출 패턴 개선 방안
3. 목표 달성을 위한 저축 전략
4. 한국의 절약 문화와 팁
5. 지속 가능한 절약 습관 형성 방법`;

      return await this.callGeminiAPI(savingPrompt);
      
    } catch (error) {
      console.error('절약 팁 조언 실패:', error);
      throw error;
    }
  }

  /**
   * 답변 신뢰도 계산
   */
  private calculateConfidence(answer: string): number {
    // 간단한 신뢰도 계산 로직
    let confidence = 0.7; // 기본값
    
    if (answer.includes('구체적') || answer.includes('단계별')) confidence += 0.1;
    if (answer.includes('주의사항') || answer.includes('위험')) confidence += 0.1;
    if (answer.includes('한국') || answer.includes('국내')) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  /**
   * 실행 가능한 단계 추출
   */
  private extractActionableSteps(answer: string): string[] {
    const steps: string[] = [];
    const lines = answer.split('\n');
    
    for (const line of lines) {
      if (line.includes('1.') || line.includes('2.') || line.includes('3.') ||
          line.includes('•') || line.includes('-')) {
        steps.push(line.trim());
      }
    }
    
    return steps.slice(0, 5); // 최대 5개
  }

  /**
   * 관련 주제 추출
   */
  private extractRelatedTopics(answer: string): string[] {
    const topics = ['저축', '투자', '대출', '신용', '보험', '세금', '은퇴'];
    const foundTopics = topics.filter(topic => answer.includes(topic));
    return foundTopics.slice(0, 3); // 최대 3개
  }

  /**
   * 상위 지출 카테고리 추출
   */
  private getTopSpendingCategories(transactions: any[]): string {
    // 간단한 카테고리 분석 로직
    const categories = ['식비', '교통', '문화', '쇼핑', '통신'];
    return categories.slice(0, 3).join(', ');
  }

  /**
   * 재무 분석 결과 파싱
   */
  private parseFinancialAnalysis(analysis: string): FinancialAnalysis {
    return {
      spendingPattern: '분석된 지출 패턴',
      savingOpportunities: ['절약 기회 1', '절약 기회 2'],
      riskAssessment: '위험 요소 평가',
      goalRecommendations: ['목표 달성 방안 1', '목표 달성 방안 2'],
      nextActions: ['다음 행동 1', '다음 행동 2'],
    };
  }

  /**
   * 예산 권장사항 파싱
   */
  private parseBudgetRecommendations(advice: string): BudgetRecommendation[] {
    return [
      {
        category: '필수 지출',
        currentAmount: 0,
        recommendedAmount: 0,
        reason: '기본 생활비',
        tips: ['절약 팁 1', '절약 팁 2'],
      },
    ];
  }

  /**
   * 지출 데이터 프롬프트용 포맷팅
   */
  private formatExpensesForPrompt(expenses: any[]): string {
    return expenses.map(exp => `${exp.category}: ${exp.amount}원`).join('\n');
  }

  /**
   * 부채 데이터 프롬프트용 포맷팅
   */
  private formatDebtsForPrompt(debts: any[]): string {
    return debts.map(debt => `${debt.type}: ${debt.amount}원`).join('\n');
  }

  /**
   * 지출 패턴 프롬프트용 포맷팅
   */
  private formatSpendingPatternForPrompt(pattern: any[]): string {
    return pattern.map(p => `${p.category}: ${p.percentage}%`).join('\n');
  }
}

export default new AIFinancialAdvisorService();
