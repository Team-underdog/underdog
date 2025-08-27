import React, { useState } from 'react';
import { cn } from './utils';

interface PickerOption {
  label: string;
  value: string;
}

interface PickerProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onValueChange: (value: string) => void;
  options: PickerOption[];
  className?: string;
}

export function Picker({
  label,
  placeholder = "선택하세요",
  value,
  onValueChange,
  options,
  className,
}: PickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(option => option.value === value);

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          className={cn(
            'w-full flex items-center justify-between',
            'bg-gray-50 border border-gray-300 rounded-lg px-3 py-3',
            'hover:bg-white hover:border-gray-900',
            'focus:bg-white focus:border-gray-900 focus:ring-1 focus:ring-gray-900 focus:outline-none',
            'text-base text-left'
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <span className="text-gray-400 text-sm">▼</span>
        </button>

        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    'w-full px-3 py-3 text-left text-base hover:bg-gray-50',
                    'first:rounded-t-lg last:rounded-b-lg',
                    option.value === value && 'bg-gray-100 text-gray-900 font-medium'
                  )}
                  onClick={() => {
                    onValueChange(option.value);
                    setIsOpen(false);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}