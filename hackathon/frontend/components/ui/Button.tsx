import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, PressableProps, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps extends PressableProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  loading?: boolean;
  className?: string;
}

export function Button({ 
  children, 
  variant = 'default', 
  size = 'default', 
  loading = false,
  style,
  disabled,
  ...props 
}: ButtonProps) {
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[`size_${size}`],
    disabled || loading ? styles.disabled : null,
    style,
  ] as ViewStyle[];

  const textStyle = [
    styles.baseText,
    styles[`${variant}Text`],
  ] as TextStyle[];

  return (
    <Pressable
      style={({ pressed }) => [
        ...buttonStyle,
        pressed && !disabled && !loading ? styles.pressed : null,
      ]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'default' ? '#fff' : '#374151'} 
        />
      ) : (
        <Text style={textStyle}>{children}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
  },
  default: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: '#d1d5db',
  },
  secondary: {
    backgroundColor: '#f3f4f6',
    borderColor: '#f3f4f6',
  },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  size_default: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  size_sm: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    minHeight: 36,
  },
  size_lg: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    minHeight: 56,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  baseText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  defaultText: {
    color: '#fff',
  },
  outlineText: {
    color: '#374151',
  },
  secondaryText: {
    color: '#374151',
  },
  ghostText: {
    color: '#374151',
  },
});
