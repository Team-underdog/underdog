/**
 * 소셜 금융 서비스
 * 친구와의 송금, 분할 정산, 그룹 지출 관리 기능
 */

import { API_BASE_URL } from '../config/api';

export interface Friend {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  isVerified: boolean;
  lastActive: string;
}

export interface TransferRequest {
  fromUserId: string;
  toUserId: string;
  amount: number;
  memo: string;
  accountNo: string;
  transferType: 'instant' | 'scheduled';
  scheduledDate?: string;
}

export interface TransferResponse {
  success: boolean;
  transferId: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  amount: number;
  fee: number;
  memo: string;
  timestamp: string;
  fromUser: Friend;
  toUser: Friend;
}

export interface SplitExpense {
  id: string;
  title: string;
  description: string;
  totalAmount: number;
  paidBy: string; // 사용자 ID
  paidByName: string;
  category: 'food' | 'transport' | 'entertainment' | 'shopping' | 'other';
  date: string;
  participants: SplitParticipant[];
  status: 'active' | 'settled' | 'cancelled';
  createdAt: string;
}

export interface SplitParticipant {
  userId: string;
  name: string;
  share: number; // 분담 금액
  status: 'pending' | 'paid' | 'overdue';
  paidAt?: string;
}

export interface GroupExpense {
  id: string;
  name: string;
  description: string;
  members: GroupMember[];
  expenses: GroupExpenseItem[];
  totalBalance: number;
  createdAt: string;
  updatedAt: string;
}

export interface GroupMember {
  userId: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  balance: number; // 그룹 내 잔액 (양수: 받을 돈, 음수: 낼 돈)
  joinedAt: string;
}

export interface GroupExpenseItem {
  id: string;
  title: string;
  amount: number;
  paidBy: string;
  paidByName: string;
  category: string;
  date: string;
  splitType: 'equal' | 'custom' | 'percentage';
  participants: string[]; // 참여자 ID 배열
}

export interface PaymentReminder {
  id: string;
  expenseId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  message: string;
  dueDate: string;
  status: 'pending' | 'sent' | 'reminded' | 'paid';
  createdAt: string;
}

class SocialFinanceService {
  private baseUrl = `${API_BASE_URL}/social`;

  /**
   * 친구 목록 조회
   */
  async getFriends(userId: string): Promise<Friend[]> {
    try {
      const response = await fetch(`${this.baseUrl}/friends?user_id=${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.friends || [];
    } catch (error) {
      console.error('친구 목록 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 친구 검색
   */
  async searchFriends(userId: string, keyword: string): Promise<Friend[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/friends/search?user_id=${userId}&keyword=${encodeURIComponent(keyword)}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.friends || [];
    } catch (error) {
      console.error('친구 검색 실패:', error);
      throw error;
    }
  }

  /**
   * 친구 추가
   */
  async addFriend(userId: string, friendEmail: string): Promise<Friend> {
    try {
      const response = await fetch(`${this.baseUrl}/friends/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          friendEmail,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.friend;
    } catch (error) {
      console.error('친구 추가 실패:', error);
      throw error;
    }
  }

  /**
   * 송금 요청
   */
  async requestTransfer(transferRequest: TransferRequest): Promise<TransferResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transferRequest),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('송금 요청 실패:', error);
      throw error;
    }
  }

  /**
   * 송금 내역 조회
   */
  async getTransferHistory(userId: string, limit: number = 20): Promise<TransferResponse[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/transfer/history?user_id=${userId}&limit=${limit}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.transfers || [];
    } catch (error) {
      console.error('송금 내역 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 송금 취소
   */
  async cancelTransfer(transferId: string, userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/transfer/${transferId}/cancel`, {
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
      return result.success;
    } catch (error) {
      console.error('송금 취소 실패:', error);
      throw error;
    }
  }

  /**
   * 분할 정산 생성
   */
  async createSplitExpense(splitExpense: Omit<SplitExpense, 'id' | 'createdAt'>): Promise<SplitExpense> {
    try {
      const response = await fetch(`${this.baseUrl}/split-expense`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(splitExpense),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.expense;
    } catch (error) {
      console.error('분할 정산 생성 실패:', error);
      throw error;
    }
  }

  /**
   * 분할 정산 목록 조회
   */
  async getSplitExpenses(userId: string): Promise<SplitExpense[]> {
    try {
      const response = await fetch(`${this.baseUrl}/split-expense?user_id=${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.expenses || [];
    } catch (error) {
      console.error('분할 정산 목록 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 분할 정산 상세 조회
   */
  async getSplitExpenseDetail(expenseId: string): Promise<SplitExpense> {
    try {
      const response = await fetch(`${this.baseUrl}/split-expense/${expenseId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.expense;
    } catch (error) {
      console.error('분할 정산 상세 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 분할 정산 정산 처리
   */
  async settleSplitExpense(expenseId: string, userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/split-expense/${expenseId}/settle`, {
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
      return result.success;
    } catch (error) {
      console.error('분할 정산 정산 처리 실패:', error);
      throw error;
    }
  }

  /**
   * 그룹 지출 생성
   */
  async createGroupExpense(groupExpense: Omit<GroupExpense, 'id' | 'createdAt' | 'updatedAt'>): Promise<GroupExpense> {
    try {
      const response = await fetch(`${this.baseUrl}/group-expense`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(groupExpense),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.group;
    } catch (error) {
      console.error('그룹 지출 생성 실패:', error);
      throw error;
    }
  }

  /**
   * 그룹 지출 목록 조회
   */
  async getGroupExpenses(userId: string): Promise<GroupExpense[]> {
    try {
      const response = await fetch(`${this.baseUrl}/group-expense?user_id=${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.groups || [];
    } catch (error) {
      console.error('그룹 지출 목록 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 그룹 지출 상세 조회
   */
  async getGroupExpenseDetail(groupId: string): Promise<GroupExpense> {
    try {
      const response = await fetch(`${this.baseUrl}/group-expense/${groupId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.group;
    } catch (error) {
      console.error('그룹 지출 상세 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 그룹에 지출 항목 추가
   */
  async addGroupExpenseItem(
    groupId: string,
    expenseItem: Omit<GroupExpenseItem, 'id'>
  ): Promise<GroupExpenseItem> {
    try {
      const response = await fetch(`${this.baseUrl}/group-expense/${groupId}/expense`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expenseItem),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.expenseItem;
    } catch (error) {
      console.error('그룹 지출 항목 추가 실패:', error);
      throw error;
    }
  }

  /**
   * 그룹 정산 처리
   */
  async settleGroupExpense(groupId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/group-expense/${groupId}/settle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('그룹 정산 처리 실패:', error);
      throw error;
    }
  }

  /**
   * 결제 알림 전송
   */
  async sendPaymentReminder(reminder: Omit<PaymentReminder, 'id' | 'createdAt'>): Promise<PaymentReminder> {
    try {
      const response = await fetch(`${this.baseUrl}/payment-reminder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reminder),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.reminder;
    } catch (error) {
      console.error('결제 알림 전송 실패:', error);
      throw error;
    }
  }

  /**
   * 결제 알림 목록 조회
   */
  async getPaymentReminders(userId: string): Promise<PaymentReminder[]> {
    try {
      const response = await fetch(`${this.baseUrl}/payment-reminder?user_id=${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.reminders || [];
    } catch (error) {
      console.error('결제 알림 목록 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 송금 수수료 계산
   */
  calculateTransferFee(amount: number, transferType: 'instant' | 'scheduled'): number {
    if (transferType === 'instant') {
      // 즉시 송금: 금액의 0.1% (최소 100원, 최대 1,000원)
      const fee = Math.floor(amount * 0.001);
      return Math.min(Math.max(fee, 100), 1000);
    } else {
      // 예약 송금: 금액의 0.05% (최소 50원, 최대 500원)
      const fee = Math.floor(amount * 0.0005);
      return Math.min(Math.max(fee, 50), 500);
    }
  }

  /**
   * 분할 정산 금액 계산
   */
  calculateSplitAmounts(totalAmount: number, participants: string[], splitType: 'equal' | 'custom' | 'percentage'): { [userId: string]: number } {
    const amounts: { [userId: string]: number } = {};
    
    if (splitType === 'equal') {
      const shareAmount = Math.floor(totalAmount / participants.length);
      const remainder = totalAmount % participants.length;
      
      participants.forEach((userId, index) => {
        amounts[userId] = shareAmount + (index < remainder ? 1 : 0);
      });
    }
    
    return amounts;
  }

  /**
   * 그룹 내 잔액 계산
   */
  calculateGroupBalances(expenses: GroupExpenseItem[], members: GroupMember[]): GroupMember[] {
    const balances: { [userId: string]: number } = {};
    
    // 초기 잔액 설정
    members.forEach(member => {
      balances[member.userId] = 0;
    });
    
    // 지출 항목별로 잔액 계산
    expenses.forEach(expense => {
      const paidBy = expense.paidBy;
      const totalAmount = expense.amount;
      
      // 지불한 사람의 잔액 증가
      balances[paidBy] += totalAmount;
      
      // 참여자들의 잔액 감소
      if (expense.splitType === 'equal') {
        const shareAmount = totalAmount / expense.participants.length;
        expense.participants.forEach(participantId => {
          if (participantId !== paidBy) {
            balances[participantId] -= shareAmount;
          }
        });
      }
    });
    
    // 멤버 정보 업데이트
    return members.map(member => ({
      ...member,
      balance: balances[member.userId] || 0,
    }));
  }

  /**
   * 최적 정산 방안 계산
   */
  calculateOptimalSettlement(members: GroupMember[]): Array<{ from: string; to: string; amount: number }> {
    const settlements: Array<{ from: string; to: string; amount: number }> = [];
    const balances = [...members];
    
    // 잔액이 양수인 사람과 음수인 사람을 분리
    const creditors = balances.filter(m => m.balance > 0).sort((a, b) => b.balance - a.balance);
    const debtors = balances.filter(m => m.balance < 0).sort((a, b) => a.balance - b.balance);
    
    let creditorIndex = 0;
    let debtorIndex = 0;
    
    while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
      const creditor = creditors[creditorIndex];
      const debtor = debtors[debtorIndex];
      
      const amount = Math.min(creditor.balance, Math.abs(debtor.balance));
      
      if (amount > 0) {
        settlements.push({
          from: debtor.name,
          to: creditor.name,
          amount: amount,
        });
        
        creditor.balance -= amount;
        debtor.balance += amount;
        
        if (creditor.balance === 0) creditorIndex++;
        if (debtor.balance === 0) debtorIndex++;
      }
    }
    
    return settlements;
  }
}

export default new SocialFinanceService();
