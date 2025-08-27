// 레트로 퓨처리즘 테마 & 신한은행 브랜드 색상 시스템

export const colors = {
  // 신한은행 클래식 블루 (메인)
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6', // 메인 블루
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  
  // 성장을 상징하는 민트 그린
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E', // 메인 그린
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },
  
  // 보상 및 성취를 나타내는 골드 옐로우
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B', // 메인 골드
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  
  // 레트로 퓨처리즘 포인트 컬러
  accent: {
    purple: '#8B5CF6',
    pink: '#EC4899',
    cyan: '#06B6D4',
    orange: '#F97316',
    lime: '#84CC16',
  },
  
  // 중성 색상
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  
  // 상태 색상
  status: {
    error: '#EF4444',
    warning: '#F59E0B',
    success: '#22C55E',
    info: '#3B82F6',
  }
};

export const typography = {
  // 본문용 산세리프 폰트
  body: {
    fontFamily: 'System, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  
  // 헤드라인용 픽셀 폰트 (게임적 감성)
  heading: {
    fontFamily: '"Press Start 2P", "Courier New", monospace',
    fontSize: {
      xs: '14px',
      sm: '16px',
      base: '20px',
      lg: '24px',
      xl: '28px',
      '2xl': '32px',
      '3xl': '36px',
    },
    fontWeight: {
      normal: '400',
      bold: '700',
    },
    lineHeight: {
      tight: '1.2',
      normal: '1.3',
    },
  },
  
  // 픽셀 숫자용 폰트
  pixel: {
    fontFamily: '"Press Start 2P", "Courier New", monospace',
    fontSize: {
      sm: '12px',
      base: '16px',
      lg: '20px',
      xl: '24px',
      '2xl': '32px',
    },
  }
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
};

export const borderRadius = {
  none: '0',
  sm: '4px',
  base: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  full: '9999px',
};

export const shadows = {
  // 레트로 퓨처리즘 느낌의 그림자
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  
  // 픽셀 아트 느낌의 강한 그림자
  pixel: '4px 4px 0px rgba(0, 0, 0, 0.3)',
  'pixel-lg': '6px 6px 0px rgba(0, 0, 0, 0.3)',
  
  // 글로우 효과
  glow: {
    blue: '0 0 20px rgba(59, 130, 246, 0.5)',
    green: '0 0 20px rgba(34, 197, 94, 0.5)',
    gold: '0 0 20px rgba(245, 158, 11, 0.5)',
    purple: '0 0 20px rgba(139, 92, 246, 0.5)',
  }
};

export const animations = {
  // 부드러운 전환
  transition: {
    fast: '150ms ease-in-out',
    normal: '300ms ease-in-out',
    slow: '500ms ease-in-out',
  },
  
  // 픽셀 아트 애니메이션
  pixel: {
    bounce: 'bounce 0.6s ease-in-out',
    pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    shake: 'shake 0.5s ease-in-out',
    float: 'float 3s ease-in-out infinite',
  },
  
  // 레트로 퓨처리즘 효과
  retro: {
    scanline: 'scanline 2s linear infinite',
    glitch: 'glitch 0.3s ease-in-out',
    neon: 'neon 1.5s ease-in-out infinite alternate',
  }
};

// 애니메이션 키프레임 정의
export const keyframes = {
  bounce: {
    '0%, 20%, 53%, 80%, 100%': {
      transform: 'translate3d(0,0,0)',
    },
    '40%, 43%': {
      transform: 'translate3d(0,-8px,0)',
    },
    '70%': {
      transform: 'translate3d(0,-4px,0)',
    },
    '90%': {
      transform: 'translate3d(0,-2px,0)',
    },
  },
  
  pulse: {
    '0%, 100%': {
      opacity: '1',
    },
    '50%': {
      opacity: '0.5',
    },
  },
  
  shake: {
    '0%, 100%': {
      transform: 'translateX(0)',
    },
    '10%, 30%, 50%, 70%, 90%': {
      transform: 'translateX(-2px)',
    },
    '20%, 40%, 60%, 80%': {
      transform: 'translateX(2px)',
    },
  },
  
  float: {
    '0%, 100%': {
      transform: 'translateY(0px)',
    },
    '50%': {
      transform: 'translateY(-10px)',
    },
  },
  
  scanline: {
    '0%': {
      transform: 'translateY(-100%)',
    },
    '100%': {
      transform: 'translateY(100%)',
    },
  },
  
  glitch: {
    '0%': {
      transform: 'translate(0)',
    },
    '20%': {
      transform: 'translate(-2px, 2px)',
    },
    '40%': {
      transform: 'translate(-2px, -2px)',
    },
    '60%': {
      transform: 'translate(2px, 2px)',
    },
    '80%': {
      transform: 'translate(2px, -2px)',
    },
    '100%': {
      transform: 'translate(0)',
    },
  },
  
  neon: {
    '0%': {
      textShadow: '0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor',
    },
    '100%': {
      textShadow: '0 0 2px currentColor, 0 0 5px currentColor, 0 0 7px currentColor',
    },
  }
};

// 컴포넌트별 테마 설정
export const componentThemes = {
  // 카드 컴포넌트
  card: {
    background: colors.neutral[50],
    border: `1px solid ${colors.neutral[200]}`,
    borderRadius: borderRadius.lg,
    shadow: shadows.base,
    padding: spacing.lg,
  },
  
  // 버튼 컴포넌트
  button: {
    primary: {
      background: colors.primary[500],
      color: 'white',
      border: 'none',
      borderRadius: borderRadius.base,
      padding: `${spacing.sm} ${spacing.md}`,
      shadow: shadows.pixel,
      '&:hover': {
        background: colors.primary[600],
        transform: 'translateY(-1px)',
        shadow: shadows['pixel-lg'],
      },
      '&:active': {
        transform: 'translateY(0)',
        shadow: shadows.pixel,
      },
    },
    
    secondary: {
      background: 'transparent',
      color: colors.primary[500],
      border: `2px solid ${colors.primary[500]}`,
      borderRadius: borderRadius.base,
      padding: `${spacing.sm} ${spacing.md}`,
      '&:hover': {
        background: colors.primary[50],
        transform: 'translateY(-1px)',
      },
    },
    
    success: {
      background: colors.success[500],
      color: 'white',
      border: 'none',
      borderRadius: borderRadius.base,
      padding: `${spacing.sm} ${spacing.md}`,
      shadow: shadows.pixel,
      '&:hover': {
        background: colors.success[600],
        transform: 'translateY(-1px)',
        shadow: shadows['pixel-lg'],
      },
    },
    
    warning: {
      background: colors.warning[500],
      color: 'white',
      border: 'none',
      borderRadius: borderRadius.base,
      padding: `${spacing.sm} ${spacing.md}`,
      shadow: shadows.pixel,
      '&:hover': {
        background: colors.warning[600],
        transform: 'translateY(-1px)',
        shadow: shadows['pixel-lg'],
      },
    },
  },
  
  // 입력 필드
  input: {
    background: 'white',
    border: `2px solid ${colors.neutral[300]}`,
    borderRadius: borderRadius.base,
    padding: spacing.sm,
    fontSize: typography.body.fontSize.base,
    '&:focus': {
      outline: 'none',
      borderColor: colors.primary[500],
      boxShadow: shadows.glow.blue,
    },
  },
  
  // 배지
  badge: {
    background: colors.primary[100],
    color: colors.primary[700],
    borderRadius: borderRadius.full,
    padding: `${spacing.xs} ${spacing.sm}`,
    fontSize: typography.body.fontSize.sm,
    fontWeight: typography.body.fontWeight.medium,
  },
  
  // 프로그레스 바
  progress: {
    background: colors.neutral[200],
    fill: colors.primary[500],
    borderRadius: borderRadius.full,
    height: '8px',
    overflow: 'hidden',
  },
};

// 전체 테마 객체
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animations,
  keyframes,
  componentThemes,
};

export default theme;
