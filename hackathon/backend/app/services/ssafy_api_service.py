"""
SSAFY API 연동 서비스
모든 SSAFY API 엔드포인트와의 통신을 담당
"""

import requests
import json
import os
from datetime import datetime
from typing import Dict, Any, List, Optional
import logging

logger = logging.getLogger(__name__)

class SSAFYAPIService:
    """SSAFY API 연동 서비스"""
    
    def __init__(self):
        self.base_url = "https://finopenapi.ssafy.io/ssafy/api/v1"
        self.api_key = os.getenv("SSAFY_API_KEY", "1924d3d047eb472ab5a81df01977485c")
        self.institution_code = "00100"
        self.fintech_app_no = "001"
        
    def _generate_header(self, api_name: str, include_user_key: bool = False, user_key: str = None) -> Dict[str, Any]:
        """공통 헤더 생성"""
        now = datetime.now()
        
        header = {
            "apiName": api_name,
            "transmissionDate": now.strftime("%Y%m%d"),
            "transmissionTime": now.strftime("%H%M%S"),
            "institutionCode": self.institution_code,
            "fintechAppNo": self.fintech_app_no,
            "apiServiceCode": api_name,
            "institutionTransactionUniqueNo": f"{now.strftime('%Y%m%d%H%M%S')}{str(now.microsecond)[:6]}",
            "apiKey": self.api_key
        }
        
        if include_user_key and user_key:
            header["userKey"] = user_key
            
        return header
    
    def _make_request(self, endpoint: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """API 요청 실행"""
        try:
            url = f"{self.base_url}{endpoint}"
            print(f"🔍 SSAFY API 요청 시작: {url}")
            print(f"📤 요청 데이터: {json.dumps(payload, ensure_ascii=False, indent=2)}")
            
            response = requests.post(url, json=payload, timeout=30)
            print(f"📥 응답 상태: {response.status_code}")
            print(f"📥 응답 헤더: {dict(response.headers)}")
            
            if response.status_code != 200 and response.status_code != 201:
                print(f"❌ SSAFY API 오류 응답: {response.status_code}")
                print(f"❌ 오류 내용: {response.text}")
                error_detail = {
                    "status_code": response.status_code,
                    "response_text": response.text,
                    "endpoint": endpoint,
                    "url": url
                }
                logger.error(f"SSAFY API 오류 응답: {json.dumps(error_detail, ensure_ascii=False)}")
                raise Exception(f"SSAFY API 오류 응답: {response.status_code} - {response.text}")
            
            response_data = response.json()
            print(f"✅ SSAFY API 응답 성공: {json.dumps(response_data, ensure_ascii=False, indent=2)}")
            return response_data
            
        except requests.exceptions.Timeout as e:
            error_msg = f"SSAFY API 타임아웃: {endpoint}"
            print(f"⏰ {error_msg}")
            logger.error(error_msg)
            raise Exception(error_msg)
        except requests.exceptions.ConnectionError as e:
            error_msg = f"SSAFY API 연결 오류: {endpoint} - {str(e)}"
            print(f"🔌 {error_msg}")
            logger.error(error_msg)
            raise Exception(error_msg)
        except requests.exceptions.RequestException as e:
            error_msg = f"SSAFY API 요청 실패: {endpoint} - {str(e)}"
            print(f"❌ {error_msg}")
            logger.error(error_msg)
            raise Exception(error_msg)
        except json.JSONDecodeError as e:
            error_msg = f"SSAFY API 응답 JSON 파싱 실패: {endpoint} - {str(e)}"
            print(f"📝 {error_msg}")
            logger.error(error_msg)
            raise Exception(error_msg)
        except Exception as e:
            error_msg = f"SSAFY API 예상치 못한 오류: {endpoint} - {str(e)}"
            print(f"💥 {error_msg}")
            logger.error(error_msg)
            raise Exception(error_msg)
    
    # ==================== 관리자 API ====================
    
    def issue_api_key(self, manager_id: str) -> Dict[str, Any]:
        """앱 API KEY 발급"""
        payload = {
            "Header": self._generate_header("issuedApiKey"),
            "managerId": manager_id
        }
        return self._make_request("/edu/app/issuedApiKey", payload)
    
    def reissue_api_key(self, manager_id: str) -> Dict[str, Any]:
        """앱 API KEY 재발급"""
        payload = {
            "Header": self._generate_header("reIssuedApiKey"),
            "managerId": manager_id
        }
        return self._make_request("/edu/app/reIssuedApiKey", payload)
    
    # ==================== 사용자 계정 API ====================
    
    def create_user_account(self, user_id: str) -> Dict[str, Any]:
        """사용자 계정 생성"""
        payload = {
            "apiKey": self.api_key,
            "userId": user_id
        }
        return self._make_request("/member/", payload)
    
    def search_user_account(self, user_id: str) -> Dict[str, Any]:
        """사용자 계정 조회 (SSAFY 학생 인증용)"""
        payload = {
            "apiKey": self.api_key,
            "userId": user_id
        }
        return self._make_request("/member/search", payload)
    
    # ==================== 은행/상품 API ====================
    
    def get_bank_codes(self) -> Dict[str, Any]:
        """은행코드 조회"""
        payload = {
            "Header": self._generate_header("inquireBankCodes")
        }
        return self._make_request("/edu/bank/inquireBankCodes", payload)
    
    def get_currency_codes(self) -> Dict[str, Any]:
        """통화코드 조회"""
        payload = {
            "Header": self._generate_header("inquireBankCurrency")
        }
        return self._make_request("/edu/bank/inquireBankCurrency", payload)
    
    # ==================== 수시입출금 상품/계좌 API ====================
    
    def create_demand_deposit_product(self, bank_code: str, account_name: str, account_description: str = None) -> Dict[str, Any]:
        """수시입출금 상품등록"""
        payload = {
            "Header": self._generate_header("createDemandDeposit"),
            "bankCode": bank_code,
            "accountName": account_name,
            "accountDescription": account_description
        }
        return self._make_request("/edu/demandDeposit/createDemandDeposit", payload)
    
    def get_demand_deposit_products(self) -> Dict[str, Any]:
        """수시입출금 상품 조회"""
        payload = {
            "Header": self._generate_header("inquireDemandDepositList")
        }
        return self._make_request("/edu/demandDeposit/inquireDemandDepositList", payload)
    
    def create_demand_deposit_account(self, account_type_unique_no: str, user_key: str) -> Dict[str, Any]:
        """수시입출금 계좌 생성"""
        payload = {
            "Header": self._generate_header("createDemandDepositAccount", True, user_key),
            "accountTypeUniqueNo": account_type_unique_no
        }
        return self._make_request("/edu/demandDeposit/createDemandDepositAccount", payload)
    
    def get_demand_deposit_accounts(self, user_key: str) -> Dict[str, Any]:
        """수시입출금 계좌 목록 조회"""
        payload = {
            "Header": self._generate_header("inquireDemandDepositAccountList", True, user_key)
        }
        return self._make_request("/edu/demandDeposit/inquireDemandDepositAccountList", payload)
    
    def get_demand_deposit_account(self, account_no: str, user_key: str) -> Dict[str, Any]:
        """수시입출금 계좌 조회(단건)"""
        payload = {
            "Header": self._generate_header("inquireDemandDepositAccount", True, user_key),
            "accountNo": account_no
        }
        return self._make_request("/edu/demandDeposit/inquireDemandDepositAccount", payload)
    
    def get_account_holder_name(self, account_no: str, user_key: str) -> Dict[str, Any]:
        """예금주 조회"""
        payload = {
            "Header": self._generate_header("inquireDemandDepositAccountHolderName", True, user_key),
            "accountNo": account_no
        }
        return self._make_request("/edu/demandDeposit/inquireDemandDepositAccountHolderName", payload)
    
    def get_account_balance(self, account_no: str, user_key: str) -> Dict[str, Any]:
        """계좌 잔액 조회"""
        payload = {
            "Header": self._generate_header("inquireDemandDepositAccountBalance", True, user_key),
            "accountNo": account_no
        }
        return self._make_request("/edu/demandDeposit/inquireDemandDepositAccountBalance", payload)
    
    def withdraw_from_account(self, account_no: str, amount: int, summary: str, user_key: str) -> Dict[str, Any]:
        """계좌 출금"""
        payload = {
            "Header": self._generate_header("updateDemandDepositAccountWithdrawal", True, user_key),
            "accountNo": account_no,
            "transactionBalance": str(amount),
            "transactionSummary": summary
        }
        return self._make_request("/edu/demandDeposit/updateDemandDepositAccountWithdrawal", payload)
    
    def deposit_to_account(self, account_no: str, amount: int, summary: str, user_key: str) -> Dict[str, Any]:
        """계좌 입금"""
        payload = {
            "Header": self._generate_header("updateDemandDepositAccountDeposit", True, user_key),
            "accountNo": account_no,
            "transactionBalance": str(amount),
            "transactionSummary": summary
        }
        return self._make_request("/edu/demandDeposit/updateDemandDepositAccountDeposit", payload)
    
    def transfer_between_accounts(self, from_account: str, to_account: str, amount: int, user_key: str) -> Dict[str, Any]:
        """계좌 이체"""
        payload = {
            "Header": self._generate_header("updateDemandDepositAccountTransfer", True, user_key),
            "withdrawalAccountNo": from_account,
            "depositAccountNo": to_account,
            "transactionBalance": str(amount),
            "withdrawalTransactionSummary": "(수시입출금) : 출금(이체)",
            "depositTransactionSummary": "(수시입출금) : 입금(이체)"
        }
        return self._make_request("/edu/demandDeposit/updateDemandDepositAccountTransfer", payload)
    
    def update_transfer_limit(self, account_no: str, one_time_limit: int, daily_limit: int, user_key: str) -> Dict[str, Any]:
        """이체한도변경"""
        payload = {
            "Header": self._generate_header("updateTransferLimit", True, user_key),
            "accountNo": account_no,
            "oneTimeTransferLimit": str(one_time_limit),
            "dailyTransferLimit": str(daily_limit)
        }
        return self._make_request("/edu/demandDeposit/updateTransferLimit", payload)
    
    def get_transaction_history(self, account_no: str, start_date: str, end_date: str, 
                               transaction_type: str = "A", order_by: str = "ASC", user_key: str = None) -> Dict[str, Any]:
        """계좌거래내역조회"""
        payload = {
            "Header": self._generate_header("inquireTransactionHistoryList", True, user_key),
            "accountNo": account_no,
            "startDate": start_date,
            "endDate": end_date,
            "transactionType": transaction_type,
            "orderByType": order_by
        }
        return self._make_request("/edu/demandDeposit/inquireTransactionHistoryList", payload)
    
    def get_single_transaction(self, account_no: str, transaction_unique_no: str, user_key: str) -> Dict[str, Any]:
        """계좌거래내역조회(단건)"""
        payload = {
            "Header": self._generate_header("inquireTransactionHistory", True, user_key),
            "accountNo": account_no,
            "transactionUniqueNo": transaction_unique_no
        }
        return self._make_request("/edu/demandDeposit/inquireTransactionHistory", payload)
    
    def close_demand_deposit_account(self, account_no: str, refund_account_no: str, user_key: str) -> Dict[str, Any]:
        """수시입출금 계좌해지"""
        payload = {
            "Header": self._generate_header("deleteDemandDepositAccount", True, user_key),
            "accountNo": account_no,
            "refundAccountNo": refund_account_no
        }
        return self._make_request("/edu/demandDeposit/deleteDemandDepositAccount", payload)
    
    # ==================== 예금 상품/계좌 API ====================
    
    def create_deposit_product(self, bank_code: str, account_name: str, subscription_period: int,
                              min_balance: int, max_balance: int, interest_rate: float,
                              account_description: str = None, rate_description: str = None) -> Dict[str, Any]:
        """예금상품등록"""
        payload = {
            "Header": self._generate_header("createDepositProduct"),
            "bankCode": bank_code,
            "accountName": account_name,
            "accountDescription": account_description,
            "subscriptionPeriod": str(subscription_period),
            "minSubscriptionBalance": str(min_balance),
            "maxSubscriptionBalance": str(max_balance),
            "interestRate": str(interest_rate),
            "rateDescription": rate_description
        }
        return self._make_request("/edu/deposit/createDepositProduct", payload)
    
    def get_deposit_products(self) -> Dict[str, Any]:
        """예금상품조회"""
        payload = {
            "Header": self._generate_header("inquireDepositProducts")
        }
        return self._make_request("/edu/deposit/inquireDepositProducts", payload)
    
    def create_deposit_account(self, withdrawal_account_no: str, account_type_unique_no: str, 
                              deposit_balance: int, user_key: str) -> Dict[str, Any]:
        """예금계좌생성"""
        payload = {
            "Header": self._generate_header("createDepositAccount", True, user_key),
            "withdrawalAccountNo": withdrawal_account_no,
            "accountTypeUniqueNo": account_type_unique_no,
            "depositBalance": str(deposit_balance)
        }
        return self._make_request("/edu/deposit/createDepositAccount", payload)
    
    def get_deposit_accounts(self, user_key: str) -> Dict[str, Any]:
        """예금계좌목록조회"""
        payload = {
            "Header": self._generate_header("inquireDepositInfoList", True, user_key)
        }
        return self._make_request("/edu/deposit/inquireDepositInfoList", payload)
    
    def get_deposit_account_detail(self, account_no: str, user_key: str) -> Dict[str, Any]:
        """예금계좌조회(단건)"""
        payload = {
            "Header": self._generate_header("inquireDepositInfoDetail", True, user_key),
            "accountNo": account_no
        }
        return self._make_request("/edu/deposit/inquireDepositInfoDetail", payload)
    
    def get_deposit_payment(self, account_no: str, user_key: str) -> Dict[str, Any]:
        """예금납입상세조회"""
        payload = {
            "Header": self._generate_header("inquireDepositPayment", True, user_key),
            "accountNo": account_no
        }
        return self._make_request("/edu/deposit/inquireDepositPayment", payload)
    
    def get_deposit_expiry_interest(self, account_no: str, user_key: str) -> Dict[str, Any]:
        """예금만기이자조회"""
        payload = {
            "Header": self._generate_header("inquireDepositExpiryInterest", True, user_key),
            "accountNo": account_no
        }
        return self._make_request("/edu/deposit/inquireDepositExpiryInterest", payload)
    
    def get_deposit_early_termination_interest(self, account_no: str, user_key: str) -> Dict[str, Any]:
        """예금중도해지이자조회"""
        payload = {
            "Header": self._generate_header("inquireDepositEarlyTerminationInterest", True, user_key),
            "accountNo": account_no
        }
        return self._make_request("/edu/deposit/inquireDepositEarlyTerminationInterest", payload)
    
    def close_deposit_account(self, account_no: str, user_key: str) -> Dict[str, Any]:
        """예금계좌해지"""
        payload = {
            "Header": self._generate_header("deleteDepositAccount", True, user_key),
            "accountNo": account_no
        }
        return self._make_request("/edu/deposit/deleteDepositAccount", payload)
    
    # ==================== 적금 상품/계좌 API ====================
    
    def create_savings_product(self, bank_code: str, account_name: str, subscription_period: int,
                              min_balance: int, max_balance: int, interest_rate: float,
                              account_description: str = None, rate_description: str = None) -> Dict[str, Any]:
        """적금상품등록"""
        payload = {
            "Header": self._generate_header("createProduct"),
            "bankCode": bank_code,
            "accountName": account_name,
            "accountDescription": account_description,
            "subscriptionPeriod": str(subscription_period),
            "minSubscriptionBalance": str(min_balance),
            "maxSubscriptionBalance": str(max_balance),
            "interestRate": str(interest_rate),
            "rateDescription": rate_description
        }
        return self._make_request("/edu/savings/createProduct", payload)
    
    def get_savings_products(self) -> Dict[str, Any]:
        """적금상품조회"""
        payload = {
            "Header": self._generate_header("inquireSavingsProducts")
        }
        return self._make_request("/edu/savings/inquireSavingsProducts", payload)
    
    def create_savings_account(self, account_type_unique_no: str, deposit_balance: int,
                              withdrawal_account_no: str, user_key: str) -> Dict[str, Any]:
        """적금계좌생성"""
        payload = {
            "Header": self._generate_header("createAccount", True, user_key),
            "accountTypeUniqueNo": account_type_unique_no,
            "depositBalance": str(deposit_balance),
            "withdrawalAccountNo": withdrawal_account_no
        }
        return self._make_request("/edu/savings/createAccount", payload)
    
    def get_savings_accounts(self, user_key: str) -> Dict[str, Any]:
        """적금계좌목록조회"""
        payload = {
            "Header": self._generate_header("inquireAccountList", True, user_key)
        }
        return self._make_request("/edu/savings/inquireAccountList", payload)
    
    def get_savings_account(self, account_no: str, user_key: str) -> Dict[str, Any]:
        """적금계좌조회(단건)"""
        payload = {
            "Header": self._generate_header("inquireAccount", True, user_key),
            "accountNo": account_no
        }
        return self._make_request("/edu/savings/inquireAccount", payload)
    
    def get_savings_payment(self, account_no: str, user_key: str) -> Dict[str, Any]:
        """적금납입회차조회"""
        payload = {
            "Header": self._generate_header("inquirePayment", True, user_key),
            "accountNo": account_no
        }
        return self._make_request("/edu/savings/inquirePayment", payload)
    
    def get_savings_expiry_interest(self, account_no: str, user_key: str) -> Dict[str, Any]:
        """적금만기이자조회"""
        payload = {
            "Header": self._generate_header("inquireExpiryInterest", True, user_key),
            "accountNo": account_no
        }
        return self._make_request("/edu/savings/inquireExpiryInterest", payload)
    
    def get_savings_early_termination_interest(self, account_no: str, user_key: str) -> Dict[str, Any]:
        """적금중도해지이자조회"""
        payload = {
            "Header": self._generate_header("inquireEarlyTerminationInterest", True, user_key),
            "accountNo": account_no
        }
        return self._make_request("/edu/savings/inquireEarlyTerminationInterest", payload)
    
    def close_savings_account(self, account_no: str, user_key: str) -> Dict[str, Any]:
        """적금계좌해지"""
        payload = {
            "Header": self._generate_header("deleteAccount", True, user_key),
            "accountNo": account_no
        }
        return self._make_request("/edu/savings/deleteAccount", payload)
    
    # ==================== 대출 상품/심사/계좌 API ====================
    
    def get_credit_rating_criteria(self) -> Dict[str, Any]:
        """신용등급 기준 조회"""
        payload = {
            "Header": self._generate_header("inquireAssetBasedCreditRatingList")
        }
        return self._make_request("/edu/loan/inquireAssetBasedCreditRatingList", payload)
    
    def create_loan_product(self, bank_code: str, account_name: str, rating_unique_no: str,
                           loan_period: int, min_balance: int, max_balance: int, interest_rate: float,
                           account_description: str = None) -> Dict[str, Any]:
        """대출 상품 등록"""
        payload = {
            "Header": self._generate_header("createLoanProduct"),
            "bankCode": bank_code,
            "accountName": account_name,
            "accountDescription": account_description,
            "ratingUniqueNo": rating_unique_no,
            "loanPeriod": str(loan_period),
            "minLoanBalance": str(min_balance),
            "maxLoanBalance": str(max_balance),
            "interestRate": str(interest_rate)
        }
        return self._make_request("/edu/loan/createLoanProduct", payload)
    
    def get_loan_products(self) -> Dict[str, Any]:
        """대출 상품 조회"""
        payload = {
            "Header": self._generate_header("inquireLoanProductList")
        }
        return self._make_request("/edu/loan/inquireLoanProductList", payload)
    
    def get_my_credit_rating(self, user_key: str) -> Dict[str, Any]:
        """내 신용등급 조회"""
        payload = {
            "Header": self._generate_header("inquireMyCreditRating", True, user_key)
        }
        return self._make_request("/edu/loan/inquireMyCreditRating", payload)
    
    def create_loan_application(self, account_type_unique_no: str, user_key: str) -> Dict[str, Any]:
        """대출심사 신청"""
        payload = {
            "Header": self._generate_header("createLoanApplication", True, user_key),
            "accountTypeUniqueNo": account_type_unique_no
        }
        return self._make_request("/edu/loan/createLoanApplication", payload)
    
    def get_loan_applications(self, user_key: str) -> Dict[str, Any]:
        """대출심사 목록 조회"""
        payload = {
            "Header": self._generate_header("inquireLoanApplicationList", True, user_key)
        }
        return self._make_request("/edu/loan/inquireLoanApplicationList", payload)
    
    def create_loan_account(self, account_type_unique_no: str, loan_balance: int,
                           withdrawal_account_no: str, user_key: str) -> Dict[str, Any]:
        """대출 상품 가입"""
        payload = {
            "Header": self._generate_header("createLoanAccount", True, user_key),
            "accountTypeUniqueNo": account_type_unique_no,
            "loanBalance": str(loan_balance),
            "withdrawalAccountNo": withdrawal_account_no
        }
        return self._make_request("/edu/loan/createLoanAccount", payload)
    
    def get_loan_accounts(self, user_key: str) -> Dict[str, Any]:
        """대출 상품 가입 목록 조회"""
        payload = {
            "Header": self._generate_header("inquireLoanAccountList", True, user_key)
        }
        return self._make_request("/edu/loan/inquireLoanAccountList", payload)
    
    def get_repayment_records(self, account_no: str, user_key: str) -> Dict[str, Any]:
        """대출 상환 내역 조회"""
        payload = {
            "Header": self._generate_header("inquireRepaymentRecords", True, user_key),
            "accountNo": account_no
        }
        return self._make_request("/edu/loan/inquireRepaymentRecords", payload)
    
    def repay_loan_in_full(self, account_no: str, user_key: str) -> Dict[str, Any]:
        """대출 일시납 상환"""
        payload = {
            "Header": self._generate_header("updateRepaymentLoanBalanceInFull", True, user_key),
            "accountNo": account_no
        }
        return self._make_request("/edu/loan/updateRepaymentLoanBalanceInFull", payload)
    
    # ==================== 계좌 인증 API ====================
    
    def open_account_auth(self, account_no: str, auth_text: str, user_key: str) -> Dict[str, Any]:
        """1원 송금 (계좌 인증)"""
        payload = {
            "Header": self._generate_header("openAccountAuth", True, user_key),
            "accountNo": account_no,
            "authText": auth_text
        }
        return self._make_request("/edu/accountAuth/openAccountAuth", payload)
    
    def check_auth_code(self, account_no: str, auth_text: str, auth_code: str, user_key: str) -> Dict[str, Any]:
        """1원 송금 검증"""
        payload = {
            "Header": self._generate_header("checkAuthCode", True, user_key),
            "accountNo": account_no,
            "authText": auth_text,
            "authCode": auth_code
        }
        return self._make_request("/edu/accountAuth/checkAuthCode", payload)
    
    # ==================== 거래 메모 API ====================
    
    def add_transaction_memo(self, account_no: str, transaction_unique_no: str, 
                            transaction_memo: str, user_key: str) -> Dict[str, Any]:
        """거래내역 메모"""
        payload = {
            "Header": self._generate_header("transactionMemo", True, user_key),
            "accountNo": account_no,
            "transactionUniqueNo": transaction_unique_no,
            "transactionMemo": transaction_memo
        }
        return self._make_request("/edu/transactionMemo", payload)
    
    # ==================== 편의 메서드 ====================
    
    def verify_ssafy_student(self, email: str) -> Dict[str, Any]:
        """SSAFY 학생 인증 (편의 메서드)"""
        try:
            print(f"🔍 SSAFY 학생 이메일 검증 시작: {email}")
            
            result = self.search_user_account(email)
            print(f"✅ SSAFY 학생 검증 성공: {email}")
            
            return {
                "is_valid": True,
                "student_info": result,
                "email": email,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            error_detail = {
                "error_type": type(e).__name__,
                "error_message": str(e),
                "email": email,
                "timestamp": datetime.now().isoformat()
            }
            
            print(f"❌ SSAFY 학생 이메일 검증 실패: {email}")
            print(f"❌ 에러 상세: {json.dumps(error_detail, ensure_ascii=False, indent=2)}")
            
            logger.error(f"SSAFY 학생 이메일 검증 실패: {json.dumps(error_detail, ensure_ascii=False)}")
            
            return {
                "is_valid": False,
                "error": error_detail,
                "email": email,
                "timestamp": datetime.now().isoformat()
            }
    
    def get_user_financial_summary(self, user_key: str) -> Dict[str, Any]:
        """사용자 금융 현황 요약 (편의 메서드)"""
        try:
            summary = {}
            
            # 수시입출금 계좌 정보
            try:
                demand_accounts = self.get_demand_deposit_accounts(user_key)
                summary["demand_deposit"] = demand_accounts
            except:
                summary["demand_deposit"] = {"error": "조회 실패"}
            
            # 예금 계좌 정보
            try:
                deposit_accounts = self.get_deposit_accounts(user_key)
                summary["deposit"] = deposit_accounts
            except:
                summary["deposit"] = {"error": "조회 실패"}
            
            # 적금 계좌 정보
            try:
                savings_accounts = self.get_savings_accounts(user_key)
                summary["savings"] = savings_accounts
            except:
                summary["savings"] = {"error": "조회 실패"}
            
            # 대출 계좌 정보
            try:
                loan_accounts = self.get_loan_accounts(user_key)
                summary["loan"] = loan_accounts
            except:
                summary["loan"] = {"error": "조회 실패"}
            
            # 신용등급
            try:
                credit_rating = self.get_my_credit_rating(user_key)
                summary["credit_rating"] = credit_rating
            except:
                summary["credit_rating"] = {"error": "조회 실패"}
            
            return summary
            
        except Exception as e:
            return {"error": f"금융 현황 조회 실패: {str(e)}"}
    
    def get_recent_transactions(self, user_key: str, days: int = 30) -> List[Dict[str, Any]]:
        """최근 거래내역 조회 (편의 메서드)"""
        try:
            from datetime import timedelta
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days)
            
            # 모든 수시입출금 계좌의 거래내역 조회
            accounts = self.get_demand_deposit_accounts(user_key)
            all_transactions = []
            
            if accounts.get("dataSearch", {}).get("content"):
                for account in accounts["dataSearch"]["content"]:
                    account_no = account.get("accountNo")
                    if account_no:
                        try:
                            transactions = self.get_transaction_history(
                                account_no, 
                                start_date.strftime("%Y%m%d"), 
                                end_date.strftime("%Y%m%d"), 
                                "A", "DESC", user_key
                            )
                            if transactions.get("dataSearch", {}).get("content"):
                                all_transactions.extend(transactions["dataSearch"]["content"])
                        except:
                            continue
            
            # 날짜순으로 정렬
            all_transactions.sort(key=lambda x: x.get("transactionDate", ""), reverse=True)
            return all_transactions[:100]  # 최대 100개
            
        except Exception as e:
            return [{"error": f"거래내역 조회 실패: {str(e)}"}]
