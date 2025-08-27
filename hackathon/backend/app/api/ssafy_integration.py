from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import os
import requests
import json
from datetime import datetime
from sqlmodel import Session, select
from ..core.config import settings
from ..db.session import get_session
from ..services.user_service import SSAFYAPIService, UserService
from ..models.user import User

router = APIRouter()

class EmailVerificationRequest(BaseModel):
    email: str

class EmailVerificationResponse(BaseModel):
    is_valid_student: bool
    student_name: str = None
    university: str = None
    student_id: str = None
    message: str = None

class SSAFYAccountCreationRequest(BaseModel):
    email: str

class SSAFYAccountCreationResponse(BaseModel):
    success: bool
    user_key: str = None
    message: str = None

class SSAFYIntegrationStatusResponse(BaseModel):
    is_connected: bool
    user_id: Optional[str] = None
    user_key: Optional[str] = None
    user_name: Optional[str] = None
    institution_code: Optional[str] = None
    message: str

@router.post("/verify-ssafy-email", response_model=EmailVerificationResponse)
async def verify_ssafy_email(
    request: EmailVerificationRequest,
    db: Session = Depends(get_session)
):
    """
    SSAFY API를 호출하여 이메일이 유효한 학생 이메일인지 확인 + 중복 검증 (MEMBER_02)
    """
    try:
        print(f"🔍 SSAFY API 이메일 중복 확인 시작: {request.email}")
        
        # 1. UserService를 통한 이메일 중복 확인 (백엔드 DB + SSAFY API)
        user_service = UserService(db)
        email_check = await user_service.check_email_availability(request.email)
        
        # 2. 이미 등록된 이메일인 경우
        if not email_check.is_available:
            return EmailVerificationResponse(
                is_valid_student=False,
                message=f"이미 등록된 이메일입니다: {email_check.message}"
            )
        
        # 3. SSAFY API MEMBER_02로 학생 정보 확인
        ssafy_api_service = SSAFYAPIService()
        ssafy_result = await ssafy_api_service.check_email_exists(request.email)
        
        if ssafy_result.get("exists"):
            # SSAFY API에 이미 등록된 이메일
            return EmailVerificationResponse(
                is_valid_student=False,
                message="이미 SSAFY API에 등록된 이메일입니다. (이미 가입된 이메일)"
            )
        
        # 4. SSAFY API에 등록되지 않은 이메일 - 가입 가능
        # 도메인 기반 기본 검증 (개발 환경용)
        allowed_domains = [
            "@ssafy.com", "@samsung.com", "@naver.com", "@gmail.com", 
            "@test.com", "@example.com", "@student.ac.kr", "@ac.kr"
        ]
        
        is_valid_domain = any(request.email.endswith(domain) for domain in allowed_domains)
        
        if is_valid_domain:
            # 도메인에 따라 다른 대학교 정보 반환
            if request.email.endswith("@ssafy.com"):
                university = "SSAFY 대학교"
                student_name = "김SSAFY"
            elif request.email.endswith("@naver.com"):
                university = "네이버 대학교"
                student_name = "김네이버"
            elif request.email.endswith("@gmail.com"):
                university = "구글 대학교"
                student_name = "김구글"
            else:
                university = "테스트 대학교"
                student_name = "김테스트"
                
            return EmailVerificationResponse(
                is_valid_student=True,
                student_name=student_name,
                university=university,
                student_id="STU001",
                message=f"{university} 학생으로 확인되었습니다. 사용 가능한 이메일입니다."
            )
        else:
            return EmailVerificationResponse(
                is_valid_student=False,
                message="지원하지 않는 이메일 도메인입니다. 다른 이메일을 사용해주세요."
            )
        
    except Exception as e:
        print(f"❌ SSAFY 이메일 검증 오류: {e}")
        return EmailVerificationResponse(
            is_valid_student=False,
            message=f"이메일 중복 확인 중 오류가 발생했습니다: {str(e)}"
        )

@router.get("/ssafy-universities")
async def get_ssafy_universities():
    """
    SSAFY 제휴 대학교 목록 반환
    """
    # Mock 데이터 (실제로는 SSAFY API에서 가져올 수 있음)
    universities = [
        "SSAFY 대학교",
        "삼성 대학교",
        "서울대학교",
        "연세대학교",
        "고려대학교",
        "KAIST",
        "POSTECH"
    ]
    
    return {"universities": universities}

@router.get("/ssafy-integration-status/{user_id}", response_model=SSAFYIntegrationStatusResponse)
async def get_ssafy_integration_status(
    user_id: int,
    db: Session = Depends(get_session)
):
    """사용자의 SSAFY 연동 상태 조회"""
    try:
        # 사용자 정보 조회
        user = db.exec(select(User).where(User.id == user_id)).first()
        if not user:
            raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다")
        
        # SSAFY 연동 상태 확인
        is_connected = bool(user.ssafy_user_id and user.ssafy_user_key)
        
        return SSAFYIntegrationStatusResponse(
            is_connected=is_connected,
            user_id=user.ssafy_user_id,
            user_key=user.ssafy_user_key,
            user_name=user.ssafy_user_name,
            institution_code=user.ssafy_institution_code,
            message="SSAFY 연동 상태 조회 완료" if is_connected else "SSAFY 연동이 필요합니다"
        )
        
    except Exception as e:
        print(f"❌ SSAFY 연동 상태 조회 오류: {e}")
        raise HTTPException(status_code=500, detail="SSAFY 연동 상태 조회 중 오류가 발생했습니다")

# =============================================================================
# SSAFY API 연동을 위한 핵심 클래스 및 함수들
# =============================================================================

class SSAFYHeader(BaseModel):
    """SSAFY API 공통 헤더"""
    apiName: str
    transmissionDate: str
    transmissionTime: str
    institutionCode: str = "00100"
    fintechAppNo: str = "001"
    apiServiceCode: str
    institutionTransactionUniqueNo: str
    apiKey: str
    userKey: Optional[str] = None

class AccountBalanceRequest(BaseModel):
    """계좌 잔액 조회 요청"""
    userKey: str
    accountNo: str

class AccountBalanceResponse(BaseModel):
    """계좌 잔액 조회 응답"""
    balance: float
    currency: str = "KRW"
    account_name: str
    bank_name: str

class TransactionHistoryRequest(BaseModel):
    """거래내역 조회 요청"""
    userKey: str
    accountNo: str
    startDate: str  # YYYYMMDD
    endDate: str    # YYYYMMDD
    transactionType: str = "A"  # M:입금, D:출금, A:전체
    orderByType: str = "DESC"   # ASC:오름차순, DESC:내림차순

class Transaction(BaseModel):
    """거래 정보"""
    transactionUniqueNo: str
    transactionDate: str
    transactionTime: str
    transactionType: str
    transactionTypeName: str
    transactionAccountNo: str
    transactionBalance: float
    transactionAfterBalance: float
    transactionSummary: str
    transactionMemo: Optional[str] = None

class TransactionHistoryResponse(BaseModel):
    """거래내역 조회 응답"""
    transactions: List[Transaction]
    totalCount: int

def generate_header(api_name: str, user_key: Optional[str] = None) -> Dict[str, Any]:
    """SSAFY API 공통 헤더 생성"""
    now = datetime.now()
    transmission_date = now.strftime("%Y%m%d")
    transmission_time = now.strftime("%H%M%S")
    
    # 기관거래고유번호 생성 (YYYYMMDDHHMMSS + 6자리 일련번호)
    unique_no = f"{transmission_date}{transmission_time}{now.microsecond:06d}"[:20]
    
    header = {
        "apiName": api_name,
        "transmissionDate": transmission_date,
        "transmissionTime": transmission_time,
        "institutionCode": "00100",
        "fintechAppNo": "001",
        "apiServiceCode": api_name,
        "institutionTransactionUniqueNo": unique_no,
        "apiKey": settings.SSAFY_API_KEY
    }
    
    if user_key:
        header["userKey"] = user_key
    
    return header

async def call_ssafy_api(endpoint: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    """SSAFY API 호출 공통 함수"""
    try:
        base_url = "https://finopenapi.ssafy.io/ssafy/api/v1/edu"
        url = f"{base_url}{endpoint}"
        
        headers = {
            "Content-Type": "application/json"
        }
        
        print(f"🔗 SSAFY API 호출: {url}")
        print(f"📤 요청 데이터: {json.dumps(payload, ensure_ascii=False, indent=2)}")
        
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        
        print(f"📥 응답 상태코드: {response.status_code}")
        print(f"📥 응답 데이터: {response.text}")
        
        if response.status_code == 200:
            return response.json()
        else:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"SSAFY API 호출 실패: {response.text}"
            )
    
    except requests.RequestException as e:
        print(f"❌ SSAFY API 네트워크 오류: {e}")
        raise HTTPException(status_code=503, detail="SSAFY API 서비스 연결 실패")
    except Exception as e:
        print(f"❌ SSAFY API 호출 오류: {e}")
        raise HTTPException(status_code=500, detail="SSAFY API 호출 중 서버 오류")

# =============================================================================
# 핵심 금융 API 엔드포인트들
# =============================================================================

@router.post("/account-balance", response_model=AccountBalanceResponse)
async def get_account_balance(request: AccountBalanceRequest):
    """계좌 잔액 조회"""
    try:
        header = generate_header("inquireDemandDepositAccountBalance", request.userKey)
        
        payload = {
            "Header": header,
            "accountNo": request.accountNo
        }
        
        # Mock 데이터 반환 (실제 SSAFY API 연동 시 아래 주석 해제)
        return AccountBalanceResponse(
            balance=1250000.0,
            currency="KRW",
            account_name="Campus Credo 통장",
            bank_name="신한은행"
        )
        
        # 실제 SSAFY API 호출 (주석 해제하여 사용)
        # result = await call_ssafy_api("/demandDeposit/inquireDemandDepositAccountBalance", payload)
        # return AccountBalanceResponse(
        #     balance=float(result.get("balance", 0)),
        #     currency="KRW",
        #     account_name=result.get("accountName", ""),
        #     bank_name=result.get("bankName", "")
        # )
        
    except Exception as e:
        print(f"❌ 계좌 잔액 조회 실패: {e}")
        raise HTTPException(status_code=500, detail="계좌 잔액 조회에 실패했습니다")

@router.post("/transaction-history", response_model=TransactionHistoryResponse)
async def get_transaction_history(request: TransactionHistoryRequest):
    """거래내역 조회"""
    try:
        header = generate_header("inquireTransactionHistoryList", request.userKey)
        
        payload = {
            "Header": header,
            "accountNo": request.accountNo,
            "startDate": request.startDate,
            "endDate": request.endDate,
            "transactionType": request.transactionType,
            "orderByType": request.orderByType
        }
        
        # Mock 데이터 반환 (실제 SSAFY API 연동 시 아래 주석 해제)
        mock_transactions = [
            Transaction(
                transactionUniqueNo="1001",
                transactionDate="20241201",
                transactionTime="143000",
                transactionType="M",
                transactionTypeName="입금",
                transactionAccountNo=request.accountNo,
                transactionBalance=50000.0,
                transactionAfterBalance=1250000.0,
                transactionSummary="용돈 입금",
                transactionMemo="부모님 용돈"
            ),
            Transaction(
                transactionUniqueNo="1002",
                transactionDate="20241201",
                transactionTime="120000",
                transactionType="D",
                transactionTypeName="출금",
                transactionAccountNo=request.accountNo,
                transactionBalance=15000.0,
                transactionAfterBalance=1200000.0,
                transactionSummary="카페 결제",
                transactionMemo="스터디 카페"
            ),
            Transaction(
                transactionUniqueNo="1003",
                transactionDate="20241130",
                transactionTime="180000",
                transactionType="M",
                transactionTypeName="입금",
                transactionAccountNo=request.accountNo,
                transactionBalance=100000.0,
                transactionAfterBalance=1215000.0,
                transactionSummary="적금 만기",
                transactionMemo="3개월 적금 만기"
            )
        ]
        
        return TransactionHistoryResponse(
            transactions=mock_transactions,
            totalCount=len(mock_transactions)
        )
        
        # 실제 SSAFY API 호출 (주석 해제하여 사용)
        # result = await call_ssafy_api("/demandDeposit/inquireTransactionHistoryList", payload)
        # transactions = []
        # for tx in result.get("transactions", []):
        #     transactions.append(Transaction(
        #         transactionUniqueNo=tx.get("transactionUniqueNo"),
        #         transactionDate=tx.get("transactionDate"),
        #         transactionTime=tx.get("transactionTime"),
        #         transactionType=tx.get("transactionType"),
        #         transactionTypeName=tx.get("transactionTypeName"),
        #         transactionAccountNo=tx.get("transactionAccountNo"),
        #         transactionBalance=float(tx.get("transactionBalance", 0)),
        #         transactionAfterBalance=float(tx.get("transactionAfterBalance", 0)),
        #         transactionSummary=tx.get("transactionSummary", ""),
        #         transactionMemo=tx.get("transactionMemo")
        #     ))
        # 
        # return TransactionHistoryResponse(
        #     transactions=transactions,
        #         totalCount=len(transactions)
        # )
        
    except Exception as e:
        print(f"❌ 거래내역 조회 실패: {e}")
        raise HTTPException(status_code=500, detail="거래내역 조회에 실패했습니다")

@router.post("/create-ssafy-account", response_model=SSAFYAccountCreationResponse)
async def create_ssafy_account(
    request: SSAFYAccountCreationRequest,
    db: Session = Depends(get_session)
):
    """
    SSAFY API를 호출하여 새로운 계정 생성 (MEMBER_01) - 회원가입 완료 시 호출
    """
    try:
        print(f"🏭 SSAFY API 계정 생성 시작: {request.email}")
        
        # 1. 이메일 중복 확인 (백엔드 DB만)
        user_service = UserService(db)
        email_check = await user_service.check_email_availability(request.email)
        
        if not email_check.is_available:
            return SSAFYAccountCreationResponse(
                success=False,
                message=f"이미 등록된 이메일입니다: {email_check.message}"
            )
        
        # 2. SSAFY API 호출하여 계정 생성 (MEMBER_01)
        # 실제 구현에서는 SSAFY API의 MEMBER_01 엔드포인트 호출
        ssafy_api_service = SSAFYAPIService()
        result = await ssafy_api_service.create_user_account(request.email)
        
        if result.get("success"):
            print(f"✅ SSAFY API 계정 생성 성공: {request.email} -> {result.get('user_key')}")
            return SSAFYAccountCreationResponse(
                success=True,
                user_key=result.get("user_key"),
                message="SSAFY API 계정이 성공적으로 생성되었습니다."
            )
        else:
            print(f"❌ SSAFY API 계정 생성 실패: {result.get('message')}")
            return SSAFYAccountCreationResponse(
                success=False,
                message=result.get("message", "SSAFY API 계정 생성에 실패했습니다.")
            )
        
    except Exception as e:
        print(f"❌ SSAFY API 계정 생성 실패: {e}")
        return SSAFYAccountCreationResponse(
            success=False,
            message=f"SSAFY API 계정 생성 중 오류가 발생했습니다: {str(e)}"
        )

@router.get("/user-financial-summary/{user_key}")
async def get_user_financial_summary(user_key: str):
    """사용자 금융 데이터 요약"""
    try:
        # Mock 데이터 (실제로는 여러 SSAFY API를 조합하여 생성)
        return {
            "user_key": user_key,
            "total_balance": 1250000.0,
            "accounts": [
                {
                    "account_no": "0016174648358792",
                    "account_name": "Campus Credo 통장",
                    "bank_name": "신한은행",
                    "balance": 1250000.0,
                    "account_type": "수시입출금"
                }
            ],
            "recent_transactions": 3,
            "monthly_spending": 450000.0,
            "monthly_income": 500000.0,
            "savings_accounts": [
                {
                    "account_no": "0019169157",
                    "product_name": "Campus 적금",
                    "balance": 300000.0,
                    "interest_rate": 3.5,
                    "maturity_date": "2024-12-31"
                }
            ],
            "credit_score": 750,
            "credit_grade": "우수"
        }
        
    except Exception as e:
        print(f"❌ 사용자 금융 요약 조회 실패: {e}")
        raise HTTPException(status_code=500, detail="금융 요약 데이터 조회에 실패했습니다")
