from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from typing import List
from ..models.xp import XPAddRequest, XPResponse, UserProgress
from ..services.xp_service import XPService
from ..db.session import get_session
from ..api.auth_v2 import get_current_user
from ..models.user import User

router = APIRouter()

@router.get("/xp/progress/{user_id}", response_model=UserProgress)
async def get_user_progress(user_id: int, session: Session = Depends(get_session)):
    """사용자 크레도 진행률 조회"""
    try:
        progress = XPService.get_user_progress(user_id)
        return progress
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"진행률 조회 실패: {str(e)}")

@router.post("/xp/add", response_model=XPResponse)
async def add_credo_for_activity(
    payload: XPAddRequest, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """활동에 따른 크레도 점수 추가"""
    try:
        # 인증된 사용자의 ID 사용
        user_id = current_user.id
        
        response = XPService.add_credo_for_activity(
            user_id=user_id,
            activity_type=payload.activity_type,
            description=payload.description,
            metadata=payload.metadata
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"크레도 점수 추가 실패: {str(e)}")

@router.get("/xp/me", response_model=UserProgress)
async def get_my_progress(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """현재 로그인한 사용자의 크레도 진행률 조회"""
    try:
        progress = XPService.get_user_progress(current_user.id)
        return progress
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"진행률 조회 실패: {str(e)}")

@router.get("/xp/leaderboard", response_model=List[dict])
async def get_leaderboard(limit: int = 10, session: Session = Depends(get_session)):
    """크레도 점수 기반 리더보드"""
    try:
        leaderboard = XPService.get_leaderboard(limit)
        return leaderboard
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"리더보드 조회 실패: {str(e)}")
