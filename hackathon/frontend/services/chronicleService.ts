import { API_ENDPOINTS } from '../config/api';
import * as SecureStore from 'expo-secure-store';

// 크로니클 포스트 인터페이스
export interface ChroniclePost {
  id?: string;
  userId: string;
  type: 'user_post';
  title: string;
  description: string;
  timestamp: string;
  rewards: {
    credo: number;
  };
  userContent: {
    text: string;
    image?: string;
    isUserGenerated: boolean;
  };
}

/**
 * 사용자의 크로니클 포스트 저장
 */
export const saveChroniclePost = async (userId: string, post: Omit<ChroniclePost, 'id' | 'userId'>): Promise<string> => {
  try {
    // 인증 토큰 가져오기
    const token = await SecureStore.getItemAsync('authToken');
    
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
    }
    
    // 백엔드 모델에 맞는 데이터 구조로 변환
    const backendPost = {
      user_id: parseInt(userId), // string -> int 변환
      type: post.type,
      title: post.title,
      description: post.description,
      rewards: JSON.stringify(post.rewards), // 객체 -> JSON 문자열
      user_content: JSON.stringify(post.userContent), // 객체 -> JSON 문자열
    };
    
    const response = await fetch(API_ENDPOINTS.CHRONICLE.POSTS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(backendPost),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ 크로니클 포스트 저장 완료:', result.id);
    return result.id;
  } catch (error) {
    // error 객체를 안전하게 처리
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ 크로니클 포스트 저장 실패:', errorMessage);
    throw error;
  }
};

/**
 * 사용자의 크로니클 포스트 불러오기
 */
export const getUserChronicles = async (userId: string): Promise<ChroniclePost[]> => {
  try {
    // 먼저 공개 API로 시도 (인증 없이)
    const response = await fetch(`${API_ENDPOINTS.CHRONICLE.USER_POSTS.replace('/posts', '/posts/public')}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const posts = await response.json();
    console.log('✅ 크로니클 포스트 불러옴 (공개):', posts.length, '개');
    
    // 백엔드에서 이미 객체로 반환하므로 파싱 불필요
    return posts;
  } catch (error) {
    // error 객체를 안전하게 처리
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ 크로니클 포스트 불러오기 실패:', errorMessage);
    // 실패 시 빈 배열 반환
    return [];
  }
};

/**
 * 크로니클 포스트 삭제
 */
export const deleteChroniclePost = async (postId: string): Promise<void> => {
  try {
    // 인증 토큰 가져오기
    const token = await SecureStore.getItemAsync('authToken');
    
    if (!token) {
      throw new Error('인증 토큰이 없습니다. 로그인이 필요합니다.');
    }
    
    const response = await fetch(`${API_ENDPOINTS.CHRONICLE.POSTS}/${postId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('✅ 크로니클 포스트 삭제 완료:', postId);
  } catch (error) {
    // error 객체를 안전하게 처리
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ 크로니클 포스트 삭제 실패:', errorMessage);
    throw error;
  }
};

/**
 * ActivityItem을 ChroniclePost로 변환
 */
export const activityToChroniclePost = (activity: any): Omit<ChroniclePost, 'id' | 'userId'> => {
  return {
    type: 'user_post',
    title: activity.title,
    description: activity.description,
    timestamp: new Date(activity.timestamp).toISOString(),
    rewards: {
      credo: activity.rewards.credo,
    },
    userContent: {
      text: activity.userContent?.text || '',
      image: activity.userContent?.image,
      isUserGenerated: true,
    },
  };
};

/**
 * ChroniclePost를 ActivityItem으로 변환
 */
export const chroniclePostToActivity = (post: ChroniclePost): any => {
  return {
    id: post.id,
    type: 'user_post',
    title: post.title,
    description: post.description,
    timestamp: post.timestamp,
    rewards: {
      credo: post.rewards?.credo || 0,
    },
    userContent: {
      text: post.user_content?.text || '',
      image: post.user_content?.image || null,
      isUserGenerated: post.user_content?.isUserGenerated || true,
    },
  };
};
