import GeminiService from './geminiService';

export interface SkillTreeAnalysis {
  strengths: string[];
  weaknesses: string[];
  personality: string[];
  recommendations: string[];
  careerSuggestions: string[];
  skillInsights: string[];
  growthPath: string[];
}

export interface UserProfileData {
  credoData: {
    currentCredo: number;
    currentLevel: number;
    totalCredo: number;
    currentXP: number;
    totalXP: number;
  };
  financialData: {
    monthlyIncome?: number;
    monthlySpending?: number;
    savingsRate?: number;
    investmentAmount?: number;
    debtAmount?: number;
  };
  academicData: {
    gpa?: number;
    completedCourses?: number;
    studyHours?: number;
    certifications?: string[];
  };
  questData: {
    completedQuests: number;
    activeQuests: number;
    questCategories: string[];
    questSuccessRate: number;
  };
  chronicleData: {
    totalPosts: number;
    engagementRate: number;
    postCategories: string[];
  };
}

class SkillTreeAnalysisService {
  private static instance: SkillTreeAnalysisService;
  private geminiService: GeminiService;

  private constructor() {
    this.geminiService = GeminiService.getInstance();
  }

  public static getInstance(): SkillTreeAnalysisService {
    if (!SkillTreeAnalysisService.instance) {
      SkillTreeAnalysisService.instance = new SkillTreeAnalysisService();
    }
    return SkillTreeAnalysisService.instance;
  }

  /**
   * 사용자 프로필 데이터를 기반으로 개인화된 스킬트리 분석 생성
   */
  public async generatePersonalizedAnalysis(userProfile: UserProfileData): Promise<SkillTreeAnalysis> {
    try {
      const prompt = this.buildAnalysisPrompt(userProfile);
      const response = await this.geminiService.callGeminiAPI(prompt);
      
      if (response && response.success && response.data) {
        console.log('✅ Gemini AI 분석 성공');
        return this.parseAnalysisResponse(response.data);
      } else {
        console.log('⚠️ Gemini AI 실패, 기본 분석으로 대체:', response?.error);
        // Gemini AI 실패 시 기본 분석 제공
        return this.generateFallbackAnalysis(userProfile);
      }
    } catch (error) {
      console.error('스킬트리 분석 생성 실패:', error);
      return this.generateFallbackAnalysis(userProfile);
    }
  }

  /**
   * 사용자 데이터를 기반으로 분석 프롬프트 생성
   */
  private buildAnalysisPrompt(userProfile: UserProfileData): string {
    const { credoData, financialData, academicData, questData, chronicleData } = userProfile;
    
    return `당신은 대학생의 성장과 발전을 분석하는 전문 AI 상담사입니다. 
다음 사용자 데이터를 기반으로 개인화된 스킬트리 분석을 제공해주세요.

## 사용자 프로필 데이터

### 🎯 크레도 & 경험치 현황
- 현재 크레도: ${credoData.currentCredo}점
- 현재 레벨: ${credoData.currentLevel}레벨
- 총 획득 크레도: ${credoData.totalCredo}점
- 현재 XP: ${credoData.currentXP}점
- 총 XP: ${credoData.totalXP}점

### 💰 금융 관리 현황
- 월 수입: ${financialData.monthlyIncome ? financialData.monthlyIncome.toLocaleString() + '원' : '정보 없음'}
- 월 지출: ${financialData.monthlySpending ? financialData.monthlySpending.toLocaleString() + '원' : '정보 없음'}
- 저축률: ${financialData.savingsRate ? financialData.savingsRate + '%' : '정보 없음'}
- 투자 금액: ${financialData.investmentAmount ? financialData.investmentAmount.toLocaleString() + '원' : '정보 없음'}
- 부채 금액: ${financialData.debtAmount ? financialData.debtAmount.toLocaleString() + '원' : '정보 없음'}

### 📚 학업 성과
- GPA: ${academicData.gpa ? academicData.gpa + '/4.5' : '정보 없음'}
- 완료한 강의: ${academicData.completedCourses ? academicData.completedCourses + '개' : '정보 없음'}
- 학습 시간: ${academicData.studyHours ? academicData.studyHours + '시간/주' : '정보 없음'}
- 자격증: ${academicData.certifications ? academicData.certifications.join(', ') : '없음'}

### 🎮 퀘스트 성과
- 완료한 퀘스트: ${questData.completedQuests}개
- 진행중인 퀘스트: ${questData.activeQuests}개
- 퀘스트 카테고리: ${questData.questCategories.join(', ')}
- 퀘스트 성공률: ${questData.questSuccessRate}%

### 📝 크로니클 활동
- 총 게시글: ${chronicleData.totalPosts}개
- 참여율: ${chronicleData.engagementRate}%
- 게시글 카테고리: ${chronicleData.postCategories.join(', ')}

## 분석 요청사항

위 데이터를 종합적으로 분석하여 다음 항목들을 한국어로 제공해주세요:

### 1. 💪 강점 (3-4개)
사용자의 데이터에서 드러나는 뛰어난 능력과 성과를 구체적으로 분석

### 2. 🔧 개선점 (3-4개)
현재 부족한 부분과 발전 가능한 영역을 구체적으로 제시

### 3. 🎭 성향 (3-4개)
사용자의 행동 패턴과 성격적 특성을 분석

### 4. 🎯 맞춤형 추천사항 (3-4개)
사용자의 현재 상황에 최적화된 개선 방안 제시

### 5. 💼 직업 추천 (3-4개)
사용자의 강점과 성향을 고려한 적합한 직업군 제안

### 6. 🚀 스킬 인사이트 (3-4개)
현재 스킬트리에서 주목해야 할 핵심 영역 분석

### 7. 📈 성장 경로 (3-4개)
단계별로 발전할 수 있는 구체적인 로드맵 제시

## 응답 형식

각 항목은 구체적이고 실행 가능한 내용으로 작성하고, 사용자의 실제 데이터를 인용하여 근거를 제시해주세요.
모든 내용은 대학생의 관점에서 이해하기 쉽고 동기부여가 될 수 있도록 작성해주세요.`;
  }

  /**
   * Gemini AI 응답을 파싱하여 구조화된 데이터로 변환
   */
  private parseAnalysisResponse(response: string): SkillTreeAnalysis {
    try {
      // 응답을 섹션별로 분리
      const sections = response.split(/(?=### |## )/);
      
      const analysis: SkillTreeAnalysis = {
        strengths: [],
        weaknesses: [],
        personality: [],
        recommendations: [],
        careerSuggestions: [],
        skillInsights: [],
        growthPath: []
      };

      sections.forEach(section => {
        if (section.includes('💪 강점')) {
          analysis.strengths = this.extractListItems(section);
        } else if (section.includes('🔧 개선점')) {
          analysis.weaknesses = this.extractListItems(section);
        } else if (section.includes('🎭 성향')) {
          analysis.personality = this.extractListItems(section);
        } else if (section.includes('🎯 맞춤형 추천사항')) {
          analysis.recommendations = this.extractListItems(section);
        } else if (section.includes('💼 직업 추천')) {
          analysis.careerSuggestions = this.extractListItems(section);
        } else if (section.includes('🚀 스킬 인사이트')) {
          analysis.skillInsights = this.extractListItems(section);
        } else if (section.includes('📈 성장 경로')) {
          analysis.growthPath = this.extractListItems(section);
        }
      });

      return analysis;
    } catch (error) {
      console.error('AI 응답 파싱 실패:', error);
      return this.generateFallbackAnalysis({} as UserProfileData);
    }
  }

  /**
   * 텍스트에서 리스트 아이템 추출
   */
  private extractListItems(text: string): string[] {
    const items: string[] = [];
    
    // 다양한 리스트 형식 처리
    const patterns = [
      /^[-*•]\s*(.+)$/gm,           // - item
      /^\d+\.\s*(.+)$/gm,           // 1. item
      /^[가-힣]\.\s*(.+)$/gm,       // 가. item
      /^[a-zA-Z]\.\s*(.+)$/gm       // A. item
    ];

    patterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const item = match.replace(/^[-*•\d가-힣a-zA-Z]\.\s*/, '').trim();
          if (item && !items.includes(item)) {
            items.push(item);
          }
        });
      }
    });

    // 리스트가 없으면 문단을 기반으로 추출
    if (items.length === 0) {
      const sentences = text.split(/[.!?]\s+/).filter(s => s.trim().length > 10);
      items.push(...sentences.slice(0, 4));
    }

    return items.slice(0, 4); // 최대 4개까지만
  }

  /**
   * Gemini AI 실패 시 기본 분석 제공
   */
  private generateFallbackAnalysis(userProfile: UserProfileData): SkillTreeAnalysis {
    const { credoData, financialData, questData } = userProfile;
    
    // 기본 분석 로직
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const personality: string[] = [];
    const recommendations: string[] = [];
    const careerSuggestions: string[] = [];
    const skillInsights: string[] = [];
    const growthPath: string[] = [];

    // 크레도 기반 분석
    if (credoData.currentCredo > 1000) {
      strengths.push('높은 크레도 점수로 지속적인 성장 의지가 뛰어남');
    } else if (credoData.currentCredo < 500) {
      weaknesses.push('크레도 점수가 낮아 활동 참여를 늘릴 필요가 있음');
    }

    // 퀘스트 성과 기반 분석
    if (questData.completedQuests > 5) {
      strengths.push('퀘스트 완료율이 높아 목표 달성 능력이 우수함');
    } else {
      weaknesses.push('퀘스트 참여를 늘려 경험을 쌓을 필요가 있음');
    }

    // 금융 데이터 기반 분석
    if (financialData.monthlyIncome && financialData.monthlySpending) {
      const savingsRate = ((financialData.monthlyIncome - financialData.monthlySpending) / financialData.monthlyIncome) * 100;
      if (savingsRate > 20) {
        strengths.push('저축률이 높아 재무 관리 능력이 우수함');
      } else if (savingsRate < 0) {
        weaknesses.push('지출이 수입을 초과하여 재무 계획 수립이 필요함');
      }
    }

    // 기본 성향 및 추천사항
    personality.push('체계적인 계획 수립 능력');
    personality.push('지속적인 학습 의지');
    
    recommendations.push('일일 활동 기록을 통한 패턴 분석');
    recommendations.push('단계별 목표 설정 및 달성');
    
    careerSuggestions.push('프로젝트 매니저');
    careerSuggestions.push('데이터 분석가');
    
    skillInsights.push('크레도 기반 성장 시스템 활용');
    skillInsights.push('퀘스트를 통한 체계적 발전');
    
    growthPath.push('기본 스킬 습득 → 중급 스킬 개발 → 고급 스킬 마스터');

    return {
      strengths: strengths.length > 0 ? strengths : ['지속적인 성장 의지', '체계적인 접근 방식'],
      weaknesses: weaknesses.length > 0 ? weaknesses : ['경험 부족', '체계적 계획 수립 필요'],
      personality,
      recommendations,
      careerSuggestions,
      skillInsights,
      growthPath
    };
  }
}

export default SkillTreeAnalysisService.getInstance();
