const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

export interface AuthUser {
  id: number;
  email: string;
  display_name: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    email: string;
    display_name: string;
  };
}

// 네트워크 재시도 함수
const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (i < maxRetries - 1) {
        // 지수 백오프
        const backoffDelay = delay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        console.log(`재시도 ${i + 1}/${maxRetries}...`);
      }
    }
  }
  
  throw lastError!;
};

// 백엔드 API 이메일/비밀번호 회원가입
export const signUpWithEmail = async (email: string, password: string, displayName?: string): Promise<AuthUser> => {
  return retryOperation(async () => {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        display_name: displayName
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '회원가입 실패');
    }
    
    const result = await response.json();
    return {
      id: result.user.id,
      email: result.user.email,
      display_name: result.user.display_name,
    };
  });
};

// 백엔드 API 이메일/비밀번호 로그인
export const signInWithEmail = async (email: string, password: string): Promise<AuthUser> => {
  return retryOperation(async () => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '로그인 실패');
    }
    
    const result: LoginResponse = await response.json();
    
    // 토큰 저장
    localStorage.setItem('accessToken', result.access_token);
    
    return {
      id: result.user.id,
      email: result.user.email,
      display_name: result.user.display_name,
    };
  });
};

// 로그아웃
export const signOut = async (): Promise<void> => {
  try {
    // 백엔드 로그아웃 요청
    const token = localStorage.getItem('accessToken');
    if (token) {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    }
  } catch (error) {
    console.log('백엔드 로그아웃 실패:', error);
  } finally {
    // 로컬 토큰 제거
    localStorage.removeItem('accessToken');
  }
};

// 인증 상태 변경 감지
export const onAuthStateChanged = (callback: (user: AuthUser | null) => void) => {
  // 토큰 존재 여부로 인증 상태 확인
  const checkAuthState = () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // 토큰 유효성 검증
      fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('토큰이 유효하지 않습니다.');
        }
      })
      .then(userData => {
        callback({
          id: userData.id,
          email: userData.email,
          display_name: userData.display_name,
        });
      })
      .catch(() => {
        localStorage.removeItem('accessToken');
        callback(null);
      });
    } else {
      callback(null);
    }
  };
  
  // 초기 상태 확인
  checkAuthState();
  
  // 토큰 변경 감지
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function(key, value) {
    if (key === 'accessToken') {
      setTimeout(checkAuthState, 100);
    }
    return originalSetItem.apply(this, arguments);
  };
  
  const originalRemoveItem = localStorage.removeItem;
  localStorage.removeItem = function(key) {
    if (key === 'accessToken') {
      setTimeout(checkAuthState, 100);
    }
    return originalRemoveItem.apply(this, arguments);
  };
  
  // 정리 함수 반환
  return () => {
    localStorage.setItem = originalSetItem;
    localStorage.removeItem = originalRemoveItem;
  };
};
