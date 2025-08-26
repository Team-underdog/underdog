from pydantic import BaseModel

class XPAddRequest(BaseModel):
    userId: int
    delta: int

class XPResponse(BaseModel):
    level: int
    xp: int
    xpToNext: int
    leveled_up: bool | None = False
    progress: float | None = 0.0
