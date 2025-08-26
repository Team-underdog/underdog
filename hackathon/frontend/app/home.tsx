import { useCallback, useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

const apiBaseUrl: string = (Constants.expoConfig?.extra as any)?.apiBaseUrl || 'http://192.168.219.108:8000';

// 디버깅을 위한 로그 추가
console.log('🔗 API Base URL:', apiBaseUrl);

interface UserProfile {
  id: number;
  email: string;
  display_name?: string;
  current_university?: string;
  current_department?: string;
  grade_level?: number;
  profile_image?: string;
  is_verified: boolean;
  created_at: string;
  last_login_at?: string;
}

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = await SecureStore.getItemAsync('authToken');
  
  if (!token) {
    throw new Error('로그인이 필요합니다');
  }

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
}

export default function HomeScreen() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUserProfile = useCallback(async () => {
    try {
      console.log('👤 사용자 프로필 로딩 시작');
      console.log('🔗 API URL:', `${apiBaseUrl}/api/auth/me`);
      setError(null);
      
      const token = await SecureStore.getItemAsync('authToken');
      console.log('🔑 토큰 존재 여부:', !!token);
      
      if (!token) {
        console.log('❌ 토큰이 없음, 로그인 화면으로 이동');
        router.replace('/login');
        return;
      }
      
      const response = await fetchWithAuth(`${apiBaseUrl}/api/auth/me`);
      
      console.log('📡 API 응답 상태:', response.status);
      console.log('📡 API 응답 헤더:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ API 응답 에러:', errorText);
        
        if (response.status === 401) {
          console.log('🔐 토큰 만료, 로그인 화면으로 이동');
          await SecureStore.deleteItemAsync('authToken');
          router.replace('/login');
          return;
        }
        throw new Error(`서버 오류 (${response.status}): ${errorText}`);
      }

      const userData = await response.json();
      console.log('✅ 사용자 데이터 수신:', userData);
      setUser(userData);

    } catch (err: any) {
      console.error('❌ 프로필 로드 실패:', err);
      console.error('❌ 에러 스택:', err.stack);
      
      if (err.name === 'AbortError') {
        setError('네트워크 연결이 중단되었습니다. 다시 시도해주세요.');
      } else if (err.message.includes('fetch')) {
        setError('서버에 연결할 수 없습니다. 네트워크를 확인해주세요.');
      } else {
        setError(err.message || '프로필을 불러오는데 실패했습니다');
      }
    }
  }, [apiBaseUrl]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadUserProfile();
    setRefreshing(false);
  }, [loadUserProfile]);

  const onLogout = useCallback(async () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            await SecureStore.deleteItemAsync('authToken');
            await SecureStore.deleteItemAsync('user');
            router.replace('/login');
          }
        }
      ]
    );
  }, []);

  const onEditProfile = useCallback(() => {
    router.push('/profile-edit');
  }, []);

  useEffect(() => {
    console.log('🏠 새 홈화면 useEffect 시작');
    const loadData = async () => {
      setLoading(true);
      await loadUserProfile();
      setLoading(false);
    };
    loadData();
  }, [loadUserProfile]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0b0c1a" />
          <Text style={styles.loadingText}>프로필을 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color="#d93025" />
          <Text style={styles.errorTitle}>오류가 발생했습니다</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => {
            setLoading(true);
            setError(null);
            loadUserProfile().finally(() => setLoading(false));
          }}>
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏫 CAMPUS CHRONICLE</Text>
        <TouchableOpacity onPress={onLogout} style={styles.logoutButton}>
          <Feather name="log-out" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 프로필 카드 */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarPlaceholder}>
                <Feather name="user" size={32} color="#6b7280" />
              </View>
              {user?.is_verified && (
                <View style={styles.verifiedBadge}>
                  <Feather name="check" size={12} color="#fff" />
                </View>
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.displayName}>
                {user?.display_name || '사용자'}
              </Text>
              <Text style={styles.email}>{user?.email}</Text>
              {user?.current_university && (
                <View style={styles.universityInfo}>
                  <Feather name="book-open" size={14} color="#6b7280" />
                  <Text style={styles.universityText}>
                    {user.current_university}
                    {user.current_department && ` • ${user.current_department}`}
                    {user.grade_level && ` • ${user.grade_level}학년`}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={onEditProfile} style={styles.editButton}>
              <Feather name="edit-2" size={16} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 퀵 액션 */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>바로가기</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <Feather name="search" size={24} color="#3b82f6" />
              <Text style={styles.actionLabel}>강좌 검색</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Feather name="grid" size={24} color="#8b5cf6" />
              <Text style={styles.actionLabel}>시간표</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Feather name="map-pin" size={24} color="#f59e0b" />
              <Text style={styles.actionLabel}>대학교</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Feather name="settings" size={24} color="#6b7280" />
              <Text style={styles.actionLabel}>설정</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 최근 활동 */}
        <View style={styles.recentActivity}>
          <Text style={styles.sectionTitle}>최근 활동</Text>
          <View style={styles.activityCard}>
            <View style={styles.activityItem}>
              <Feather name="plus-circle" size={16} color="#10b981" />
              <Text style={styles.activityText}>
                새로운 강좌를 관심 목록에 추가했습니다.
              </Text>
              <Text style={styles.activityTime}>2시간 전</Text>
            </View>
            <View style={styles.activityItem}>
              <Feather name="edit" size={16} color="#3b82f6" />
              <Text style={styles.activityText}>
                프로필 정보를 업데이트했습니다.
              </Text>
              <Text style={styles.activityTime}>1일 전</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  logoutButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#0b0c1a',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  displayName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  universityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  universityText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  editButton: {
    padding: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  actionsContainer: {
    marginBottom: 20,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actionLabel: {
    fontSize: 12,
    color: '#1f2937',
    marginTop: 8,
    fontWeight: '500',
  },
  recentActivity: {
    marginBottom: 40,
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  activityText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
    marginRight: 8,
  },
  activityTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
