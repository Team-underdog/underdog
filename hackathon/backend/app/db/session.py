from __future__ import annotations
from typing import Dict, Generator
from sqlmodel import SQLModel, create_engine, Session
from ..core.config import settings

# SQLModel 엔진 및 세션 설정
engine = create_engine(settings.DATABASE_URL, echo=True)

def create_db_and_tables():
    """데이터베이스 테이블 생성"""
    SQLModel.metadata.create_all(engine)

def get_session() -> Generator[Session, None, None]:
    """데이터베이스 세션 의존성"""
    with Session(engine) as session:
        yield session

# 인메모리 진행상황 저장 (기존 코드 유지)
DUMMY_PROGRESS: Dict[int, Dict[str, int]] = {
    1: {"level": 1, "xp": 0, "xp_to_next": 100},
}

def get_progress(user_id: int) -> Dict[str, int]:
    return DUMMY_PROGRESS.get(user_id, {"level": 1, "xp": 0, "xp_to_next": 100})

def set_progress(user_id: int, level: int, xp: int, xp_to_next: int) -> None:
    DUMMY_PROGRESS[user_id] = {"level": level, "xp": xp, "xp_to_next": xp_to_next}
