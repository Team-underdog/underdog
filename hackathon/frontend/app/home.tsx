import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { CampusCredoBottomNav } from '../components/CampusCredoBottomNav';
import CharacterGrowth from '../components/CharacterGrowth';
import { CharacterSelection } from '../components/CharacterSelection';
import { getCurrentUser, signOutUser } from '../services/authService';
import { financialService, type FinancialSummary } from '../services/financialService';
import xpService, { type XPData } from '../services/xpService';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

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

export default function CampusCredoHome() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [financialData, setFinancialData] = useState<FinancialSummary | null>(null);
  const [credoScore, setCredoScore] = useState(850);
  const [xpData, setXpData] = useState<XPData>({
    currentXP: 0,
    currentLevel: 1,
    nextLevelXP: 100,
    totalXP: 0,
    credoScore: 0
  });
  const [showCharacterSelection, setShowCharacterSelection] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  useEffect(() => {
    if (userData?.id) {
      loadXPData();
    }
  }, [userData]);

  const loadUserProfile = async () => {
    try {
      console.log('👤 사용자 프로필 로딩 시작');
      
      const token = await SecureStore.getItemAsync('authToken');
      console.log('🔑 토큰 존재 여부:', !!token);
      
      if (!token) {
        router.replace('/login');
        return;
      }

      const apiBaseUrl = 'http://localhost:8000';
      console.log('🔗 API URL:', `${apiBaseUrl}/api/auth/me`);

      const response = await fetch(`${apiBaseUrl}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 API 응답 상태:', response.status);
      console.log('📡 API 응답 헤더:', response.headers);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ 사용자 데이터 수신:', data);
        setUserData(data);
        
        // 금융 데이터 로딩
        await loadFinancialData(token);
      } else {
        console.log('❌ API 응답 실패:', response.status);
        if (response.status === 401) {
          await SecureStore.deleteItemAsync('authToken');
          router.replace('/login');
        }
      }
    } catch (error) {
      console.log('❌ 프로필 로딩 에러:', error);
      Alert.alert('오류', '사용자 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFinancialData = async (userKey: string) => {
    try {
      console.log('💰 금융 데이터 로딩 시작');
      const summary = await financialService.getUserFinancialSummary(userKey);
      setFinancialData(summary);
      
      // 금융 데이터를 기반으로 크레도 점수 계산
      const transactions = summary?.recent_transactions || [];
      const calculatedScore = financialService.calculateCredoScore(transactions);
      setCredoScore(calculatedScore);
      
      console.log('✅ 금융 데이터 로딩 완료:', summary);
      console.log('🎯 계산된 크레도 점수:', calculatedScore);
    } catch (error) {
      console.error('❌ 금융 데이터 로딩 실패:', error);
      // 에러 시 기본값 유지
    }
  };

  const loadXPData = async () => {
    try {
      console.log('🎮 XP 데이터 로딩 시작');
      if (userData?.id) {
        const xpData = await xpService.fetchXPData(userData.id.toString());
        setXpData(xpData);
        console.log('✅ XP 데이터 로딩 완료:', xpData);
      }
    } catch (error) {
      console.error('❌ XP 데이터 로딩 실패:', error);
      // 기본값 유지
    }
  };

  const handleCharacterSelect = (level: number) => {
    console.log('🎭 캐릭터 선택:', level);
    // 선택된 캐릭터 레벨 저장
  };

  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('userInfo');
      router.replace('/login');
    } catch (error) {
      Alert.alert('오류', '로그아웃 중 문제가 발생했습니다.');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>캠퍼스 크레도를 불러오는 중...</Text>
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
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>
                안녕하세요, {userData?.display_name || '캠퍼스 크로니클러'}님!
              </Text>
              <Text style={styles.subGreeting}>오늘도 성장하는 하루 되세요</Text>
            </View>
            <View style={styles.credoScore}>
              <Feather name="zap" size={16} color="white" />
              <Text style={styles.credoText}>{credoScore.toLocaleString()}</Text>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Feather name="log-out" size={20} color="#6B7280" />
            </TouchableOpacity>
          </Animated.View>

          {/* 상단 위젯들 - 좌우 분할 레이아웃 */}
          <View style={styles.topRowContainer}>
                      {/* 1. 캐릭터 상태 위젯 */}
            <Animated.View entering={FadeInDown.delay(200)} style={styles.characterContainer}>
              <CharacterGrowth userId={userData?.id?.toString() || '1'} />
            </Animated.View>

            
          </View>

          {/* 3. 학사 알림 서비스 위젯 */}
          <Animated.View entering={FadeInDown.delay(400)} style={styles.academicWidget}>
            <View style={styles.widgetHeader}>
              <View style={styles.titleContainer}>
                <Text style={styles.widgetTitle}>📚 학사 알림</Text>
                <Text style={styles.widgetSubtitle}>오늘의 일정</Text>
              </View>
              <TouchableOpacity style={styles.moreButton}>
                <Text style={styles.moreText}>더보기</Text>
                <Feather name="chevron-right" size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.academicContent}>
              <View style={styles.todaySchedule}>
                <Text style={styles.scheduleTitle}>오늘 수업</Text>
                <View style={styles.scheduleList}>
                  <View style={styles.scheduleItem}>
                    <View style={styles.scheduleTime}>
                      <Text style={styles.timeText}>09:00</Text>
                      <Text style={styles.durationText}>90분</Text>
                    </View>
                    <View style={styles.scheduleInfo}>
                      <Text style={styles.courseName}>웹 프로그래밍</Text>
                      <Text style={styles.courseLocation}>A동 301호</Text>
                    </View>
                    <View style={styles.scheduleStatus}>
                      <Feather name="check-circle" size={16} color="#10B981" />
                    </View>
                  </View>
                  <View style={styles.scheduleItem}>
                    <View style={styles.scheduleTime}>
                      <Text style={styles.timeText}>14:00</Text>
                      <Text style={styles.durationText}>90분</Text>
                    </View>
                    <View style={styles.scheduleInfo}>
                      <Text style={styles.courseName}>데이터베이스</Text>
                      <Text style={styles.courseLocation}>B동 205호</Text>
                    </View>
                    <View style={styles.scheduleStatus}>
                      <Feather name="clock" size={16} color="#F59E0B" />
                    </View>
                  </View>
                </View>
              </View>
              <View style={styles.assignmentReminder}>
                <Text style={styles.assignmentTitle}>제출 마감</Text>
                <View style={styles.assignmentList}>
                  <View style={styles.assignmentItem}>
                    <View style={styles.assignmentIcon}>
                      <Feather name="file-text" size={14} color="#EF4444" />
                    </View>
                    <Text style={styles.assignmentName}>웹프로젝트 기획서</Text>
                    <Text style={styles.assignmentDeadline}>D-2</Text>
                  </View>
                  <View style={styles.assignmentItem}>
                    <View style={styles.assignmentIcon}>
                      <Feather name="file-text" size={14} color="#F59E0B" />
                    </View>
                    <Text style={styles.assignmentName}>DB 설계 보고서</Text>
                    <Text style={styles.assignmentDeadline}>D-5</Text>
                  </View>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* 4. 금융정보 위젯 - 신한은행 앱 스타일 */}
          <Animated.View entering={FadeInDown.delay(500)} style={styles.financialWidget}>
            <View style={styles.widgetHeader}>
              <View style={styles.titleContainer}>
                <Text style={styles.widgetTitle}>💰 내 계좌</Text>
                <Text style={styles.widgetSubtitle}>입출금 저축예금</Text>
              </View>
              <TouchableOpacity style={styles.moreButton}>
                <Text style={styles.moreText}>전체보기</Text>
                <Feather name="chevron-right" size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.financialContent}>
              {/* 계좌 정보 카드 */}
              <View style={styles.accountCard}>
                <View style={styles.accountHeader}>
                  <View style={styles.bankLogoContainer}>
                    <View style={styles.bankLogo}>
                      <Image 
                        source={require('../assets/images/shinhan.png')} 
                        style={styles.bankLogoImage}
                        resizeMode="contain"
                      />
                    </View>
                  </View>
                  <View style={styles.accountInfo}>
                    <Text style={styles.accountType}>입출금 저축예금</Text>
                    <View style={styles.accountNumberRow}>
                      <Text style={styles.accountNumber}>
                        {financialData?.accounts && financialData.accounts.length > 0 
                          ? `${financialData.accounts[0].bank_name} ${financialData.accounts[0].account_number}`
                          : '신한 110-373-218081'
                        }
                      </Text>
                      <TouchableOpacity style={styles.copyButton}>
                        <Feather name="copy" size={14} color="#6B7280" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.menuButton}>
                    <Feather name="more-vertical" size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>
                
                {/* 잔액 및 액션 버튼 */}
                <View style={styles.balanceSection}>
                  <View style={styles.balanceRow}>
                    <Text style={styles.balanceAmount}>
                      {financialData?.total_balance ? 
                        `${financialData.total_balance.toLocaleString()}원` : 
                        '로딩 중...'
                      }
                    </Text>
                    <TouchableOpacity style={styles.refreshButton}>
                      <Feather name="refresh-cw" size={20} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.transferButton}>
                      <Text style={styles.transferButtonText}>이체</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.salaryClubButton}>
                      <Text style={styles.salaryClubButtonText}>급여클럽+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* 최근 거래/연락처 목록 */}
              <View style={styles.recentContacts}>
                <Text style={styles.contactsTitle}>최근 거래</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.contactsList}
                >
                  {financialData?.recent_transactions && financialData.recent_transactions.length > 0 ? (
                    financialData.recent_transactions.slice(0, 4).map((transaction, index) => (
                      <View key={index} style={styles.contactCard}>
                        <View style={[styles.contactIcon, { 
                          backgroundColor: index % 2 === 0 ? '#3B82F6' : '#8B5CF6' 
                        }]}>
                          <Text style={styles.contactIconText}>
                            {transaction.transaction_type === 'income' ? '💰' : '💸'}
                          </Text>
                        </View>
                        <Text style={styles.contactName}>
                          {transaction.description || `거래${index + 1}`}
                        </Text>
                        <Text style={[
                          styles.contactAmount,
                          { color: transaction.transaction_type === 'income' ? '#10B981' : '#EF4444' }
                        ]}>
                          {transaction.transaction_type === 'income' ? '+' : '-'}
                          {transaction.amount?.toLocaleString() || '0'}
                        </Text>
                      </View>
                    ))
                  ) : (
                    // 거래내역이 없을 때 기본 표시
                    <>
                      <View style={styles.contactCard}>
                        <View style={[styles.contactIcon, { backgroundColor: '#3B82F6' }]}>
                          <Text style={styles.contactIconText}>🏦</Text>
                        </View>
                        <Text style={styles.contactName}>거래내역 없음</Text>
                        <Text style={styles.contactAmount}>-</Text>
                      </View>
                      <View style={styles.contactCard}>
                        <View style={[styles.contactIcon, { backgroundColor: '#8B5CF6' }]}>
                          <Text style={styles.contactIconText}>📱</Text>
                        </View>
                        <Text style={styles.contactName}>첫 거래를</Text>
                        <Text style={styles.contactAmount}>시작하세요</Text>
                      </View>
                    </>
                  )}
                </ScrollView>
                
                {/* 페이지 인디케이터 */}
                <View style={styles.pageIndicator}>
                  <View style={[styles.pageDot, styles.pageDotActive]} />
                  <View style={styles.pageDot} />
                </View>
              </View>
            </View>
          </Animated.View>

          {/* 하단 여백 */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>

      {/* 캐릭터 선택 모달 */}
      <CharacterSelection
        visible={showCharacterSelection}
        onClose={() => setShowCharacterSelection(false)}
        onCharacterSelect={handleCharacterSelect}
        currentLevel={xpData.currentLevel}
      />

      {/* 하단 네비게이션 */}
      <CampusCredoBottomNav />
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subGreeting: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  credoScore: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  credoText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  logoutButton: {
    padding: 8,
  },
  // 위젯 공통 스타일 - 신한 SOL 앱 스타일
  characterWidget: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 350,
    padding: 16,
  },
  credoWidget: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 80,
    padding: 12,
    marginBottom: 8,
    flex: 0.7,
    marginHorizontal: 16,
  },
  academicWidget: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    padding: 20,
  },
  financialWidget: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    padding: 20,
  },
  widgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  titleContainer: {
    flex: 1,
  },
  widgetTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  widgetSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '400',
  },
  settingsButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  benefitsButton: {
    backgroundColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  benefitsButtonText: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '500',
  },
  credoContent: {
    gap: 16,
  },
  credoScoreDisplay: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
  },
  credoScoreLabel: {
    fontSize: 12,
    color: '#92400E',
    marginBottom: 4,
  },
  credoScoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#92400E',
  },
  credoScoreUnit: {
    fontSize: 12,
    color: '#92400E',
    marginTop: 2,
  },
  credoInfo: {
    gap: 12,
  },
  credoInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  credoInfoText: {
    fontSize: 14,
    color: '#374151',
  },
  academicContent: {
    gap: 20,
  },
  todaySchedule: {
    gap: 12,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  scheduleList: {
    gap: 12,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    gap: 12,
  },
  scheduleTime: {
    alignItems: 'center',
    minWidth: 60,
  },
  timeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  durationText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  scheduleInfo: {
    flex: 1,
  },
  courseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  courseLocation: {
    fontSize: 14,
    color: '#6B7280',
  },
  scheduleStatus: {
    padding: 8,
  },
  assignmentReminder: {
    gap: 12,
  },
  assignmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  assignmentList: {
    gap: 8,
  },
  assignmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    gap: 8,
  },
  assignmentName: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  assignmentDeadline: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  financialContent: {
    gap: 20,
  },
  balanceCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#0369A1',
    marginBottom: 8,
  },

  balanceChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  balanceChangeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  recentTransactions: {
    gap: 12,
  },
  transactionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  transactionList: {
    gap: 8,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    gap: 12,
  },
  transactionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  transactionTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  characterContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 400,
    padding: 20,
    marginTop: 16,
  },
  skillSection: {
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
  questSection: {
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
  aiSection: {
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
  apiSection: {
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  activityTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  activityReward: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activityCredo: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
    marginLeft: 4,
  },
  skillList: {
    gap: 8,
  },
  financialSection: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    },

  bottomSpacing: {
    height: 100,
  },
  topRowContainer: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  rightColumnContainer: {
    flex: 1,
    gap: 8,
    marginLeft: 8,
  },
  credoRowContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    gap: 16,
  },
  creditGradeWidget: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    padding: 12,
    flex: 1,
    marginRight: 4,
    minHeight: 100,
    marginHorizontal: 16,
  },
  creditGradeContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  creditGradeValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0369A1',
  },
  creditGradeScore: {
    fontSize: 12,
    color: '#0369A1',
  },
  gpaWidget: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    padding: 12,
    flex: 1,
    marginLeft: 4,
    minHeight: 100,
    marginHorizontal: 16,
  },
  gpaContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  gpaValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#92400E',
  },
  gpaUnit: {
    fontSize: 12,
    color: '#92400E',
  },
  benefitsWidget: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    padding: 12,
    minHeight: 120,
    marginHorizontal: 16,
    marginTop: 16,
  },
  benefitsContent: {
    gap: 12,
  },
  infoRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },

  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F9FAFB',
  },
  moreText: {
    fontSize: 13,
    color: '#6B7280',
    marginRight: 4,
    fontWeight: '500',
  },
  scoreIconContainer: {
    backgroundColor: '#FFD700',
    borderRadius: 12,
    padding: 8,
    marginBottom: 8,
  },
  infoIconContainer: {
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    padding: 8,
    marginBottom: 8,
  },
  infoItemIcon: {
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    padding: 8,
  },
  assignmentIcon: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 6,
    marginRight: 8,
  },
  balanceIconContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    alignSelf: 'center',
  },
  accountCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  bankLogoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bankLogo: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bankLogoImage: {
    width: '100%',
    height: '100%',
  },
  accountInfo: {
    flex: 1,
    marginRight: 10,
  },
  accountType: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  accountNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginRight: 8,
  },
  copyButton: {
    padding: 4,
  },
  menuButton: {
    padding: 4,
  },
  balanceSection: {
    marginTop: 16,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0369A1',
  },
  refreshButton: {
    padding: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  transferButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  transferButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  salaryClubButton: {
    flex: 1,
    backgroundColor: '#F59E0B',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  salaryClubButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  recentContacts: {
    marginTop: 16,
  },
  contactsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  contactsList: {
    gap: 12,
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: 120,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactIconText: {
    fontSize: 20,
  },
  contactName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  contactAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  pageIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  pageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 4,
  },
  pageDotActive: {
    backgroundColor: '#3B82F6',
  },
});