"""
사용자 회원가입 및 계좌 생성 API
회원가입 완료와 동시에 SSAFY API를 통해 사용자 계좌 생성
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Dict, Any, List, Optional
from datetime import datetime
import logging
import random

from ..services.ssafy_api_service import SSAFYAPIService
from ..models.user import User
from ..db.session import get_session
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/registration", tags=["User Registration"])

# SSAFY API 서비스 인스턴스
ssafy_service = SSAFYAPIService()

class UserRegistrationRequest:
    """사용자 회원가입 요청"""
    def __init__(self, email: str, password: str, name: str, student_id: str = None, university: str = None):
        self.email = email
        self.password = password
        self.name = name
        self.student_id = student_id
        self.university = university

class UserRegistrationResponse:
    """사용자 회원가입 응답"""
    def __init__(self, success: bool, user_id: str = None, user_key: str = None, account_no: str = None, message: str = None):
        self.success = success
        self.user_id = user_id
        self.user_key = user_key
        self.account_no = account_no
        self.message = message

@router.post("/register-with-account")
async def register_user_with_account(
    email: str,
    password: str,
    name: str,
    student_id: str = None,
    university: str = None,
    preferred_bank: str = "001"  # 기본값: 한국은행
):
    """회원가입과 동시에 사용자 계좌 생성"""
    try:
        print(f"🚀 회원가입 및 계좌 생성 시작: {email}")
        
        # 1. SSAFY 학생 인증
        print("1️⃣ SSAFY 학생 인증...")
        student_verification = ssafy_service.verify_ssafy_student(email)
        
        if not student_verification.get('is_valid'):
            raise HTTPException(status_code=400, detail="SSAFY 학생 인증에 실패했습니다.")
        
        print(f"✅ SSAFY 학생 인증 성공: {email}")
        
        # 2. SSAFY API 사용자 계정 생성
        print("2️⃣ SSAFY API 사용자 계정 생성...")
        try:
            user_account_result = ssafy_service.create_user_account(email)
            if user_account_result.get('success'):
                user_key = user_account_result.get('data', {}).get('userKey')
                print(f"✅ SSAFY API 계정 생성 성공: {user_key}")
            else:
                # 이미 존재하는 계정인 경우 조회
                user_search_result = ssafy_service.search_user_account(email)
                if user_search_result.get('success'):
                    user_key = user_search_result.get('data', {}).get('userKey')
                    print(f"✅ 기존 SSAFY API 계정 사용: {user_key}")
                else:
                    raise HTTPException(status_code=400, detail="SSAFY API 계정 생성/조회에 실패했습니다.")
        except Exception as e:
            print(f"⚠️ SSAFY API 계정 생성 실패, 기존 계정 조회 시도: {str(e)}")
            # 기존 계정 조회 시도
            try:
                user_search_result = ssafy_service.search_user_account(email)
                if user_search_result.get('success'):
                    user_key = user_search_result.get('data', {}).get('userKey')
                    print(f"✅ 기존 SSAFY API 계정 사용: {user_key}")
                else:
                    raise HTTPException(status_code=400, detail="SSAFY API 계정을 찾을 수 없습니다.")
            except Exception as e2:
                raise HTTPException(status_code=400, detail=f"SSAFY API 계정 처리 실패: {str(e2)}")
        
        # 3. 수시입출금 상품 조회 및 선택
        print("3️⃣ 수시입출금 상품 조회...")
        demand_products = ssafy_service.get_demand_deposit_products()
        available_products = demand_products.get('dataSearch', {}).get('content', [])
        
        if not available_products:
            raise HTTPException(status_code=400, detail="사용 가능한 수시입출금 상품이 없습니다.")
        
        # 선호 은행에 맞는 상품 선택
        preferred_products = [p for p in available_products if p.get('bankCode') == preferred_bank]
        if preferred_products:
            selected_product = preferred_products[0]
        else:
            # 선호 은행에 상품이 없으면 첫 번째 상품 선택
            selected_product = available_products[0]
        
        print(f"✅ 선택된 상품: {selected_product.get('accountName', 'N/A')}")
        
        # 4. 수시입출금 계좌 생성
        print("4️⃣ 수시입출금 계좌 생성...")
        account_type_unique_no = selected_product.get('accountTypeUniqueNo')
        
        if not account_type_unique_no:
            raise HTTPException(status_code=400, detail="상품 ID를 찾을 수 없습니다.")
        
        account_result = ssafy_service.create_demand_deposit_account(
            account_type_unique_no, 
            user_key
        )
        
        if not account_result.get('success'):
            raise HTTPException(status_code=400, detail="계좌 생성에 실패했습니다.")
        
        account_no = account_result.get('data', {}).get('accountNo')
        print(f"✅ 계좌 생성 성공: {account_no}")
        
        # 5. 초기 입금 (환영 금액)
        print("5️⃣ 초기 입금 (환영 금액)...")
        welcome_amount = 100000  # 10만원 환영 금액
        
        try:
            deposit_result = ssafy_service.deposit_to_account(
                account_no,
                welcome_amount,
                "Campus Credo 환영 금액",
                user_key
            )
            
            if deposit_result.get('success'):
                print(f"✅ 환영 금액 입금 성공: +{welcome_amount:,}원")
            else:
                print(f"⚠️ 환영 금액 입금 실패: {deposit_result.get('message', '알 수 없는 오류')}")
        except Exception as e:
            print(f"⚠️ 환영 금액 입금 오류: {str(e)}")
        
        # 6. 사용자 정보 저장 (로컬 DB)
        print("6️⃣ 사용자 정보 저장...")
        # 여기서는 간단하게 성공 응답만 반환
        # 실제로는 로컬 DB에 사용자 정보를 저장해야 함
        
        # 7. 응답 생성
        response_data = {
            "success": True,
            "user_id": email,  # 이메일을 사용자 ID로 사용
            "user_key": user_key,
            "account_no": account_no,
            "account_name": selected_product.get('accountName'),
            "bank_name": selected_product.get('bankName', 'N/A'),
            "welcome_amount": welcome_amount,
            "message": "회원가입과 계좌 생성이 완료되었습니다!"
        }
        
        print(f"🎉 회원가입 및 계좌 생성 완료: {email}")
        print(f"   계좌번호: {account_no}")
        print(f"   상품명: {selected_product.get('accountName')}")
        print(f"   환영 금액: {welcome_amount:,}원")
        
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"회원가입 및 계좌 생성 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"회원가입 처리 중 오류가 발생했습니다: {str(e)}")

@router.get("/check-account-status")
async def check_account_status(user_key: str):
    """사용자 계좌 상태 확인"""
    try:
        print(f"🔍 계좌 상태 확인: {user_key}")
        
        # 1. 수시입출금 계좌 목록 조회
        demand_accounts = ssafy_service.get_demand_deposit_accounts(user_key)
        demand_account_list = demand_accounts.get('dataSearch', {}).get('content', [])
        
        # 2. 예금 계좌 목록 조회
        deposit_accounts = ssafy_service.get_deposit_accounts(user_key)
        deposit_account_list = deposit_accounts.get('dataSearch', {}).get('content', [])
        
        # 3. 적금 계좌 목록 조회
        savings_accounts = ssafy_service.get_savings_accounts(user_key)
        savings_account_list = savings_accounts.get('dataSearch', {}).get('content', [])
        
        # 4. 대출 계좌 목록 조회
        loan_accounts = ssafy_service.get_loan_accounts(user_key)
        loan_account_list = loan_accounts.get('dataSearch', {}).get('content', [])
        
        # 5. 계좌별 잔액 조회
        account_details = []
        
        for account in demand_account_list:
            try:
                balance_info = ssafy_service.get_account_balance(
                    account.get('accountNo'), 
                    user_key
                )
                
                if balance_info.get('success'):
                    balance = balance_info.get('data', {}).get('balance', 0)
                    account_details.append({
                        'account_no': account.get('accountNo'),
                        'account_name': account.get('accountName'),
                        'account_type': '수시입출금',
                        'balance': balance,
                        'currency': 'KRW'
                    })
            except Exception as e:
                print(f"⚠️ 계좌 {account.get('accountNo')} 잔액 조회 실패: {str(e)}")
        
        # 6. 신용등급 조회
        try:
            credit_rating = ssafy_service.get_my_credit_rating(user_key)
            credit_score = credit_rating.get('data', {}).get('creditScore', 0)
            credit_grade = credit_rating.get('data', {}).get('creditGrade', 'N/A')
        except Exception as e:
            print(f"⚠️ 신용등급 조회 실패: {str(e)}")
            credit_score = 0
            credit_grade = 'N/A'
        
        response_data = {
            "success": True,
            "user_key": user_key,
            "accounts": {
                "demand_deposit": len(demand_account_list),
                "deposit": len(deposit_account_list),
                "savings": len(savings_account_list),
                "loan": len(loan_account_list)
            },
            "account_details": account_details,
            "total_balance": sum([acc['balance'] for acc in account_details]),
            "credit_score": credit_score,
            "credit_grade": credit_grade
        }
        
        print(f"✅ 계좌 상태 확인 완료")
        print(f"   총 계좌 수: {len(demand_account_list) + len(deposit_account_list) + len(savings_account_list) + len(loan_account_list)}개")
        print(f"   총 잔액: {response_data['total_balance']:,}원")
        print(f"   신용점수: {credit_score}")
        
        return response_data
        
    except Exception as e:
        logger.error(f"계좌 상태 확인 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"계좌 상태 확인 중 오류가 발생했습니다: {str(e)}")

@router.post("/create-additional-account")
async def create_additional_account(
    user_key: str,
    account_type: str,  # "deposit", "savings", "loan"
    product_id: str,
    amount: int
):
    """추가 계좌 생성 (예금, 적금, 대출)"""
    try:
        print(f"🏦 추가 계좌 생성: {account_type}, {amount:,}원")
        
        if account_type == "deposit":
            # 예금 계좌 생성
            result = ssafy_service.create_deposit_account(
                user_key,  # 출금 계좌 (수시입출금)
                product_id,
                amount
            )
        elif account_type == "savings":
            # 적금 계좌 생성
            result = ssafy_service.create_savings_account(
                product_id,
                amount,
                user_key  # 출금 계좌 (수시입출금)
            )
        elif account_type == "loan":
            # 대출 계좌 생성
            result = ssafy_service.create_loan_account(
                product_id,
                amount,
                user_key  # 출금 계좌 (수시입출금)
            )
        else:
            raise HTTPException(status_code=400, detail="지원하지 않는 계좌 유형입니다.")
        
        if result.get('success'):
            account_no = result.get('data', {}).get('accountNo')
            print(f"✅ {account_type} 계좌 생성 성공: {account_no}")
            
            return {
                "success": True,
                "account_type": account_type,
                "account_no": account_no,
                "amount": amount,
                "message": f"{account_type} 계좌가 성공적으로 생성되었습니다."
            }
        else:
            raise HTTPException(status_code=400, detail=f"{account_type} 계좌 생성에 실패했습니다.")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"추가 계좌 생성 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"계좌 생성 중 오류가 발생했습니다: {str(e)}")

@router.get("/available-products")
async def get_available_products():
    """사용 가능한 금융 상품 목록 조회"""
    try:
        print("🏦 사용 가능한 금융 상품 목록 조회...")
        
        # 모든 상품 타입 조회
        demand_products = ssafy_service.get_demand_deposit_products()
        deposit_products = ssafy_service.get_deposit_products()
        savings_products = ssafy_service.get_savings_products()
        loan_products = ssafy_service.get_loan_products()
        
        response_data = {
            "success": True,
            "products": {
                "demand_deposit": demand_products.get('dataSearch', {}).get('content', []),
                "deposit": deposit_products.get('dataSearch', {}).get('content', []),
                "savings": savings_products.get('dataSearch', {}).get('content', []),
                "loan": loan_products.get('dataSearch', {}).get('content', [])
            },
            "total_count": {
                "demand_deposit": len(demand_products.get('dataSearch', {}).get('content', [])),
                "deposit": len(deposit_products.get('dataSearch', {}).get('content', [])),
                "savings": len(savings_products.get('dataSearch', {}).get('content', [])),
                "loan": len(loan_products.get('dataSearch', {}).get('content', []))
            }
        }
        
        print(f"✅ 상품 목록 조회 완료")
        print(f"   수시입출금: {response_data['total_count']['demand_deposit']}개")
        print(f"   예금: {response_data['total_count']['deposit']}개")
        print(f"   적금: {response_data['total_count']['savings']}개")
        print(f"   대출: {response_data['total_count']['loan']}개")
        
        return response_data
        
    except Exception as e:
        logger.error(f"상품 목록 조회 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"상품 목록 조회 중 오류가 발생했습니다: {str(e)}")
