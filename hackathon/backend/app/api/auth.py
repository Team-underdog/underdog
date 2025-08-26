from fastapi import APIRouter, Header, HTTPException
from typing import Optional
import requests
from ..core.config import settings

router = APIRouter()

@router.post("/auth/login")
async def login_proxy(payload: dict):
    """SSAFY POST 로그인 프록시: {apiKey, userId} 전송, 응답 매핑"""
    try:
        body = {
            "apiKey": payload.get("apiKey") or settings.SSAFY_API_KEY,
            "userId": payload.get("userId"),
        }
        if not body["userId"]:
            raise HTTPException(status_code=400, detail="userId required")
        resp = requests.post(settings.SSAFY_LOGIN_URL, json=body, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            # 응답 예: userId, userName, institutionCode, userKey, created, modified
            return {
                "access_token": data.get("userKey", "demo-token"),
                "token_type": "bearer",
                "user": {
                    "id": data.get("userId"),
                    "name": data.get("userName"),
                    "institutionCode": data.get("institutionCode"),
                    "created": data.get("created"),
                },
            }
        else:
            # SSAFY 에러코드는 본문에 포함됨: 그대로 전달 + 데모 토큰 폴백
            return {"access_token": "demo-token", "token_type": "bearer", "error": resp.text}
    except Exception as e:
        return {"access_token": "demo-token", "token_type": "bearer", "error": str(e)}

@router.get("/auth/me")
async def me(authorization: Optional[str] = Header(None)):
    if authorization and authorization.startswith("Bearer "):
        return {"id": 1, "name": "Hackathon User"}
    return {"id": 1, "name": "Default User"}
