import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import homeDashboardService from '../services/homeDashboardService';
import { HomeDashboard, AccountSummary, Transaction, FinancialStatus } from '../services/homeDashboardService';
import CredoService from '../services/credoService';

interface HomeDashboardScreenProps {
  navigation: any;
}

const { width } = Dimensions.get('window');

const HomeDashboardScreen: React.FC<HomeDashboardScreenProps> = ({ navigation }) => {
  const [dashboard, setDashboard] = useState<HomeDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentCredo, setCurrentCredo] = useState(0);

  // 임시 사용자 ID (실제로는 인증 시스템에서 가져옴)
  const userId = 'test_user_001';
  
  // 크레도 서비스
  const credoService = CredoService.getInstance();

  useEffect(() => {
    loadDashboard();
    loadCredoData();
    
    // 크레도 변경 이벤트 리스너 등록
    const handleCredoChange = (credoData: any) => {
      setCurrentCredo(credoData.currentCredo);
    };
    
    credoService.on('credoChanged', handleCredoChange);
    
    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      credoService.off('credoChanged', handleCredoChange);
    };
  }, []);
  
  // 크레도 데이터 로드
  const loadCredoData = () => {
    try {
      const credoStats = credoService.getCredoStats();
      setCurrentCredo(credoStats.currentCredo);
    } catch (error) {
      console.error('크레도 데이터 로드 실패:', error);
    }
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await homeDashboardService.getDashboard(userId);
      setDashboard(data);
    } catch (error) {
      console.error('대시보드 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    loadCredoData(); // 크레도 데이터도 새로고침
    setRefreshing(false);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Text style={styles.greeting}>안녕하세요! 👋</Text>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Ionicons name="notifications-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <Text style={styles.userName}>사용자님</Text>
      
      {/* 크레도 표시 */}
      <View style={styles.credoContainer}>
        <TouchableOpacity
          style={styles.credoButton}
          onPress={() => navigation.navigate('CharacterRoom')}
        >
          <Ionicons name="flash" size={20} color="#FFA500" />
          <Text style={styles.credoText}>{currentCredo}</Text>
          <Ionicons name="chevron-forward" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAccountSummary = (summary: AccountSummary) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>💰 계좌 요약</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Accounts')}>
          <Text style={styles.seeAllText}>전체보기</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.summaryCards}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>총 자산</Text>
          <Text style={styles.summaryAmount}>
            {homeDashboardService.formatBalance(summary.total_balance)}원
          </Text>
          <Text style={styles.summarySubtext}>
            계좌 {summary.total_accounts}개
          </Text>
        </View>
        
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>순자산</Text>
          <Text style={styles.summaryAmount}>
            {homeDashboardService.formatBalance(summary.net_worth)}원
          </Text>
          <Text style={styles.summarySubtext}>
            대출 {homeDashboardService.formatBalance(summary.total_loan)}원
          </Text>
        </View>
      </View>

      <View style={styles.accountTypes}>
        <View style={styles.accountType}>
          <View style={styles.accountTypeIcon}>
            <Ionicons name="card-outline" size={20} color="#667eea" />
          </View>
          <Text style={styles.accountTypeLabel}>수시입출금</Text>
          <Text style={styles.accountTypeCount}>{summary.account_counts.demand_deposit}개</Text>
        </View>
        
        <View style={styles.accountType}>
          <View style={styles.accountTypeIcon}>
            <Ionicons name="trending-up-outline" size={20} color="#4CAF50" />
          </View>
          <Text style={styles.accountTypeLabel}>예금</Text>
          <Text style={styles.accountTypeCount}>{summary.account_counts.deposit}개</Text>
        </View>
        
        <View style={styles.accountType}>
          <View style={styles.accountTypeIcon}>
            <Ionicons name="save-outline" size={20} color="#FF9800" />
          </View>
          <Text style={styles.accountTypeLabel}>적금</Text>
          <Text style={styles.accountTypeCount}>{summary.account_counts.savings}개</Text>
        </View>
        
        <View style={styles.accountType}>
          <View style={styles.accountTypeIcon}>
            <Ionicons name="calculator-outline" size={20} color="#F44336" />
          </View>
          <Text style={styles.accountTypeLabel}>대출</Text>
          <Text style={styles.accountTypeCount}>{summary.account_counts.loan}개</Text>
        </View>
      </View>
    </View>
  );

  const renderRecentTransactions = (transactions: Transaction[]) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>📋 최근 거래내역</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
          <Text style={styles.seeAllText}>전체보기</Text>
        </TouchableOpacity>
      </View>
      
      {transactions.slice(0, 5).map((transaction, index) => (
        <View key={index} style={styles.transactionItem}>
          <View style={styles.transactionLeft}>
            <View style={styles.transactionIcon}>
              <Ionicons
                name={transaction.amount > 0 ? "arrow-down-circle" : "arrow-up-circle"}
                size={24}
                color={transaction.amount > 0 ? "#4CAF50" : "#F44336"}
              />
            </View>
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionMemo} numberOfLines={1}>
                {transaction.memo}
              </Text>
              <Text style={styles.transactionAccount}>
                {transaction.account_name || '기본계좌'}
              </Text>
            </View>
          </View>
          
          <View style={styles.transactionRight}>
            <Text style={[
              styles.transactionAmount,
              { color: transaction.amount > 0 ? "#4CAF50" : "#F44336" }
            ]}>
              {homeDashboardService.formatAmount(transaction.amount)}
            </Text>
            <Text style={styles.transactionDate}>
              {new Date(transaction.transactionDate).toLocaleDateString('ko-KR')}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderFinancialStatus = (status: FinancialStatus) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>📊 재무 현황</Text>
        <TouchableOpacity onPress={() => navigation.navigate('FinancialStatus')}>
          <Text style={styles.seeAllText}>상세보기</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.statusCards}>
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>신용등급</Text>
          <View style={styles.creditScoreContainer}>
            <Text style={[
              styles.creditScore,
              { color: homeDashboardService.getCreditGradeColor(status.credit_grade) }
            ]}>
              {status.credit_grade}
            </Text>
            <Text style={styles.creditScoreNumber}>{status.credit_score}점</Text>
          </View>
        </View>
        
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>이번 달</Text>
          <Text style={styles.statusValue}>
            {Object.keys(status.monthly_analysis).length > 0 ? 
              `${Object.values(status.monthly_analysis)[0].net >= 0 ? '+' : ''}${Object.values(status.monthly_analysis)[0].net.toLocaleString()}원` :
              '데이터 없음'
            }
          </Text>
          <Text style={styles.statusSubtext}>순수익</Text>
        </View>
      </View>

      <View style={styles.goalsContainer}>
        <Text style={styles.goalsTitle}>🎯 금융 목표</Text>
        {Object.entries(status.financial_goals).slice(0, 3).map(([goalKey, goal]) => (
          <View key={goalKey} style={styles.goalItem}>
            <View style={styles.goalInfo}>
              <Text style={styles.goalName}>{goal.description}</Text>
              <Text style={styles.goalProgress}>
                {goal.current.toLocaleString()}원 / {goal.target.toLocaleString()}원
              </Text>
            </View>
            <View style={styles.goalBar}>
              <View
                style={[
                  styles.goalBarFill,
                  {
                    width: `${Math.min(goal.achievement_rate, 100)}%`,
                    backgroundColor: homeDashboardService.getAchievementColor(goal.achievement_rate)
                  }
                ]}
              />
            </View>
            <Text style={styles.goalPercentage}>{goal.achievement_rate}%</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderRecommendedProducts = (products: any[]) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>💡 추천 상품</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Products')}>
          <Text style={styles.seeAllText}>전체보기</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {products.slice(0, 5).map((product, index) => (
          <TouchableOpacity
            key={index}
            style={styles.productCard}
            onPress={() => navigation.navigate('ProductDetail', { product })}
          >
            <View style={styles.productIcon}>
              <Ionicons
                name={product.type === 'deposit' ? 'trending-up' : 'save'}
                size={24}
                color="#667eea"
              />
            </View>
            <Text style={styles.productName} numberOfLines={2}>
              {product.product.accountName}
            </Text>
            <Text style={styles.productReason} numberOfLines={2}>
              {product.reason}
            </Text>
            <View style={[
              styles.priorityBadge,
              { backgroundColor: product.priority === 'high' ? '#F44336' : 
                               product.priority === 'medium' ? '#FF9800' : '#4CAF50' }
            ]}>
              <Text style={styles.priorityText}>
                {product.priority === 'high' ? '높음' : 
                 product.priority === 'medium' ? '보통' : '낮음'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>⚡ 빠른 실행</Text>
      
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => navigation.navigate('Transfer')}
        >
          <View style={styles.quickActionIcon}>
            <Ionicons name="swap-horizontal" size={24} color="#667eea" />
          </View>
          <Text style={styles.quickActionText}>송금</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => navigation.navigate('Deposit')}
        >
          <View style={styles.quickActionIcon}>
            <Ionicons name="trending-up" size={24} color="#4CAF50" />
          </View>
          <Text style={styles.quickActionText}>예금</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => navigation.navigate('Savings')}
        >
          <View style={styles.quickActionIcon}>
            <Ionicons name="save" size={24} color="#FF9800" />
          </View>
          <Text style={styles.quickActionText}>적금</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => navigation.navigate('AIAdvisor')}
        >
          <View style={styles.quickActionIcon}>
            <Ionicons name="chatbubble-ellipses" size={24} color="#9C27B0" />
          </View>
          <Text style={styles.quickActionText}>AI 상담</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>대시보드를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {renderHeader()}
          
          {dashboard && (
            <>
              {renderAccountSummary(dashboard.account_summary)}
              {renderRecentTransactions(dashboard.recent_transactions)}
              {renderFinancialStatus(dashboard.financial_status)}
              {renderRecommendedProducts(dashboard.recommended_products)}
            </>
          )}
          
          {renderQuickActions()}
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
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  greeting: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.9,
  },
  notificationButton: {
    padding: 8,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  credoContainer: {
    marginTop: 8,
  },
  credoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
  credoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginHorizontal: 8,
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '600',
  },
  summaryCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  summarySubtext: {
    fontSize: 12,
    color: '#999',
  },
  accountTypes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  accountType: {
    alignItems: 'center',
    flex: 1,
  },
  accountTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  accountTypeLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  accountTypeCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionMemo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  transactionAccount: {
    fontSize: 14,
    color: '#666',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
  },
  statusCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statusCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  creditScoreContainer: {
    alignItems: 'center',
  },
  creditScore: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  creditScoreNumber: {
    fontSize: 14,
    color: '#666',
  },
  statusValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statusSubtext: {
    fontSize: 12,
    color: '#999',
  },
  goalsContainer: {
    marginTop: 10,
  },
  goalsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  goalItem: {
    marginBottom: 16,
  },
  goalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  goalName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  goalProgress: {
    fontSize: 14,
    color: '#666',
  },
  goalBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    marginBottom: 8,
  },
  goalBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  goalPercentage: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  productCard: {
    width: 160,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
  },
  productIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  productReason: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    width: (width - 80) / 4,
    alignItems: 'center',
    marginBottom: 16,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default HomeDashboardScreen;
