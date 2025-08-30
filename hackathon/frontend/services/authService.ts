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
  is_valid?: boolean;
  is_valid_student?: boolean;
  student_name?: string;
  university?: string;
  student_id?: string;
  department?: string;
  grade?: number;
  message?: string;
  // 백엔드에서 반환하는 실제 데이터 구조
  data?: {
    is_valid?: boolean;
    student_info?: {
      userId?: string;
      userName?: string;
      userKey?: string;
      institutionCode?: string;
    };
    email?: string;
  };
  // 직접 필드로도 접근 가능
  userKey?: string;
  userId?: string;
  userName?: string;
  institutionCode?: string;
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
      console.error('❌ SSAFY API 오류 응답:', {
        status: response.status,
        statusText: response.statusText,
        errorData: errorData
      });
      
      // 백엔드에서 반환한 구조화된 에러 정보 처리
      if (errorData.detail && typeof errorData.detail === 'object') {
        const detail = errorData.detail;
        if (detail.error && detail.error.error_message) {
          throw new Error(detail.error.error_message);
        } else if (detail.message) {
          throw new Error(detail.message);
        }
      }
      
      throw new Error(errorData.detail || 'SSAFY 학생 이메일 검증에 실패했습니다.');
    }

    const result: SSAFYStudentInfo = await response.json();
    console.log('✅ SSAFY 학생 이메일 검증 완료:', result);
    
    // 백엔드 응답 구조에 맞춰 userKey 추출
    let userKey: string | undefined;
    if (result.data?.student_info?.userKey) {
      userKey = result.data.student_info.userKey;
    } else if (result.userKey) {
      userKey = result.userKey;
    }
    
    if (userKey) {
      console.log('🔑 SSAFY userKey 추출 성공:', userKey);
    }
    
    return result;
  } catch (error: any) {
    // 에러 객체의 구조를 파악하여 적절한 로깅
    if (error instanceof Error) {
      console.error('❌ SSAFY 학생 이메일 검증 실패:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
    } else if (typeof error === 'object' && error !== null) {
      console.error('❌ SSAFY 학생 이메일 검증 실패 (객체):', {
        error: error,
        errorType: typeof error,
        errorKeys: Object.keys(error),
        errorString: JSON.stringify(error, null, 2)
      });
    } else {
      console.error('❌ SSAFY 학생 이메일 검증 실패 (기타):', {
        error: error,
        errorType: typeof error
      });
    }
    
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
      console.error('❌ SSAFY API 계정 생성 오류 응답:', {
        status: response.status,
        statusText: response.statusText,
        errorData: errorData
      });
      
      // 백엔드에서 반환한 구조화된 에러 정보 처리
      if (errorData.detail && typeof errorData.detail === 'object') {
        const detail = errorData.detail;
        if (detail.error && detail.error.error_message) {
          throw new Error(detail.error.error_message);
        } else if (detail.message) {
          throw new Error(detail.message);
        }
      }
      
      throw new Error(errorData.detail || 'SSAFY 계정 생성에 실패했습니다.');
    }

    const result: SSAFYAccountCreation = await response.json();
    console.log('✅ SSAFY 계정 생성 완료:', result);
    
    return result;
  } catch (error: any) {
    // 에러 객체의 구조를 파악하여 적절한 로깅
    if (error instanceof Error) {
      console.error('❌ SSAFY 계정 생성 실패:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
    } else if (typeof error === 'object' && error !== null) {
      console.error('❌ SSAFY 계정 생성 실패 (객체):', {
        error: error,
        errorType: typeof error,
        errorKeys: Object.keys(error),
        errorString: JSON.stringify(error, null, 2)
      });
    } else {
      console.error('❌ SSAFY 계정 생성 실패 (기타):', {
        error: error,
        errorType: typeof error
      });
    }
    
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
    
    // 1. SSAFY API에 계정 생성 시도
    let ssafyUserKey: string | null = null;
    
    try {
      const ssafyResult = await createSSAFYAccount(email);
      if (ssafyResult.success) {
        ssafyUserKey = ssafyResult.user_key || ssafyResult.data?.userKey;
        console.log('✅ SSAFY 계정 생성 성공, userKey:', ssafyUserKey);
      }
    } catch (ssafyError: any) {
      // SSAFY 계정이 이미 존재하는 경우 (E4002) - 정상적인 상황
      if (ssafyError.message && ssafyError.message.includes('E4002')) {
        console.log('ℹ️ SSAFY 계정이 이미 존재합니다. 기존 계정 정보를 사용합니다.');
        
        // 기존 SSAFY 계정 정보 조회
        try {
          const verifyResult = await verifySSAFYEmail(email);
          if (verifyResult && verifyResult.userKey) {
            ssafyUserKey = verifyResult.userKey;
            console.log('✅ 기존 SSAFY 계정 정보 조회 성공, userKey:', ssafyUserKey);
          }
        } catch (verifyError) {
          console.warn('⚠️ 기존 SSAFY 계정 정보 조회 실패:', verifyError);
        }
      } else {
        // 다른 SSAFY 오류인 경우
        console.error('❌ SSAFY 계정 생성 중 예상치 못한 오류:', ssafyError);
        throw new Error(`SSAFY 계정 생성 실패: ${ssafyError.message}`);
      }
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
          ssafy_user_key: ssafyUserKey, // SSAFY에서 발급받은 user_key 저장
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
    // 에러 객체의 구조를 파악하여 적절한 로깅
    if (error instanceof Error) {
      console.error('❌ 백엔드 API 회원가입 실패:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
    } else if (typeof error === 'object' && error !== null) {
      console.error('❌ 백엔드 API 회원가입 실패 (객체):', {
        error: error,
        errorType: typeof error,
        errorKeys: Object.keys(error),
        errorString: JSON.stringify(error, null, 2)
      });
    } else {
      console.error('❌ 백엔드 API 회원가입 실패 (기타):', {
        error: error,
        errorType: typeof error
      });
    }
    
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
