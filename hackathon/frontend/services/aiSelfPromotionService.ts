/**
 * AI 자기 어필 서비스
 * 사용자의 크로니클 활동과 홀랜드 성향을 바탕으로 AI가 자기 어필을 생성
 */

import { API_ENDPOINTS } from '../config/api';

export interface SelfPromotionData {
  userId: string;
  hollandType: string;
  hollandScore: number;
  chroniclePosts: ChroniclePost[];
  characterLevel: number;
  credoScore: number;
}

export interface ChroniclePost {
  id: string;
  title: string;
  description: string;
  type: string;
  timestamp: string;
  imageUrl?: string;
  rewards?: number;
}

export interface SelfPromotionResult {
  introduction: string;
  strengths: string[];
  achievements: string[];
  personality: string;
  recommendations: string[];
  totalScore: number;
}

class AISelfPromotionService {
  private async getAuthHeaders() {
    // 실제 구현에서는 인증 토큰을 가져와야 함
    return {
      'Content-Type': 'application/json',
    };
  }

  /**
   * 사용자의 자기 어필 데이터를 생성
   */
  async generateSelfPromotion(userId: string): Promise<SelfPromotionResult> {
    try {
      console.log('🎯 AI 자기 어필 생성 시작:', userId);

      const response = await fetch(`${API_ENDPOINTS.AI_ADVISOR.SELF_PROMOTION}`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ AI 자기 어필 생성 완료:', result);
      
      // 백엔드 응답 구조에 따라 데이터 추출
      if (result.success && result.self_promotion) {
        return result.self_promotion;
      } else if (result.success && result.data) {
        return result.data;
      } else {
        console.warn('⚠️ 백엔드 응답 구조가 예상과 다름:', result);
        return this.getDefaultSelfPromotion();
      }
    } catch (error) {
      console.error('❌ AI 자기 어필 생성 실패:', error);
      
      // 에러 시 기본값 반환
      return this.getDefaultSelfPromotion();
    }
  }

  /**
   * 사용자의 크로니클 활동을 가져옴
   */
  async getUserChroniclePosts(userId: string): Promise<ChroniclePost[]> {
    try {
      const response = await fetch(`${API_ENDPOINTS.CHRONICLE.USER_POSTS}?user_id=${userId}&limit=20`, {
        method: 'GET',
        headers: await this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.posts || [];
    } catch (error) {
      console.error('❌ 크로니클 포스트 가져오기 실패:', error);
      return [];
    }
  }

  /**
   * 사용자의 홀랜드 성향 정보를 가져옴
   */
  async getUserHollandProfile(userId: string): Promise<{ type: string; score: number }> {
    try {
      const response = await fetch(`${API_ENDPOINTS.AI_ADVISOR.HOLLAND_PROFILE}`, {
        method: 'GET',
        headers: await this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        type: data.holland_type || 'R',
        score: data.holland_score || 0,
      };
    } catch (error) {
      console.error('❌ 홀랜드 성향 정보 가져오기 실패:', error);
      return { type: 'R', score: 0 };
    }
  }

  /**
   * 기본 자기 어필 데이터 반환 (에러 시 사용)
   */
  private getDefaultSelfPromotion(): SelfPromotionResult {
    return {
      introduction: "안녕하세요! 저는 성장하는 대학생입니다. 다양한 활동을 통해 꾸준히 발전하고 있으며, 새로운 도전을 두려워하지 않습니다.",
      strengths: [
        "꾸준한 학습과 성장 의지",
        "다양한 활동에 대한 적극적인 참여",
        "팀워크와 협력 능력",
        "문제 해결을 위한 창의적 사고"
      ],
      achievements: [
        "크로니클을 통한 지속적인 활동 기록",
        "크레도 시스템을 통한 단계별 성장",
        "다양한 분야의 경험 축적"
      ],
      personality: "적극적이고 호기심이 많으며, 새로운 것을 배우는 것을 즐기는 성격입니다. 도전적인 과제를 통해 자신의 한계를 넓혀가고 있습니다.",
      recommendations: [
        "현재 강점을 더욱 발전시켜 전문성을 높이세요",
        "새로운 분야에 도전하여 경험의 폭을 넓히세요",
        "네트워킹을 통해 다양한 관점을 배우세요"
      ],
      totalScore: 85,
    };
  }

  /**
   * 자기 어필 점수 계산
   */
  calculatePromotionScore(
    chronicleCount: number,
    credoScore: number,
    hollandScore: number,
    characterLevel: number
  ): number {
    let score = 0;
    
    // 크로니클 활동 점수 (최대 30점)
    score += Math.min(chronicleCount * 2, 30);
    
    // 크레도 점수 (최대 25점)
    score += Math.min(credoScore / 4, 25);
    
    // 홀랜드 성향 점수 (최대 25점)
    score += Math.min(hollandScore / 4, 25);
    
    // 캐릭터 레벨 점수 (최대 20점)
    score += Math.min(characterLevel * 2, 20);
    
    return Math.round(score);
  }
}

export default new AISelfPromotionService();
