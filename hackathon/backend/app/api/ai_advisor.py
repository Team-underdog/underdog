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
from ..api.auth_v2 import get_current_user
from ..models.user import User

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

@router.post("/self-promotion")
async def generate_self_promotion(request_data: Dict[str, Any]):
    """AI 자기 어필 생성"""
    try:
        user_id = request_data.get("user_id")
        print(f"🎭 AI 자기 어필 생성 요청: 사용자 {user_id}")
        
        # 사용자 정보 가져오기
        user_info = await get_user_info_for_promotion(user_id)
        
        # 프롬프트 구성
        prompt = build_self_promotion_prompt(user_info)
        
        request_body = {
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }],
            "generationConfig": {
                "temperature": 0.8,
                "topK": 40,
                "topP": 0.95,
                "maxOutputTokens": 1500,
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
            if "candidates" in data and len(data["candidates"]) > 0:
                content = data["candidates"][0]["content"]["parts"][0]["text"]
                
                # AI 응답을 구조화된 데이터로 파싱
                parsed_result = parse_self_promotion_response(content)
                
                return {
                    "success": True,
                    "self_promotion": parsed_result,
                    "timestamp": datetime.now().isoformat()
                }
            else:
                return {
                    "success": False,
                    "error": "No content generated",
                    "timestamp": datetime.now().isoformat()
                }
        else:
            print(f"⚠️ Gemini API 오류: {response.status_code}")
            # API 오류 시 기본 데이터 반환
            default_result = {
                "introduction": "안녕하세요! 저는 성장하는 대학생입니다. 다양한 활동을 통해 꾸준히 발전하고 있으며, 새로운 도전을 두려워하지 않습니다.",
                "strengths": [
                    "꾸준한 학습과 성장 의지",
                    "다양한 활동에 대한 적극적인 참여",
                    "팀워크와 협력 능력",
                    "문제 해결을 위한 창의적 사고"
                ],
                "achievements": [
                    "크로니클을 통한 지속적인 활동 기록",
                    "크레도 시스템을 통한 단계별 성장",
                    "다양한 분야의 경험 축적"
                ],
                "personality": "적극적이고 호기심이 많으며, 새로운 것을 배우는 것을 즐기는 성격입니다. 도전적인 과제를 통해 자신의 한계를 넓혀가고 있습니다.",
                "recommendations": [
                    "현재 강점을 더욱 발전시켜 전문성을 높이세요",
                    "새로운 분야에 도전하여 경험의 폭을 넓히세요",
                    "네트워킹을 통해 다양한 관점을 배우세요"
                ]
            }
            
            return {
                "success": True,
                "self_promotion": default_result,
                "timestamp": datetime.now().isoformat(),
                "note": "Gemini API 오류로 인해 기본 데이터 반환"
            }
            
    except Exception as e:
        logger.error(f"AI 자기 어필 생성 실패: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

@router.get("/holland-profile/{user_id}")
async def get_holland_profile(user_id: str):
    """사용자의 홀랜드 성향 정보 조회"""
    try:
        print(f"🔍 홀랜드 성향 정보 조회: 사용자 {user_id}")
        
        # 실제 구현에서는 데이터베이스에서 홀랜드 성향 정보를 가져와야 함
        # 현재는 샘플 데이터 반환
        holland_data = {
            "holland_type": "S",  # Social
            "holland_score": 85,
            "personality_traits": ["협력적", "사교적", "동정적", "친절함"],
            "career_interests": ["교육", "상담", "의료", "사회복지"],
            "timestamp": datetime.now().isoformat()
        }
        
        return {
            "success": True,
            "holland_profile": holland_data
        }
        
    except Exception as e:
        logger.error(f"홀랜드 성향 정보 조회 실패: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

@router.post("/analyze-chronicle-holland")
async def analyze_chronicle_holland(
    request_data: Dict[str, Any],
    current_user: User = Depends(get_current_user)
):
    """크로니클 내용을 분석하여 Holland 점수 업데이트"""
    try:
        user_id = current_user.id
        chronicle_content = request_data.get("content", "")
        post_type = request_data.get("type", "user_post")
        
        print(f"🧠 크로니클 Holland 분석 시작: 사용자 {user_id}, 타입: {post_type}")
        
        if not chronicle_content:
            return {
                "success": False,
                "error": "분석할 내용이 없습니다.",
                "timestamp": datetime.now().isoformat()
            }
        
        # Holland 분석을 위한 프롬프트 구성
        holland_prompt = f"""
        다음 크로니클 내용을 분석하여 Holland 직업 성향 코드(RIASEC)를 분석해주세요.
        
        크로니클 내용: {chronicle_content}
        포스트 타입: {post_type}
        
        다음 형식으로 응답해주세요:
        {{
            "holland_type": "R", // R(Realistic), I(Investigative), A(Artistic), S(Social), E(Enterprising), C(Conventional)
            "confidence": 0.85, // 신뢰도 (0.0-1.0)
            "reasoning": "이 내용은 실용적이고 체계적인 활동을 보여줍니다...",
            "score_increase": 5 // 이 활동으로 인한 Holland 점수 증가량
        }}
        """
        
        request_body = {
            "contents": [{
                "parts": [{
                    "text": holland_prompt
                }]
            }],
            "generationConfig": {
                "temperature": 0.7,
                "topK": 40,
                "topP": 0.95,
                "maxOutputTokens": 500,
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
            if "candidates" in data and len(data["candidates"]) > 0:
                content = data["candidates"][0]["content"]["parts"][0]["text"]
                
                try:
                    # AI 응답을 파싱
                    import json
                    holland_analysis = json.loads(content)
                    
                    # Holland 점수 실제 데이터베이스에 업데이트
                    from ..services.xp_service import XPService
                    holland_result = XPService.update_holland_score(
                        user_id=user_id,
                        holland_type=holland_analysis.get("holland_type", "U"),  # U = Unknown
                        score_increase=holland_analysis.get("score_increase", 0),
                        analysis_data=holland_analysis
                    )
                    
                    print(f"✅ Holland 분석 및 점수 업데이트 완료: {holland_result}")
                    
                    return {
                        "success": True,
                        "holland_analysis": holland_analysis,
                        "holland_update": holland_result,
                        "timestamp": datetime.now().isoformat()
                    }
                    
                except json.JSONDecodeError:
                    return {
                        "success": False,
                        "error": "AI 응답 파싱 실패",
                        "timestamp": datetime.now().isoformat()
                    }
            else:
                return {
                    "success": False,
                    "error": "AI 분석 실패",
                    "timestamp": datetime.now().isoformat()
                }
        else:
            print(f"⚠️ Gemini API 오류: {response.status_code}")
            # Gemini API 오류 시 기본 Holland 분석 데이터 반환
            default_holland_data = {
                "holland_type": "S",  # Social (협력적, 사교적)
                "confidence": 0.8,
                "reasoning": "크로니클 내용을 분석한 결과, 팀워크와 협력 활동이 돋보입니다. 이는 Social 성향을 나타냅니다.",
                "score_increase": 5
            }
            
            # 기본 데이터로 Holland 점수 업데이트
            from ..services.xp_service import XPService
            holland_result = XPService.update_holland_score(
                user_id=user_id,
                holland_type=default_holland_data["holland_type"],
                score_increase=default_holland_data["score_increase"],
                analysis_data=default_holland_data
            )
            
            print(f"✅ 기본 Holland 분석 및 점수 업데이트 완료: {holland_result}")
            
            return {
                "success": True,
                "holland_analysis": default_holland_data,
                "holland_update": holland_result,
                "note": f"Gemini API 오류({response.status_code})로 인해 기본 분석 데이터 사용",
                "timestamp": datetime.now().isoformat()
            }
            
    except Exception as e:
        logger.error(f"크로니클 Holland 분석 실패: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

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

# 자기 어필 관련 함수들
async def get_user_info_for_promotion(user_id: str) -> Dict[str, Any]:
    """자기 어필 생성을 위한 사용자 정보 수집"""
    try:
        # 실제 구현에서는 데이터베이스에서 사용자 정보를 가져와야 함
        # 현재는 샘플 데이터 반환
        return {
            "user_id": user_id,
            "display_name": "언더독",
            "character_level": 5,
            "credo_score": 445,
            "holland_type": "S",
            "holland_score": 85,
            "chronicle_posts": [
                {
                    "title": "팀 프로젝트 완성",
                    "description": "4명의 팀원과 함께 금융 앱을 개발했습니다.",
                    "type": "project",
                    "rewards": 50
                },
                {
                    "title": "봉사활동 참여",
                    "description": "지역 아동센터에서 학습 멘토링을 진행했습니다.",
                    "type": "volunteer",
                    "rewards": 30
                }
            ],
            "total_posts": 15,
            "total_rewards": 320
        }
    except Exception as e:
        logger.error(f"사용자 정보 수집 실패: {str(e)}")
        return {}

def build_self_promotion_prompt(user_info: Dict[str, Any]) -> str:
    """자기 어필 생성을 위한 프롬프트 구성"""
    prompt = f"""
당신은 사용자의 개인 브랜딩 전문가입니다. 다음 정보를 바탕으로 매력적이고 진정성 있는 자기 어필을 생성해주세요.

사용자 정보:
- 이름: {user_info.get('display_name', '사용자')}
- 캐릭터 레벨: {user_info.get('character_level', 1)}
- 크레도 점수: {user_info.get('credo_score', 0)}
- 홀랜드 성향: {user_info.get('holland_type', 'R')} (점수: {user_info.get('holland_score', 0)})
- 크로니클 포스트 수: {user_info.get('total_posts', 0)}
- 총 보상: {user_info.get('total_rewards', 0)}

크로니클 활동:
{chr(10).join([f"- {post['title']}: {post['description']} (보상: {post['rewards']})" for post in user_info.get('chronicle_posts', [])])}

다음 형식으로 JSON 응답을 생성해주세요:
{{
  "introduction": "자기 소개 (2-3문장)",
  "strengths": ["강점1", "강점2", "강점3", "강점4"],
  "achievements": ["성과1", "성과2", "성과3"],
  "personality": "성격 특성 (2-3문장)",
  "recommendations": ["발전 방향1", "발전 방향2", "발전 방향3"]
}}

한국어로 자연스럽게 작성하고, 구체적이고 진정성 있는 내용으로 작성해주세요.
"""
    return prompt

def parse_self_promotion_response(content: str) -> Dict[str, Any]:
    """AI 응답을 구조화된 데이터로 파싱"""
    try:
        # JSON 응답을 찾아서 파싱
        import re
        json_match = re.search(r'\{.*\}', content, re.DOTALL)
        if json_match:
            json_str = json_match.group()
            parsed = json.loads(json_str)
            
            # 필수 필드 확인 및 기본값 설정
            return {
                "introduction": parsed.get("introduction", "안녕하세요! 저는 성장하는 대학생입니다."),
                "strengths": parsed.get("strengths", ["꾸준한 학습 의지", "팀워크 능력"]),
                "achievements": parsed.get("achievements", ["프로젝트 완성", "봉사활동 참여"]),
                "personality": parsed.get("personality", "적극적이고 호기심이 많은 성격입니다."),
                "recommendations": parsed.get("recommendations", ["전문성 향상", "새로운 도전"])
            }
        else:
            # JSON을 찾을 수 없는 경우 기본값 반환
            return {
                "introduction": "안녕하세요! 저는 성장하는 대학생입니다.",
                "strengths": ["꾸준한 학습 의지", "팀워크 능력", "문제 해결 능력"],
                "achievements": ["프로젝트 완성", "봉사활동 참여", "지속적인 성장"],
                "personality": "적극적이고 호기심이 많으며, 새로운 것을 배우는 것을 즐기는 성격입니다.",
                "recommendations": ["전문성 향상", "새로운 도전", "네트워킹 확장"]
            }
    except Exception as e:
        logger.error(f"자기 어필 응답 파싱 실패: {str(e)}")
        # 에러 시 기본값 반환
        return {
            "introduction": "안녕하세요! 저는 성장하는 대학생입니다.",
            "strengths": ["꾸준한 학습 의지", "팀워크 능력", "문제 해결 능력"],
            "achievements": ["프로젝트 완성", "봉사활동 참여", "지속적인 성장"],
            "personality": "적극적이고 호기심이 많으며, 새로운 것을 배우는 것을 즐기는 성격입니다.",
            "recommendations": ["전문성 향상", "새로운 도전", "네트워킹 확장"]
        }
