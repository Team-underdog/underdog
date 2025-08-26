import aiohttp
import requests
from typing import Optional, Dict, Any
from sqlmodel import Session, select
from datetime import datetime, timedelta
import jwt
import logging

from ..core.config import settings
from ..models.user import (
    User, 
    EmailCheckResponse,
    UserResponse,
    LoginResponse,
    SignupResponse
)
from ..db.session import get_session

logger = logging.getLogger(__name__)


class SSAFYAPIService:
    """SSAFY API 연동 서비스"""
    
    @staticmethod
    async def check_email_exists(email: str) -> Dict[str, Any]:
        """SSAFY API에서 이메일 존재 여부 확인"""
        try:
            # SSAFY API에 이메일 확인 요청
            # 실제로는 userId로 요청하지만, 이메일 중복 확인 목적으로 사용
            body = {
                "apiKey": settings.SSAFY_API_KEY,
                "userId": email  # 이메일을 userId로 사용
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    settings.SSAFY_LOGIN_URL, 
                    json=body, 
                    timeout=10
                ) as response:
                    
                    if response.status == 200:
                        data = await response.json()
                        # SSAFY API에서 성공 응답이 오면 이미 등록된 이메일
                        if data.get("userKey") or data.get("userId"):
                            return {
                                "exists": True,
                                "ssafy_data": data
                            }
                    
                    # 404나 에러 응답이면 등록되지 않은 이메일
                    return {"exists": False}
                    
        except Exception as e:
            logger.error(f"SSAFY API 이메일 확인 실패: {e}")
            # API 에러시에는 false로 처리하여 회원가입 진행 허용
            return {"exists": False, "error": str(e)}
    
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
        grade_level: Optional[int] = None
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
