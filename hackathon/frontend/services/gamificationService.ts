/**
 * 게이미피케이션 서비스
 * 금융 목표 달성 시 크레도 획득 및 레벨업 시스템
 */

import { API_BASE_URL } from '../config/api';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'saving' | 'investment' | 'budget' | 'credit' | 'social' | 'streak';
  points: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  progress: number; // 0-100
  target: number;
  current: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  category: 'saving' | 'investment' | 'budget' | 'credit' | 'social';
  requirements: QuestRequirement[];
  rewards: QuestReward;
  status: 'active' | 'completed' | 'expired';
  progress: number; // 0-100
  expiresAt: string;
  startedAt: string;
  completedAt?: string;
}

export interface QuestRequirement {
  type: 'save_amount' | 'save_days' | 'spend_less' | 'invest_amount' | 'credit_score' | 'social_activity';
  target: number;
  current: number;
  description: string;
}

export interface QuestReward {
  xp: number;
  credits: number;
  badges: string[];
  specialRewards?: string[];
}

export interface UserProfile {
  userId: string;
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  totalCredits: number;
  achievements: Achievement[];
  activeQuests: Quest[];
  completedQuests: Quest[];
  stats: UserStats;
  rank: UserRank;
}

export interface UserStats {
  totalSaved: number;
  totalInvested: number;
  daysStreak: number;
  maxStreak: number;
  questsCompleted: number;
  achievementsUnlocked: number;
  socialInteractions: number;
  lastActiveDate: string;
}

export interface UserRank {
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  rank: number;
  totalUsers: number;
  percentile: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  level: number;
  totalCredits: number;
  achievements: number;
  streak: number;
}

export interface FinancialGoal {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: 'saving' | 'investment' | 'debt_free';
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'completed' | 'overdue';
  rewards: {
    xp: number;
    credits: number;
    achievement?: string;
  };
}

class GamificationService {
  private baseUrl = `${API_BASE_URL}/gamification`;

  /**
   * 사용자 프로필 조회
   */
  async getUserProfile(userId: string): Promise<UserProfile> {
    try {
      const response = await fetch(`${this.baseUrl}/profile/${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.profile;
    } catch (error) {
      console.error('사용자 프로필 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 업적 목록 조회
   */
  async getAchievements(userId: string): Promise<Achievement[]> {
    try {
      const response = await fetch(`${this.baseUrl}/achievements?user_id=${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.achievements || [];
    } catch (error) {
      console.error('업적 목록 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 퀘스트 목록 조회
   */
  async getQuests(userId: string): Promise<{
    active: Quest[];
    available: Quest[];
    completed: Quest[];
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/quests?user_id=${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return {
        active: result.active || [],
        available: result.available || [],
        completed: result.completed || [],
      };
    } catch (error) {
      console.error('퀘스트 목록 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 퀘스트 시작
   */
  async startQuest(questId: string, userId: string): Promise<Quest> {
    try {
      const response = await fetch(`${this.baseUrl}/quests/${questId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.quest;
    } catch (error) {
      console.error('퀘스트 시작 실패:', error);
      throw error;
    }
  }

  /**
   * 퀘스트 진행도 업데이트
   */
  async updateQuestProgress(
    questId: string,
    userId: string,
    progress: Partial<Record<string, number>>
  ): Promise<Quest> {
    try {
      const response = await fetch(`${this.baseUrl}/quests/${questId}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          progress,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.quest;
    } catch (error) {
      console.error('퀘스트 진행도 업데이트 실패:', error);
      throw error;
    }
  }

  /**
   * 퀘스트 완료
   */
  async completeQuest(questId: string, userId: string): Promise<{
    quest: Quest;
    rewards: QuestReward;
    levelUp?: boolean;
    newLevel?: number;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/quests/${questId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('퀘스트 완료 실패:', error);
      throw error;
    }
  }

  /**
   * 금융 목표 생성
   */
  async createFinancialGoal(goal: Omit<FinancialGoal, 'id' | 'status'>): Promise<FinancialGoal> {
    try {
      const response = await fetch(`${this.baseUrl}/goals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(goal),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.goal;
    } catch (error) {
      console.error('금융 목표 생성 실패:', error);
      throw error;
    }
  }

  /**
   * 금융 목표 목록 조회
   */
  async getFinancialGoals(userId: string): Promise<FinancialGoal[]> {
    try {
      const response = await fetch(`${this.baseUrl}/goals?user_id=${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.goals || [];
    } catch (error) {
      console.error('금융 목표 목록 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 금융 목표 진행도 업데이트
   */
  async updateGoalProgress(
    goalId: string,
    currentAmount: number
  ): Promise<{
    goal: FinancialGoal;
    achievement?: Achievement;
    levelUp?: boolean;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/goals/${goalId}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentAmount }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('목표 진행도 업데이트 실패:', error);
      throw error;
    }
  }

  /**
   * 리더보드 조회
   */
  async getLeaderboard(category: 'level' | 'credits' | 'achievements' | 'streak' = 'level'): Promise<LeaderboardEntry[]> {
    try {
      const response = await fetch(`${this.baseUrl}/leaderboard?category=${category}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.leaderboard || [];
    } catch (error) {
      console.error('리더보드 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 일일 체크인
   */
  async dailyCheckIn(userId: string): Promise<{
    streak: number;
    rewards: QuestReward;
    message: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/daily-checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('일일 체크인 실패:', error);
      throw error;
    }
  }

  /**
   * XP 획득
   */
  async gainXP(userId: string, amount: number, reason: string): Promise<{
    newXP: number;
    levelUp: boolean;
    newLevel?: number;
    rewards?: QuestReward;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/xp/gain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          amount,
          reason,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('XP 획득 실패:', error);
      throw error;
    }
  }

  /**
   * 크레도 획득
   */
  async gainCredits(userId: string, amount: number, reason: string): Promise<{
    newCredits: number;
    totalEarned: number;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/credits/gain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          amount,
          reason,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('크레도 획득 실패:', error);
      throw error;
    }
  }

  /**
   * 레벨 계산
   */
  calculateLevel(xp: number): { level: number; xpToNext: number; progress: number } {
    // 레벨 공식: level = floor(sqrt(xp / 100)) + 1
    const level = Math.floor(Math.sqrt(xp / 100)) + 1;
    const xpForCurrentLevel = Math.pow(level - 1, 2) * 100;
    const xpForNextLevel = Math.pow(level, 2) * 100;
    const xpToNext = xpForNextLevel - xp;
    const progress = ((xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;

    return {
      level,
      xpToNext,
      progress: Math.min(progress, 100),
    };
  }

  /**
   * 업적 진행도 계산
   */
  calculateAchievementProgress(achievement: Achievement, userStats: UserStats): number {
    switch (achievement.category) {
      case 'saving':
        return Math.min((userStats.totalSaved / achievement.target) * 100, 100);
      case 'investment':
        return Math.min((userStats.totalInvested / achievement.target) * 100, 100);
      case 'streak':
        return Math.min((userStats.daysStreak / achievement.target) * 100, 100);
      case 'credit':
        return Math.min((userStats.achievementsUnlocked / achievement.target) * 100, 100);
      case 'social':
        return Math.min((userStats.socialInteractions / achievement.target) * 100, 100);
      default:
        return 0;
    }
  }

  /**
   * 퀘스트 진행도 계산
   */
  calculateQuestProgress(quest: Quest): number {
    if (quest.requirements.length === 0) return 0;

    const totalProgress = quest.requirements.reduce((sum, req) => {
      const progress = Math.min((req.current / req.target) * 100, 100);
      return sum + progress;
    }, 0);

    return Math.floor(totalProgress / quest.requirements.length);
  }

  /**
   * 다음 레벨까지 필요한 XP 계산
   */
  calculateXPToNextLevel(currentLevel: number): number {
    return Math.pow(currentLevel, 2) * 100;
  }

  /**
   * 레벨별 보상 계산
   */
  calculateLevelRewards(level: number): QuestReward {
    const baseXP = level * 50;
    const baseCredits = level * 10;

    return {
      xp: baseXP,
      credits: baseCredits,
      badges: [`level_${level}`],
      specialRewards: level % 5 === 0 ? [`special_reward_${level}`] : [],
    };
  }

  /**
   * 업적 해금 조건 확인
   */
  checkAchievementUnlock(achievement: Achievement, userStats: UserStats): boolean {
    const progress = this.calculateAchievementProgress(achievement, userStats);
    return progress >= 100 && !achievement.isUnlocked;
  }

  /**
   * 퀘스트 완료 조건 확인
   */
  checkQuestCompletion(quest: Quest): boolean {
    const progress = this.calculateQuestProgress(quest);
    return progress >= 100 && quest.status === 'active';
  }

  /**
   * 스트릭 보너스 계산
   async calculateStreakBonus(userId: string): Promise<{
    currentStreak: number;
    bonus: number;
    nextMilestone: number;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/streak/bonus?user_id=${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('스트릭 보너스 계산 실패:', error);
      throw error;
    }
  }

  /**
   * 시즌 이벤트 정보 조회
   */
  async getSeasonalEvents(): Promise<{
    currentEvent: string;
    endDate: string;
    specialQuests: Quest[];
    bonusMultiplier: number;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/events/seasonal`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('시즌 이벤트 정보 조회 실패:', error);
      throw error;
    }
  }
}

export default new GamificationService();
