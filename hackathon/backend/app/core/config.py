import os
from typing import List
from dotenv import load_dotenv

load_dotenv()

class Settings:
    BACKEND_PORT: int = int(os.getenv("BACKEND_PORT", "8000"))
    JWT_SECRET: str = os.getenv("JWT_SECRET", "dev-secret")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./hackathon.db")

    # SSAFY(신한) 로그인 API
    SSAFY_LOGIN_URL: str = os.getenv("SSAFY_LOGIN_URL", "https://finopenapi.ssafy.io/ssafy/api/v1/member/")
    SSAFY_API_KEY: str = os.getenv("SSAFY_API_KEY", "1924d3d047eb472ab5a81df01977485c")

    CORS_ORIGINS: List[str] = ["*"]

settings = Settings()
