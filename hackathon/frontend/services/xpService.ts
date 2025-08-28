import { API_ENDPOINTS } from '../config/api';

export interface XPData {
  currentXP: number;
  currentLevel: number;
  nextLevelXP: number;
  totalXP: number;
  credoScore: number;
}

export interface LevelRequirement {
  level: number;
  xpRequired: number;
  rewards: string[];
}

export class XPService {
  private static instance: XPService;
  private currentXP: number = 0;
  private totalXP: number = 0;
  private credoScore: number = 0;

  private constructor() {}

  public static getInstance(): XPService {
    if (!XPService.instance) {
      XPService.instance = new XPService();
    }
    return XPService.instance;
  }

  // 레벨 계산
  public calculateLevel(xp: number): number {
    if (xp < 100) return 1;
    if (xp < 300) return 2;
    if (xp < 600) return 3;
    if (xp < 1000) return 4;
    if (xp < 1500) return 5;
    if (xp < 2100) return 6;
    if (xp < 2800) return 7;
    if (xp < 3600) return 8;
    if (xp < 4500) return 9;
    return 10;
  }

  // 다음 레벨까지 필요한 XP
  public calculateNextLevelXP(xp: number): number {
    const currentLevel = this.calculateLevel(xp);
    const levelRequirements = this.getLevelRequirements();
    const requirement = levelRequirements.find(req => req.level === currentLevel);
    return requirement ? requirement.xpRequired : 100;
  }

  // 레벨별 요구사항
  public getLevelRequirements(): LevelRequirement[] {
    return [
      { level: 1, xpRequired: 100, rewards: ['기본 캐릭터', '기본 스킬'] },
      { level: 2, xpRequired: 300, rewards: ['레벨 2 캐릭터', '스킬 포인트 +1'] },
      { level: 3, xpRequired: 600, rewards: ['레벨 3 캐릭터', '스킬 포인트 +1'] },
      { level: 4, xpRequired: 1000, rewards: ['레벨 4 캐릭터', '스킬 포인트 +1'] },
      { level: 5, xpRequired: 1500, rewards: ['레벨 5 캐릭터', '스킬 포인트 +1'] },
      { level: 6, xpRequired: 2100, rewards: ['레벨 6 캐릭터', '스킬 포인트 +1'] },
      { level: 7, xpRequired: 2800, rewards: ['레벨 7 캐릭터', '스킬 포인트 +1'] },
      { level: 8, xpRequired: 3600, rewards: ['레벨 8 캐릭터', '스킬 포인트 +1'] },
      { level: 9, xpRequired: 4500, rewards: ['레벨 9 캐릭터', '스킬 포인트 +1'] },
      { level: 10, xpRequired: 5500, rewards: ['최고 레벨 캐릭터', '특별 보상'] }
    ];
  }

  // 활동별 XP 점수
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

  // 활동별 크레도 점수
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

  // 로컬 XP 데이터 가져오기 (백엔드 연동 없음)
  public async fetchXPData(userId: string): Promise<XPData> {
    // 로컬 상태에서 XP 데이터 반환
    return {
      currentXP: this.currentXP,
      currentLevel: this.calculateLevel(this.currentXP),
      nextLevelXP: this.calculateNextLevelXP(this.currentXP),
      totalXP: this.totalXP,
      credoScore: this.credoScore
    };
  }

  // XP 추가하기 (로컬 상태 업데이트)
  public async addXP(userId: string, activity: string, amount?: number): Promise<boolean> {
    try {
      const xpAmount = amount || this.getActivityXP(activity);
      const credoAmount = this.getActivityCredo(activity);
      
      // 로컬 상태 업데이트
      this.currentXP += xpAmount;
      this.totalXP += xpAmount;
      this.credoScore += credoAmount;
      
      console.log(`XP 추가: ${activity} +${xpAmount}XP, +${credoAmount}크레도`);
      return true;
    } catch (error) {
      console.error('XP 추가 실패:', error);
      return false;
    }
  }

  // 레벨업 애니메이션 데이터 생성
  public generateLevelUpData(previousXP: number, currentXP: number) {
    const previousLevel = this.calculateLevel(previousXP);
    const currentLevel = this.calculateLevel(currentXP);
    
    if (currentLevel > previousLevel) {
      return {
        levelUp: true,
        newLevel: currentLevel,
        rewards: this.getLevelRewards(currentLevel),
        animation: {
          duration: 3000,
          scale: [1, 1.3, 1],
          glow: true
        }
      };
    }
    
    return { levelUp: false };
  }

  // 레벨별 보상
  private getLevelRewards(level: number): string[] {
    const requirements = this.getLevelRequirements();
    const requirement = requirements.find(req => req.level === level);
    return requirement ? requirement.rewards : [];
  }

  // 현재 진행률 계산
  public getProgressPercentage(currentXP: number): number {
    const currentLevel = this.calculateLevel(currentXP);
    const levelRequirements = this.getLevelRequirements();
    const requirement = levelRequirements.find(req => req.level === currentLevel);
    
    if (!requirement) return 100;
    
    const previousLevelXP = currentLevel > 1 
      ? levelRequirements.find(req => req.level === currentLevel - 1)?.xpRequired || 0
      : 0;
    
    const levelXP = currentXP - previousLevelXP;
    const levelRequiredXP = requirement.xpRequired - previousLevelXP;
    
    return Math.min((levelXP / levelRequiredXP) * 100, 100);
  }

  // 더미 데이터로 초기화 (테스트용)
  public initializeWithDummyData(xp: number = 0, credo: number = 0) {
    this.currentXP = xp;
    this.totalXP = xp;
    this.credoScore = credo;
  }

  // 현재 상태 가져오기
  public getCurrentState() {
    return {
      currentXP: this.currentXP,
      totalXP: this.totalXP,
      credoScore: this.credoScore,
      level: this.calculateLevel(this.currentXP),
      progress: this.getProgressPercentage(this.currentXP)
    };
  }
}

export default XPService.getInstance();
