// 백엔드 API 서비스 설정
// 모바일 앱에서 접근할 수 있도록 로컬 네트워크 IP 사용
// 개발 환경에서는 컴퓨터의 로컬 IP 주소를 사용해야 함
export const API_BASE_URL = 'http://192.168.10.45:8000'; // 현재 로컬 IP

// API 엔드포인트
export const API_ENDPOINTS = {
  // 인증
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    SIGNUP: `${API_BASE_URL}/api/auth/signup`,
    CHECK_EMAIL: `${API_BASE_URL}/api/auth/check-email`,
    ME: `${API_BASE_URL}/api/auth/me`,
    PROFILE: `${API_BASE_URL}/api/auth/profile`,
    VERIFY_SSAFY_EMAIL: `${API_BASE_URL}/api/ssafy/verify-ssafy-email`,
    CREATE_SSAFY_ACCOUNT: `${API_BASE_URL}/api/ssafy/create-ssafy-account`,
    SSAFY_INTEGRATION_STATUS: `${API_BASE_URL}/api/ssafy/integration-status`,
  },
  // 대학교
  UNIVERSITY: {
    LIST: `${API_BASE_URL}/api/universities`,
    DEPARTMENTS: `${API_BASE_URL}/api/universities`,
    COURSES: `${API_BASE_URL}/api/universities`,
  },
  // 학사
  ACADEMIC: {
    RECORDS: `${API_BASE_URL}/api/academic/records`,
    SCHOLARSHIPS: `${API_BASE_URL}/api/academic/scholarships`,
  },
  // 금융
  FINANCIAL: {
    ACCOUNTS: `${API_BASE_URL}/api/financial/accounts`,
    TRANSACTIONS: `${API_BASE_URL}/api/financial/transactions`,
    PRODUCTS: `${API_BASE_URL}/api/financial/products`,
    SUMMARY: `${API_BASE_URL}/api/financial/summary`,
  },
  // XP/레벨
  XP: {
    ADD: `${API_BASE_URL}/api/xp/add`,
    ADD_CREDO: `${API_BASE_URL}/api/xp/add`,
    DEDUCT_FOR_DELETION: `${API_BASE_URL}/api/xp/deduct-for-deletion`,
    ME: `${API_BASE_URL}/api/xp/me`,
    PROGRESS: `${API_BASE_URL}/api/xp/progress`,
  },
  // 건강
  HEALTH: {
    STATUS: `${API_BASE_URL}/api/health`,
  },
  // 크로니클
  CHRONICLE: {
    POSTS: `${API_BASE_URL}/api/chronicle/posts`,
    USER_POSTS: `${API_BASE_URL}/api/chronicle/posts`,
  },
  // AI 상담
  AI_ADVISOR: {
    HEALTH: `${API_BASE_URL}/api/ai-advisor/health`,
    GENERATE: `${API_BASE_URL}/api/ai-advisor/generate`,
    FINANCIAL_ADVICE: `${API_BASE_URL}/api/ai-advisor/financial-advice`,
    BUDGET_ANALYSIS: `${API_BASE_URL}/api/ai-advisor/budget-analysis`,
    SELF_PROMOTION: `${API_BASE_URL}/api/ai-advisor/self-promotion`,
    HOLLAND_PROFILE: `${API_BASE_URL}/api/ai-advisor/holland-profile`,
    ANALYZE_CHRONICLE_HOLLAND: `${API_BASE_URL}/api/ai-advisor/analyze-chronicle-holland`,
  }
};

// 네트워크 타임아웃 및 재시도 설정
const originalFetch = global.fetch;
global.fetch = function(input, init) {
  const timeout = 30000; // 30초 타임아웃
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  return originalFetch(input, {
    ...init,
    signal: controller.signal,
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'User-Agent': 'Expo/1.0.0',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
      ...init?.headers,
    },
  }).finally(() => clearTimeout(timeoutId));
};

// API 연결 상태 확인
export const checkAPIConnection = async () => {
  try {
    console.log('🔍 API 연결 테스트 시작:', API_ENDPOINTS.HEALTH.STATUS);
    const response = await fetch(API_ENDPOINTS.HEALTH.STATUS);
    console.log('✅ API 응답 상태:', response.status);
    const data = await response.json();
    console.log('✅ API 응답 데이터:', data);
    return response.ok;
  } catch (error) {
    console.error('❌ 백엔드 API 연결 실패:', error);
    console.error('❌ 에러 타입:', typeof error);
    console.error('❌ 에러 메시지:', error.message);
    return false;
  }
};

// 간단한 API 연결 테스트
export const testAPIConnection = async () => {
  try {
    console.log('🧪 API 연결 테스트 시작...');
    const isConnected = await checkAPIConnection();
    if (isConnected) {
      console.log('✅ API 연결 성공!');
    } else {
      console.log('❌ API 연결 실패!');
    }
    return isConnected;
  } catch (error) {
    console.error('❌ API 연결 테스트 중 오류:', error);
    return false;
  }
};

// 네트워크 상태 모니터링
export const monitorAPIConnection = () => {
  let isOnline = true;
  let retryCount = 0;
  const maxRetries = 5;
  
  // 정기적인 연결 상태 확인
  const intervalId = setInterval(async () => {
    if (isOnline && retryCount < maxRetries) {
      try {
        const connected = await checkAPIConnection();
        if (!connected) {
          retryCount++;
          console.log(`🔄 백엔드 API 연결 재시도 ${retryCount}/${maxRetries}...`);
          
          if (retryCount >= maxRetries) {
            console.log('⚠️ 백엔드 API 최대 재시도 횟수 도달');
            isOnline = false;
          }
        } else {
          retryCount = 0; // 성공 시 카운터 리셋
        }
      } catch (error) {
        console.error('❌ 백엔드 API 연결 확인 중 오류:', error);
      }
    }
  }, 10000); // 10초마다 확인
  
  return {
    isOnline: () => isOnline,
    reconnect: async () => {
      if (!isOnline && retryCount < maxRetries) {
        try {
          const connected = await checkAPIConnection();
          if (connected) {
            isOnline = true;
            retryCount = 0;
            console.log('✅ 백엔드 API 재연결 성공');
          } else {
            retryCount++;
            console.log(`🔄 재연결 시도 ${retryCount}/${maxRetries}`);
          }
        } catch (error) {
          console.error('❌ 백엔드 API 재연결 실패:', error);
        }
      }
    },
    cleanup: () => {
      clearInterval(intervalId);
    }
  };
};

// 기본 내보내기
export default {
  API_ENDPOINTS,
  checkAPIConnection,
  testAPIConnection,
  monitorAPIConnection
};
