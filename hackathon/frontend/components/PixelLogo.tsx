import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

export function PixelLogo() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;
  const glitchAnim = useRef(new Animated.Value(0)).current;

  const campusLetters = ['C', 'A', 'M', 'P', 'U', 'S'];
  const chronicleLetters = ['C', 'H', 'R', 'O', 'N', 'I', 'C', 'L', 'E'];

  // 글자별 애니메이션 값들을 미리 생성
  const campusAnimValues = useRef(
    campusLetters.map(() => ({
      fade: new Animated.Value(0),
      scale: new Animated.Value(0),
    }))
  ).current;

  const chronicleAnimValues = useRef(
    chronicleLetters.map(() => ({
      fade: new Animated.Value(0),
      scale: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    // 초기 페이드인 애니메이션
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // 글리치 효과 (반복)
    const glitchLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glitchAnim, {
          toValue: 2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(glitchAnim, {
          toValue: -2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(glitchAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.delay(2700),
      ])
    );
    glitchLoop.start();

    return () => glitchLoop.stop();
  }, [fadeAnim, slideAnim, glitchAnim]);

  // 글자별 애니메이션 시작
  useEffect(() => {
    const animations = [
      ...campusAnimValues.map((animValues, index) =>
        Animated.sequence([
          Animated.delay(index * 100),
          Animated.parallel([
            Animated.timing(animValues.fade, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.spring(animValues.scale, {
              toValue: 1,
              friction: 8,
              tension: 40,
              useNativeDriver: true,
            }),
          ]),
        ])
      ),
      ...chronicleAnimValues.map((animValues, index) =>
        Animated.sequence([
          Animated.delay((index + 6) * 100),
          Animated.parallel([
            Animated.timing(animValues.fade, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.spring(animValues.scale, {
              toValue: 1,
              friction: 8,
              tension: 40,
              useNativeDriver: true,
            }),
          ]),
        ])
      ),
    ];

    animations.forEach(anim => anim.start());
  }, [campusAnimValues, chronicleAnimValues]);

  const renderPixelLetter = (letter: string, index: number, isCampus: boolean) => {
    const animValues = isCampus ? campusAnimValues[index] : chronicleAnimValues[index];
    
    if (!animValues) {
      return (
        <View
          key={`${isCampus ? 'campus' : 'chronicle'}-${index}`}
          style={isCampus ? styles.campusLetter : styles.chronicleLetter}
        >
          <Text style={isCampus ? styles.campusText : styles.chronicleText}>
            {letter}
          </Text>
        </View>
      );
    }

    return (
      <Animated.View
        key={`${isCampus ? 'campus' : 'chronicle'}-${index}`}
        style={[
          isCampus ? styles.campusLetter : styles.chronicleLetter,
          {
            opacity: animValues.fade,
            transform: [{ scale: animValues.scale }],
          },
        ]}
      >
        <Text style={isCampus ? styles.campusText : styles.chronicleText}>
          {letter}
        </Text>
      </Animated.View>
    );
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.logoWrapper}>
        {/* 배경 그라데이션 효과 */}
        <View style={styles.backgroundGradient} />

        {/* 메인 로고 컨테이너 */}
        <View style={styles.logoContainer}>
          {/* CAMPUS 글자들 */}
          <View style={styles.campusRow}>
            {campusLetters.map((letter, index) =>
              renderPixelLetter(letter, index, true)
            )}
          </View>

          {/* CHRONICLE 글자들 */}
          <View style={styles.chronicleRow}>
            {chronicleLetters.map((letter, index) =>
              renderPixelLetter(letter, index + 6, false)
            )}
          </View>

          {/* 픽셀 장식 모서리 */}
          <View style={[styles.pixelCorner, styles.topLeft]} />
          <View style={[styles.pixelCorner, styles.topRight]} />
          <View style={[styles.pixelCorner, styles.bottomLeft]} />
          <View style={[styles.pixelCorner, styles.bottomRight]} />
        </View>

        {/* 글리치 효과 오버레이 */}
        <Animated.View
          style={[
            styles.glitchOverlay,
            {
              transform: [{ translateX: glitchAnim }],
            },
          ]}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    position: 'relative',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: -2,
    bottom: -2,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    opacity: 0.2,
            transform: [{ rotate: '1deg' }],
  },
  logoContainer: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#0f172a',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  campusRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 4,
  },
  chronicleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  campusLetter: {
    width: 24,
    height: 32,
    backgroundColor: '#0f172a',
    marginHorizontal: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.2)',
  },
  chronicleLetter: {
    width: 20,
    height: 24,
    backgroundColor: '#64748b',
    marginHorizontal: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.2)',
  },
  campusText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Courier',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  chronicleText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Courier',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  pixelCorner: {
    position: 'absolute',
    width: 8,
    height: 8,
  },
  topLeft: {
    top: -4,
    left: -4,
    backgroundColor: '#0f172a',
  },
  topRight: {
    top: -4,
    right: -4,
    backgroundColor: '#0f172a',
  },
  bottomLeft: {
    bottom: -4,
    left: -4,
    backgroundColor: '#64748b',
  },
  bottomRight: {
    bottom: -4,
    right: -4,
    backgroundColor: '#64748b',
  },
  glitchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(96, 165, 250, 0.3)',
    borderRadius: 8,
    opacity: 0.3,
  },
});
