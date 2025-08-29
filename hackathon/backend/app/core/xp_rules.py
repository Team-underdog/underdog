import math
from typing import Tuple, Dict

BASE_CREDO = 100  # 기본 크레도 요구량
MULTIPLIER = 1.2  # 레벨별 증가 배수


def compute_credo_to_next(level: int) -> int:
    """다음 레벨까지 필요한 크레도 점수 계산"""
    if level <= 1:
        return BASE_CREDO
    return math.ceil(BASE_CREDO * (MULTIPLIER ** (level - 1)))


def add_credo(current_level: int, current_credo: int, delta: int) -> Tuple[int, int, int, bool]:
    """크레도 점수 추가 및 레벨업 처리"""
    credo = current_credo + delta
    level = current_level
    leveled = False
    
    # 레벨업 체크
    while credo >= compute_credo_to_next(level):
        credo -= compute_credo_to_next(level)
        level += 1
        leveled = True
    
    return level, credo, compute_credo_to_next(level), leveled


def to_response(level: int, credo: int) -> Dict[str, int | float]:
    """응답 데이터 생성"""
    credo_to_next = compute_credo_to_next(level)
    progress = (credo / credo_to_next * 100) if credo_to_next > 0 else 100
    
    return {
        "level": level,
        "credo": credo,
        "credo_to_next": credo_to_next,
        "progress": progress
    }
