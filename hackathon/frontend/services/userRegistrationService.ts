/**
 * 사용자 회원가입 및 계좌 생성 서비스
 * 백엔드 API와 연동하여 회원가입과 동시에 계좌 생성
 */

import { API_BASE_URL } from '../config/api';

export interface UserRegistrationData {
  email: string;
  password: string;
  name: string;
  student_id?: string;
  university?: string;
  preferred_bank?: string;
}

export interface UserRegistrationResponse {
  success: boolean;
  user_id: string;
  user_key: string;
  account_no: string;
  account_name: string;
  bank_name: string;
  welcome_amount: number;
  message: string;
}

export interface AccountStatus {
  success: boolean;
  user_key: string;
  accounts: {
    demand_deposit: number;
    deposit: number;
    savings: number;
    loan: number;
  };
  account_details: Array<{
    account_no: string;
    account_name: string;
    account_type: string;
    balance: number;
    currency: string;
  }>;
  total_balance: number;
  credit_score: number;
  credit_grade: string;
}

export interface FinancialProduct {
  accountTypeUniqueNo: string;
  accountName: string;
  bankCode: string;
  bankName: string;
  description: string;
}

export interface AvailableProducts {
  success: boolean;
  products: {
    demand_deposit: FinancialProduct[];
    deposit: FinancialProduct[];
    savings: FinancialProduct[];
    loan: FinancialProduct[];
  };
  total_count: {
    demand_deposit: number;
    deposit: number;
    savings: number;
    loan: number;
  };
}

class UserRegistrationService {
  private baseUrl = `${API_BASE_URL}/registration`;

  /**
   * 회원가입과 동시에 계좌 생성
   */
  async registerWithAccount(data: UserRegistrationData): Promise<UserRegistrationResponse> {
    try {
      const params = new URLSearchParams();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value);
        }
      });

      const response = await fetch(`${this.baseUrl}/register-with-account?${params}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('회원가입 및 계좌 생성 실패:', error);
      throw error;
    }
  }

  /**
   * 사용자 계좌 상태 확인
   */
  async checkAccountStatus(userKey: string): Promise<AccountStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/check-account-status?user_key=${userKey}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('계좌 상태 확인 실패:', error);
      throw error;
    }
  }

  /**
   * 추가 계좌 생성 (예금, 적금, 대출)
   */
  async createAdditionalAccount(
    userKey: string,
    accountType: 'deposit' | 'savings' | 'loan',
    productId: string,
    amount: number
  ): Promise<any> {
    try {
      const params = new URLSearchParams({
        user_key: userKey,
        account_type: accountType,
        product_id: productId,
        amount: amount.toString(),
      });

      const response = await fetch(`${this.baseUrl}/create-additional-account?${params}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('추가 계좌 생성 실패:', error);
      throw error;
    }
  }

  /**
   * 사용 가능한 금융 상품 목록 조회
   */
  async getAvailableProducts(): Promise<AvailableProducts> {
    try {
      const response = await fetch(`${this.baseUrl}/available-products`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('상품 목록 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 은행별 상품 필터링
   */
  getProductsByBank(products: AvailableProducts, bankCode: string): FinancialProduct[] {
    return products.products.demand_deposit.filter(
      product => product.bankCode === bankCode
    );
  }

  /**
   * 상품 타입별 필터링
   */
  getProductsByType(products: AvailableProducts, type: keyof AvailableProducts['products']): FinancialProduct[] {
    return products.products[type] || [];
  }

  /**
   * 상품 검색 (이름 또는 설명으로)
   */
  searchProducts(products: AvailableProducts, keyword: string): FinancialProduct[] {
    const allProducts = [
      ...products.products.demand_deposit,
      ...products.products.deposit,
      ...products.products.savings,
      ...products.products.loan,
    ];

    return allProducts.filter(product =>
      product.accountName.toLowerCase().includes(keyword.toLowerCase()) ||
      product.description.toLowerCase().includes(keyword.toLowerCase())
    );
  }
}

export default new UserRegistrationService();
