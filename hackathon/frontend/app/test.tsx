import { View, Text } from 'react-native';

export default function TestScreen() {
  console.log('🧪 테스트 화면 렌더링');
  
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'red' }}>
      <Text style={{ fontSize: 24, color: 'white' }}>테스트 화면</Text>
      <Text style={{ fontSize: 16, color: 'white', marginTop: 10 }}>이 화면이 보이면 렌더링은 정상</Text>
    </View>
  );
}
