import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { FinancialBenefit, BenefitRecommendation } from '../services/benefitService';

interface BenefitModalProps {
  visible: boolean;
  onClose: () => void;
  benefits: BenefitRecommendation;
}

const { width } = Dimensions.get('window');

export default function BenefitModal({ visible, onClose, benefits }: BenefitModalProps) {
  const renderBenefitCard = (benefit: FinancialBenefit, index: number) => (
    <View key={`${benefit.type}-${index}`} style={styles.benefitCard}>
      <View style={styles.benefitHeader}>
        <View style={styles.benefitTypeContainer}>
          <View style={[styles.benefitTypeIcon, { backgroundColor: getTypeColor(benefit.type) }]}>
            <Feather name={getTypeIcon(benefit.type)} size={16} color="white" />
          </View>
          <Text style={styles.benefitName}>{benefit.name}</Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{benefit.score}점</Text>
        </View>
      </View>
      
      <Text style={styles.benefitDescription}>{benefit.description}</Text>
      
      <View style={styles.benefitDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>🎁 혜택:</Text>
          <Text style={styles.detailValue}>{benefit.benefit}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>📋 조건:</Text>
          <Text style={styles.detailValue}>{benefit.requirements}</Text>
        </View>
      </View>
    </View>
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'scholarship': return '#10B981';
      case 'deposit': return '#3B82F6';
      case 'savings': return '#8B5CF6';
      case 'loan': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'scholarship': return 'award';
      case 'deposit': return 'credit-card';
      case 'savings': return 'trending-up';
      case 'loan': return 'dollar-sign';
      default: return 'gift';
    }
  };

  const getTypeTitle = (type: string) => {
    switch (type) {
      case 'scholarship': return '🎓 장학금 혜택';
      case 'deposit': return '💰 예금 혜택';
      case 'savings': return '📈 적금 혜택';
      case 'loan': return '💳 대출 혜택';
      default: return '🎁 혜택';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* 헤더 */}
          <LinearGradient
            colors={['#3B82F6', '#1D4ED8']}
            style={styles.modalHeader}
          >
            <View style={styles.headerContent}>
              <Text style={styles.modalTitle}>🎁 맞춤형 혜택 안내</Text>
              <Text style={styles.modalSubtitle}>
                크레도 점수와 성향을 기반으로 한 개인화 혜택
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color="white" />
            </TouchableOpacity>
          </LinearGradient>

          {/* 내용 */}
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* 요약 정보 */}
            <View style={styles.summarySection}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>📊 혜택 점수</Text>
                <Text style={styles.summaryScore}>{benefits.totalScore}점</Text>
                <Text style={styles.summaryDescription}>
                  홀랜드 성향 검사 총점
                </Text>
              </View>
            </View>

            {/* 추천사항 */}
            {benefits.recommendations.length > 0 && (
              <View style={styles.recommendationsSection}>
                <Text style={styles.sectionTitle}>💡 개인화 추천</Text>
                {benefits.recommendations.map((recommendation, index) => (
                  <View key={index} style={styles.recommendationItem}>
                    <Text style={styles.recommendationText}>{recommendation}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* 장학금 혜택 */}
            {benefits.scholarships.length > 0 && (
              <View style={styles.benefitsSection}>
                <Text style={styles.sectionTitle}>{getTypeTitle('scholarship')}</Text>
                {benefits.scholarships.map((benefit, index) => 
                  renderBenefitCard(benefit, index)
                )}
              </View>
            )}

            {/* 예금 혜택 */}
            {benefits.deposits.length > 0 && (
              <View style={styles.benefitsSection}>
                <Text style={styles.sectionTitle}>{getTypeTitle('deposit')}</Text>
                {benefits.deposits.map((benefit, index) => 
                  renderBenefitCard(benefit, index)
                )}
              </View>
            )}

            {/* 적금 혜택 */}
            {benefits.savings.length > 0 && (
              <View style={styles.benefitsSection}>
                <Text style={styles.sectionTitle}>{getTypeTitle('savings')}</Text>
                {benefits.savings.map((benefit, index) => 
                  renderBenefitCard(benefit, index)
                )}
              </View>
            )}

            {/* 대출 혜택 */}
            {benefits.loans.length > 0 && (
              <View style={styles.benefitsSection}>
                <Text style={styles.sectionTitle}>{getTypeTitle('loan')}</Text>
                {benefits.loans.map((benefit, index) => 
                  renderBenefitCard(benefit, index)
                )}
              </View>
            )}

            {/* 하단 패딩 */}
            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalContent: {
    padding: 20,
  },
  summarySection: {
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: '#F8FAFC',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  summaryScore: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 4,
  },
  summaryDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  recommendationsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  recommendationItem: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  recommendationText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  benefitsSection: {
    marginBottom: 24,
  },
  benefitCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  benefitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  benefitTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  benefitName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  scoreContainer: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  benefitDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  benefitDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginRight: 8,
    minWidth: 60,
  },
  detailValue: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
    lineHeight: 20,
  },
});
