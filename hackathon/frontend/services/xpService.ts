/**
 * 크레도 기반 성장 시스템 서비스
 * XP는 보조 지표로, 크레도가 주요 성장 지표입니다.
 */

import { API_ENDPOINTS } from '../config/api';

export interface CredoData {
  currentCredo: number;
  currentLevel: number;
  nextLevelCredoRequired: number;
  totalCredo: number;
  currentXP: number;
  totalXP: number;
  progress: number;
}

export interface XPData {
  currentXP: number;
  currentLevel: number;
  nextLevelXP: number;
  totalXP: number;
}

export interface LevelRequirement {
  level: number;
  credoRequired: number;
  rewards: string[];
}

export class XPService {
  private static instance: XPService;

  private constructor() {}

  public static getInstance(): XPService {
    if (!XPService.instance) {
      XPService.instance = new XPService();
    }
    return XPService.instance;
  }

  // 크레도 기반 레벨 계산
  public calculateNextLevelCredo(credo: number): number {
    const requirement = this.getLevelRequirements().find(req => req.credoRequired > credo);
    return requirement ? requirement.credoRequired : 100;
  }

  // 크레도 점수로 현재 레벨 계산
  public calculateLevel(credo: number): number {
    const requirements = this.getLevelRequirements();
    for (let i = requirements.length - 1; i >= 0; i--) {
      if (credo >= requirements[i].credoRequired) {
        return requirements[i].level;
      }
    }
    return 1;
  }

  // 레벨별 보상 가져오기
  public getLevelRewards(level: number): string[] {
    const requirement = this.getLevelRequirements().find(req => req.level === level);
    return requirement ? requirement.rewards : [];
  }

  // 레벨별 요구사항 (크레도 기반)
  public getLevelRequirements(): LevelRequirement[] {
    return [
      { level: 1, credoRequired: 100, rewards: ['기본 캐릭터', '기본 스킬'] },
      { level: 2, credoRequired: 300, rewards: ['레벨 2 캐릭터', '스킬 포인트 +1'] },
      { level: 3, credoRequired: 600, rewards: ['레벨 3 캐릭터', '스킬 포인트 +1'] },
      { level: 4, credoRequired: 1000, rewards: ['레벨 4 캐릭터', '스킬 포인트 +1'] },
      { level: 5, credoRequired: 1500, rewards: ['레벨 5 캐릭터', '스킬 포인트 +1'] },
      { level: 6, credoRequired: 2100, rewards: ['레벨 6 캐릭터', '스킬 포인트 +1'] },
      { level: 7, credoRequired: 2800, rewards: ['레벨 7 캐릭터', '스킬 포인트 +1'] },
      { level: 8, credoRequired: 3600, rewards: ['레벨 8 캐릭터', '스킬 포인트 +1'] },
      { level: 9, credoRequired: 4500, rewards: ['레벨 9 캐릭터', '스킬 포인트 +1'] },
      { level: 10, credoRequired: 5500, rewards: ['최고 레벨 캐릭터', '특별 보상'] }
    ];
  }

  // 활동별 크레도 점수 (주요 성장 지표)
  public getActivityCredo(activity: string): number {
    const credoScores: { [key: string]: number } = {
      // 금융 활동
      'transaction': 2,
      'saving': 5,
      'investment': 10,
      'budget_planning': 8,
      'financial_goal': 20,
      
      // 퀘스트
      'quest_complete': 15,
      'daily_quest': 5,
      'weekly_quest': 30,
      'achievement': 50,
      
      // 학습 활동
      'financial_education': 10,
      'article_read': 3,
      'course_complete': 50,
      
      // 소셜 활동
      'post_share': 5,
      'comment': 2,
      'like': 1,
      
      // 로그인
      'daily_login': 2,
      'streak_bonus': 10
    };

    return credoScores[activity] || 0;
  }

  // 활동별 XP 점수 (보조 지표)
  public getActivityXP(activity: string): number {
    const activityScores: { [key: string]: number } = {
      // 금융 활동
      'transaction': 10,
      'saving': 25,
      'investment': 50,
      'budget_planning': 30,
      'financial_goal': 100,
      
      // 퀘스트
      'quest_complete': 75,
      'daily_quest': 25,
      'weekly_quest': 150,
      'achievement': 200,
      
      // 학습 활동
      'financial_education': 40,
      'article_read': 15,
      'course_complete': 200,
      
      // 소셜 활동
      'post_share': 20,
      'comment': 10,
      'like': 5,
      
      // 로그인
      'daily_login': 10,
      'streak_bonus': 50
    };

    return activityScores[activity] || 0;
  }

  // 크레도 데이터 가져오기 (백엔드 연동)
  public async fetchCredoData(userId: string): Promise<CredoData> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(`${API_ENDPOINTS.XP.PROGRESS}/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return {
          currentCredo: data.current_credo || 0,
          currentLevel: data.current_level || 1,
          nextLevelCredoRequired: data.credo_to_next || 100,
          totalCredo: data.total_credo || 0,
          currentXP: data.current_xp || 0,
          totalXP: data.total_xp || 0,
          progress: data.progress || 0,
        };
      }
    } catch (error) {
      console.error('크레도 데이터 로딩 실패:', error);
    }

    // 기본값 반환
    return {
      currentCredo: 0,
      currentLevel: 1,
      nextLevelCredoRequired: 100,
      totalCredo: 0,
      currentXP: 0,
      totalXP: 0,
      progress: 0,
    };
  }

  // 크레도 점수 추가 (백엔드 연동)
  public async addCredoForActivity(
    userId: string, 
    activityType: string, 
    description?: string
  ): Promise<CredoData | null> {
    try {
      const token = await this.getAuthToken();
      const response = await fetch(API_ENDPOINTS.XP.ADD_CREDO, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activity_type: activityType,
          description: description,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          currentCredo: data.credo_score || 0,
          currentLevel: data.level || 1,
          nextLevelCredoRequired: data.xp_to_next || 100,
          totalCredo: data.credo_score || 0,
          currentXP: data.xp || 0,
          totalXP: data.total_xp || 0,
          progress: data.progress || 0,
        };
      }
    } catch (error) {
      console.error('크레도 점수 추가 실패:', error);
    }

    return null;
  }



  // 인증 토큰 가져오기
  private async getAuthToken(): Promise<string> {
    try {
      // SecureStore에서 토큰 가져오기 (Expo 환경에 맞게)
      const SecureStore = require('expo-secure-store');
      return await SecureStore.getItemAsync('authToken') || '';
    } catch (error) {
      console.error('토큰 가져오기 실패:', error);
      return '';
    }
  }
}

export default XPService;
