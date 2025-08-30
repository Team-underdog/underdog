import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import GeminiService from '../services/geminiService';

export default function GeminiConnectionTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');

  const addLog = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testGeminiConnection = async () => {
    setIsLoading(true);
    setConnectionStatus('testing');
    setTestResults([]);
    
    addLog('🚀 Gemini API 연결 테스트 시작...');
    
    try {
      // 1. GeminiService 존재 확인
      addLog('🔍 GeminiService 존재 확인 중...');
      console.log('GeminiService 타입:', typeof GeminiService);
      console.log('GeminiService 내용:', GeminiService);
      
      if (!GeminiService) {
        addLog('❌ GeminiService가 정의되지 않음');
        setConnectionStatus('failed');
        return;
      }
      
      addLog('✅ GeminiService 존재 확인 완료');
      
      // 2. getInstance 메서드 확인
      addLog('🔍 getInstance 메서드 확인 중...');
      if (typeof GeminiService.getInstance !== 'function') {
        addLog('❌ getInstance 메서드가 존재하지 않음');
        setConnectionStatus('failed');
        return;
      }
      
      addLog('✅ getInstance 메서드 확인 완료');
      
      // 3. 서비스 인스턴스 생성
      addLog('🔍 GeminiService 인스턴스 생성 중...');
      const geminiService = GeminiService.getInstance();
      
      if (!geminiService) {
        addLog('❌ GeminiService 인스턴스 생성 실패');
        setConnectionStatus('failed');
        return;
      }
      
      addLog('✅ GeminiService 인스턴스 생성 완료');
      
      // 4. API 키 확인
      addLog('🔑 API 키 확인 중...');
      if (!geminiService.isConfigured()) {
        addLog('❌ API 키가 설정되지 않음');
        setConnectionStatus('failed');
        return;
      }
      
      addLog('✅ API 키 확인 완료');
      
      // 5. 연결 테스트
      addLog('🌐 API 연결 테스트 중...');
      const isConnected = await geminiService.testConnection();
      
      if (isConnected) {
        addLog('✅ Gemini API 연결 성공!');
        setConnectionStatus('success');
      } else {
        addLog('❌ Gemini API 연결 실패');
        setConnectionStatus('failed');
      }
      
      // 6. 간단한 API 호출 테스트
      addLog('📝 간단한 API 호출 테스트...');
      const response = await geminiService.callGeminiAPI('안녕하세요. 간단한 테스트입니다.');
      
      if (response.success) {
        addLog(`✅ API 호출 성공: ${response.text?.substring(0, 50)}...`);
      } else {
        addLog(`❌ API 호출 실패: ${response.error}`);
      }
      
    } catch (error) {
      addLog(`❌ 테스트 중 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
      console.error('테스트 오류 상세:', error);
      setConnectionStatus('failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'success': return '#10B981';
      case 'failed': return '#EF4444';
      case 'testing': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'success': return '연결 성공';
      case 'failed': return '연결 실패';
      case 'testing': return '테스트 중...';
      default: return '테스트 대기';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔗 Gemini API 연결 테스트</Text>
        <Text style={styles.subtitle}>
          API 키 설정과 네트워크 연결 상태를 확인합니다
        </Text>
      </View>

      <View style={styles.statusContainer}>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </View>

      <TouchableOpacity
        style={[styles.testButton, isLoading && styles.testButtonDisabled]}
        onPress={testGeminiConnection}
        disabled={isLoading}
      >
        <Text style={styles.testButtonText}>
          {isLoading ? '테스트 중...' : '연결 테스트 시작'}
        </Text>
      </TouchableOpacity>

      <View style={styles.logsContainer}>
        <Text style={styles.logsTitle}>📋 테스트 로그</Text>
        <ScrollView style={styles.logsScroll} showsVerticalScrollIndicator={false}>
          {testResults.length === 0 ? (
            <Text style={styles.noLogsText}>테스트를 시작하면 로그가 여기에 표시됩니다.</Text>
          ) : (
            testResults.map((log, index) => (
              <Text key={index} style={styles.logText}>
                {log}
              </Text>
            ))
          )}
        </ScrollView>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>💡 문제 해결 방법</Text>
        <Text style={styles.infoText}>
          • API 키가 올바르게 설정되었는지 확인{'\n'}
          • 인터넷 연결 상태 확인{'\n'}
          • 백엔드 서버가 실행 중인지 확인{'\n'}
          • 방화벽/프록시 설정 확인{'\n'}
          • CORS 정책 확인 (브라우저 환경)
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  testButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  testButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  logsContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  logsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  logsScroll: {
    flex: 1,
  },
  noLogsText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  logText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  infoContainer: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
});
