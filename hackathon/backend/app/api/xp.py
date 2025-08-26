from fastapi import APIRouter
from ..models.progress import XPAddRequest, XPResponse
from ..db.session import get_progress, set_progress
from ..core.xp_rules import add_xp, to_response

router = APIRouter()

@router.get("/xp/me", response_model=XPResponse)
async def me(user_id: int = 1):
    p = get_progress(user_id)
    resp = to_response(p["level"], p["xp"])
    return XPResponse(level=resp["level"], xp=resp["xp"], xpToNext=resp["xpToNext"], leveled_up=False, progress=resp["progress"]) 

@router.post("/xp/add", response_model=XPResponse)
async def add(payload: XPAddRequest):
    p = get_progress(payload.userId)
    level, xp, next_xp, leveled = add_xp(p["level"], p["xp"], payload.delta)
    set_progress(payload.userId, level, xp, next_xp)
    resp = to_response(level, xp)
    return XPResponse(level=resp["level"], xp=resp["xp"], xpToNext=resp["xpToNext"], leveled_up=leveled, progress=resp["progress"])
