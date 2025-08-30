/**
 * Gemini API 연동 테스트
 * 브라우저 콘솔에서 실행하거나 Node.js 환경에서 테스트
 */

// API 키 확인
const GEMINI_API_KEY = 'AIzaSyDFKAfEDMhqiGcJuOz5jjuEAUGg3Yvn46k';
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

console.log('🔑 Gemini API 키:', GEMINI_API_KEY ? '설정됨' : '설정되지 않음');

/**
 * Gemini API 호출 테스트
 */
async function testGeminiAPI() {
  try {
    console.log('🚀 Gemini API 테스트 시작...');
    
    const prompt = `안녕하세요! 당신은 한국의 전문 금융 상담사입니다. 
    대학생이 월 50만원 용돈으로 어떻게 100만원을 모을 수 있을지 간단한 조언을 3가지만 한국어로 답변해주세요.`;
    
    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };
    
    console.log('📤 API 요청 전송 중...');
    console.log('요청 본문:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(`${BASE_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    console.log('📥 응답 수신:', response.status, response.statusText);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ API 응답 성공!');
    console.log('응답 데이터:', JSON.stringify(data, null, 2));
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const answer = data.candidates[0].content.parts[0].text;
      console.log('🤖 AI 답변:');
      console.log(answer);
    } else {
      console.log('⚠️ 응답에서 답변을 찾을 수 없습니다.');
    }
    
  } catch (error) {
    console.error('❌ Gemini API 테스트 실패:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.log('💡 Node.js 환경에서는 node-fetch를 설치하거나 다른 HTTP 클라이언트를 사용하세요.');
    }
  }
}

/**
 * 간단한 금융 상담 테스트
 */
async function testFinancialAdvice() {
  try {
    console.log('💰 금융 상담 테스트 시작...');
    
    const questions = [
      "대학생이 처음으로 투자를 시작하려면 어떻게 해야 할까요?",
      "월 30만원으로 1년 안에 500만원을 모으려면 어떻게 해야 할까요?",
      "신용카드 사용 시 주의사항은 무엇인가요?"
    ];
    
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      console.log(`\n📝 질문 ${i + 1}: ${question}`);
      
      const requestBody = {
        contents: [{
          parts: [{
            text: `당신은 한국의 전문 금융 상담사입니다. 다음 질문에 대해 친근하고 이해하기 쉽게 답변해주세요: ${question}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        }
      };
      
      const response = await fetch(`${BASE_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
          const answer = data.candidates[0].content.parts[0].text;
          console.log(`🤖 답변: ${answer.substring(0, 200)}...`);
        }
      } else {
        console.log(`❌ 질문 ${i + 1} 실패: ${response.status}`);
      }
      
      // API 호출 간격 조절
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
  } catch (error) {
    console.error('❌ 금융 상담 테스트 실패:', error);
  }
}

/**
 * API 키 유효성 검증
 */
function validateAPIKey() {
  if (!GEMINI_API_KEY) {
    console.error('❌ Gemini API 키가 설정되지 않았습니다.');
    return false;
  }
  
  if (GEMINI_API_KEY.length < 20) {
    console.error('❌ Gemini API 키가 너무 짧습니다.');
    return false;
  }
  
  if (GEMINI_API_KEY.startsWith('AIza')) {
    console.log('✅ Gemini API 키 형식이 올바릅니다.');
    return true;
  } else {
    console.warn('⚠️ Gemini API 키 형식이 예상과 다릅니다.');
    return false;
  }
}

// 테스트 실행
console.log('🧪 Gemini API 테스트 준비 완료!');
console.log('다음 함수들을 실행해보세요:');
console.log('- testGeminiAPI() : 기본 API 호출 테스트');
console.log('- testFinancialAdvice() : 금융 상담 테스트');
console.log('- validateAPIKey() : API 키 유효성 검증');

// 자동으로 API 키 검증
validateAPIKey();

export { testGeminiAPI, testFinancialAdvice, validateAPIKey };
