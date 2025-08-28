/**
 * Holland 문항 데이터베이스 구축 스크립트
 * 커리어넷 API를 한 번만 호출하여 모든 문항을 Holland 유형별로 분류하고 저장
 * 
 * 실행 방법:
 * 1. 이 파일을 Node.js 환경에서 실행
 * 2. 또는 React Native 앱에서 초기화 시 한 번만 실행
 */

import { CAREERNET_API_KEY } from '../config/apiKeys';

// React Native 환경에서 AsyncStorage 사용
let AsyncStorage: any = null;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (error) {
  // Node.js 환경에서는 AsyncStorage를 사용할 수 없음
  console.log('⚠️ AsyncStorage는 React Native 환경에서만 사용 가능합니다.');
}

// Holland 유형별 키워드 매핑 (전문가가 미리 분류한 기준)
const HOLLAND_KEYWORDS = {
  R: { // 현실형 (Realistic)
    keywords: [
      '수리', '고장', '기계', '도구', '건설', '제작', '기술', '물건', '조작', '설치',
      '건축', '전기', '배관', '목공', '금속', '플라스틱', '자동차', '로봇', '장비',
      '시설', '환경', '자연', '농업', '어업', '임업', '광업', '운송', '물류'
    ],
    description: '구체적이고 체계적인 작업을 선호하는 유형',
    skills: ['실행', '제작', '기술', '기계조작', '건설', '수리', '설치', '운영']
  },
  I: { // 탐구형 (Investigative)
    keywords: [
      '분석', '연구', '문제', '논리', '실험', '탐구', '가설', '검증', '과학', '수학',
      '컴퓨터', '프로그래밍', '데이터', '통계', '의학', '생물학', '화학', '물리학',
      '심리학', '사회학', '경제학', '철학', '역사', '고고학', '지질학', '천문학',
      '발명', '혁신', '창의', '아이디어', '이론', '원리', '법칙', '패턴'
    ],
    description: '논리적이고 분석적인 작업을 선호하는 유형',
    skills: ['문제해결', '분석', '연구', '논리적사고', '창의적사고', '실험', '탐구']
  },
  A: { // 예술형 (Artistic)
    keywords: [
      '창작', '디자인', '표현', '혁신', '예술', '창의', '자유', '상상', '감성',
      '음악', '미술', '문학', '연극', '영화', '사진', '패션', '인테리어', '건축',
      '웹디자인', '그래픽', '일러스트', '애니메이션', '편집', '기획', '스토리',
      '브랜딩', '마케팅', '광고', '홍보', '커뮤니케이션', '표현력', '상상력'
    ],
    description: '자유롭고 창의적인 표현을 선호하는 유형',
    skills: ['창작', '디자인', '표현', '혁신', '예술적감각', '상상력', '창의력']
  },
  S: { // 사회형 (Social)
    keywords: [
      '가르치기', '교육', '상담', '협력', '소통', '도움', '사람', '팀', '지원',
      '치료', '의료', '간호', '사회복지', '상담심리', '청소년', '노인', '장애인',
      '커뮤니티', '봉사', '자원봉사', '모금', '기부', '나눔', '공감', '이해',
      '조정', '중재', '협상', '화해', '평화', '인권', '정의', '평등'
    ],
    description: '사람들과의 상호작용을 선호하는 유형',
    skills: ['소통', '교육', '상담', '협력', '공감', '지원', '치료', '봉사']
  },
  E: { // 진취형 (Enterprising)
    keywords: [
      '이끌기', '리더', '팀', '계획', '설득', '프로젝트', '사업', '목표', '성과',
      '경영', '관리', '마케팅', '영업', '투자', '금융', '보험', '부동산', '무역',
      '정치', '법률', '언론', '방송', '미디어', '엔터테인먼트', '스포츠', '관광',
      '호텔', '레스토랑', '유통', '물류', '운송', '통신', 'IT', '소프트웨어'
    ],
    description: '리더십과 설득을 통한 성과 달성을 선호하는 유형',
    skills: ['리더십', '설득', '계획', '조직', '의사결정', '경영', '관리', '마케팅']
  },
  C: { // 관습형 (Conventional)
    keywords: [
      '정리', '계산', '기록', '검토', '품질', '정확', '체계', '관리', '감독',
      '회계', '세무', '재무', '인사', '총무', '기획', '조사', '통계', '분석',
      '보고서', '문서', '자료', '데이터', '정보', '시스템', '프로세스', '절차',
      '규정', '법규', '표준', '인증', '평가', '감사', '점검', '모니터링'
    ],
    description: '정확하고 체계적인 업무 처리를 선호하는 유형',
    skills: ['정리', '계산', '기록', '검토', '품질관리', '체계화', '표준화', '관리']
  }
};

// 커리어넷 API 호출 함수
async function fetchCareerNetData() {
  try {
    console.log('🚀 커리어넷 API에서 직업흥미검사(H) 문항 로드 시작...');
    
    // 1. 심리검사 목록 조회
    const testsResponse = await fetch(
      `https://www.career.go.kr/inspct/openapi/v2/tests?apikey=${CAREERNET_API_KEY}`
    );
    
    if (!testsResponse.ok) {
      throw new Error(`심리검사 목록 조회 실패: ${testsResponse.status}`);
    }
    
    const testsData = await testsResponse.json();
    console.log('✅ 심리검사 목록 로드 완료');
    
    // 2. 직업흥미검사(H) 문항 조회 (q=33)
    const questionsResponse = await fetch(
      `https://www.career.go.kr/inspct/openapi/v2/test?apikey=${CAREERNET_API_KEY}&q=33`
    );
    
    if (!questionsResponse.ok) {
      throw new Error(`문항 조회 실패: ${questionsResponse.status}`);
    }
    
    const questionsData = await questionsResponse.json();
    console.log('✅ 직업흥미검사(H) 문항 로드 완료');
    
    return { testsData, questionsData };
  } catch (error) {
    console.error('❌ 커리어넷 API 호출 실패:', error);
    throw error;
  }
}

// Holland 유형 자동 분류 함수
function classifyQuestionByHollandType(questionText: string): {
  type: keyof typeof HOLLAND_KEYWORDS;
  confidence: number;
  matchedKeywords: string[];
} {
  const text = questionText.toLowerCase();
  let bestMatch = { type: 'R' as keyof typeof HOLLAND_KEYWORDS, confidence: 0, matchedKeywords: [] as string[] };
  
  Object.entries(HOLLAND_KEYWORDS).forEach(([type, data]) => {
    const matchedKeywords = data.keywords.filter(keyword => text.includes(keyword));
    const confidence = matchedKeywords.length / data.keywords.length;
    
    if (confidence > bestMatch.confidence) {
      bestMatch = {
        type: type as keyof typeof HOLLAND_KEYWORDS,
        confidence,
        matchedKeywords
      };
    }
  });
  
  return bestMatch;
}

// Holland 데이터베이스 구축 함수
async function buildHollandDatabase() {
  try {
    console.log('🏗️ Holland 문항 데이터베이스 구축 시작...');
    
    // 1. 커리어넷 API에서 데이터 로드
    const { testsData, questionsData } = await fetchCareerNetData();
    
    // 2. 문항들을 Holland 유형별로 분류
    const hollandDatabase: {
      [key in keyof typeof HOLLAND_KEYWORDS]: Array<{
        id: string;
        originalText: string;
        type: key;
        confidence: number;
        matchedKeywords: string[];
        category: string;
        weight: number;
      }>;
    } = {
      R: [], I: [], A: [], S: [], E: [], C: []
    };
    
    // 3. 각 문항을 Holland 유형별로 분류
    if (questionsData.questions && Array.isArray(questionsData.questions)) {
      questionsData.questions.forEach((question: any, index: number) => {
        const questionText = question.question || question.text || `문항 ${index + 1}`;
        const classification = classifyQuestionByHollandType(questionText);
        
        const questionItem = {
          id: question.qno?.toString() || `Q${index + 1}`,
          originalText: questionText,
          type: classification.type,
          confidence: classification.confidence,
          matchedKeywords: classification.matchedKeywords,
          category: question.category || '일반',
          weight: 1.0
        };
        
        hollandDatabase[classification.type].push(questionItem);
      });
    }
    
    // 4. 분류 결과 통계
    const totalQuestions = Object.values(hollandDatabase).reduce((sum, questions) => sum + questions.length, 0);
    console.log(`📊 Holland 유형별 분류 완료: 총 ${totalQuestions}개 문항`);
    
    Object.entries(hollandDatabase).forEach(([type, questions]) => {
      console.log(`  ${type} (${HOLLAND_KEYWORDS[type as keyof typeof HOLLAND_KEYWORDS].description}): ${questions.length}개`);
    });
    
    // 5. 데이터베이스 저장 (로컬 스토리지 또는 파일)
    const databaseToSave = {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      totalQuestions,
      hollandDatabase,
      metadata: {
        source: 'career.go.kr',
        testType: '직업흥미검사(H)',
        testNumber: 33,
        keywords: HOLLAND_KEYWORDS
      }
    };
    
    // 6. 로컬 스토리지에 저장 (React Native 환경)
    if (AsyncStorage) {
      try {
        await AsyncStorage.setItem('hollandDatabase', JSON.stringify(databaseToSave));
        console.log('💾 Holland 데이터베이스를 AsyncStorage에 저장 완료');
      } catch (error) {
        console.error('❌ AsyncStorage 저장 실패:', error);
      }
    } else if (typeof localStorage !== 'undefined') {
      // 웹 환경에서 localStorage 사용
      localStorage.setItem('hollandDatabase', JSON.stringify(databaseToSave));
      console.log('💾 Holland 데이터베이스를 localStorage에 저장 완료');
    }
    
    // 7. 파일로 저장 (Node.js 환경) - React Native에서는 제외
    // React Native 환경에서는 AsyncStorage만 사용
    if (typeof require !== 'undefined' && typeof window === 'undefined') {
      try {
        const fs = require('fs');
        const path = require('path');
        
        const outputPath = path.join(__dirname, '../data/hollandDatabase.json');
        const outputDir = path.dirname(outputPath);
        
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        
        fs.writeFileSync(outputPath, JSON.stringify(databaseToSave, null, 2));
        console.log(`💾 Holland 데이터베이스를 파일에 저장 완료: ${outputPath}`);
      } catch (error) {
        console.log('⚠️ 파일 저장은 Node.js 환경에서만 지원됩니다.');
      }
    }
    
    return databaseToSave;
    
  } catch (error) {
    console.error('❌ Holland 데이터베이스 구축 실패:', error);
    throw error;
  }
}

// 데이터베이스 검증 함수
function validateHollandDatabase(database: any): boolean {
  try {
    // 필수 필드 검증
    if (!database.version || !database.hollandDatabase || !database.totalQuestions) {
      return false;
    }
    
    // Holland 유형별 데이터 검증
    const requiredTypes = ['R', 'I', 'A', 'S', 'E', 'C'];
    const hasAllTypes = requiredTypes.every(type => 
      database.hollandDatabase[type] && Array.isArray(database.hollandDatabase[type])
    );
    
    if (!hasAllTypes) {
      return false;
    }
    
    // 문항 데이터 검증
    const totalQuestions = Object.values(database.hollandDatabase).reduce(
      (sum: number, questions: any[]) => sum + questions.length, 0
    );
    
    if (totalQuestions !== database.totalQuestions) {
      return false;
    }
    
    console.log('✅ Holland 데이터베이스 검증 완료');
    return true;
    
  } catch (error) {
    console.error('❌ Holland 데이터베이스 검증 실패:', error);
    return false;
  }
}

// 메인 실행 함수
async function main() {
  try {
    console.log('🎯 Holland 문항 데이터베이스 구축 시작');
    console.log('=' .repeat(50));
    
    // 1. 데이터베이스 구축
    const database = await buildHollandDatabase();
    
    // 2. 데이터베이스 검증
    if (validateHollandDatabase(database)) {
      console.log('🎉 Holland 데이터베이스 구축 완료!');
      console.log('이제 이 데이터베이스를 사용하여 AI 모델을 실행할 수 있습니다.');
    } else {
      console.error('❌ 데이터베이스 검증 실패');
    }
    
  } catch (error) {
    console.error('❌ 메인 실행 실패:', error);
    process.exit(1);
  }
}

// 스크립트 실행 (Node.js 환경에서만)
// React Native에서는 자동 실행하지 않음
if (typeof require !== 'undefined' && require.main === module && typeof window === 'undefined') {
  main();
}

// React Native 환경에서 사용할 수 있도록 export
export {
  buildHollandDatabase,
  validateHollandDatabase,
  HOLLAND_KEYWORDS,
  classifyQuestionByHollandType
};
