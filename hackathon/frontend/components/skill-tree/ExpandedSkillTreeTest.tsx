import React, { useState } from 'react';
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
import ExpandedSkillTreeView from './ExpandedSkillTreeView';
import SkillTreeService, { SkillTreeTier } from '../../services/skillTreeService';

const ExpandedSkillTreeTest: React.FC = () => {
  const [showSkillTree, setShowSkillTree] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [currentTest, setCurrentTest] = useState<string>('');

  const skillTreeService = SkillTreeService.getInstance();

  // 테스트 실행
  const runTest = (testName: string, testFunction: () => void) => {
    setCurrentTest(testName);
    try {
      testFunction();
      addResult(`✅ ${testName} 테스트 성공`);
    } catch (error) {
      addResult(`❌ ${testName} 테스트 실패: ${error}`);
    }
    setCurrentTest('');
  };

  // 결과 추가
  const addResult = (result: string) => {
    setTestResults(prev => [result, ...prev]);
  };

  // 1. 스킬트리 데이터 로드 테스트
  const testSkillTreeDataLoad = () => {
    const tree = skillTreeService.getExpandedSkillTree();
    if (!tree) throw new Error('스킬트리 데이터를 불러올 수 없습니다');
    
    // 학업 카테고리 확인
    if (!tree.academic.basicSkills) throw new Error('학업 기초 스킬 데이터 누락');
    if (!tree.academic.majorDeepening) throw new Error('학업 전공 심화 데이터 누락');
    if (!tree.academic.selfDirectedLearning) throw new Error('학업 자기주도 학습 데이터 누락');
    
    // 금융 카테고리 확인
    if (!tree.financial.consumptionSavings) throw new Error('금융 소비/저축 데이터 누락');
    if (!tree.financial.investmentCredit) throw new Error('금융 투자/신용 데이터 누락');
    if (!tree.financial.financialKnowledge) throw new Error('금융 지식 데이터 누락');
    
    addResult(`📊 총 ${Object.keys(tree.academic).length}개 학업 서브카테고리`);
    addResult(`💰 총 ${Object.keys(tree.financial).length}개 금융 서브카테고리`);
  };

  // 2. 스킬 진행도 테스트
  const testSkillProgress = () => {
    // 학업 기초 스킬 진행도 테스트
    const basicSkillsProgress = skillTreeService.getUserProgress('academic', 'basicSkills');
    addResult(`📚 기초 학업: ${basicSkillsProgress.unlocked}/${basicSkillsProgress.total} (${basicSkillsProgress.percentage}%)`);
    
    // 금융 소비/저축 진행도 테스트
    const consumptionProgress = skillTreeService.getUserProgress('financial', 'consumptionSavings');
    addResult(`💰 소비/저축: ${consumptionProgress.unlocked}/${consumptionProgress.total} (${consumptionProgress.percentage}%)`);
    
    // 전체 진행도 테스트
    const overallProgress = skillTreeService.getOverallProgress();
    addResult(`🎯 전체 진행도: 학업 ${overallProgress.academic}%, 금융 ${overallProgress.financial}%, 총 ${overallProgress.total}%`);
  };

  // 3. 스킬 해금 테스트
  const testSkillUnlock = () => {
    // 출석 마스터 스킬 진행도 업데이트 (Tier 1)
    const unlocked = skillTreeService.updateUserProgress('academic', 'basicSkills', '출석 마스터', 30);
    if (unlocked) {
      addResult('🔓 출석 마스터 스킬 해금 성공!');
      
      // 의존 스킬 해금 확인
      const nextSkills = skillTreeService.getNextUnlockableSkills('academic', 'basicSkills');
      addResult(`🔓 다음 해금 가능한 스킬: ${nextSkills.map(s => s.skillName).join(', ')}`);
    } else {
      addResult('⚠️ 출석 마스터 스킬 해금 실패');
    }
  };

  // 4. 의존 스킬 체인 테스트
  const testDependencyChain = () => {
    // 출석 마스터 -> 시간 관리 -> 과제 전문가 체인 테스트
    addResult('🔗 의존 스킬 체인 테스트 시작...');
    
    // 1단계: 출석 마스터 완성
    skillTreeService.updateUserProgress('academic', 'basicSkills', '출석 마스터', 30);
    addResult('✅ 1단계: 출석 마스터 완성');
    
    // 2단계: 시간 관리 완성
    skillTreeService.updateUserProgress('academic', 'basicSkills', '시간 관리', 5);
    addResult('✅ 2단계: 시간 관리 완성');
    
    // 3단계: 과제 전문가 완성
    skillTreeService.updateUserProgress('academic', 'basicSkills', '과제 전문가', 3);
    addResult('✅ 3단계: 과제 전문가 완성');
    
    // 체인 완성 확인
    const basicSkillsProgress = skillTreeService.getUserProgress('academic', 'basicSkills');
    addResult(`🔗 의존 체인 완성: ${basicSkillsProgress.unlocked}/${basicSkillsProgress.total} 스킬 해금`);
  };

  // 5. 보상 시스템 테스트
  const testRewardSystem = () => {
    const rewards = skillTreeService.getSkillRewards('academic', 'basicSkills', '출석 마스터');
    if (rewards) {
      addResult(`🎁 출석 마스터 보상: 크레도 ${rewards.credo}, 크레딧 ${rewards.credits}`);
      if (rewards.title) {
        addResult(`🏆 칭호 획득: ${rewards.title}`);
      }
    } else {
      addResult('❌ 보상 정보를 찾을 수 없습니다');
    }
  };

  // 6. 시각화 데이터 테스트
  const testVisualizationData = () => {
    const visualization = skillTreeService.getSkillTreeVisualization('academic', 'basicSkills');
    addResult(`📊 시각화 노드: ${visualization.nodes.length}개`);
    addResult(`🔗 시각화 연결: ${visualization.edges.length}개`);
    
    // 노드 상태 확인
    const unlockedNodes = visualization.nodes.filter(node => node.isUnlocked).length;
    const lockedNodes = visualization.nodes.filter(node => !node.isUnlocked).length;
    addResult(`🔓 해금된 노드: ${unlockedNodes}개, 🔒 잠긴 노드: ${lockedNodes}개`);
  };

  // 7. 모든 테스트 실행
  const runAllTests = () => {
    addResult('🚀 모든 테스트 시작...');
    
    const tests = [
      { name: '스킬트리 데이터 로드', func: testSkillTreeDataLoad },
      { name: '스킬 진행도', func: testSkillProgress },
      { name: '스킬 해금', func: testSkillUnlock },
      { name: '의존 스킬 체인', func: testDependencyChain },
      { name: '보상 시스템', func: testRewardSystem },
      { name: '시각화 데이터', func: testVisualizationData },
    ];
    
    tests.forEach((test, index) => {
      setTimeout(() => {
        runTest(test.name, test.func);
      }, index * 500);
    });
  };

  // 결과 초기화
  const clearResults = () => {
    setTestResults([]);
  };

  // 스킬 해금 콜백
  const handleSkillUnlock = (skill: SkillTreeTier, rewards: any) => {
    addResult(`🎉 스킬 해금 콜백: ${skill.skillName} - 크레도 ${rewards.credo}, 크레딧 ${rewards.credits}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView}>
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={styles.title}>🧪 확장된 스킬트리 테스트</Text>
            <Text style={styles.subtitle}>확장된 스킬트리 시스템을 테스트해보세요</Text>
          </View>

          {/* 테스트 버튼들 */}
          <View style={styles.testSection}>
            <Text style={styles.sectionTitle}>🧪 개별 테스트</Text>
            
            <TouchableOpacity
              style={styles.testButton}
              onPress={() => runTest('스킬트리 데이터 로드', testSkillTreeDataLoad)}
              disabled={!!currentTest}
            >
              <Ionicons name="database" size={20} color="white" />
              <Text style={styles.buttonText}>데이터 로드 테스트</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.testButton}
              onPress={() => runTest('스킬 진행도', testSkillProgress)}
              disabled={!!currentTest}
            >
              <Ionicons name="analytics" size={20} color="white" />
              <Text style={styles.buttonText}>진행도 테스트</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.testButton}
              onPress={() => runTest('스킬 해금', testSkillUnlock)}
              disabled={!!currentTest}
            >
              <Ionicons name="unlock" size={20} color="white" />
              <Text style={styles.buttonText}>스킬 해금 테스트</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.testButton}
              onPress={() => runTest('의존 스킬 체인', testDependencyChain)}
              disabled={!!currentTest}
            >
              <Ionicons name="link" size={20} color="white" />
              <Text style={styles.buttonText}>의존 체인 테스트</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.testButton}
              onPress={() => runTest('보상 시스템', testRewardSystem)}
              disabled={!!currentTest}
            >
              <Ionicons name="gift" size={20} color="white" />
              <Text style={styles.buttonText}>보상 시스템 테스트</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.testButton}
              onPress={() => runTest('시각화 데이터', testVisualizationData)}
              disabled={!!currentTest}
            >
              <Ionicons name="eye" size={20} color="white" />
              <Text style={styles.buttonText}>시각화 데이터 테스트</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.testButton, styles.primaryButton]}
              onPress={runAllTests}
              disabled={!!currentTest}
            >
              <Ionicons name="rocket" size={20} color="white" />
              <Text style={styles.buttonText}>모든 테스트 실행</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.testButton, styles.clearButton]}
              onPress={clearResults}
              disabled={!!currentTest}
            >
              <Ionicons name="trash" size={20} color="white" />
              <Text style={styles.buttonText}>결과 초기화</Text>
            </TouchableOpacity>
          </View>

          {/* 스킬트리 보기 버튼 */}
          <View style={styles.skillTreeSection}>
            <Text style={styles.sectionTitle}>🎯 스킬트리 보기</Text>
            
            <TouchableOpacity
              style={[styles.testButton, styles.skillTreeButton]}
              onPress={() => setShowSkillTree(!showSkillTree)}
            >
              <Ionicons name="eye" size={20} color="white" />
              <Text style={styles.buttonText}>
                {showSkillTree ? '스킬트리 숨기기' : '확장된 스킬트리 보기'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 현재 테스트 상태 */}
          {currentTest && (
            <View style={styles.currentTestSection}>
              <Text style={styles.currentTestText}>
                🔄 {currentTest} 실행 중...
              </Text>
            </View>
          )}

          {/* 테스트 결과 */}
          {testResults.length > 0 && (
            <View style={styles.resultsSection}>
              <Text style={styles.sectionTitle}>📊 테스트 결과</Text>
              {testResults.map((result, index) => (
                <View key={index} style={styles.resultItem}>
                  <Text style={styles.resultText}>{result}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* 확장된 스킬트리 뷰 */}
        {showSkillTree && (
          <View style={styles.skillTreeOverlay}>
            <ExpandedSkillTreeView onSkillUnlock={handleSkillUnlock} />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowSkillTree(false)}
            >
              <Ionicons name="close-circle" size={40} color="white" />
            </TouchableOpacity>
          </View>
        )}
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
  testSection: {
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
  primaryButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.8)',
    borderColor: 'rgba(255, 107, 107, 0.5)',
  },
  clearButton: {
    backgroundColor: 'rgba(255, 71, 87, 0.8)',
    borderColor: 'rgba(255, 71, 87, 0.5)',
  },
  skillTreeButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
    borderColor: 'rgba(76, 175, 80, 0.5)',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  skillTreeSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  currentTestSection: {
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  currentTestText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  resultItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  resultText: {
    color: 'white',
    fontSize: 14,
    lineHeight: 20,
  },
  skillTreeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    zIndex: 1000,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1001,
  },
});

export default ExpandedSkillTreeTest;
