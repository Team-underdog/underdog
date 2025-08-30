from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
from pydantic import BaseModel, EmailStr
import hashlib

if TYPE_CHECKING:
    from .financial import BankAccount, UserProduct
    from .xp import UserXP


class User(SQLModel, table=True):
    """자체 회원 관리 모델"""
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # 회원 기본 정보
    email: str = Field(unique=True, index=True, description="이메일 주소")
    password_hash: str = Field(description="해시된 비밀번호")
    firebase_uid: Optional[str] = Field(default=None, unique=True, index=True, description="Firebase UID")
    
    # SSAFY 연동 정보
    ssafy_user_id: Optional[str] = Field(default=None, unique=True, index=True, description="SSAFY API userId")
    ssafy_user_key: Optional[str] = Field(default=None, description="SSAFY API userKey")
    ssafy_user_name: Optional[str] = Field(default=None, description="SSAFY API userName")
    ssafy_institution_code: Optional[str] = Field(default=None, description="SSAFY API institutionCode")
    
    # 프로필 정보
    display_name: Optional[str] = Field(default=None, description="표시될 이름")
    profile_image: Optional[str] = Field(default=None, description="프로필 이미지 URL")
    
    # 학습 관련 정보
    current_university: Optional[str] = Field(default=None, description="현재 다니는 대학교")
    current_department: Optional[str] = Field(default=None, description="현재 전공/학과")
    grade_level: Optional[int] = Field(default=None, description="학년")
    
    # Holland 성향 정보
    holland_type: Optional[str] = Field(default=None, description="Holland 직업 성향 코드 (RIASEC)")
    holland_score: Optional[int] = Field(default=0, description="Holland 성향 점수")
    holland_analysis_date: Optional[datetime] = Field(default=None, description="마지막 Holland 분석 날짜")
    
    # 계정 상태
    is_active: bool = Field(default=True, description="계정 활성화 여부")
    is_verified: bool = Field(default=False, description="이메일 인증 여부")
    
    # 타임스탬프
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_login_at: Optional[datetime] = Field(default=None)
    
    # 관계 정의
    bank_accounts: List["BankAccount"] = Relationship(back_populates="user")
    user_products: List["UserProduct"] = Relationship(back_populates="user")
    xp_data: Optional["UserXP"] = Relationship(back_populates="user")
    
    @classmethod
    def hash_password(cls, password: str) -> str:
        """비밀번호를 해시화"""
        return hashlib.sha256(password.encode()).hexdigest()
    
    def verify_password(self, password: str) -> bool:
        """비밀번호 검증"""
        return self.password_hash == self.hash_password(password)
    
    def update_last_login(self):
        """마지막 로그인 시간 업데이트"""
        self.last_login_at = datetime.utcnow()


# Pydantic 모델들 (API 요청/응답용)
class UserSignupRequest(BaseModel):
    """회원가입 요청 모델"""
    email: EmailStr
    password: str
    display_name: Optional[str] = None
    university: Optional[str] = None
    department: Optional[str] = None
    grade_level: Optional[int] = None
    firebase_uid: Optional[str] = None


class UserLoginRequest(BaseModel):
    """로그인 요청 모델"""
    email: EmailStr
    password: str


class EmailCheckRequest(BaseModel):
    """이메일 중복 확인 요청 모델"""
    email: EmailStr


class EmailCheckResponse(BaseModel):
    """이메일 중복 확인 응답 모델"""
    email: str
    is_available: bool
    is_ssafy_registered: bool
    message: str


class UserResponse(BaseModel):
    """사용자 정보 응답 모델"""
    id: int
    email: str
    display_name: Optional[str] = None
    current_university: Optional[str] = None
    current_department: Optional[str] = None
    grade_level: Optional[int] = None
    profile_image: Optional[str] = None
    is_verified: bool
    created_at: datetime
    last_login_at: Optional[datetime] = None


class LoginResponse(BaseModel):
    """로그인 응답 모델"""
    access_token: str
    token_type: str
    user: UserResponse
    expires_in: int  # 토큰 만료 시간 (초)


class SignupResponse(BaseModel):
    """회원가입 응답 모델"""
    success: bool
    message: str
    user: Optional[UserResponse] = None
