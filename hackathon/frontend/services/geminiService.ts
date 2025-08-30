import { API_KEYS } from '../config/apiKeys';

export interface GeminiResponse {
  success: boolean;
  data?: string;
  text?: string; // 기존 코드와의 호환성을 위해 추가
  error?: string;
}

export interface QuestRecommendation {
  title: string;
  description: string;
  difficulty: 'easy' | 'normal' | 'hard';
  category: 'academic' | 'financial' | 'personal' | 'social';
  estimatedDuration: string;
  aiReason: string;
  rewards: {
    credo: number;
    xp: number;
  };
}

export interface FinancialAdvice {
  analysis: string;
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
  priority: 'high' | 'medium' | 'low';
}

export interface LearningGuide {
  currentStatus: string;
  recommendations: string[];
  studyPlan: string;
  estimatedImprovement: string;
}

class GeminiService {
  private static instance: GeminiService;
  private apiKey: string;
  private baseUrl: string;

  private constructor() {
    this.apiKey = API_KEYS.GEMINI.API_KEY;
    // 백엔드 프록시 URL 사용 (우선순위)
    this.baseUrl = API_KEYS.GEMINI.BACKEND_PROXY_URL;
  }

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  /**
   * Gemini API 키가 설정되어 있는지 확인
   */
  public isConfigured(): boolean {
    return this.apiKey && this.apiKey.length > 0;
  }

  /**
   * 네트워크 연결 상태 확인
   */
  private async checkNetworkConnection(): Promise<boolean> {
    try {
      // 여러 엔드포인트로 네트워크 연결 테스트
      const testUrls = [
        'https://www.google.com',
        'https://generativelanguage.googleapis.com',
        'https://httpbin.org/status/200'
      ];
      
      for (const url of testUrls) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5초 타임아웃
          
          const response = await fetch(url, { 
            method: 'HEAD',
            mode: 'no-cors',
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          console.log(`✅ 네트워크 연결 확인 성공: ${url}`);
          return true;
        } catch (urlError) {
          console.log(`⚠️ ${url} 연결 실패:`, urlError.message);
          continue; // 다음 URL 시도
        }
      }
      
      console.error('❌ 모든 테스트 URL 연결 실패');
      return false;
    } catch (error) {
      console.error('🌐 네트워크 연결 확인 실패:', error);
      return false;
    }
  }

  /**
   * Gemini API 연결 테스트
   */
  public async testConnection(): Promise<boolean> {
    if (!this.isConfigured()) {
      console.log('❌ Gemini API 키가 설정되지 않음');
      return false;
    }

    try {
      console.log('🌐 Gemini API 연결 테스트 시작...');
      
      // callGeminiAPI를 사용하여 실제 API 호출 테스트
      const testResponse = await this.callGeminiAPI('Hello, this is a test message.');
      
      if (testResponse.success) {
        console.log('✅ Gemini API 연결 테스트 성공:', testResponse.data);
        return true;
      } else {
        console.log('❌ Gemini API 연결 테스트 실패:', testResponse.error);
        return false;
      }
      
    } catch (error) {
      console.error('❌ Gemini API 연결 테스트 실패:', error);
      return false;
    }
  }

  /**
   * Gemini API 호출 (백엔드 프록시 우선, 로컬 폴백)
   */
  public async callGeminiAPI(prompt: string, model: string = 'gemini-1.5-flash-latest'): Promise<GeminiResponse> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Gemini API 키가 설정되지 않았습니다. config/apiKeys.ts에서 API 키를 설정해주세요.'
      };
    }

    // 1단계: 백엔드 프록시 시도 (우선순위 1)
    try {
      console.log('🔄 백엔드 프록시를 통한 Gemini API 호출 시도...');
      const backendUrl = API_KEYS.GEMINI.BACKEND_PROXY_URL;
      
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          model: model,
          apiKey: this.apiKey // 백엔드에서 API 키 사용
        })
      });

      if (response.ok) {
        console.log('✅ 백엔드 프록시 성공!');
        const data = await response.json();
        
        if (data.success && data.response) {
          return {
            success: true,
            data: data.response,
            text: data.response
          };
        } else {
          throw new Error(data.error || '백엔드 응답 형식 오류');
        }
      } else {
        const errorText = await response.text();
        throw new Error(`백엔드 API 오류 [${response.status}]: ${errorText}`);
      }
      
    } catch (backendError) {
      console.log('⚠️ 백엔드 프록시 실패, 로컬 폴백 모드로 전환:', backendError.message);
      
      // 2단계: 로컬 직접 호출 시도 (CORS 우회) - 개발/테스트용
      try {
        console.log('🚀 로컬 Gemini API 직접 호출 시도 (CORS 우회)...');
        return await this.callGeminiAPILocal(prompt);
      } catch (localError) {
        console.log('❌ 로컬 호출도 실패:', localError.message);
        
        // 3단계: 최종 폴백 - 상황별 맞춤 응답 생성
        return this.generateFallbackResponse(prompt);
      }
    }
  }

  /**
   * 최종 폴백 - 상황별 맞춤 응답 생성
   */
  private generateFallbackResponse(prompt: string): GeminiResponse {
    console.log('🔄 최종 폴백 모드 - 상황별 맞춤 응답 생성');
    
    // 프롬프트 내용에 따른 맞춤 응답
    let fallbackResponse = '';
    
    if (prompt.includes('퀘스트') || prompt.includes('quest')) {
      fallbackResponse = `현재 AI 서비스에 일시적인 문제가 있어 기본 퀘스트를 제공합니다:

🎯 기본 퀘스트:
1. **학습 계획 수립하기** - 이번 주 학습 목표를 세우고 계획표 작성하기
2. **금융 기록 정리하기** - 지출 내역을 정리하고 예산 계획 세우기  
3. **새로운 스킬 배우기** - 관심 있는 온라인 강의나 튜토리얼 찾아보기

AI 서비스가 복구되면 더 개인화된 추천을 받을 수 있습니다.`;
    } else if (prompt.includes('금융') || prompt.includes('financial')) {
      fallbackResponse = `금융 AI 코칭 서비스에 일시적인 문제가 있습니다. 기본 금융 조언을 제공합니다:

💰 기본 금융 조언:
• 수입의 50-30-20 법칙: 50% 필수지출, 30% 선택지출, 20% 저축
• 비상금은 3-6개월 생활비만큼 준비
• 신용카드 사용 시 매월 전액 결제
• 복리 효과를 활용한 장기 저축 계획

AI 서비스 복구 후 더 상세한 개인 맞춤 조언을 받을 수 있습니다.`;
    } else if (prompt.includes('학습') || prompt.includes('study')) {
      fallbackResponse = `학습 AI 가이드 서비스에 일시적인 문제가 있습니다. 기본 학습 조언을 제공합니다:

📚 기본 학습 조언:
• 25분 집중 + 5분 휴식의 뽀모도로 기법 활용
• 학습한 내용을 다른 사람에게 설명해보기
• 정기적인 복습과 테스트로 기억력 강화
• 학습 환경을 깔끔하게 정리하고 방해 요소 제거

AI 서비스 복구 후 더 구체적인 학습 계획을 받을 수 있습니다.`;
    } else {
      fallbackResponse = `현재 AI 서비스에 일시적인 문제가 있습니다. 

🔧 문제 해결 방법:
1. 인터넷 연결 상태 확인
2. 페이지 새로고침 후 재시도
3. 잠시 후 다시 시도

AI 서비스가 복구되면 정상적인 서비스를 이용할 수 있습니다.`;
    }
    
    return {
      success: true,
      data: fallbackResponse,
      text: fallbackResponse
    };
  }

  /**
   * 로컬 폴백 Gemini API 호출 (수정된 버전)
   */
  private async callGeminiAPILocal(prompt: string): Promise<GeminiResponse> {
    try {
      console.log('🔄 로컬 폴백 모드 - Gemini API 직접 호출 시도...');
      console.log('🔑 사용 중인 API 키:', this.apiKey.substring(0, 10) + '...');
      
      // 네트워크 연결 상태 먼저 확인
      const isNetworkAvailable = await this.checkNetworkConnection();
      if (!isNetworkAvailable) {
        throw new Error('네트워크 연결을 확인할 수 없습니다. 인터넷 연결을 확인해주세요.');
      }
      
      // API 키 유효성 검증
      if (!this.apiKey || this.apiKey.length < 10) {
        throw new Error('API 키가 유효하지 않습니다. config/apiKeys.ts에서 올바른 API 키를 설정해주세요.');
      }
      
      // ✅ 현재 권장되는 Flash 모델의 공식 엔드포인트
      const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
      
      console.log(`🚀 로컬 엔드포인트 시도: ${endpoint}`);
      
      const requestBody = {
        contents: [{
          parts: [{
            text: prompt
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
      };
      
      console.log('📤 요청 본문:', JSON.stringify(requestBody, null, 2));
      
      const urlWithKey = `${endpoint}?key=${this.apiKey}`;
      
      // AbortController를 사용한 타임아웃 설정
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30초 타임아웃
      
      try {
        const response = await fetch(urlWithKey, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId); // 타임아웃 클리어

      console.log(`📡 응답 상태:`, response.status);
      
      // ✅ 더 상세한 오류 로깅 추가
      if (!response.ok) {
        const errorText = await response.text(); // 오류 내용을 텍스트로 먼저 확인
        console.error(`❌ API 요청 실패 [${response.status}]: ${errorText}`);
        
        // JSON 파싱 시도가 가능한 경우에만 파싱
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.error?.message || `HTTP error! status: ${response.status}`);
        } catch (e) {
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
      }
      
        const data = await response.json();
        console.log('✅ 로컬 Gemini API 호출 성공:', data);
        
        if (data.candidates && data.candidates.length > 0) {
          const text = data.candidates[0].content.parts[0].text;
          console.log('📝 파싱된 응답 텍스트:', text);
          return {
            success: true,
            data: text,
            text: text
          };
        } else {
          // ✅ 응답은 성공했지만 내용이 없는 경우 (안전 설정 등로 차단)
          console.warn('⚠️ API 응답 성공, 하지만 candidates 배열이 비어있습니다.', data);
          throw new Error('API에서 유효한 응답을 받지 못했습니다 (내용 없음).');
        }
      } catch (fetchError) {
        clearTimeout(timeoutId); // 타임아웃 클리어
        
        if (fetchError.name === 'AbortError') {
          console.error('⏰ 요청 타임아웃 (30초 초과)');
          throw new Error('요청이 타임아웃되었습니다. 네트워크 상태를 확인하고 다시 시도해주세요.');
        }
        
        // 기존 오류 처리 로직
        if (fetchError.message.includes('Network request failed')) {
          console.error('🌐 네트워크 요청 실패 - 상세 정보:', fetchError);
          throw new Error('네트워크 연결에 실패했습니다. 인터넷 연결을 확인해주세요.');
        }
        
        throw fetchError; // 다른 오류는 그대로 전파
      }

    } catch (error) {
      console.error('❗️ 최종 호출 실패:', error);
      
      // 오류 타입별 상세 로깅
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        console.error('🌐 네트워크 연결 실패 - 인터넷 연결을 확인해주세요');
        console.error('🔍 가능한 원인:');
        console.error('  - 인터넷 연결 상태 확인');
        console.error('  - 방화벽 또는 보안 소프트웨어 설정');
        console.error('  - VPN 사용 시 설정 확인');
      } else if (error.message.includes('API key')) {
        console.error('🔑 API 키 오류 - API 키 설정을 확인해주세요');
      } else if (error.message.includes('CORS')) {
        console.error('🚫 CORS 정책 오류 - 브라우저 설정을 확인해주세요');
      } else {
        console.error('❓ 기타 오류:', error.message);
      }
      
      return this.generateFallbackResponse(prompt); // 최종 실패 시 폴백
    }
  }

  /**
   * 개인화된 퀘스트 추천 생성
   */
  public async generatePersonalizedQuests(
    userProfile: any,
    financialData: any,
    academicData: any
  ): Promise<QuestRecommendation[]> {
    const prompt = `
당신은 대학생을 위한 개인화된 퀘스트를 추천하는 AI 어시스턴트입니다.

사용자 정보:
- 이름: ${userProfile.display_name || '사용자'}
- 현재 레벨: ${userProfile.currentLevel || 1}
- 크레도 점수: ${userProfile.currentCredo || 0}

금융 상황:
- 총 자산: ${financialData.total_assets?.toLocaleString() || 0}원
- 월 수입: ${financialData.monthly_income?.toLocaleString() || 0}원
- 월 지출: ${financialData.monthly_spending?.toLocaleString() || 0}원
- 신용등급: ${financialData.credit_score?.grade || 'N/A'}

학업 상황:
- 대학교: ${academicData.university || 'N/A'}
- 학과: ${academicData.department || 'N/A'}
- 학년: ${academicData.grade || 'N/A'}

위 정보를 바탕으로 사용자에게 적합한 3개의 퀘스트를 추천해주세요.
각 퀘스트는 다음 형식으로 응답해주세요:

1. 제목: [퀘스트 제목]
설명: [상세 설명]
난이도: [easy/normal/hard]
카테고리: [academic/financial/personal/social]
예상 소요시간: [예: 1주일, 1개월]
AI 추천 이유: [왜 이 퀘스트를 추천하는지]
보상: [credo: 숫자, xp: 숫자]

2. 제목: [퀘스트 제목]
...

3. 제목: [퀘스트 제목]
...

퀘스트는 사용자의 현재 상황을 고려하여 실현 가능하고 동기부여가 될 수 있도록 설계해주세요.
`;

    const result = await this.callGeminiAPI(prompt);
    
    if (!result.success || !result.data) {
      return [];
    }

    // AI 응답을 파싱하여 QuestRecommendation 배열로 변환
    return this.parseQuestRecommendations(result.data);
  }

  /**
   * AI 응답을 퀘스트 추천 배열로 파싱
   */
  private parseQuestRecommendations(aiResponse: string): QuestRecommendation[] {
    const quests: QuestRecommendation[] = [];
    
    try {
      // AI 응답을 줄 단위로 분리
      const lines = aiResponse.split('\n').filter(line => line.trim());
      
      let currentQuest: Partial<QuestRecommendation> = {};
      
      for (const line of lines) {
        if (line.includes('제목:')) {
          if (Object.keys(currentQuest).length > 0) {
            quests.push(currentQuest as QuestRecommendation);
          }
          currentQuest = {
            title: line.split('제목:')[1]?.trim() || ''
          };
        } else if (line.includes('설명:')) {
          currentQuest.description = line.split('설명:')[1]?.trim() || '';
        } else if (line.includes('난이도:')) {
          const difficulty = line.split('난이도:')[1]?.trim() || 'normal';
          currentQuest.difficulty = difficulty as 'easy' | 'normal' | 'hard';
        } else if (line.includes('카테고리:')) {
          const category = line.split('카테고리:')[1]?.trim() || 'personal';
          currentQuest.category = category as 'academic' | 'financial' | 'personal' | 'social';
        } else if (line.includes('예상 소요시간:')) {
          currentQuest.estimatedDuration = line.split('예상 소요시간:')[1]?.trim() || '';
        } else if (line.includes('AI 추천 이유:')) {
          currentQuest.aiReason = line.split('AI 추천 이유:')[1]?.trim() || '';
        } else if (line.includes('보상:')) {
          const rewardText = line.split('보상:')[1]?.trim() || '';
          currentQuest.rewards = this.parseRewards(rewardText);
        }
      }
      
      // 마지막 퀘스트 추가
      if (Object.keys(currentQuest).length > 0) {
        quests.push(currentQuest as QuestRecommendation);
      }
      
    } catch (error) {
      console.error('퀘스트 추천 파싱 오류:', error);
    }
    
    return quests;
  }

  /**
   * 보상 정보 파싱
   */
  private parseRewards(rewardText: string): { credo: number; xp: number } {
    const credoMatch = rewardText.match(/credo:\s*(\d+)/i);
    const xpMatch = rewardText.match(/xp:\s*(\d+)/i);
    
    return {
      credo: credoMatch ? parseInt(credoMatch[1]) : 50,
      xp: xpMatch ? parseInt(xpMatch[1]) : 100
    };
  }

  /**
   * 금융 조언 생성
   */
  public async generateFinancialAdvice(
    financialData: any,
    userGoals: string[]
  ): Promise<FinancialAdvice> {
    const prompt = `
당신은 대학생을 위한 금융 상담사입니다.

사용자의 금융 상황:
- 총 자산: ${financialData.total_assets?.toLocaleString() || 0}원
- 총 잔액: ${financialData.total_balance?.toLocaleString() || 0}원
- 총 부채: ${financialData.total_liabilities?.toLocaleString() || 0}원
- 신용등급: ${financialData.credit_score?.grade || 'N/A'}
- 신용점수: ${financialData.credit_score?.score || 0}

사용자의 목표: ${userGoals.join(', ')}

위 정보를 바탕으로 다음 형식으로 금융 조언을 제공해주세요:

분석: [현재 금융 상황에 대한 분석]
권장사항: [구체적인 개선 방안들]
위험도: [low/medium/high]
우선순위: [high/medium/low]

대학생의 입장에서 실현 가능하고 실용적인 조언을 제공해주세요.
`;

    const result = await this.callGeminiAPI(prompt);
    
    if (!result.success || !result.data) {
      return {
        analysis: 'AI 분석을 불러올 수 없습니다.',
        recommendations: ['API 키를 확인해주세요.'],
        riskLevel: 'medium',
        priority: 'medium'
      };
    }

    return this.parseFinancialAdvice(result.data);
  }

  /**
   * 금융 조언 파싱
   */
  private parseFinancialAdvice(aiResponse: string): FinancialAdvice {
    try {
      const analysisMatch = aiResponse.match(/분석:\s*(.+?)(?=\n|권장사항:|$)/s);
      const recommendationsMatch = aiResponse.match(/권장사항:\s*(.+?)(?=\n|위험도:|$)/s);
      const riskMatch = aiResponse.match(/위험도:\s*(low|medium|high)/i);
      const priorityMatch = aiResponse.match(/우선순위:\s*(high|medium|low)/i);

      const recommendations = recommendationsMatch 
        ? recommendationsMatch[1].split('\n').filter(r => r.trim()).map(r => r.replace(/^[-•*]\s*/, '').trim())
        : ['구체적인 권장사항을 확인할 수 없습니다.'];

      return {
        analysis: analysisMatch ? analysisMatch[1].trim() : '분석을 확인할 수 없습니다.',
        recommendations,
        riskLevel: (riskMatch ? riskMatch[1].toLowerCase() : 'medium') as 'low' | 'medium' | 'high',
        priority: (priorityMatch ? priorityMatch[1].toLowerCase() : 'medium') as 'high' | 'medium' | 'low'
      };
    } catch (error) {
      console.error('금융 조언 파싱 오류:', error);
      return {
        analysis: 'AI 응답을 파싱할 수 없습니다.',
        recommendations: ['응답 형식을 확인해주세요.'],
        riskLevel: 'medium',
        priority: 'medium'
      };
    }
  }

  /**
   * 학습 가이드 생성
   */
  public async generateLearningGuide(
    academicData: any,
    currentSkills: any,
    targetSkills: string[]
  ): Promise<LearningGuide> {
    const prompt = `
당신은 대학생을 위한 학습 상담사입니다.

사용자의 학업 상황:
- 대학교: ${academicData.university || 'N/A'}
- 학과: ${academicData.department || 'N/A'}
- 학년: ${academicData.grade || 'N/A'}

현재 보유 스킬: ${JSON.stringify(currentSkills)}
목표 스킬: ${targetSkills.join(', ')}

위 정보를 바탕으로 다음 형식으로 학습 가이드를 제공해주세요:

현재 상황: [현재 학업/스킬 수준 분석]
권장사항: [구체적인 학습 방향들]
학습 계획: [단계별 학습 계획]
예상 개선도: [목표 달성 시 예상 개선 정도]

대학생의 입장에서 실현 가능하고 효율적인 학습 방법을 제시해주세요.
`;

    const result = await this.callGeminiAPI(prompt);
    
    if (!result.success || !result.data) {
      return {
        currentStatus: 'AI 분석을 불러올 수 없습니다.',
        recommendations: ['API 키를 확인해주세요.'],
        studyPlan: 'API 키를 확인해주세요.',
        estimatedImprovement: 'API 키를 확인해주세요.'
      };
    }

    return this.parseLearningGuide(result.data);
  }

  /**
   * 학습 가이드 파싱
   */
  private parseLearningGuide(aiResponse: string): LearningGuide {
    try {
      const currentStatusMatch = aiResponse.match(/현재 상황:\s*(.+?)(?=\n|권장사항:|$)/s);
      const recommendationsMatch = aiResponse.match(/권장사항:\s*(.+?)(?=\n|학습 계획:|$)/s);
      const studyPlanMatch = aiResponse.match(/학습 계획:\s*(.+?)(?=\n|예상 개선도:|$)/s);
      const improvementMatch = aiResponse.match(/예상 개선도:\s*(.+?)(?=\n|$)/s);

      const recommendations = recommendationsMatch 
        ? recommendationsMatch[1].split('\n').filter(r => r.trim()).map(r => r.replace(/^[-•*]\s*/, '').trim())
        : ['구체적인 권장사항을 확인할 수 없습니다.'];

      return {
        currentStatus: currentStatusMatch ? currentStatusMatch[1].trim() : '현재 상황을 확인할 수 없습니다.',
        recommendations,
        studyPlan: studyPlanMatch ? studyPlanMatch[1].trim() : '학습 계획을 확인할 수 없습니다.',
        estimatedImprovement: improvementMatch ? improvementMatch[1].trim() : '예상 개선도를 확인할 수 없습니다.'
      };
    } catch (error) {
      console.error('학습 가이드 파싱 오류:', error);
      return {
        currentStatus: 'AI 응답을 파싱할 수 없습니다.',
        recommendations: ['응답 형식을 확인해주세요.'],
        studyPlan: '응답 형식을 확인해주세요.',
        estimatedImprovement: '응답 형식을 확인해주세요.'
      };
    }
  }

  /**
   * 일반적인 AI 상담
   */
  public async getGeneralAdvice(
    category: string,
    userQuestion: string,
    context: any = {}
  ): Promise<string> {
    const prompt = `
당신은 대학생을 위한 ${category} 전문 상담사입니다.

사용자 질문: ${userQuestion}

사용자 컨텍스트: ${JSON.stringify(context, null, 2)}

위 정보를 바탕으로 대학생에게 실용적이고 도움이 되는 조언을 제공해주세요.
답변은 한국어로 작성하고, 구체적이고 실행 가능한 내용으로 구성해주세요.
`;

    const result = await this.callGeminiAPI(prompt);
    
    if (!result.success || !result.data) {
      return 'AI 상담을 불러올 수 없습니다. API 키를 확인해주세요.';
    }

    return result.data;
  }
}

export default GeminiService;
