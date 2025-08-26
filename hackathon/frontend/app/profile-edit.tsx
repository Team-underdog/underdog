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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Input } from '../components/ui/Input';

const apiBaseUrl: string = (Constants.expoConfig?.extra as any)?.apiBaseUrl || 'http://192.168.219.108:8000';

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

export default function ProfileEditScreen() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 편집 가능한 필드들
  const [displayName, setDisplayName] = useState('');
  const [university, setUniversity] = useState('');
  const [department, setDepartment] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');

  const [hasChanges, setHasChanges] = useState(false);

  const loadUserProfile = useCallback(async () => {
    try {
      setError(null);
      const response = await fetchWithAuth(`${apiBaseUrl}/api/auth/me`);
      
      if (!response.ok) {
        if (response.status === 401) {
          await SecureStore.deleteItemAsync('authToken');
          router.replace('/login');
          return;
        }
        throw new Error(`서버 오류: ${response.status}`);
      }

      const userData = await response.json();
      setUser(userData);

      // 편집 필드 초기화
      setDisplayName(userData.display_name || '');
      setUniversity(userData.current_university || '');
      setDepartment(userData.current_department || '');
      setGradeLevel(userData.grade_level ? String(userData.grade_level) : '');

    } catch (err: any) {
      console.error('프로필 로드 실패:', err);
      setError(err.message || '프로필을 불러오는데 실패했습니다');
    }
  }, [apiBaseUrl]);

  const saveProfile = useCallback(async () => {
    if (!hasChanges) {
      router.back();
      return;
    }

    setSaving(true);
    try {
      const updateData: any = {};
      
      if (displayName !== (user?.display_name || '')) {
        updateData.display_name = displayName || null;
      }
      if (university !== (user?.current_university || '')) {
        updateData.university = university || null;
      }
      if (department !== (user?.current_department || '')) {
        updateData.department = department || null;
      }
      if (gradeLevel !== String(user?.grade_level || '')) {
        updateData.grade_level = gradeLevel ? parseInt(gradeLevel) : null;
      }

      const response = await fetchWithAuth(`${apiBaseUrl}/api/auth/profile`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `서버 오류: ${response.status}`);
      }

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('성공', '프로필이 성공적으로 업데이트되었습니다.', [
        { text: '확인', onPress: () => router.back() }
      ]);

    } catch (err: any) {
      console.error('프로필 저장 실패:', err);
      Alert.alert('오류', err.message || '프로필 업데이트에 실패했습니다.');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSaving(false);
    }
  }, [apiBaseUrl, hasChanges, displayName, university, department, gradeLevel, user]);

  const onChangePassword = useCallback(() => {
    router.push('/change-password');
  }, []);

  const onDeleteAccount = useCallback(() => {
    Alert.alert(
      '계정 삭제',
      '정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            router.push('/delete-account');
          }
        }
      ]
    );
  }, []);

  useEffect(() => {
    loadUserProfile().finally(() => setLoading(false));
  }, [loadUserProfile]);

  useEffect(() => {
    if (!user) return;
    
    const hasDisplayNameChange = displayName !== (user.display_name || '');
    const hasUniversityChange = university !== (user.current_university || '');
    const hasDepartmentChange = department !== (user.current_department || '');
    const hasGradeLevelChange = gradeLevel !== String(user.grade_level || '');
    
    setHasChanges(
      hasDisplayNameChange || 
      hasUniversityChange || 
      hasDepartmentChange || 
      hasGradeLevelChange
    );
  }, [displayName, university, department, gradeLevel, user]);

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
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => {
              setLoading(true);
              setError(null);
              loadUserProfile().finally(() => setLoading(false));
            }}
          >
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={20} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>프로필 편집</Text>
        <TouchableOpacity 
          onPress={saveProfile} 
          style={[styles.saveButton, !hasChanges && styles.saveButtonDisabled]}
          disabled={saving || !hasChanges}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#3b82f6" />
          ) : (
            <Text style={[styles.saveButtonText, !hasChanges && styles.saveButtonTextDisabled]}>
              저장
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={styles.content} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView}>
          {/* 기본 정보 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>기본 정보</Text>
            
            <View style={styles.readOnlyField}>
              <Text style={styles.readOnlyLabel}>이메일</Text>
              <Text style={styles.readOnlyValue}>{user?.email}</Text>
              <Feather name="lock" size={16} color="#9ca3af" />
            </View>

            <Input
              label="표시 이름"
              placeholder="표시될 이름을 입력하세요"
              value={displayName}
              onChangeText={setDisplayName}
              leftIcon={<Feather name="user" size={18} color="#6b7280" />}
              editable={!saving}
            />
          </View>

          {/* 학교 정보 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>학교 정보</Text>
            
            <Input
              label="대학교"
              placeholder="대학교명을 입력하세요"
              value={university}
              onChangeText={setUniversity}
              leftIcon={<Feather name="map-pin" size={18} color="#6b7280" />}
              editable={!saving}
            />

            <Input
              label="학과/전공"
              placeholder="학과 또는 전공을 입력하세요"
              value={department}
              onChangeText={setDepartment}
              leftIcon={<Feather name="book-open" size={18} color="#6b7280" />}
              editable={!saving}
            />

            <Input
              label="학년"
              placeholder="학년을 입력하세요 (1-6)"
              value={gradeLevel}
              onChangeText={(text) => {
                // 숫자만 입력 가능하도록 필터링
                const numericText = text.replace(/[^0-9]/g, '');
                if (numericText === '' || (parseInt(numericText) >= 1 && parseInt(numericText) <= 6)) {
                  setGradeLevel(numericText);
                }
              }}
              keyboardType="numeric"
              leftIcon={<Feather name="award" size={18} color="#6b7280" />}
              editable={!saving}
            />
          </View>

          {/* 계정 관리 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>계정 관리</Text>
            
            <TouchableOpacity style={styles.actionButton} onPress={onChangePassword}>
              <Feather name="key" size={20} color="#3b82f6" />
              <Text style={styles.actionButtonText}>비밀번호 변경</Text>
              <Feather name="chevron-right" size={16} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.dangerButton} onPress={onDeleteAccount}>
              <Feather name="trash-2" size={20} color="#ef4444" />
              <Text style={styles.dangerButtonText}>계정 삭제</Text>
              <Feather name="chevron-right" size={16} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  saveButtonTextDisabled: {
    color: '#9ca3af',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
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
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  readOnlyField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  readOnlyLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 8,
    minWidth: 60,
  },
  readOnlyValue: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 12,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  dangerButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#ef4444',
    marginLeft: 12,
  },
});
