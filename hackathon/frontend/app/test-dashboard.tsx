import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import MainDashboard from '../components/dashboard/MainDashboard';

export default function TestDashboard() {
  const handleNavigateToSkillTree = () => {
    console.log('스킬 트리로 이동');
  };

  const handleNavigateToChronicle = () => {
    console.log('크로니클로 이동');
  };

  const handleNavigateToQuests = () => {
    console.log('퀘스트로 이동');
  };

  const handleNavigateToProfile = () => {
    console.log('프로필로 이동');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎮 Campus Chronicle</Text>
        <Text style={styles.headerSubtitle}>새로운 UI 컴포넌트 테스트</Text>
      </View>
      
      <MainDashboard
        onNavigateToSkillTree={handleNavigateToSkillTree}
        onNavigateToChronicle={handleNavigateToChronicle}
        onNavigateToQuests={handleNavigateToQuests}
        onNavigateToProfile={handleNavigateToProfile}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#3B82F6',
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});
