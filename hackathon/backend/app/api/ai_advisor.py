"""
AI 상담 API
Gemini API를 활용한 금융 상담 및 조언 제공
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Dict, Any, List, Optional
from datetime import datetime
import logging
import os
import requests
import json
from google import genai

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai-advisor", tags=["AI Advisor"])

# Gemini API 설정
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyDFKAfEDMhqiGcJuOz5jjuEAUGg3Yvn46k")
GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"

@router.get("/health")
async def health_check():
    """AI 상담 서비스 상태 확인"""
    try:
        return {
            "success": True,
            "service": "AI Financial Advisor",
            "status": "healthy",
            "gemini_api_key": "configured" if GEMINI_API_KEY else "not configured",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Health check failed")

@router.post("/test-gemini")
async def test_gemini_api(request_data: Dict[str, Any]):
    """Gemini API 프롬프트 기반 상담 (기존 엔드포인트)"""
    return await generate_text_with_gemini(request_data)

@router.post("/generate")
async def generate_text_endpoint(request_data: Dict[str, Any]):
    """Gemini API를 통한 텍스트 생성 (새로운 프록시 엔드포인트)"""
    return await generate_text_with_gemini(request_data)

@router.post("/financial-advice")
async def get_financial_advice(
    question: str,
    user_context: Optional[Dict[str, Any]] = None
):
    """금융 상담 요청"""
    try:
        print(f"💰 금융 상담 요청: {question[:50]}...")
        
        # 프롬프트 구성
        prompt = build_financial_prompt(question, user_context)
        
        request_body = {
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }],
            "generationConfig": {
                "temperature": 0.7,
                "topK": 40,
                "topP": 0.95,
                "maxOutputTokens": 1024,
            },
            "safetySettings": [
                {
                    "category": "HARM_CATEGORY_HARASSMENT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_HATE_SPEECH",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
        }
        
        response = requests.post(
            f"{GEMINI_BASE_URL}?key={GEMINI_API_KEY}",
            headers={"Content-Type": "application/json"},
            json=request_body,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get("candidates") and data["candidates"][0].get("content"):
                answer = data["candidates"][0]["content"]["parts"][0]["text"]
                
                # 답변 파싱 및 구조화
                structured_answer = parse_financial_advice(answer)
                
                print("✅ 금융 상담 완료")
                
                return {
                    "success": True,
                    "question": question,
                    "answer": answer,
                    "structured_answer": structured_answer,
                    "timestamp": datetime.now().isoformat()
                }
            else:
                raise HTTPException(status_code=500, detail="AI 응답을 파싱할 수 없습니다")
        else:
            raise HTTPException(status_code=response.status_code, detail=f"Gemini API 호출 실패: {response.text}")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"금융 상담 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"금융 상담 실패: {str(e)}")

@router.post("/budget-analysis")
async def analyze_budget(
    income: float,
    expenses: List[Dict[str, Any]],
    goals: List[str]
):
    """예산 분석 및 조언"""
    try:
        print(f"📊 예산 분석 요청: 소득 {income:,}원, 지출 {len(expenses)}건")
        
        # 예산 분석 프롬프트 구성
        prompt = build_budget_analysis_prompt(income, expenses, goals)
        
        request_body = {
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 1024,
            }
        }
        
        response = requests.post(
            f"{GEMINI_BASE_URL}?key={GEMINI_BASE_URL}",
            headers={"Content-Type": "application/json"},
            json=request_body,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get("candidates") and data["candidates"][0].get("content"):
                analysis = data["candidates"][0]["content"]["parts"][0]["text"]
                
                print("✅ 예산 분석 완료")
                
                return {
                    "success": True,
                    "income": income,
                    "expenses_count": len(expenses),
                    "goals": goals,
                    "analysis": analysis,
                    "timestamp": datetime.now().isoformat()
                }
            else:
                raise HTTPException(status_code=500, detail="AI 응답을 파싱할 수 없습니다")
        else:
            raise HTTPException(status_code=response.status_code, detail=f"Gemini API 호출 실패: {response.text}")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"예산 분석 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"예산 분석 실패: {str(e)}")

@router.post("/investment-advice")
async def get_investment_advice(
    amount: float,
    time_horizon: str,
    risk_tolerance: str,
    goals: List[str]
):
    """투자 상담"""
    try:
        print(f"📈 투자 상담 요청: {amount:,}원, 기간 {time_horizon}, 위험성향 {risk_tolerance}")
        
        prompt = build_investment_prompt(amount, time_horizon, risk_tolerance, goals)
        
        request_body = {
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 1024,
            }
        }
        
        response = requests.post(
            f"{GEMINI_BASE_URL}?key={GEMINI_API_KEY}",
            headers={"Content-Type": "application/json"},
            json=request_body,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get("candidates") and data["candidates"][0].get("content"):
                advice = data["candidates"][0]["content"]["parts"][0]["text"]
                
                print("✅ 투자 상담 완료")
                
                return {
                    "success": True,
                    "investment_amount": amount,
                    "time_horizon": time_horizon,
                    "risk_tolerance": risk_tolerance,
                    "goals": goals,
                    "advice": advice,
                    "timestamp": datetime.now().isoformat()
                }
            else:
                raise HTTPException(status_code=500, detail="AI 응답을 파싱할 수 없습니다")
        else:
            raise HTTPException(status_code=response.status_code, detail=f"Gemini API 호출 실패: {response.text}")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"투자 상담 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"투자 상담 실패: {str(e)}")

# 유틸리티 함수들
def build_financial_prompt(question: str, user_context: Optional[Dict[str, Any]] = None) -> str:
    """금융 상담 프롬프트 구성"""
    prompt = f"""당신은 한국의 전문 금융 상담사입니다. 
다음 질문에 대해 친근하고 이해하기 쉽게 답변해주세요.

질문: {question}

답변 시 다음 사항을 고려해주세요:
1. 한국의 금융 환경과 제도를 반영
2. 구체적이고 실용적인 조언 제공
3. 위험 요소와 주의사항 명시
4. 단계별 실행 방안 제시
5. 관련 추가 정보나 참고 자료 안내

답변 형식:
- 핵심 답변
- 구체적 조언 (3-5개)
- 주의사항
- 다음 단계
- 관련 주제"""

    if user_context:
        prompt += f"\n\n사용자 상황: {json.dumps(user_context, ensure_ascii=False, indent=2)}"

    return prompt

def build_budget_analysis_prompt(income: float, expenses: List[Dict[str, Any]], goals: List[str]) -> str:
    """예산 분석 프롬프트 구성"""
    expense_summary = "\n".join([
        f"- {expense.get('category', '기타')}: {expense.get('amount', 0):,}원"
        for expense in expenses
    ])
    
    return f"""월 소득 {income:,}원을 기준으로 예산 분석 및 조언을 제공해주세요.

현재 지출 현황:
{expense_summary}

목표: {', '.join(goals)}

다음 사항을 분석해주세요:
1. 지출 패턴 분석
2. 절약 기회
3. 목표 달성을 위한 예산 계획
4. 구체적인 절약 방법
5. 다음 달 예산 제안"""

def build_investment_prompt(amount: float, time_horizon: str, risk_tolerance: str, goals: List[str]) -> str:
    """투자 상담 프롬프트 구성"""
    return f"""투자 상담을 받고 싶습니다:

투자 금액: {amount:,}원
투자 기간: {time_horizon}
위험 성향: {risk_tolerance}
투자 목표: {', '.join(goals)}

다음 사항을 고려하여 투자 조언을 제공해주세요:
1. 적합한 투자 상품 추천
2. 자산 배분 전략
3. 위험 관리 방법
4. 정기적인 포트폴리오 점검 방법
5. 한국 투자 환경에서의 주의사항"""

def parse_financial_advice(answer: str) -> Dict[str, Any]:
    """AI 답변을 구조화된 형태로 파싱"""
    # 간단한 파싱 로직 (실제로는 더 정교한 파싱 필요)
    lines = answer.split('\n')
    
    structured = {
        "summary": "",
        "advice_points": [],
        "warnings": [],
        "next_steps": [],
        "related_topics": []
    }
    
    current_section = "summary"
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        if "핵심 답변" in line or "핵심" in line:
            current_section = "summary"
        elif "구체적 조언" in line or "조언" in line:
            current_section = "advice_points"
        elif "주의사항" in line:
            current_section = "warnings"
        elif "다음 단계" in line:
            current_section = "next_steps"
        elif "관련 주제" in line:
            current_section = "related_topics"
        elif line.startswith(('•', '-', '1.', '2.', '3.')):
            if current_section == "advice_points":
                structured["advice_points"].append(line)
            elif current_section == "warnings":
                structured["warnings"].append(line)
            elif current_section == "next_steps":
                structured["next_steps"].append(line)
            elif current_section == "related_topics":
                structured["related_topics"].append(line)
        elif current_section == "summary" and not line.startswith(('•', '-', '1.', '2.', '3.')):
            structured["summary"] += line + " "
    
    return structured

# generate_text_with_gemini 함수 완성 (Google GenAI SDK 사용)
async def generate_text_with_gemini(request_data: Dict[str, Any]):
    """Gemini API를 통한 텍스트 생성 (Google GenAI SDK 사용)"""
    try:
        # 요청 데이터에서 prompt, model, apiKey 추출
        prompt = request_data.get("prompt", "안녕하세요! 간단히 'Hello World'라고 한국어로 답변해주세요.")
        model = request_data.get("model", "gemini-1.5-flash-latest")
        api_key = request_data.get("apiKey", GEMINI_API_KEY)  # 클라이언트에서 전송한 API 키 사용
        
        print(f"🤖 Gemini API 텍스트 생성 시작... (모델: {model})")
        print(f"📝 프롬프트: {prompt[:100]}...")
        
        # Google GenAI SDK를 사용하여 Gemini API 호출
        try:
            # API 키 설정
            genai.configure(api_key=api_key)
            
            # 클라이언트 생성 및 모델 호출
            client = genai.Client()
            
            # 모델명을 Google GenAI SDK 형식에 맞게 변환
            if "gemini-1.5-flash-latest" in model:
                sdk_model = "gemini-1.5-flash-latest"
            elif "gemini-1.5-pro-latest" in model:
                sdk_model = "gemini-1.5-pro-latest"
            else:
                sdk_model = "gemini-1.5-flash-latest"  # 기본값
            
            print(f"🚀 Google GenAI SDK를 사용하여 {sdk_model} 모델 호출...")
            
            response = client.models.generate_content(
                model=sdk_model,
                contents=prompt,
                generation_config={
                    "temperature": 0.7,
                    "top_k": 40,
                    "top_p": 0.95,
                    "max_output_tokens": 2048,
                }
            )
            
            print("✅ Google GenAI SDK 응답 성공!")
            
            if response.text:
                answer = response.text
                print(f"🤖 AI 답변: {answer[:100]}...")
                
                return {
                    "success": True,
                    "message": f"Gemini {sdk_model} API 상담 성공 (Google GenAI SDK)",
                    "response": answer,
                    "model": sdk_model,
                    "timestamp": datetime.now().isoformat()
                }
            else:
                print("⚠️ 응답에서 답변을 찾을 수 없습니다.")
                return {
                    "success": False,
                    "error": "API 응답에서 답변을 찾을 수 없습니다.",
                    "response": str(response)
                }
                
        except Exception as sdk_error:
            print(f"⚠️ Google GenAI SDK 오류: {str(sdk_error)}")
            print("🔄 기존 requests 방식으로 폴백...")
            
            # SDK 실패 시 기존 requests 방식으로 폴백
            gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
            
            request_body = {
                "contents": [{
                    "parts": [{
                        "text": prompt
                    }]
                }],
                "generationConfig": {
                    "temperature": 0.7,
                    "topK": 40,
                    "topP": 0.95,
                    "maxOutputTokens": 2048,
                },
                "safetySettings": [
                    {
                        "category": "HARM_CATEGORY_HARASSMENT",
                        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        "category": "HARM_CATEGORY_HATE_SPEECH",
                        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                        "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                    }
                ]
            }
            
            print(f"📤 폴백 API 요청 전송: {gemini_url}")
            
            response = requests.post(
                f"{gemini_url}?key={api_key}",
                headers={
                    "Content-Type": "application/json",
                },
                json=request_body,
                timeout=30
            )
            
            print(f"📥 폴백 응답 수신: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print("✅ 폴백 API 응답 성공!")
                
                if data.get("candidates") and data["candidates"][0].get("content"):
                    answer = data["candidates"][0]["content"]["parts"][0]["text"]
                    print(f"🤖 AI 답변: {answer[:100]}...")
                    
                    return {
                        "success": True,
                        "message": f"Gemini {model} API 상담 성공 (폴백 방식)",
                        "response": answer,
                        "model": model,
                        "timestamp": datetime.now().isoformat()
                    }
                else:
                    print("⚠️ 폴백 응답에서 답변을 찾을 수 없습니다.")
                    return {
                        "success": False,
                        "error": "폴백 API 응답에서 답변을 찾을 수 없습니다.",
                        "data": data
                    }
            else:
                error_text = response.text
                print(f"❌ 폴백 API 오류: {response.status_code} - {error_text}")
                return {
                    "success": False,
                    "error": f"폴백 Gemini API 오류: {response.status_code}",
                    "details": error_text
                }
            
    except Exception as e:
        print(f"❌ 예외 발생: {str(e)}")
        return {
            "success": False,
            "error": f"서버 오류: {str(e)}"
        }
