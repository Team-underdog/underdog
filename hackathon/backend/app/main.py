from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .api.health import router as health_router
from .api.auth import router as auth_router
from .api.auth_v2 import router as auth_v2_router
from .api.university import router as university_router
from .api.ssafy_integration import router as ssafy_router
from .api.user_registration import router as user_registration_router
from .api.home_dashboard import router as home_dashboard_router
from .api.social_finance import router as social_finance_router
from .api.gamification import router as gamification_router
from .api.ai_advisor import router as ai_advisor_router
from .api.test_ai import router as test_ai_router
from .api.academic import router as academic_router
from .api.financial import router as financial_router
from .api.chronicle import router as chronicle_router
from .api.xp import router as xp_router
from .db.session import create_db_and_tables

# 모델들을 임포트하여 테이블 생성 시 인식되도록 함
from .models.user import User
from .models.university import University, Department, UniversityCourse, CourseSchedule
from .models.academic import AcademicRecord, Course as AcademicCourse, Scholarship
from .models.financial import BankAccount, Transaction, FinancialProduct, UserProduct, CreditScore
from .models.xp import UserXP, XPActivity

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
app.include_router(ssafy_router, prefix="/api/auth", tags=["ssafy"])
app.include_router(user_registration_router, prefix="/api", tags=["user-registration"])  # 회원가입 및 계좌 생성 API
app.include_router(home_dashboard_router, prefix="/api", tags=["home-dashboard"])  # 홈화면 대시보드 API
app.include_router(social_finance_router, prefix="/api", tags=["social-finance"])  # 소셜 금융 API
app.include_router(gamification_router, prefix="/api", tags=["gamification"])  # 게이미피케이션 API
app.include_router(ai_advisor_router, prefix="/api", tags=["ai-advisor"])  # AI 상담 API
app.include_router(test_ai_router, prefix="/api", tags=["test-ai"])  # 테스트 AI API
app.include_router(academic_router, prefix="/api", tags=["academic"])  # 학사 정보 API
app.include_router(financial_router, prefix="/api", tags=["financial"])  # 금융 정보 API
app.include_router(chronicle_router, prefix="/api", tags=["chronicle"])  # 크로니클 API
app.include_router(xp_router, prefix="/api", tags=["xp"])  # 크레도 시스템 API

@app.get("/")
async def root():
    return {"message": "backend ok"}
