from sqlmodel import SQLModel, Field
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from decimal import Decimal


class SkillCategory(SQLModel, table=True):
    """NCS 10대 직업기초능력 카테고리"""
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # NCS 분류
    ncs_code: str = Field(unique=True, description="NCS 코드")
    ncs_name: str = Field(description="NCS 직업기초능력명")
    ncs_description: str = Field(description="NCS 설명")
    
    # 스킬 트리 시각화
    display_order: int = Field(description="표시 순서")
    icon_name: str = Field(description="아이콘 이름")
    color_theme: str = Field(description="색상 테마")
    
    # XP 요구사항
    base_xp_required: int = Field(description="기본 XP 요구량")
    xp_multiplier: float = Field(description="레벨별 XP 배수")
    
    # 타임스탬프
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class HollandType(SQLModel, table=True):
    """Holland RIASEC 성향 유형"""
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Holland 분류
    holland_code: str = Field(unique=True, description="Holland 코드")
    holland_name: str = Field(description="Holland 성향명")
    holland_description: str = Field(description="성향 설명")
    
    # 시각화
    display_order: int = Field(description="표시 순서")
    icon_name: str = Field(description="아이콘 이름")
    color_theme: str = Field(description="색상 테마")
    
    # 타임스탬프
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class UserSkill(SQLModel, table=True):
    """사용자별 스킬 레벨 및 XP"""
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # 사용자 및 스킬 연결
    user_id: int = Field(foreign_key="user.id", description="사용자 ID")
    skill_category_id: int = Field(foreign_key="skillcategory.id", description="스킬 카테고리 ID")
    
    # 스킬 정보
    current_level: int = Field(default=1, description="현재 레벨")
    current_xp: int = Field(default=0, description="현재 XP")
    total_xp_earned: int = Field(default=0, description="총 획득 XP")
    
    # 성취 정보
    achievements: List[str] = Field(default=[], description="달성한 성취 목록")
    badges: List[str] = Field(default=[], description="획득한 배지 목록")
    
    # 타임스탬프
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class UserHollandProfile(SQLModel, table=True):
    """사용자별 Holland 성향 프로필"""
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # 사용자 정보
    user_id: int = Field(foreign_key="user.id", description="사용자 ID")
    
    # Holland 점수 (0-100)
    realistic_score: int = Field(default=0, description="현실형 점수")
    investigative_score: int = Field(default=0, description="탐구형 점수")
    artistic_score: int = Field(default=0, description="예술형 점수")
    social_score: int = Field(default=0, description="사회형 점수")
    enterprising_score: int = Field(default=0, description="진취형 점수")
    conventional_score: int = Field(default=0, description="관습형 점수")
    
    # 주요 성향
    primary_type: Optional[str] = Field(default=None, description="주요 성향")
    secondary_type: Optional[str] = Field(default=None, description="보조 성향")
    
    # 타임스탬프
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class GrowthActivity(SQLModel, table=True):
    """성장 활동 기록"""
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # 사용자 정보
    user_id: int = Field(foreign_key="user.id", description="사용자 ID")
    
    # 활동 정보
    title: str = Field(description="활동 제목")
    description: str = Field(description="활동 설명")
    activity_type: str = Field(description="활동 유형: 자동/수동")
    category: str = Field(description="활동 카테고리")
    
    # AI 분석 결과
    ai_analysis: Optional[str] = Field(default=None, description="AI 분석 결과")
    identified_skills: List[str] = Field(default=[], description="식별된 스킬")
    holland_impact: List[str] = Field(default=[], description="Holland 성향 영향")
    
    # XP 및 보상
    xp_reward: int = Field(default=0, description="획득 XP")
    skill_xp_distribution: dict = Field(default={}, description="스킬별 XP 분배")
    holland_score_changes: dict = Field(default={}, description="Holland 점수 변화")
    
    # 메타데이터
    tags: List[str] = Field(default=[], description="태그")
    location: Optional[str] = Field(default=None, description="활동 장소")
    duration_minutes: Optional[int] = Field(default=None, description="활동 시간(분)")
    
    # 상태
    is_verified: bool = Field(default=False, description="검증 여부")
    verification_source: Optional[str] = Field(default=None, description="검증 출처")
    
    # 타임스탬프
    activity_date: datetime = Field(description="활동 날짜")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Quest(SQLModel, table=True):
    """성장 퀘스트"""
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # 퀘스트 정보
    title: str = Field(description="퀘스트 제목")
    description: str = Field(description="퀘스트 설명")
    quest_type: str = Field(description="퀘스트 유형: 일일/주간/월간/특별")
    
    # 목표 및 보상
    objectives: List[str] = Field(description="퀘스트 목표")
    xp_reward: int = Field(description="XP 보상")
    skill_rewards: dict = Field(description="스킬별 보상")
    special_rewards: List[str] = Field(default=[], description="특별 보상")
    
    # 조건 및 제약
    required_level: int = Field(default=1, description="요구 레벨")
    required_skills: dict = Field(default={}, description="요구 스킬")
    time_limit_days: Optional[int] = Field(default=None, description="제한 시간(일)")
    
    # 상태
    is_active: bool = Field(default=True, description="활성화 여부")
    difficulty: str = Field(description="난이도: 쉬움/보통/어려움/매우어려움")
    
    # 타임스탬프
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class UserQuest(SQLModel, table=True):
    """사용자별 퀘스트 진행 상황"""
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # 사용자 및 퀘스트 연결
    user_id: int = Field(foreign_key="user.id", description="사용자 ID")
    quest_id: int = Field(foreign_key="quest.id", description="퀘스트 ID")
    
    # 진행 상황
    status: str = Field(default="진행중", description="상태: 진행중/완료/실패/만료")
    progress: int = Field(default=0, description="진행률 (0-100)")
    objectives_completed: List[str] = Field(default=[], description="완료된 목표")
    
    # 시간 정보
    started_at: datetime = Field(description="시작 시간")
    completed_at: Optional[datetime] = Field(default=None, description="완료 시간")
    expires_at: Optional[datetime] = Field(default=None, description="만료 시간")
    
    # 보상
    xp_earned: int = Field(default=0, description="획득한 XP")
    rewards_claimed: bool = Field(default=False, description="보상 수령 여부")
    
    # 타임스탬프
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class CampusCredo(SQLModel, table=True):
    """캠퍼스 크레도 점수"""
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # 사용자 정보
    user_id: int = Field(foreign_key="user.id", description="사용자 ID")
    
    # 크레도 점수
    total_score: int = Field(description="총 크레도 점수")
    academic_score: int = Field(description="학사 점수")
    financial_score: int = Field(description="금융 점수")
    skill_score: int = Field(description="스킬 점수")
    activity_score: int = Field(description="활동 점수")
    
    # 등급 및 랭킹
    grade: str = Field(description="크레도 등급")
    rank_percentage: float = Field(description="상위 백분율")
    
    # 상세 분석
    score_breakdown: dict = Field(description="점수 세부 분석")
    improvement_suggestions: List[str] = Field(description="개선 제안")
    
    # 타임스탬프
    calculated_at: datetime = Field(description="계산 시간")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# Pydantic 모델들 (API 요청/응답용)
class SkillCategoryResponse(BaseModel):
    """스킬 카테고리 응답 모델"""
    id: int
    ncs_code: str
    ncs_name: str
    ncs_description: str
    display_order: int
    icon_name: str
    color_theme: str
    base_xp_required: int
    xp_multiplier: float
    created_at: datetime
    updated_at: datetime


class UserSkillResponse(BaseModel):
    """사용자 스킬 응답 모델"""
    id: int
    skill_category: SkillCategoryResponse
    current_level: int
    current_xp: int
    total_xp_earned: int
    achievements: List[str]
    badges: List[str]
    next_level_xp: int
    progress_percentage: float
    created_at: datetime
    updated_at: datetime


class HollandTypeResponse(BaseModel):
    """Holland 성향 유형 응답 모델"""
    id: int
    holland_code: str
    holland_name: str
    holland_description: str
    display_order: int
    icon_name: str
    color_theme: str
    created_at: datetime
    updated_at: datetime


class UserHollandProfileResponse(BaseModel):
    """사용자 Holland 프로필 응답 모델"""
    id: int
    realistic_score: int
    investigative_score: int
    artistic_score: int
    social_score: int
    enterprising_score: int
    conventional_score: int
    primary_type: Optional[str]
    secondary_type: Optional[str]
    created_at: datetime
    updated_at: datetime


class GrowthActivityResponse(BaseModel):
    """성장 활동 응답 모델"""
    id: int
    title: str
    description: str
    activity_type: str
    category: str
    ai_analysis: Optional[str]
    identified_skills: List[str]
    holland_impact: List[str]
    xp_reward: int
    skill_xp_distribution: dict
    holland_score_changes: dict
    tags: List[str]
    location: Optional[str]
    duration_minutes: Optional[int]
    is_verified: bool
    verification_source: Optional[str]
    activity_date: datetime
    created_at: datetime
    updated_at: datetime


class QuestResponse(BaseModel):
    """퀘스트 응답 모델"""
    id: int
    title: str
    description: str
    quest_type: str
    objectives: List[str]
    xp_reward: int
    skill_rewards: dict
    special_rewards: List[str]
    required_level: int
    required_skills: dict
    time_limit_days: Optional[int]
    is_active: bool
    difficulty: str
    created_at: datetime
    updated_at: datetime


class UserQuestResponse(BaseModel):
    """사용자 퀘스트 응답 모델"""
    id: int
    quest: QuestResponse
    status: str
    progress: int
    objectives_completed: List[str]
    started_at: datetime
    completed_at: Optional[datetime]
    expires_at: Optional[datetime]
    xp_earned: int
    rewards_claimed: bool
    created_at: datetime
    updated_at: datetime


class CampusCredoResponse(BaseModel):
    """캠퍼스 크레도 응답 모델"""
    id: int
    total_score: int
    academic_score: int
    financial_score: int
    skill_score: int
    activity_score: int
    grade: str
    rank_percentage: float
    score_breakdown: dict
    improvement_suggestions: List[str]
    calculated_at: datetime
    created_at: datetime
    updated_at: datetime


class SkillTreeSummaryResponse(BaseModel):
    """스킬 트리 요약 응답 모델"""
    user_skills: List[UserSkillResponse]
    holland_profile: UserHollandProfileResponse
    total_level: int
    total_xp: int
    skill_distribution: dict
    recent_activities: List[GrowthActivityResponse]
    active_quests: List[UserQuestResponse]
    campus_credo: CampusCredoResponse
