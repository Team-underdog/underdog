import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { CampusCredoBottomNav } from '../components/CampusCredoBottomNav';

// 페이지 컴포넌트 import
import CampusCredoHome from './home-campus-credo';
import ChroniclePage from './chronicle';
import QuestPage from './quest';
import SkillTreePage from './skill-tree';
import MyCampusCredoPage from './my-campus-credo';

export default function CampusCredoApp() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const params = useLocalSearchParams();

  useEffect(() => {
    checkAuthentication();
  }, []);

  useEffect(() => {
    // URL 파라미터로 페이지 변경
    if (params.page && typeof params.page === 'string') {
      setCurrentPage(params.page);
    }
  }, [params]);

  const checkAuthentication = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      
      if (!token) {
        router.replace('/login');
        return;
      }

      // 토큰 유효성 검사
      const apiBaseUrl = 'http://localhost:8000';
      const response = await fetch(`${apiBaseUrl}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        if (response.status === 401) {
          await AsyncStorage.removeItem('access_token');
          router.replace('/login');
        } else {
          Alert.alert('오류', '인증에 실패했습니다.');
          router.replace('/login');
        }
      }
    } catch (error) {
      console.log('❌ 인증 확인 에러:', error);
      Alert.alert('오류', '네트워크 연결을 확인해주세요.');
      router.replace('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <CampusCredoHome />;
      case 'chronicle':
        return <ChroniclePage />;
      case 'quest':
        return <QuestPage />;
      case 'skill':
        return <SkillTreePage />;
      case 'my':
        return <MyCampusCredoPage />;
      default:
        return <CampusCredoHome />;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return null; // 리다이렉트 중
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 메인 콘텐츠 */}
      <View style={styles.content}>
        {renderCurrentPage()}
      </View>
      
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
    backgroundColor: '#F8FAFC',
  },
});

