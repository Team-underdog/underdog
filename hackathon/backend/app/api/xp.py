from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from typing import List
from ..models.xp import XPAddRequest, XPResponse, UserProgress
from ..services.xp_service import XPService
from ..db.session import get_session

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
    session: Session = Depends(get_session)
):
    """활동에 따른 크레도 점수 추가"""
    try:
        # 사용자 ID는 JWT 토큰에서 추출해야 하지만, 현재는 요청 본문에서 받음
        # 실제 구현에서는 JWT 토큰 검증 필요
        user_id = 1  # 임시로 고정, 실제로는 JWT에서 추출
        
        response = XPService.add_credo_for_activity(
            user_id=user_id,
            activity_type=payload.activity_type,
            description=payload.description,
            metadata=payload.metadata
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"크레도 점수 추가 실패: {str(e)}")

@router.get("/xp/leaderboard", response_model=List[dict])
async def get_leaderboard(limit: int = 10, session: Session = Depends(get_session)):
    """크레도 점수 기반 리더보드"""
    try:
        leaderboard = XPService.get_leaderboard(limit)
        return leaderboard
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"리더보드 조회 실패: {str(e)}")
