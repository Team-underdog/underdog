from __future__ import annotations
from typing import Dict

# 인메모리 진행상황 저장
DUMMY_PROGRESS: Dict[int, Dict[str, int]] = {
    1: {"level": 1, "xp": 0, "xp_to_next": 100},
}

def get_progress(user_id: int) -> Dict[str, int]:
    return DUMMY_PROGRESS.get(user_id, {"level": 1, "xp": 0, "xp_to_next": 100})

def set_progress(user_id: int, level: int, xp: int, xp_to_next: int) -> None:
    DUMMY_PROGRESS[user_id] = {"level": level, "xp": xp, "xp_to_next": xp_to_next}
