import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AISelfPromotionService, { SelfPromotionResult } from '../services/aiSelfPromotionService';

interface SelfPromotionModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
  characterLevel: number;
  credoScore: number;
}

const { width } = Dimensions.get('window');

export default function SelfPromotionModal({ 
  visible, 
  onClose, 
  userId, 
  characterLevel, 
  credoScore 
}: SelfPromotionModalProps) {
  const [selfPromotion, setSelfPromotion] = useState<SelfPromotionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible && userId) {
      generateSelfPromotion();
    }
  }, [visible, userId]);

  const generateSelfPromotion = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await AISelfPromotionService.generateSelfPromotion(userId);
      setSelfPromotion(result);
    } catch (error) {
      console.error('❌ 자기 어필 생성 실패:', error);
      setError('자기 어필을 생성하는 중 문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const renderCharacterAvatar = () => (
    <View style={styles.characterContainer}>
      <View style={styles.characterAvatar}>
        <Text style={styles.characterEmoji}>🎭</Text>
        <Text style={styles.characterLevel}>Lv.{characterLevel}</Text>
      </View>
      <Text style={styles.characterName}>내 캐릭터</Text>
    </View>
  );

  const renderIntroduction = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>💬 자기 소개</Text>
      <View style={styles.introductionCard}>
        <Text style={styles.introductionText}>{selfPromotion?.introduction}</Text>
      </View>
    </View>
  );

  const renderStrengths = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>💪 강점</Text>
      {selfPromotion?.strengths && selfPromotion.strengths.length > 0 ? (
        selfPromotion.strengths.map((strength, index) => (
          <View key={index} style={styles.strengthItem}>
            <View style={styles.strengthIcon}>
              <Feather name="check-circle" size={16} color="#10B981" />
            </View>
            <Text style={styles.strengthText}>{strength}</Text>
          </View>
        ))
      ) : (
        <View style={styles.emptyItem}>
          <Text style={styles.emptyText}>강점 정보를 불러오는 중...</Text>
        </View>
      )}
    </View>
  );

  const renderAchievements = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🏆 주요 성과</Text>
      {selfPromotion?.achievements && selfPromotion.achievements.length > 0 ? (
        selfPromotion.achievements.map((achievement, index) => (
          <View key={index} style={styles.achievementItem}>
            <View style={styles.achievementIcon}>
              <Feather name="award" size={16} color="#F59E0B" />
            </View>
            <Text style={styles.achievementText}>{achievement}</Text>
          </View>
        ))
      ) : (
        <View style={styles.emptyItem}>
          <Text style={styles.emptyText}>성과 정보를 불러오는 중...</Text>
        </View>
      )}
    </View>
  );

  const renderPersonality = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🌟 성격 특성</Text>
      <View style={styles.personalityCard}>
        <Text style={styles.personalityText}>{selfPromotion?.personality}</Text>
      </View>
    </View>
  );

  const renderRecommendations = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>💡 발전 방향</Text>
      {selfPromotion?.recommendations && selfPromotion.recommendations.length > 0 ? (
        selfPromotion.recommendations.map((recommendation, index) => (
          <View key={index} style={styles.recommendationItem}>
            <View style={styles.recommendationIcon}>
              <Feather name="lightbulb" size={16} color="#3B82F6" />
            </View>
            <Text style={styles.recommendationText}>{recommendation}</Text>
          </View>
        ))
      ) : (
        <View style={styles.emptyItem}>
          <Text style={styles.emptyText}>발전 방향을 분석하는 중...</Text>
        </View>
      )}
    </View>
  );

  const renderScore = () => (
    <View style={styles.scoreSection}>
      <View style={styles.scoreCard}>
        <Text style={styles.scoreTitle}>🎯 자기 어필 점수</Text>
        <Text style={styles.scoreValue}>{selfPromotion?.totalScore || 0}점</Text>
        <Text style={styles.scoreDescription}>
          크로니클 활동, 크레도 점수, 홀랜드 성향을 종합한 점수
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>AI가 자기 어필을 생성하고 있습니다...</Text>
            <Text style={styles.loadingSubtext}>잠시만 기다려주세요</Text>
          </View>
        </View>
      </Modal>
    );
  }

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
            colors={['#8B5CF6', '#7C3AED']}
            style={styles.modalHeader}
          >
            <View style={styles.headerContent}>
              <Text style={styles.modalTitle}>🎭 나 어필하기</Text>
              <Text style={styles.modalSubtitle}>
                AI가 분석한 나만의 강점과 성과
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color="white" />
            </TouchableOpacity>
          </LinearGradient>

          {/* 내용 */}
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {error ? (
              <View style={styles.errorContainer}>
                <Feather name="alert-circle" size={48} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={generateSelfPromotion}
                >
                  <Text style={styles.retryButtonText}>다시 시도</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* 캐릭터 정보 */}
                <View style={styles.section}>
                  {renderCharacterAvatar()}
                </View>

                {/* 자기 어필 점수 */}
                {renderScore()}

                {/* 자기 소개 */}
                {renderIntroduction()}

                {/* 강점 */}
                {renderStrengths()}

                {/* 주요 성과 */}
                {renderAchievements()}

                {/* 성격 특성 */}
                {renderPersonality()}

                {/* 발전 방향 */}
                {renderRecommendations()}

                {/* 하단 패딩 */}
                <View style={{ height: 20 }} />
              </>
            )}
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
  loadingContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    margin: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 20,
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  characterContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  characterAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  characterEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  characterLevel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  characterName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  scoreSection: {
    marginBottom: 24,
  },
  scoreCard: {
    backgroundColor: '#FEF3C7',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  scoreTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#F59E0B',
    marginBottom: 8,
  },
  scoreDescription: {
    fontSize: 14,
    color: '#92400E',
    textAlign: 'center',
    lineHeight: 20,
  },
  introductionCard: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#0EA5E9',
  },
  introductionText: {
    fontSize: 16,
    color: '#0C4A6E',
    lineHeight: 24,
    textAlign: 'center',
  },
  strengthItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  strengthIcon: {
    marginRight: 12,
  },
  strengthText: {
    fontSize: 14,
    color: '#166534',
    flex: 1,
    lineHeight: 20,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  achievementIcon: {
    marginRight: 12,
  },
  achievementText: {
    fontSize: 14,
    color: '#92400E',
    flex: 1,
    lineHeight: 20,
  },
  personalityCard: {
    backgroundColor: '#F3E8FF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C084FC',
  },
  personalityText: {
    fontSize: 14,
    color: '#581C87',
    lineHeight: 22,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  recommendationIcon: {
    marginRight: 12,
  },
  recommendationText: {
    fontSize: 14,
    color: '#1E40AF',
    flex: 1,
    lineHeight: 20,
  },
  emptyItem: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
});
