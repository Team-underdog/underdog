import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface CharacterSelectionProps {
  currentLevel: number;
  onCharacterSelect?: (level: number) => void;
  visible: boolean;
  onClose: () => void;
}

export const CharacterSelection: React.FC<CharacterSelectionProps> = ({
  currentLevel,
  onCharacterSelect,
  visible,
  onClose
}) => {
  const [selectedLevel, setSelectedLevel] = useState(currentLevel);

  const characters = Array.from({ length: 10 }, (_, i) => i + 1);

  const handleCharacterSelect = (level: number) => {
    setSelectedLevel(level);
    onCharacterSelect?.(level);
  };

  // 레벨에 따른 캐릭터 이미지 결정
  const getCharacterImage = (level: number) => {
    switch (level) {
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
  };

  const getLevelRequirement = (level: number) => {
    // 레벨별 크레도 요구사항 (예시)
    const requirements = {
      1: 0,
      2: 100,
      3: 250,
      4: 500,
      5: 1000,
      6: 2000,
      7: 3500,
      8: 5000,
      9: 7500,
      10: 10000
    };
    return requirements[level as keyof typeof requirements] || 0;
  };

  const isLevelUnlocked = (level: number) => {
    return level <= currentLevel;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>캐릭터 선택</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.characterGrid} showsVerticalScrollIndicator={false}>
            {characters.map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.characterItem,
                  selectedLevel === level && styles.selectedCharacter,
                  !isLevelUnlocked(level) && styles.lockedCharacter
                ]}
                onPress={() => isLevelUnlocked(level) && handleCharacterSelect(level)}
                disabled={!isLevelUnlocked(level)}
              >
                <Image
                  source={getCharacterImage(level)}
                  style={styles.characterImage}
                  resizeMode="contain"
                />
                
                <View style={styles.characterInfo}>
                  <Text style={[
                    styles.levelText,
                    selectedLevel === level && styles.selectedLevelText
                  ]}>
                    레벨 {level}
                  </Text>
                  
                  {isLevelUnlocked(level) ? (
                    <Text style={styles.unlockedText}>해금됨</Text>
                  ) : (
                    <Text style={styles.lockedText}>
                      {getLevelRequirement(level)} 크레도 필요
                    </Text>
                  )}
                </View>

                {selectedLevel === level && (
                  <View style={styles.selectedIndicator}>
                    <Text style={styles.selectedIndicatorText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => {
                onCharacterSelect?.(selectedLevel);
                onClose();
              }}
            >
              <LinearGradient
                colors={['#4CAF50', '#8BC34A']}
                style={styles.selectButtonGradient}
              >
                <Text style={styles.selectButtonText}>선택하기</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  characterGrid: {
    flex: 1,
  },
  characterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCharacter: {
    borderColor: '#4CAF50',
    backgroundColor: '#e8f5e8',
  },
  lockedCharacter: {
    opacity: 0.5,
    backgroundColor: '#f0f0f0',
  },
  characterImage: {
    width: 60,
    height: 60,
    marginRight: 15,
  },
  characterInfo: {
    flex: 1,
  },
  levelText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  selectedLevelText: {
    color: '#4CAF50',
  },
  unlockedText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  lockedText: {
    fontSize: 14,
    color: '#999',
  },
  selectedIndicator: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicatorText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  selectButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  selectButtonGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
