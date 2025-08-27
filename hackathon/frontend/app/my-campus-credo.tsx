import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Switch,
  Modal,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { CampusCredoBottomNav } from '../components/CampusCredoBottomNav';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { API_ENDPOINTS } from '../config/api';

interface UserData {
  id: number;
  email: string;
  display_name: string;
  current_university: string;
  current_department: string;
  grade_level: number;
  is_verified: boolean;
  created_at: string;
  last_login_at: string;
  profile_image?: string;
}

interface UserStats {
  totalCredo: number;
  level: number;
  topSkills: Array<{
    name: string;
    level: number;
    color: string;
  }>;
  achievements: Array<{
    id: string;
    title: string;
    icon: string;
    earnedAt: string;
  }>;
  weeklyActivity: {
    attendance: number;
    study: number;
    quests: number;
  };
}

export default function MyCampusCredoPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState({
    quest: true,
    achievement: true,
    daily: false,
  });
  const [showDataModal, setShowDataModal] = useState(false);
  const [selectedDataType, setSelectedDataType] = useState<'academic' | 'financial'>('academic');
  const [ssafyIntegrationStatus, setSsafyIntegrationStatus] = useState<'checking' | 'connected' | 'not_connected'>('checking');

  // Mock 사용자 통계 데이터
  const mockUserStats: UserStats = {
    totalCredo: 1247,
    level: 5,
    topSkills: [
      { name: '학업', level: 8, color: '#3B82F6' },
      { name: '자기계발', level: 7, color: '#8B5CF6' },
      { name: '재무관리', level: 5, color: '#10B981' },
    ],
    achievements: [
      { id: '1', title: '첫 퀘스트 완료', icon: 'target', earnedAt: '2024-08-20' },
      { id: '2', title: '연속 출석 7일', icon: 'calendar', earnedAt: '2024-08-25' },
      { id: '3', title: '레벨 5 달성', icon: 'award', earnedAt: '2024-08-26' },
    ],
    weeklyActivity: {
      attendance: 5,
      study: 12,
      quests: 3,
    }
  };

  const loadUserData = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) {
        router.replace('/login');
        return;
      }

      const response = await fetch(API_ENDPOINTS.AUTH.ME, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        setUserStats(mockUserStats);
        
        // SSAFY 연동 상태 확인 (userData 로드 후)
        await checkSSAFYIntegrationStatus(data.email);
      } else {
        if (response.status === 401) {
          await SecureStore.deleteItemAsync('authToken');
          router.replace('/login');
        }
      }
    } catch (error) {
      console.log('❌ 사용자 데이터 로딩 에러:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      '로그아웃',
      '정말로 로그아웃 하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '로그아웃', 
          style: 'destructive',
          onPress: async () => {
            try {
              await SecureStore.deleteItemAsync('authToken');
              await SecureStore.deleteItemAsync('userInfo');
              router.replace('/login');
            } catch (error) {
              Alert.alert('오류', '로그아웃 중 문제가 발생했습니다.');
            }
          }
        }
      ]
    );
  };

  const handleDataIntegration = (type: 'academic' | 'financial') => {
    setSelectedDataType(type);
    setShowDataModal(true);
  };

  const checkSSAFYIntegrationStatus = async (email: string) => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token || !email) return;

      // SSAFY 학생 이메일 검증으로 연동 상태 확인
      const verifyResponse = await fetch(API_ENDPOINTS.AUTH.VERIFY_SSAFY_EMAIL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        if (verifyData.is_valid_student) {
          // SSAFY 학생이면 연동됨으로 처리
          setSsafyIntegrationStatus('connected');
        } else {
          setSsafyIntegrationStatus('not_connected');
        }
      } else {
        setSsafyIntegrationStatus('not_connected');
      }
    } catch (error) {
      console.log('❌ SSAFY 연동 상태 확인 실패:', error);
      setSsafyIntegrationStatus('not_connected');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
  };

  const getAchievementIcon = (icon: string) => {
    return icon as any;
  };

  const DataIntegrationModal = () => (
    <Modal
      visible={showDataModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowDataModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowDataModal(false)}>
            <Feather name="x" size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>
            {selectedDataType === 'academic' ? '학사정보 연동' : '금융정보 연동'}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.integrationCard}>
            {selectedDataType === 'academic' ? (
              <>
                <View style={styles.integrationHeader}>
                  <Feather name="book-open" size={32} color="#3B82F6" />
                  <Text style={styles.integrationTitle}>학사정보 시스템 연동</Text>
                </View>
                <Text style={styles.integrationDescription}>
                  학교 학사정보 시스템과 연동하여 출석, 성적, 수강정보를 자동으로 동기화합니다.
                </Text>
                
                <View style={styles.benefitsList}>
                  <Text style={styles.benefitsTitle}>연동 혜택</Text>
                  <View style={styles.benefitItem}>
                    <Feather name="check" size={16} color="#10B981" />
                    <Text style={styles.benefitText}>자동 출석 체크 및 Credo 획득</Text>
                  </View>
                  <View style={styles.benefitItem}>
                    <Feather name="check" size={16} color="#10B981" />
                    <Text style={styles.benefitText}>성적 향상 시 보너스 보상</Text>
                  </View>
                  <View style={styles.benefitItem}>
                    <Feather name="check" size={16} color="#10B981" />
                    <Text style={styles.benefitText}>개인화된 학습 퀘스트 추천</Text>
                  </View>
                </View>

                <View style={styles.currentStatus}>
                  <Text style={styles.statusTitle}>현재 연동 상태</Text>
                  <View style={styles.statusItem}>
                    <Text style={styles.statusLabel}>대학교</Text>
                    <Text style={styles.statusValue}>{userData?.current_university}</Text>
                  </View>
                  <View style={styles.statusItem}>
                    <Text style={styles.statusLabel}>학과</Text>
                    <Text style={styles.statusValue}>{userData?.current_department}</Text>
                  </View>
                  <View style={styles.statusItem}>
                    <Text style={styles.statusLabel}>학년</Text>
                    <Text style={styles.statusValue}>{userData?.grade_level}학년</Text>
                  </View>
                  <View style={styles.statusItem}>
                    <Text style={styles.statusLabel}>연동 상태</Text>
                    <View style={[styles.statusBadge, { backgroundColor: '#10B981' }]}>
                      <Text style={styles.statusBadgeText}>연동됨</Text>
                    </View>
                  </View>
                </View>
              </>
            ) : (
              <>
                <View style={styles.integrationHeader}>
                  <Feather name="credit-card" size={32} color="#10B981" />
                  <Text style={styles.integrationTitle}>신한은행 연동</Text>
                </View>
                <Text style={styles.integrationDescription}>
                  신한은행과 연동하여 소비 패턴을 분석하고 재무 관리 능력을 향상시킵니다.
                </Text>
                
                <View style={styles.benefitsList}>
                  <Text style={styles.benefitsTitle}>연동 혜택</Text>
                  <View style={styles.benefitItem}>
                    <Feather name="check" size={16} color="#10B981" />
                    <Text style={styles.benefitText}>건전 소비 시 Credo 보상</Text>
                  </View>
                  <View style={styles.benefitItem}>
                    <Feather name="check" size={16} color="#10B981" />
                    <Text style={styles.benefitText}>예산 관리 퀘스트 자동 추천</Text>
                  </View>
                  <View style={styles.benefitItem}>
                    <Feather name="check" size={16} color="#10B981" />
                    <Text style={styles.benefitText}>재무 스킬 자동 레벨업</Text>
                  </View>
                </View>

                <View style={styles.currentStatus}>
                  <Text style={styles.statusTitle}>현재 연동 상태</Text>
                  <View style={styles.statusItem}>
                    <Text style={styles.statusLabel}>은행</Text>
                    <Text style={styles.statusValue}>신한은행</Text>
                  </View>
                  <View style={styles.statusItem}>
                    <Text style={styles.statusLabel}>SSAFY API 연동</Text>
                    <View style={[
                      styles.statusBadge, 
                      { 
                        backgroundColor: ssafyIntegrationStatus === 'connected' ? '#10B981' : 
                                        ssafyIntegrationStatus === 'checking' ? '#6B7280' : '#EF4444' 
                      }
                    ]}>
                      <Text style={styles.statusBadgeText}>
                        {ssafyIntegrationStatus === 'connected' ? '연동됨' : 
                         ssafyIntegrationStatus === 'checking' ? '확인 중' : '연동 필요'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.statusItem}>
                    <Text style={styles.statusLabel}>개인정보 동의</Text>
                    <View style={[
                      styles.statusBadge, 
                      { 
                        backgroundColor: ssafyIntegrationStatus === 'connected' ? '#10B981' : '#EF4444' 
                      }
                    ]}>
                      <Text style={styles.statusBadgeText}>
                        {ssafyIntegrationStatus === 'connected' ? '동의됨' : '미동의'}
                      </Text>
                    </View>
                  </View>
                </View>
              </>
            )}
          </View>
        </ScrollView>

        <View style={styles.modalActions}>
          <TouchableOpacity style={styles.connectButton}>
            <Text style={styles.connectButtonText}>
              {selectedDataType === 'academic' ? '재연동하기' : '연동하기'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );

  useEffect(() => {
    loadUserData();
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>프로필을 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
          <Text style={styles.headerTitle}>MY</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Feather name="log-out" size={20} color="#EF4444" />
          </TouchableOpacity>
        </Animated.View>

        {/* 프로필 카드 */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Feather name="user" size={32} color="#6B7280" />
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{userData?.display_name}</Text>
              <Text style={styles.userEmail}>{userData?.email}</Text>
              <Text style={styles.userUniversity}>
                {userData?.current_university} {userData?.current_department} {userData?.grade_level}학년
              </Text>
            </View>
          </View>
          
          <View style={styles.credoSummary}>
            <View style={styles.credoItem}>
              <Text style={styles.credoValue}>{userStats?.totalCredo.toLocaleString()}</Text>
              <Text style={styles.credoLabel}>총 Credo</Text>
            </View>
            <View style={styles.credoItem}>
              <Text style={styles.credoValue}>Lv. {userStats?.level}</Text>
              <Text style={styles.credoLabel}>현재 레벨</Text>
            </View>
          </View>
        </Animated.View>

        {/* 성장 요약 */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.growthCard}>
          <Text style={styles.cardTitle}>나의 성장 요약</Text>
          
          <View style={styles.topSkills}>
            <Text style={styles.sectionTitle}>최고 레벨 스킬</Text>
            {userStats?.topSkills.map((skill, index) => (
              <View key={index} style={styles.skillItem}>
                <View style={[styles.skillDot, { backgroundColor: skill.color }]} />
                <Text style={styles.skillName}>{skill.name}</Text>
                <Text style={styles.skillLevel}>Lv. {skill.level}</Text>
              </View>
            ))}
          </View>

          <View style={styles.achievements}>
            <Text style={styles.sectionTitle}>최근 달성</Text>
            <View style={styles.achievementList}>
              {userStats?.achievements.map((achievement) => (
                <View key={achievement.id} style={styles.achievementItem}>
                  <View style={styles.achievementIcon}>
                    <Feather name={getAchievementIcon(achievement.icon)} size={16} color="#F59E0B" />
                  </View>
                  <View style={styles.achievementInfo}>
                    <Text style={styles.achievementTitle}>{achievement.title}</Text>
                    <Text style={styles.achievementDate}>{formatDate(achievement.earnedAt)}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* 이번 주 활동 */}
        <Animated.View entering={FadeInDown.delay(400)} style={styles.activityCard}>
          <Text style={styles.cardTitle}>이번 주 활동</Text>
          
          <View style={styles.activityStats}>
            <View style={styles.activityItem}>
              <Feather name="check-circle" size={20} color="#10B981" />
              <Text style={styles.activityValue}>{userStats?.weeklyActivity.attendance}</Text>
              <Text style={styles.activityLabel}>출석</Text>
            </View>
            <View style={styles.activityItem}>
              <Feather name="book" size={20} color="#3B82F6" />
              <Text style={styles.activityValue}>{userStats?.weeklyActivity.study}</Text>
              <Text style={styles.activityLabel}>학습 시간</Text>
            </View>
            <View style={styles.activityItem}>
              <Feather name="target" size={20} color="#8B5CF6" />
              <Text style={styles.activityValue}>{userStats?.weeklyActivity.quests}</Text>
              <Text style={styles.activityLabel}>퀘스트 완료</Text>
            </View>
          </View>
        </Animated.View>

        {/* 설정 메뉴 */}
        <Animated.View entering={FadeInDown.delay(500)} style={styles.settingsCard}>
          <Text style={styles.cardTitle}>설정</Text>
          
          <View style={styles.settingsList}>
            {/* 계정 관리 */}
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Feather name="user" size={20} color="#6B7280" />
                <Text style={styles.settingText}>계정 관리</Text>
              </View>
              <Feather name="chevron-right" size={16} color="#9CA3AF" />
            </TouchableOpacity>

            {/* 데이터 연동 */}
            <View style={styles.settingGroup}>
              <Text style={styles.settingGroupTitle}>데이터 연동</Text>
              
              <TouchableOpacity 
                style={styles.settingItem}
                onPress={() => handleDataIntegration('academic')}
              >
                <View style={styles.settingLeft}>
                  <Feather name="book-open" size={20} color="#3B82F6" />
                  <Text style={styles.settingText}>학사정보 연동</Text>
                </View>
                <View style={styles.settingRight}>
                  <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
                  <Feather name="chevron-right" size={16} color="#9CA3AF" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.settingItem}
                onPress={() => handleDataIntegration('financial')}
              >
                <View style={styles.settingLeft}>
                  <Feather name="credit-card" size={20} color="#10B981" />
                  <Text style={styles.settingText}>신한은행 연동</Text>
                </View>
                <View style={styles.settingRight}>
                  <View style={[styles.statusDot, { backgroundColor: '#EF4444' }]} />
                  <Feather name="chevron-right" size={16} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
            </View>

            {/* 알림 설정 */}
            <View style={styles.settingGroup}>
              <Text style={styles.settingGroupTitle}>알림 설정</Text>
              
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Feather name="target" size={20} color="#8B5CF6" />
                  <Text style={styles.settingText}>퀘스트 추천</Text>
                </View>
                <Switch
                  value={notifications.quest}
                  onValueChange={(value) => setNotifications(prev => ({ ...prev, quest: value }))}
                  trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                  thumbColor="white"
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Feather name="award" size={20} color="#F59E0B" />
                  <Text style={styles.settingText}>달성 알림</Text>
                </View>
                <Switch
                  value={notifications.achievement}
                  onValueChange={(value) => setNotifications(prev => ({ ...prev, achievement: value }))}
                  trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                  thumbColor="white"
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Feather name="clock" size={20} color="#6B7280" />
                  <Text style={styles.settingText}>일일 리마인더</Text>
                </View>
                <Switch
                  value={notifications.daily}
                  onValueChange={(value) => setNotifications(prev => ({ ...prev, daily: value }))}
                  trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                  thumbColor="white"
                />
              </View>
            </View>

            {/* 지원 */}
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Feather name="help-circle" size={20} color="#6B7280" />
                <Text style={styles.settingText}>고객센터</Text>
              </View>
              <Feather name="chevron-right" size={16} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Feather name="info" size={20} color="#6B7280" />
                <Text style={styles.settingText}>앱 정보</Text>
              </View>
              <Feather name="chevron-right" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* 하단 패딩 */}
        <View style={{ height: 100 }} />
        </ScrollView>
      </View>

      {/* 하단 네비게이션 */}
      <CampusCredoBottomNav />
      
      <DataIntegrationModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  profileCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  userUniversity: {
    fontSize: 14,
    color: '#374151',
  },
  credoSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  credoItem: {
    alignItems: 'center',
  },
  credoValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  credoLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  growthCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  activityCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  settingsCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  topSkills: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  skillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  skillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  skillName: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  skillLevel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  achievements: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 20,
  },
  achievementList: {
    gap: 12,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 2,
  },
  achievementDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  activityStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  activityItem: {
    alignItems: 'center',
    gap: 8,
  },
  activityValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  activityLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  settingsList: {
    gap: 1,
  },
  settingGroup: {
    marginTop: 16,
  },
  settingGroupTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  integrationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  integrationHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  integrationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 12,
  },
  integrationDescription: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  benefitsList: {
    marginBottom: 24,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
  currentStatus: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  modalActions: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  connectButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  connectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
