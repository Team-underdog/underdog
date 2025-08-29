import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Svg, Line, Rect, Text as SvgText, G, Defs, Polygon } from 'react-native-svg';
import { SKILLS_DATA, SKILLS_CONNECTIONS } from './skillsData';

interface GameSkillTreeProps {
  category: 'academics' | 'finance';
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const GameSkillTree: React.FC<GameSkillTreeProps> = ({ category }) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const skills = SKILLS_DATA[category];
  const connections = SKILLS_CONNECTIONS[category];

  // 스킬 ID로 좌표를 쉽게 찾기 위한 맵
  const skillMap = skills.reduce((acc, skill) => {
    acc[skill.id] = skill;
    return acc;
  }, {});

  // 배경 그리드 패턴 그리기 - 이미지처럼 연한 파란색
  const renderBackgroundGrid = () => {
    const gridSize = 60;
    const lines = [];
    
    // 세로선
    for (let x = 0; x <= screenWidth; x += gridSize) {
      lines.push(
        <Line
          key={`v-${x}`}
          x1={x}
          y1={0}
          x2={x}
          y2={screenHeight * 0.8}
          stroke="#E0F2FE"
          strokeWidth="1"
          opacity={0.3}
        />
      );
    }
    
    // 가로선
    for (let y = 0; y <= screenHeight * 0.8; y += gridSize) {
      lines.push(
        <Line
          key={`h-${y}`}
          x1={0}
          y1={y}
          x2={screenWidth}
          y2={y}
          stroke="#E0F2FE"
          strokeWidth="1"
          opacity={0.3}
        />
      );
    }
    
    return lines;
  };

  // 화살표 마커 정의 - 이미지처럼 명확한 파란색
  const renderArrowMarker = () => null; // marker 대신 직접 화살표 그리기

  // 연결선 그리기 - 이미지처럼 명확한 파란색
  const renderConnections = () => {
    return connections.map((conn, index) => {
      const fromNode = skillMap[conn.from];
      const toNode = skillMap[conn.to];
      
      if (!fromNode || !toNode) return null;

      // 연결선 스타일 결정 - 이미지처럼 명확한 파란색
      let strokeColor = '#3B82F6';
      let strokeWidth = 3;
      let strokeDasharray = 'none';
      
      if (fromNode.status === 'acquired' && toNode.status !== 'locked') {
        strokeColor = '#3B82F6';
        strokeWidth = 3;
        strokeDasharray = 'none';
      } else if (toNode.status === 'unlockable') {
        strokeColor = '#F59E0B';
        strokeWidth = 2.5;
        strokeDasharray = 'none';
      } else if (toNode.status === 'locked') {
        strokeColor = '#E5E7EB';
        strokeWidth = 2;
        strokeDasharray = '5,5';
      }

      // 화살표 끝점 계산
      const dx = toNode.x - fromNode.x;
      const dy = toNode.y - fromNode.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const unitX = dx / length;
      const unitY = dy / length;
      
      // 화살표 끝점 (노드 가장자리)
      const arrowEndX = toNode.x - unitX * 35;
      const arrowEndY = toNode.y - unitY * 35;
      
      // 화살표 날개 점들
      const arrowSize = 8;
      const arrowAngle = Math.PI / 6; // 30도
      
      const angle1 = Math.atan2(dy, dx) + arrowAngle;
      const angle2 = Math.atan2(dy, dx) - arrowAngle;
      
      const arrow1X = arrowEndX - arrowSize * Math.cos(angle1);
      const arrow1Y = arrowEndY - arrowSize * Math.sin(angle1);
      const arrow2X = arrowEndX - arrowSize * Math.cos(angle2);
      const arrow2Y = arrowEndY - arrowSize * Math.sin(angle2);

      return (
        <G key={`connection-${index}`}>
          {/* 연결선 */}
          <Line
            x1={fromNode.x}
            y1={fromNode.y}
            x2={arrowEndX}
            y2={arrowEndY}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
          />
          {/* 화살표 */}
          <Polygon
            points={`${arrowEndX},${arrowEndY} ${arrow1X},${arrow1Y} ${arrow2X},${arrow2Y}`}
            fill={strokeColor}
          />
        </G>
      );
    });
  };

  // 노드 스타일 헬퍼 함수들 - 이미지처럼 명확한 색상
  const getNodeBackgroundColor = (status: string) => {
    switch (status) {
      case 'locked': return '#F3F4F6';
      case 'unlockable': return '#FEF3C7';
      case 'pending': return '#FEF3C7';
      case 'acquired': return '#3B82F6';
      default: return '#F3F4F6';
    }
  };

  const getNodeBorderColor = (status: string) => {
    switch (status) {
      case 'locked': return '#E5E7EB';
      case 'unlockable': return '#F59E0B';
      case 'pending': return '#F59E0B';
      case 'acquired': return '#3B82F6';
      default: return '#E5E7EB';
    }
  };

  const getNodeIconColor = (status: string) => {
    switch (status) {
      case 'locked': return '#9CA3AF';
      case 'unlockable': return '#92400E';
      case 'pending': return '#92400E';
      case 'acquired': return '#FFFFFF';
      default: return '#9CA3AF';
    }
  };

  const getNodeTextColor = (status: string) => {
    switch (status) {
      case 'locked': return '#6B7280';
      case 'unlockable': return '#92400E';
      case 'pending': return '#92400E';
      case 'acquired': return '#FFFFFF';
      default: return '#6B7280';
    }
  };

  const getLevelText = (node: any) => {
    if (node.status === 'locked') {
      return '??/??';
    } else if (node.status === 'acquired') {
      return `${node.level}/${node.maxLevel}`;
    } else if (node.status === 'pending') {
      return `${node.level}/${node.maxLevel}`;
    } else {
      return `${node.level}/${node.maxLevel}`;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'locked': return '잠김';
      case 'unlockable': return '해금 가능';
      case 'pending': return '인증 대기중';
      case 'acquired': return '획득 완료';
      default: return '잠김';
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.svgContainer}>
        <Svg width={screenWidth} height={screenHeight * 0.8} style={styles.svg}>
          {renderBackgroundGrid()}
          {renderConnections()}
          
          {/* 스킬 노드들 - 이미지처럼 사각형 */}
          {skills.map((node) => (
            <G key={node.id}>
              {/* 노드 배경 사각형 (이미지처럼) */}
              <Rect
                x={node.x - 35}
                y={node.y - 35}
                width="70"
                height="70"
                rx="8"
                fill={getNodeBackgroundColor(node.status)}
                stroke={getNodeBorderColor(node.status)}
                strokeWidth={selectedNode === node.id ? 3 : 2}
                opacity={selectedNode === node.id ? 0.9 : 1}
              />
              
              {/* 스킬 아이콘 */}
              <SvgText
                x={node.x}
                y={node.y - 5}
                fontSize="24"
                textAnchor="middle"
                fill={getNodeIconColor(node.status)}
              >
                {node.icon}
              </SvgText>
              
              {/* 스킬 이름 */}
              <SvgText
                x={node.x}
                y={node.y + 15}
                fontSize="10"
                textAnchor="middle"
                fill={getNodeTextColor(node.status)}
                fontWeight="bold"
              >
                {node.name}
              </SvgText>
              
              {/* 스킬 레벨 표시 (이미지처럼 X/Y 형태) */}
              <SvgText
                x={node.x}
                y={node.y + 30}
                fontSize="9"
                textAnchor="middle"
                fill={getNodeTextColor(node.status)}
              >
                {getLevelText(node)}
              </SvgText>
            </G>
          ))}
        </Svg>
        
        {/* 터치 가능한 노드 오버레이 */}
        {skills.map((node) => (
          <TouchableOpacity
            key={`touch-${node.id}`}
            style={[
              styles.touchableNode,
              {
                left: node.x - 35,
                top: node.y - 35,
                width: 70,
                height: 70,
              }
            ]}
            onPress={() => {
              setSelectedNode(node.id);
              Alert.alert(
                node.name,
                `${node.description}\n\n상태: ${getStatusText(node.status)}\n\n${node.benefits.join('\n')}`,
                [{ text: '확인', onPress: () => setSelectedNode(null) }]
              );
            }}
            activeOpacity={0.7}
          />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  svgContainer: {
    position: 'relative',
  },
  svg: {
    backgroundColor: 'transparent',
  },
  touchableNode: {
    position: 'absolute',
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
});

export default GameSkillTree;
