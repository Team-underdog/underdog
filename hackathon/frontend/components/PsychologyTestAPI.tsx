import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import careerNetService from '../services/careerNetService';

/**
 * 커리어넷 진로심리검사 API 테스트 컴포넌트
 * 실제 API 응답을 확인하고 데이터 구조를 파악할 수 있습니다.
 */
const PsychologyTestAPI: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testList, setTestList] = useState<any>(null);
  const [hollandQuestions, setHollandQuestions] = useState<any>(null);
  const [apiStatus, setApiStatus] = useState<string>('대기중');

  useEffect(() => {
    // 컴포넌트 마운트 시 API 상태 확인
    checkAPIStatus();
  }, []);

  const checkAPIStatus = async () => {
    try {
      setIsLoading(true);
      const isValid = await careerNetService.validateAPIKey();
      setApiStatus(isValid ? '연결됨' : '연결 실패');
    } catch (error) {
      setApiStatus('오류 발생');
      console.error('API 상태 확인 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTestList = async () => {
    try {
      setIsLoading(true);
      setApiStatus('심리검사 목록 조회 중...');
      
      const tests = await careerNetService.getPsychologyTests();
      setTestList(tests);
      setApiStatus('심리검사 목록 로드 완료');
      
      console.log('심리검사 목록:', tests);
    } catch (error) {
      console.error('심리검사 목록 로드 실패:', error);
      setApiStatus('목록 로드 실패');
      Alert.alert('오류', '심리검사 목록을 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadHollandQuestions = async () => {
    try {
      setIsLoading(true);
      setApiStatus('직업흥미검사(H) 문항 로드 중...');
      
      const hollandData = await careerNetService.getHollandTestQuestions();
      setHollandQuestions(hollandData);
      setApiStatus('Holland 문항 로드 완료');
      
      console.log('Holland 검사 데이터:', hollandData);
    } catch (error) {
      console.error('Holland 문항 로드 실패:', error);
      setApiStatus('문항 로드 실패');
      Alert.alert('오류', '직업흥미검사 문항을 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderTestList = () => {
    if (!testList) return null;

    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>📋 심리검사 목록</Text>
        
        {testList.result && testList.result[0] && testList.result[0].map((test: any, index: number) => (
          <View key={index} style={styles.testItem}>
            <View style={styles.testHeader}>
              <Text style={styles.testName}>{test.name}</Text>
              <Text style={styles.testNumber}>#{test.qno}</Text>
            </View>
            
            <Text style={styles.testDescription}>{test.description}</Text>
            <Text style={styles.testSummary}>{test.summary}</Text>
            
            <View style={styles.testMeta}>
              <Text style={styles.testMetaText}>제작자: {test.maker}</Text>
              <Text style={styles.testMetaText}>소요시간: {test.exectime}분</Text>
              <Text style={styles.testMetaText}>문항 수: {test.qcount}개</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderHollandQuestions = () => {
    if (!hollandQuestions) return null;

    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>🧠 직업흥미검사(H) 문항</Text>
        
        {hollandQuestions.questions && hollandQuestions.questions.length > 0 ? (
          <View>
            <Text style={styles.questionCount}>
              총 {hollandQuestions.questions.length}개 문항
            </Text>
            
            {/* 처음 5개 문항만 표시 (전체는 너무 많음) */}
            {hollandQuestions.questions.slice(0, 5).map((question: any, index: number) => (
              <View key={index} style={styles.questionItem}>
                <View style={styles.questionHeader}>
                  <Text style={styles.questionNumber}>문항 {question.qno || index + 1}</Text>
                  <Text style={styles.questionType}>
                    {question.type || '유형 미분류'}
                  </Text>
                </View>
                
                <Text style={styles.questionText}>
                  {question.question || question.text || '문항 내용 없음'}
                </Text>
                
                {/* 추가 정보가 있다면 표시 */}
                {question.category && (
                  <Text style={styles.questionCategory}>
                    카테고리: {question.category}
                  </Text>
                )}
              </View>
            ))}
            
            {hollandQuestions.questions.length > 5 && (
              <Text style={styles.moreQuestions}>
                ... 외 {hollandQuestions.questions.length - 5}개 문항
              </Text>
            )}
          </View>
        ) : (
          <Text style={styles.noData}>문항 데이터가 없습니다.</Text>
        )}
      </View>
    );
  };

  const renderAPIDebug = () => {
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>🔍 API 디버그 정보</Text>
        
        <View style={styles.debugItem}>
          <Text style={styles.debugLabel}>API 상태:</Text>
          <Text style={[
            styles.debugValue,
            { color: apiStatus.includes('완료') ? '#059669' : 
                     apiStatus.includes('실패') ? '#DC2626' : '#6B7280' }
          ]}>
            {apiStatus}
          </Text>
        </View>
        
        <View style={styles.debugItem}>
          <Text style={styles.debugLabel}>API 키:</Text>
          <Text style={styles.debugValue}>
            {careerNetService['apiKey'] ? '설정됨' : '설정 안됨'}
          </Text>
        </View>
        
        <View style={styles.debugItem}>
          <Text style={styles.debugLabel}>데이터 로드:</Text>
          <Text style={styles.debugValue}>
            {testList ? '심리검사 목록 ✓' : '심리검사 목록 ✗'} | {' '}
            {hollandQuestions ? 'Holland 문항 ✓' : 'Holland 문항 ✗'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🧠 진로심리검사 API 테스트</Text>
        <Text style={styles.subtitle}>
          커리어넷 API 연동 상태 및 실제 데이터 확인
        </Text>
      </View>

      {/* API 상태 및 디버그 정보 */}
      {renderAPIDebug()}

      {/* API 테스트 버튼들 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.testButton}
          onPress={loadTestList}
          disabled={isLoading}
        >
          <Feather name="list" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>심리검사 목록 조회</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.testButton, styles.secondaryButton]}
          onPress={loadHollandQuestions}
          disabled={isLoading}
        >
          <Feather name="brain" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>직업흥미검사(H) 문항 조회</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.testButton, styles.refreshButton]}
          onPress={checkAPIStatus}
          disabled={isLoading}
        >
          <Feather name="refresh-cw" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>API 상태 재확인</Text>
        </TouchableOpacity>
      </View>

      {/* 로딩 인디케이터 */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>API 요청 중...</Text>
        </View>
      )}

      {/* 심리검사 목록 */}
      {renderTestList()}

      {/* Holland 문항들 */}
      {renderHollandQuestions()}

      {/* 사용법 안내 */}
      <View style={styles.usageContainer}>
        <Text style={styles.usageTitle}>💡 사용법</Text>
        <Text style={styles.usageText}>
          1. 먼저 "API 상태 재확인" 버튼으로 연결 상태를 확인하세요
        </Text>
        <Text style={styles.usageText}>
          2. "심리검사 목록 조회"로 사용 가능한 검사들을 확인하세요
        </Text>
        <Text style={styles.usageText}>
          3. "직업흥미검사(H) 문항 조회"로 실제 문항 데이터를 가져오세요
        </Text>
        <Text style={styles.usageText}>
          4. 콘솔 로그에서 상세한 API 응답을 확인할 수 있습니다
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  
  buttonContainer: {
    margin: 16,
    gap: 12,
  },
  
  testButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  
  secondaryButton: {
    backgroundColor: '#10B981',
  },
  
  refreshButton: {
    backgroundColor: '#8B5CF6',
  },
  
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
    margin: 16,
  },
  
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
  
  testItem: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  testName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  
  testNumber: {
    fontSize: 14,
    color: '#6B7280',
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  testDescription: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 20,
  },
  
  testSummary: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  
  testMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  
  testMetaText: {
    fontSize: 12,
    color: '#9CA3AF',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  
  questionCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 16,
    textAlign: 'center',
  },
  
  questionItem: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  questionNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  
  questionType: {
    fontSize: 12,
    color: '#FFFFFF',
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  questionText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 20,
  },
  
  questionCategory: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  
  moreQuestions: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
  
  noData: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  
  debugItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  
  debugLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  
  debugValue: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  
  usageContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 32,
  },
  
  usageTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  
  usageText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default PsychologyTestAPI;
