import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { API_KEYS, validateAPIKey, getAllAPIKeyStatus } from '../config/apiKeys';

const TestDashboard: React.FC = () => {
  const [isTestingAPI, setIsTestingAPI] = useState(false);

  // 커리어넷 API 연결 테스트
  const testCareerNetAPI = async () => {
    if (!validateAPIKey('CAREERNET')) {
      Alert.alert('❌ API 키 없음', '커리어넷 API 키가 설정되지 않았습니다.');
      return;
    }

    setIsTestingAPI(true);
    try {
      const apiKey = API_KEYS.CAREERNET.API_KEY;
      const baseUrl = API_KEYS.CAREERNET.BASE_URL;
      
      console.log('🔗 커리어넷 API 연결 테스트 시작...');
      console.log('📍 API URL:', baseUrl);
      console.log('🔑 API 키:', apiKey.substring(0, 10) + '...');

      // 간단한 API 호출 테스트 (직업 정보 조회)
      // 여러 파라미터 조합 시도
      const testUrls = [
        `${baseUrl}?apikey=${apiKey}&q=5`,
        `${baseUrl}?apiKey=${apiKey}&q=5`,
        `${baseUrl}?key=${apiKey}&q=5`,
        `${baseUrl}?apikey=${apiKey}`,
        `${baseUrl}?apiKey=${apiKey}`
      ];

      let response;
      let successfulUrl = '';

      for (const testUrl of testUrls) {
        try {
          console.log(`🔄 테스트 URL 시도: ${testUrl}`);
          response = await fetch(testUrl);
          
          if (response.ok) {
            const contentType = response.headers.get('content-type');
            console.log(`📡 응답 타입: ${contentType}`);
            
            if (contentType && contentType.includes('application/json')) {
              successfulUrl = testUrl;
              break;
            } else {
              console.log(`⚠️ HTML 응답 - 다음 URL 시도`);
            }
          }
        } catch (error) {
          console.log(`❌ URL 실패: ${testUrl}`);
        }
      }

      if (!response) {
        throw new Error('모든 테스트 URL이 실패했습니다.');
      }
      
      console.log('📡 응답 상태:', response.status);
      
      if (response.ok) {
        // 응답 타입 확인
        const contentType = response.headers.get('content-type');
        console.log('📡 응답 타입:', contentType);
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const data = await response.json();
            console.log('✅ 커리어넷 API 연결 성공:', data);
            const message = successfulUrl 
              ? `커리어넷 API에 정상적으로 연결되었습니다!\n\n성공한 URL:\n${successfulUrl}`
              : '커리어넷 API에 정상적으로 연결되었습니다!';
            Alert.alert('✅ 연결 성공', message);
          } catch (parseError) {
            console.error('❌ JSON 파싱 오류:', parseError);
            await handleNonJsonResponse(response);
          }
        } else {
          // HTML이나 다른 타입의 응답 처리
          await handleNonJsonResponse(response);
        }
      } else {
        const errorText = await response.text();
        console.error('❌ 커리어넷 API 응답 오류:', response.status, errorText);
        
        // 404 오류인 경우 대안 엔드포인트 시도
        if (response.status === 404) {
          console.log('🔄 404 오류 발생 - 대안 엔드포인트 시도 중...');
          await tryAlternativeEndpoints(apiKey);
        } else {
          Alert.alert('❌ 연결 실패', `API 응답 오류: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('❌ 커리어넷 API 연결 테스트 실패:', error);
      Alert.alert('❌ 연결 실패', '네트워크 오류가 발생했습니다.');
    } finally {
      setIsTestingAPI(false);
    }
  };

  // HTML 응답 처리
  const handleNonJsonResponse = async (response: Response) => {
    try {
      const responseText = await response.text();
      console.log('📄 HTML 응답 내용:', responseText.substring(0, 200) + '...');
      
      // HTML 내용 분석
      if (responseText.includes('<title>')) {
        const titleMatch = responseText.match(/<title>(.*?)<\/title>/);
        const title = titleMatch ? titleMatch[1] : '알 수 없음';
        
        if (responseText.includes('login') || responseText.includes('로그인')) {
          Alert.alert('⚠️ 인증 필요', '커리어넷 API에 로그인이 필요합니다.');
        } else if (responseText.includes('error') || responseText.includes('오류')) {
          Alert.alert('❌ API 오류', `커리어넷 API에서 오류가 발생했습니다.\n제목: ${title}`);
        } else {
          Alert.alert('⚠️ 예상치 못한 응답', `HTML 응답을 받았습니다.\n제목: ${title}\n\nAPI 키나 엔드포인트를 확인해주세요.`);
        }
      } else {
        Alert.alert('⚠️ 예상치 못한 응답', 'JSON이 아닌 응답을 받았습니다. API 키나 엔드포인트를 확인해주세요.');
      }
    } catch (error) {
      console.error('❌ 응답 처리 오류:', error);
      Alert.alert('❌ 응답 처리 오류', '응답을 처리하는 중 오류가 발생했습니다.');
    }
  };

  // 대안 엔드포인트 시도
  const tryAlternativeEndpoints = async (apiKey: string) => {
    const alternativeUrls = [
      'http://inspct.career.go.kr/openapi/test/questions',
      'https://www.career.go.kr/cnet/front/openapi/jobs',
      'https://www.career.go.kr/cnet/front/openapi/qualifications',
      'https://www.career.go.kr/cnet/front/openapi/majors'
    ];

    for (const url of alternativeUrls) {
      try {
        console.log(`🔄 대안 엔드포인트 시도: ${url}`);
        
        // 새로운 엔드포인트와 기존 엔드포인트에 따라 다른 파라미터 사용
        let testUrl;
        if (url.includes('inspct.career.go.kr')) {
          testUrl = `${url}?apikey=${apiKey}&q=5`;
        } else {
          testUrl = `${url}?apiKey=${apiKey}&keyword=개발자&pageNo=1&pageSize=5`;
        }
        
        const response = await fetch(testUrl);
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ 대안 엔드포인트 성공:', url);
          Alert.alert('✅ 연결 성공', `대안 엔드포인트로 연결되었습니다!\n${url}`);
          return;
        }
      } catch (error) {
        console.log(`❌ 대안 엔드포인트 실패: ${url}`);
      }
    }
    
    Alert.alert('❌ 모든 엔드포인트 실패', '커리어넷 API 연결에 실패했습니다. API 키나 엔드포인트를 확인해주세요.');
  };

  // SSAFY API 연결 테스트
  const testSSAFYAPI = async () => {
    if (!validateAPIKey('SSAFY')) {
      Alert.alert('❌ API 키 없음', 'SSAFY API 키가 설정되지 않았습니다.');
      return;
    }

    setIsTestingAPI(true);
    try {
      const apiKey = API_KEYS.SSAFY.API_KEY;
      
      console.log('🔗 SSAFY API 연결 테스트 시작...');
      console.log('🔑 API 키:', apiKey.substring(0, 10) + '...');

      // SSAFY API는 현재 BASE_URL이 설정되지 않음
      if (!API_KEYS.SSAFY.BASE_URL) {
        Alert.alert('⚠️ 설정 필요', 'SSAFY API BASE_URL이 설정되지 않았습니다.');
        return;
      }

      // 실제 API 호출 테스트 (예시)
      const response = await fetch(`${API_KEYS.SSAFY.BASE_URL}/test?apiKey=${apiKey}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ SSAFY API 연결 성공:', data);
        Alert.alert('✅ 연결 성공', 'SSAFY API에 정상적으로 연결되었습니다!');
      } else {
        Alert.alert('❌ 연결 실패', `API 응답 오류: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ SSAFY API 연결 테스트 실패:', error);
      Alert.alert('❌ 연결 실패', '네트워크 오류가 발생했습니다.');
    } finally {
      setIsTestingAPI(false);
    }
  };

  // 전체 API 상태 확인
  const testAllAPIs = () => {
    const apiStatus = getAllAPIKeyStatus();
    
    let message = '📊 API 상태 요약:\n\n';
    Object.entries(apiStatus).forEach(([apiName, isValid]) => {
      const status = isValid ? '✅' : '❌';
      message += `${status} ${apiName}: ${isValid ? '설정됨' : '설정 안됨'}\n`;
    });

    Alert.alert('🔍 API 상태 확인', message);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* 헤더 */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Feather name="arrow-left" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>🧪 테스트 대시보드</Text>
            <View style={styles.headerSpacer} />
          </View>
          <Text style={styles.headerSubtitle}>언더독팀 기능들을 테스트해보세요</Text>
        </View>

        {/* 테스트 섹션들 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎮 게임화 시스템</Text>
          
          <TouchableOpacity 
            style={styles.testButton}
            onPress={() => router.push('/campus-credo')}
          >
            <Feather name="home" size={20} color="white" />
            <Text style={styles.buttonText}>캠퍼스 크레도 홈</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.testButton}
            onPress={() => router.push('/quest')}
          >
            <Feather name="target" size={20} color="white" />
            <Text style={styles.buttonText}>퀘스트 시스템</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.testButton}
            onPress={() => router.push('/skill-tree')}
          >
            <Feather name="trending-up" size={20} color="white" />
            <Text style={styles.buttonText}>스킬 트리</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.testButton}
            onPress={() => router.push('/chronicle')}
          >
            <Feather name="book-open" size={20} color="white" />
            <Text style={styles.buttonText}>크로니클</Text>
          </TouchableOpacity>
        </View>

        {/* AI 기능 테스트 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🤖 AI 기능 테스트</Text>
          
          <TouchableOpacity 
            style={[styles.testButton, styles.aiButton]}
            onPress={() => router.push('/gemini-test')}
          >
            <Feather name="cpu" size={20} color="white" />
            <Text style={styles.buttonText}>Gemini AI 테스트</Text>
            <Feather name="zap" size={16} color="white" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.testButton}
            onPress={() => router.push('/ai-feed-analyzer')}
          >
            <Feather name="bar-chart-2" size={20} color="white" />
            <Text style={styles.buttonText}>AI 피드 분석기</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.testButton}
            onPress={() => router.push('/new-ai-feed-analyzer')}
          >
            <Feather name="refresh-cw" size={20} color="white" />
            <Text style={styles.buttonText}>새로운 AI 분석기</Text>
          </TouchableOpacity>
        </View>

        {/* API 연결 확인 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔗 API 연결 확인</Text>
          
          <TouchableOpacity 
            style={[styles.testButton, styles.apiButton]}
            onPress={() => testCareerNetAPI()}
            disabled={isTestingAPI}
          >
            <Feather name="briefcase" size={20} color="white" />
            <Text style={styles.buttonText}>
              {isTestingAPI ? '테스트 중...' : '커리어넷 API 연결 테스트'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.testButton, styles.apiButton]}
            onPress={() => testSSAFYAPI()}
            disabled={isTestingAPI}
          >
            <Feather name="graduation-cap" size={20} color="white" />
            <Text style={styles.buttonText}>
              {isTestingAPI ? '테스트 중...' : 'SSAFY API 연결 테스트'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.testButton, styles.apiButton]}
            onPress={() => testAllAPIs()}
          >
            <Feather name="check-circle" size={20} color="white" />
            <Text style={styles.buttonText}>전체 API 상태 확인</Text>
          </TouchableOpacity>
        </View>

        {/* 기타 테스트 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔧 기타 테스트</Text>
          
          <TouchableOpacity 
            style={styles.testButton}
            onPress={() => router.push('/career-net-test')}
          >
            <Feather name="briefcase" size={20} color="white" />
            <Text style={styles.buttonText}>커리어넷 테스트</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.testButton}
            onPress={() => router.push('/psychology-test-api')}
          >
            <Feather name="brain" size={20} color="white" />
            <Text style={styles.buttonText}>심리 테스트 API</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.testButton}
            onPress={() => router.push('/firebase-test')}
          >
            <Feather name="database" size={20} color="white" />
            <Text style={styles.buttonText}>Firebase 테스트</Text>
          </TouchableOpacity>
        </View>

        {/* 개발 도구 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛠️ 개발 도구</Text>
          
          <TouchableOpacity 
            style={styles.testButton}
            onPress={() => router.push('/character-selection')}
          >
            <Feather name="user" size={20} color="white" />
            <Text style={styles.buttonText}>캐릭터 선택</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.testButton}
            onPress={() => router.push('/character-room')}
          >
            <Feather name="home" size={20} color="white" />
            <Text style={styles.buttonText}>캐릭터 룸</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.testButton}
            onPress={() => router.push('/character-growth')}
          >
            <Feather name="trending-up" size={20} color="white" />
            <Text style={styles.buttonText}>캐릭터 성장</Text>
          </TouchableOpacity>
        </View>

        {/* 탈출 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚪 탈출하기</Text>
          
          <TouchableOpacity 
            style={[styles.testButton, styles.escapeButton]}
            onPress={() => router.push('/home')}
          >
            <Feather name="home" size={20} color="white" />
            <Text style={styles.buttonText}>🏠 홈으로 돌아가기</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.testButton, styles.escapeButton]}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={20} color="white" />
            <Text style={styles.buttonText}>⬅️ 이전 화면으로</Text>
          </TouchableOpacity>
        </View>

        {/* 하단 패딩 */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#6B7280',
  },
  headerSpacer: {
    width: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 5,
  },
  section: {
    padding: 20,
    backgroundColor: 'white',
    marginBottom: 20,
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  testButton: {
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  aiButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  escapeButton: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  apiButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
    flex: 1,
    textAlign: 'center',
  },
});

export default TestDashboard;
