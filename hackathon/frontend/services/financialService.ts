/**
 * SSAFY API 금융 데이터 서비스
 * 백엔드와 연동하여 실제 금융 정보를 가져옴
 */

import { authToken } from './authService';
import { API_ENDPOINTS } from '../config/api';

export interface BankAccount {
  id: number;
  account_number: string;
  bank_name: string;
  account_type: string;
  account_name: string;
  balance: number;
  currency: string;
  is_active: boolean;
  created_date: string;
  last_transaction_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: number;
  transaction_type: string;
  amount: number;
  balance_after: number;
  description: string;
  category: string;
  transaction_date: string;
  created_at: string;
}

export interface FinancialProduct {
  id: number;
  product_code: string;
  product_name: string;
  product_type: string;
  bank_name: string;
  interest_rate: number;
  min_amount: number;
  max_amount: number;
  term_months: number;
  description?: string;
  features?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProduct {
  id: number;
  product: FinancialProduct;
  account: BankAccount;
  amount: number;
  start_date: string;
  end_date: string;
  status: string;
  total_interest: number;
  last_interest_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CreditScore {
  id: number;
  score: number;
  grade: string;
  last_updated: string;
  credit_limit: number;
  used_credit: number;
  created_at: string;
  updated_at: string;
}

export interface FinancialSummary {
  total_balance: number;
  total_assets: number;
  total_liabilities: number;
  net_worth: number;
  credit_score: CreditScore;
  accounts: BankAccount[];
  recent_transactions: Transaction[];
  products: UserProduct[];
}

class FinancialService {
  private async getAuthHeaders() {
    const token = await authToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  async getBankAccounts(): Promise<BankAccount[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/financial/accounts`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`계좌 목록 조회 실패: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('계좌 목록 조회 오류:', error);
      throw error;
    }
  }

  async getTransactions(accountId?: number, limit: number = 20): Promise<Transaction[]> {
    try {
      const headers = await this.getAuthHeaders();
      const params = new URLSearchParams();
      if (accountId) params.append('account_id', accountId.toString());
      params.append('limit', limit.toString());

      const response = await fetch(`${API_BASE_URL}/financial/transactions?${params}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`거래 내역 조회 실패: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('거래 내역 조회 오류:', error);
      throw error;
    }
  }

  async getFinancialProducts(productType?: string): Promise<FinancialProduct[]> {
    try {
      const headers = await this.getAuthHeaders();
      const params = new URLSearchParams();
      if (productType) params.append('product_type', productType);

      const response = await fetch(`${API_BASE_URL}/financial/products?${params}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`금융 상품 조회 실패: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('금융 상품 조회 오류:', error);
      throw error;
    }
  }

  async getUserProducts(): Promise<UserProduct[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/financial/user-products`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`가입 상품 조회 실패: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('가입 상품 조회 오류:', error);
      throw error;
    }
  }

  async getCreditScore(): Promise<CreditScore> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/financial/credit-score`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`신용점수 조회 실패: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('신용점수 조회 오류:', error);
      throw error;
    }
  }

  async getFinancialSummary(): Promise<FinancialSummary> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/financial/summary`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`금융 요약 정보 조회 실패: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('금융 요약 정보 조회 오류:', error);
      throw error;
    }
  }

  // SSAFY API 연동을 위한 메서드들 (목업 데이터)
  async getSSAFYBankCodes(): Promise<any[]> {
    // SSAFY API 연동 전까지는 목업 데이터 반환
    return [
      { code: "001", name: "한국은행" },
      { code: "002", name: "산업은행" },
      { code: "003", name: "기업은행" },
      { code: "004", name: "국민은행" },
      { code: "005", name: "하나은행" },
      { code: "006", name: "신한은행" },
      { code: "007", name: "우리은행" },
      { code: "008", name: "농협은행" },
    ];
  }

  async getSSAFYDemandDepositProducts(): Promise<any[]> {
    // SSAFY API 연동 전까지는 목업 데이터 반환
    return [
      {
        product_code: "DD001",
        product_name: "SSAFY 수시입출금",
        bank_name: "신한은행",
        interest_rate: 2.5,
        min_amount: 1000,
        max_amount: 100000000,
        description: "SSAFY 학생 전용 수시입출금 상품"
      },
      {
        product_code: "DD002",
        product_name: "청년 수시입출금",
        bank_name: "KB국민은행",
        interest_rate: 2.8,
        min_amount: 1000,
        max_amount: 50000000,
        description: "청년을 위한 수시입출금 상품"
      }
    ];
  }

  async getSSAFYDepositProducts(): Promise<any[]> {
    // SSAFY API 연동 전까지는 목업 데이터 반환
    return [
      {
        product_code: "DEP001",
        product_name: "SSAFY 특별 예금",
        bank_name: "신한은행",
        interest_rate: 3.5,
        min_amount: 1000000,
        max_amount: 50000000,
        term_months: 12,
        description: "SSAFY 학생 전용 특별 예금 상품"
      },
      {
        product_code: "DEP002",
        product_name: "청년 예금",
        bank_name: "KB국민은행",
        interest_rate: 3.8,
        min_amount: 500000,
        max_amount: 30000000,
        term_months: 24,
        description: "청년을 위한 예금 상품"
      }
    ];
  }

  async getSSAFYSavingsProducts(): Promise<any[]> {
    // SSAFY API 연동 전까지는 목업 데이터 반환
    return [
      {
        product_code: "SAV001",
        product_name: "SSAFY 적금",
        bank_name: "신한은행",
        interest_rate: 4.2,
        min_amount: 100000,
        max_amount: 1000000,
        term_months: 24,
        description: "SSAFY 학생 전용 적금 상품"
      },
      {
        product_code: "SAV002",
        product_name: "청년 적금",
        bank_name: "KB국민은행",
        interest_rate: 4.5,
        min_amount: 50000,
        max_amount: 500000,
        term_months: 36,
        description: "청년을 위한 적금 상품"
      }
    ];
  }

  async getSSAFYLoanProducts(): Promise<any[]> {
    // SSAFY API 연동 전까지는 목업 데이터 반환
    return [
      {
        product_code: "LOAN001",
        product_name: "SSAFY 학생 대출",
        bank_name: "신한은행",
        interest_rate: 2.8,
        min_amount: 1000000,
        max_amount: 10000000,
        term_months: 36,
        description: "SSAFY 학생 전용 저금리 대출"
      },
      {
        product_code: "LOAN002",
        product_name: "청년 대출",
        bank_name: "KB국민은행",
        interest_rate: 3.2,
        min_amount: 500000,
        max_amount: 5000000,
        term_months: 24,
        description: "청년을 위한 대출 상품"
      }
    ];
  }

  getMockFinancialSummary(): FinancialSummary {
    return {
      total_balance: 2500000,
      total_assets: 3000000,
      total_liabilities: 500000,
      net_worth: 2500000,
      credit_score: {
        id: 1,
        score: 750,
        grade: "A",
        last_updated: new Date().toISOString(),
        credit_limit: 5000000,
        used_credit: 500000,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      accounts: [
        {
          id: 1,
          account_number: "123-456789",
          bank_name: "신한은행",
          account_type: "수시입출금",
          account_name: "SSAFY 학생 통장",
          balance: 1500000,
          currency: "KRW",
          is_active: true,
          created_date: new Date().toISOString(),
          last_transaction_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 2,
          account_number: "987-654321",
          bank_name: "KB국민은행",
          account_type: "예금",
          account_name: "저축 통장",
          balance: 1000000,
          currency: "KRW",
          is_active: true,
          created_date: new Date().toISOString(),
          last_transaction_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ],
      recent_transactions: [
        {
          id: 1,
          transaction_type: "입금",
          amount: 500000,
          balance_after: 1500000,
          description: "월급 입금",
          category: "수입",
          transaction_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
        }
      ],
      products: []
    };
  }

  // 사용자별 금융 요약 조회 (크로니클용)
  async getUserFinancialSummary(userId?: string): Promise<FinancialSummary> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(API_ENDPOINTS.FINANCIAL.SUMMARY, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        console.warn(`⚠️ 금융 요약 API 응답 오류: ${response.status}`);
        // 목업 데이터 반환
        return this.getMockFinancialSummary();
      }

      const data = await response.json();
      
      // 응답 데이터 검증
      if (!data || typeof data !== 'object') {
        console.warn('⚠️ 금융 요약 API 응답이 객체가 아님, 목업 데이터 반환');
        return this.getMockFinancialSummary();
      }

      return data;
    } catch (error) {
      console.error('❌ 사용자 금융 요약 조회 실패:', error);
      // 목업 데이터 반환
      return this.getMockFinancialSummary();
    }
  }

  // 최근 거래내역 조회 (크로니클용)
  async getRecentTransactions(limit: number = 10): Promise<Transaction[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_ENDPOINTS.FINANCIAL.TRANSACTIONS}?limit=${limit}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        console.warn(`⚠️ 거래내역 API 응답 오류: ${response.status}`);
        // 목업 데이터 반환
        return this.getMockFinancialSummary().recent_transactions;
      }

      const data = await response.json();
      
      // 응답 데이터 검증
      if (!data || !Array.isArray(data)) {
        console.warn('⚠️ 거래내역 API 응답이 배열이 아님, 목업 데이터 반환');
        return this.getMockFinancialSummary().recent_transactions;
      }

      return data;
    } catch (error) {
      console.error('❌ 최근 거래내역 조회 실패:', error);
      // 목업 데이터 반환
      return this.getMockFinancialSummary().recent_transactions;
    }
  }

  // 최근 거래내역 조회 (토큰 직접 전달)
  async getRecentTransactionsWithToken(token: string, limit: number = 10): Promise<Transaction[]> {
    try {
      const response = await fetch(`${API_ENDPOINTS.FINANCIAL.TRANSACTIONS}?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.warn(`⚠️ 거래내역 API 응답 오류: ${response.status}`);
        // 목업 데이터 반환
        return this.getMockFinancialSummary().recent_transactions;
      }

      const data = await response.json();
      
      // 응답 데이터 검증
      if (!data || !Array.isArray(data)) {
        console.warn('⚠️ 거래내역 API 응답이 배열이 아님, 목업 데이터 반환');
        return this.getMockFinancialSummary().recent_transactions;
      }

      return data;
    } catch (error) {
      console.error('❌ 최근 거래내역 조회 실패:', error);
      // 목업 데이터 반환
      return this.getMockFinancialSummary().recent_transactions;
    }
  }

  // 크레도 점수 계산
  calculateCredoScore(transactions: Transaction[] | undefined): number {
    try {
      let score = 100; // 기본 점수
      
      // 거래 내역이 없으면 기본 점수 반환
      if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
        console.log('⚠️ 거래내역이 없어서 기본 크레도 점수 반환:', score);
        return score;
      }

      // 최근 30일 거래 내역만 고려
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentTransactions = transactions.filter(tx => 
        new Date(tx.transaction_date) >= thirtyDaysAgo
      );

      // 거래 빈도에 따른 점수
      if (recentTransactions.length >= 10) score += 20;
      else if (recentTransactions.length >= 5) score += 10;
      else if (recentTransactions.length >= 1) score += 5;

      // 거래 금액에 따른 점수
      const totalAmount = recentTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
      if (totalAmount >= 1000000) score += 15;
      else if (totalAmount >= 500000) score += 10;
      else if (totalAmount >= 100000) score += 5;

      // 카테고리 다양성에 따른 점수
      const categories = new Set(recentTransactions.map(tx => tx.category));
      if (categories.size >= 5) score += 10;
      else if (categories.size >= 3) score += 5;

      // 점수 범위 제한 (0-150)
      return Math.max(0, Math.min(150, score));
    } catch (error) {
      console.error('❌ 크레도 점수 계산 실패:', error);
      return 100; // 오류 시 기본 점수 반환
    }
  }

  // 거래내역을 크로니클 활동으로 변환
  transactionToChronicleActivity(transaction: Transaction): any {
    return {
      type: 'payment' as const,
      title: this.getTransactionTitle(transaction),
      description: transaction.description,
      timestamp: transaction.transaction_date,
      rewards: {
        credo: this.calculateTransactionCredo(transaction),
      },
      amount: transaction.amount,
      location: transaction.category,
    };
  }

  // 거래 제목 생성
  private getTransactionTitle(transaction: Transaction): string {
    const amount = Math.abs(transaction.amount);
    const formattedAmount = amount.toLocaleString('ko-KR');
    
    if (transaction.transaction_type === '입금') {
      return `${transaction.category} 입금 ${formattedAmount}원`;
    } else if (transaction.transaction_type === '출금') {
      return `${transaction.category} 지출 ${formattedAmount}원`;
    } else {
      return `${transaction.category} ${formattedAmount}원`;
    }
  }

  // 거래별 크레도 점수 계산
  private calculateTransactionCredo(transaction: Transaction): number {
    let credo = 5; // 기본 크레도 점수
    
    // 거래 금액에 따른 보너스
    const amount = Math.abs(transaction.amount);
    if (amount >= 100000) credo += 3;
    else if (amount >= 50000) credo += 2;
    else if (amount >= 10000) credo += 1;
    
    // 거래 유형에 따른 보너스
    if (transaction.transaction_type === '입금') credo += 2;
    if (transaction.category === '수입') credo += 3;
    
    return credo;
  }

  // 사용자별 크레도 점수 조회
  async getUserCredoScore(userId?: string): Promise<number> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(API_ENDPOINTS.FINANCIAL.CREDO_SCORE, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.credo_score || 100;
    } catch (error) {
      console.error('❌ 사용자 크레도 점수 조회 실패:', error);
      // 거래내역을 기반으로 계산
      try {
        const transactions = await this.getRecentTransactions(50);
        return this.calculateCredoScore(transactions);
      } catch (calcError) {
        console.error('❌ 크레도 점수 계산도 실패:', calcError);
        return 100; // 기본 점수 반환
      }
    }
  }
}

export const financialService = new FinancialService();
