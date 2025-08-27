import logging
from typing import Optional, List, Dict, Any
from sqlmodel import Session, select
from datetime import datetime, timedelta
import random
import math

from ..models.skill_tree import (
    SkillCategory, HollandType, UserSkill, UserHollandProfile,
    GrowthActivity, Quest, UserQuest, CampusCredo
)
from ..models.academic import AcademicRecord, Course, Scholarship
from ..models.financial import BankAccount, Transaction, FinancialProduct, UserProduct, CreditScore

logger = logging.getLogger(__name__)


class SkillTreeService:
    """스킬 트리 시스템 서비스"""
    
    def __init__(self, db: Session):
        self.db = db
    
    # ==================== 스킬 카테고리 관리 ====================
    
    def initialize_skill_categories(self) -> List[SkillCategory]:
        """NCS 10대 직업기초능력 초기화"""
        categories = [
            {
                "ncs_code": "COMM001",
                "ncs_name": "의사소통능력",
                "ncs_description": "다른 사람과 생각이나 정보를 효과적으로 주고받는 능력",
                "display_order": 1,
                "icon_name": "message-circle",
                "color_theme": "#3B82F6",
                "base_xp_required": 1000,
                "xp_multiplier": 1.5
            },
            {
                "ncs_code": "MATH001",
                "ncs_name": "수리능력",
                "ncs_description": "수학적 사고를 통해 문제를 해결하는 능력",
                "display_order": 2,
                "icon_name": "calculator",
                "color_theme": "#10B981",
                "base_xp_required": 1200,
                "xp_multiplier": 1.6
            },
            {
                "ncs_code": "PROB001",
                "ncs_name": "문제해결능력",
                "ncs_description": "문제를 분석하고 해결책을 찾아 실행하는 능력",
                "display_order": 3,
                "icon_name": "target",
                "color_theme": "#F59E0B",
                "base_xp_required": 1500,
                "xp_multiplier": 1.7
            },
            {
                "ncs_code": "DEV001",
                "ncs_name": "자기개발능력",
                "ncs_description": "자신의 역량을 지속적으로 향상시키는 능력",
                "display_order": 4,
                "icon_name": "trending-up",
                "color_theme": "#8B5CF6",
                "base_xp_required": 1000,
                "xp_multiplier": 1.5
            },
            {
                "ncs_code": "RES001",
                "ncs_name": "자원관리능력",
                "ncs_description": "시간, 돈, 물질 등을 효율적으로 관리하는 능력",
                "display_order": 5,
                "icon_name": "briefcase",
                "color_theme": "#EF4444",
                "base_xp_required": 1100,
                "xp_multiplier": 1.55
            },
            {
                "ncs_code": "REL001",
                "ncs_name": "대인관계능력",
                "ncs_description": "다른 사람과 원만한 관계를 유지하는 능력",
                "display_order": 6,
                "icon_name": "users",
                "color_theme": "#06B6D4",
                "base_xp_required": 1000,
                "xp_multiplier": 1.5
            },
            {
                "ncs_code": "INFO001",
                "ncs_name": "정보능력",
                "ncs_description": "필요한 정보를 수집하고 활용하는 능력",
                "display_order": 7,
                "icon_name": "search",
                "color_theme": "#84CC16",
                "base_xp_required": 1300,
                "xp_multiplier": 1.65
            },
            {
                "ncs_code": "TECH001",
                "ncs_name": "기술능력",
                "ncs_description": "전문적인 기술을 습득하고 활용하는 능력",
                "display_order": 8,
                "icon_name": "code",
                "color_theme": "#F97316",
                "base_xp_required": 1400,
                "xp_multiplier": 1.7
            },
            {
                "ncs_code": "ORG001",
                "ncs_name": "조직이해능력",
                "ncs_description": "조직의 구조와 문화를 이해하고 적응하는 능력",
                "display_order": 9,
                "icon_name": "building",
                "color_theme": "#6B7280",
                "base_xp_required": 1000,
                "xp_multiplier": 1.5
            },
            {
                "ncs_code": "ETH001",
                "ncs_name": "직업윤리",
                "ncs_description": "직업인으로서 갖춰야 할 윤리적 가치관과 태도",
                "display_order": 10,
                "icon_name": "award",
                "color_theme": "#EC4899",
                "base_xp_required": 900,
                "xp_multiplier": 1.4
            }
        ]
        
        skill_categories = []
        for cat_data in categories:
            existing = self.db.exec(
                select(SkillCategory).where(SkillCategory.ncs_code == cat_data["ncs_code"])
            ).first()
            
            if not existing:
                category = SkillCategory(**cat_data)
                self.db.add(category)
                skill_categories.append(category)
        
        self.db.commit()
        return skill_categories
    
    def get_skill_categories(self) -> List[SkillCategory]:
        """스킬 카테고리 목록 조회"""
        categories = self.db.exec(select(SkillCategory).order_by(SkillCategory.display_order)).all()
        
        if not categories:
            categories = self.initialize_skill_categories()
        
        return categories
    
    # ==================== Holland 성향 관리 ====================
    
    def initialize_holland_types(self) -> List[HollandType]:
        """Holland RIASEC 성향 유형 초기화"""
        types = [
            {
                "holland_code": "R",
                "holland_name": "현실형",
                "holland_description": "실재형, '만드는 사람' - 구체적이고 체계적인 작업을 선호",
                "display_order": 1,
                "icon_name": "hammer",
                "color_theme": "#DC2626"
            },
            {
                "holland_code": "I",
                "holland_name": "탐구형",
                "holland_description": "'생각하는 사람' - 지적이고 분석적인 작업을 선호",
                "display_order": 2,
                "icon_name": "microscope",
                "color_theme": "#2563EB"
            },
            {
                "holland_code": "A",
                "holland_name": "예술형",
                "holland_description": "'창조하는 사람' - 창의적이고 표현적인 작업을 선호",
                "display_order": 3,
                "icon_name": "palette",
                "color_theme": "#7C3AED"
            },
            {
                "holland_code": "S",
                "holland_name": "사회형",
                "holland_description": "'돕는 사람' - 사람들과 함께 일하고 도움을 주는 작업을 선호",
                "display_order": 4,
                "icon_name": "heart",
                "color_theme": "#059669"
            },
            {
                "holland_code": "E",
                "holland_name": "진취형",
                "holland_description": "'설득하는 사람' - 리더십과 설득을 통한 작업을 선호",
                "display_order": 5,
                "icon_name": "trending-up",
                "color_theme": "#D97706"
            },
            {
                "holland_code": "C",
                "holland_name": "관습형",
                "holland_description": "'조직하는 사람' - 체계적이고 정확한 작업을 선호",
                "display_order": 6,
                "icon_name": "clipboard",
                "color_theme": "#6B7280"
            }
        ]
        
        holland_types = []
        for type_data in types:
            existing = self.db.exec(
                select(HollandType).where(HollandType.holland_code == type_data["holland_code"])
            ).first()
            
            if not existing:
                holland_type = HollandType(**type_data)
                self.db.add(holland_type)
                holland_types.append(holland_type)
        
        self.db.commit()
        return holland_types
    
    def get_holland_types(self) -> List[HollandType]:
        """Holland 성향 유형 목록 조회"""
        types = self.db.exec(select(HollandType).order_by(HollandType.display_order)).all()
        
        if not types:
            types = self.initialize_holland_types()
        
        return types
    
    # ==================== 사용자 스킬 관리 ====================
    
    def initialize_user_skills(self, user_id: int) -> List[UserSkill]:
        """사용자 스킬 초기화"""
        categories = self.get_skill_categories()
        user_skills = []
        
        for category in categories:
            existing = self.db.exec(
                select(UserSkill).where(
                    UserSkill.user_id == user_id,
                    UserSkill.skill_category_id == category.id
                )
            ).first()
            
            if not existing:
                user_skill = UserSkill(
                    user_id=user_id,
                    skill_category_id=category.id,
                    current_level=1,
                    current_xp=0,
                    total_xp_earned=0,
                    achievements=[],
                    badges=[],
                    created_at=datetime.now(),
                    updated_at=datetime.now()
                )
                user_skills.append(user_skill)
                self.db.add(user_skill)
        
        self.db.commit()
        return user_skills
    
    def get_user_skills(self, user_id: int) -> List[UserSkill]:
        """사용자 스킬 목록 조회"""
        user_skills = self.db.exec(
            select(UserSkill).where(UserSkill.user_id == user_id)
        ).all()
        
        if not user_skills:
            user_skills = self.initialize_user_skills(user_id)
        
        return user_skills
    
    def add_xp_to_skill(self, user_id: int, skill_category_id: int, xp_amount: int) -> UserSkill:
        """스킬에 XP 추가 및 레벨업 처리"""
        user_skill = self.db.exec(
            select(UserSkill).where(
                UserSkill.user_id == user_id,
                UserSkill.skill_category_id == skill_category_id
            )
        ).first()
        
        if not user_skill:
            user_skill = UserSkill(
                user_id=user_id,
                skill_category_id=skill_category_id,
                current_level=1,
                current_xp=0,
                total_xp_earned=0,
                achievements=[],
                badges=[],
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            self.db.add(user_skill)
        
        # XP 추가
        user_skill.current_xp += xp_amount
        user_skill.total_xp_earned += xp_amount
        
        # 레벨업 체크
        skill_category = self.db.exec(
            select(SkillCategory).where(SkillCategory.id == skill_category_id)
        ).first()
        
        if skill_category:
            required_xp = self.calculate_required_xp_for_level(
                user_skill.current_level + 1,
                skill_category.base_xp_required,
                skill_category.xp_multiplier
            )
            
            while user_skill.current_xp >= required_xp:
                user_skill.current_level += 1
                required_xp = self.calculate_required_xp_for_level(
                    user_skill.current_level + 1,
                    skill_category.base_xp_required,
                    skill_category.xp_multiplier
                )
        
        user_skill.updated_at = datetime.now()
        self.db.add(user_skill)
        self.db.commit()
        self.db.refresh(user_skill)
        
        return user_skill
    
    def calculate_required_xp_for_level(self, level: int, base_xp: int, multiplier: float) -> int:
        """특정 레벨에 도달하기 위해 필요한 XP 계산"""
        if level <= 1:
            return 0
        return int(base_xp * (multiplier ** (level - 2)))
    
    # ==================== Holland 프로필 관리 ====================
    
    def initialize_user_holland_profile(self, user_id: int) -> UserHollandProfile:
        """사용자 Holland 프로필 초기화"""
        existing = self.db.exec(
            select(UserHollandProfile).where(UserHollandProfile.user_id == user_id)
        ).first()
        
        if not existing:
            profile = UserHollandProfile(
                user_id=user_id,
                realistic_score=0,
                investigative_score=0,
                artistic_score=0,
                social_score=0,
                enterprising_score=0,
                conventional_score=0,
                primary_type=None,
                secondary_type=None,
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            self.db.add(profile)
            self.db.commit()
            self.db.refresh(profile)
            return profile
        
        return existing
    
    def update_holland_scores(self, user_id: int, score_changes: Dict[str, int]) -> UserHollandProfile:
        """Holland 점수 업데이트"""
        profile = self.db.exec(
            select(UserHollandProfile).where(UserHollandProfile.user_id == user_id)
        ).first()
        
        if not profile:
            profile = self.initialize_user_holland_profile(user_id)
        
        # 점수 업데이트
        for holland_type, change in score_changes.items():
            if hasattr(profile, f"{holland_type.lower()}_score"):
                current_score = getattr(profile, f"{holland_type.lower()}_score")
                new_score = max(0, min(100, current_score + change))
                setattr(profile, f"{holland_type.lower()}_score", new_score)
        
        # 주요 성향 재계산
        scores = {
            'R': profile.realistic_score,
            'I': profile.investigative_score,
            'A': profile.artistic_score,
            'S': profile.social_score,
            'E': profile.enterprising_score,
            'C': profile.conventional_score
        }
        
        sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        profile.primary_type = sorted_scores[0][0]
        profile.secondary_type = sorted_scores[1][0] if len(sorted_scores) > 1 else None
        
        profile.updated_at = datetime.now()
        self.db.add(profile)
        self.db.commit()
        self.db.refresh(profile)
        
        return profile
    
    # ==================== 성장 활동 관리 ====================
    
    def create_growth_activity(
        self,
        user_id: int,
        title: str,
        description: str,
        activity_type: str = "수동",
        category: str = "기타",
        tags: List[str] = None,
        location: str = None,
        duration_minutes: int = None
    ) -> GrowthActivity:
        """성장 활동 생성 및 AI 분석"""
        # AI 분석 (목업)
        ai_analysis = self.analyze_activity_ai(title, description, tags or [])
        
        # XP 계산
        xp_reward = self.calculate_activity_xp(title, description, category, duration_minutes)
        
        # 스킬 XP 분배
        skill_xp_distribution = self.distribute_skill_xp(ai_analysis["identified_skills"], xp_reward)
        
        # Holland 점수 변화
        holland_score_changes = self.calculate_holland_impact(ai_analysis["holland_impact"])
        
        # 활동 생성
        activity = GrowthActivity(
            user_id=user_id,
            title=title,
            description=description,
            activity_type=activity_type,
            category=category,
            ai_analysis=ai_analysis["analysis_text"],
            identified_skills=ai_analysis["identified_skills"],
            holland_impact=ai_analysis["holland_impact"],
            xp_reward=xp_reward,
            skill_xp_distribution=skill_xp_distribution,
            holland_score_changes=holland_score_changes,
            tags=tags or [],
            location=location,
            duration_minutes=duration_minutes,
            is_verified=False,
            verification_source=None,
            activity_date=datetime.now(),
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        self.db.add(activity)
        self.db.commit()
        self.db.refresh(activity)
        
        # 스킬 XP 적용
        for skill_name, xp in skill_xp_distribution.items():
            skill_category = self.db.exec(
                select(SkillCategory).where(SkillCategory.ncs_name == skill_name)
            ).first()
            
            if skill_category:
                self.add_xp_to_skill(user_id, skill_category.id, xp)
        
        # Holland 점수 업데이트
        self.update_holland_scores(user_id, holland_score_changes)
        
        return activity
    
    def analyze_activity_ai(self, title: str, description: str, tags: List[str]) -> Dict[str, Any]:
        """AI 활동 분석 (목업)"""
        # 키워드 기반 분석
        text = f"{title} {description} {' '.join(tags)}".lower()
        
        # NCS 스킬 매핑
        identified_skills = []
        skill_keywords = {
            "의사소통능력": ["발표", "토론", "프레젠테이션", "강의", "설명", "회의"],
            "수리능력": ["분석", "통계", "계산", "수학", "데이터", "spss", "excel"],
            "문제해결능력": ["문제", "해결", "전략", "계획", "분석", "개선"],
            "자기개발능력": ["학습", "공부", "독서", "강의", "온라인", "자격증"],
            "자원관리능력": ["시간", "예산", "계획", "관리", "효율", "절약"],
            "대인관계능력": ["팀워크", "협력", "소통", "봉사", "멘토링", "동아리"],
            "정보능력": ["검색", "수집", "정리", "분석", "리서치", "조사"],
            "기술능력": ["코딩", "프로그래밍", "개발", "앱", "웹", "소프트웨어"],
            "조직이해능력": ["조직", "문화", "규칙", "절차", "시스템", "운영"],
            "직업윤리": ["봉사", "도움", "책임", "성실", "정직", "윤리"]
        }
        
        for skill, keywords in skill_keywords.items():
            if any(keyword in text for keyword in keywords):
                identified_skills.append(skill)
        
        # Holland 성향 매핑
        holland_impact = []
        holland_keywords = {
            "R": ["만들기", "제작", "구조", "시스템", "기계"],
            "I": ["분석", "연구", "탐구", "실험", "논문"],
            "A": ["창작", "디자인", "예술", "창의", "표현"],
            "S": ["봉사", "도움", "교육", "상담", "케어"],
            "E": ["리더십", "프로젝트", "사업", "마케팅", "영업"],
            "C": ["정리", "관리", "계획", "문서", "절차"]
        }
        
        for holland_type, keywords in holland_keywords.items():
            if any(keyword in text for keyword in keywords):
                holland_impact.append(holland_type)
        
        # 분석 텍스트 생성
        analysis_text = f"이 활동은 {', '.join(identified_skills)} 스킬을 향상시키며, "
        analysis_text += f"{', '.join(holland_impact)} 성향을 강화합니다."
        
        return {
            "identified_skills": identified_skills,
            "holland_impact": holland_impact,
            "analysis_text": analysis_text
        }
    
    def calculate_activity_xp(self, title: str, description: str, category: str, duration_minutes: int) -> int:
        """활동 XP 계산"""
        base_xp = 50
        
        # 카테고리별 보너스
        category_bonus = {
            "학업": 1.5,
            "프로젝트": 2.0,
            "봉사": 1.3,
            "동아리": 1.2,
            "인턴": 2.5,
            "대회": 3.0,
            "자격증": 2.0,
            "기타": 1.0
        }
        
        multiplier = category_bonus.get(category, 1.0)
        
        # 시간 보너스
        time_bonus = 1.0
        if duration_minutes:
            if duration_minutes >= 480:  # 8시간 이상
                time_bonus = 1.5
            elif duration_minutes >= 240:  # 4시간 이상
                time_bonus = 1.3
            elif duration_minutes >= 120:  # 2시간 이상
                time_bonus = 1.1
        
        return int(base_xp * multiplier * time_bonus)
    
    def distribute_skill_xp(self, identified_skills: List[str], total_xp: int) -> Dict[str, int]:
        """스킬별 XP 분배"""
        if not identified_skills:
            return {}
        
        # 균등 분배
        xp_per_skill = total_xp // len(identified_skills)
        remainder = total_xp % len(identified_skills)
        
        distribution = {}
        for i, skill in enumerate(identified_skills):
            xp = xp_per_skill + (1 if i < remainder else 0)
            distribution[skill] = xp
        
        return distribution
    
    def calculate_holland_impact(self, holland_impact: List[str]) -> Dict[str, int]:
        """Holland 점수 변화 계산"""
        changes = {}
        for holland_type in holland_impact:
            changes[holland_type] = random.randint(1, 3)  # 1-3점 증가
        
        return changes
    
    # ==================== 퀘스트 관리 ====================
    
    def generate_personalized_quests(self, user_id: int) -> List[Quest]:
        """개인화된 퀘스트 생성"""
        # 사용자 정보 분석
        user_skills = self.get_user_skills(user_id)
        holland_profile = self.db.exec(
            select(UserHollandProfile).where(UserHollandProfile.user_id == user_id)
        ).first()
        
        # 기본 퀘스트 생성
        quests = [
            {
                "title": "학업 성실성 증명",
                "description": "이번 학기 출석률 90% 이상 달성하기",
                "quest_type": "월간",
                "objectives": ["출석률 90% 이상"],
                "xp_reward": 200,
                "skill_rewards": {"성실도": 100, "자기개발능력": 100},
                "special_rewards": ["성실한 학생 배지"],
                "required_level": 1,
                "required_skills": {},
                "time_limit_days": 30,
                "difficulty": "보통"
            },
            {
                "title": "저축 습관 형성",
                "description": "연속 3개월 월 저축률 20% 이상 달성하기",
                "quest_type": "월간",
                "objectives": ["연속 3개월 저축률 20% 이상"],
                "xp_reward": 300,
                "skill_rewards": {"자원관리능력": 150, "직업윤리": 150},
                "special_rewards": ["절약왕 배지"],
                "required_level": 1,
                "required_skills": {},
                "time_limit_days": 90,
                "difficulty": "어려움"
            }
        ]
        
        # 개인화된 퀘스트 추가
        if holland_profile and holland_profile.primary_type == "I":
            quests.append({
                "title": "탐구형 성향 강화",
                "description": "연구 논문 1편 읽고 요약하기",
                "quest_type": "일일",
                "objectives": ["논문 요약 작성"],
                "xp_reward": 150,
                "skill_rewards": {"탐구능력": 100, "정보능력": 50},
                "special_rewards": ["탐구왕 배지"],
                "required_level": 2,
                "required_skills": {"정보능력": 1},
                "time_limit_days": 7,
                "difficulty": "보통"
            })
        
        return quests
    
    # ==================== 캠퍼스 크레도 계산 ====================
    
    def calculate_campus_credo(self, user_id: int) -> CampusCredo:
        """캠퍼스 크레도 점수 계산"""
        # 기존 크레도 조회
        existing_credo = self.db.exec(
            select(CampusCredo).where(CampusCredo.user_id == user_id)
        ).first()
        
        # 점수 계산
        academic_score = self.calculate_academic_score(user_id)
        financial_score = self.calculate_financial_score(user_id)
        skill_score = self.calculate_skill_score(user_id)
        activity_score = self.calculate_activity_score(user_id)
        
        total_score = academic_score + financial_score + skill_score + activity_score
        
        # 등급 결정
        grade = self.determine_grade(total_score)
        rank_percentage = self.calculate_rank_percentage(total_score)
        
        # 점수 세부 분석
        score_breakdown = {
            "academic": academic_score,
            "financial": financial_score,
            "skill": skill_score,
            "activity": activity_score
        }
        
        # 개선 제안
        improvement_suggestions = self.generate_improvement_suggestions(
            academic_score, financial_score, skill_score, activity_score
        )
        
        # 크레도 생성/업데이트
        if existing_credo:
            existing_credo.total_score = total_score
            existing_credo.academic_score = academic_score
            existing_credo.financial_score = financial_score
            existing_credo.skill_score = skill_score
            existing_credo.activity_score = activity_score
            existing_credo.grade = grade
            existing_credo.rank_percentage = rank_percentage
            existing_credo.score_breakdown = score_breakdown
            existing_credo.improvement_suggestions = improvement_suggestions
            existing_credo.calculated_at = datetime.now()
            existing_credo.updated_at = datetime.now()
            
            self.db.add(existing_credo)
            self.db.commit()
            self.db.refresh(existing_credo)
            return existing_credo
        else:
            credo = CampusCredo(
                user_id=user_id,
                total_score=total_score,
                academic_score=academic_score,
                financial_score=financial_score,
                skill_score=skill_score,
                activity_score=activity_score,
                grade=grade,
                rank_percentage=rank_percentage,
                score_breakdown=score_breakdown,
                improvement_suggestions=improvement_suggestions,
                calculated_at=datetime.now(),
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            
            self.db.add(credo)
            self.db.commit()
            self.db.refresh(credo)
            return credo
    
    def calculate_academic_score(self, user_id: int) -> int:
        """학사 점수 계산"""
        # 학사 정보 조회
        academic_record = self.db.exec(
            select(AcademicRecord).where(AcademicRecord.user_id == user_id)
        ).first()
        
        if not academic_record:
            return 0
        
        score = 0
        
        # GPA 점수 (최대 400점)
        gpa_score = int((academic_record.gpa / 4.5) * 400)
        score += gpa_score
        
        # 학점 진행률 점수 (최대 300점)
        credit_progress = (academic_record.total_credits / academic_record.required_credits) * 100
        credit_score = int(min(credit_progress, 100) * 3)
        score += credit_score
        
        # 학년 점수 (최대 300점)
        grade_score = academic_record.grade_level * 75
        score += grade_score
        
        return min(score, 1000)
    
    def calculate_financial_score(self, user_id: int) -> int:
        """금융 점수 계산"""
        # 금융 정보 조회
        accounts = self.db.exec(
            select(BankAccount).where(BankAccount.user_id == user_id)
        ).all()
        
        if not accounts:
            return 0
        
        score = 0
        
        # 저축 계좌 점수 (최대 400점)
        savings_balance = sum(acc.balance for acc in accounts if acc.account_type in ["예금", "적금"])
        savings_score = int(min(savings_balance / 1000000, 1) * 400)  # 100만원 기준
        score += savings_score
        
        # 계좌 다양성 점수 (최대 300점)
        account_types = set(acc.account_type for acc in accounts)
        diversity_score = len(account_types) * 75
        score += diversity_score
        
        # 신용 점수 (최대 300점)
        credit_score = self.db.exec(
            select(CreditScore).where(CreditScore.user_id == user_id)
        ).first()
        
        if credit_score:
            credit_points = int((credit_score.score / 900) * 300)
            score += credit_points
        
        return min(score, 1000)
    
    def calculate_skill_score(self, user_id: int) -> int:
        """스킬 점수 계산"""
        user_skills = self.get_user_skills(user_id)
        
        if not user_skills:
            return 0
        
        score = 0
        
        # 총 레벨 점수 (최대 500점)
        total_level = sum(skill.current_level for skill in user_skills)
        level_score = total_level * 10
        score += level_score
        
        # 총 XP 점수 (최대 500점)
        total_xp = sum(skill.total_xp_earned for skill in user_skills)
        xp_score = int(min(total_xp / 10000, 1) * 500)  # 1만 XP 기준
        score += xp_score
        
        return min(score, 1000)
    
    def calculate_activity_score(self, user_id: int) -> int:
        """활동 점수 계산"""
        # 최근 30일 활동 조회
        thirty_days_ago = datetime.now() - timedelta(days=30)
        recent_activities = self.db.exec(
            select(GrowthActivity).where(
                GrowthActivity.user_id == user_id,
                GrowthActivity.activity_date >= thirty_days_ago
            )
        ).all()
        
        score = 0
        
        # 활동 수 점수 (최대 400점)
        activity_count = len(recent_activities)
        count_score = min(activity_count * 20, 400)
        score += count_score
        
        # 활동 XP 점수 (최대 600점)
        total_xp = sum(activity.xp_reward for activity in recent_activities)
        xp_score = int(min(total_xp / 1000, 1) * 600)  # 1천 XP 기준
        score += xp_score
        
        return min(score, 1000)
    
    def determine_grade(self, total_score: int) -> str:
        """총점에 따른 등급 결정"""
        if total_score >= 3500:
            return "S+"
        elif total_score >= 3000:
            return "S"
        elif total_score >= 2500:
            return "A+"
        elif total_score >= 2000:
            return "A"
        elif total_score >= 1500:
            return "B+"
        elif total_score >= 1000:
            return "B"
        elif total_score >= 500:
            return "C+"
        else:
            return "C"
    
    def calculate_rank_percentage(self, total_score: int) -> float:
        """점수에 따른 상위 백분율 계산 (목업)"""
        # 실제로는 전체 사용자와 비교해야 함
        if total_score >= 3500:
            return 5.0  # 상위 5%
        elif total_score >= 3000:
            return 15.0  # 상위 15%
        elif total_score >= 2500:
            return 30.0  # 상위 30%
        elif total_score >= 2000:
            return 50.0  # 상위 50%
        elif total_score >= 1500:
            return 70.0  # 상위 70%
        elif total_score >= 1000:
            return 85.0  # 상위 85%
        else:
            return 95.0  # 상위 95%
    
    def generate_improvement_suggestions(
        self, academic_score: int, financial_score: int, skill_score: int, activity_score: int
    ) -> List[str]:
        """개선 제안 생성"""
        suggestions = []
        
        if academic_score < 500:
            suggestions.append("학업 성적 향상을 위해 꾸준한 학습과 과제 완성에 집중하세요.")
        
        if financial_score < 500:
            suggestions.append("금융 건전성을 위해 월 저축 습관을 형성하고 다양한 금융 상품을 활용하세요.")
        
        if skill_score < 500:
            suggestions.append("스킬 개발을 위해 다양한 활동에 참여하고 지속적인 학습을 이어가세요.")
        
        if activity_score < 500:
            suggestions.append("성장 활동 참여를 늘려 다양한 경험을 쌓아보세요.")
        
        if not suggestions:
            suggestions.append("전반적으로 우수한 성과를 보이고 있습니다. 더 높은 목표를 향해 도전해보세요!")
        
        return suggestions

