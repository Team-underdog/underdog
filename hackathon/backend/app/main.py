from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .api.health import router as health_router
from .api.auth import router as auth_router

app = FastAPI(title="Hackathon Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# health / auth 만 노출
app.include_router(health_router, prefix="/api")
app.include_router(auth_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "backend ok"}
