"""
게이미피케이션 API
XP, 레벨업, 업적, 퀘스트, 크레도 시스템
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import logging
import random
import uuid
import math

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/gamification", tags=["Gamification"])

# 임시 데이터 저장 (실제로는 데이터베이스 사용)
user_profiles_db = {}
achievements_db = {}
quests_db = {}
financial_goals_db = {}
leaderboard_db = {}

# 기본 업적 데이터
DEFAULT_ACHIEVEMENTS = [
    {
        "id": "first_save",
        "title": "첫 저축",
        "description": "처음으로 10만원을 저축했습니다",
        "icon": "💰",
        "category": "saving",
        "points": 100,
        "target": 100000,
        "current": 0
    },
    {
        "id": "saving_master",
        "title": "저축 마스터",
        "description": "100만원을 저축했습니다",
        "icon": "🏆",
        "category": "saving",
        "points": 500,
        "target": 1000000,
        "current": 0
    },
    {
        "id": "investment_starter",
        "title": "투자 시작",
        "description": "처음으로 투자를 시작했습니다",
        "icon": "📈",
        "category": "investment",
        "points": 200,
        "target": 50000,
        "current": 0
    },
    {
        "id": "budget_expert",
        "title": "예산 전문가",
        "description": "한 달 동안 예산을 지켰습니다",
        "icon": "📊",
        "category": "budget",
        "points": 300,
        "target": 30,
        "current": 0
    },
    {
        "id": "credit_improver",
        "title": "신용 향상",
        "description": "신용점수를 100점 향상시켰습니다",
        "icon": "⭐",
        "category": "credit",
        "points": 400,
        "target": 100,
        "current": 0
    },
    {
        "id": "social_butterfly",
        "title": "소셜 버터플라이",
        "description": "10명의 친구와 금융 활동을 했습니다",
        "icon": "🦋",
        "category": "social",
        "points": 250,
        "target": 10,
        "current": 0
    },
    {
        "id": "streak_7",
        "title": "7일 연속",
        "description": "7일 연속으로 앱을 사용했습니다",
        "icon": "🔥",
        "category": "streak",
        "points": 150,
        "target": 7,
        "current": 0
    },
    {
        "id": "streak_30",
        "title": "30일 연속",
        "description": "30일 연속으로 앱을 사용했습니다",
        "icon": "🔥🔥",
        "category": "streak",
        "points": 1000,
        "target": 30,
        "current": 0
    }
]

# 기본 퀘스트 데이터
DEFAULT_QUESTS = [
    {
        "id": "daily_save",
        "title": "오늘의 저축",
        "description": "오늘 1만원을 저축하세요",
        "type": "daily",
        "category": "saving",
        "requirements": [
            {
                "type": "save_amount",
                "target": 10000,
                "current": 0,
                "description": "1만원 저축하기"
            }
        ],
        "rewards": {
            "xp": 50,
            "credits": 10,
            "badges": ["daily_saver"]
        },
        "expiresAt": (datetime.now() + timedelta(days=1)).isoformat()
    },
    {
        "id": "weekly_invest",
        "title": "주간 투자",
        "description": "이번 주에 5만원을 투자하세요",
        "type": "weekly",
        "category": "investment",
        "requirements": [
            {
                "type": "invest_amount",
                "target": 50000,
                "current": 0,
                "description": "5만원 투자하기"
            }
        ],
        "rewards": {
            "xp": 200,
            "credits": 50,
            "badges": ["weekly_investor"]
        },
        "expiresAt": (datetime.now() + timedelta(days=7)).isoformat()
    },
    {
        "id": "monthly_budget",
        "title": "월간 예산 관리",
        "description": "이번 달 예산을 10% 절약하세요",
        "type": "monthly",
        "category": "budget",
        "requirements": [
            {
                "type": "spend_less",
                "target": 10,
                "current": 0,
                "description": "예산 10% 절약하기"
            }
        ],
        "rewards": {
            "xp": 500,
            "credits": 100,
            "badges": ["budget_master"]
        },
        "expiresAt": (datetime.now() + timedelta(days=30)).isoformat()
    }
]

@router.get("/profile/{user_id}")
async def get_user_profile(user_id: str):
    """사용자 프로필 조회"""
    try:
        print(f"👤 사용자 프로필 조회: {user_id}")
        
        # 사용자 프로필이 없으면 생성
        if user_id not in user_profiles_db:
            user_profiles_db[user_id] = create_default_profile(user_id)
        
        profile = user_profiles_db[user_id]
        
        # 레벨 정보 업데이트
        level_info = calculate_level(profile["currentXP"])
        profile["level"] = level_info["level"]
        profile["xpToNextLevel"] = level_info["xpToNext"]
        
        print(f"✅ 사용자 프로필 조회 완료: 레벨 {profile['level']}")
        
        return {
            "success": True,
            "profile": profile
        }
        
    except Exception as e:
        logger.error(f"사용자 프로필 조회 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"프로필 조회 중 오류가 발생했습니다: {str(e)}")

@router.get("/achievements")
async def get_achievements(user_id: str):
    """업적 목록 조회"""
    try:
        print(f"🏆 업적 목록 조회: {user_id}")
        
        # 사용자 프로필이 없으면 생성
        if user_id not in user_profiles_db:
            user_profiles_db[user_id] = create_default_profile(user_id)
        
        profile = user_profiles_db[user_id]
        user_achievements = profile["achievements"]
        
        # 진행도 업데이트
        for achievement in user_achievements:
            achievement["progress"] = calculate_achievement_progress(achievement, profile["stats"])
        
        print(f"✅ 업적 목록 조회 완료: {len(user_achievements)}개")
        
        return {
            "success": True,
            "achievements": user_achievements,
            "total_count": len(user_achievements),
            "unlocked_count": sum(1 for a in user_achievements if a["isUnlocked"])
        }
        
    except Exception as e:
        logger.error(f"업적 목록 조회 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"업적 목록 조회 중 오류가 발생했습니다: {str(e)}")

@router.get("/quests")
async def get_quests(user_id: str):
    """퀘스트 목록 조회"""
    try:
        print(f"📜 퀘스트 목록 조회: {user_id}")
        
        # 사용자 프로필이 없으면 생성
        if user_id not in user_profiles_db:
            user_profiles_db[user_id] = create_default_profile(user_id)
        
        profile = user_profiles_db[user_id]
        
        # 퀘스트 진행도 업데이트
        for quest in profile["activeQuests"]:
            quest["progress"] = calculate_quest_progress(quest)
        
        print(f"✅ 퀘스트 목록 조회 완료: 활성 {len(profile['activeQuests'])}개")
        
        return {
            "success": True,
            "active": profile["activeQuests"],
            "available": get_available_quests(user_id),
            "completed": profile["completedQuests"]
        }
        
    except Exception as e:
        logger.error(f"퀘스트 목록 조회 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"퀘스트 목록 조회 중 오류가 발생했습니다: {str(e)}")

@router.post("/quests/{quest_id}/start")
async def start_quest(quest_id: str, user_id: str):
    """퀘스트 시작"""
    try:
        print(f"🚀 퀘스트 시작: {quest_id}, 사용자: {user_id}")
        
        if user_id not in user_profiles_db:
            user_profiles_db[user_id] = create_default_profile(user_id)
        
        profile = user_profiles_db[user_id]
        
        # 사용 가능한 퀘스트에서 찾기
        available_quests = get_available_quests(user_id)
        quest = next((q for q in available_quests if q["id"] == quest_id), None)
        
        if not quest:
            raise HTTPException(status_code=404, detail="퀘스트를 찾을 수 없습니다.")
        
        # 퀘스트 시작
        quest["status"] = "active"
        quest["startedAt"] = datetime.now().isoformat()
        quest["progress"] = 0
        
        profile["activeQuests"].append(quest)
        
        print(f"✅ 퀘스트 시작 완료: {quest_id}")
        
        return {
            "success": True,
            "quest": quest
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"퀘스트 시작 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"퀘스트 시작 중 오류가 발생했습니다: {str(e)}")

@router.put("/quests/{quest_id}/progress")
async def update_quest_progress(
    quest_id: str,
    user_id: str,
    progress: Dict[str, int]
):
    """퀘스트 진행도 업데이트"""
    try:
        print(f"📊 퀘스트 진행도 업데이트: {quest_id}, 사용자: {user_id}")
        
        if user_id not in user_profiles_db:
            raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
        
        profile = user_profiles_db[user_id]
        
        # 활성 퀘스트에서 찾기
        quest = next((q for q in profile["activeQuests"] if q["id"] == quest_id), None)
        if not quest:
            raise HTTPException(status_code=404, detail="활성 퀘스트를 찾을 수 없습니다.")
        
        # 진행도 업데이트
        for req in quest["requirements"]:
            if req["type"] in progress:
                req["current"] = progress[req["type"]]
        
        # 전체 진행도 계산
        quest["progress"] = calculate_quest_progress(quest)
        
        print(f"✅ 퀘스트 진행도 업데이트 완료: {quest['progress']}%")
        
        return {
            "success": True,
            "quest": quest
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"퀘스트 진행도 업데이트 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"진행도 업데이트 중 오류가 발생했습니다: {str(e)}")

@router.post("/quests/{quest_id}/complete")
async def complete_quest(quest_id: str, user_id: str):
    """퀘스트 완료"""
    try:
        print(f"🎉 퀘스트 완료: {quest_id}, 사용자: {user_id}")
        
        if user_id not in user_profiles_db:
            raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
        
        profile = user_profiles_db[user_id]
        
        # 활성 퀘스트에서 찾기
        quest = next((q for q in profile["activeQuests"] if q["id"] == quest_id), None)
        if not quest:
            raise HTTPException(status_code=404, detail="활성 퀘스트를 찾을 수 없습니다.")
        
        # 퀘스트 완료 처리
        quest["status"] = "completed"
        quest["completedAt"] = datetime.now().isoformat()
        quest["progress"] = 100
        
        # 보상 지급
        rewards = quest["rewards"]
        old_xp = profile["currentXP"]
        old_credits = profile["totalCredits"]
        
        profile["currentXP"] += rewards["xp"]
        profile["totalCredits"] += rewards["credits"]
        
        # 레벨업 확인
        old_level = profile["level"]
        new_level_info = calculate_level(profile["currentXP"])
        profile["level"] = new_level_info["level"]
        profile["xpToNextLevel"] = new_level_info["xpToNext"]
        
        level_up = new_level_info["level"] > old_level
        
        # 통계 업데이트
        profile["stats"]["questsCompleted"] += 1
        
        # 활성 퀘스트에서 제거하고 완료된 퀘스트에 추가
        profile["activeQuests"] = [q for q in profile["activeQuests"] if q["id"] != quest_id]
        profile["completedQuests"].append(quest)
        
        print(f"✅ 퀘스트 완료: XP +{rewards['xp']}, 크레도 +{rewards['credits']}")
        if level_up:
            print(f"🎊 레벨업! {old_level} -> {profile['level']}")
        
        return {
            "success": True,
            "quest": quest,
            "rewards": rewards,
            "levelUp": level_up,
            "newLevel": profile["level"] if level_up else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"퀘스트 완료 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"퀘스트 완료 중 오류가 발생했습니다: {str(e)}")

@router.post("/goals")
async def create_financial_goal(
    title: str,
    description: str,
    target_amount: int,
    deadline: str,
    category: str,
    priority: str = "medium"
):
    """금융 목표 생성"""
    try:
        print(f"🎯 금융 목표 생성: {title}, {target_amount:,}원")
        
        goal_id = f"goal_{uuid.uuid4().hex[:8]}"
        
        goal = {
            "id": goal_id,
            "title": title,
            "description": description,
            "targetAmount": target_amount,
            "currentAmount": 0,
            "deadline": deadline,
            "category": category,
            "priority": priority,
            "status": "active",
            "rewards": {
                "xp": target_amount // 10000 * 100,  # 1만원당 100XP
                "credits": target_amount // 10000 * 20,  # 1만원당 20크레도
                "achievement": f"goal_{category}_{target_amount // 10000}"
            }
        }
        
        financial_goals_db[goal_id] = goal
        
        print(f"✅ 금융 목표 생성 완료: {goal_id}")
        
        return {
            "success": True,
            "goal": goal
        }
        
    except Exception as e:
        logger.error(f"금융 목표 생성 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"목표 생성 중 오류가 발생했습니다: {str(e)}")

@router.get("/goals")
async def get_financial_goals(user_id: str):
    """금융 목표 목록 조회"""
    try:
        print(f"🎯 금융 목표 목록 조회: {user_id}")
        
        # 모든 목표 반환 (실제로는 사용자별로 필터링)
        goals = list(financial_goals_db.values())
        
        # 마감일순으로 정렬
        goals.sort(key=lambda x: x["deadline"])
        
        print(f"✅ 금융 목표 목록 조회 완료: {len(goals)}개")
        
        return {
            "success": True,
            "goals": goals,
            "total_count": len(goals)
        }
        
    except Exception as e:
        logger.error(f"금융 목표 목록 조회 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"목표 목록 조회 중 오류가 발생했습니다: {str(e)}")

@router.put("/goals/{goal_id}/progress")
async def update_goal_progress(goal_id: str, current_amount: int):
    """금융 목표 진행도 업데이트"""
    try:
        print(f"📊 목표 진행도 업데이트: {goal_id}, 현재: {current_amount:,}원")
        
        if goal_id not in financial_goals_db:
            raise HTTPException(status_code=404, detail="목표를 찾을 수 없습니다.")
        
        goal = financial_goals_db[goal_id]
        goal["currentAmount"] = current_amount
        
        # 목표 달성 확인
        if current_amount >= goal["targetAmount"] and goal["status"] == "active":
            goal["status"] = "completed"
            print(f"🎉 목표 달성! {goal['title']}")
        
        print(f"✅ 목표 진행도 업데이트 완료: {current_amount:,}원 / {goal['targetAmount']:,}원")
        
        return {
            "success": True,
            "goal": goal
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"목표 진행도 업데이트 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"진행도 업데이트 중 오류가 발생했습니다: {str(e)}")

@router.get("/leaderboard")
async def get_leaderboard(category: str = "level"):
    """리더보드 조회"""
    try:
        print(f"🏆 리더보드 조회: {category}")
        
        # 모든 사용자 프로필 수집
        all_profiles = list(user_profiles_db.values())
        
        if not all_profiles:
            return {"success": True, "leaderboard": [], "total_count": 0}
        
        # 카테고리별 정렬
        if category == "level":
            all_profiles.sort(key=lambda x: (x["level"], x["currentXP"]), reverse=True)
        elif category == "credits":
            all_profiles.sort(key=lambda x: x["totalCredits"], reverse=True)
        elif category == "achievements":
            all_profiles.sort(key=lambda x: x["stats"]["achievementsUnlocked"], reverse=True)
        elif category == "streak":
            all_profiles.sort(key=lambda x: x["stats"]["daysStreak"], reverse=True)
        
        # 리더보드 엔트리 생성
        leaderboard = []
        for i, profile in enumerate(all_profiles[:100], 1):  # 상위 100명
            leaderboard.append({
                "rank": i,
                "userId": profile["userId"],
                "name": f"사용자{profile['userId'][-4:]}",  # 임시 이름
                "level": profile["level"],
                "totalCredits": profile["totalCredits"],
                "achievements": profile["stats"]["achievementsUnlocked"],
                "streak": profile["stats"]["daysStreak"]
            })
        
        print(f"✅ 리더보드 조회 완료: {len(leaderboard)}명")
        
        return {
            "success": True,
            "leaderboard": leaderboard,
            "total_count": len(leaderboard),
            "category": category
        }
        
    except Exception as e:
        logger.error(f"리더보드 조회 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"리더보드 조회 중 오류가 발생했습니다: {str(e)}")

@router.post("/daily-checkin")
async def daily_checkin(user_id: str):
    """일일 체크인"""
    try:
        print(f"✅ 일일 체크인: {user_id}")
        
        if user_id not in user_profiles_db:
            user_profiles_db[user_id] = create_default_profile(user_id)
        
        profile = user_profiles_db[user_id]
        
        # 스트릭 업데이트
        today = datetime.now().date()
        last_active = datetime.fromisoformat(profile["stats"]["lastActiveDate"]).date()
        
        if today - last_active == timedelta(days=1):
            # 연속 체크인
            profile["stats"]["daysStreak"] += 1
            if profile["stats"]["daysStreak"] > profile["stats"]["maxStreak"]:
                profile["stats"]["maxStreak"] = profile["stats"]["daysStreak"]
        elif today - last_active > timedelta(days=1):
            # 스트릭 끊김
            profile["stats"]["daysStreak"] = 1
        
        profile["stats"]["lastActiveDate"] = today.isoformat()
        
        # 보상 계산
        streak = profile["stats"]["daysStreak"]
        if streak >= 7:
            xp_reward = 100
            credit_reward = 20
        elif streak >= 3:
            xp_reward = 50
            credit_reward = 10
        else:
            xp_reward = 20
            credit_reward = 5
        
        # 보상 지급
        profile["currentXP"] += xp_reward
        profile["totalCredits"] += credit_reward
        
        print(f"✅ 일일 체크인 완료: 스트릭 {streak}일, XP +{xp_reward}, 크레도 +{credit_reward}")
        
        return {
            "success": True,
            "streak": streak,
            "rewards": {
                "xp": xp_reward,
                "credits": credit_reward,
                "badges": [f"streak_{streak}"]
            },
            "message": f"{streak}일 연속 체크인! 오늘의 보상을 받았습니다."
        }
        
    except Exception as e:
        logger.error(f"일일 체크인 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"체크인 중 오류가 발생했습니다: {str(e)}")

@router.post("/xp/gain")
async def gain_xp(user_id: str, amount: int, reason: str):
    """XP 획득"""
    try:
        print(f"⭐ XP 획득: {user_id}, +{amount}, 사유: {reason}")
        
        if user_id not in user_profiles_db:
            user_profiles_db[user_id] = create_default_profile(user_id)
        
        profile = user_profiles_db[user_id]
        
        old_level = profile["level"]
        profile["currentXP"] += amount
        
        # 레벨업 확인
        new_level_info = calculate_level(profile["currentXP"])
        profile["level"] = new_level_info["level"]
        profile["xpToNextLevel"] = new_level_info["xpToNext"]
        
        level_up = new_level_info["level"] > old_level
        
        # 레벨업 보상
        rewards = None
        if level_up:
            rewards = calculate_level_rewards(new_level_info["level"])
            profile["totalCredits"] += rewards["credits"]
        
        print(f"✅ XP 획득 완료: {amount}XP, 총 {profile['currentXP']}XP")
        if level_up:
            print(f"🎊 레벨업! {old_level} -> {profile['level']}")
        
        return {
            "success": True,
            "newXP": profile["currentXP"],
            "levelUp": level_up,
            "newLevel": profile["level"] if level_up else None,
            "rewards": rewards
        }
        
    except Exception as e:
        logger.error(f"XP 획득 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"XP 획득 중 오류가 발생했습니다: {str(e)}")

@router.post("/credits/gain")
async def gain_credits(user_id: str, amount: int, reason: str):
    """크레도 획득"""
    try:
        print(f"🪙 크레도 획득: {user_id}, +{amount}, 사유: {reason}")
        
        if user_id not in user_profiles_db:
            user_profiles_db[user_id] = create_default_profile(user_id)
        
        profile = user_profiles_db[user_id]
        
        profile["totalCredits"] += amount
        
        print(f"✅ 크레도 획득 완료: +{amount}, 총 {profile['totalCredits']}")
        
        return {
            "success": True,
            "newCredits": profile["totalCredits"],
            "totalEarned": profile["totalCredits"]
        }
        
    except Exception as e:
        logger.error(f"크레도 획득 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"크레도 획득 중 오류가 발생했습니다: {str(e)}")

# 유틸리티 함수들
def create_default_profile(user_id: str) -> Dict[str, Any]:
    """기본 사용자 프로필 생성"""
    profile = {
        "userId": user_id,
        "level": 1,
        "currentXP": 0,
        "xpToNextLevel": 100,
        "totalCredits": 0,
        "achievements": DEFAULT_ACHIEVEMENTS.copy(),
        "activeQuests": [],
        "completedQuests": [],
        "stats": {
            "totalSaved": 0,
            "totalInvested": 0,
            "daysStreak": 0,
            "maxStreak": 0,
            "questsCompleted": 0,
            "achievementsUnlocked": 0,
            "socialInteractions": 0,
            "lastActiveDate": datetime.now().isoformat()
        },
        "rank": {
            "tier": "bronze",
            "rank": 0,
            "totalUsers": 0,
            "percentile": 0
        }
    }
    
    # 기본 퀘스트 할당
    profile["activeQuests"] = DEFAULT_QUESTS[:2].copy()  # 처음 2개 퀘스트
    
    return profile

def calculate_level(xp: int) -> Dict[str, Any]:
    """레벨 계산"""
    level = int(math.sqrt(xp / 100)) + 1
    xp_for_current_level = (level - 1) ** 2 * 100
    xp_for_next_level = level ** 2 * 100
    xp_to_next = xp_for_next_level - xp
    progress = ((xp - xp_for_current_level) / (xp_for_next_level - xp_for_current_level)) * 100
    
    return {
        "level": level,
        "xpToNext": xp_to_next,
        "progress": min(progress, 100)
    }

def calculate_achievement_progress(achievement: Dict[str, Any], stats: Dict[str, Any]) -> int:
    """업적 진행도 계산"""
    target = achievement["target"]
    
    if achievement["category"] == "saving":
        current = stats["totalSaved"]
    elif achievement["category"] == "investment":
        current = stats["totalInvested"]
    elif achievement["category"] == "streak":
        current = stats["daysStreak"]
    elif achievement["category"] == "credit":
        current = stats["achievementsUnlocked"]
    elif achievement["category"] == "social":
        current = stats["socialInteractions"]
    else:
        current = 0
    
    progress = min((current / target) * 100, 100)
    
    # 업적 해금 확인
    if progress >= 100 and not achievement["isUnlocked"]:
        achievement["isUnlocked"] = True
        achievement["unlockedAt"] = datetime.now().isoformat()
        achievement["current"] = current
    
    return int(progress)

def calculate_quest_progress(quest: Dict[str, Any]) -> int:
    """퀘스트 진행도 계산"""
    if not quest["requirements"]:
        return 0
    
    total_progress = sum(
        min((req["current"] / req["target"]) * 100, 100)
        for req in quest["requirements"]
    )
    
    return int(total_progress / len(quest["requirements"]))

def get_available_quests(user_id: str) -> List[Dict[str, Any]]:
    """사용 가능한 퀘스트 조회"""
    if user_id not in user_profiles_db:
        return []
    
    profile = user_profiles_db[user_id]
    active_quest_ids = {q["id"] for q in profile["activeQuests"]}
    completed_quest_ids = {q["id"] for q in profile["completedQuests"]}
    
    available = []
    for quest in DEFAULT_QUESTS:
        if (quest["id"] not in active_quest_ids and 
            quest["id"] not in completed_quest_ids):
            available.append(quest.copy())
    
    return available

def calculate_level_rewards(level: int) -> Dict[str, Any]:
    """레벨별 보상 계산"""
    base_xp = level * 50
    base_credits = level * 10
    
    return {
        "xp": base_xp,
        "credits": base_credits,
        "badges": [f"level_{level}"],
        "specialRewards": [f"special_reward_{level}"] if level % 5 == 0 else []
    }
