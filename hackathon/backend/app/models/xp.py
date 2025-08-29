from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
import json


class XPActivityType(str, Enum):
    """XP 활동 유형"""
    # 금융 활동
    TRANSACTION = "transaction"
    SAVING = "saving"
    INVESTMENT = "investment"
    BUDGET_PLANNING = "budget_planning"
    FINANCIAL_GOAL = "financial_goal"
    
    # 퀘스트 활동
    QUEST_COMPLETE = "quest_complete"
    DAILY_QUEST = "daily_quest"
    WEEKLY_QUEST = "weekly_quest"
    ACHIEVEMENT = "achievement"
    
    # 학습 활동
    FINANCIAL_EDUCATION = "financial_education"
    ARTICLE_READ = "article_read"
    COURSE_COMPLETE = "course_complete"
    
    # 소셜 활동
    POST_SHARE = "post_share"
    COMMENT = "comment"
    LIKE = "like"
    
    # 로그인 활동
    DAILY_LOGIN = "daily_login"
    STREAK_BONUS = "streak_bonus"


class UserXP(SQLModel, table=True):
    """사용자 크레도 및 XP 정보"""
    __tablename__ = "user_xp"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", description="사용자 ID")
    
    # 크레도 기반 레벨 시스템 (주요 성장 지표)
    current_level: int = Field(default=1, description="현재 레벨")
    credo_score: int = Field(default=0, description="현재 크레도 점수")
    
    # XP 시스템 (보조 지표)
    current_xp: int = Field(default=0, description="현재 XP")
    total_xp: int = Field(default=0, description="총 획득 XP")
    
    # 메타데이터
    last_activity_at: Optional[datetime] = Field(default=None, description="마지막 활동 시간")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="생성 시간")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="업데이트 시간")
    
    # 관계 설정
    user: Optional["User"] = Relationship(back_populates="xp_data")
    activities: List["XPActivity"] = Relationship(back_populates="user_xp")


class XPActivity(SQLModel, table=True):
    """XP 활동 기록"""
    __tablename__ = "xp_activity"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_xp_id: int = Field(foreign_key="user_xp.id", description="사용자 XP ID")
    
    # 활동 정보
    activity_type: XPActivityType = Field(description="활동 유형")
    description: Optional[str] = Field(default=None, description="활동 설명")
    
    # 획득 점수
    xp_gained: int = Field(default=0, description="획득한 XP")
    credo_gained: int = Field(default=0, description="획득한 크레도 점수")
    
    # 메타데이터 (JSON 문자열로 저장)
    activity_metadata: str = Field(default="{}", description="활동 메타데이터 (JSON)")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="생성 시간")
    
    # 관계 설정
    user_xp: Optional[UserXP] = Relationship(back_populates="activities")

    def get_metadata(self) -> Dict[str, Any]:
        """메타데이터를 딕셔너리로 반환"""
        try:
            return json.loads(self.activity_metadata)
        except (json.JSONDecodeError, TypeError):
            return {}
    
    def set_metadata(self, data: Dict[str, Any]):
        """메타데이터를 JSON 문자열로 설정"""
        self.activity_metadata = json.dumps(data, ensure_ascii=False)


class XPAddRequest(SQLModel):
    """XP 추가 요청 모델"""
    activity_type: XPActivityType
    description: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class XPResponse(SQLModel):
    """XP 응답 모델"""
    level: int
    xp: int
    xp_to_next: int
    total_xp: int
    credo_score: int
    progress: float
    leveled_up: bool
    recent_activities: List[Dict[str, Any]]


class UserProgress(SQLModel):
    """사용자 진행률 모델"""
    user_id: int
    current_level: int
    current_credo: int
    credo_to_next: int
    total_credo: int
    current_xp: int
    total_xp: int
    progress: float
    last_activity_at: Optional[datetime] = None
