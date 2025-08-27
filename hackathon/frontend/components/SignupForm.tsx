import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Alert, Pressable, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { signUpWithEmail, verifySSAFYEmail } from '../services/authService';
import { router } from 'expo-router';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Picker } from './ui/Picker';
import { Checkbox } from './ui/Checkbox';
import { ProgressIndicator } from './ProgressIndicator';
import { SocialLogin } from './SocialLogin';

const apiBaseUrl: string = (Constants.expoConfig?.extra as any)?.apiBaseUrl || 'http://192.168.219.108:8000';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  university: string;
  college: string;
  department: string;
  studentId: string;
  agreeToTerms: boolean;
  marketingEmails: boolean;
}

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

const steps = ['시작하기', '계정 생성', '개인 정보', '완료'];

// 단과대학 목록
const collegeOptions = [
  { label: '인문대학', value: 'humanities' },
  { label: '사회과학대학', value: 'social-sciences' },
  { label: '자연과학대학', value: 'natural-sciences' },
  { label: '공과대학', value: 'engineering' },
  { label: '농업생명과학대학', value: 'agriculture' },
  { label: '경영대학', value: 'business' },
  { label: '의과대학', value: 'medicine' },
  { label: '치과대학', value: 'dentistry' },
  { label: '간호대학', value: 'nursing' },
  { label: '수의과대학', value: 'veterinary' },
  { label: '약학대학', value: 'pharmacy' },
  { label: '미술대학', value: 'fine-arts' },
  { label: '음악대학', value: 'music' },
  { label: '사범대학', value: 'education' },
  { label: '생활과학대학', value: 'human-ecology' },
  { label: '자유전공학부', value: 'liberal-studies' },
];

// 단과대학별 학과 매핑
const departmentsByCollege: { [key: string]: { label: string; value: string }[] } = {
  'humanities': [
    { label: '국어국문학과', value: 'korean-language-literature' },
    { label: '중어중문학과', value: 'chinese-language-literature' },
    { label: '영어영문학과', value: 'english-language-literature' },
    { label: '불어불문학과', value: 'french-language-literature' },
    { label: '독어독문학과', value: 'german-language-literature' },
    { label: '노어노문학과', value: 'russian-language-literature' },
    { label: '서어서문학과', value: 'spanish-language-literature' },
    { label: '언어학과', value: 'linguistics' },
    { label: '국사학과', value: 'korean-history' },
    { label: '동양사학과', value: 'asian-history' },
    { label: '서양사학과', value: 'western-history' },
    { label: '고고미술사학과', value: 'archaeology-art-history' },
    { label: '철학과', value: 'philosophy' },
    { label: '종교학과', value: 'religious-studies' },
    { label: '미학과', value: 'aesthetics' },
  ],
  'social-sciences': [
    { label: '정치외교학부', value: 'political-science-diplomacy' },
    { label: '경제학부', value: 'economics' },
    { label: '사회학과', value: 'sociology' },
    { label: '인류학과', value: 'anthropology' },
    { label: '심리학과', value: 'psychology' },
    { label: '지리학과', value: 'geography' },
    { label: '사회복지학과', value: 'social-welfare' },
    { label: '언론정보학과', value: 'communication' },
  ],
  'natural-sciences': [
    { label: '수학과', value: 'mathematics' },
    { label: '통계학과', value: 'statistics' },
    { label: '물리천문학부', value: 'physics-astronomy' },
    { label: '화학부', value: 'chemistry' },
    { label: '생명과학부', value: 'biological-sciences' },
    { label: '지구환경과학부', value: 'earth-environmental-sciences' },
  ],
  'engineering': [
    { label: '건설환경공학부', value: 'civil-environmental-engineering' },
    { label: '기계항공공학부', value: 'mechanical-aerospace-engineering' },
    { label: '재료공학부', value: 'materials-science-engineering' },
    { label: '전기정보공학부', value: 'electrical-computer-engineering' },
    { label: '컴퓨터공학부', value: 'computer-science-engineering' },
    { label: '화학생물공학부', value: 'chemical-biological-engineering' },
    { label: '건축학과', value: 'architecture' },
    { label: '산업공학과', value: 'industrial-engineering' },
    { label: '에너지자원공학과', value: 'energy-resources-engineering' },
    { label: '원자핵공학과', value: 'nuclear-engineering' },
    { label: '조선해양공학과', value: 'naval-architecture-ocean-engineering' },
  ],
  'agriculture': [
    { label: '식물생산과학부', value: 'plant-science' },
    { label: '산림과학부', value: 'forest-sciences' },
    { label: '응용생물화학부', value: 'applied-biology-chemistry' },
    { label: '식품동물생명공학부', value: 'food-animal-biotechnology' },
    { label: '응용생명공학부', value: 'applied-life-sciences' },
    { label: '바이오시스템공학과', value: 'biosystems-engineering' },
    { label: '조경지역시스템공학부', value: 'landscape-architecture-rural-systems-engineering' },
    { label: '농경제사회학부', value: 'agricultural-economics-rural-development' },
  ],
  'business': [
    { label: '경영학과', value: 'business-administration' },
  ],
  'medicine': [
    { label: '의학과', value: 'medicine' },
  ],
  'dentistry': [
    { label: '치의학과', value: 'dentistry' },
  ],
  'nursing': [
    { label: '간호학과', value: 'nursing' },
  ],
  'veterinary': [
    { label: '수의학과', value: 'veterinary-medicine' },
  ],
  'pharmacy': [
    { label: '약학과', value: 'pharmacy' },
  ],
  'fine-arts': [
    { label: '동양화과', value: 'oriental-painting' },
    { label: '서양화과', value: 'western-painting' },
    { label: '조소과', value: 'sculpture' },
    { label: '디자인학부', value: 'design' },
    { label: '미술이론과', value: 'art-theory' },
  ],
  'music': [
    { label: '성악과', value: 'voice' },
    { label: '기악과', value: 'instrumental-music' },
    { label: '작곡과', value: 'composition' },
    { label: '국악과', value: 'korean-music' },
  ],
  'education': [
    { label: '교육학과', value: 'education' },
    { label: '국어교육과', value: 'korean-education' },
    { label: '영어교육과', value: 'english-education' },
    { label: '독어교육과', value: 'german-education' },
    { label: '불어교육과', value: 'french-education' },
    { label: '사회교육과', value: 'social-studies-education' },
    { label: '역사교육과', value: 'history-education' },
    { label: '지리교육과', value: 'geography-education' },
    { label: '윤리교육과', value: 'ethics-education' },
    { label: '수학교육과', value: 'mathematics-education' },
    { label: '물리교육과', value: 'physics-education' },
    { label: '화학교육과', value: 'chemistry-education' },
    { label: '생물교육과', value: 'biology-education' },
    { label: '지구과학교육과', value: 'earth-science-education' },
    { label: '체육교육과', value: 'physical-education' },
  ],
  'human-ecology': [
    { label: '소비자아동학부', value: 'consumer-child-studies' },
    { label: '식품영양학과', value: 'food-nutrition' },
    { label: '의류학과', value: 'textiles-merchandising' },
  ],
  'liberal-studies': [
    { label: '자유전공학부', value: 'liberal-studies' },
  ],
};



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
    college: '',
    department: '',
    studentId: '',
    agreeToTerms: false,
    marketingEmails: false,
  });
  const [stepErrors, setStepErrors] = useState<{ [key: string]: string }>({});
  
  // 이메일 중복 확인 관련 상태
  const [emailCheckStatus, setEmailCheckStatus] = useState<'none' | 'checking' | 'available' | 'unavailable'>('none');
  const [emailCheckMessage, setEmailCheckMessage] = useState<string>('');
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const updateFormData = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // 단과대학이 변경되면 학과 선택 초기화
      if (field === 'college') {
        newData.department = '';
      }
      
      return newData;
    });
    
    // 이메일이 변경되면 중복 확인 상태 초기화
    if (field === 'email') {
      setEmailCheckStatus('none');
      setEmailCheckMessage('');
    }
    
    // 필드가 업데이트되면 해당 에러 제거
    if (stepErrors[field]) {
      setStepErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        // 단과대학 변경 시 학과 에러도 제거
        if (field === 'college') {
          delete newErrors.department;
        }
        return newErrors;
      });
    }
  };

  // SSAFY 학생 이메일 검증 함수 (개선된 버전)
  const checkEmailDuplicate = async () => {
    if (!formData.email || !isValidEmail(formData.email)) {
      Alert.alert('알림', '올바른 이메일 주소를 입력해주세요.');
      return;
    }

    setIsCheckingEmail(true);
    setEmailCheckStatus('checking');
    setEmailCheckMessage('SSAFY 학생 정보를 확인하는 중...');

    try {
      console.log('🔍 SSAFY API로 학생 이메일 검증 시작:', formData.email);
      
      // 새로운 authService 함수 사용
      const ssafyResult = await verifySSAFYEmail(formData.email);

      if (ssafyResult.is_valid_student) {
        setEmailCheckStatus('available');
        setEmailCheckMessage(`✅ SSAFY 학생 확인: ${ssafyResult.student_name} (${ssafyResult.university})`);
        
        // SSAFY 학생 정보를 폼 데이터에 자동 채우기
        setFormData(prev => ({
          ...prev,
          firstName: ssafyResult.student_name?.split(' ')[1] || ssafyResult.student_name || '',
          lastName: ssafyResult.student_name?.split(' ')[0] || '',
          university: ssafyResult.university || '',
          studentId: ssafyResult.student_id || '',
        }));
        
        console.log('✅ SSAFY 학생 정보 확인 완료:', ssafyResult);
      } else {
        // SSAFY API에서 학생이 아니라고 응답한 경우
        // 하지만 다양한 이메일 도메인을 사용할 수 있으므로 더 유연하게 처리
        const emailDomain = formData.email.split('@')[1];
        
        // 일반적인 SSAFY 관련 도메인들 (확장된 목록)
        const commonSsafyDomains = [
          // SSAFY 공식 도메인
          'ssafy.com', 'ssafy.co.kr', 'ssafy.io', 'ssafy.net',
          
          // 국내 주요 이메일 서비스
          'gmail.com', 'naver.com', 'daum.net', 'kakao.com',
          'nate.com', 'hanmail.net', 'empal.com', 'freechal.com',
          
          // 국제 이메일 서비스
          'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com',
          'protonmail.com', 'mail.com', 'aol.com',
          
          // 대학교/기관 도메인 (일반적인 패턴)
          'ac.kr', 'edu', 'university', 'college', 'school',
          
          // 기업 도메인 (일반적인 패턴)
          'co.kr', 'com', 'org', 'net', 'biz'
        ];
        
        if (commonSsafyDomains.some(domain => emailDomain.includes(domain))) {
          // 일반적인 도메인인 경우 - 사용자가 직접 입력하도록 허용
          setEmailCheckStatus('available');
          
          // 도메인별 구체적인 안내 메시지
          let domainMessage = '';
          if (emailDomain.includes('ssafy')) {
            domainMessage = 'SSAFY 공식 이메일입니다.';
          } else if (emailDomain.includes('gmail') || emailDomain.includes('naver') || emailDomain.includes('daum')) {
            domainMessage = '일반적인 이메일 서비스입니다.';
          } else if (emailDomain.includes('ac.kr') || emailDomain.includes('edu')) {
            domainMessage = '교육기관 이메일입니다.';
          } else {
            domainMessage = '일반적인 이메일 도메인입니다.';
          }
          
          setEmailCheckMessage(`✅ 이메일 도메인 확인: ${emailDomain}\n\n${domainMessage}\nSSAFY 학생이지만 API에서 확인되지 않았습니다.\n개인정보를 직접 입력하여 가입을 진행할 수 있습니다.`);
          
          // 기본값 설정 (사용자가 수정 가능)
          setFormData(prev => ({
            ...prev,
            university: 'SSAFY 대학교', // 기본값
            firstName: '',
            lastName: '',
            studentId: '',
          }));
        } else {
          // 알 수 없는 도메인인 경우
          setEmailCheckStatus('unavailable');
          setEmailCheckMessage(`❌ 지원하지 않는 이메일 도메인: ${emailDomain}\n\n일반적인 이메일 서비스(gmail, naver, daum 등)를 사용하거나\nSSAFY 공식 이메일을 사용해주세요.\n\n혹시 특별한 도메인을 사용하고 계시다면\n관리자에게 문의해주세요.`);
        }
      }
    } catch (error: any) {
      console.error('❌ SSAFY API 호출 실패:', error);
      
      // 에러 타입별 메시지 처리
      let errorMessage = '학생 정보 확인 중 오류가 발생했습니다.';
      
      if (error.message) {
        if (error.message.includes('E4002')) {
          errorMessage = '❌ 이미 SSAFY API에 등록된 이메일입니다. (이미 가입된 이메일)';
          setEmailCheckStatus('unavailable');
        } else if (error.message.includes('E4004')) {
          errorMessage = '❌ SSAFY API 키 오류. 관리자에게 문의하세요.';
          setEmailCheckStatus('none');
        } else if (error.message.includes('Q1001')) {
          errorMessage = '❌ SSAFY API 요청 형식 오류. 다시 시도해주세요.';
          setEmailCheckStatus('none');
        } else if (error.message.includes('network') || error.message.includes('timeout')) {
          // 네트워크 오류인 경우 - 사용자가 직접 입력하도록 허용
          const emailDomain = formData.email.split('@')[1];
          
          // 네트워크 오류 시에도 일반적인 도메인은 허용
          const commonDomains = [
            'gmail.com', 'naver.com', 'daum.net', 'kakao.com',
            'ssafy.com', 'ssafy.co.kr', 'outlook.com', 'hotmail.com'
          ];
          
          if (commonDomains.some(domain => emailDomain.includes(domain))) {
            errorMessage = `⚠️ 네트워크 오류로 SSAFY 학생 확인이 실패했습니다.\n\n이메일 도메인(${emailDomain})이 일반적인 서비스입니다.\n개인정보를 직접 입력하여 가입을 진행할 수 있습니다.`;
            setEmailCheckStatus('available');
          } else {
            errorMessage = `⚠️ 네트워크 오류로 SSAFY 학생 확인이 실패했습니다.\n\n일반적인 이메일 서비스(gmail, naver, daum 등)를 사용하거나\n잠시 후 다시 시도해주세요.`;
            setEmailCheckStatus('none');
          }
        } else {
          errorMessage = `❌ ${error.message}`;
          setEmailCheckStatus('none');
        }
      } else {
        setEmailCheckStatus('none');
      }
      
      setEmailCheckMessage(errorMessage);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // 이메일 유효성 검사
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 단계별 검증 함수
  const validateStep = (step: number): boolean => {
    const errors: { [key: string]: string } = {};
    
    switch (step) {
      case 0: // 시작 단계 (소셜 로그인 및 이메일 가입 선택)
        // 이 단계에서는 검증할 필드가 없음
        break;
        
      case 1: // 이메일 및 비밀번호 입력 단계
        if (!formData.email.trim()) {
          errors.email = '이메일을 입력해주세요.';
        } else if (!isValidEmail(formData.email)) {
          errors.email = '올바른 이메일 형식을 입력해주세요.';
        } else if (emailCheckStatus !== 'available') {
          errors.email = 'SSAFY 학생 이메일 중복 확인을 완료해주세요.';
        }
        
        if (!formData.password.trim()) {
          errors.password = '비밀번호를 입력해주세요.';
        } else if (formData.password.length < 8) {
          errors.password = '비밀번호는 8자 이상이어야 합니다.';
        }
        
        if (!formData.confirmPassword.trim()) {
          errors.confirmPassword = '비밀번호 확인을 입력해주세요.';
        } else if (formData.password !== formData.confirmPassword) {
          errors.confirmPassword = '비밀번호가 일치하지 않습니다.';
        }
        break;
        
      case 2: // 개인정보 단계
        if (!formData.firstName.trim()) {
          errors.firstName = '이름을 입력해주세요.';
        }
        if (!formData.lastName.trim()) {
          errors.lastName = '성을 입력해주세요.';
        }
        if (!formData.university.trim()) {
          errors.university = '대학교를 입력해주세요.';
        }
        if (!formData.college) {
          errors.college = '단과대학을 선택해주세요.';
        }
        if (!formData.department) {
          errors.department = '학과를 선택해주세요.';
        }
        if (!formData.studentId.trim()) {
          errors.studentId = '학번을 입력해주세요.';
        }
        break;
        
      case 3: // 약관 동의 단계
        if (!formData.agreeToTerms) {
          errors.agreeToTerms = '이용약관에 동의해주세요.';
        }
        break;
    }
    
    setStepErrors(errors);
    return Object.keys(errors).length === 0;
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
    // 현재 단계 검증
    if (!validateStep(currentStep)) {
      return; // 검증 실패시 다음 단계로 넘어가지 않음
    }
    
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

  const handleSubmit = async () => {
    // 최종 단계 검증
    if (!validateStep(currentStep)) {
      return; // 검증 실패시 제출하지 않음
    }
    
    try {
      // 백엔드 API 회원가입 (SSAFY API 연동 포함)
      console.log('🏭 백엔드 API 회원가입 시도:', formData.email);
      
      const displayName = `${formData.firstName} ${formData.lastName}`;
      
      // 새로운 signUpWithEmail 함수 사용 (SSAFY API 연동 포함)
      const user = await signUpWithEmail(
        formData.email,
        formData.password,
        displayName,
        formData.university,
        formData.department,
        parseInt(formData.studentId) || 1
      );
      
      console.log('🏭 백엔드 API 회원가입 성공:', user);
      
      // 백엔드 정보 저장
      await SecureStore.setItemAsync('authToken', user.id.toString());
      
      const userProfile = {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        firstName: formData.firstName,
        lastName: formData.lastName,
        university: formData.university,
        college: formData.college,
        department: formData.department,
        studentId: formData.studentId,
        isSsafyStudent: true,
        registeredAt: new Date().toISOString(),
        current_university: user.current_university,
        current_department: user.current_department,
        grade_level: user.grade_level,
        auth_method: 'backend'
      };
      
      await SecureStore.setItemAsync('userInfo', JSON.stringify(userProfile));
      
      Alert.alert(
        '🎉 회원가입 완료!',
        `${displayName}님, 환영합니다!\n\n✅ SSAFY 학생 계정이 성공적으로 생성되었습니다.\n✅ Campus Credo 앱 계정이 연결되었습니다.\n\n이제 로그인하여 서비스를 이용하실 수 있습니다.`,
        [
          {
            text: '로그인하기',
            onPress: () => {
              router.replace('/home');
            }
          }
        ]
      );
      
    } catch (error: any) {
      console.error('❌ 백엔드 API 회원가입 에러:', error);
      
      // 백엔드 API 에러 메시지 처리
      let errorMessage = '회원가입 중 오류가 발생했습니다.';
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Alert.alert('회원가입 실패', errorMessage);
    }
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
              <View style={styles.emailContainer}>
                <View style={styles.emailInputWrapper}>
                  <Input
                    label="이메일 주소"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChangeText={(text) => updateFormData('email', text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    leftIcon={<Feather name="mail" size={18} color="#6b7280" />}
                    error={stepErrors.email}
                    style={styles.emailInput}
                  />
                </View>
                <Pressable
                  style={[
                    styles.checkButton,
                    !formData.email || !isValidEmail(formData.email) || isCheckingEmail
                      ? styles.checkButtonDisabled
                      : emailCheckStatus === 'available'
                      ? styles.checkButtonSuccess
                      : emailCheckStatus === 'unavailable'
                      ? styles.checkButtonError
                      : styles.checkButtonDefault
                  ]}
                  onPress={checkEmailDuplicate}
                  disabled={!formData.email || !isValidEmail(formData.email) || isCheckingEmail}
                >
                  {isCheckingEmail ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      {emailCheckStatus === 'available' && (
                        <Feather name="check" size={16} color="#fff" />
                      )}
                      {emailCheckStatus === 'unavailable' && (
                        <Feather name="x" size={16} color="#fff" />
                      )}
                      {emailCheckStatus === 'none' && (
                        <Feather name="search" size={16} color="#fff" />
                      )}
                      {emailCheckStatus === 'checking' && (
                        <Feather name="loader" size={16} color="#fff" />
                      )}
                      <Text style={styles.checkButtonText}>
                        {emailCheckStatus === 'available' ? '확인완료' : 
                         emailCheckStatus === 'unavailable' ? '사용불가' :
                         isCheckingEmail ? '확인중...' : '중복확인'}
                      </Text>
                    </>
                  )}
                </Pressable>
              </View>
              
              {emailCheckMessage && (
                <View style={styles.emailCheckMessageContainer}>
                  <Text style={[
                    styles.emailCheckMessage,
                    emailCheckStatus === 'available' ? styles.emailCheckSuccess :
                    emailCheckStatus === 'unavailable' ? styles.emailCheckError :
                    styles.emailCheckDefault
                  ]}>
                    {emailCheckMessage}
                  </Text>
                  
                  {/* 추가 안내 메시지 */}
                  {emailCheckStatus === 'available' && (
                    <View style={styles.additionalInfoContainer}>
                      <Text style={[styles.emailCheckMessage, styles.emailCheckSuccess, { fontSize: 11, marginTop: 4 }]}>
                        ✅ 이제 회원가입을 진행할 수 있습니다.
                      </Text>
                      
                      {/* SSAFY API에서 확인되지 않은 경우 추가 안내 */}
                      {emailCheckMessage.includes('API에서 확인되지 않았습니다') && (
                        <Text style={[styles.emailCheckMessage, styles.emailCheckDefault, { fontSize: 10, marginTop: 2, fontStyle: 'italic' }]}>
                          💡 개인정보를 직접 입력하여 가입을 완료하세요.
                        </Text>
                      )}
                    </View>
                  )}
                  
                  {emailCheckStatus === 'unavailable' && (
                    <View style={styles.additionalInfoContainer}>
                      <Text style={[styles.emailCheckMessage, styles.emailCheckError, { fontSize: 11, marginTop: 4 }]}>
                        ❌ 다른 SSAFY 학생 이메일을 사용하거나 관리자에게 문의하세요.
                      </Text>
                      
                      {/* 지원 도메인 안내 */}
                      <Text style={[styles.emailCheckMessage, styles.emailCheckDefault, { fontSize: 10, marginTop: 2, fontStyle: 'italic' }]}>
                        💡 지원 도메인: gmail, naver, daum, kakao, ssafy.com 등
                      </Text>
                    </View>
                  )}
                </View>
              )}
              
              <Input
                label="비밀번호"
                placeholder="8자 이상 입력하세요"
                value={formData.password}
                onChangeText={(text) => updateFormData('password', text)}
                secureTextEntry={!showPassword}
                autoComplete="off"
                passwordRules=""
                textContentType="none"
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
                error={stepErrors.password}
              />
              
              <Input
                label="비밀번호 확인"
                placeholder="비밀번호를 다시 입력하세요"
                value={formData.confirmPassword}
                onChangeText={(text) => updateFormData('confirmPassword', text)}
                secureTextEntry={!showConfirmPassword}
                autoComplete="off"
                passwordRules=""
                textContentType="none"
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
                error={stepErrors.confirmPassword}
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
                    error={stepErrors.lastName}
                  />
                </View>
                <View style={styles.nameInputWrapper}>
                  <Input
                    label="이름"
                    placeholder="이름"
                    value={formData.firstName}
                    onChangeText={(text) => updateFormData('firstName', text)}
                    style={styles.nameInput}
                    error={stepErrors.firstName}
                  />
                </View>
              </View>
              
              <Input
                label="학교명"
                placeholder="학교명을 입력하세요"
                value={formData.university}
                onChangeText={(text) => updateFormData('university', text)}
                error={stepErrors.university}
              />
              
              <Picker
                label="단과대학"
                placeholder="단과대학을 선택하세요"
                value={formData.college}
                onValueChange={(value) => updateFormData('college', value)}
                options={collegeOptions}
                error={stepErrors.college}
              />
              
              <Picker
                label="학과"
                placeholder={formData.college ? "학과를 선택하세요" : "먼저 단과대학을 선택하세요"}
                value={formData.department}
                onValueChange={(value) => updateFormData('department', value)}
                options={formData.college ? (departmentsByCollege[formData.college] || []) : []}
                error={stepErrors.department}
              />
              
              <Input
                label="학번"
                placeholder="학번을 입력하세요"
                value={formData.studentId}
                onChangeText={(text) => updateFormData('studentId', text)}
                error={stepErrors.studentId}
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
              {stepErrors.agreeToTerms && (
                <Text style={styles.errorText}>{stepErrors.agreeToTerms}</Text>
              )}
              
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
  errorText: {
    color: '#dc2626',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  // 이메일 중복 확인 관련 스타일
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  emailInputWrapper: {
    flex: 1,
    marginRight: 12,
  },
  emailInput: {
    marginBottom: 0,
  },
  checkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 90,
    height: 44,
    marginTop: 28, // 라벨 높이만큼 오프셋
  },
  checkButtonDefault: {
    backgroundColor: '#3b82f6',
  },
  checkButtonSuccess: {
    backgroundColor: '#10b981',
  },
  checkButtonError: {
    backgroundColor: '#ef4444',
  },
  checkButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  checkButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  emailCheckMessageContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  emailCheckMessage: {
    fontSize: 12,
    textAlign: 'left',
  },
  emailCheckSuccess: {
    color: '#10b981',
  },
  emailCheckError: {
    color: '#ef4444',
  },
  emailCheckDefault: {
    color: '#6b7280',
  },
  additionalInfoContainer: {
    marginTop: 4,
  },
});
