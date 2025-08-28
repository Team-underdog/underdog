from sqlmodel import Session, select, func
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import json
from ..models.xp import (
    UserXP, XPActivity, XPActivityType, XPAddRequest, XPResponse, UserProgress
)
from ..core.xp_rules import add_xp, to_response
from ..db.session import get_session

class XPService:
    """XP 시스템 서비스"""
    
    # 활동별 XP 점수 (기본값)
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
    
    # 활동별 크레도 점수 (기본값)
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

    @staticmethod
    def get_or_create_user_xp(user_id: int) -> UserXP:
        """사용자 XP 데이터 가져오기 또는 생성"""
        with get_session() as session:
            # 기존 XP 데이터 확인
            statement = select(UserXP).where(UserXP.user_id == user_id)
            user_xp = session.exec(statement).first()
            
            if not user_xp:
                # 새 사용자: 초기 XP 데이터 생성
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
                
                # 첫 로그인 활동 기록
                XPService._record_activity(
                    session, user_xp.id, XPActivityType.DAILY_LOGIN, 
                    XPService.ACTIVITY_XP_SCORES[XPActivityType.DAILY_LOGIN],
                    XPService.ACTIVITY_CREDO_SCORES[XPActivityType.DAILY_LOGIN],
                    "첫 로그인"
                )
            
            return user_xp

    @staticmethod
    def get_user_progress(user_id: int) -> UserProgress:
        """사용자 진행 상황 조회"""
        user_xp = XPService.get_or_create_user_xp(user_id)
        
        # 다음 레벨까지 필요한 XP 계산
        xp_to_next = XPService._calculate_xp_to_next(user_xp.current_level)
        
        # 진행률 계산
        progress = (user_xp.current_xp / xp_to_next * 100) if xp_to_next > 0 else 100
        
        # 총 활동 수 계산
        with get_session() as session:
            statement = select(func.count(XPActivity.id)).where(XPActivity.user_xp_id == user_xp.id)
            total_activities = session.exec(statement).first() or 0
        
        # 연속 로그인 일수 계산
        streak_days = XPService._calculate_streak_days(user_id)
        
        return UserProgress(
            user_id=user_id,
            level=user_xp.current_level,
            xp=user_xp.current_xp,
            xp_to_next=xp_to_next,
            credo_score=user_xp.credo_score,
            total_activities=total_activities,
            streak_days=streak_days
        )

    @staticmethod
    def add_xp_for_activity(
        user_id: int, 
        activity_type: XPActivityType, 
        description: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> XPResponse:
        """활동에 따른 XP 추가"""
        user_xp = XPService.get_or_create_user_xp(user_id)
        
        # XP와 크레도 점수 계산
        xp_gained = XPService.ACTIVITY_XP_SCORES.get(activity_type, 0)
        credo_gained = XPService.ACTIVITY_CREDO_SCORES.get(activity_type, 0)
        
        # 레벨업 계산
        old_level = user_xp.current_level
        new_level, new_xp, xp_to_next, leveled_up = add_xp(
            user_xp.current_level, user_xp.current_xp, xp_gained
        )
        
        # 데이터베이스 업데이트
        with get_session() as session:
            # UserXP 업데이트
            user_xp.current_level = new_level
            user_xp.current_xp = new_xp
            user_xp.total_xp += xp_gained
            user_xp.credo_score += credo_gained
            user_xp.last_activity_at = datetime.utcnow()
            user_xp.updated_at = datetime.utcnow()
            
            session.add(user_xp)
            
            # 활동 기록
            XPService._record_activity(
                session, user_xp.id, activity_type, xp_gained, credo_gained, description, activity_metadata
            )
            
            session.commit()
            session.refresh(user_xp)
        
        # 진행률 계산
        progress = (new_xp / xp_to_next * 100) if xp_to_next > 0 else 100
        
        return XPResponse(
            level=new_level,
            xp=new_xp,
            xp_to_next=xp_to_next,
            total_xp=user_xp.total_xp,
            credo_score=user_xp.credo_score,
            progress=progress,
            leveled_up=leveled_up,
            recent_activities=XPService._get_recent_activities(user_xp.id)
        )

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
        """활동 기록"""
        activity = XPActivity(
            user_xp_id=user_xp_id,
            activity_type=activity_type,
            xp_gained=xp_gained,
            credo_gained=credo_gained,
            description=description,
            activity_metadata=json.dumps(activity_metadata) if activity_metadata else None,
            created_at=datetime.utcnow()
        )
        session.add(activity)

    @staticmethod
    def _calculate_xp_to_next(level: int) -> int:
        """다음 레벨까지 필요한 XP 계산"""
        if level <= 1:
            return 100
        elif level <= 5:
            return 100 * (2 ** (level - 1))
        else:
            return 100 * (1.5 ** (level - 1))

    @staticmethod
    def _calculate_streak_days(user_id: int) -> int:
        """연속 로그인 일수 계산"""
        with get_session() as session:
            # 최근 30일간의 로그인 활동 확인
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            
            statement = select(XPActivity).where(
                XPActivity.user_xp_id == user_id,
                XPActivity.activity_type == XPActivityType.DAILY_LOGIN,
                XPActivity.created_at >= thirty_days_ago
            ).order_by(XPActivity.created_at.desc())
            
            activities = session.exec(statement).all()
            
            if not activities:
                return 0
            
            # 연속 일수 계산
            streak = 0
            current_date = datetime.utcnow().date()
            
            for activity in activities:
                activity_date = activity.created_at.date()
                if current_date - activity_date == timedelta(days=streak):
                    streak += 1
                else:
                    break
            
            return streak

    @staticmethod
    def _get_recent_activities(user_xp_id: int, limit: int = 5) -> List[Dict[str, Any]]:
        """최근 활동 목록 조회"""
        with get_session() as session:
            statement = select(XPActivity).where(
                XPActivity.user_xp_id == user_xp_id
            ).order_by(XPActivity.created_at.desc()).limit(limit)
            
            activities = session.exec(statement).all()
            
            return [
                {
                    "type": activity.activity_type.value,
                    "xp_gained": activity.xp_gained,
                    "credo_gained": activity.credo_gained,
                    "description": activity.description,
                    "created_at": activity.created_at.isoformat()
                }
                for activity in activities
            ]

    @staticmethod
    def get_leaderboard(limit: int = 10) -> List[Dict[str, Any]]:
        """리더보드 조회"""
        with get_session() as session:
            statement = select(UserXP).order_by(
                UserXP.current_level.desc(),
                UserXP.current_xp.desc()
            ).limit(limit)
            
            users = session.exec(statement).all()
            
            return [
                {
                    "user_id": user.user_id,
                    "level": user.current_level,
                    "xp": user.current_xp,
                    "credo_score": user.credo_score,
                    "total_xp": user.total_xp
                }
                for user in users
            ]
