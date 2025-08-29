import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import hollandDatabaseService, { 
  HollandType, 
  HOLLAND_DESCRIPTIONS, 
  type FeedAnalysisResult 
} from '../services/hollandDatabaseService';

/**
 * 새로운 AI 피드 분석기 컴포넌트
 * Holland 데이터베이스를 사용하여 사용자 피드를 분석하고 경험치를 계산
 */
const NewAIFeedAnalyzer: React.FC = () => {
  const [feedText, setFeedText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<FeedAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [databaseStatus, setDatabaseStatus] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // 컴포넌트 마운트 시 Holland 데이터베이스 서비스 초기화
    initializeHollandService();
  }, []);

  const initializeHollandService = async () => {
    try {
      setIsInitializing(true);
      await hollandDatabaseService.initialize();
      const status = hollandDatabaseService.getDatabaseStatus();
      setDatabaseStatus(status);
      console.log('✅ Holland 데이터베이스 서비스 초기화 완료');
    } catch (error) {
      console.error('❌ Holland 데이터베이스 서비스 초기화 실패:', error);
      Alert.alert('오류', 'Holland 데이터베이스 초기화에 실패했습니다.');
    } finally {
      setIsInitializing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!feedText.trim()) {
      Alert.alert('알림', '분석할 피드 내용을 입력해주세요.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await hollandDatabaseService.analyzeFeed(feedText);
      setAnalysisResult(result);
      console.log('✅ 피드 분석 완료:', result);
    } catch (error) {
      console.error('❌ 피드 분석 실패:', error);
      Alert.alert('오류', '피드 분석 중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRebuildDatabase = async () => {
    try {
      setIsInitializing(true);
      await hollandDatabaseService.rebuildDatabase();
      const status = hollandDatabaseService.getDatabaseStatus();
      setDatabaseStatus(status);
      Alert.alert('성공', 'Holland 데이터베이스가 재구축되었습니다.');
    } catch (error) {
      console.error('❌ 데이터베이스 재구축 실패:', error);
      Alert.alert('오류', '데이터베이스 재구축에 실패했습니다.');
    } finally {
      setIsInitializing(false);
    }
  };

  const getHollandTypeColor = (type: HollandType): string => {
    return HOLLAND_DESCRIPTIONS[type].color;
  };

  const getHollandTypeGradient = (type: HollandType): string[] => {
    const baseColor = HOLLAND_DESCRIPTIONS[type].color;
    // 밝은 그라데이션 생성
    return [baseColor, `${baseColor}80`];
  };

  const renderHollandScoreBar = (type: HollandType, score: number, maxScore: number) => {
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
    const gradient = getHollandTypeGradient(type);

    return (
      <View key={type} style={styles.scoreBarContainer}>
        <View style={styles.scoreHeader}>
          <Text style={styles.scoreTypeName}>
            {HOLLAND_DESCRIPTIONS[type].name} ({type})
          </Text>
          <Text style={styles.scoreValue}>{score.toFixed(2)}</Text>
        </View>
        
        <View style={styles.progressBarContainer}>
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.progressBar,
              { width: `${percentage}%` }
            ]}
          />
        </View>
        
        <Text style={styles.scoreDescription}>
          {HOLLAND_DESCRIPTIONS[type].description}
        </Text>
      </View>
    );
  };

  const renderExperienceGains = () => {
    if (!analysisResult?.experienceGains) return null;

    return (
      <View style={styles.experienceContainer}>
        <Text style={styles.sectionTitle}>🎯 획득 경험치</Text>
        <View style={styles.experienceGrid}>
          {Object.entries(analysisResult.experienceGains).map(([type, exp]) => {
            const hollandType = type as HollandType;
            if (exp <= 0) return null;
            
            return (
              <View key={type} style={styles.experienceItem}>
                <View style={[
                  styles.experienceBadge,
                  { backgroundColor: getHollandTypeColor(hollandType) }
                ]}>
                  <Text style={styles.experienceType}>{type}</Text>
                </View>
                <Text style={styles.experienceValue}>+{exp} XP</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderMatchedQuestions = () => {
    if (!analysisResult?.matchedQuestions) return null;

    return (
      <View style={styles.matchedQuestionsContainer}>
        <Text style={styles.sectionTitle}>🔍 매칭된 문항</Text>
        {analysisResult.matchedQuestions.map((match, index) => (
          <View key={index} style={styles.questionItem}>
            <View style={styles.questionHeader}>
              <View style={[
                styles.questionTypeBadge,
                { backgroundColor: getHollandTypeColor(match.question.type) }
              ]}>
                <Text style={styles.questionTypeText}>
                  {match.question.type}
                </Text>
              </View>
              <Text style={styles.similarityScore}>
                유사도: {(match.similarity * 100).toFixed(1)}%
              </Text>
            </View>
            
            <Text style={styles.questionText}>{match.question.originalText}</Text>
            <Text style={styles.questionCategory}>
              카테고리: {match.question.category} | 신뢰도: {(match.question.confidence * 100).toFixed(0)}%
            </Text>
            
            {match.question.matchedKeywords.length > 0 && (
              <View style={styles.keywordsContainer}>
                <Text style={styles.keywordsLabel}>매칭된 키워드:</Text>
                <View style={styles.keywordsList}>
                  {match.question.matchedKeywords.map((keyword, idx) => (
                    <View key={idx} style={styles.keywordChip}>
                      <Text style={styles.keywordText}>{keyword}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderRecommendedSkills = () => {
    if (!analysisResult?.recommendedSkills) return null;

    return (
      <View style={styles.skillsContainer}>
        <Text style={styles.sectionTitle}>💡 추천 스킬</Text>
        <View style={styles.skillsGrid}>
          {analysisResult.recommendedSkills.map((skill, index) => (
            <View key={index} style={styles.skillChip}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Holland 데이터베이스 초기화 중...</Text>
        <Text style={styles.loadingSubtext}>커리어넷 API에서 문항을 로드하고 있습니다</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🧠 AI 피드 분석기 v2.0</Text>
        <Text style={styles.subtitle}>
          Holland 데이터베이스 기반 정확한 성향 분석
        </Text>
      </View>

      {/* 데이터베이스 상태 */}
      {databaseStatus && (
        <View style={styles.databaseStatus}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>📊 Holland 데이터베이스 상태</Text>
            <TouchableOpacity
              style={styles.rebuildButton}
              onPress={handleRebuildDatabase}
            >
              <Feather name="refresh-cw" size={16} color="#FFFFFF" />
              <Text style={styles.rebuildButtonText}>재구축</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.statusText}>
            총 {databaseStatus.totalQuestions}개 문항 | 
            마지막 업데이트: {databaseStatus.lastUpdated ? new Date(databaseStatus.lastUpdated).toLocaleDateString() : '없음'}
          </Text>
          
          <View style={styles.typeCounts}>
            {Object.entries(databaseStatus.types).map(([type, count]) => (
              <View key={type} style={styles.typeCount}>
                <Text style={styles.typeCountLabel}>{type}</Text>
                <Text style={styles.typeCountValue}>{count}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 피드 입력 */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>분석할 피드 내용을 입력하세요</Text>
        <TextInput
          style={styles.textInput}
          placeholder="예: 오늘 친구랑 고장난 노트북을 뜯어서 고쳤다. 정말 재미있었다!"
          value={feedText}
          onChangeText={setFeedText}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        
        <TouchableOpacity
          style={styles.analyzeButton}
          onPress={handleAnalyze}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
                              <Feather name="cpu" size={20} color="#FFFFFF" />
              <Text style={styles.analyzeButtonText}>AI 분석 시작</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* 분석 결과 */}
      {analysisResult && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>📈 분석 결과</Text>
          
          {/* Holland 점수 차트 */}
          <View style={styles.scoresContainer}>
            <Text style={styles.sectionTitle}>🎯 Holland 유형별 점수</Text>
            {Object.entries(analysisResult.hollandScores).map(([type, score]) => {
              const hollandType = type as HollandType;
              const maxScore = Math.max(...Object.values(analysisResult.hollandScores));
              return renderHollandScoreBar(hollandType, score, maxScore);
            })}
          </View>

          {/* 총점 */}
          <View style={styles.totalScoreContainer}>
            <Text style={styles.totalScoreLabel}>총점</Text>
            <Text style={styles.totalScoreValue}>
              {analysisResult.totalScore.toFixed(2)}
            </Text>
          </View>

          {/* 경험치 획득 */}
          {renderExperienceGains()}

          {/* 매칭된 문항들 */}
          {renderMatchedQuestions()}

          {/* 추천 스킬 */}
          {renderRecommendedSkills()}
        </View>
      )}

      {/* 사용 예시 */}
      <View style={styles.examplesContainer}>
        <Text style={styles.examplesTitle}>💡 분석 예시</Text>
        <View style={styles.exampleItem}>
          <Text style={styles.exampleText}>
            "팀 프로젝트에서 데이터를 분석하고 시각화해서 발표했다"
          </Text>
          <Text style={styles.exampleAnalysis}>
            → 탐구형(I) + 진취형(E) 유형과 높은 유사도
          </Text>
        </View>
        <View style={styles.exampleItem}>
          <Text style={styles.exampleText}>
            "고장난 물건을 직접 수리해서 정말 뿌듯했다"
          </Text>
          <Text style={styles.exampleAnalysis}>
            → 현실형(R) 유형과 높은 유사도
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  
  loadingText: {
    fontSize: 18,
    color: '#374151',
    marginTop: 16,
    textAlign: 'center',
  },
  
  loadingSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
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
  
  databaseStatus: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  
  rebuildButton: {
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  
  rebuildButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  
  statusText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  
  typeCounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  
  typeCount: {
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    minWidth: 50,
  },
  
  typeCountLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  
  typeCountValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  
  inputContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
  },
  
  analyzeButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  
  analyzeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  resultsContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 20,
  },
  
  scoresContainer: {
    marginBottom: 20,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  
  scoreBarContainer: {
    marginBottom: 16,
  },
  
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  scoreTypeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  
  scoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  
  progressBarContainer: {
    height: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  
  progressBar: {
    height: '100%',
    borderRadius: 6,
  },
  
  scoreDescription: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  
  totalScoreContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginBottom: 20,
  },
  
  totalScoreLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  
  totalScoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  
  experienceContainer: {
    marginBottom: 20,
  },
  
  experienceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  
  experienceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 8,
  },
  
  experienceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  experienceType: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  
  experienceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  
  matchedQuestionsContainer: {
    marginBottom: 20,
  },
  
  questionItem: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  questionTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  questionTypeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  
  similarityScore: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  
  questionText: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 22,
  },
  
  questionCategory: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  
  keywordsContainer: {
    marginTop: 8,
  },
  
  keywordsLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  
  keywordsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  
  keywordChip: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  
  keywordText: {
    color: '#1E40AF',
    fontSize: 10,
    fontWeight: '500',
  },
  
  skillsContainer: {
    marginBottom: 20,
  },
  
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  
  skillChip: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#93C5FD',
  },
  
  skillText: {
    color: '#1E40AF',
    fontSize: 14,
    fontWeight: '500',
  },
  
  examplesContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 32,
  },
  
  examplesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  
  exampleItem: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  
  exampleText: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  
  exampleAnalysis: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
  },
});

export default NewAIFeedAnalyzer;
