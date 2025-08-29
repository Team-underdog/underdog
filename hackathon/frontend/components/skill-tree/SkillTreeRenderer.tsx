import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Svg, Line, Circle, Text as SvgText, G, Rect } from 'react-native-svg';
import { SkillNode } from './OptimizedSkillTree';

interface SkillTreeRendererProps {
  skills: SkillNode[];
  category: 'academics' | 'finance';
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const SkillTreeRenderer: React.FC<SkillTreeRendererProps> = ({ skills, category }) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // 스킬트리 레이아웃 계산
  const calculateLayout = () => {
    const nodes = skills.map((skill, index) => {
      // 트리 구조에 따른 위치 계산
      let x, y;
      
      if (category === 'academics') {
        // 학사 스킬트리: 세로 중심선 기준으로 좌우 분기
        if (skill.id === 'attendance') {
          x = screenWidth * 0.5;
          y = 120;
        } else if (skill.id === 'study_plan') {
          x = screenWidth * 0.5;
          y = 220;
        } else if (skill.id === 'exam_prep') {
          x = screenWidth * 0.25;
          y = 320;
        } else if (skill.id === 'assignment') {
          x = screenWidth * 0.75;
          y = 320;
        }
      } else {
        // 금융 스킬트리: 가로 중심선 기준으로 상하 분기
        if (skill.id === 'budget_management') {
          x = screenWidth * 0.5;
          y = 120;
        } else if (skill.id === 'investment_knowledge') {
          x = screenWidth * 0.25;
          y = 220;
        } else if (skill.id === 'credit_management') {
          x = screenWidth * 0.75;
          y = 220;
        } else if (skill.id === 'saving_habit') {
          x = screenWidth * 0.5;
          y = 320;
        }
      }
      
      return { ...skill, x, y };
    });
    
    return nodes;
  };

  const nodes = calculateLayout();

  // 배경 그리드 패턴 그리기 - 이미지처럼 연한 파란색
  const renderBackgroundGrid = () => {
    const gridSize = 50;
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
          strokeWidth="0.8"
          opacity={0.4}
        />
      );
    }
    
    // 가로선
    for (let y = 0; y <= screenHeight * 0.8; y += gridSize) {
      lines.push(
        <Line
          key={`h-2`}
          x1={0}
          y1={y}
          x2={screenWidth}
          y2={y}
          stroke="#E0F2FE"
          strokeWidth="0.8"
          opacity={0.4}
        />
      );
    }
    
    return lines;
  };

  // 연결선 그리기
  const renderConnections = () => {
    const connections = [];
    
    if (category === 'academics') {
      // 학사 스킬트리 연결 - 이미지처럼 복잡한 분기 구조
      connections.push(
        { from: 'attendance', to: 'study_plan' },
        { from: 'study_plan', to: 'exam_prep' },
        { from: 'study_plan', to: 'assignment' },
        // 추가 분기 연결
        { from: 'exam_prep', to: 'assignment' }
      );
    } else {
      // 금융 스킬트리 연결 - 이미지처럼 복잡한 분기 구조
      connections.push(
        { from: 'budget_management', to: 'investment_knowledge' },
        { from: 'budget_management', to: 'credit_management' },
        { from: 'investment_knowledge', to: 'saving_habit' },
        { from: 'credit_management', to: 'saving_habit' },
        // 추가 분기 연결
        { from: 'investment_knowledge', to: 'credit_management' }
      );
    }

    return connections.map((connection, index) => {
      const fromNode = nodes.find(n => n.id === connection.from);
      const toNode = nodes.find(n => n.id === connection.to);
      
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

      return (
        <Line
          key={`connection-${index}`}
          x1={fromNode.x}
          y1={fromNode.y}
          x2={toNode.x}
          y2={toNode.y}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          markerEnd="url(#arrowhead)"
        />
      );
    });
  };

  // 화살표 마커 정의 - 이미지처럼 명확한 파란색
  const renderArrowMarker = () => (
    <defs>
      <marker
        id="arrowhead"
        markerWidth="12"
        markerHeight="8"
        refX="10"
        refY="4"
        orient="auto"
      >
        <polygon
          points="0 0, 12 4, 0 8"
          fill="#3B82F6"
        />
      </marker>
    </defs>
  );

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.svgContainer}>
        <Svg width={screenWidth} height={screenHeight * 0.8} style={styles.svg}>
          {/* 배경 그리드 패턴 */}
          {renderBackgroundGrid()}
          {renderArrowMarker()}
          {renderConnections()}
          
                  {/* 스킬 노드들 */}
        {nodes.map((node) => (
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
              fontSize="12"
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
              fontSize="10"
              textAnchor="middle"
              fill={getNodeTextColor(node.status)}
            >
              {getLevelText(node)}
            </SvgText>
          </G>
        ))}
        </Svg>
        
        {/* 터치 가능한 노드 오버레이 */}
        {nodes.map((node) => (
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
    case 'locked': return '#9ca3af';
    case 'unlockable': return '#d97706';
    case 'pending': return '#d97706';
    case 'acquired': return 'white';
    default: return '#9ca3af';
  }
};

const getNodeTextColor = (status: string) => {
  switch (status) {
    case 'locked': return '#6b7280';
    case 'unlockable': return '#92400e';
    case 'pending': return '#92400e';
    case 'acquired': return 'white';
    default: return '#6b7280';
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    alignItems: 'center',
  },
  svgContainer: {
    position: 'relative',
    width: screenWidth,
    height: screenHeight * 0.8,
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

export default SkillTreeRenderer;
