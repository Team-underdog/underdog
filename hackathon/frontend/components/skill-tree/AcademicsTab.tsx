import React from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import GameSkillTree from './GameSkillTree';
import { SkillNode } from './OptimizedSkillTree';

interface AcademicsTabProps {
  skills: SkillNode[];
}

const AcademicsTab: React.FC<AcademicsTabProps> = ({ skills }) => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.skillTreeContainer}>
        <Text style={styles.sectionTitle}>🎓 학사 스킬트리</Text>
        <GameSkillTree category="academics" />
      </View>
    </ScrollView>
  );
};

const getSkillCardStyle = (status: string) => {
  switch (status) {
    case 'locked':
      return { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0' };
    case 'unlockable':
      return { backgroundColor: '#fef3c7', borderColor: '#fbbf24' };
    case 'pending':
      return { backgroundColor: '#fef3c7', borderColor: '#f59e0b' };
    case 'acquired':
      return { backgroundColor: '#6366f1', borderColor: '#6366f1' };
    default:
      return { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0' };
  }
};

const getSkillTextStyle = (status: string) => {
  switch (status) {
    case 'locked':
      return { color: '#6b7280' };
    case 'unlockable':
      return { color: '#92400e' };
    case 'pending':
      return { color: '#92400e' };
    case 'acquired':
      return { color: 'white' };
    default:
      return { color: '#6b7280' };
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'locked':
      return '잠김';
    case 'unlockable':
      return '해금 가능';
    case 'pending':
      return '인증 대기중';
    case 'acquired':
      return '획득 완료';
    default:
      return '잠김';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  skillTreeContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  skillCard: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'relative',
  },
  skillIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  skillName: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  skillStatus: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  unlockBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fbbf24',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  unlockText: {
    fontSize: 12,
    color: 'white',
  },
  pendingBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f59e0b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  pendingText: {
    fontSize: 12,
    color: 'white',
  },
});

export default AcademicsTab;
