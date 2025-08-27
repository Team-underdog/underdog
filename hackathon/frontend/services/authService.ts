import * as SecureStore from 'expo-secure-store';
import { API_ENDPOINTS } from '../config/api';

export interface AuthUser {
  id: number;
  email: string;
  display_name: string;
  current_university?: string;
  current_department?: string;
  grade_level?: number;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
  expires_in: number;
}

// SSAFY API 연동을 위한 인터페이스
export interface SSAFYStudentInfo {
  is_valid_student: boolean;
  student_name?: string;
  university?: string;
  student_id?: string;
  department?: string;
  grade?: number;
  message?: string;
}

export interface SSAFYAccountCreation {
  success: boolean;
  user_key?: string;
  message?: string;
}

// 네트워크 재시도 함수
const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      console.log(`🔄 백엔드 API 재시도 ${attempt}/${maxRetries}...`);
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
    }
  }
  
  throw lastError;
};

/**
 * 인증 토큰 가져오기
 */
export const authToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync('authToken');
  } catch (error) {
    console.error('토큰 조회 실패:', error);
    return null;
  }
};

/**
 * SSAFY 학생 이메일 검증 (중복 확인)
 * SSAFY API의 MEMBER_02 (사용자 계정 조회) 사용
 */
export const verifySSAFYEmail = async (email: string): Promise<SSAFYStudentInfo> => {
  try {
    console.log('🔍 SSAFY API로 학생 이메일 검증 시작:', email);
    
    const response = await retryOperation(() => 
      fetch(API_ENDPOINTS.AUTH.VERIFY_SSAFY_EMAIL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'SSAFY 학생 이메일 검증에 실패했습니다.');
    }

    const result: SSAFYStudentInfo = await response.json();
    console.log('✅ SSAFY 학생 이메일 검증 완료:', result);
    
    return result;
  } catch (error: any) {
    console.error('❌ SSAFY 학생 이메일 검증 실패:', error);
    throw error;
  }
};

/**
 * SSAFY 계정 생성 (신규 가입시)
 * SSAFY API의 MEMBER_01 (사용자 계정 생성) 사용
 */
export const createSSAFYAccount = async (email: string): Promise<SSAFYAccountCreation> => {
  try {
    console.log('🏭 SSAFY API로 계정 생성 시작:', email);
    
    const response = await retryOperation(() => 
      fetch(API_ENDPOINTS.AUTH.CREATE_SSAFY_ACCOUNT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'SSAFY 계정 생성에 실패했습니다.');
    }

    const result: SSAFYAccountCreation = await response.json();
    console.log('✅ SSAFY 계정 생성 완료:', result);
    
    return result;
  } catch (error: any) {
    console.error('❌ SSAFY 계정 생성 실패:', error);
    throw error;
  }
};

/**
 * 회원가입 (SSAFY API 연동 포함)
 */
export const signUpWithEmail = async (
  email: string, 
  password: string, 
  displayName: string,
  university?: string,
  department?: string,
  gradeLevel?: number
): Promise<AuthUser> => {
  try {
    console.log('🏭 백엔드 API 회원가입 시작:', email);
    
    // 1. SSAFY API에 계정 생성
    const ssafyResult = await createSSAFYAccount(email);
    if (!ssafyResult.success) {
      throw new Error(ssafyResult.message || 'SSAFY 계정 생성에 실패했습니다.');
    }
    
    // 2. 백엔드에 사용자 정보 저장
    const response = await retryOperation(() => 
      fetch(API_ENDPOINTS.AUTH.SIGNUP, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          display_name: displayName,
          university,
          department,
          grade_level: gradeLevel,
          ssafy_user_key: ssafyResult.user_key, // SSAFY에서 발급받은 user_key 저장
        }),
      })
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || '회원가입에 실패했습니다.');
    }

    const result = await response.json();
    console.log('✅ 백엔드 API 회원가입 성공:', result.user.id);
    
    return result.user;
  } catch (error: any) {
    console.error('❌ 백엔드 API 회원가입 실패:', error);
    throw error;
  }
};

/**
 * 로그인
 */
export const signInWithEmail = async (email: string, password: string): Promise<AuthUser> => {
  try {
    const response = await retryOperation(() => 
      fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || '로그인에 실패했습니다.');
    }

    const result: LoginResponse = await response.json();
    console.log('✅ 백엔드 API 로그인 성공:', result.user.id);
    
    // JWT 토큰 저장
    await SecureStore.setItemAsync('authToken', result.access_token);
    
    return result.user;
  } catch (error: any) {
    console.error('❌ 백엔드 API 로그인 실패:', error);
    throw error;
  }
};

/**
 * 로그아웃
 */
export const signOutUser = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync('authToken');
    console.log('✅ 백엔드 API 로그아웃 성공');
  } catch (error) {
    console.error('❌ 백엔드 API 로그아웃 실패:', error);
    throw new Error('로그아웃 중 오류가 발생했습니다.');
  }
};

/**
 * 현재 사용자 가져오기
 */
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const token = await authToken();
    if (!token) return null;

    const response = await fetch(API_ENDPOINTS.AUTH.ME, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      await SecureStore.deleteItemAsync('authToken');
      return null;
    }

    const user = await response.json();
    return user;
  } catch (error) {
    console.error('❌ 현재 사용자 조회 실패:', error);
    return null;
  }
};

/**
 * 인증 상태 변화 리스너 (백엔드 API용)
 */
export const onAuthStateChange = (callback: (user: AuthUser | null) => void) => {
  let currentUser: AuthUser | null = null;
  
  const checkAuthState = async () => {
    const user = await getCurrentUser();
    if (user !== currentUser) {
      currentUser = user;
      callback(user);
    }
  };

  // 초기 상태 확인
  checkAuthState();

  // 정기적으로 상태 확인 (10초마다)
  const intervalId = setInterval(checkAuthState, 10000);

  return () => {
    clearInterval(intervalId);
  };
};
