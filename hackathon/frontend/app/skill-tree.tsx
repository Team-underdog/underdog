import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import OptimizedSkillTree from '../components/skill-tree/OptimizedSkillTree';
import { CampusCredoBottomNav } from '../components/CampusCredoBottomNav';

export default function SkillTreeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <OptimizedSkillTree />
      </View>
      <CampusCredoBottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
  },
});
