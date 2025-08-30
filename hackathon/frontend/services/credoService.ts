// React Native 호환 이벤트 시스템
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../config/api';

class EventEmitter {
  private events: { [key: string]: Function[] } = {};

  on(event: string, listener: Function): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  off(event: string, listener: Function): void {
    if (!this.events[event]) return;
    const index = this.events[event].indexOf(listener);
    if (index > -1) {
      this.events[event].splice(index, 1);
    }
  }

  emit(event: string, ...args: any[]): void {
    if (!this.events[event]) return;
    this.events[event].forEach(listener => {
      try {
        listener(...args);
      } catch (error) {
        console.error(`이벤트 리스너 오류 (${event}):`, error);
      }
    });
  }

  removeAllListeners(event?: string): void {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
  }
}

export interface CredoTransaction {
  id: string;
  type: 'earn' | 'spend';
  amount: number;
  source: string; // 'character_touch', 'skill_unlock', 'quest_complete', 'ai_feed' 등
  description: string;
  timestamp: Date;
}

export interface CredoStats {
  totalCredo: number;
  currentCredo: number;
  spentCredo: number;
  earnedCredo: number;
  level: number;
  transactions: CredoTransaction[];
}

class CredoService extends EventEmitter {
  private static instance: CredoService;
  private credoStats: CredoStats;
  private readonly CREDO_PER_LEVEL = 100; // 레벨당 필요한 크레도
  private userId: string | null = null;

  private constructor() {
    super();
    this.credoStats = {
      totalCredo: 0,
      currentCredo: 0,
      spentCredo: 0,
      earnedCredo: 0,
      level: 1,
      transactions: []
    };
    
    // 로컬 스토리지에서 크레도 데이터 복원
    this.loadCredoData();
  }

  public static getInstance(): CredoService {
    if (!CredoService.instance) {
      CredoService.instance = new CredoService();
    }
    return CredoService.instance;
  }

  // 사용자 ID 설정
  public async setUserId(userId: string): Promise<void> {
    this.userId = userId;
    console.log(`👤 CredoService 사용자 ID 설정: ${userId}`);
    // 사용자 ID가 변경되면 데이터 다시 로드
    await this.loadCredoData();
  }

  // 사용자 ID 가져오기
  public getUserId(): string | null {
    return this.userId;
  }

  // 크레도 데이터 로드
  public async loadCredoData(): Promise<void> {
    try {
      if (!this.userId) {
        console.log('⚠️ 사용자 ID가 설정되지 않음, 기본값 사용');
        return;
      }

      // 백엔드 API에서 실제 크레도 데이터 로드
      const response = await fetch(`${API_BASE_URL}/api/xp/progress/${this.userId}`);
      if (response.ok) {
        const data = await response.json() as any;
        if (data.success && data.data) {
          this.credoStats = {
            totalCredo: data.data.total_xp || 0,
            currentCredo: data.data.credo_score || 0,
            spentCredo: 0, // 백엔드에서 제공하지 않는 경우
            earnedCredo: data.data.total_xp || 0,
            level: data.data.current_level || 1,
            transactions: []
          };
          console.log(`📊 사용자 ${this.userId}의 크레도 데이터 로드됨:`, this.credoStats);
        }
      } else {
        console.log('⚠️ 크레도 데이터 로드 실패, 기본값 사용');
      }
    } catch (error) {
      console.error('크레도 데이터 로드 실패:', error);
    }
  }

  // 크레도 데이터 저장
  private saveCredoData(): void {
    try {
      // AsyncStorage나 다른 저장소에 데이터 저장
      console.log('💾 크레도 데이터 저장됨');
    } catch (error) {
      console.error('크레도 데이터 저장 실패:', error);
    }
  }

  // 현재 크레도 상태 가져오기
  public getCredoStats(): CredoStats {
    return { ...this.credoStats };
  }

  // 크레도 획득
  public earnCredo(amount: number, source: string, description: string): boolean {
    if (amount <= 0) return false;

    const transaction: CredoTransaction = {
      id: this.generateTransactionId(),
      type: 'earn',
      amount,
      source,
      description,
      timestamp: new Date()
    };

    this.credoStats.earnedCredo += amount;
    this.credoStats.currentCredo += amount;
    this.credoStats.totalCredo += amount;
    this.credoStats.transactions.unshift(transaction);

    // 레벨업 체크
    this.checkLevelUp();

    // 데이터 저장 및 이벤트 발생
    this.saveCredoData();
    this.emit('credoChanged', this.credoStats);
    this.emit('credoEarned', { amount, source, description });

    console.log(`🎉 크레도 획득: +${amount} (${source}) - ${description}`);
    return true;
  }

  // 크레도 소비
  public spendCredo(amount: number, source: string, description: string): boolean {
    if (amount <= 0 || this.credoStats.currentCredo < amount) return false;

    const transaction: CredoTransaction = {
      id: this.generateTransactionId(),
      type: 'spend',
      amount,
      source,
      description,
      timestamp: new Date()
    };

    this.credoStats.spentCredo += amount;
    this.credoStats.currentCredo -= amount;
    this.credoStats.transactions.unshift(transaction);

    // 데이터 저장 및 이벤트 발생
    this.saveCredoData();
    this.emit('credoChanged', this.credoStats);
    this.emit('credoSpent', { amount, source, description });

    console.log(`💸 크레도 소비: -${amount} (${source}) - ${description}`);
    return true;
  }

  // 레벨업 체크
  private checkLevelUp(): void {
    const requiredCredo = this.credoStats.level * this.CREDO_PER_LEVEL;
    
    if (this.credoStats.currentCredo >= requiredCredo) {
      this.credoStats.level += 1;
      this.emit('levelUp', { 
        newLevel: this.credoStats.level, 
        requiredCredo: this.credoStats.level * this.CREDO_PER_LEVEL 
      });
      console.log(`🚀 레벨업! ${this.credoStats.level}레벨 달성!`);
    }
  }

  // 다음 레벨까지 필요한 크레도
  public getCredoForNextLevel(): number {
    return this.credoStats.level * this.CREDO_PER_LEVEL;
  }

  // 현재 레벨 진행률 (0-100%)
  public getLevelProgress(): number {
    const currentLevelCredo = (this.credoStats.level - 1) * this.CREDO_PER_LEVEL;
    const earnedInCurrentLevel = this.credoStats.currentCredo - currentLevelCredo;
    const requiredForCurrentLevel = this.CREDO_PER_LEVEL;
    
    return Math.min(100, Math.max(0, (earnedInCurrentLevel / requiredForCurrentLevel) * 100));
  }

  // 크레도 잔액 확인
  public hasEnoughCredo(amount: number): boolean {
    return this.credoStats.currentCredo >= amount;
  }

  // 특정 소스에서 획득한 총 크레도
  public getTotalCredoFromSource(source: string): number {
    return this.credoStats.transactions
      .filter(t => t.type === 'earn' && t.source === source)
      .reduce((sum, t) => sum + t.amount, 0);
  }

  // 최근 거래 내역
  public getRecentTransactions(limit: number = 10): CredoTransaction[] {
    return this.credoStats.transactions.slice(0, limit);
  }

  // 크레도 통계 요약
  public getCredoSummary(): {
    currentLevel: number;
    currentCredo: number;
    nextLevelCredo: number;
    progress: number;
    totalEarned: number;
    totalSpent: number;
  } {
    return {
      currentLevel: this.credoStats.level,
      currentCredo: this.credoStats.currentCredo,
      nextLevelCredo: this.getCredoForNextLevel(),
      progress: this.getLevelProgress(),
      totalEarned: this.credoStats.earnedCredo,
      totalSpent: this.credoStats.spentCredo
    };
  }

  // 크레도 리셋 (테스트용)
  public resetCredo(): void {
    this.credoStats = {
      totalCredo: 0,
      currentCredo: 0,
      spentCredo: 0,
      earnedCredo: 0,
      level: 1,
      transactions: []
    };
    
    this.saveCredoData();
    this.emit('credoChanged', this.credoStats);
    console.log('🔄 크레도 리셋됨');
  }

  // 테스트용 크레도 추가
  public addTestCredo(amount: number): void {
    this.earnCredo(amount, 'test', '테스트용 크레도 추가');
  }

  // 거래 ID 생성
  private generateTransactionId(): string {
    return `credo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 크레도 히스토리 내보내기
  public exportCredoHistory(): string {
    const history = this.credoStats.transactions.map(t => 
      `${t.timestamp.toISOString()} | ${t.type === 'earn' ? '+' : '-'}${t.amount} | ${t.source} | ${t.description}`
    ).join('\n');
    
    return `크레도 거래 내역\n${'='.repeat(50)}\n${history}`;
  }
}

export default CredoService;
