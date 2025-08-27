import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { SocialLogin } from './SocialLogin';

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

export function LoginForm({ onSwitchToSignup }: LoginFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // 로그인 로직 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('로그인 시도:', formData);
    setIsLoading(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full space-y-6"
    >
      {/* 헤더 */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">환영합니다!</h1>
        <p className="text-gray-600">
          계정에 로그인하여 캠퍼스 크로니클을 시작하세요
        </p>
      </div>

      {/* 소셜 로그인 */}
      <SocialLogin />

      {/* 로그인 폼 */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="이메일"
          type="email"
          placeholder="name@example.com"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          leftIcon={<Mail className="h-4 w-4" />}
          required
        />

        <Input
          label="비밀번호"
          type={showPassword ? 'text' : 'password'}
          placeholder="비밀번호를 입력하세요"
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          leftIcon={<Lock className="h-4 w-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          required
        />

        {/* 비밀번호 찾기 */}
        <div className="flex justify-end">
          <button
            type="button"
            className="text-sm text-gray-900 hover:underline"
          >
            비밀번호를 잊으셨나요?
          </button>
        </div>

        {/* 로그인 버튼 */}
        <Button
          type="submit"
          className="w-full"
          loading={isLoading}
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </Button>
      </form>

      {/* 회원가입 링크 */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          계정이 없으신가요?{' '}
          <button
            type="button"
            className="text-gray-900 hover:underline font-medium"
            onClick={onSwitchToSignup}
          >
            회원가입
          </button>
        </p>
      </div>
    </motion.div>
  );
}