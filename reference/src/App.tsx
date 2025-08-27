import React, { useState } from 'react';
import { SignupForm } from './components/SignupForm';
import { LoginForm } from './components/LoginForm';
import { PixelLogo } from './components/PixelLogo';

export default function App() {
  const [isLoginMode, setIsLoginMode] = useState(false);

  return (
    <div className="min-h-screen max-w-sm mx-auto bg-white flex flex-col">
      {/* 상단 로고 */}
      <div className="w-full flex justify-center py-4 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <PixelLogo />
      </div>
      
      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full">
          {isLoginMode ? (
            <LoginForm onSwitchToSignup={() => setIsLoginMode(false)} />
          ) : (
            <SignupForm onSwitchToLogin={() => setIsLoginMode(true)} />
          )}
        </div>
      </div>
    </div>
  );
}