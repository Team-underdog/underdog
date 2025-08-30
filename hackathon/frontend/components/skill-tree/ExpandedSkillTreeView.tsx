import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import SkillTreeService, { 
  ExpandedSkillTree, 
  SkillTreeCategory, 
  SkillTreeTier 
} from '../../services/skillTreeService';

const { width } = Dimensions.get('window');

interface ExpandedSkillTreeViewProps {
  onSkillUnlock?: (skill: SkillTreeTier, rewards: any) => void;
}

const ExpandedSkillTreeView: React.FC<ExpandedSkillTreeViewProps> = ({ 
  onSkillUnlock 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'academic' | 'financial'>('academic');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('basicSkills');
  const [skillTree, setSkillTree] = useState<ExpandedSkillTree | null>(null);
  const [overallProgress, setOverallProgress] = useState({ academic: 0, financial: 0, total: 0 });

  const skillTreeService = SkillTreeService.getInstance();

  useEffect(() => {
    loadSkillTree();
  }, []);

  const loadSkillTree = () => {
    const tree = skillTreeService.getExpandedSkillTree();
    setSkillTree(tree);
    
    const progress = skillTreeService.getOverallProgress();
    setOverallProgress(progress);
  };

  const getCategoryIcon = (category: string): string => {
    const icons: { [key: string]: string } = {
      basicSkills: '📚',
      majorDeepening: '🎓',
      selfDirectedLearning: '🚀',
      consumptionSavings: '💰',
      investmentCredit: '📈',
      financialKnowledge: '🎓'
    };
    return icons[category] || '📋';
  };

  const getCategoryColor = (category: string): string => {
    const colors: { [key: string]: string } = {
      basicSkills: '#4CAF50',
      majorDeepening: '#2196F3',
      selfDirectedLearning: '#FF9800',
      consumptionSavings: '#9C27B0',
      investmentCredit: '#F44336',
      financialKnowledge: '#607D8B'
    };
    return colors[category] || '#757575';
  };

  const handleSkillPress = (skill: SkillTreeTier) => {
    if (!skill.isUnlocked) {
      const nextSkills = skillTreeService.getNextUnlockableSkills(selectedCategory, selectedSubCategory);
      const canUnlock = nextSkills.some(s => s.skillName === skill.skillName);
      
      if (canUnlock) {
        Alert.alert(
          '🔓 스킬 해금 가능!',
          `${skill.skillName}을 해금할 수 있습니다!\n\n` +
                     `진행도: ${skill.currentProgress}/${skill.maxProgress}\n` +
           `보상: 크레도 ${skill.rewards.credo}, 크레딧 ${skill.rewards.credits}`,
          [
            { text: '취소', style: 'cancel' },
            { 
              text: '진행도 업데이트', 
              onPress: () => updateSkillProgress(skill) 
            }
          ]
        );
      } else {
        Alert.alert(
          '🔒 스킬 잠김',
          `${skill.skillName}을 해금하려면 다음 스킬들을 먼저 완성해야 합니다:\n\n` +
          skill.dependencySkills.join(', '),
          [{ text: '확인', style: 'default' }]
        );
      }
    } else {
      const rewards = skillTreeService.getSkillRewards(selectedCategory, selectedSubCategory, skill.skillName);
      Alert.alert(
        '✅ 스킬 완성!',
        `${skill.skillName}이 완성되었습니다!\n\n` +
        `보상: 크레도 ${rewards?.credo}, 크레딧 ${rewards?.credits}`,
        [{ text: '확인', style: 'default' }]
      );
    }
  };

  const updateSkillProgress = (skill: SkillTreeTier) => {
    // 진행도를 최대치로 설정하여 스킬 해금
    const unlocked = skillTreeService.updateUserProgress(
      selectedCategory,
      selectedSubCategory,
      skill.skillName,
      skill.maxProgress
    );

    if (unlocked) {
      // 중앙 크레도 서비스에 보상 지급
      const rewards = skillTreeService.getSkillRewards(selectedCategory, selectedSubCategory, skill.skillName);
      if (rewards) {
        // 스킬 해금 시 크레도 지급
        skillTreeService.unlockSkillWithRewards(selectedCategory, selectedSubCategory, skill.skillName);
        
        if (onSkillUnlock) {
          onSkillUnlock(skill, rewards);
        }
      }
      
      Alert.alert(
        '🎉 스킬 해금!',
        `${skill.skillName}이 해금되었습니다!\n\n` +
        `보상: 크레도 ${rewards?.credo}, 크레딧 ${rewards?.credits}`,
        [{ text: '확인', style: 'default' }]
      );
      
      // 스킬트리 새로고침
      loadSkillTree();
    }
  };

  const renderSkillTier = (tier: SkillTreeTier, index: number) => {
    const progressPercentage = (tier.currentProgress / tier.maxProgress) * 100;
    const isUnlockable = skillTreeService.getNextUnlockableSkills(selectedCategory, selectedSubCategory)
      .some(s => s.skillName === tier.skillName);

    return (
      <TouchableOpacity
        key={tier.skillName}
        style={[
          styles.skillTier,
          tier.isUnlocked && styles.unlockedSkill,
          isUnlockable && !tier.isUnlocked && styles.unlockableSkill,
          !tier.isUnlocked && !isUnlockable && styles.lockedSkill
        ]}
        onPress={() => handleSkillPress(tier)}
        disabled={!tier.isUnlocked && !isUnlockable}
      >
        <View style={styles.tierHeader}>
          <Text style={styles.tierIcon}>{tier.icon}</Text>
          <View style={styles.tierInfo}>
            <Text style={[
              styles.tierName,
              tier.isUnlocked && styles.unlockedText
            ]}>
              {tier.skillName}
            </Text>
            <Text style={styles.tierLevel}>Tier {tier.tier}</Text>
          </View>
          <View style={styles.tierStatus}>
            {tier.isUnlocked ? (
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            ) : isUnlockable ? (
              <Ionicons name="lock-open" size={24} color="#FF9800" />
            ) : (
              <Ionicons name="lock-closed" size={24} color="#757575" />
            )}
          </View>
        </View>

        {/* 진행도 바 */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { 
                  width: `${progressPercentage}%`,
                  backgroundColor: tier.isUnlocked ? '#4CAF50' : '#FF9800'
                }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {tier.currentProgress}/{tier.maxProgress}
          </Text>
        </View>

        {/* 레벨업 조건 */}
        <View style={styles.conditionsContainer}>
          <Text style={styles.conditionsTitle}>레벨업 조건:</Text>
          {tier.levelUpConditions.map((condition, idx) => (
            <Text key={idx} style={styles.conditionText}>
              • {condition}
            </Text>
          ))}
        </View>

        {/* 의존 스킬 */}
        {tier.dependencySkills.length > 0 && (
          <View style={styles.dependencyContainer}>
            <Text style={styles.dependencyTitle}>의존 스킬:</Text>
            <Text style={styles.dependencyText}>
              {tier.dependencySkills.join(', ')}
            </Text>
          </View>
        )}

        {/* 보상 */}
        <View style={styles.rewardsContainer}>
          <Text style={styles.rewardsTitle}>보상:</Text>
          <View style={styles.rewardsList}>
            <Text style={styles.rewardText}>크레도 {tier.rewards.credo}</Text>
            <Text style={styles.rewardText}>크레딧 {tier.rewards.credits}</Text>
            {tier.rewards.title && (
              <Text style={styles.rewardTitle}>칭호: {tier.rewards.title}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSubCategory = (subCategory: string, data: SkillTreeCategory) => {
    const progress = skillTreeService.getUserProgress(selectedCategory, subCategory);
    
    return (
      <View key={subCategory} style={styles.subCategoryContainer}>
        <View style={styles.subCategoryHeader}>
          <Text style={styles.subCategoryIcon}>{data.icon}</Text>
          <View style={styles.subCategoryInfo}>
            <Text style={styles.subCategoryName}>{data.name}</Text>
            <Text style={styles.subCategoryDescription}>{data.description}</Text>
          </View>
          <View style={styles.subCategoryProgress}>
            <Text style={styles.progressPercentage}>{progress.percentage}%</Text>
            <Text style={styles.progressCount}>{progress.unlocked}/{progress.total}</Text>
          </View>
        </View>
        
        {data.tiers.map((tier, index) => renderSkillTier(tier, index))}
      </View>
    );
  };

  if (!skillTree) {
    return (
      <View style={styles.loadingContainer}>
        <Text>스킬트리 로딩 중...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>🎯 확장된 스킬트리</Text>
          <Text style={styles.subtitle}>학업과 금융 능력을 체계적으로 향상시키세요</Text>
        </View>

        {/* 전체 진행도 */}
        <View style={styles.overallProgressContainer}>
          <View style={styles.progressCard}>
            <Text style={styles.progressLabel}>전체 진행도</Text>
            <Text style={styles.progressValue}>{overallProgress.total}%</Text>
          </View>
          <View style={styles.progressCard}>
            <Text style={styles.progressLabel}>학업</Text>
            <Text style={styles.progressValue}>{overallProgress.academic}%</Text>
          </View>
          <View style={styles.progressCard}>
            <Text style={styles.progressLabel}>금융</Text>
            <Text style={styles.progressValue}>{overallProgress.financial}%</Text>
          </View>
        </View>

        {/* 카테고리 선택 */}
        <View style={styles.categorySelector}>
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === 'academic' && styles.selectedCategory
            ]}
            onPress={() => {
              setSelectedCategory('academic');
              setSelectedSubCategory('basicSkills');
            }}
          >
            <Text style={styles.categoryButtonText}>🎓 학업</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === 'financial' && styles.selectedCategory
            ]}
            onPress={() => {
              setSelectedCategory('financial');
              setSelectedSubCategory('consumptionSavings');
            }}
          >
            <Text style={styles.categoryButtonText}>💰 금융</Text>
          </TouchableOpacity>
        </View>

        {/* 서브카테고리 선택 */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.subCategorySelector}
        >
          {Object.entries(skillTree[selectedCategory]).map(([key, data]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.subCategoryButton,
                selectedSubCategory === key && styles.selectedSubCategory
              ]}
              onPress={() => setSelectedSubCategory(key)}
            >
              <Text style={styles.subCategoryButtonIcon}>{data.icon}</Text>
              <Text style={styles.subCategoryButtonText}>{data.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 스킬트리 내용 */}
        <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
          {renderSubCategory(selectedSubCategory, skillTree[selectedCategory][selectedSubCategory as keyof typeof skillTree[typeof selectedCategory]])}
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
  header: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
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
  overallProgressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  progressCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 80,
  },
  progressLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginBottom: 5,
  },
  progressValue: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  categorySelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoryButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  selectedCategory: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  categoryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  subCategorySelector: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  subCategoryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
    minWidth: 100,
  },
  selectedSubCategory: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  subCategoryButtonIcon: {
    fontSize: 20,
    marginBottom: 5,
  },
  subCategoryButtonText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  subCategoryContainer: {
    marginBottom: 30,
  },
  subCategoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  subCategoryIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  subCategoryInfo: {
    flex: 1,
  },
  subCategoryName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subCategoryDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  subCategoryProgress: {
    alignItems: 'center',
  },
  progressPercentage: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressCount: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  skillTier: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  unlockedSkill: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderColor: 'rgba(76, 175, 80, 0.5)',
  },
  unlockableSkill: {
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    borderColor: 'rgba(255, 152, 0, 0.5)',
  },
  lockedSkill: {
    backgroundColor: 'rgba(117, 117, 117, 0.2)',
    borderColor: 'rgba(117, 117, 117, 0.5)',
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  tierIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  tierInfo: {
    flex: 1,
  },
  tierName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  unlockedText: {
    color: '#4CAF50',
  },
  tierLevel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  tierStatus: {
    marginLeft: 10,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    marginRight: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    color: 'white',
    fontSize: 12,
    minWidth: 50,
    textAlign: 'right',
  },
  conditionsContainer: {
    marginBottom: 15,
  },
  conditionsTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  conditionText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginBottom: 3,
    paddingLeft: 10,
  },
  dependencyContainer: {
    marginBottom: 15,
  },
  dependencyTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  dependencyText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    paddingLeft: 10,
  },
  rewardsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 10,
    borderRadius: 8,
  },
  rewardsTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  rewardsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  rewardText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginRight: 15,
  },
  rewardTitle: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ExpandedSkillTreeView;
