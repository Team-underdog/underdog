import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Alert, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Picker } from './ui/Picker';
import { Checkbox } from './ui/Checkbox';
import { ProgressIndicator } from './ProgressIndicator';
import { SocialLogin } from './SocialLogin';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  university: string;
  department: string;
  studentId: string;
  agreeToTerms: boolean;
  marketingEmails: boolean;
}

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

const steps = ['시작하기', '계정 생성', '개인 정보', '완료'];

const departmentOptions = [
  { label: '컴퓨터공학과', value: 'computer-science' },
  { label: '전자공학과', value: 'electrical' },
  { label: '기계공학과', value: 'mechanical' },
  { label: '경영학과', value: 'business' },
  { label: '경제학과', value: 'economics' },
  { label: '심리학과', value: 'psychology' },
  { label: '디자인학과', value: 'design' },
  { label: '예술학과', value: 'art' },
  { label: '교육학과', value: 'education' },
  { label: '기타', value: 'other' },
];

export function SignupForm({ onSwitchToLogin }: SignupFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    university: '',
    department: '',
    studentId: '',
    agreeToTerms: false,
    marketingEmails: false,
  });

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const updateFormData = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const animateTransition = (callback: () => void) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -20,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      callback();
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      animateTransition(() => setCurrentStep(currentStep + 1));
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      animateTransition(() => setCurrentStep(currentStep - 1));
    }
  };

  const handleSocialLogin = (provider: string) => {
    Alert.alert('안내', `${provider} 로그인은 데모에서 비활성화되었습니다.`);
  };

  const handleSubmit = () => {
    console.log('가입 완료:', formData);
    Alert.alert('성공', '회원가입이 완료되었습니다!', [
      { text: '확인', onPress: onSwitchToLogin }
    ]);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.textCenter}>
              <Text style={styles.title}>환영합니다!</Text>
              <Text style={styles.subtitle}>
                몇 분만 투자하여 계정을 만드세요
              </Text>
            </View>
            
            <SocialLogin
              onGoogleLogin={() => handleSocialLogin('Google')}
              onAppleLogin={() => handleSocialLogin('Apple')}
            />
            
            <Button onPress={nextStep} style={styles.fullWidthButton}>
              <View style={styles.buttonWithIcon}>
                <Text style={styles.buttonText}>이메일로 가입하기</Text>
                <Feather name="arrow-right" size={16} color="#fff" style={styles.buttonIcon} />
              </View>
            </Button>
            
            <View style={styles.textCenter}>
              <Text style={styles.footerText}>
                이미 계정이 있으신가요?{' '}
                <Text style={styles.linkText} onPress={onSwitchToLogin}>
                  로그인하기
                </Text>
              </Text>
            </View>
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.textCenter}>
              <Text style={styles.title}>계정 만들기</Text>
              <Text style={styles.subtitle}>
                이메일과 비밀번호를 입력하세요
              </Text>
            </View>
            
            <View style={styles.formContainer}>
              <Input
                label="이메일 주소"
                placeholder="your@email.com"
                value={formData.email}
                onChangeText={(text) => updateFormData('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={<Feather name="mail" size={18} color="#6b7280" />}
              />
              
              <Input
                label="비밀번호"
                placeholder="8자 이상 입력하세요"
                value={formData.password}
                onChangeText={(text) => updateFormData('password', text)}
                secureTextEntry={!showPassword}
                leftIcon={<Feather name="lock" size={18} color="#6b7280" />}
                rightIcon={
                  <Pressable onPress={() => setShowPassword(!showPassword)}>
                    <Feather
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={18}
                      color="#6b7280"
                    />
                  </Pressable>
                }
              />
              
              <Input
                label="비밀번호 확인"
                placeholder="비밀번호를 다시 입력하세요"
                value={formData.confirmPassword}
                onChangeText={(text) => updateFormData('confirmPassword', text)}
                secureTextEntry={!showConfirmPassword}
                leftIcon={<Feather name="lock" size={18} color="#6b7280" />}
                rightIcon={
                  <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <Feather
                      name={showConfirmPassword ? 'eye-off' : 'eye'}
                      size={18}
                      color="#6b7280"
                    />
                  </Pressable>
                }
              />
            </View>
            
            <View style={styles.buttonRow}>
              <Button variant="outline" onPress={prevStep} style={styles.halfButton}>
                <View style={styles.buttonWithIcon}>
                  <Feather name="arrow-left" size={16} color="#374151" style={styles.buttonIcon} />
                  <Text style={styles.outlineButtonText}>이전</Text>
                </View>
              </Button>
              <Button onPress={nextStep} style={styles.halfButton}>
                <View style={styles.buttonWithIcon}>
                  <Text style={styles.buttonText}>다음</Text>
                  <Feather name="arrow-right" size={16} color="#fff" style={styles.buttonIcon} />
                </View>
              </Button>
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.textCenter}>
              <Text style={styles.title}>개인 정보</Text>
              <Text style={styles.subtitle}>
                맞춤형 경험을 위해 정보를 입력하세요
              </Text>
            </View>
            
            <View style={styles.formContainer}>
              <View style={styles.nameRow}>
                <View style={styles.nameInputWrapper}>
                  <Input
                    label="성"
                    placeholder="성"
                    value={formData.lastName}
                    onChangeText={(text) => updateFormData('lastName', text)}
                    style={styles.nameInput}
                  />
                </View>
                <View style={styles.nameInputWrapper}>
                  <Input
                    label="이름"
                    placeholder="이름"
                    value={formData.firstName}
                    onChangeText={(text) => updateFormData('firstName', text)}
                    style={styles.nameInput}
                  />
                </View>
              </View>
              
              <Input
                label="학교명"
                placeholder="학교명을 입력하세요"
                value={formData.university}
                onChangeText={(text) => updateFormData('university', text)}
              />
              
              <Picker
                label="학과"
                placeholder="학과를 선택하세요"
                value={formData.department}
                onValueChange={(value) => updateFormData('department', value)}
                options={departmentOptions}
              />
              
              <Input
                label="학번"
                placeholder="학번을 입력하세요"
                value={formData.studentId}
                onChangeText={(text) => updateFormData('studentId', text)}
              />
            </View>
            
            <View style={styles.buttonRow}>
              <Button variant="outline" onPress={prevStep} style={styles.halfButton}>
                <View style={styles.buttonWithIcon}>
                  <Feather name="arrow-left" size={16} color="#374151" style={styles.buttonIcon} />
                  <Text style={styles.outlineButtonText}>이전</Text>
                </View>
              </Button>
              <Button onPress={nextStep} style={styles.halfButton}>
                <View style={styles.buttonWithIcon}>
                  <Text style={styles.buttonText}>다음</Text>
                  <Feather name="arrow-right" size={16} color="#fff" style={styles.buttonIcon} />
                </View>
              </Button>
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.textCenter}>
              <Text style={styles.title}>거의 완료되었습니다!</Text>
              <Text style={styles.subtitle}>
                약관에 동의하고 계정을 완성하세요
              </Text>
            </View>
            
            <View style={styles.formContainer}>
              <Checkbox
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) => updateFormData('agreeToTerms', checked)}
                label="이용약관과 개인정보처리방침에 동의합니다."
              />
              
              <Checkbox
                checked={formData.marketingEmails}
                onCheckedChange={(checked) => updateFormData('marketingEmails', checked)}
                label="마케팅 이메일 수신에 동의합니다. (선택)"
              />
            </View>
            
            <View style={styles.buttonRow}>
              <Button variant="outline" onPress={prevStep} style={styles.halfButton}>
                <View style={styles.buttonWithIcon}>
                  <Feather name="arrow-left" size={16} color="#374151" style={styles.buttonIcon} />
                  <Text style={styles.outlineButtonText}>이전</Text>
                </View>
              </Button>
              <Button 
                onPress={handleSubmit}
                style={styles.halfButton}
                disabled={!formData.agreeToTerms}
              >
                <Text style={styles.buttonText}>계정 만들기</Text>
              </Button>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ProgressIndicator 
        currentStep={currentStep} 
        totalSteps={steps.length} 
        steps={steps} 
      />
      
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {renderStepContent()}
      </Animated.View>
      
      {currentStep > 0 && (
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            이미 계정이 있으신가요?{' '}
            <Text style={styles.linkText} onPress={onSwitchToLogin}>
              로그인하기
            </Text>
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    paddingHorizontal: 8,
  },
  textCenter: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  formContainer: {
    marginBottom: 24,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  nameInputWrapper: {
    flex: 1,
  },
  nameInput: {
    marginBottom: 0,
  },
  halfInput: {
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfButton: {
    flex: 1,
  },
  fullWidthButton: {
    marginBottom: 24,
  },
  buttonWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  outlineButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  buttonIcon: {
    marginLeft: 8,
  },
  footerContainer: {
    alignItems: 'center',
    marginTop: 24,
    paddingBottom: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  linkText: {
    color: '#111827',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
