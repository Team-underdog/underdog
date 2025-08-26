import math
from typing import Tuple, Dict

BASE_XP = 100
MULTIPLIER = 1.2


def compute_xp_to_next(level: int) -> int:
    if level <= 1:
        return BASE_XP
    return math.ceil(BASE_XP * (MULTIPLIER ** (level - 1)))


def add_xp(current_level: int, current_xp: int, delta: int) -> Tuple[int, int, int, bool]:
    xp = current_xp + max(0, delta)
    level = current_level
    leveled = False
    while xp >= compute_xp_to_next(level):
        xp -= compute_xp_to_next(level)
        level += 1
        leveled = True
    return level, xp, compute_xp_to_next(level), leveled


def to_response(level: int, xp: int) -> Dict[str, int | float]:
    xp_to_next = compute_xp_to_next(level)
    progress = (xp / xp_to_next) * 100 if xp_to_next else 0
    return {"level": level, "xp": xp, "xpToNext": xp_to_next, "progress": progress}
