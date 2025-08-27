from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List, Optional
import json
from ..db.session import get_session
from ..models.chronicle import ChroniclePost
from ..models.user import User
from ..api.auth_v2 import get_current_user

router = APIRouter()

@router.get("/chronicle/posts", response_model=List[dict])
async def get_user_chronicles(
    user_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """사용자의 크로니클 포스트 목록 조회"""
    try:
        # user_id가 제공되지 않으면 현재 로그인한 사용자의 포스트 조회
        target_user_id = user_id or current_user.id
        
        statement = select(ChroniclePost).where(ChroniclePost.user_id == target_user_id).order_by(ChroniclePost.timestamp.desc())
        posts = db.exec(statement).all()
        
        # JSON 직렬화 가능한 형태로 변환
        result = []
        for post in posts:
            # JSON 문자열을 파싱하여 객체로 변환
            try:
                rewards = post.rewards if isinstance(post.rewards, dict) else (json.loads(post.rewards) if post.rewards else {})
                user_content = post.user_content if isinstance(post.user_content, dict) else (json.loads(post.user_content) if post.user_content else {})
            except (json.JSONDecodeError, TypeError):
                rewards = {}
                user_content = {}
            
            post_dict = {
                "id": post.id,
                "user_id": post.user_id,
                "type": post.type,
                "title": post.title,
                "description": post.description,
                "timestamp": post.timestamp.isoformat() if post.timestamp else None,
                "rewards": rewards,
                "user_content": user_content
            }
            result.append(post_dict)
        
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"크로니클 포스트 조회 실패: {str(e)}"
        )

@router.get("/chronicle/posts/public", response_model=List[dict])
async def get_public_chronicles(
    db: Session = Depends(get_session)
):
    """공개 크로니클 포스트 목록 조회 (인증 없이)"""
    try:
        statement = select(ChroniclePost).order_by(ChroniclePost.timestamp.desc()).limit(50)
        posts = db.exec(statement).all()
        
        # JSON 직렬화 가능한 형태로 변환
        result = []
        for post in posts:
            # JSON 문자열을 파싱하여 객체로 변환
            try:
                rewards = post.rewards if isinstance(post.rewards, dict) else (json.loads(post.rewards) if post.rewards else {})
                user_content = post.user_content if isinstance(post.user_content, dict) else (json.loads(post.user_content) if post.user_content else {})
            except (json.JSONDecodeError, TypeError):
                rewards = {}
                user_content = {}
            
            post_dict = {
                "id": post.id,
                "user_id": post.user_id,
                "type": post.type,
                "title": post.title,
                "description": post.description,
                "timestamp": post.timestamp.isoformat() if post.timestamp else None,
                "rewards": rewards,
                "user_content": user_content
            }
            result.append(post_dict)
        
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"크로니클 포스트 조회 실패: {str(e)}"
        )

@router.post("/chronicle/posts", response_model=dict)
async def create_chronicle_post(
    post_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """새로운 크로니클 포스트 생성"""
    try:
        new_post = ChroniclePost(
            user_id=current_user.id,
            type=post_data.get("type", "user_post"),
            title=post_data.get("title", ""),
            description=post_data.get("description"),
            rewards=post_data.get("rewards", {}),
            user_content=post_data.get("user_content", {})
        )
        
        db.add(new_post)
        db.commit()
        db.refresh(new_post)
        
        return {
            "id": new_post.id,
            "message": "크로니클 포스트가 성공적으로 생성되었습니다."
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"크로니클 포스트 생성 실패: {str(e)}"
        )

@router.delete("/chronicle/posts/{post_id}")
async def delete_chronicle_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """크로니클 포스트 삭제"""
    try:
        statement = select(ChroniclePost).where(
            ChroniclePost.id == post_id,
            ChroniclePost.user_id == current_user.id
        )
        post = db.exec(statement).first()
        
        if not post:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="포스트를 찾을 수 없습니다."
            )
        
        db.delete(post)
        db.commit()
        
        return {"message": "크로니클 포스트가 성공적으로 삭제되었습니다."}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"크로니클 포스트 삭제 실패: {str(e)}"
        )
