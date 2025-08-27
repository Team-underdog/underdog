import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Modal,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CampusCredoBottomNav } from '../components/CampusCredoBottomNav';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  saveChroniclePost,
  getUserChronicles,
  deleteChroniclePost,
  activityToChroniclePost,
  chroniclePostToActivity,
} from '../services/chronicleService';
import { getCurrentUser } from '../services/authService';
import { financialService, type Transaction } from '../services/financialService';
import * as SecureStore from 'expo-secure-store';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

interface ActivityItem {
  id: number;
  type: 'attendance' | 'library' | 'payment' | 'quest' | 'study' | 'social' | 'user_post';
  title: string;
  description: string;
  timestamp: string;
  rewards: {
    credo: number;
    skillXp?: {
      skillName: string;
      amount: number;
    };
  };
  location?: string;
  amount?: number;
  // 사용자 업로드 전용 필드
  userContent?: {
    text: string;
    image?: string;
    isUserGenerated: boolean;
  };
}

interface FilterOption {
  id: string;
  label: string;
  icon: string;
}

interface TabOption {
  id: string;
  label: string;
  icon: string;
  count?: number;
}

export default function ChroniclePage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  // 로딩 상태 추가
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // 탭 관련 상태
  const [selectedTab, setSelectedTab] = useState<string>('all');
  
  // 업로드 모달 관련 상태
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploadText, setUploadText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [realTransactions, setRealTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  // 탭 옵션 (전체/내 포스트/활동 기록)
  const tabOptions: TabOption[] = [
    { 
      id: 'all', 
      label: '전체', 
      icon: 'list',
      count: activities.length
    },
    { 
      id: 'user_posts', 
      label: '내 포스트', 
      icon: 'camera',
      count: activities.filter(a => a.type === 'user_post').length
    },
    { 
      id: 'auto_records', 
      label: '활동 기록', 
      icon: 'activity',
      count: activities.filter(a => a.type !== 'user_post').length
    },
  ];

  const filterOptions: FilterOption[] = [
    { id: 'all', label: '전체', icon: 'list' },
    { id: 'attendance', label: '출석', icon: 'check-circle' },
    { id: 'study', label: '학업', icon: 'book-open' },
    { id: 'payment', label: '재무', icon: 'credit-card' },
    { id: 'social', label: '활동', icon: 'users' },
  ];

  // 고유 ID 생성을 위한 카운터
  const [idCounter, setIdCounter] = useState(1000); // Mock 데이터 ID와 겹치지 않도록 높은 값 시작
  
  // Mock 데이터
  const mockActivities: ActivityItem[] = [
    {
      id: 1001,
      type: 'attendance',
      title: '데이터베이스 수업 출석',
      description: '정보관 301호에서 김교수님의 데이터베이스 설계 수업에 출석했습니다.',
      timestamp: '2024-08-26T09:10:00',
      rewards: {
        credo: 10,
        skillXp: { skillName: '학업', amount: 20 }
      },
      location: '정보관 301호'
    },
    {
      id: 1002,
      type: 'library',
      title: '중앙도서관 이용',
      description: '중앙도서관에서 2시간 30분 동안 자습했습니다.',
      timestamp: '2024-08-26T14:30:00',
      rewards: {
        credo: 15,
        skillXp: { skillName: '자기계발', amount: 30 }
      },
      location: '중앙도서관 3층'
    },
    {
      id: 1003,
      type: 'payment',
      title: '학생식당 카드 결제',
      description: '건전한 소비 패턴으로 재무 관리 능력을 기르고 있습니다.',
      timestamp: '2024-08-26T12:15:00',
      rewards: {
        credo: 3,
        skillXp: { skillName: '재무관리', amount: 10 }
      },
      amount: 4500
    },
    {
      id: 1004,
      type: 'quest',
      title: '알고리즘 문제 해결 퀘스트 완료',
      description: '백준 온라인 저지에서 3개의 알고리즘 문제를 성공적으로 해결했습니다.',
      timestamp: '2024-08-25T20:45:00',
      rewards: {
        credo: 50,
        skillXp: { skillName: '학업', amount: 100 }
      }
    },
    {
      id: 5,
      type: 'social',
      title: '동아리 활동 참여',
      description: '프로그래밍 동아리 정기 모임에 참석하여 팀 프로젝트를 진행했습니다.',
      timestamp: '2024-08-25T18:00:00',
      rewards: {
        credo: 25,
        skillXp: { skillName: '대외활동', amount: 50 }
      },
      location: '학생회관 302호'
    },
    {
      id: 6,
      type: 'study',
      title: '온라인 강의 수강',
      description: 'React Native 개발 강의를 완주하여 새로운 기술을 학습했습니다.',
      timestamp: '2024-08-25T16:20:00',
      rewards: {
        credo: 20,
        skillXp: { skillName: '자기계발', amount: 40 }
      }
    }
  ];

  useEffect(() => {
    loadRealTransactions();
  }, []);

  useEffect(() => {
    // 실제 거래내역이 로딩된 후에 활동 목록 로드
    loadActivities();
  }, [realTransactions]);

  // 고유 ID 생성 함수
  const generateUniqueId = (): number => {
    const newId = idCounter;
    setIdCounter(prev => prev + 1);
    return newId;
  };

  // 안전한 고유 ID 생성 함수 (중복 방지)
  const generateSafeUniqueId = (): number => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const newId = timestamp + random;
    return newId;
  };

  // 로컬 저장소 키
  const STORAGE_KEY = 'chronicle_user_posts';

  // 백엔드 API에서 사용자 포스트 불러오기
  const loadUserPostsFromBackend = async (): Promise<ActivityItem[]> => {
    try {
      setIsLoadingPosts(true);
      setErrorMessage(null);
      
      const currentUser = getCurrentUser();
      if (!currentUser) {
        console.log('⚠️ 로그인된 사용자 없음, 백엔드 API 포스트 불러오기 건너뜀');
        return [];
      }

      const backendPosts = await getUserChronicles(currentUser.uid);
      const activityItems = backendPosts.map(chroniclePostToActivity);
      console.log('✅ 백엔드 API에서 사용자 포스트 불러옴:', activityItems.length, '개');
      return activityItems;
    } catch (error) {
      // error 객체를 안전하게 처리
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ 백엔드 API 포스트 불러오기 실패:', errorMessage);
      setErrorMessage('포스트를 불러오는 중 오류가 발생했습니다. 로컬 데이터를 사용합니다.');
      // 백엔드 API 실패 시 로컬 저장소에서 시도
      return await loadUserPostsFromLocal();
    } finally {
      setIsLoadingPosts(false);
    }
  };

  // 로컬 저장소에서 사용자 포스트 불러오기 (백업용)
  const loadUserPostsFromLocal = async (): Promise<ActivityItem[]> => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const userPosts = JSON.parse(stored);
        console.log('📱 로컬에서 사용자 포스트 불러옴:', userPosts.length, '개');
        return userPosts;
      }
      return [];
    } catch (error) {
      // error 객체를 안전하게 처리
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ 로컬 포스트 불러오기 실패:', errorMessage);
      return [];
    }
  };

  // 사용자 포스트 저장하기
  const saveUserPosts = async (userPosts: ActivityItem[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userPosts));
      console.log('💾 사용자 포스트 저장 완료:', userPosts.length, '개');
    } catch (error) {
      // error 객체를 안전하게 처리
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ 사용자 포스트 저장 실패:', errorMessage);
      Alert.alert('저장 실패', '포스트 저장 중 오류가 발생했습니다.');
    }
  };

  const loadRealTransactions = async () => {
    try {
      setIsLoadingTransactions(true);
      
      // 사용자 토큰 가져오기
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) {
        console.log('❌ 토큰이 없어서 거래내역 로딩 불가');
        return;
      }

      // 금융 데이터 가져오기
      console.log('💰 크로니클용 거래내역 로딩 시작');
      
      try {
        const summary = await financialService.getUserFinancialSummary(token);
        console.log('✅ 금융 요약 로딩 완료');
        
        // 최근 30일 거래내역 가져오기
        const transactions = await financialService.getRecentTransactions(30);
        
        if (transactions && Array.isArray(transactions)) {
          setRealTransactions(transactions);
          console.log('✅ 실제 거래내역 로딩 완료:', transactions.length, '건');
        } else {
          console.warn('⚠️ 거래내역이 배열이 아님, 빈 배열 설정');
          setRealTransactions([]);
        }
      } catch (error) {
        // error 객체를 안전하게 처리
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('❌ 금융 데이터 로딩 실패:', errorMessage);
        setRealTransactions([]);
      }
      
    } catch (error) {
      // error 객체를 안전하게 처리
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ 실제 거래내역 로딩 실패:', errorMessage);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  // 전체 활동 목록 로드 (Mock 데이터 + 백엔드 API/로컬 사용자 포스트 + 실제 거래내역)
  const loadActivities = async () => {
    try {
      // 백엔드 API에서 사용자 포스트 불러오기 (실패 시 로컬 백업)
      const userPosts = await loadUserPostsFromBackend();
      
      // 실제 거래내역을 활동 아이템으로 변환 (안전한 처리 + 고유 ID 할당)
      const transactionActivities = realTransactions && realTransactions.length > 0 
        ? realTransactions.map((transaction, index) => {
            try {
              const activity = financialService.transactionToChronicleActivity(transaction);
              // 고유 ID 할당 (거래내역 ID와 겹치지 않도록)
              activity.id = generateSafeUniqueId();
              return activity;
            } catch (error) {
              console.warn('⚠️ 거래내역 변환 실패, 건너뜀:', error);
              return null;
            }
          }).filter(Boolean) // null 값 제거
        : [];
      
      // Mock 데이터, 사용자 포스트, 실제 거래내역 합치기 (최신순 정렬)
      const allActivities = [...userPosts, ...transactionActivities, ...mockActivities]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setActivities(allActivities);
      console.log('🔄 전체 활동 로드 완료:', allActivities.length, '개');
    } catch (error) {
      // error 객체를 안전하게 처리
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ 활동 로드 실패:', errorMessage);
      // 실패 시 mock 데이터만 사용
      setActivities(mockActivities);
    }
  };

  // 이미지 선택 함수
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('권한 필요', '사진을 업로드하려면 갤러리 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // 카메라 촬영 함수
  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('권한 필요', '사진을 촬영하려면 카메라 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // 이미지 선택 옵션 표시
  const showImagePicker = () => {
    Alert.alert(
      '사진 선택',
      '어떤 방법으로 사진을 추가하시겠어요?',
      [
        { text: '취소', style: 'cancel' },
        { text: '갤러리에서 선택', onPress: pickImage },
        { text: '카메라로 촬영', onPress: takePhoto },
      ]
    );
  };

  // 포스트 업로드 함수
  const handlePostUpload = async () => {
    if (!uploadText.trim() && !selectedImage) {
      Alert.alert('내용 입력', '텍스트나 사진 중 하나는 반드시 입력해주세요.');
      return;
    }

    setUploading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // 새로운 사용자 포스트 생성
      const newPost: ActivityItem = {
        id: generateSafeUniqueId(),
        type: 'user_post',
        title: '나만의 크로니클',
        description: uploadText || '사진을 공유했습니다.',
        timestamp: new Date().toISOString(),
        rewards: {
          credo: 5, // 포스트 업로드 시 크레도 5점 지급
        },
        userContent: {
          text: uploadText,
          image: selectedImage || undefined,
          isUserGenerated: true,
        },
      };

      // 백엔드 API에 포스트 저장
      const currentUser = getCurrentUser();
      if (currentUser) {
        try {
          const backendPost = activityToChroniclePost(newPost);
          const savedPostId = await saveChroniclePost(currentUser.uid, backendPost);
          newPost.id = savedPostId; // 백엔드 API에서 생성된 ID 사용
          console.log('✅ 백엔드 API에 포스트 저장 완료:', savedPostId);
        } catch (backendError) {
          console.error('❌ 백엔드 API 저장 실패, 로컬 저장소 사용:', backendError);
          // 백엔드 API 실패 시 로컬 저장소에 백업
          const updatedActivities = [newPost, ...activities];
          const userPosts = updatedActivities.filter(activity => activity.type === 'user_post');
          await saveUserPosts(userPosts);
        }
      } else {
        console.log('⚠️ 로그인된 사용자 없음, 로컬 저장소에만 저장');
        const updatedActivities = [newPost, ...activities];
        const userPosts = updatedActivities.filter(activity => activity.type === 'user_post');
        await saveUserPosts(userPosts);
      }

      // 활동 목록에 추가 (최신순으로 정렬)
      const updatedActivities = [newPost, ...activities];
      setActivities(updatedActivities);

      // 모달 초기화
      setUploadModalVisible(false);
      setUploadText('');
      setSelectedImage(null);

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('업로드 완료!', '크로니클에 새로운 포스트가 추가되었습니다. (+5 Credo)');
    } catch (error) {
      Alert.alert('업로드 실패', '포스트 업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  // 탭별 필터링된 활동 목록
  const getFilteredActivities = () => {
    let filtered = activities;

    // 탭별 필터링
    switch (selectedTab) {
      case 'user_posts':
        filtered = activities.filter(activity => activity.type === 'user_post');
        break;
      case 'auto_records':
        filtered = activities.filter(activity => activity.type !== 'user_post');
        break;
      case 'all':
      default:
        filtered = activities;
        break;
    }

    // 활동 타입별 추가 필터링 (활동 기록 탭에서만)
    if (selectedTab === 'auto_records' && selectedFilter !== 'all') {
      filtered = filtered.filter(activity => activity.type === selectedFilter);
    }

    return filtered;
  };

  const filteredActivities = getFilteredActivities();

  // 오늘 획득한 크레도 계산 (중복 제거됨)

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'attendance': return 'check-circle';
      case 'library': return 'book';
      case 'payment': return 'credit-card';
      case 'quest': return 'target';
      case 'study': return 'book-open';
      case 'social': return 'users';
      case 'user_post': return 'camera';
      default: return 'activity';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'attendance': return '#10B981';
      case 'library': return '#8B5CF6';
      case 'payment': return '#F59E0B';
      case 'quest': return '#EF4444';
      case 'study': return '#3B82F6';
      case 'social': return '#EC4899';
      case 'user_post': return '#FF6B6B';
      default: return '#6B7280';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes}분 전`;
    } else if (diffInHours < 24) {
      return `${diffInHours}시간 전`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}일 전`;
    }
  };

  // 이전 필터링 로직은 위의 getFilteredActivities 함수로 이동됨

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setErrorMessage(null);
    try {
      // 실제 거래내역 새로고침
      await loadRealTransactions();
      // 저장된 데이터 다시 로드
      await loadActivities();
      console.log('🔄 새로고침 완료');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ 새로고침 실패:', errorMessage);
      setErrorMessage('새로고침 중 오류가 발생했습니다.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // 사용자 포스트 삭제
  const deleteUserPost = async (postId: string | number) => {
    Alert.alert(
      '포스트 삭제',
      '정말로 이 포스트를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
                      // 백엔드 API에서 삭제 (문자열 ID인 경우만)
        if (typeof postId === 'string') {
          try {
            await deleteChroniclePost(postId);
            console.log('✅ 백엔드 API에서 포스트 삭제 완료:', postId);
          } catch (backendError) {
            console.error('❌ 백엔드 API 삭제 실패:', backendError);
            // 백엔드 API 삭제 실패해도 로컬에서는 삭제 진행
                }
              }

              // 활동 목록에서 해당 포스트 제거
              const updatedActivities = activities.filter(activity => activity.id !== postId);
              setActivities(updatedActivities);

              // 로컬 저장소도 업데이트 (백업용)
              const userPosts = updatedActivities.filter(activity => activity.type === 'user_post');
              await saveUserPosts(userPosts);

              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              console.log('🗑️ 포스트 삭제 완료:', postId);
            } catch (error) {
              console.error('❌ 포스트 삭제 실패:', error);
              Alert.alert('삭제 실패', '포스트 삭제 중 오류가 발생했습니다.');
            }
          }
        }
      ]
    );
  };

  // 오늘 획득한 크레도 계산
  const getTotalCredoToday = () => {
    const today = new Date().toDateString();
    return activities
      .filter(activity => new Date(activity.timestamp).toDateString() === today)
      .reduce((total, activity) => total + activity.rewards.credo, 0);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
      {/* 헤더 */}
      <Animated.View entering={FadeInUp.delay(100)} style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>크로니클</Text>
          <Text style={styles.headerSubtitle}>오늘 획득한 Credo: {getTotalCredoToday()}</Text>
        </View>
        <View style={styles.headerStats}>
          <Feather name="award" size={20} color="#F59E0B" />
          {isLoadingTransactions && (
            <View style={styles.loadingIndicator}>
              <Feather name="refresh-cw" size={12} color="#10B981" />
              <Text style={styles.loadingText}>실시간 동기화 중</Text>
            </View>
          )}
        </View>
      </Animated.View>

      {/* 에러 메시지 표시 */}
      {errorMessage && (
        <Animated.View entering={FadeInUp.delay(150)} style={styles.errorContainer}>
          <Feather name="alert-triangle" size={16} color="#EF4444" />
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity onPress={() => setErrorMessage(null)} style={styles.errorCloseButton}>
            <Feather name="x" size={16} color="#EF4444" />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* 메인 탭 (전체/내 포스트/활동 기록) */}
      <Animated.View entering={FadeInUp.delay(200)} style={styles.mainTabs}>
        {tabOptions.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.mainTab,
              selectedTab === tab.id && styles.mainTabActive
            ]}
            onPress={() => {
              setSelectedTab(tab.id);
              setSelectedFilter('all'); // 탭 변경 시 필터 초기화
            }}
          >
            <View style={styles.mainTabContent}>
              <Feather 
                name={tab.icon as any} 
                size={18} 
                color={selectedTab === tab.id ? '#FF6B6B' : '#9CA3AF'} 
              />
              <Text style={[
                styles.mainTabText,
                selectedTab === tab.id && styles.mainTabTextActive
              ]}>
                {tab.label}
              </Text>
              {tab.count !== undefined && tab.count > 0 && (
                <View style={[
                  styles.tabBadge,
                  selectedTab === tab.id && styles.tabBadgeActive
                ]}>
                  <Text style={[
                    styles.tabBadgeText,
                    selectedTab === tab.id && styles.tabBadgeTextActive
                  ]}>
                    {tab.count}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </Animated.View>

      {/* 서브 필터 탭 (활동 기록 탭에서만 표시) */}
      {selectedTab === 'auto_records' && (
        <Animated.View entering={FadeInDown.delay(200)} style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContainer}
        >
          {filterOptions.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterTab,
                selectedFilter === filter.id && styles.filterTabActive
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <Feather 
                name={filter.icon as any} 
                size={16} 
                color={selectedFilter === filter.id ? 'white' : '#6B7280'} 
              />
              <Text style={[
                styles.filterTabText,
                selectedFilter === filter.id && styles.filterTabTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        </Animated.View>
      )}

      {/* 빈 상태 메시지 */}
      {filteredActivities.length === 0 && (
        <Animated.View entering={FadeInDown.delay(300)} style={styles.emptyState}>
          <Feather 
            name={selectedTab === 'user_posts' ? 'camera' : 'activity'} 
            size={48} 
            color="#D1D5DB" 
          />
          <Text style={styles.emptyStateTitle}>
            {selectedTab === 'user_posts' 
              ? '아직 업로드한 포스트가 없어요' 
              : selectedTab === 'auto_records'
              ? '활동 기록이 없어요'
              : '기록이 없어요'
            }
          </Text>
          <Text style={styles.emptyStateSubtitle}>
            {selectedTab === 'user_posts' 
              ? '우하단 + 버튼을 눌러 첫 포스트를 작성해보세요!' 
              : '새로운 활동을 시작해보세요!'
            }
          </Text>
        </Animated.View>
      )}

      {/* 활동 피드 */}
      <ScrollView 
        style={styles.feedContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#3B82F6"
          />
        }
      >
        {/* 로딩 상태 표시 */}
        {isLoadingPosts && (
          <View style={styles.loadingContainer}>
            <Feather name="loader" size={20} color="#3B82F6" />
            <Text style={styles.loadingText}>포스트를 불러오는 중...</Text>
          </View>
        )}
        <View style={styles.feedList}>
          {filteredActivities.map((activity, index) => (
            <Animated.View 
              key={`${activity.id}-${index}`}
              entering={FadeInDown.delay(300 + index * 100)}
              style={styles.activityCard}
            >
              {/* 활동 헤더 */}
              <View style={styles.activityHeader}>
                <View style={styles.activityIconContainer}>
                  <View style={[
                    styles.activityIconBg,
                    { backgroundColor: getActivityColor(activity.type) + '20' }
                  ]}>
                    <Feather 
                      name={getActivityIcon(activity.type) as any} 
                      size={18} 
                      color={getActivityColor(activity.type)} 
                    />
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    <Text style={styles.activityTime}>{formatTime(activity.timestamp)}</Text>
                  </View>
                </View>
                <View style={styles.activityActions}>
                  <View style={styles.credoReward}>
                    <Feather name="zap" size={14} color="#F59E0B" />
                    <Text style={styles.credoText}>+{activity.rewards.credo}</Text>
                  </View>
                  {/* 사용자 포스트인 경우 삭제 버튼 표시 */}
                  {activity.type === 'user_post' && (
                    <TouchableOpacity 
                      style={styles.deleteButton}
                      onPress={() => deleteUserPost(activity.id)}
                    >
                      <Feather name="trash-2" size={14} color="#EF4444" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* 활동 설명 */}
              <Text style={styles.activityDescription}>{activity.description}</Text>

              {/* 사용자 업로드 포스트 전용 콘텐츠 */}
              {activity.type === 'user_post' && activity.userContent && (
                <View style={styles.userPostContent}>
                  {activity.userContent.image && (
                    <View style={styles.postImageContainer}>
                      <Image 
                        source={{ uri: activity.userContent.image }} 
                        style={styles.postImage}
                        resizeMode="cover"
                      />
                    </View>
                  )}
                  {activity.userContent.text && (
                    <Text style={styles.postText}>{activity.userContent.text}</Text>
                  )}
                  {/* 사용자 생성 표시 */}
                  <View style={styles.userGeneratedTag}>
                    <Feather name="edit-3" size={10} color="#FF6B6B" />
                    <Text style={styles.userGeneratedText}>직접 작성</Text>
                  </View>
                </View>
              )}

              {/* 추가 정보 */}
              <View style={styles.activityMeta}>
                {activity.location && (
                  <View style={styles.metaItem}>
                    <Feather name="map-pin" size={12} color="#9CA3AF" />
                    <Text style={styles.metaText}>{activity.location}</Text>
                  </View>
                )}
                {activity.amount && (
                  <View style={styles.metaItem}>
                    <Feather name="dollar-sign" size={12} color="#9CA3AF" />
                    <Text style={styles.metaText}>{activity.amount.toLocaleString()}원</Text>
                  </View>
                )}
              </View>

              {/* 스킬 XP 보상 */}
              {activity.rewards.skillXp && (
                <View style={styles.skillReward}>
                  <Feather name="trending-up" size={12} color="#8B5CF6" />
                  <Text style={styles.skillRewardText}>
                    {activity.rewards.skillXp.skillName} +{activity.rewards.skillXp.amount} XP
                  </Text>
                </View>
              )}
            </Animated.View>
          ))}
        </View>

        {/* 하단 패딩 */}
        <View style={{ height: 100 }} />
      </ScrollView>
      </View>
      
      {/* 플로팅 업로드 버튼 (전체/내 포스트 탭에서만 표시) */}
      {(selectedTab === 'all' || selectedTab === 'user_posts') && (
        <TouchableOpacity 
          style={styles.floatingButton}
          onPress={() => setUploadModalVisible(true)}
          activeOpacity={0.8}
        >
          <Feather name="plus" size={24} color="white" />
        </TouchableOpacity>
      )}

      {/* 하단 네비게이션 */}
      <CampusCredoBottomNav />
      
      {/* 업로드 모달 */}
      <Modal
        visible={uploadModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setUploadModalVisible(false)}>
              <Feather name="x" size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>새 포스트 작성</Text>
            <TouchableOpacity 
              onPress={handlePostUpload}
              disabled={uploading}
              style={[
                styles.postButton,
                { opacity: uploading ? 0.6 : 1 }
              ]}
            >
              <Text style={styles.postButtonText}>
                {uploading ? '업로드 중...' : '게시'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {/* 이미지 미리보기 */}
            {selectedImage && (
              <View style={styles.imagePreview}>
                <Image source={{ uri: selectedImage }} style={styles.previewImage} />
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={() => setSelectedImage(null)}
                >
                  <Feather name="x" size={16} color="white" />
                </TouchableOpacity>
              </View>
            )}
            
            {/* 텍스트 입력 */}
            <TextInput
              style={styles.textInput}
              placeholder="오늘의 성장을 기록해보세요... 📝"
              multiline
              value={uploadText}
              onChangeText={setUploadText}
              maxLength={500}
              textAlignVertical="top"
            />
            
            <Text style={styles.charCount}>{uploadText.length}/500</Text>
            
            {/* 액션 버튼들 */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={showImagePicker}
              >
                <Feather name="camera" size={20} color="#6B7280" />
                <Text style={styles.actionButtonText}>사진 추가</Text>
              </TouchableOpacity>
            </View>
            
            {/* 도움말 */}
            <View style={styles.helpSection}>
              <Text style={styles.helpTitle}>💡 크로니클 작성 팁</Text>
              <Text style={styles.helpText}>• 오늘의 학습, 도전, 성장 경험을 공유하세요</Text>
              <Text style={styles.helpText}>• 사진과 함께 더 생생한 기록을 남겨보세요</Text>
              <Text style={styles.helpText}>• 포스트 작성 시 +5 Credo를 획득할 수 있어요!</Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  headerStats: {
    padding: 8,
  },
  // 에러 메시지 스타일
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    color: '#DC2626',
    fontSize: 14,
    marginLeft: 8,
  },
  errorCloseButton: {
    padding: 4,
  },
  // 로딩 상태 스타일
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginLeft: 8,
    color: '#6B7280',
    fontSize: 14,
  },
  filterContainer: {
    backgroundColor: 'white',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterScrollContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  filterTabActive: {
    backgroundColor: '#3B82F6',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: 6,
  },
  filterTabTextActive: {
    color: 'white',
  },
  feedContainer: {
    flex: 1,
  },
  feedList: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 16,
  },
  activityCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  activityIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  activityActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  credoReward: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  credoText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
    marginLeft: 4,
  },
  deleteButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: '#FEF2F2',
  },
  activityDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  activityMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  skillReward: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  skillRewardText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7C3AED',
    marginLeft: 4,
  },
  // 사용자 포스트 관련 스타일
  userPostContent: {
    marginTop: 8,
  },
  postImageContainer: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  postText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
    marginBottom: 8,
  },
  userGeneratedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  userGeneratedText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#FF6B6B',
    marginLeft: 4,
  },
  // 플로팅 버튼
  floatingButton: {
    position: 'absolute',
    bottom: 100, // 하단 네비게이션 위에 위치
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  // 업로드 모달 스타일
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
    fontWeight: '600',
    color: '#111827',
  },
  postButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  postButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  imagePreview: {
    position: 'relative',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 12,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  helpSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 4,
  },
  // 메인 탭 스타일
  mainTabs: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  mainTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  mainTabActive: {
    backgroundColor: '#FEF2F2',
  },
  mainTabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
    marginLeft: 6,
  },
  mainTabTextActive: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  tabBadge: {
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
    minWidth: 20,
  },
  tabBadgeActive: {
    backgroundColor: '#FF6B6B',
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  tabBadgeTextActive: {
    color: 'white',
  },
  // 빈 상태 스타일
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
  },
  loadingText: {
    fontSize: 10,
    color: '#10B981',
    marginLeft: 4,
    fontWeight: '500',
  },
});
