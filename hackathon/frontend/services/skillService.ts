import { API_KEYS } from '../config/apiKeys';

export interface SkillNode {
  id: string;
  name: string;
  level: number;
  maxLevel: number;
  currentXP: number;
  maxXP: number;
  category: 'academic' | 'financial' | 'chronicle';
  icon: string;
  color: string;
  description: string;
  benefits: string[];
  unlocked: boolean;
  position: { x: number; y: number };
  connections: string[];
  apiEndpoint?: string;
  realData?: any;
}

export interface SkillResponse {
  success: boolean;
  skills: SkillNode[];
  error?: string;
}

class SkillService {
  private static instance: SkillService;
  private baseUrl: string;

  private constructor() {
    // 백엔드 서버 URL (환경에 따라 변경 필요)
    this.baseUrl = 'http://localhost:8000';
  }

  public static getInstance(): SkillService {
    if (!SkillService.instance) {
      SkillService.instance = new SkillService();
    }
    return SkillService.instance;
  }

  /**
   * 학사 스킬 데이터 가져오기
   */
  public async fetchAcademicSkills(): Promise<SkillNode[]> {
    try {
      console.log('📚 학사 스킬 데이터 요청 중...');
      
      const response = await fetch(`${this.baseUrl}/api/academic/skills`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SkillResponse = await response.json();
      
      if (data.success && data.skills) {
        console.log('✅ 학사 스킬 데이터 로드 성공:', data.skills.length, '개');
        return data.skills;
      } else {
        throw new Error(data.error || '학사 스킬 데이터 로드 실패');
      }
    } catch (error) {
      console.error('❌ 학사 스킬 데이터 로드 실패:', error);
      throw error;
    }
  }

  /**
   * 금융 스킬 데이터 가져오기
   */
  public async fetchFinancialSkills(): Promise<SkillNode[]> {
    try {
      console.log('💰 금융 스킬 데이터 요청 중...');
      
      const response = await fetch(`${this.baseUrl}/api/financial/skills`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SkillResponse = await response.json();
      
      if (data.success && data.skills) {
        console.log('✅ 금융 스킬 데이터 로드 성공:', data.skills.length, '개');
        return data.skills;
      } else {
        throw new Error(data.error || '금융 스킬 데이터 로드 실패');
      }
    } catch (error) {
      console.error('❌ 금융 스킬 데이터 로드 실패:', error);
      throw error;
    }
  }

  /**
   * 특정 스킬의 상세 정보 가져오기
   */
  public async fetchSkillDetail(skillId: string, category: string): Promise<any> {
    try {
      console.log(`🔍 스킬 상세 정보 요청 중: ${skillId} (${category})`);
      
      const response = await fetch(`${this.baseUrl}/api/${category}/skills/${skillId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ 스킬 상세 정보 로드 성공:', data);
      return data;
    } catch (error) {
      console.error('❌ 스킬 상세 정보 로드 실패:', error);
      throw error;
    }
  }

  /**
   * 스킬 경험치 업데이트
   */
  public async updateSkillXP(skillId: string, category: string, xpGain: number): Promise<boolean> {
    try {
      console.log(`📈 스킬 XP 업데이트: ${skillId} +${xpGain}XP`);
      
      const response = await fetch(`${this.baseUrl}/api/${category}/skills/${skillId}/xp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ xpGain }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ 스킬 XP 업데이트 성공:', data);
      return data.success || false;
    } catch (error) {
      console.error('❌ 스킬 XP 업데이트 실패:', error);
      throw error;
    }
  }

  /**
   * 스킬 레벨업
   */
  public async levelUpSkill(skillId: string, category: string): Promise<boolean> {
    try {
      console.log(`🚀 스킬 레벨업 시도: ${skillId}`);
      
      const response = await fetch(`${this.baseUrl}/api/${category}/skills/${skillId}/levelup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ 스킬 레벨업 성공:', data);
      return data.success || false;
    } catch (error) {
      console.error('❌ 스킬 레벨업 실패:', error);
      throw error;
    }
  }

  /**
   * 사용자 전체 스킬 요약 가져오기
   */
  public async fetchUserSkillSummary(): Promise<any> {
    try {
      console.log('📊 사용자 스킬 요약 요청 중...');
      
      const response = await fetch(`${this.baseUrl}/api/user/skills/summary`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ 사용자 스킬 요약 로드 성공:', data);
      return data;
    } catch (error) {
      console.error('❌ 사용자 스킬 요약 로드 실패:', error);
      throw error;
    }
  }

  /**
   * 네트워크 연결 테스트
   */
  public async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch (error) {
      console.error('❌ 백엔드 서버 연결 실패:', error);
      return false;
    }
  }
}

export default SkillService;
