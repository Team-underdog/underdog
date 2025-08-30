/**
 * 홈화면 대시보드 서비스
 * 백엔드 API와 연동하여 계좌 정보, 거래 내역, 재무 현황 제공
 */

import { API_BASE_URL } from '../config/api';

export interface AccountSummary {
  total_accounts: number;
  total_balance: number;
  total_loan: number;
  net_worth: number;
  account_details: Array<{
    account_no: string;
    account_name: string;
    account_type: string;
    balance: number;
    bank_name: string;
  }>;
  account_counts: {
    demand_deposit: number;
    deposit: number;
    savings: number;
    loan: number;
  };
}

export interface Transaction {
  transactionDate: string;
  amount: number;
  memo: string;
  account_type?: string;
  account_name?: string;
}

export interface FinancialStatus {
  credit_score: number;
  credit_grade: string;
  monthly_analysis: {
    [month: string]: {
      income: number;
      expense: number;
      net: number;
    };
  };
  financial_goals: {
    [goal: string]: {
      target: number;
      current: number;
      description: string;
      achievement_rate: number;
    };
  };
}

export interface RecommendedProduct {
  type: string;
  product: any;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

export interface HomeDashboard {
  success: boolean;
  user_key: string;
  timestamp: string;
  account_summary: AccountSummary;
  recent_transactions: Transaction[];
  financial_status: FinancialStatus;
  recommended_products: RecommendedProduct[];
}

export interface AccountDetails {
  success: boolean;
  account_no: string;
  account_type: string;
  account_info: any;
  balance_info: any;
  transactions: Transaction[];
}

class HomeDashboardService {
  private baseUrl = `${API_BASE_URL}/home`;

  /**
   * 홈화면 대시보드 정보 조회
   */
  async getDashboard(userKey: string): Promise<HomeDashboard> {
    try {
      const response = await fetch(`${this.baseUrl}/dashboard?user_key=${userKey}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('대시보드 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 특정 계좌 상세 정보 조회
   */
  async getAccountDetails(accountNo: string, userKey: string): Promise<AccountDetails> {
    try {
      const response = await fetch(`${this.baseUrl}/account-details/${accountNo}?user_key=${userKey}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('계좌 상세 정보 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 계좌 잔액 포맷팅
   */
  formatBalance(balance: number): string {
    if (balance >= 1000000000) {
      return `${(balance / 1000000000).toFixed(1)}B`;
    } else if (balance >= 1000000) {
      return `${(balance / 1000000).toFixed(1)}M`;
    } else if (balance >= 1000) {
      return `${(balance / 1000).toFixed(1)}K`;
    }
    return balance.toString();
  }

  /**
   * 거래 금액 포맷팅
   */
  formatAmount(amount: number): string {
    const isPositive = amount >= 0;
    const absAmount = Math.abs(amount);
    const formatted = this.formatBalance(absAmount);
    return `${isPositive ? '+' : '-'}${formatted}`;
  }

  /**
   * 신용등급 색상 반환
   */
  getCreditGradeColor(grade: string): string {
    switch (grade) {
      case 'A':
        return '#4CAF50'; // 초록색
      case 'B':
        return '#8BC34A'; // 연두색
      case 'C':
        return '#FFC107'; // 노란색
      case 'D':
        return '#FF9800'; // 주황색
      case 'E':
        return '#F44336'; // 빨간색
      default:
        return '#9E9E9E'; // 회색
    }
  }

  /**
   * 목표 달성률 색상 반환
   */
  getAchievementColor(rate: number): string {
    if (rate >= 80) return '#4CAF50'; // 초록색
    if (rate >= 60) return '#8BC34A'; // 연두색
    if (rate >= 40) return '#FFC107'; // 노란색
    if (rate >= 20) return '#FF9800'; // 주황색
    return '#F44336'; // 빨간색
  }

  /**
   * 월별 재무 데이터 차트용 포맷팅
   */
  formatMonthlyData(financialStatus: FinancialStatus) {
    const months = Object.keys(financialStatus.monthly_analysis).sort();
    return months.map(month => ({
      month,
      income: financialStatus.monthly_analysis[month].income,
      expense: financialStatus.monthly_analysis[month].expense,
      net: financialStatus.monthly_analysis[month].net,
    }));
  }

  /**
   * 거래 내역 필터링
   */
  filterTransactions(
    transactions: Transaction[],
    filters: {
      accountType?: string;
      minAmount?: number;
      maxAmount?: number;
      startDate?: string;
      endDate?: string;
    }
  ): Transaction[] {
    return transactions.filter(tx => {
      // 계좌 타입 필터
      if (filters.accountType && tx.account_type !== filters.accountType) {
        return false;
      }

      // 금액 범위 필터
      if (filters.minAmount !== undefined && tx.amount < filters.minAmount) {
        return false;
      }
      if (filters.maxAmount !== undefined && tx.amount > filters.maxAmount) {
        return false;
      }

      // 날짜 범위 필터
      if (filters.startDate && tx.transactionDate < filters.startDate) {
        return false;
      }
      if (filters.endDate && tx.transactionDate > filters.endDate) {
        return false;
      }

      return true;
    });
  }

  /**
   * 거래 내역 검색
   */
  searchTransactions(transactions: Transaction[], keyword: string): Transaction[] {
    return transactions.filter(tx =>
      tx.memo.toLowerCase().includes(keyword.toLowerCase()) ||
      tx.account_name?.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  /**
   * 거래 내역 정렬
   */
  sortTransactions(
    transactions: Transaction[],
    sortBy: 'date' | 'amount' | 'account',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Transaction[] {
    const sorted = [...transactions];

    switch (sortBy) {
      case 'date':
        sorted.sort((a, b) => {
          const dateA = new Date(a.transactionDate);
          const dateB = new Date(b.transactionDate);
          return sortOrder === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
        });
        break;
      case 'amount':
        sorted.sort((a, b) => {
          return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
        });
        break;
      case 'account':
        sorted.sort((a, b) => {
          const accountA = a.account_name || '';
          const accountB = b.account_name || '';
          return sortOrder === 'asc' 
            ? accountA.localeCompare(accountB)
            : accountB.localeCompare(accountA);
        });
        break;
    }

    return sorted;
  }

  /**
   * 통계 데이터 계산
   */
  calculateStatistics(transactions: Transaction[]) {
    const totalIncome = transactions
      .filter(tx => tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalExpense = transactions
      .filter(tx => tx.amount < 0)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    const netAmount = totalIncome - totalExpense;

    const transactionCount = transactions.length;
    const averageAmount = transactionCount > 0 ? netAmount / transactionCount : 0;

    return {
      totalIncome,
      totalExpense,
      netAmount,
      transactionCount,
      averageAmount,
    };
  }
}

export default new HomeDashboardService();
