import React from 'react';
import { cn } from './ui/utils';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

export function ProgressIndicator({ currentStep, totalSteps, steps }: ProgressIndicatorProps) {
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="py-5 px-4">
      {/* 진행 바 */}
      <div className="w-full bg-gray-200 rounded-full h-1 mb-4">
        <div 
          className="bg-gray-900 h-1 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      {/* 단계 표시 */}
      <div className="flex justify-between items-center mb-2">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div className={cn(
              'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mb-1',
              index <= currentStep 
                ? 'bg-gray-900 text-white' 
                : 'bg-gray-200 text-gray-500'
            )}>
              {index + 1}
            </div>
            <span className={cn(
              'text-xs text-center px-1',
              index <= currentStep ? 'text-gray-900 font-medium' : 'text-gray-500'
            )}>
              {step}
            </span>
          </div>
        ))}
      </div>
      
      {/* 현재 단계 텍스트 */}
      <div className="text-center">
        <span className="text-xs text-gray-500">
          {currentStep + 1} / {totalSteps} 단계
        </span>
      </div>
    </div>
  );
}