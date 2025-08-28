import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import careerNetService from '../services/careerNetService';

/**
 * 커리어넷 API 테스트 컴포넌트
 * 개발 중에 API 기능을 테스트할 수 있습니다.
 */
const CareerNetTest: React.FC = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchType, setSearchType] = useState<'jobs' | 'certificates' | 'majors'>('jobs');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      Alert.alert('알림', '검색어를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      let results;
      
      switch (searchType) {
        case 'jobs':
          results = await careerNetService.searchJobs(searchKeyword, 1, 10);
          break;
        case 'certificates':
          results = await careerNetService.searchCertificates(searchKeyword, 1, 10);
          break;
        case 'majors':
          results = await careerNetService.searchMajors(searchKeyword, 1, 10);
          break;
        default:
          results = await careerNetService.searchJobs(searchKeyword, 1, 10);
      }

      if (results && results.data) {
        setSearchResults(results.data);
      } else {
        setSearchResults([]);
        Alert.alert('알림', '검색 결과가 없습니다.');
      }
    } catch (error) {
      console.error('검색 실패:', error);
      Alert.alert('오류', '검색 중 오류가 발생했습니다.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getSearchTypeLabel = (type: string) => {
    switch (type) {
      case 'jobs': return '직업';
      case 'certificates': return '자격증';
      case 'majors': return '학과';
      default: return '직업';
    }
  };

  const getSearchTypeIcon = (type: string) => {
    switch (type) {
      case 'jobs': return 'briefcase';
      case 'certificates': return 'award';
      case 'majors': return 'book';
      default: return 'search';
    }
  };

  const renderSearchResult = (item: any, index: number) => {
    const title = item.jobName || item.certificateName || item.majorName || '제목 없음';
    const description = item.description || item.summary || '설명 없음';
    
    return (
      <View key={index} style={styles.resultItem}>
        <Text style={styles.resultTitle}>{title}</Text>
        <Text style={styles.resultDescription} numberOfLines={3}>
          {description}
        </Text>
        <View style={styles.resultMeta}>
          <Text style={styles.resultMetaText}>
            {item.jobCode || item.certificateCode || item.majorCode || '코드 없음'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>커리어넷 API 테스트</Text>
      
      {/* 검색 타입 선택 */}
      <View style={styles.searchTypeContainer}>
        {(['jobs', 'certificates', 'majors'] as const).map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.searchTypeButton,
              searchType === type && styles.searchTypeButtonActive
            ]}
            onPress={() => setSearchType(type)}
          >
            <Feather 
              name={getSearchTypeIcon(type)} 
              size={16} 
              color={searchType === type ? '#FFFFFF' : '#666666'} 
            />
            <Text style={[
              styles.searchTypeText,
              searchType === type && styles.searchTypeTextActive
            ]}>
              {getSearchTypeLabel(type)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 검색 입력 */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={`${getSearchTypeLabel(searchType)} 검색어를 입력하세요`}
          value={searchKeyword}
          onChangeText={setSearchKeyword}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={isLoading}
        >
          <Feather 
            name="search" 
            size={20} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>
      </View>

      {/* 검색 결과 */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>
          검색 결과 ({searchResults.length}개)
        </Text>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>검색 중...</Text>
          </View>
        ) : (
          <ScrollView style={styles.resultsList}>
            {searchResults.length > 0 ? (
              searchResults.map(renderSearchResult)
            ) : (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>
                  검색 결과가 없습니다.
                </Text>
                <Text style={styles.noResultsSubtext}>
                  다른 검색어를 시도해보세요.
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>

      {/* API 키 상태 확인 */}
      <TouchableOpacity
        style={styles.apiKeyButton}
        onPress={async () => {
          try {
            const isValid = await careerNetService.validateAPIKey();
            Alert.alert(
              'API 키 상태',
              isValid ? 'API 키가 유효합니다.' : 'API 키가 유효하지 않습니다.'
            );
          } catch (error) {
            Alert.alert('오류', 'API 키 검증 중 오류가 발생했습니다.');
          }
        }}
      >
        <Text style={styles.apiKeyButtonText}>API 키 상태 확인</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 20,
  },
  
  searchTypeContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  
  searchTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  
  searchTypeButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  
  searchTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  
  searchTypeTextActive: {
    color: '#FFFFFF',
  },
  
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  
  searchInput: {
    flex: 1,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 16,
  },
  
  searchButton: {
    padding: 15,
    backgroundColor: '#10B981',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  resultsContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 15,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
  
  resultsList: {
    flex: 1,
  },
  
  resultItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 10,
  },
  
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  
  resultDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  
  resultMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  resultMetaText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  
  noResultsText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 5,
  },
  
  noResultsSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  
  apiKeyButton: {
    padding: 15,
    backgroundColor: '#8B5CF6',
    borderRadius: 10,
    alignItems: 'center',
  },
  
  apiKeyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CareerNetTest;
