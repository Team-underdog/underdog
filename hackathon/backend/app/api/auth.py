from fastapi import APIRouter, Header, HTTPException
from typing import Optional
import requests
from ..core.config import settings

router = APIRouter()

@router.post("/auth/login")
async def login_proxy(payload: dict):
    """SSAFY POST 로그인 프록시: {apiKey, userId} 전송, 응답 매핑"""
    import logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    
    try:
        logger.info(f"로그인 요청 받음: {payload}")
        body = {
            "apiKey": payload.get("apiKey") or settings.SSAFY_API_KEY,
            "userId": payload.get("userId"),
        }
        if not body["userId"]:
            logger.error("userId가 없음")
            raise HTTPException(status_code=400, detail="userId required")
        
        logger.info(f"SSAFY API 호출: {settings.SSAFY_LOGIN_URL}")
        resp = requests.post(settings.SSAFY_LOGIN_URL, json=body, timeout=10)
        logger.info(f"SSAFY 응답: {resp.status_code} - {resp.text[:200]}")
        
        # 2xx 모두 성공으로 처리
        if resp.ok:
            try:
                data = resp.json()
            except Exception as json_err:
                logger.error(f"JSON 파싱 에러: {json_err}")
                return {"access_token": "demo-token", "token_type": "bearer", "error": resp.text}
            token = data.get("userKey") or data.get("access_token") or "demo-token"
            result = {
                "access_token": token,
                "token_type": "bearer",
                "user": {
                    "id": data.get("userId"),
                    "name": data.get("userName"),
                    "institutionCode": data.get("institutionCode"),
                    "created": data.get("created"),
                },
            }
            logger.info(f"성공 응답 반환: {result}")
            return result
        else:
            error_result = {"access_token": "demo-token", "token_type": "bearer", "error": resp.text}
            logger.warning(f"SSAFY 에러 응답: {error_result}")
            return error_result
    except Exception as e:
        error_result = {"access_token": "demo-token", "token_type": "bearer", "error": str(e)}
        logger.error(f"로그인 예외 발생: {e}")
        return error_result

@router.post("/auth/signup")
async def signup_proxy(payload: dict):
    """SSAFY POST 회원가입 프록시(사양 동일): {apiKey, userId} 전송"""
    try:
        body = {
            "apiKey": payload.get("apiKey") or settings.SSAFY_API_KEY,
            "userId": payload.get("userId"),
        }
        if not body["userId"]:
            raise HTTPException(status_code=400, detail="userId required")
        resp = requests.post(settings.SSAFY_LOGIN_URL, json=body, timeout=10)
        if resp.ok:
            try:
                data = resp.json()
            except Exception:
                return {"error": resp.text}
            # 성공 본문에 userKey가 있으면 성공으로 간주
            if data.get("userKey") or data.get("userId"):
                return {
                    "userId": data.get("userId"),
                    "userName": data.get("userName"),
                    "institutionCode": data.get("institutionCode"),
                    "userKey": data.get("userKey"),
                    "created": data.get("created"),
                }
            return {"error": data}
        else:
            return {"error": resp.text}
    except Exception as e:
        return {"error": str(e)}

@router.get("/auth/me")
async def me(authorization: Optional[str] = Header(None)):
    if authorization and authorization.startswith("Bearer "):
        return {"id": 1, "name": "Hackathon User"}
    return {"id": 1, "name": "Default User"}
