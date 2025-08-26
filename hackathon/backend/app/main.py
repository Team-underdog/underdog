from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .api.health import router as health_router
from .api.auth import router as auth_router
from .api.auth_v2 import router as auth_v2_router
from .api.university import router as university_router
from .db.session import create_db_and_tables

# 모델들을 임포트하여 테이블 생성 시 인식되도록 함
from .models.user import User
from .models.university import University, Department, Course, CourseSchedule

app = FastAPI(title="Hackathon Backend", version="1.0.0")

# 데이터베이스 테이블 생성
@app.on_event("startup")
def on_startup():
    create_db_and_tables()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(health_router, prefix="/api")
app.include_router(auth_v2_router, prefix="/api", tags=["auth"])      # 새로운 자체 인증 (우선순위)
app.include_router(auth_router, prefix="/api", tags=["auth-legacy"])  # 기존 SSAFY 인증
app.include_router(university_router, prefix="/api", tags=["university"])

@app.get("/")
async def root():
    return {"message": "backend ok"}
