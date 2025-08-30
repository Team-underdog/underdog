"""
테스트용 AI API
"""

from fastapi import APIRouter
from typing import Dict, Any

router = APIRouter(prefix="/api/test-ai", tags=["Test AI"])

@router.get("/health")
async def health_check():
    """테스트 AI 서비스 상태 확인"""
    return {
        "success": True,
        "service": "Test AI Service",
        "status": "healthy"
    }

@router.post("/generate")
async def test_generate(request_data: Dict[str, Any]):
    """테스트용 텍스트 생성"""
    prompt = request_data.get("prompt", "Hello World")
    
    return {
        "success": True,
        "message": "테스트 성공",
        "response": f"입력된 프롬프트: {prompt}",
        "timestamp": "2024-01-01T00:00:00"
    }
