import React from 'react';
import { View, Text } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  withDelay,
  interpolate
} from 'react-native-reanimated';

interface Skill {
  name: string;
  level: number;
  maxLevel: number;
  experience: number;
  color: string;
}

interface SkillGaugeProps {
  skill: Skill;
  delay?: number;
}

export function SkillGauge({ skill, delay = 0 }: SkillGaugeProps) {
  const progressValue = useSharedValue(0);
  const shimmerPosition = useSharedValue(-100);

  React.useEffect(() => {
    // 진행률 애니메이션
    progressValue.value = withDelay(
      delay * 200,
      withTiming(skill.experience / 100, { duration: 1000 })
    );

    // 반짝이는 효과
    setTimeout(() => {
      shimmerPosition.value = withTiming(200, { duration: 1500 });
    }, delay * 200 + 1000);
  }, [skill.experience, delay]);

  const progressAnimatedStyle = useAnimatedStyle(() => {
    const width = interpolate(progressValue.value, [0, 1], [0, 100]);
    return {
      width: `${width}%`,
    };
  });

  const shimmerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerPosition.value }],
  }));

  const getColorStyle = (color: string) => {
    switch (color) {
      case 'bg-blue-500':
        return '#3B82F6';
      case 'bg-green-500':
        return '#10B981';
      case 'bg-purple-500':
        return '#8B5CF6';
      case 'bg-yellow-500':
        return '#F59E0B';
      case 'bg-red-500':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const skillColor = getColorStyle(skill.color);

  return (
    <View style={{ marginBottom: 16 }}>
      {/* 스킬 정보 헤더 */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 8
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: skillColor,
            marginRight: 8
          }} />
          <Text style={{ 
            fontSize: 14, 
            fontWeight: '600', 
            color: '#1F2937' 
          }}>
            {skill.name}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ 
            fontSize: 14, 
            fontWeight: 'bold', 
            color: '#374151' 
          }}>
            Lv.{skill.level}
          </Text>
          <Text style={{ 
            fontSize: 12, 
            color: '#9CA3AF',
            marginLeft: 4
          }}>
            /{skill.maxLevel}
          </Text>
        </View>
      </View>
      
      {/* 진행률 바 */}
      <View style={{ position: 'relative' }}>
        <View style={{
          width: '100%',
          height: 8,
          backgroundColor: '#E5E7EB',
          borderRadius: 4,
          overflow: 'hidden'
        }}>
          <Animated.View style={[
            progressAnimatedStyle,
            {
              height: '100%',
              backgroundColor: skillColor,
              borderRadius: 4,
              position: 'relative',
              overflow: 'hidden'
            }
          ]}>
            {/* 반짝이는 효과 */}
            <Animated.View style={[
              shimmerAnimatedStyle,
              {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255,255,255,0.3)',
                width: 20,
                transform: [{ skewX: '-12deg' }]
              }
            ]} />
          </Animated.View>
        </View>
        
        {/* XP 정보 */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between',
          marginTop: 4
        }}>
          <Text style={{ 
            fontSize: 11, 
            color: '#9CA3AF' 
          }}>
            {skill.experience}% XP
          </Text>
          <Text style={{ 
            fontSize: 11, 
            color: '#D1D5DB' 
          }}>
            다음 레벨까지 {100 - skill.experience}% 남음
          </Text>
        </View>
      </View>
    </View>
  );
}
