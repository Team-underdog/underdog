"""
SSAFY API 연동 API 엔드포인트
모든 SSAFY API 기능을 REST API로 제공
"""

from fastapi import APIRouter, HTTPException, Depends, Query, Body
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import logging

from ..services.ssafy_api_service import SSAFYAPIService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ssafy", tags=["SSAFY API Integration"])

# SSAFY API 서비스 인스턴스
ssafy_service = SSAFYAPIService()

# ==================== 학생 인증 API ====================

@router.post("/verify-student")
async def verify_ssafy_student(email: str = Body(..., embed=True)):
    """SSAFY 학생 이메일 검증"""
    try:
        print(f"🔍 SSAFY API로 학생 이메일 검증 시작: {email}")
        
        result = ssafy_service.verify_ssafy_student(email)
        
        if result.get("is_valid"):
            print(f"✅ SSAFY 학생 검증 성공: {email}")
            return {
                "success": True,
                "data": result,
                "message": "SSAFY 학생 인증 성공"
            }
        else:
            print(f"❌ SSAFY 학생 검증 실패: {email}")
            error_detail = result.get("error", {})
            return {
                "success": False,
                "data": result,
                "message": "SSAFY 학생 인증 실패",
                "error": error_detail
            }
            
    except Exception as e:
        error_detail = {
            "error_type": type(e).__name__,
            "error_message": str(e),
            "email": email,
            "timestamp": datetime.now().isoformat()
        }
        
        print(f"❌ SSAFY API 호출 실패: {email}")
        print(f"❌ 에러 상세: {error_detail}")
        
        logger.error(f"SSAFY API 호출 실패: {error_detail}")
        
        raise HTTPException(
            status_code=500, 
            detail={
                "message": "SSAFY API 호출 실패",
                "error": error_detail
            }
        )

@router.post("/verify-ssafy-email")
async def verify_ssafy_email(email: str = Body(..., embed=True)):
    """SSAFY 학생 이메일 검증 (프론트엔드 호환성)"""
    try:
        print(f"🔍 SSAFY API로 학생 이메일 검증 시작: {email}")
        
        result = ssafy_service.verify_ssafy_student(email)
        
        if result.get("is_valid"):
            print(f"✅ SSAFY 학생 검증 성공: {email}")
            return {
                "success": True,
                "data": result,
                "message": "SSAFY 학생 인증 성공"
            }
        else:
            print(f"❌ SSAFY 학생 검증 실패: {email}")
            error_detail = result.get("error", {})
            return {
                "success": False,
                "data": result,
                "message": "SSAFY 학생 인증 실패",
                "error": error_detail
            }
            
    except Exception as e:
        error_detail = {
            "error_type": type(e).__name__,
            "error_message": str(e),
            "email": email,
            "timestamp": datetime.now().isoformat()
        }
        
        print(f"❌ SSAFY API 호출 실패: {email}")
        print(f"❌ 에러 상세: {error_detail}")
        
        logger.error(f"SSAFY API 호출 실패: {error_detail}")
        
        raise HTTPException(
            status_code=500, 
            detail={
                "message": "SSAFY API 호출 실패",
                "error": error_detail
            }
        )

@router.post("/create-ssafy-account")
async def create_ssafy_account(email: str = Body(..., embed=True)):
    """SSAFY 계정 생성 (신규 가입시)"""
    try:
        print(f"🏭 SSAFY API로 계정 생성 시작: {email}")
        
        result = ssafy_service.create_user_account(email)
        
        print(f"✅ SSAFY 계정 생성 성공: {email}")
        print(f"✅ 생성된 계정 정보: {result}")
        
        return {
            "success": True,
            "data": result,
            "message": "SSAFY 계정 생성 성공",
            "user_key": result.get("userKey") if isinstance(result, dict) else None
        }
            
    except Exception as e:
        error_detail = {
            "error_type": type(e).__name__,
            "error_message": str(e),
            "email": email,
            "timestamp": datetime.now().isoformat()
        }
        
        print(f"❌ SSAFY 계정 생성 실패: {email}")
        print(f"❌ 에러 상세: {error_detail}")
        
        logger.error(f"SSAFY 계정 생성 실패: {error_detail}")
        
        raise HTTPException(
            status_code=500, 
            detail={
                "message": "SSAFY 계정 생성 실패",
                "error": error_detail
            }
        )

@router.get("/integration-status")
async def get_ssafy_integration_status():
    """SSAFY API 통합 상태 확인"""
    try:
        print("🔍 SSAFY API 통합 상태 확인 시작")
        
        # 간단한 API 호출로 상태 확인
        bank_codes = ssafy_service.get_bank_codes()
        
        print("✅ SSAFY API 통합 상태 확인 성공")
        return {
            "success": True,
            "status": "connected",
            "message": "SSAFY API 연동 정상",
            "timestamp": datetime.now().isoformat(),
            "api_info": {
                "base_url": ssafy_service.base_url,
                "institution_code": ssafy_service.institution_code,
                "fintech_app_no": ssafy_service.fintech_app_no
            }
        }
            
    except Exception as e:
        error_detail = {
            "error_type": type(e).__name__,
            "error_message": str(e),
            "timestamp": datetime.now().isoformat()
        }
        
        print(f"❌ SSAFY API 통합 상태 확인 실패")
        print(f"❌ 에러 상세: {error_detail}")
        
        logger.error(f"SSAFY API 통합 상태 확인 실패: {error_detail}")
        
        return {
            "success": False,
            "status": "disconnected",
            "message": f"SSAFY API 연동 오류: {str(e)}",
            "timestamp": datetime.now().isoformat(),
            "error": error_detail
        }

# ==================== 은행/상품 정보 API ====================

@router.get("/bank-codes")
async def get_bank_codes():
    """은행코드 조회"""
    try:
        result = ssafy_service.get_bank_codes()
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        logger.error(f"은행코드 조회 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=f"은행코드 조회 실패: {str(e)}")

@router.get("/currency-codes")
async def get_currency_codes():
    """통화코드 조회"""
    try:
        result = ssafy_service.get_currency_codes()
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        logger.error(f"통화코드 조회 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=f"통화코드 조회 실패: {str(e)}")

# ==================== 수시입출금 상품/계좌 API ====================

@router.get("/demand-deposit/products")
async def get_demand_deposit_products():
    """수시입출금 상품 조회"""
    try:
        result = ssafy_service.get_demand_deposit_products()
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        logger.error(f"수시입출금 상품 조회 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=f"상품 조회 실패: {str(e)}")

@router.post("/demand-deposit/products")
async def create_demand_deposit_product(
    bank_code: str,
    account_name: str,
    account_description: str = None
):
    """수시입출금 상품 등록"""
    try:
        result = ssafy_service.create_demand_deposit_product(
            bank_code, account_name, account_description
        )
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        logger.error(f"수시입출금 상품 등록 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=f"상품 등록 실패: {str(e)}")

@router.get("/demand-deposit/accounts")
async def get_demand_deposit_accounts(user_key: str):
    """수시입출금 계좌 목록 조회"""
    try:
        result = ssafy_service.get_demand_deposit_accounts(user_key)
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        logger.error(f"수시입출금 계좌 조회 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=f"계좌 조회 실패: {str(e)}")

@router.get("/demand-deposit/accounts/{account_no}")
async def get_demand_deposit_account(account_no: str, user_key: str):
    """수시입출금 계좌 조회(단건)"""
    try:
        result = ssafy_service.get_demand_deposit_account(account_no, user_key)
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        logger.error(f"수시입출금 계좌 조회 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=f"계좌 조회 실패: {str(e)}")

@router.get("/demand-deposit/accounts/{account_no}/balance")
async def get_account_balance(account_no: str, user_key: str):
    """계좌 잔액 조회"""
    try:
        result = ssafy_service.get_account_balance(account_no, user_key)
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        logger.error(f"계좌 잔액 조회 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=f"잔액 조회 실패: {str(e)}")

@router.get("/demand-deposit/accounts/{account_no}/transactions")
async def get_transaction_history(
    account_no: str,
    user_key: str,
    start_date: str = None,
    end_date: str = None,
    transaction_type: str = "A",
    order_by: str = "DESC"
):
    """계좌 거래내역 조회"""
    try:
        if not start_date:
            start_date = (datetime.now() - timedelta(days=30)).strftime("%Y%m%d")
        if not end_date:
            end_date = datetime.now().strftime("%Y%m%d")
            
        result = ssafy_service.get_transaction_history(
            account_no, start_date, end_date, transaction_type, order_by, user_key
        )
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        logger.error(f"거래내역 조회 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=f"거래내역 조회 실패: {str(e)}")

@router.post("/demand-deposit/accounts/{account_no}/withdraw")
async def withdraw_from_account(
    account_no: str,
    amount: int,
    summary: str,
    user_key: str
):
    """계좌 출금"""
    try:
        result = ssafy_service.withdraw_from_account(account_no, amount, summary, user_key)
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        logger.error(f"계좌 출금 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=f"출금 실패: {str(e)}")

@router.post("/demand-deposit/accounts/{account_no}/deposit")
async def deposit_to_account(
    account_no: str,
    amount: int,
    summary: str,
    user_key: str
):
    """계좌 입금"""
    try:
        result = ssafy_service.deposit_to_account(account_no, amount, summary, user_key)
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        logger.error(f"계좌 입금 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=f"입금 실패: {str(e)}")

@router.post("/demand-deposit/transfer")
async def transfer_between_accounts(
    from_account: str,
    to_account: str,
    amount: int,
    user_key: str
):
    """계좌 이체"""
    try:
        result = ssafy_service.transfer_between_accounts(from_account, to_account, amount, user_key)
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        logger.error(f"계좌 이체 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=f"이체 실패: {str(e)}")

# ==================== 예금 상품/계좌 API ====================

@router.get("/deposit/products")
async def get_deposit_products():
    """예금 상품 조회"""
    try:
        result = ssafy_service.get_deposit_products()
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        logger.error(f"예금 상품 조회 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=f"예금 상품 조회 실패: {str(e)}")

@router.post("/deposit/products")
async def create_deposit_product(
    bank_code: str,
    account_name: str,
    subscription_period: int,
    min_balance: int,
    max_balance: int,
    interest_rate: float,
    account_description: str = None,
    rate_description: str = None
):
    """예금 상품 등록"""
    try:
        result = ssafy_service.create_deposit_product(
            bank_code, account_name, subscription_period, min_balance, 
            max_balance, interest_rate, account_description, rate_description
        )
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        logger.error(f"예금 상품 등록 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=f"예금 상품 등록 실패: {str(e)}")

@router.get("/deposit/accounts")
async def get_deposit_accounts(user_key: str):
    """예금 계좌 목록 조회"""
    try:
        result = ssafy_service.get_deposit_accounts(user_key)
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        logger.error(f"예금 계좌 조회 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=f"예금 계좌 조회 실패: {str(e)}")

# ==================== 적금 상품/계좌 API ====================

@router.get("/savings/products")
async def get_savings_products():
    """적금 상품 조회"""
    try:
        result = ssafy_service.get_savings_products()
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        logger.error(f"적금 상품 조회 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=f"적금 상품 조회 실패: {str(e)}")

@router.post("/savings/products")
async def create_savings_product(
    bank_code: str,
    account_name: str,
    subscription_period: int,
    min_balance: int,
    max_balance: int,
    interest_rate: float,
    account_description: str = None,
    rate_description: str = None
):
    """적금 상품 등록"""
    try:
        result = ssafy_service.create_savings_product(
            bank_code, account_name, subscription_period, min_balance, 
            max_balance, interest_rate, account_description, rate_description
        )
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        logger.error(f"적금 상품 등록 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=f"적금 상품 등록 실패: {str(e)}")

@router.get("/savings/accounts")
async def get_savings_accounts(user_key: str):
    """적금 계좌 목록 조회"""
    try:
        result = ssafy_service.get_savings_accounts(user_key)
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        logger.error(f"적금 계좌 조회 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=f"적금 계좌 조회 실패: {str(e)}")

# ==================== 대출 상품/심사/계좌 API ====================

@router.get("/loan/credit-rating-criteria")
async def get_credit_rating_criteria():
    """신용등급 기준 조회"""
    try:
        result = ssafy_service.get_credit_rating_criteria()
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        logger.error(f"신용등급 기준 조회 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=f"신용등급 기준 조회 실패: {str(e)}")

@router.get("/loan/products")
async def get_loan_products():
    """대출 상품 조회"""
    try:
        result = ssafy_service.get_loan_products()
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        logger.error(f"대출 상품 조회 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=f"대출 상품 조회 실패: {str(e)}")

@router.post("/loan/products")
async def create_loan_product(
    bank_code: str,
    account_name: str,
    rating_unique_no: str,
    loan_period: int,
    min_balance: int,
    max_balance: int,
    interest_rate: float,
    account_description: str = None
):
    """대출 상품 등록"""
    try:
        result = ssafy_service.create_loan_product(
            bank_code, account_name, rating_unique_no, loan_period,
            min_balance, max_balance, interest_rate, account_description
        )
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        logger.error(f"대출 상품 등록 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=f"대출 상품 등록 실패: {str(e)}")

@router.get("/loan/my-credit-rating")
async def get_my_credit_rating(user_key: str):
    """내 신용등급 조회"""
    try:
        result = ssafy_service.get_my_credit_rating(user_key)
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        logger.error(f"신용등급 조회 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=f"신용등급 조회 실패: {str(e)}")

@router.get("/loan/applications")
async def get_loan_applications(user_key: str):
    """대출심사 목록 조회"""
    try:
        result = ssafy_service.get_loan_applications(user_key)
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        logger.error(f"대출심사 목록 조회 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=f"대출심사 목록 조회 실패: {str(e)}")

@router.get("/loan/accounts")
async def get_loan_accounts(user_key: str):
    """대출 계좌 목록 조회"""
    try:
        result = ssafy_service.get_loan_accounts(user_key)
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        logger.error(f"대출 계좌 조회 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=f"대출 계좌 조회 실패: {str(e)}")

# ==================== 계좌 인증 API ====================

@router.post("/account-auth/open")
async def open_account_auth(
    account_no: str,
    auth_text: str,
    user_key: str
):
    """1원 송금 (계좌 인증)"""
    try:
        result = ssafy_service.open_account_auth(account_no, auth_text, user_key)
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        logger.error(f"계좌 인증 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=f"계좌 인증 실패: {str(e)}")

@router.post("/account-auth/verify")
async def check_auth_code(
    account_no: str,
    auth_text: str,
    auth_code: str,
    user_key: str
):
    """1원 송금 검증"""
    try:
        result = ssafy_service.check_auth_code(account_no, auth_text, auth_code, user_key)
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        logger.error(f"인증코드 검증 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=f"인증코드 검증 실패: {str(e)}")

# ==================== 거래 메모 API ====================

@router.post("/transaction-memo")
async def add_transaction_memo(
    account_no: str,
    transaction_unique_no: str,
    transaction_memo: str,
    user_key: str
):
    """거래내역 메모"""
    try:
        result = ssafy_service.add_transaction_memo(
            account_no, transaction_unique_no, transaction_memo, user_key
        )
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        logger.error(f"거래내역 메모 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=f"거래내역 메모 실패: {str(e)}")

# ==================== 편의 API ====================

@router.get("/user/financial-summary")
async def get_user_financial_summary(user_key: str):
    """사용자 금융 현황 요약"""
    try:
        result = ssafy_service.get_user_financial_summary(user_key)
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        logger.error(f"금융 현황 요약 조회 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=f"금융 현황 요약 조회 실패: {str(e)}")

@router.get("/user/recent-transactions")
async def get_recent_transactions(
    user_key: str,
    days: int = Query(30, ge=1, le=365, description="조회할 일수 (1-365일)")
):
    """최근 거래내역 조회"""
    try:
        result = ssafy_service.get_recent_transactions(user_key, days)
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        logger.error(f"최근 거래내역 조회 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=f"거래내역 조회 실패: {str(e)}")

# ==================== 관리자 API ====================

@router.post("/admin/issue-api-key")
async def issue_api_key(manager_id: str = Body(..., embed=True)):
    """앱 API KEY 발급"""
    try:
        result = ssafy_service.issue_api_key(manager_id)
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        logger.error(f"API KEY 발급 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=f"API KEY 발급 실패: {str(e)}")

@router.post("/admin/reissue-api-key")
async def reissue_api_key(manager_id: str = Body(..., embed=True)):
    """앱 API KEY 재발급"""
    try:
        result = ssafy_service.reissue_api_key(manager_id)
        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        logger.error(f"API KEY 재발급 실패: {str(e)}")
        raise HTTPException(status_code=400, detail=f"API KEY 재발급 실패: {str(e)}")

# ==================== 상태 확인 API ====================

@router.get("/health")
async def health_check():
    """SSAFY API 연동 상태 확인"""
    try:
        # 간단한 API 호출로 상태 확인
        bank_codes = ssafy_service.get_bank_codes()
        return {
            "success": True,
            "status": "healthy",
            "message": "SSAFY API 연동 정상",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"SSAFY API 상태 확인 실패: {str(e)}")
        return {
            "success": False,
            "status": "unhealthy",
            "message": f"SSAFY API 연동 오류: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }
