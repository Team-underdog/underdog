import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import CredoService from '../services/credoService';

const CredoTest: React.FC = () => {
  const [credoStats, setCredoStats] = useState<any>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const credoService = CredoService.getInstance();

  useEffect(() => {
    loadCredoData();
    
    // 크레도 변경 이벤트 리스너
    const handleCredoChanged = (stats: any) => {
      setCredoStats(stats);
      setRecentTransactions(stats.transactions.slice(0, 5));
    };
    
    credoService.on('credoChanged', handleCredoChanged);
    
    return () => {
      credoService.off('credoChanged', handleCredoChanged);
    };
  }, []);

  const loadCredoData = () => {
    const stats = credoService.getCredoStats();
    const summary = credoService.getCredoSummary();
    setCredoStats(stats);
    setRecentTransactions(stats.transactions.slice(0, 5));
  };

  // 크레도 획득 테스트
  const testEarnCredo = (amount: number, source: string) => {
    setIsLoading(true);
    
    const success = credoService.earnCredo(amount, source, `${source}에서 ${amount} 크레도 획득`);
    
    if (success) {
      Alert.alert('✅ 성공', `${amount} 크레도를 획득했습니다!`);
    } else {
      Alert.alert('❌ 실패', '크레도 획득에 실패했습니다.');
    }
    
    setIsLoading(false);
  };

  // 크레도 소비 테스트
  const testSpendCredo = (amount: number, source: string) => {
    setIsLoading(true);
    
    const success = credoService.spendCredo(amount, source, `${source}에서 ${amount} 크레도 소비`);
    
    if (success) {
      Alert.alert('✅ 성공', `${amount} 크레도를 소비했습니다!`);
    } else {
      Alert.alert('❌ 실패', '크레도가 부족하거나 소비에 실패했습니다.');
    }
    
    setIsLoading(false);
  };

  // 크레도 리셋
  const resetCredo = () => {
    Alert.alert(
      '🔄 크레도 리셋',
      '모든 크레도 데이터를 초기화하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '리셋', 
          style: 'destructive',
          onPress: () => {
            credoService.resetCredo();
            Alert.alert('✅ 완료', '크레도가 리셋되었습니다.');
          }
        }
      ]
    );
  };

  // 테스트용 크레도 추가
  const addTestCredo = () => {
    credoService.addTestCredo(100);
    Alert.alert('✅ 완료', '테스트용 100 크레도가 추가되었습니다.');
  };

  // 크레도 히스토리 내보내기
  const exportHistory = () => {
    const history = credoService.exportCredoHistory();
    console.log('📊 크레도 히스토리:', history);
    Alert.alert('📊 내보내기', '콘솔에 크레도 히스토리가 출력되었습니다.');
  };

  if (!credoStats) {
    return (
      <View style={styles.loadingContainer}>
        <Text>크레도 데이터 로딩 중...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView}>
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={styles.title}>🧪 크레도 시스템 테스트</Text>
            <Text style={styles.subtitle}>중앙 크레도 서비스를 테스트해보세요</Text>
          </View>

          {/* 크레도 통계 */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>📊 크레도 통계</Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>현재 레벨</Text>
                <Text style={styles.statValue}>{credoStats.level}</Text>
              </View>
              
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>현재 크레도</Text>
                <Text style={styles.statValue}>{credoStats.currentCredo}</Text>
              </View>
              
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>총 획득</Text>
                <Text style={styles.statValue}>{credoStats.earnedCredo}</Text>
              </View>
              
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>총 소비</Text>
                <Text style={styles.statValue}>{credoStats.spentCredo}</Text>
              </View>
            </View>

            <View style={styles.progressSection}>
              <Text style={styles.progressLabel}>
                다음 레벨까지: {credoService.getCredoForNextLevel() - credoStats.currentCredo} 크레도 필요
              </Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { width: `${credoService.getLevelProgress()}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {credoService.getLevelProgress().toFixed(1)}% 완료
              </Text>
            </View>
          </View>

          {/* 크레도 획득 테스트 */}
          <View style={styles.testSection}>
            <Text style={styles.sectionTitle}>🎉 크레도 획득 테스트</Text>
            
            <TouchableOpacity
              style={styles.testButton}
              onPress={() => testEarnCredo(25, 'character_touch')}
              disabled={isLoading}
            >
              <Ionicons name="hand-left" size={20} color="white" />
              <Text style={styles.buttonText}>캐릭터 터치 (+25 크레도)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.testButton}
              onPress={() => testEarnCredo(100, 'skill_unlock')}
              disabled={isLoading}
            >
              <Ionicons name="trophy" size={20} color="white" />
              <Text style={styles.buttonText}>스킬 해금 (+100 크레도)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.testButton}
              onPress={() => testEarnCredo(50, 'quest_complete')}
              disabled={isLoading}
            >
              <Ionicons name="checkmark-circle" size={20} color="white" />
              <Text style={styles.buttonText}>퀘스트 완료 (+50 크레도)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.testButton}
              onPress={() => testEarnCredo(75, 'ai_feed')}
              disabled={isLoading}
            >
              <Ionicons name="brain" size={20} color="white" />
              <Text style={styles.buttonText}>AI 피드 분석 (+75 크레도)</Text>
            </TouchableOpacity>
          </View>

          {/* 크레도 소비 테스트 */}
          <View style={styles.testSection}>
            <Text style={styles.sectionTitle}>💸 크레도 소비 테스트</Text>
            
            <TouchableOpacity
              style={styles.testButton}
              onPress={() => testSpendCredo(50, 'item_purchase')}
              disabled={isLoading}
            >
              <Ionicons name="bag" size={20} color="white" />
              <Text style={styles.buttonText}>아이템 구매 (-50 크레도)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.testButton}
              onPress={() => testSpendCredo(100, 'skill_upgrade')}
              disabled={isLoading}
            >
              <Ionicons name="arrow-up" size={20} color="white" />
              <Text style={styles.buttonText}>스킬 업그레이드 (-100 크레도)</Text>
            </TouchableOpacity>
          </View>

          {/* 관리 도구 */}
          <View style={styles.managementSection}>
            <Text style={styles.sectionTitle}>⚙️ 관리 도구</Text>
            
            <TouchableOpacity
              style={[styles.testButton, styles.addButton]}
              onPress={addTestCredo}
              disabled={isLoading}
            >
              <Ionicons name="add-circle" size={20} color="white" />
              <Text style={styles.buttonText}>테스트 크레도 추가 (+100)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.testButton, styles.exportButton]}
              onPress={exportHistory}
              disabled={isLoading}
            >
              <Ionicons name="download" size={20} color="white" />
              <Text style={styles.buttonText}>히스토리 내보내기</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.testButton, styles.resetButton]}
              onPress={resetCredo}
              disabled={isLoading}
            >
              <Ionicons name="refresh" size={20} color="white" />
              <Text style={styles.buttonText}>크레도 리셋</Text>
            </TouchableOpacity>
          </View>

          {/* 최근 거래 내역 */}
          {recentTransactions.length > 0 && (
            <View style={styles.transactionsSection}>
              <Text style={styles.sectionTitle}>📝 최근 거래 내역</Text>
              
              {recentTransactions.map((transaction, index) => (
                <View key={transaction.id} style={styles.transactionItem}>
                  <View style={styles.transactionHeader}>
                    <Text style={styles.transactionType}>
                      {transaction.type === 'earn' ? '➕' : '➖'} {transaction.amount} 크레도
                    </Text>
                    <Text style={styles.transactionTime}>
                      {transaction.timestamp.toLocaleTimeString()}
                    </Text>
                  </View>
                  <Text style={styles.transactionSource}>{transaction.source}</Text>
                  <Text style={styles.transactionDescription}>{transaction.description}</Text>
                </View>
              ))}
            </View>
          )}

          {/* 새로고침 */}
          <TouchableOpacity
            style={[styles.testButton, styles.refreshButton]}
            onPress={loadCredoData}
            disabled={isLoading}
          >
            <Ionicons name="refresh" size={20} color="white" />
            <Text style={styles.buttonText}>데이터 새로고침</Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  statsSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    width: '48%',
    alignItems: 'center',
    marginBottom: 10,
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginBottom: 5,
  },
  statValue: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  progressSection: {
    alignItems: 'center',
  },
  progressLabel: {
    color: 'white',
    fontSize: 14,
    marginBottom: 10,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  testSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  addButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
    borderColor: 'rgba(76, 175, 80, 0.5)',
  },
  exportButton: {
    backgroundColor: 'rgba(33, 150, 243, 0.8)',
    borderColor: 'rgba(33, 150, 243, 0.5)',
  },
  resetButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.8)',
    borderColor: 'rgba(244, 67, 54, 0.5)',
  },
  refreshButton: {
    backgroundColor: 'rgba(255, 152, 0, 0.8)',
    borderColor: 'rgba(255, 152, 0, 0.5)',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  managementSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  transactionsSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  transactionItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionType: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  transactionTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  transactionSource: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 5,
  },
  transactionDescription: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
});

export default CredoTest;
