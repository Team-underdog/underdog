import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

export default function TestHomeScreen() {
  console.log('🧪 테스트 홈화면 렌더링');
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>테스트 홈화면</Text>
        <Text style={styles.subtitle}>이 화면이 보이면 기본 렌더링은 정상입니다</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
