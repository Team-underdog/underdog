import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react';
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

  const updateFormData = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`${provider} 로그인 시도`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('가입 완료:', formData);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">환영합니다!</h1>
              <p className="text-gray-600">
                몇 분만 투자하여 계정을 만드세요
              </p>
            </div>
            
            <SocialLogin
              onGoogleLogin={() => handleSocialLogin('Google')}
              onAppleLogin={() => handleSocialLogin('Apple')}
            />
            
            <Button onClick={nextStep} className="w-full">
              이메일로 가입하기
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            <div className="text-center">
              <p className="text-gray-600">
                이미 계정이 있으신가요?{' '}
                <button 
                  className="text-gray-900 hover:underline font-medium"
                  onClick={onSwitchToLogin}
                >
                  로그인하기
                </button>
              </p>
            </div>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-gray-900">계정 만들기</h2>
              <p className="text-gray-600">
                이메일과 비밀번호를 입력하세요
              </p>
            </div>
            
            <div className="space-y-4">
              <Input
                label="이메일 주소"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
              />
              
              <Input
                label="비밀번호"
                type={showPassword ? 'text' : 'password'}
                placeholder="8자 이상 입력하세요"
                value={formData.password}
                onChange={(e) => updateFormData('password', e.target.value)}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />
              
              <Input
                label="비밀번호 확인"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="비밀번호를 다시 입력하세요"
                value={formData.confirmPassword}
                onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />
            </div>
            
            <div className="flex space-x-3">
              <Button variant="outline" onClick={prevStep} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" />
                이전
              </Button>
              <Button onClick={nextStep} className="flex-1">
                다음
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-gray-900">개인 정보</h2>
              <p className="text-gray-600">
                맞춤형 경험을 위해 정보를 입력하세요
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="성"
                  placeholder="성"
                  value={formData.lastName}
                  onChange={(e) => updateFormData('lastName', e.target.value)}
                />
                <Input
                  label="이름"
                  placeholder="이름"
                  value={formData.firstName}
                  onChange={(e) => updateFormData('firstName', e.target.value)}
                />
              </div>
              
              <Input
                label="학교명"
                placeholder="학교명을 입력하세요"
                value={formData.university}
                onChange={(e) => updateFormData('university', e.target.value)}
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
                onChange={(e) => updateFormData('studentId', e.target.value)}
              />
            </div>
            
            <div className="flex space-x-3">
              <Button variant="outline" onClick={prevStep} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" />
                이전
              </Button>
              <Button onClick={nextStep} className="flex-1">
                다음
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-gray-900">거의 완료되었습니다!</h2>
              <p className="text-gray-600">
                약관에 동의하고 계정을 완성하세요
              </p>
            </div>
            
            <div className="space-y-4">
              <Checkbox
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) => updateFormData('agreeToTerms', checked)}
                label="이용약관과 개인정보처리방침에 동의합니다."
                id="terms"
              />
              
              <Checkbox
                checked={formData.marketingEmails}
                onCheckedChange={(checked) => updateFormData('marketingEmails', checked)}
                label="마케팅 이메일 수신에 동의합니다. (선택)"
                id="marketing"
              />
            </div>
            
            <div className="flex space-x-3">
              <Button variant="outline" onClick={prevStep} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" />
                이전
              </Button>
              <Button 
                onClick={handleSubmit}
                className="flex-1"
                disabled={!formData.agreeToTerms}
              >
                계정 만들기
              </Button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      <ProgressIndicator currentStep={currentStep} totalSteps={steps.length} steps={steps} />
      
      <form onSubmit={handleSubmit}>
        <AnimatePresence mode="wait">
          {renderStepContent()}
        </AnimatePresence>
      </form>
      
      {currentStep > 0 && (
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            이미 계정이 있으신가요?{' '}
            <button 
              className="text-gray-900 hover:underline font-medium"
              onClick={onSwitchToLogin}
            >
              로그인하기
            </button>
          </p>
        </div>
      )}
    </div>
  );
}