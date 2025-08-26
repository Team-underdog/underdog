from fastapi import APIRouter, HTTPException, Depends, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session
from typing import Optional
from datetime import datetime

from ..db.session import get_session
from ..models.user import (
    UserSignupRequest,
    UserLoginRequest,
    EmailCheckRequest,
    EmailCheckResponse,
    UserResponse,
    LoginResponse,
    SignupResponse
)
from ..services.user_service import UserService, JWTService

router = APIRouter()
security = HTTPBearer()


def get_user_service(db: Session = Depends(get_session)) -> UserService:
    """UserService 의존성 주입"""
    return UserService(db)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_session)
) -> UserResponse:
    """현재 인증된 사용자 정보 반환"""
    token = credentials.credentials
    user = JWTService.get_user_from_token(token, db)
    
    if not user:
        raise HTTPException(
            status_code=401,
            detail="유효하지 않은 토큰입니다",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return UserResponse(
        id=user.id,
        email=user.email,
        display_name=user.display_name,
        current_university=user.current_university,
        current_department=user.current_department,
        grade_level=user.grade_level,
        profile_image=user.profile_image,
        is_verified=user.is_verified,
        created_at=user.created_at,
        last_login_at=user.last_login_at
    )


@router.post("/auth/check-email", response_model=EmailCheckResponse)
async def check_email(
    request: EmailCheckRequest,
    user_service: UserService = Depends(get_user_service)
):
    """이메일 사용 가능 여부 확인 (SSAFY API + 자체 DB 중복 확인)"""
    try:
        result = await user_service.check_email_availability(request.email)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"이메일 확인 중 오류가 발생했습니다: {str(e)}"
        )


@router.post("/auth/signup", response_model=SignupResponse)
async def signup(
    request: UserSignupRequest,
    user_service: UserService = Depends(get_user_service)
):
    """회원가입 (이메일 + 비밀번호)"""
    try:
        # 비밀번호 검증
        if len(request.password) < 6:
            raise HTTPException(
                status_code=400,
                detail="비밀번호는 최소 6자 이상이어야 합니다."
            )
        
        result = await user_service.create_user(
            email=request.email,
            password=request.password,
            display_name=request.display_name,
            university=request.university,
            department=request.department,
            grade_level=request.grade_level
        )
        
        if not result.success:
            raise HTTPException(status_code=400, detail=result.message)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"회원가입 중 오류가 발생했습니다: {str(e)}"
        )


@router.post("/auth/login", response_model=LoginResponse)
async def login(
    request: UserLoginRequest,
    user_service: UserService = Depends(get_user_service)
):
    """로그인 (이메일 + 비밀번호)"""
    try:
        user = user_service.authenticate_user(request.email, request.password)
        
        if not user:
            raise HTTPException(
                status_code=401,
                detail="이메일 또는 비밀번호가 잘못되었습니다."
            )
        
        # JWT 토큰 생성
        access_token = JWTService.create_access_token(user)
        
        user_response = UserResponse(
            id=user.id,
            email=user.email,
            display_name=user.display_name,
            current_university=user.current_university,
            current_department=user.current_department,
            grade_level=user.grade_level,
            profile_image=user.profile_image,
            is_verified=user.is_verified,
            created_at=user.created_at,
            last_login_at=user.last_login_at
        )
        
        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            user=user_response,
            expires_in=24 * 3600  # 24시간
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"로그인 중 오류가 발생했습니다: {str(e)}"
        )


@router.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: UserResponse = Depends(get_current_user)
):
    """현재 로그인된 사용자 정보 조회"""
    return current_user


@router.put("/auth/profile", response_model=UserResponse)
async def update_profile(
    display_name: Optional[str] = None,
    university: Optional[str] = None,
    department: Optional[str] = None,
    grade_level: Optional[int] = None,
    current_user: UserResponse = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service)
):
    """사용자 프로필 업데이트"""
    try:
        user = user_service.get_user_by_id(current_user.id)
        if not user:
            raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
        
        # 업데이트할 필드들
        if display_name is not None:
            user.display_name = display_name
        if university is not None:
            user.current_university = university
        if department is not None:
            user.current_department = department
        if grade_level is not None:
            user.grade_level = grade_level
        
        user.updated_at = datetime.utcnow()
        
        user_service.db.add(user)
        user_service.db.commit()
        user_service.db.refresh(user)
        
        return UserResponse(
            id=user.id,
            email=user.email,
            display_name=user.display_name,
            current_university=user.current_university,
            current_department=user.current_department,
            grade_level=user.grade_level,
            profile_image=user.profile_image,
            is_verified=user.is_verified,
            created_at=user.created_at,
            last_login_at=user.last_login_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"프로필 업데이트 중 오류가 발생했습니다: {str(e)}"
        )


@router.post("/auth/change-password")
async def change_password(
    current_password: str,
    new_password: str,
    current_user: UserResponse = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service)
):
    """비밀번호 변경"""
    try:
        user = user_service.get_user_by_id(current_user.id)
        if not user:
            raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
        
        # 현재 비밀번호 확인
        if not user.verify_password(current_password):
            raise HTTPException(
                status_code=400,
                detail="현재 비밀번호가 일치하지 않습니다."
            )
        
        # 새 비밀번호 검증
        if len(new_password) < 6:
            raise HTTPException(
                status_code=400,
                detail="새 비밀번호는 최소 6자 이상이어야 합니다."
            )
        
        # 비밀번호 업데이트
        user.password_hash = user.hash_password(new_password)
        user.updated_at = datetime.utcnow()
        
        user_service.db.add(user)
        user_service.db.commit()
        
        return {"message": "비밀번호가 성공적으로 변경되었습니다."}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"비밀번호 변경 중 오류가 발생했습니다: {str(e)}"
        )


@router.delete("/auth/account")
async def delete_account(
    password: str,
    current_user: UserResponse = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service)
):
    """회원 탈퇴"""
    try:
        user = user_service.get_user_by_id(current_user.id)
        if not user:
            raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
        
        # 비밀번호 확인
        if not user.verify_password(password):
            raise HTTPException(
                status_code=400,
                detail="비밀번호가 일치하지 않습니다."
            )
        
        # 계정 비활성화 (완전 삭제 대신)
        user.is_active = False
        user.updated_at = datetime.utcnow()
        
        user_service.db.add(user)
        user_service.db.commit()
        
        return {"message": "회원 탈퇴가 완료되었습니다."}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"회원 탈퇴 중 오류가 발생했습니다: {str(e)}"
        )
