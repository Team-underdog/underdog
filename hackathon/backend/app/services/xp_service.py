from sqlmodel import Session, select, func
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import json
from ..models.xp import (
    UserXP, XPActivity, XPActivityType, XPAddRequest, XPResponse, UserProgress
)
from ..core.xp_rules import add_credo, to_response
from ..db.session import get_session


class XPService:
    """크레도 기반 성장 시스템 서비스"""
    
    # 활동별 크레도 점수 (주요 성장 지표)
    ACTIVITY_CREDO_SCORES = {
        XPActivityType.TRANSACTION: 2,
        XPActivityType.SAVING: 5,
        XPActivityType.INVESTMENT: 10,
        XPActivityType.BUDGET_PLANNING: 8,
        XPActivityType.FINANCIAL_GOAL: 20,
        XPActivityType.QUEST_COMPLETE: 15,
        XPActivityType.DAILY_QUEST: 5,
        XPActivityType.WEEKLY_QUEST: 30,
        XPActivityType.ACHIEVEMENT: 50,
        XPActivityType.FINANCIAL_EDUCATION: 10,
        XPActivityType.ARTICLE_READ: 3,
        XPActivityType.COURSE_COMPLETE: 50,
        XPActivityType.POST_SHARE: 5,
        XPActivityType.COMMENT: 2,
        XPActivityType.LIKE: 1,
        XPActivityType.DAILY_LOGIN: 2,
        XPActivityType.STREAK_BONUS: 10
    }
    
    # 활동별 XP 점수 (보조 지표)
    ACTIVITY_XP_SCORES = {
        XPActivityType.TRANSACTION: 10,
        XPActivityType.SAVING: 25,
        XPActivityType.INVESTMENT: 50,
        XPActivityType.BUDGET_PLANNING: 30,
        XPActivityType.FINANCIAL_GOAL: 100,
        XPActivityType.QUEST_COMPLETE: 75,
        XPActivityType.DAILY_QUEST: 25,
        XPActivityType.WEEKLY_QUEST: 150,
        XPActivityType.ACHIEVEMENT: 200,
        XPActivityType.FINANCIAL_EDUCATION: 40,
        XPActivityType.ARTICLE_READ: 15,
        XPActivityType.COURSE_COMPLETE: 200,
        XPActivityType.POST_SHARE: 20,
        XPActivityType.COMMENT: 10,
        XPActivityType.LIKE: 5,
        XPActivityType.DAILY_LOGIN: 10,
        XPActivityType.STREAK_BONUS: 50
    }

    @staticmethod
    def get_or_create_user_xp(user_id: int) -> UserXP:
        """사용자 크레도 데이터 가져오기 또는 생성"""
        session = next(get_session())
        try:
            user_xp = session.exec(
                select(UserXP).where(UserXP.user_id == user_id)
            ).first()
            
            if not user_xp:
                user_xp = UserXP(
                    user_id=user_id,
                    current_level=1,
                    current_xp=0,
                    total_xp=0,
                    credo_score=0,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                session.add(user_xp)
                session.commit()
                session.refresh(user_xp)
            
            return user_xp
        finally:
            session.close()

    @staticmethod
    def get_user_progress(user_id: int) -> UserProgress:
        """사용자 진행률 정보 가져오기"""
        user_xp = XPService.get_or_create_user_xp(user_id)
        
        # 크레도 기반 레벨업 계산
        credo_to_next = XPService._calculate_credo_to_next(user_xp.current_level)
        progress = (user_xp.credo_score / credo_to_next * 100) if credo_to_next > 0 else 100
        
        return UserProgress(
            user_id=user_id,
            current_level=user_xp.current_level,
            current_credo=user_xp.credo_score,
            credo_to_next=credo_to_next,
            total_credo=user_xp.credo_score,
            current_xp=user_xp.current_xp,
            total_xp=user_xp.total_xp,
            progress=progress,
            last_activity_at=user_xp.last_activity_at
        )

    @staticmethod
    def add_credo_for_activity(
        user_id: int, 
        activity_type: XPActivityType, 
        description: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> XPResponse:
        """활동에 따른 크레도 점수 추가"""
        user_xp = XPService.get_or_create_user_xp(user_id)
        
        # 크레도와 XP 점수 계산
        credo_gained = XPService.ACTIVITY_CREDO_SCORES.get(activity_type, 0)
        xp_gained = XPService.ACTIVITY_XP_SCORES.get(activity_type, 0)
        
        # 크레도 기반 레벨업 계산
        old_level = user_xp.current_level
        new_level, new_credo, credo_to_next, leveled_up = add_credo(
            user_xp.current_level, user_xp.credo_score, credo_gained
        )
        
        # 데이터베이스 업데이트
        session = next(get_session())
        try:
            # UserXP 업데이트
            user_xp.current_level = new_level
            user_xp.current_xp += xp_gained
            user_xp.total_xp += xp_gained
            user_xp.credo_score = new_credo
            user_xp.last_activity_at = datetime.utcnow()
            user_xp.updated_at = datetime.utcnow()
            
            session.add(user_xp)
            
            # 활동 기록
            XPService._record_activity(
                session, user_xp.id, activity_type, xp_gained, credo_gained, description, metadata
            )
            
            session.commit()
            session.refresh(user_xp)
        finally:
            session.close()
        
        # 진행률 계산
        progress = (new_credo / credo_to_next * 100) if credo_to_next > 0 else 100
        
        return XPResponse(
            level=new_level,
            xp=user_xp.current_xp,
            xp_to_next=credo_to_next,
            total_xp=user_xp.total_xp,
            credo_score=user_xp.credo_score,
            progress=progress,
            leveled_up=leveled_up,
            recent_activities=XPService._get_recent_activities(user_xp.id)
        )

    @staticmethod
    def _calculate_credo_to_next(level: int) -> int:
        """다음 레벨까지 필요한 크레도 점수 계산"""
        from ..core.xp_rules import compute_credo_to_next
        return compute_credo_to_next(level)

    @staticmethod
    def _record_activity(
        session: Session,
        user_xp_id: int,
        activity_type: XPActivityType,
        xp_gained: int,
        credo_gained: int,
        description: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ):
        """활동 기록 저장"""
        # 메타데이터를 JSON 문자열로 변환
        metadata_json = json.dumps(metadata or {}, ensure_ascii=False)
        
        activity = XPActivity(
            user_xp_id=user_xp_id,
            activity_type=activity_type,
            xp_gained=xp_gained,
            credo_gained=credo_gained,
            description=description,
            activity_metadata=metadata_json,
            created_at=datetime.utcnow()
        )
        session.add(activity)

    @staticmethod
    def _get_recent_activities(user_xp_id: int) -> List[Dict[str, Any]]:
        """최근 활동 내역 가져오기"""
        session = next(get_session())
        try:
            activities = session.exec(
                select(XPActivity)
                .where(XPActivity.user_xp_id == user_xp_id)
                .order_by(XPActivity.created_at.desc())
                .limit(10)
            ).all()
            
            return [
                {
                    "type": activity.activity_type,
                    "xp_gained": activity.xp_gained,
                    "credo_gained": activity.credo_gained,
                    "description": activity.description,
                    "created_at": activity.created_at.isoformat()
                }
                for activity in activities
            ]
        finally:
            session.close()

    @staticmethod
    def get_leaderboard(limit: int = 10) -> List[Dict[str, Any]]:
        """크레도 점수 기반 리더보드"""
        session = next(get_session())
        try:
            users = session.exec(
                select(UserXP)
                .order_by(UserXP.credo_score.desc())
                .limit(limit)
            ).all()
            
            return [
                {
                    "user_id": user.user_id,
                    "credo_score": user.credo_score,
                    "level": user.current_level,
                    "total_xp": user.total_xp
                }
                for user in users
            ]
        finally:
            session.close()

    @staticmethod
    def deduct_credo_for_post_deletion(
        user_id: int,
        post_id: str,
        description: str = "크로니클 포스트 삭제"
    ) -> XPResponse:
        """포스트 삭제 시 크레도 점수 차감"""
        user_xp = XPService.get_or_create_user_xp(user_id)
        
        # 삭제 시 차감할 크레도 점수 (기본값: 2점)
        credo_deduction = 2
        
        # 크레도 점수 차감 (음수 방지)
        old_credo = user_xp.credo_score
        new_credo = max(0, old_credo - credo_deduction)
        
        # 데이터베이스 업데이트
        session = next(get_session())
        try:
            # UserXP 업데이트
            user_xp.credo_score = new_credo
            user_xp.last_activity_at = datetime.utcnow()
            user_xp.updated_at = datetime.utcnow()
            
            session.add(user_xp)
            
            # 삭제 활동 기록 (차감된 점수를 음수로 기록)
            XPService._record_activity(
                session, user_xp.id, XPActivityType.POST_SHARE, 0, -credo_deduction, 
                description, {"post_id": post_id, "action": "delete", "deduction": credo_deduction}
            )
            
            session.commit()
            session.refresh(user_xp)
        finally:
            session.close()
        
        # 진행률 계산
        credo_to_next = XPService._calculate_credo_to_next(user_xp.current_level)
        progress = (new_credo / credo_to_next * 100) if credo_to_next > 0 else 100
        
        return XPResponse(
            level=user_xp.current_level,
            xp=user_xp.current_xp,
            xp_to_next=credo_to_next,
            total_xp=user_xp.total_xp,
            credo_score=user_xp.credo_score,
            progress=progress,
            leveled_up=False,
            recent_activities=XPService._get_recent_activities(user_xp.id)
        )

    @staticmethod
    def update_holland_score(
        user_id: int, 
        holland_type: str, 
        score_increase: int,
        analysis_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Holland 점수 업데이트"""
        session = next(get_session())
        try:
            # 사용자 정보 가져오기
            from ..models.user import User
            user = session.exec(select(User).where(User.id == user_id)).first()
            
            if not user:
                raise ValueError(f"사용자 {user_id}를 찾을 수 없습니다.")
            
            # Holland 점수 업데이트
            old_score = user.holland_score or 0
            new_score = max(0, old_score + score_increase)  # 음수 방지
            
            user.holland_type = holland_type
            user.holland_score = new_score
            user.holland_analysis_date = datetime.utcnow()
            user.updated_at = datetime.utcnow()
            
            session.add(user)
            session.commit()
            session.refresh(user)
            
            return {
                "success": True,
                "old_score": old_score,
                "new_score": new_score,
                "holland_type": holland_type,
                "analysis_data": analysis_data,
                "updated_at": user.updated_at.isoformat()
            }
            
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()
