import aiohttp
import requests
from typing import Optional, Dict, Any, List
from sqlmodel import Session, select
from datetime import datetime, timedelta
import jwt
import logging
import random

from ..core.config import settings
from ..models.user import (
    User, 
    EmailCheckResponse,
    UserResponse,
    LoginResponse,
    SignupResponse
)
from ..db.session import get_session
from ..models.financial import BankAccount, Transaction, CreditScore

logger = logging.getLogger(__name__)


class SSAFYAPIService:
    """SSAFY API 연동 서비스"""
    
    @staticmethod
    async def check_email_exists(email: str) -> Dict[str, Any]:
        """SSAFY API에서 이메일 존재 여부 확인 (MEMBER_02)"""
        try:
            logger.info(f"🔍 SSAFY API 이메일 중복 확인 시작: {email}")
            
            # SSAFY API MEMBER_02 (사용자 계정 조회) 요청
            body = {
                "apiKey": settings.SSAFY_API_KEY,
                "userId": email
            }
            
            logger.info(f"📤 SSAFY API 요청 전송: {settings.SSAFY_EMAIL_CHECK_URL}")
            logger.info(f"📋 요청 본문: {body}")
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    settings.SSAFY_EMAIL_CHECK_URL,  # 올바른 엔드포인트 사용
                    json=body, 
                    timeout=10
                ) as response:
                    
                    response_text = await response.text()
                    logger.info(f"📥 SSAFY API 응답 상태: {response.status}")
                    logger.info(f"📥 SSAFY API 응답 내용: {response_text}")
                    
                    if response.status == 200:
                        try:
                            data = await response.json()
                            # SSAFY API에서 성공 응답이 오면 이미 등록된 이메일
                            if data.get("userKey") or data.get("userId"):
                                logger.info(f"✅ SSAFY API에서 이미 등록된 이메일 확인: {email}")
                                return {
                                    "exists": True,
                                    "ssafy_data": data
                                }
                            else:
                                logger.info(f"✅ SSAFY API에서 등록되지 않은 이메일 확인: {email}")
                                return {"exists": False}
                        except Exception as parse_error:
                            logger.error(f"❌ SSAFY API 응답 파싱 실패: {parse_error}")
                            return {"exists": False, "error": str(parse_error)}
                    elif response.status == 404:
                        # 404 응답이면 등록되지 않은 이메일
                        logger.info(f"✅ SSAFY API에서 등록되지 않은 이메일 확인 (404): {email}")
                        return {"exists": False}
                    else:
                        # 기타 HTTP 상태 코드 오류
                        logger.warning(f"⚠️ SSAFY API HTTP 오류: {response.status} - {response_text}")
                        # API 에러시에는 false로 처리하여 회원가입 진행 허용
                        return {"exists": False, "error": f"HTTP {response.status}"}
                    
        except Exception as e:
            logger.error(f"❌ SSAFY API 이메일 확인 실패: {e}")
            # API 에러시에는 false로 처리하여 회원가입 진행 허용
            return {"exists": False, "error": str(e)}
    
    @staticmethod
    async def create_user_account(email: str) -> Dict[str, Any]:
        """SSAFY API에 새 사용자 계정 생성 (MEMBER_01)"""
        try:
            logger.info(f"🏭 SSAFY API 사용자 계정 생성 시작: {email}")
            
            # SSAFY API MEMBER_01 요청 본문 구성 (단순한 형식)
            payload = {
                "apiKey": settings.SSAFY_API_KEY,
                "userId": email
            }
            
            logger.info(f"📤 SSAFY API 요청 전송: {settings.SSAFY_API_BASE_URL}/member/")
            logger.info(f"📋 요청 본문: {payload}")
            
            # SSAFY API 호출
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{settings.SSAFY_API_BASE_URL}/member/",
                    json=payload,
                    timeout=30,
                    headers={
                        "Content-Type": "application/json",
                        "User-Agent": "CampusCredo/1.0"
                    }
                ) as response:
                    
                    response_text = await response.text()
                    logger.info(f"📥 SSAFY API 응답 상태: {response.status}")
                    logger.info(f"📥 SSAFY API 응답 내용: {response_text}")
                    
                    if response.status == 200:
                        try:
                            data = await response.json()
                            
                            # SSAFY API 성공 응답 처리
                            if data.get("responseCode") == "0000":  # 성공 코드
                                user_key = data.get("userKey")
                                if user_key:
                                    logger.info(f"✅ SSAFY API 계정 생성 성공: {email} -> {user_key}")
                                    return {
                                        "success": True,
                                        "user_key": user_key,
                                        "message": "SSAFY API 계정이 성공적으로 생성되었습니다.",
                                        "ssafy_data": data
                                    }
                                else:
                                    logger.error(f"❌ SSAFY API 응답에 userKey가 없음: {data}")
                                    return {
                                        "success": False,
                                        "message": "SSAFY API 응답에 userKey가 포함되지 않았습니다.",
                                        "ssafy_data": data
                                    }
                            else:
                                # SSAFY API 에러 응답 처리
                                error_code = data.get("responseCode", "UNKNOWN")
                                error_message = data.get("responseMessage", "알 수 없는 오류")
                                logger.error(f"❌ SSAFY API 에러 응답: {error_code} - {error_message}")
                                
                                # 에러 코드별 메시지 매핑
                                error_messages = {
                                    "E4001": "입력 형식이 올바르지 않습니다.",
                                    "E4002": "이미 존재하는 ID입니다.",
                                    "E4004": "API 키가 올바르지 않습니다.",
                                    "Q1001": "요청 형식이 올바르지 않습니다."
                                }
                                
                                user_friendly_message = error_messages.get(error_code, error_message)
                                return {
                                    "success": False,
                                    "message": f"SSAFY API 오류: {user_friendly_message}",
                                    "error_code": error_code,
                                    "ssafy_data": data
                                }
                        except Exception as parse_error:
                            logger.error(f"❌ SSAFY API 응답 파싱 실패: {parse_error}")
                            return {
                                "success": False,
                                "message": f"SSAFY API 응답 파싱 실패: {str(parse_error)}",
                                "raw_response": response_text
                            }
                    else:
                        # HTTP 상태 코드 오류
                        logger.error(f"❌ SSAFY API HTTP 오류: {response.status} - {response_text}")
                        return {
                            "success": False,
                            "message": f"SSAFY API 서버 오류 (HTTP {response.status}): {response_text}",
                            "http_status": response.status
                        }
                        
        except aiohttp.ClientTimeout:
            logger.error(f"❌ SSAFY API 요청 시간 초과: {email}")
            return {
                "success": False,
                "message": "SSAFY API 요청 시간 초과. 잠시 후 다시 시도해주세요."
            }
        except aiohttp.ClientConnectorError as e:
            logger.error(f"❌ SSAFY API 연결 실패: {e}")
            return {
                "success": False,
                "message": "SSAFY API 서버에 연결할 수 없습니다. 네트워크 상태를 확인해주세요."
            }
        except Exception as e:
            logger.error(f"❌ SSAFY API 계정 생성 실패: {e}")
            return {
                "success": False,
                "message": f"SSAFY API 계정 생성 중 오류가 발생했습니다: {str(e)}"
            }
    
    @staticmethod
    async def register_to_ssafy(email: str) -> Dict[str, Any]:
        """SSAFY API에 새 사용자 등록"""
        try:
            body = {
                "apiKey": settings.SSAFY_API_KEY,
                "userId": email
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    settings.SSAFY_LOGIN_URL, 
                    json=body, 
                    timeout=10
                ) as response:
                    
                    if response.status == 200:
                        data = await response.json()
                        return {
                            "success": True,
                            "ssafy_data": data
                        }
                    else:
                        response_text = await response.text()
                        return {
                            "success": False,
                            "error": response_text
                        }
                        
        except Exception as e:
            logger.error(f"SSAFY API 등록 실패: {e}")
            return {"success": False, "error": str(e)}


class UserService:
    """사용자 관리 서비스"""
    
    def __init__(self, db: Session):
        self.db = db
    
    async def check_email_availability(self, email: str) -> EmailCheckResponse:
        """이메일 사용 가능 여부 확인 (SSAFY API + 자체 DB 확인)"""
        
        # 1. 자체 DB에서 이메일 중복 확인
        existing_user = self.db.exec(
            select(User).where(User.email == email)
        ).first()
        
        if existing_user:
            return EmailCheckResponse(
                email=email,
                is_available=False,
                is_ssafy_registered=True,  # 자체 DB에 있으면 SSAFY에도 등록되어 있다고 가정
                message="이미 가입된 이메일입니다."
            )
        
        # 2. SSAFY API에서 이메일 확인
        ssafy_result = await SSAFYAPIService.check_email_exists(email)
        
        if ssafy_result.get("exists"):
            return EmailCheckResponse(
                email=email,
                is_available=False,
                is_ssafy_registered=True,
                message="SSAFY API에 이미 등록된 이메일입니다. 다른 이메일을 사용해주세요."
            )
        
        # 3. 사용 가능한 이메일
        return EmailCheckResponse(
            email=email,
            is_available=True,
            is_ssafy_registered=False,
            message="사용 가능한 이메일입니다."
        )
    
    async def create_user(
        self, 
        email: str, 
        password: str, 
        display_name: Optional[str] = None,
        university: Optional[str] = None,
        department: Optional[str] = None,
        grade_level: Optional[int] = None,
        firebase_uid: Optional[str] = None
    ) -> SignupResponse:
        """새 사용자 생성"""
        
        try:
            # 1. 이메일 중복 확인
            email_check = await self.check_email_availability(email)
            if not email_check.is_available:
                return SignupResponse(
                    success=False,
                    message=email_check.message
                )
            
            # 2. SSAFY API에 사용자 등록
            ssafy_result = await SSAFYAPIService.register_to_ssafy(email)
            
            # 3. 자체 DB에 사용자 생성
            new_user = User(
                email=email,
                password_hash=User.hash_password(password),
                firebase_uid=firebase_uid,  # Firebase UID 저장
                display_name=display_name or email.split('@')[0],  # 기본 표시명
                current_university=university,
                current_department=department,
                grade_level=grade_level,
                ssafy_user_id=email,  # SSAFY userId로 이메일 사용
                ssafy_user_key=ssafy_result.get("ssafy_data", {}).get("userKey"),
                ssafy_user_name=ssafy_result.get("ssafy_data", {}).get("userName"),
                ssafy_institution_code=ssafy_result.get("ssafy_data", {}).get("institutionCode")
            )
            
            self.db.add(new_user)
            self.db.commit()
            self.db.refresh(new_user)
            
            # 사용자 가입 시 자동으로 기본 계좌 및 거래 내역 생성
            try:
                logger.info(f"🏦 사용자 {new_user.id} 기본 계좌 자동 생성 시작")
                account_setup_result = UserAccountSetupService.setup_user_financial_accounts(new_user.id, self.db)
                logger.info(f"✅ 계좌 자동 생성 완료: {account_setup_result['message']}")
            except Exception as account_error:
                logger.error(f"⚠️ 계좌 자동 생성 실패 (사용자 생성은 성공): {account_error}")
                # 계좌 생성 실패해도 사용자 생성은 성공으로 처리
            
            user_response = UserResponse(
                id=new_user.id,
                email=new_user.email,
                display_name=new_user.display_name,
                current_university=new_user.current_university,
                current_department=new_user.current_department,
                grade_level=new_user.grade_level,
                profile_image=new_user.profile_image,
                is_verified=new_user.is_verified,
                created_at=new_user.created_at,
                last_login_at=new_user.last_login_at
            )
            
            return SignupResponse(
                success=True,
                message="회원가입이 완료되었습니다.",
                user=user_response
            )
            
        except Exception as e:
            logger.error(f"사용자 생성 실패: {e}")
            self.db.rollback()
            return SignupResponse(
                success=False,
                message=f"회원가입 중 오류가 발생했습니다: {str(e)}"
            )
    
    def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """사용자 인증 (이메일 + 비밀번호)"""
        user = self.db.exec(
            select(User).where(User.email == email)
        ).first()
        
        if user and user.verify_password(password) and user.is_active:
            # 마지막 로그인 시간 업데이트
            user.update_last_login()
            self.db.add(user)
            self.db.commit()
            return user
        
        return None
    
    def get_user_by_id(self, user_id: int) -> Optional[User]:
        """ID로 사용자 조회"""
        return self.db.exec(
            select(User).where(User.id == user_id)
        ).first()
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """이메일로 사용자 조회"""
        return self.db.exec(
            select(User).where(User.email == email)
        ).first()
    
    def get_user_by_firebase_uid(self, firebase_uid: str) -> Optional[User]:
        """Firebase UID로 사용자 조회"""
        return self.db.exec(
            select(User).where(User.firebase_uid == firebase_uid)
        ).first()
    
    async def create_user_from_firebase(
        self,
        email: str,
        firebase_uid: str,
        display_name: Optional[str] = None
    ) -> SignupResponse:
        """Firebase 인증으로 새 사용자 생성"""
        try:
            # 1. 이메일 중복 확인
            existing_user = self.db.exec(
                select(User).where(User.email == email)
            ).first()
            
            if existing_user:
                # 이미 존재하는 사용자라면 Firebase UID만 업데이트
                if not existing_user.firebase_uid:
                    existing_user.firebase_uid = firebase_uid
                    existing_user.updated_at = datetime.utcnow()
                    self.db.add(existing_user)
                    self.db.commit()
                    self.db.refresh(existing_user)
                
                user_response = UserResponse(
                    id=existing_user.id,
                    email=existing_user.email,
                    display_name=existing_user.display_name,
                    current_university=existing_user.current_university,
                    current_department=existing_user.current_department,
                    grade_level=existing_user.grade_level,
                    profile_image=existing_user.profile_image,
                    is_verified=existing_user.is_verified,
                    created_at=existing_user.created_at,
                    last_login_at=existing_user.last_login_at
                )
                
                return SignupResponse(
                    success=True,
                    message="기존 계정에 Firebase 인증이 연결되었습니다.",
                    user=user_response
                )
            
            # 2. 새 사용자 생성
            new_user = User(
                email=email,
                password_hash="",  # Firebase 인증이므로 비밀번호 불필요
                firebase_uid=firebase_uid,
                display_name=display_name or email.split('@')[0],
                is_verified=True,  # Firebase 인증이므로 이메일 인증 완료로 간주
                last_login_at=datetime.utcnow()
            )
            
            self.db.add(new_user)
            self.db.commit()
            self.db.refresh(new_user)
            
            # 사용자 가입 시 자동으로 기본 계좌 및 거래 내역 생성
            try:
                logger.info(f"🏦 사용자 {new_user.id} 기본 계좌 자동 생성 시작")
                account_setup_result = UserAccountSetupService.setup_user_financial_accounts(new_user.id, self.db)
                logger.info(f"✅ 계좌 자동 생성 완료: {account_setup_result['message']}")
            except Exception as account_error:
                logger.error(f"⚠️ 계좌 자동 생성 실패 (사용자 생성은 성공): {account_error}")
                # 계좌 생성 실패해도 사용자 생성은 성공으로 처리
            
            user_response = UserResponse(
                id=new_user.id,
                email=new_user.email,
                display_name=new_user.display_name,
                current_university=new_user.current_university,
                current_department=new_user.current_department,
                grade_level=new_user.grade_level,
                profile_image=new_user.profile_image,
                is_verified=new_user.is_verified,
                created_at=new_user.created_at,
                last_login_at=new_user.last_login_at
            )
            
            return SignupResponse(
                success=True,
                message="Firebase 인증으로 회원가입이 완료되었습니다.",
                user=user_response
            )
            
        except Exception as e:
            logger.error(f"Firebase 사용자 생성 실패: {e}")
            self.db.rollback()
            return SignupResponse(
                success=False,
                message=f"Firebase 사용자 생성 중 오류가 발생했습니다: {str(e)}"
            )
    
    def get_users_paginated(self, offset: int = 0, limit: int = 20) -> List[User]:
        """페이지네이션을 사용한 사용자 목록 조회"""
        return self.db.exec(
            select(User)
            .offset(offset)
            .limit(limit)
            .order_by(User.created_at.desc())
        ).all()
    
    def get_total_users_count(self) -> int:
        """전체 사용자 수 조회"""
        from sqlmodel import select, func
        result = self.db.exec(select(func.count(User.id)))
        return result.first() or 0
    
    def get_all_users(self) -> List[User]:
        """모든 사용자 조회 (페이지네이션 없음)"""
        return self.db.exec(select(User).order_by(User.created_at.desc())).all()


class JWTService:
    """JWT 토큰 관리 서비스"""
    
    @staticmethod
    def create_access_token(user: User) -> str:
        """액세스 토큰 생성"""
        payload = {
            "user_id": user.id,
            "email": user.email,
            "exp": datetime.utcnow() + timedelta(hours=24),  # 24시간 만료
            "iat": datetime.utcnow(),
            "type": "access"
        }
        
        return jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")
    
    @staticmethod
    def verify_token(token: str) -> Optional[Dict[str, Any]]:
        """토큰 검증 및 페이로드 반환"""
        try:
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
            return payload
        except jwt.ExpiredSignatureError:
            logger.warning("토큰이 만료되었습니다")
            return None
        except jwt.InvalidTokenError:
            logger.warning("유효하지 않은 토큰입니다")
            return None
    
    @staticmethod
    def get_user_from_token(token: str, db: Session) -> Optional[User]:
        """토큰에서 사용자 정보 추출"""
        payload = JWTService.verify_token(token)
        if not payload:
            return None
        
        user_id = payload.get("user_id")
        if not user_id:
            return None
        
        return db.exec(
            select(User).where(User.id == user_id)
        ).first()


class UserAccountSetupService:
    """사용자 가입 시 자동 계좌 생성 서비스"""
    
    @staticmethod
    def create_default_accounts(user_id: int, db: Session) -> List[BankAccount]:
        """사용자 가입 시 기본 계좌 자동 생성"""
        try:
            logger.info(f"🏦 사용자 {user_id} 기본 계좌 생성 시작")
            
            # 기본 계좌 타입들
            default_accounts = [
                {
                    "bank_name": "신한은행",
                    "account_type": "수시입출금",
                    "account_name": "신한은행 입출금 통장",
                    "balance": 1000000,  # 100만원 초기 잔액
                    "description": "일상적인 입출금을 위한 기본 통장"
                },
                {
                    "bank_name": "신한은행",
                    "account_type": "예금",
                    "account_name": "신한은행 정기예금",
                    "balance": 5000000,  # 500만원 초기 잔액
                    "description": "안전한 자산 증식을 위한 정기예금"
                },
                {
                    "bank_name": "신한카드",
                    "account_type": "신용카드",
                    "account_name": "신한카드 체크카드",
                    "balance": 0,  # 신용카드는 잔액 없음
                    "description": "일상 결제를 위한 체크카드"
                }
            ]
            
            accounts = []
            for i, account_info in enumerate(default_accounts):
                # 계좌번호 생성 (신한은행 형식: 110-XXX-XXXXXX)
                if account_info["bank_name"] == "신한은행":
                    account_number = f"110-{random.randint(100, 999)}-{random.randint(100000, 999999)}"
                else:
                    account_number = f"{random.randint(1000000000000000, 9999999999999999)}"
                
                account = BankAccount(
                    user_id=user_id,
                    account_number=account_number,
                    bank_name=account_info["bank_name"],
                    account_type=account_info["account_type"],
                    account_name=account_info["account_name"],
                    balance=account_info["balance"],
                    currency="KRW",
                    is_active=True,
                    created_date=datetime.now(),
                    last_transaction_date=datetime.now(),
                    created_at=datetime.now(),
                    updated_at=datetime.now()
                )
                
                accounts.append(account)
                db.add(account)
                logger.info(f"✅ 계좌 생성: {account_info['bank_name']} {account_info['account_type']}")
            
            # 신용점수 초기화
            credit_score = CreditScore(
                user_id=user_id,
                score=700,  # 기본 신용점수
                grade="B",
                last_updated=datetime.now(),
                credit_limit=5000000,  # 500만원 신용한도
                used_credit=0,
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            db.add(credit_score)
            
            db.commit()
            logger.info(f"✅ 사용자 {user_id} 기본 계좌 및 신용점수 생성 완료")
            return accounts
            
        except Exception as e:
            logger.error(f"❌ 기본 계좌 생성 실패: {e}")
            db.rollback()
            raise e
    
    @staticmethod
    def create_initial_transactions(accounts: List[BankAccount], db: Session) -> List[Transaction]:
        """초기 거래 내역 생성 (월급, 용돈 등)"""
        try:
            logger.info(f"💰 초기 거래 내역 생성 시작")
            
            transactions = []
            current_date = datetime.now()
            
            for account in accounts:
                if account.account_type == "수시입출금":
                    # 월급 입금
                    salary_transaction = Transaction(
                        account_id=account.id,
                        transaction_type="입금",
                        amount=3000000,  # 300만원 월급
                        balance_after=account.balance + 3000000,
                        description="월급",
                        category="수입",
                        transaction_date=current_date - timedelta(days=5),
                        created_at=current_date
                    )
                    transactions.append(salary_transaction)
                    db.add(salary_transaction)
                    
                    # 용돈 출금
                    allowance_transaction = Transaction(
                        account_id=account.id,
                        transaction_type="출금",
                        amount=-500000,  # 50만원 용돈
                        balance_after=account.balance + 3000000 - 500000,
                        description="용돈",
                        category="생활비",
                        transaction_date=current_date - timedelta(days=3),
                        created_at=current_date
                    )
                    transactions.append(allowance_transaction)
                    db.add(allowance_transaction)
                    
                    # 교통비
                    transport_transaction = Transaction(
                        account_id=account.id,
                        transaction_type="출금",
                        amount=-100000,  # 10만원 교통비
                        balance_after=account.balance + 3000000 - 500000 - 100000,
                        description="교통비",
                        category="교통비",
                        transaction_date=current_date - timedelta(days=1),
                        created_at=current_date
                    )
                    transactions.append(transport_transaction)
                    db.add(transport_transaction)
                    
                elif account.account_type == "예금":
                    # 이자 입금
                    interest_transaction = Transaction(
                        account_id=account.id,
                        transaction_type="입금",
                        amount=50000,  # 5만원 이자
                        balance_after=account.balance + 50000,
                        description="이자지급",
                        category="이자",
                        transaction_date=current_date - timedelta(days=2),
                        created_at=current_date
                    )
                    transactions.append(interest_transaction)
                    db.add(interest_transaction)
            
            db.commit()
            logger.info(f"✅ 초기 거래 내역 {len(transactions)}건 생성 완료")
            return transactions
            
        except Exception as e:
            logger.error(f"❌ 초기 거래 내역 생성 실패: {e}")
            db.rollback()
            raise e
    
    @staticmethod
    def setup_user_financial_accounts(user_id: int, db: Session) -> Dict[str, Any]:
        """사용자 가입 시 전체 금융 계좌 설정"""
        try:
            logger.info(f"🏦 사용자 {user_id} 금융 계좌 전체 설정 시작")
            
            # 1. 기본 계좌 생성
            accounts = UserAccountSetupService.create_default_accounts(user_id, db)
            
            # 2. 초기 거래 내역 생성
            transactions = UserAccountSetupService.create_initial_transactions(accounts, db)
            
            # 3. 계좌 잔액 업데이트 (거래 내역 반영)
            for account in accounts:
                account_transactions = [t for t in transactions if t.account_id == account.id]
                if account_transactions:
                    # 거래 내역의 마지막 잔액으로 업데이트
                    last_transaction = max(account_transactions, key=lambda x: x.transaction_date)
                    account.balance = last_transaction.balance_after
                    account.last_transaction_date = last_transaction.transaction_date
                    account.updated_at = datetime.now()
            
            db.commit()
            
            result = {
                "accounts": accounts,
                "transactions": transactions,
                "message": "사용자 금융 계좌 설정 완료"
            }
            
            logger.info(f"✅ 사용자 {user_id} 금융 계좌 전체 설정 완료")
            return result
            
        except Exception as e:
            logger.error(f"❌ 사용자 금융 계좌 설정 실패: {e}")
            db.rollback()
            raise e
