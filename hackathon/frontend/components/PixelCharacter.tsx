import React from 'react';
import { View, Text } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  withSequence
} from 'react-native-reanimated';
import Svg, { Rect, Circle } from 'react-native-svg';

interface PixelCharacterProps {
  level: number;
  credoScore: number;
}

export function PixelCharacter({ level, credoScore }: PixelCharacterProps) {
  // 애니메이션 값
  const floatingY = useSharedValue(0);
  const scaleValue = useSharedValue(1);

  // 크레도 점수에 따라 캐릭터 상태 결정
  const getCharacterState = () => {
    if (credoScore >= 1000) return 'happy';
    if (credoScore >= 500) return 'neutral';
    return 'sleepy';
  };

  const characterState = getCharacterState();

  // 플로팅 애니메이션
  React.useEffect(() => {
    floatingY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 2000 }),
        withTiming(0, { duration: 2000 })
      ),
      -1,
      false
    );
  }, []);

  // 터치 시 스케일 애니메이션
  const handleTouch = () => {
    scaleValue.value = withSequence(
      withTiming(1.1, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: floatingY.value },
      { scale: scaleValue.value }
    ],
  }));

  // 픽셀 아트 스타일 캐릭터 SVG
  const CharacterSVG = () => (
    <Svg width={80} height={80} viewBox="0 0 32 32">
      {/* 머리/얼굴 베이스 */}
      <Rect x="8" y="4" width="16" height="16" fill="#FFB6C1" />
      <Rect x="6" y="6" width="20" height="12" fill="#FFB6C1" />
      
      {/* 머리카락 */}
      <Rect x="6" y="2" width="20" height="6" fill="#8B4513" />
      <Rect x="4" y="4" width="24" height="4" fill="#8B4513" />
      
      {/* 눈 */}
      {characterState === 'happy' ? (
        <>
          <Rect x="10" y="8" width="2" height="2" fill="#000" />
          <Rect x="20" y="8" width="2" height="2" fill="#000" />
          <Rect x="9" y="9" width="4" height="1" fill="#000" />
          <Rect x="19" y="9" width="4" height="1" fill="#000" />
        </>
      ) : characterState === 'neutral' ? (
        <>
          <Rect x="10" y="8" width="2" height="2" fill="#000" />
          <Rect x="20" y="8" width="2" height="2" fill="#000" />
        </>
      ) : (
        <>
          <Rect x="10" y="9" width="2" height="1" fill="#000" />
          <Rect x="20" y="9" width="2" height="1" fill="#000" />
        </>
      )}
      
      {/* 입 */}
      {characterState === 'happy' ? (
        <>
          <Rect x="14" y="14" width="4" height="1" fill="#000" />
          <Rect x="13" y="13" width="1" height="1" fill="#000" />
          <Rect x="18" y="13" width="1" height="1" fill="#000" />
        </>
      ) : characterState === 'neutral' ? (
        <Rect x="15" y="14" width="2" height="1" fill="#000" />
      ) : (
        <>
          <Rect x="13" y="15" width="1" height="1" fill="#000" />
          <Rect x="14" y="14" width="4" height="1" fill="#000" />
          <Rect x="18" y="15" width="1" height="1" fill="#000" />
        </>
      )}
      
      {/* 몸통 */}
      <Rect x="10" y="20" width="12" height="8" fill="#4169E1" />
      <Rect x="8" y="22" width="16" height="4" fill="#4169E1" />
      
      {/* 팔 */}
      <Rect x="6" y="22" width="2" height="6" fill="#FFB6C1" />
      <Rect x="24" y="22" width="2" height="6" fill="#FFB6C1" />
      
      {/* 다리 */}
      <Rect x="12" y="28" width="3" height="4" fill="#2F4F4F" />
      <Rect x="17" y="28" width="3" height="4" fill="#2F4F4F" />
      
      {/* 레벨 표시 아이템들 */}
      {level >= 3 && (
        <>
          {/* 모자 */}
          <Rect x="8" y="1" width="16" height="2" fill="#FFD700" />
          <Rect x="6" y="2" width="20" height="1" fill="#FFD700" />
        </>
      )}
      
      {level >= 5 && (
        <>
          {/* 안경 */}
          <Rect x="9" y="7" width="4" height="3" fill="rgba(255,255,255,0.3)" stroke="#000" strokeWidth="0.5" />
          <Rect x="19" y="7" width="4" height="3" fill="rgba(255,255,255,0.3)" stroke="#000" strokeWidth="0.5" />
          <Rect x="13" y="8" width="6" height="1" fill="#000" />
        </>
      )}
    </Svg>
  );

  return (
    <View style={{ alignItems: 'center', position: 'relative' }}>
      <Animated.View style={[animatedStyle, { position: 'relative' }]}>
        <View onTouchStart={handleTouch}>
          <CharacterSVG />
        </View>
        
        {/* 레벨 배지 */}
        <View style={{
          position: 'absolute',
          top: -8,
          right: -8,
          backgroundColor: '#8B5CF6',
          borderRadius: 12,
          width: 24,
          height: 24,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}>
          <Text style={{ 
            color: 'white', 
            fontSize: 10, 
            fontWeight: 'bold' 
          }}>
            {level}
          </Text>
        </View>
        
        {/* 상태 표시 이모티콘 */}
        <View style={{
          position: 'absolute',
          top: -16,
          left: '50%',
          transform: [{ translateX: -8 }],
        }}>
          <Text style={{ fontSize: 16 }}>
            {characterState === 'happy' && '✨'}
            {characterState === 'neutral' && '💭'}
            {characterState === 'sleepy' && '💤'}
          </Text>
        </View>
      </Animated.View>
      
      {/* 그림자 */}
      <View style={{
        position: 'absolute',
        bottom: -10,
        width: 60,
        height: 8,
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: 20,
        transform: [{ scaleY: 0.3 }],
      }} />
    </View>
  );
}
