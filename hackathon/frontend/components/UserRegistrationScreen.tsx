import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import userRegistrationService from '../services/userRegistrationService';
import { UserRegistrationData } from '../services/userRegistrationService';

interface UserRegistrationScreenProps {
  navigation: any;
}

const UserRegistrationScreen: React.FC<UserRegistrationScreenProps> = ({ navigation }) => {
  const [formData, setFormData] = useState<UserRegistrationData>({
    email: '',
    password: '',
    name: '',
    student_id: '',
    university: '',
    preferred_bank: '001',
  });

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedBank, setSelectedBank] = useState('001');

  const banks = [
    { code: '001', name: '한국은행' },
    { code: '002', name: '산업은행' },
    { code: '003', name: '기업은행' },
    { code: '004', name: '국민은행' },
    { code: '005', name: '하나은행' },
    { code: '006', name: '신한은행' },
    { code: '007', name: '우리은행' },
    { code: '008', name: '농협은행' },
    { code: '009', name: '수협은행' },
    { code: '010', name: '새마을금고' },
  ];

  const handleInputChange = (field: keyof UserRegistrationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.email || !formData.password || !formData.name) {
      Alert.alert('입력 오류', '필수 항목을 모두 입력해주세요.');
      return false;
    }

    if (formData.password.length < 6) {
      Alert.alert('입력 오류', '비밀번호는 6자 이상이어야 합니다.');
      return false;
    }

    if (formData.email && !formData.email.includes('@')) {
      Alert.alert('입력 오류', '올바른 이메일 형식을 입력해주세요.');
      return false;
    }

    return true;
  };

  const handleRegistration = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await userRegistrationService.registerWithAccount({
        ...formData,
        preferred_bank: selectedBank,
      });

      if (result.success) {
        Alert.alert(
          '🎉 회원가입 완료!',
          `환영합니다, ${result.user_name}님!\n\n` +
          `계좌번호: ${result.account_no}\n` +
          `은행: ${result.bank_name}\n` +
          `환영 금액: ${result.welcome_amount.toLocaleString()}원\n\n` +
          `${result.message}`,
          [
            {
              text: '홈으로 이동',
              onPress: () => navigation.navigate('Home'),
            },
          ]
        );
      } else {
        Alert.alert('회원가입 실패', result.message || '회원가입 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('회원가입 오류:', error);
      Alert.alert('오류', '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>기본 정보 입력</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>이름 *</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(value) => handleInputChange('name', value)}
          placeholder="실명을 입력하세요"
          autoCapitalize="words"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>이메일 *</Text>
        <TextInput
          style={styles.input}
          value={formData.email}
          onChangeText={(value) => handleInputChange('email', value)}
          placeholder="example@ssafy.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>비밀번호 *</Text>
        <TextInput
          style={styles.input}
          value={formData.password}
          onChangeText={(value) => handleInputChange('password', value)}
          placeholder="6자 이상 입력하세요"
          secureTextEntry
        />
      </View>

      <TouchableOpacity
        style={[styles.button, styles.primaryButton]}
        onPress={() => setStep(2)}
        disabled={!formData.name || !formData.email || !formData.password}
      >
        <Text style={styles.buttonText}>다음 단계</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>학생 정보 입력</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>학번</Text>
        <TextInput
          style={styles.input}
          value={formData.student_id}
          onChangeText={(value) => handleInputChange('student_id', value)}
          placeholder="학번을 입력하세요 (선택사항)"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>대학교</Text>
        <TextInput
          style={styles.input}
          value={formData.university}
          onChangeText={(value) => handleInputChange('university', value)}
          placeholder="대학교명을 입력하세요 (선택사항)"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>선호 은행</Text>
        <View style={styles.bankGrid}>
          {banks.map((bank) => (
            <TouchableOpacity
              key={bank.code}
              style={[
                styles.bankOption,
                selectedBank === bank.code && styles.bankOptionSelected,
              ]}
              onPress={() => setSelectedBank(bank.code)}
            >
              <Text
                style={[
                  styles.bankOptionText,
                  selectedBank === bank.code && styles.bankOptionTextSelected,
                ]}
              >
                {bank.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => setStep(1)}
        >
          <Text style={styles.buttonText}>이전 단계</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => setStep(3)}
        >
          <Text style={styles.buttonText}>다음 단계</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>최종 확인</Text>
      
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>입력하신 정보를 확인해주세요</Text>
        
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>이름:</Text>
          <Text style={styles.summaryValue}>{formData.name}</Text>
        </View>
        
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>이메일:</Text>
          <Text style={styles.summaryValue}>{formData.email}</Text>
        </View>
        
        {formData.student_id && (
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>학번:</Text>
            <Text style={styles.summaryValue}>{formData.student_id}</Text>
          </View>
        )}
        
        {formData.university && (
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>대학교:</Text>
            <Text style={styles.summaryValue}>{formData.university}</Text>
          </View>
        )}
        
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>선호 은행:</Text>
          <Text style={styles.summaryValue}>
            {banks.find(b => b.code === selectedBank)?.name}
          </Text>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => setStep(2)}
        >
          <Text style={styles.buttonText}>이전 단계</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleRegistration}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>회원가입 완료</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${(step / 3) * 100}%` },
          ]}
        />
      </View>
      <Text style={styles.progressText}>{step} / 3</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Campus Credo</Text>
          <Text style={styles.subtitle}>회원가입 및 계좌 생성</Text>
        </View>

        {renderProgressBar()}

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            이미 계정이 있으신가요?{' '}
            <Text
              style={styles.linkText}
              onPress={() => navigation.navigate('Login')}
            >
              로그인하기
            </Text>
          </Text>
        </View>
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
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    marginRight: 15,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  progressText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepContainer: {
    paddingVertical: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },
  bankGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  bankOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    width: '48%',
    alignItems: 'center',
  },
  bankOptionSelected: {
    backgroundColor: '#fff',
  },
  bankOptionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  bankOptionTextSelected: {
    color: '#667eea',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  primaryButton: {
    backgroundColor: '#fff',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
  },
  summaryContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  summaryLabel: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  summaryValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#fff',
    fontSize: 14,
  },
  linkText: {
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});

export default UserRegistrationScreen;
