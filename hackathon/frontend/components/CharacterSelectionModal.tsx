import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

interface CharacterSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectCharacter: (characterType: string, level: number) => void;
  currentCharacter: string;
  currentLevel: number;
}

const { width } = Dimensions.get('window');

export default function CharacterSelectionModal({
  visible,
  onClose,
  onSelectCharacter,
  currentCharacter,
  currentLevel,
}: CharacterSelectionModalProps) {
  const [selectedCharacter, setSelectedCharacter] = useState(currentCharacter);

  const characters = [
    {
      id: 'pixel',
      name: '픽셀 캐릭터',
      description: '기본 픽셀 스타일 캐릭터',
      preview: require('../assets/character/1.png'),
    },
    {
      id: 'shinhan-bear',
      name: '신한곰',
      description: '신한은행 마스코트 곰돌이',
      preview: require('../assets/images/shinhan-bear/1단계.png'),
    },
  ];

  const handleConfirm = () => {
    onSelectCharacter(selectedCharacter, currentLevel); // 현재 레벨 유지
    onClose();
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
          {/* 헤더 */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>캐릭터 선택</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* 캐릭터 타입 선택 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>캐릭터 타입</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.characterTypeContainer}>
                {characters.map((character) => (
                  <TouchableOpacity
                    key={character.id}
                    style={[
                      styles.characterTypeCard,
                      selectedCharacter === character.id && styles.selectedCard,
                    ]}
                    onPress={() => setSelectedCharacter(character.id)}
                  >
                    <View style={styles.characterPreview}>
                      <Text style={styles.characterPreviewText}>
                        {character.id === 'pixel' ? '👾' : '🐻'}
                      </Text>
                    </View>
                    <Text style={styles.characterName}>{character.name}</Text>
                    <Text style={styles.characterDescription}>{character.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* 버튼 */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <Text style={styles.confirmButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: width * 0.9,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  characterTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  characterTypeCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    width: 120,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  characterPreview: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  characterPreviewText: {
    fontSize: 24,
  },
  characterName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  characterDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
