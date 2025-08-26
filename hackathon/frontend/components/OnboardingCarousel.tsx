import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Pressable } from 'react-native';
import { ImageWithFallback } from './figma/ImageWithFallback';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const slides = [
  {
    image: "https://images.unsplash.com/photo-1740933084056-078fac872bff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3b3Jrc3BhY2UlMjBjb2xsYWJvcmF0aW9ufGVufDF8fHx8MTc1NjA2NTA5M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    title: "함께 협업하며 성장하세요",
    subtitle: "팀원들과 실시간으로 소통하고 아이디어를 공유하세요"
  },
  {
    image: "https://images.unsplash.com/photo-1639485528505-0dcdae9ec84c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwbWVldGluZyUyMHByb2R1Y3RpdmV8ZW58MXx8fHwxNzU2MTAwOTU5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    title: "생산적인 미팅 문화",
    subtitle: "효율적인 회의를 통해 더 나은 결과를 만들어보세요"
  },
  {
    image: "https://images.unsplash.com/photo-1515355252367-42ae86cb92f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwaW5ub3ZhdGlvbiUyMHRlY2hub2xvZ3l8ZW58MXx8fHwxNzU2MTYxNzY4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    title: "혁신적인 디지털 솔루션",
    subtitle: "최신 기술로 업무 환경을 혁신하세요"
  },
  {
    image: "https://images.unsplash.com/photo-1606235729070-5da8437f6e30?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdWNjZXNzJTIwYWNoaWV2ZW1lbnQlMjBncm93dGh8ZW58MXx8fHwxNzU2MDgwMzA2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    title: "성공을 향한 여정",
    subtitle: "목표 달성을 위한 체계적인 접근 방식을 경험하세요"
  }
];

export function OnboardingCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const textFadeAnim = useRef(new Animated.Value(1)).current;
  const textSlideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setInterval(() => {
      // 애니메이션 시작
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(textFadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(textSlideAnim, {
          toValue: 30,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // 슬라이드 변경
        setCurrentSlide((prev) => (prev + 1) % slides.length);

        // 새 콘텐츠로 애니메이션
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(textFadeAnim, {
            toValue: 1,
            duration: 400,
            delay: 200,
            useNativeDriver: true,
          }),
          Animated.timing(textSlideAnim, {
            toValue: 0,
            duration: 400,
            delay: 200,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [fadeAnim, scaleAnim, textFadeAnim, textSlideAnim]);

  const handleIndicatorPress = (index: number) => {
    if (index === currentSlide) return;

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(textFadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentSlide(index);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(textFadeAnim, {
          toValue: 1,
          duration: 300,
          delay: 100,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  return (
    <View style={styles.container}>
      {/* 배경 이미지 */}
      <Animated.View
        style={[
          styles.imageContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <ImageWithFallback
          src={slides[currentSlide].image}
          alt={slides[currentSlide].title}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      </Animated.View>

      {/* 그라데이션 오버레이 */}
      <View style={styles.gradientOverlay} />

      {/* 어두운 오버레이 */}
      <View style={styles.darkOverlay} />

      {/* 텍스트 콘텐츠 */}
      <View style={styles.contentContainer}>
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: textFadeAnim,
              transform: [{ translateY: textSlideAnim }],
            },
          ]}
        >
          <Text style={styles.title}>{slides[currentSlide].title}</Text>
          <Text style={styles.subtitle}>{slides[currentSlide].subtitle}</Text>
        </Animated.View>

        {/* 인디케이터 */}
        <View style={styles.indicatorContainer}>
          {slides.map((_, index) => (
            <Pressable
              key={index}
              onPress={() => handleIndicatorPress(index)}
              style={[
                styles.indicator,
                index === currentSlide ? styles.activeIndicator : styles.inactiveIndicator,
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: screenWidth,
    height: screenHeight,
    position: 'relative',
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(59, 130, 246, 0.4)',
  },
  darkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 48,
  },
  textContainer: {
    alignItems: 'center',
    maxWidth: 320,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 32,
    flexDirection: 'row',
    gap: 8,
  },
  indicator: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  activeIndicator: {
    width: 32,
    opacity: 1,
  },
  inactiveIndicator: {
    width: 8,
    opacity: 0.3,
  },
});
