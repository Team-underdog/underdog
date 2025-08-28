from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
from enum import Enum

class XPActivityType(str, Enum):
    """XP 획득 활동 타입"""
    # 금융 활동
    TRANSACTION = "transaction"
    SAVING = "saving"
    INVESTMENT = "investment"
    BUDGET_PLANNING = "budget_planning"
    FINANCIAL_GOAL = "financial_goal"
    
    # 퀘스트
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
    
    # 로그인
    DAILY_LOGIN = "daily_login"
    STREAK_BONUS = "streak_bonus"

class UserXP(SQLModel, table=True):
    """사용자 XP 정보"""
    __tablename__ = "user_xp"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", description="사용자 ID")
    current_level: int = Field(default=1, description="현재 레벨")
    current_xp: int = Field(default=0, description="현재 XP")
    total_xp: int = Field(default=0, description="총 획득 XP")
    credo_score: int = Field(default=0, description="크레도 점수")
    last_activity_at: Optional[datetime] = Field(default=None, description="마지막 활동 시간")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="생성 시간")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="업데이트 시간")
    
    # 관계 설정
    user: Optional["User"] = Relationship(back_populates="xp_data")
    activities: List["XPActivity"] = Relationship(back_populates="user_xp")

class XPActivity(SQLModel, table=True):
    """XP 활동 기록"""
    __tablename__ = "xp_activities"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_xp_id: int = Field(foreign_key="user_xp.id", description="사용자 XP ID")
    activity_type: XPActivityType = Field(description="활동 타입")
    xp_gained: int = Field(description="획득한 XP")
    credo_gained: int = Field(default=0, description="획득한 크레도")
    description: Optional[str] = Field(default=None, description="활동 설명")
    activity_metadata: Optional[str] = Field(default=None, description="추가 메타데이터 (JSON)")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="생성 시간")
    
    # 관계 설정
    user_xp: Optional[UserXP] = Relationship(back_populates="activities")

class XPAddRequest(SQLModel):
    """XP 추가 요청"""
    user_id: int = Field(description="사용자 ID")
    activity_type: XPActivityType = Field(description="활동 타입")
    xp_amount: Optional[int] = Field(default=None, description="XP 양 (자동 계산 시 None)")
    credo_amount: Optional[int] = Field(default=None, description="크레도 양 (자동 계산 시 None)")
    description: Optional[str] = Field(default=None, description="활동 설명")
    activity_metadata: Optional[dict] = Field(default=None, description="추가 메타데이터")

class XPResponse(SQLModel):
    """XP 응답"""
    level: int = Field(description="현재 레벨")
    xp: int = Field(description="현재 XP")
    xp_to_next: int = Field(description="다음 레벨까지 필요한 XP")
    total_xp: int = Field(description="총 획득 XP")
    credo_score: int = Field(description="크레도 점수")
    progress: float = Field(description="현재 레벨 진행률 (0-100)")
    leveled_up: bool = Field(description="레벨업 여부")
    recent_activities: Optional[List[dict]] = Field(default=None, description="최근 활동 목록")

class UserProgress(SQLModel):
    """사용자 진행 상황 요약"""
    user_id: int = Field(description="사용자 ID")
    level: int = Field(description="현재 레벨")
    xp: int = Field(description="현재 XP")
    xp_to_next: int = Field(description="다음 레벨까지 필요한 XP")
    credo_score: int = Field(description="크레도 점수")
    total_activities: int = Field(description="총 활동 수")
    streak_days: int = Field(description="연속 로그인 일수")
