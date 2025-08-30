import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  Image,
  PanResponder,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import CharacterSelectionModal from './CharacterSelectionModal';
import CredoService from '../services/credoService';
import BenefitModal from './BenefitModal';
import { BenefitService } from '../services/benefitService';
import { HollandType } from '../services/nlpService';

interface CharacterGrowthProps {
  userId: string;
  onSettingsPress?: () => void;
}

const { width } = Dimensions.get('window');

// 사운드 효과 관리
class SoundManager {
  private static instance: SoundManager;
  private sounds: { [key: string]: Audio.Sound } = {};

  private constructor() {}

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  async loadSounds() {
    try {
      // 레벨업 사운드 (더미 데이터 - 실제로는 오디오 파일 필요)
      console.log('사운드 로드 완료');
    } catch (error) {
      console.error('사운드 로드 실패:', error);
    }
  }

  async playLevelUpSound() {
    try {
      // 실제 오디오 파일이 있다면 여기서 재생
      console.log('🎵 레벨업 사운드 재생!');
    } catch (error) {
      console.error('사운드 재생 실패:', error);
    }
  }

  async playCredoSound() {
    try {
      // 크레도 획득 사운드
      console.log('🎵 크레도 획득 사운드 재생!');
    } catch (error) {
      console.error('사운드 재생 실패:', error);
    }
  }

  async playEvolutionSound() {
    try {
      // 진화 사운드
      console.log('🎵 진화 사운드 재생!');
    } catch (error) {
      console.error('사운드 재생 실패:', error);
    }
  }
}

export default function CharacterGrowth({ userId, onSettingsPress }: CharacterGrowthProps) {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentCredo, setCurrentCredo] = useState(0);
  const [currentCharacter, setCurrentCharacter] = useState('pixel');
  
  // 중앙 크레도 서비스
  const credoService = useRef(CredoService.getInstance()).current;
  const [modalVisible, setModalVisible] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(1);
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isEvolving, setIsEvolving] = useState(false);
  const [showSparkle, setShowSparkle] = useState(false);
  
  // 혜택 확인 관련 상태
  const [showBenefitModal, setShowBenefitModal] = useState(false);
  const [benefits, setBenefits] = useState<any>(null);
  
  // 크레도 동기화 상태
  const [credoToNextLevel, setCredoToNextLevel] = useState(100);
  const [totalCredo, setTotalCredo] = useState(0);
  const [credoProgress, setCredoProgress] = useState(0);
  
  // 사운드 매니저
  const soundManager = useRef(SoundManager.getInstance()).current;
  
  // 애니메이션 값들
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  
  // 크레도 동기화 및 실시간 업데이트
  useEffect(() => {
    // 사용자 ID가 있으면 CredoService에 설정
    if (userId) {
      credoService.setUserId(userId);
    }
    
    // 초기 크레도 데이터 로드
    loadCredoData();
    
    // 크레도 변경 이벤트 리스너 등록
    const handleCredoChange = (credoData: any) => {
      updateCharacterFromCredo(credoData);
    };
    
    credoService.on('credoChanged', handleCredoChange);
    
    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      credoService.off('credoChanged', handleCredoChange);
    };
  }, [userId]); // userId가 변경될 때마다 실행
  
  // 크레도 데이터 로드 및 캐릭터 상태 업데이트
  const loadCredoData = useCallback(() => {
    try {
      const credoStats = credoService.getCredoStats();
      updateCharacterFromCredo(credoStats);
    } catch (error) {
      console.error('크레도 데이터 로드 실패:', error);
    }
  }, [credoService]);
  
  // 크레도 데이터로 캐릭터 상태 업데이트
  const updateCharacterFromCredo = useCallback((credoStats: any) => {
    const { currentCredo, totalCredo, level } = credoStats;
    
    setCurrentCredo(currentCredo);
    setTotalCredo(totalCredo);
    setCurrentLevel(level);
    
    // 다음 레벨까지 필요한 크레도 계산
    const nextLevelCredo = credoService.getCredoForNextLevel();
    setCredoToNextLevel(nextLevelCredo);
    
    // 크레도 진행률 계산 (0-100)
    const progress = Math.min((currentCredo / nextLevelCredo) * 100, 100);
    setCredoProgress(progress);
    
    // 진행률 애니메이션 업데이트
    Animated.timing(progressAnim, {
      toValue: progress / 100,
      duration: 1000,
      useNativeDriver: false,
    }).start();
    
    console.log(`🎮 캐릭터 크레도 동기화: ${currentCredo}/${nextLevelCredo} (${progress.toFixed(1)}%)`);
  }, [progressAnim, credoService]);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  const colorAnim = useRef(new Animated.Value(0)).current;

  // 둥둥 떠다니는 애니메이션
  const floatAnim = useRef(new Animated.Value(0)).current;
  const swayAnim = useRef(new Animated.Value(0)).current;
  const breatheAnim = useRef(new Animated.Value(1)).current;
  
  // 추가 부드러운 움직임 애니메이션
  const gentleRotateAnim = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  // 진화 이펙트 애니메이션
  const evolutionScaleAnim = useRef(new Animated.Value(1)).current;
  const evolutionGlowAnim = useRef(new Animated.Value(0)).current;
  const evolutionParticlesAnim = useRef(new Animated.Value(0)).current;
  const evolutionRingAnim = useRef(new Animated.Value(0)).current;
  const evolutionTextAnim = useRef(new Animated.Value(0)).current;

  // 간단한 테스트 애니메이션 - 확실하게 보이는 둥둥 떠다니는 효과
  const testFloatAnim = useRef(new Animated.Value(0)).current;
  const testSwayAnim = useRef(new Animated.Value(0)).current;

  // 간단한 테스트 애니메이션 값들 - 확실하게 보이는 효과
  const testFloatY = testFloatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -120], // -80에서 -120으로 늘림
  });

  const testSwayX = testSwayAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 100], // 60에서 100으로 늘림
  });

  // 애니메이션 값들 계산 - 제자리에서 살짝씩 둥둥 떠다니기
  const floatTranslateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20], // -50에서 -20으로 줄임
  });

  const swayTranslateX = swayAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 15], // 30에서 15로 줄임
  });

  const gentleRotateValue = gentleRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-8deg', '8deg'], // -20deg에서 -8deg로 줄임
  });

  const waveTranslateY = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -18], // -40에서 -18로 줄임
  });

  const waveTranslateX = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 12], // 25에서 12로 줄임
  });

  // 간단하고 명확한 둥둥 떠다니는 효과들 - 제자리에서 살짝씩
  const simpleFloatY = floatAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -12, 0], // -30에서 -12로 줄임
  });

  const simpleSwayX = swayAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 8, 0], // 20에서 8로 줄임
  });

  const simpleBounce = bounceAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.05, 1], // 1.15에서 1.05로 줄임
  });

  const simpleBreathing = breatheAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.03, 1], // 1.08에서 1.03으로 줄임
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.6],
  });

  const sparkleOpacity = sparkleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const evolutionScale = evolutionScaleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.5, 1],
  });

  const getDynamicBackgroundColor = () => {
    return colorAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: ['#FFFFFF', '#F8F9FF', '#FFFFFF'],
    });
  };

  const getProgressColor = () => {
    if (currentCredo >= credoToNextLevel) {
      return '#FFD700'; // 다음 레벨 도달 시 노란색
    }
    
    // 크레도 진행률에 따른 색상 변화
    const progress = (currentCredo / credoToNextLevel) * 100;
    if (progress >= 80) {
      return '#FFA500'; // 80% 이상 시 주황색
    } else if (progress >= 60) {
      return '#FFD700'; // 60% 이상 시 노란색
    } else if (progress >= 40) {
      return '#87CEEB'; // 40% 이상 시 파란색
    } else {
      return '#6BCF7F'; // 40% 미만 시 초록색
    }
  };

  // 레벨업 애니메이션
  const triggerLevelUp = () => {
    // 레벨업 사운드 재생
    soundManager.playLevelUpSound();
    
    // 스케일 애니메이션
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.3,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // 글로우 애니메이션
    Animated.sequence([
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // 회전 애니메이션
    Animated.sequence([
      Animated.timing(rotationAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(rotationAnim, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start();

    // 스파클 효과
    setShowSparkle(true);
    setTimeout(() => setShowSparkle(false), 400);
    
    Animated.sequence([
      Animated.timing(sparkleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(sparkleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // 진화 이펙트
  const triggerEvolutionEffect = () => {
    // 진화 사운드 재생
    soundManager.playEvolutionSound();
    
    // 진화 스케일 애니메이션
    Animated.sequence([
      Animated.timing(evolutionScaleAnim, {
        toValue: 1.5,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(evolutionScaleAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // 진화 글로우 애니메이션
    Animated.sequence([
      Animated.timing(evolutionGlowAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(evolutionGlowAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // 진화 파티클 애니메이션
    Animated.sequence([
      Animated.timing(evolutionParticlesAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(evolutionParticlesAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // 진화 링 애니메이션
    Animated.sequence([
      Animated.timing(evolutionRingAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(evolutionRingAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // 진화 텍스트 애니메이션
    Animated.sequence([
      Animated.timing(evolutionTextAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(evolutionTextAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // 3초 후 진화 상태 해제
    setTimeout(() => {
      setIsEvolving(false);
      setShowLevelUp(false);
    }, 3000);
  };

  // 지속적인 애니메이션들 - 제자리에 고정을 위해 주석 처리
  // useEffect(() => {
  //   // 사운드 로드
  //   soundManager.loadSounds();

  //   // 둥둥 떠다니는 효과 - 제자리에서 살짝씩 둥둥 떠다니기
  //   const floatAnimation = Animated.loop(
  //     Animated.sequence([
  //       // 위로 떠오르기
  //       Animated.timing(floatAnim, {
  //         toValue: 1,
  //         duration: 3000, // 1500에서 3000으로 늘림
  //         useNativeDriver: true,
  //       }),
  //       // 아래로 내려가기
  //       Animated.timing(floatAnim, {
  //         toValue: 0,
  //         duration: 3000, // 1500에서 3000으로 늘림
  //         useNativeDriver: true,
  //       }),
  //     ])
  //   );

  //   // 좌우 흔들림 효과 - 제자리에서 살짝씩 둥둥 떠다니기
  //   const swayAnimation = Animated.loop(
  //     Animated.sequence([
  //       // 오른쪽으로 기울어지기
  //       Animated.timing(swayAnim, {
  //         toValue: 1,
  //         duration: 4000, // 2000에서 4000으로 늘림
  //         useNativeDriver: true,
  //       }),
  //       // 왼쪽으로 기울어지기
  //       Animated.timing(swayAnim, {
  //         toValue: 0,
  //         duration: 4000, // 2000에서 4000으로 늘림
  //         useNativeDriver: true,
  //       }),
  //     ])
  //   );

  //   // 호흡 효과 - 제자리에서 살짝씩 둥둥 떠다니기
  //   const breatheAnimation = Animated.loop(
  //     Animated.sequence([
  //       // 숨을 들이쉬기
  //       Animated.timing(breatheAnim, {
  //         toValue: 1.03,
  //         duration: 2000, // 1000에서 2000으로 늘림
  //         useNativeDriver: true,
  //       }),
  //       // 숨을 내쉬기
  //       Animated.timing(breatheAnim, {
  //         toValue: 1,
  //         duration: 2000, // 1000에서 2000으로 늘림
  //         useNativeDriver: true,
  //       }),
  //     ])
  //   );

  //   // 호버링 효과 - 제자리에서 살짝씩 둥둥 떠다니기
  //   const hoverAnimation = Animated.loop(
  //     Animated.sequence([
  //       // 살짝 떠오르기
  //       Animated.timing(bounceAnim, {
  //         toValue: 1.05,
  //         duration: 1500, // 800에서 1500으로 늘림
  //         useNativeDriver: true,
  //       }),
  //       // 살짝 내려가기
  //       Animated.timing(bounceAnim, {
  //         toValue: 1,
  //         duration: 1500, // 800에서 1500으로 늘림
  //         useNativeDriver: true,
  //       }),
  //     ])
  //   );

  //   // 회전 효과 - 제자리에서 살짝씩 둥둥 떠다니기
  //   const gentleRotateAnimation = Animated.loop(
  //     Animated.sequence([
  //       // 오른쪽으로 기울어지기
  //       Animated.timing(gentleRotateAnim, {
  //         toValue: 1,
  //         duration: 5000, // 2500에서 5000으로 늘림
  //         useNativeDriver: true,
  //       }),
  //       // 왼쪽으로 기울어지기
  //       Animated.timing(gentleRotateAnim, {
  //         toValue: 0,
  //         duration: 5000, // 2500에서 5000으로 늘림
  //         useNativeDriver: true,
  //       }),
  //     ])
  //   );

  //   // 물결 효과 - 제자리에서 살짝씩 둥둥 떠다니기
  //   const waveAnimation = Animated.loop(
  //     Animated.sequence([
  //       // 위로 올라가면서 오른쪽으로
  //       Animated.timing(waveAnim, {
  //         toValue: 1,
  //         duration: 4000, // 2000에서 4000으로 늘림
  //         useNativeDriver: true,
  //       }),
  //       // 아래로 내려가면서 왼쪽으로
  //       Animated.timing(waveAnim, {
  //         toValue: 0,
  //         duration: 4000, // 2000에서 4000으로 늘림
  //         useNativeDriver: true,
  //       }),
  //     ])
  //   );

  //   // 색상 변화 애니메이션
  //   const colorAnimation = Animated.loop(
  //     Animated.timing(colorAnim, {
  //       toValue: 1,
  //       duration: 4000,
  //       useNativeDriver: true, // false에서 true로 변경
  //     })
  //   );

  //   // 간단한 테스트 애니메이션 - 확실하게 보이는 둥둥 떠다니는 효과
  //   const testFloatAnimation = Animated.loop(
  //     Animated.sequence([
  //       Animated.timing(testFloatAnim, {
  //         toValue: 1,
  //         duration: 500, // 800에서 500으로 줄임
  //         useNativeDriver: true, // false에서 true로 변경
  //       }),
  //       Animated.timing(testFloatAnim, {
  //         toValue: 0,
  //         duration: 500, // 800에서 500으로 줄임
  //         useNativeDriver: true, // false에서 true로 변경
  //       }),
  //     ])
  //   );

  //   const testSwayAnimation = Animated.loop(
  //     Animated.sequence([
  //       Animated.timing(testSwayAnim, {
  //         toValue: 1,
  //         duration: 700, // 1000에서 700으로 줄임
  //         useNativeDriver: true, // false에서 true로 변경
  //       }),
  //       Animated.timing(testSwayAnim, {
  //         toValue: 0,
  //         duration: 700, // 1000에서 700으로 줄임
  //         useNativeDriver: true, // false에서 true로 변경
  //       }),
  //     ])
  //   );

  //   // 기존 애니메이션들 시작
  //   floatAnimation.start();
  //   swayAnimation.start();
  //   breatheAnimation.start();
  //   hoverAnimation.start();
  //   gentleRotateAnimation.start();
  //   waveAnimation.start();
  //   colorAnimation.start();
    
  //   // 테스트 애니메이션 시작
  //   testFloatAnimation.start();
  //   testSwayAnimation.start();
    
  //   // 애니메이션 시작 확인 로그
  //   console.log('🎬 애니메이션 시작됨!');
  //   console.log('📊 testFloatAnim 값:', testFloatAnim);
  //   console.log('📊 testSwayAnim 값:', testSwayAnim);

  //   return () => {
  //     floatAnimation.stop();
  //     swayAnimation.stop();
  //     breatheAnimation.stop();
  //     hoverAnimation.stop();
  //     gentleRotateAnimation.stop();
  //     waveAnimation.stop();
  //     colorAnimation.stop();
      
  //     // 테스트 애니메이션 정리
  //     testFloatAnimation.stop();
  //     testSwayAnimation.stop();
  //   };
  // }, []);

  // 레벨업 이벤트 리스너
  const handleLevelUp = useCallback((data: any) => {
    const newLevel = data.newLevel || data; // data가 숫자인 경우도 처리
    setNewLevel(newLevel);
    setShowLevelUp(true);
    setIsEvolving(true);
    setCurrentLevel(newLevel);
    
    // 레벨업 애니메이션
    triggerLevelUp();
    
    // 진화 이펙트 시작
    triggerEvolutionEffect();
  }, []);

  // 크레도 서비스에서 데이터 동기화
  useEffect(() => {
    const credoStats = credoService.getCredoStats();
    setCurrentCredo(credoStats.currentCredo);
    setCurrentLevel(credoStats.level);
    
    // 크레도 변경 이벤트 리스너
    const handleCredoChanged = (stats: any) => {
      setCurrentCredo(stats.currentCredo);
      setCurrentLevel(stats.level);
    };
    
    credoService.on('credoChanged', handleCredoChanged);
    credoService.on('levelUp', handleLevelUp);
    
    return () => {
      credoService.off('credoChanged', handleCredoChanged);
      credoService.off('levelUp', handleLevelUp);
    };
  }, [credoService, handleLevelUp]);

  // 캐릭터 이미지 경로 생성
  const getCharacterImage = () => {
    if (currentCharacter === 'shinhan-bear') {
      // 신한곰 이미지 - 정적 경로로 require
      switch (currentLevel) {
        case 1: return require('../assets/images/shinhan-bear/1단계.png');
        case 2: return require('../assets/images/shinhan-bear/2단계.png');
        case 3: return require('../assets/images/shinhan-bear/3단계.png');
        case 4: return require('../assets/images/shinhan-bear/4단계.png');
        case 5: return require('../assets/images/shinhan-bear/5단계.png');
        case 6: return require('../assets/images/shinhan-bear/6단계.png');
        case 7: return require('../assets/images/shinhan-bear/7단계.png');
        case 8: return require('../assets/images/shinhan-bear/8단계.png');
        case 9: return require('../assets/images/shinhan-bear/9단계.png');
        case 10: return require('../assets/images/shinhan-bear/10단계.png');
        default: return require('../assets/images/shinhan-bear/1단계.png');
      }
    } else {
      // 픽셀 캐릭터 이미지 - 정적 경로로 require
      switch (currentLevel) {
        case 1: return require('../assets/character/1.png');
        case 2: return require('../assets/character/2.png');
        case 3: return require('../assets/character/3.png');
        case 4: return require('../assets/character/4.png');
        case 5: return require('../assets/character/5.png');
        case 6: return require('../assets/character/6.png');
        case 7: return require('../assets/character/7.png');
        case 8: return require('../assets/character/8.png');
        case 9: return require('../assets/character/9.png');
        case 10: return require('../assets/character/10.png');
        default: return require('../assets/character/1.png');
      }
    }
  };

  // 캐릭터 타입에 따른 크기 계산
  const getCharacterSize = () => {
    if (currentCharacter === 'shinhan-bear') {
      // 신한곰은 더 크게 (기존보다 20% 더 크게)
      return {
        imageSize: 259, // 216 * 1.2 = 259
        wrapperSize: 288, // 240 * 1.2 = 288
        borderRadius: 130, // 108 * 1.2 = 130
        glowOffset: -24, // -20 * 1.2 = -24
        glowRadius: 192, // 160 * 1.2 = 192
        evolutionRingSize: 259, // 216 * 1.2 = 259
        evolutionGlowSize: 346, // 288 * 1.2 = 346
        sparkleOffset: -60, // -50 * 1.2 = -60
        sparkleSize: 86, // 72 * 1.2 = 86
        sparkleFontSize: 52 // 43 * 1.2 = 52
      };
    } else {
      // 픽셀 캐릭터(계란)는 현재 상태 유지
      return {
        imageSize: 96, // 80 * 1.2 = 96
        wrapperSize: 120, // 100 * 1.2 = 120
        borderRadius: 48, // 40 * 1.2 = 48
        glowOffset: -10, // -8 * 1.25 = -10
        glowRadius: 80, // 64 * 1.25 = 80
        evolutionRingSize: 96, // 80 * 1.2 = 96
        evolutionGlowSize: 144, // 120 * 1.2 = 144
        sparkleOffset: -25, // -20 * 1.25 = -25
        sparkleSize: 36, // 30 * 1.2 = 36
        sparkleFontSize: 24 // 20 * 1.2 = 24
      };
    }
  };

  // 설정 버튼 클릭 핸들러
  const handleSettingsPress = () => {
    setModalVisible(true);
  };

  // 캐릭터 선택 핸들러
  const handleCharacterSelect = (characterType: string, level: number) => {
    setCurrentCharacter(characterType);
    setCurrentLevel(level);
    // 레벨 변경 시 크레도는 서비스에서 관리되므로 초기화하지 않음
  };

  // 캐릭터 터치 핸들러
  const handleCharacterPress = async () => {
    // 햅틱 피드백
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // 중앙 크레도 서비스에 크레도 추가
    try {
      const earnedCredo = credoService.earnCredo(25, 'character_touch', '캐릭터 터치로 크레도 획득');
      
      // 크레도 획득 성공 시 이벤트 발생
      if (earnedCredo) {
        // 크레도 변경 이벤트는 credoService.earnCredo() 내부에서 자동으로 발생
        // 레벨업 체크
        const newCredoStats = credoService.getCredoStats();
        if (newCredoStats.level > currentLevel) {
          handleLevelUp(newCredoStats.level);
        }
        
        console.log(`🎉 캐릭터 터치로 크레도 획득: +25`);
      }
    } catch (error) {
      console.error('크레도 획득 실패:', error);
      // 실패 시에도 기본 크레도 증가 (오프라인 모드)
      setCurrentCredo(prev => prev + 25);
    }
    
    // 크레도 획득 사운드
    soundManager.playCredoSound();
  };

  // 혜택확인 버튼 핸들러
  const handleBenefitCheck = () => {
    console.log('🎁 혜택확인 버튼 클릭됨');
    
    try {
      // 홀랜드 점수 (임시 데이터 - 실제로는 사용자의 홀랜드 검사 결과를 사용)
      const mockHollandScores = {
        [HollandType.R]: 75, // 현실형
        [HollandType.I]: 85, // 탐구형
        [HollandType.A]: 60, // 예술형
        [HollandType.S]: 90, // 사회형
        [HollandType.E]: 70, // 진취형
        [HollandType.C]: 65  // 관습형
      };
      
      // 혜택 계산
      const benefitService = BenefitService.getInstance();
      const calculatedBenefits = benefitService.calculateBenefits(currentCredo, mockHollandScores);
      
      setBenefits(calculatedBenefits);
      setShowBenefitModal(true);
      
    } catch (error) {
      console.error('혜택 계산 실패:', error);
      Alert.alert('오류', '혜택 정보를 불러오는데 실패했습니다.');
    }
  };

  const handlePressIn = () => {
    setIsPressed(true);
    // 미세한 햅틱 피드백
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
  };

  // 애니메이션 상태 - 부드러운 둥둥 떠다니기 (순간이동 방지)
  const smoothFloatAnim = useRef(new Animated.Value(0)).current;
  const smoothSwayAnim = useRef(new Animated.Value(0)).current;

  // 애니메이션 효과 - 제자리에서 살짝 둥둥 떠있는 효과
  useEffect(() => {
    // 사운드 로드
    soundManager.loadSounds();
    
    // 부드러운 위아래 움직임 - 살짝 둥둥 떠있기
    const smoothFloatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(smoothFloatAnim, {
          toValue: -8, // -15에서 -8로 줄임 (더 작은 움직임)
          duration: 2000, // 3000에서 2000으로 줄임 (더 빠르게)
          useNativeDriver: true,
        }),
        Animated.timing(smoothFloatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    // 부드러운 좌우 움직임 - 살짝 둥둥 떠있기
    const smoothSwayAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(smoothSwayAnim, {
          toValue: 6, // 12에서 6으로 줄임 (더 작은 움직임)
          duration: 2400, // 3600에서 2400으로 줄임 (더 빠르게)
          useNativeDriver: true,
        }),
        Animated.timing(smoothSwayAnim, {
          toValue: 0,
          duration: 2400,
          useNativeDriver: true,
        }),
      ])
    );

    // 애니메이션 시작
    smoothFloatAnimation.start();
    smoothSwayAnimation.start();

    return () => {
      smoothFloatAnimation.stop();
      smoothSwayAnimation.stop();
    };
  }, []); // 빈 의존성 배열로 한 번만 실행

  // 애니메이션 효과 - 모든 애니메이션 정지 (제자리에 고정)
  useEffect(() => {
    // 사운드 로드만 유지
    soundManager.loadSounds();
    
    // 모든 애니메이션은 시작하지 않음 - 제자리에 고정
    // floatAnimation.start();
    // swayAnimation.start();
    // breatheAnimation.start();
    // hoverAnimation.start();
    // gentleRotateAnimation.start();
    // waveAnimation.start();
    // colorAnimation.start();
    // smoothFloatAnimation.start();
    // smoothSwayAnimation.start();

    return () => {
      // 정리할 애니메이션이 없음
    };
  }, []); // 빈 의존성 배열로 한 번만 실행

  return (
    <>
      <Animated.View style={[styles.characterContainer, { backgroundColor: getDynamicBackgroundColor() }]}>
        {/* 진화 이펙트 오버레이 */}
        {isEvolving && (
          <View style={styles.evolutionOverlay}>
            {/* 진화 링 */}
            <Animated.View
              style={[
                styles.evolutionRing,
                {
                  width: getCharacterSize().evolutionRingSize,
                  height: getCharacterSize().evolutionRingSize,
                  borderRadius: getCharacterSize().evolutionRingSize / 2,
                  opacity: evolutionRingAnim,
                  transform: [
                    {
                      scale: evolutionRingAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 2],
                      }),
                    },
                  ],
                },
              ]}
            />
            
            {/* 진화 글로우 */}
            <Animated.View
              style={[
                styles.evolutionGlow,
                {
                  width: getCharacterSize().evolutionGlowSize,
                  height: getCharacterSize().evolutionGlowSize,
                  borderRadius: getCharacterSize().evolutionGlowSize / 2,
                  opacity: evolutionGlowAnim,
                  transform: [
                    {
                      scale: evolutionGlowAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 2.5],
                      }),
                    },
                  ],
                },
              ]}
            />
            
            {/* 진화 파티클 */}
            <Animated.View
              style={[
                styles.evolutionParticles,
                {
                  opacity: evolutionParticlesAnim,
                },
              ]}
            >
              <Text style={styles.evolutionParticleText}>✨🌟💫</Text>
            </Animated.View>
            
            {/* 진화 텍스트 */}
            <Animated.View
              style={[
                styles.evolutionText,
                {
                  opacity: evolutionTextAnim,
                  transform: [
                    {
                      scale: evolutionTextAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.evolutionTitle}>진화!</Text>
              <Text style={styles.evolutionSubtitle}>레벨 {newLevel} 달성!</Text>
            </Animated.View>
          </View>
        )}

        {/* 레벨업 알림 */}
        {showLevelUp && !isEvolving && (
          <Animated.View style={[styles.levelUpNotification, { opacity: glowAnim }]}>
            <LinearGradient
              colors={['#FFD700', '#FFA500', '#FF8C00']}
              style={styles.levelUpGradient}
            >
              <Text style={styles.levelUpText}>🎉 레벨업! 🎉</Text>
              <Text style={styles.levelUpSubText}>레벨 {newLevel} 달성!</Text>
            </LinearGradient>
          </Animated.View>
        )}






        {/* 헤더 */}
        <View style={styles.widgetHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.widgetTitle}>캐릭터 상태</Text>
            <Text style={styles.widgetSubtitle}>성장하는 나의 캐릭터</Text>
          </View>
          <TouchableOpacity style={styles.settingsButton} onPress={handleSettingsPress}>
            <Feather name="settings" size={18} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* 메인 캐릭터 섹션 */}
        <View style={styles.mainCharacterSection}>
          {/* 캐릭터 터치 영역 */}
          <TouchableOpacity 
            onPress={handleCharacterPress} 
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.8}
            style={styles.characterTouchArea}
          >
            <Animated.View
              style={[
                styles.characterWrapper,
                {
                  width: getCharacterSize().wrapperSize,
                  height: getCharacterSize().wrapperSize,
                  borderRadius: getCharacterSize().borderRadius,
                  transform: [
                    // 제자리에서 살짝 둥둥 떠있는 효과
                    { 
                      scale: 1, // 고정된 크기
                    },
                    {
                      translateY: smoothFloatAnim, // 살짝 둥둥 떠있는 위아래 움직임
                    },
                    {
                      translateX: smoothSwayAnim, // 살짝 둥둥 떠있는 좌우 움직임
                    },
                  ],
                  // shadowOpacity는 useNativeDriver: true에서 제거
                  // shadowOpacity: glowAnim.interpolate({
                  //   inputRange: [0, 1],
                  //   outputRange: [0.3, 0.8],
                  // }),
                },
              ]}
            >
              {/* 글로우 효과 */}
              <Animated.View
                style={[
                  styles.glowEffect,
                  {
                    top: getCharacterSize().glowOffset,
                    left: getCharacterSize().glowOffset,
                    right: getCharacterSize().glowOffset,
                    bottom: getCharacterSize().glowOffset,
                    borderRadius: getCharacterSize().glowRadius,
                    opacity: glowAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.6],
                    }),
                    transform: [
                      {
                        scale: glowAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.5],
                        }),
                      },
                      // 3D 글로우 효과
                      {
                        rotateZ: glowAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '10deg'],
                        }),
                      },
                    ],
                  },
                ]}
              />
              
              <Image
                source={getCharacterImage()}
                style={[
                  styles.characterImage,
                  {
                    width: getCharacterSize().imageSize,
                    height: getCharacterSize().imageSize,
                    borderRadius: getCharacterSize().borderRadius,
                  }
                ]}
                resizeMode="contain"
              />
              
              {/* 스파클 효과 */}
              {showSparkle && (
                <Animated.View
                  style={[
                    styles.sparkle,
                    {
                      top: getCharacterSize().sparkleOffset,
                      right: getCharacterSize().sparkleOffset,
                      width: getCharacterSize().sparkleSize,
                      height: getCharacterSize().sparkleSize,
                      opacity: sparkleAnim,
                      transform: [
                        {
                          scale: sparkleAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 1],
                          }),
                        },
                        // 3D 스파클 효과
                        {
                          rotateZ: sparkleAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '360deg'],
                          }),
                        },
                        {
                          rotateX: sparkleAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '180deg'],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <Text style={[
                    styles.sparkleText,
                    { fontSize: getCharacterSize().sparkleFontSize }
                  ]}>✨</Text>
                </Animated.View>
              )}
            </Animated.View>
          </TouchableOpacity>

          {/* 레벨 표시 */}
          <View style={[
            styles.levelDisplay,
            { marginTop: getCharacterSize().wrapperSize * 0.05 } // 0.1에서 0.05로 줄임
          ]}>
            <Text style={styles.levelText}>Lv.{currentLevel}</Text>
            <Text style={styles.levelDescription}>
              {currentLevel === 1 && '새로운 모험을 시작하는 초보자'}
              {currentLevel === 2 && '조금씩 성장하고 있는 학습자'}
              {currentLevel === 3 && '꾸준히 발전하는 성장자'}
              {currentLevel === 4 && '경험을 쌓아가는 중급자'}
              {currentLevel === 5 && '어느 정도 실력을 갖춘 숙련자'}
              {currentLevel === 6 && '전문성을 갖춘 전문가'}
              {currentLevel === 7 && '고급 기술을 보유한 마스터'}
              {currentLevel === 8 && '최고 수준의 엘리트'}
              {currentLevel === 9 && '전설적인 레전드'}
              {currentLevel === 10 && '궁극의 존재'}
            </Text>
          </View>
        </View>

        {/* 크레도 진행률 섹션 */}
        <View style={styles.xpSection}>
          <View style={styles.xpHeader}>
            <Text style={styles.xpTitle}>크레도</Text>
            <Text style={styles.xpValue}>
              {currentCredo} / {credoToNextLevel}
            </Text>
          </View>
          
          {/* 크레도 진행률 바 */}
          <View style={styles.progressBarContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  }),
                  backgroundColor: getProgressColor(),
                },
              ]}
            />
          </View>
          
          <Text style={styles.progressText}>
            다음 레벨까지 {credoToNextLevel - currentCredo} 크레도 필요
          </Text>
        </View>

        {/* 혜택확인 버튼 */}
        <TouchableOpacity style={styles.benefitButton} onPress={handleBenefitCheck}>
          <Text style={styles.benefitButtonText}>혜택확인</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* 캐릭터 선택 모달 */}
      <CharacterSelectionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelectCharacter={handleCharacterSelect}
        currentCharacter={currentCharacter}
        currentLevel={currentLevel}
      />

      {/* 혜택 확인 모달 */}
      {benefits && (
        <BenefitModal
          visible={showBenefitModal}
          onClose={() => setShowBenefitModal(false)}
          benefits={benefits}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  characterContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    minHeight: 380, // 450에서 380으로 줄임
    position: 'relative',
    overflow: 'hidden',
  },
  widgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  titleContainer: {
    flex: 1,
  },
  widgetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  widgetSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  settingsButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  mainCharacterSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16, // 24에서 16으로 줄임
    minHeight: 200, // 250에서 200으로 줄임
  },
  characterTouchArea: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5, // 10에서 5로 줄임
  },
  characterWrapper: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    // 입체적인 그림자 효과
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    // 중앙 정렬을 위한 추가 스타일
    alignSelf: 'center',
  },
  characterImage: {
    // 크기는 동적으로 설정됨
    // 입체적인 효과
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  glowEffect: {
    position: 'absolute',
    backgroundColor: '#FFD700',
    zIndex: -1,
    // 입체적인 글로우 효과
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  levelDisplay: {
    alignItems: 'center',
    // marginTop은 동적으로 설정됨
  },
  levelText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  levelDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  xpSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  xpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  xpValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  progressBarContainer: {
    width: '100%',
    height: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  benefitButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  benefitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  evolutionOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 10,
  },
  evolutionRing: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#FFD700',
    opacity: 0,
    transform: [{ scale: 0 }],
    zIndex: 1,
    // 입체적인 진화 링 효과
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 15,
    elevation: 12,
  },
  evolutionGlow: {
    position: 'absolute',
    backgroundColor: '#FFD700',
    opacity: 0,
    transform: [{ scale: 0 }],
    zIndex: 0,
    // 입체적인 진화 글로우 효과
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 25,
    elevation: 15,
  },
  evolutionParticles: {
    position: 'absolute',
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
  },
  evolutionParticleText: {
    fontSize: 20,
    color: '#FFD700',
  },
  evolutionText: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -50 }],
    opacity: 0,
    zIndex: 2,
  },
  evolutionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  evolutionSubtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  levelUpNotification: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFD700',
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    zIndex: 9,
  },
  levelUpGradient: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  levelUpText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  levelUpSubText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 4,
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFD700',
  },
  particle1: {
    top: '20%',
    left: '20%',
  },
  particle2: {
    top: '20%',
    right: '20%',
  },
  particle3: {
    bottom: '20%',
    left: '20%',
  },
  particle4: {
    bottom: '20%',
    right: '20%',
  },
  particle5: {
    top: '50%',
    left: '50%',
    marginLeft: -4,
    marginTop: -4,
  },
  particle6: {
    top: '50%',
    left: '50%',
    marginLeft: -4,
    marginTop: -4,
  },

  sparkle: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
    // 입체적인 스파클 효과
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 3,
  },
  sparkleText: {
    color: '#FFD700',
  },
});
