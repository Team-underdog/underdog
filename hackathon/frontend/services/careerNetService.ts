import { CAREERNET_API_KEY, CAREERNET_BASE_URL } from '../config/apiKeys';

/**
 * 커리어넷 API 서비스
 * 직업 정보, 자격증 정보, 학과 정보, 진로심리검사 등을 조회합니다.
 */
export class CareerNetService {
  private static instance: CareerNetService;
  private apiKey: string;
  private baseUrl: string;

  // 진로심리검사 API 엔드포인트
  private readonly PSYCHOLOGY_TEST_ENDPOINTS = {
    TEST_LIST: 'https://www.career.go.kr/inspct/openapi/v2/tests',
    TEST_QUESTIONS: 'https://www.career.go.kr/inspct/openapi/v2/test',
    TEST_RESULT: 'https://www.career.go.kr/inspct/openapi/v2/report'
  };

  private constructor() {
    this.apiKey = CAREERNET_API_KEY;
    this.baseUrl = CAREERNET_BASE_URL;
  }

  public static getInstance(): CareerNetService {
    if (!CareerNetService.instance) {
      CareerNetService.instance = new CareerNetService();
    }
    return CareerNetService.instance;
  }

  /**
   * 직업 정보 검색
   * @param keyword 검색 키워드
   * @param page 페이지 번호
   * @param limit 페이지당 결과 수
   */
  async searchJobs(keyword: string, page: number = 1, limit: number = 10) {
    try {
      const url = `${this.baseUrl}/jobInfo`;
      const params = new URLSearchParams({
        apiKey: this.apiKey,
        keyword: keyword,
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`${url}?${params}`);
      
      if (!response.ok) {
        throw new Error(`커리어넷 API 오류: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('직업 정보 검색 실패:', error);
      throw error;
    }
  }

  /**
   * 자격증 정보 검색
   * @param keyword 검색 키워드
   * @param page 페이지 번호
   * @param limit 페이지당 결과 수
   */
  async searchCertificates(keyword: string, page: number = 1, limit: number = 10) {
    try {
      const url = `${this.baseUrl}/certificate`;
      const params = new URLSearchParams({
        apiKey: this.apiKey,
        keyword: keyword,
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`${url}?${params}`);
      
      if (!response.ok) {
        throw new Error(`커리어넷 API 오류: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('자격증 정보 검색 실패:', error);
      throw error;
    }
  }

  /**
   * 학과 정보 검색
   * @param keyword 검색 키워드
   * @param page 페이지 번호
   * @param limit 페이지당 결과 수
   */
  async searchMajors(keyword: string, page: number = 1, limit: number = 10) {
    try {
      const url = `${this.baseUrl}/major`;
      const params = new URLSearchParams({
        apiKey: this.apiKey,
        keyword: keyword,
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`${url}?${params}`);
      
      if (!response.ok) {
        throw new Error(`커리어넷 API 오류: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('학과 정보 검색 실패:', error);
      throw error;
    }
  }

  /**
   * 직업 상세 정보 조회
   * @param jobCode 직업 코드
   */
  async getJobDetail(jobCode: string) {
    try {
      const url = `${this.baseUrl}/jobInfo/${jobCode}`;
      const params = new URLSearchParams({
        apiKey: this.apiKey,
      });

      const response = await fetch(`${url}?${params}`);
      
      if (!response.ok) {
        throw new Error(`커리어넷 API 오류: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('직업 상세 정보 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 자격증 상세 정보 조회
   * @param certCode 자격증 코드
   */
  async getCertificateDetail(certCode: string) {
    try {
      const url = `${this.baseUrl}/certificate/${certCode}`;
      const params = new URLSearchParams({
        apiKey: this.apiKey,
      });

      const response = await fetch(`${url}?${params}`);
      
      if (!response.ok) {
        throw new Error(`커리어넷 API 오류: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('자격증 상세 정보 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 학과 상세 정보 조회
   * @param majorCode 학과 코드
   */
  async getMajorDetail(majorCode: string) {
    try {
      const url = `${this.baseUrl}/major/${majorCode}`;
      const params = new URLSearchParams({
        apiKey: this.apiKey,
      });

      const response = await fetch(`${url}?${params}`);
      
      if (!response.ok) {
        throw new Error(`커리어넷 API 오류: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('학과 상세 정보 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 진로심리검사 목록 조회
   */
  async getPsychologyTests(): Promise<any> {
    try {
      const url = `${this.PSYCHOLOGY_TEST_ENDPOINTS.TEST_LIST}?apikey=${this.apiKey}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`진로심리검사 목록 조회 실패: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('진로심리검사 목록 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 직업흥미검사(H) 문항 조회
   * @param testNumber 심리검사 번호 (기본값: 33 - 직업흥미검사)
   */
  async getPsychologyTestQuestions(testNumber: number = 33): Promise<any> {
    try {
      const url = `${this.PSYCHOLOGY_TEST_ENDPOINTS.TEST_QUESTIONS}?apikey=${this.apiKey}&q=${testNumber}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`심리검사 문항 조회 실패: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('심리검사 문항 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 직업흥미검사(H) 전용 문항 조회
   * Holland 유형별로 분류된 문항들을 반환
   */
  async getHollandTestQuestions(): Promise<any> {
    try {
      // 1. 먼저 심리검사 목록에서 직업흥미검사(H) 정보 확인
      const testsList = await this.getPsychologyTests();
      
      // 2. 직업흥미검사(H)의 문항들 조회
      const questions = await this.getPsychologyTestQuestions(33);
      
      // 3. Holland 유형별로 문항 분류
      const hollandQuestions = this.classifyQuestionsByHollandType(questions);
      
      return {
        testInfo: testsList,
        questions: questions,
        hollandQuestions: hollandQuestions
      };
    } catch (error) {
      console.error('Holland 검사 문항 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 문항들을 Holland 유형별로 분류
   * @param questions API에서 받은 원본 문항 데이터
   */
  private classifyQuestionsByHollandType(questions: any): any {
    // TODO: 실제 API 응답 구조에 맞게 파싱 로직 구현
    // 현재는 기본 구조만 반환
    return {
      R: [], // 현실형
      I: [], // 탐구형
      A: [], // 예술형
      S: [], // 사회형
      E: [], // 진취형
      C: []  // 관습형
    };
  }

  /**
   * API 키 유효성 검증
   */
  async validateAPIKey(): Promise<boolean> {
    try {
      // 진로심리검사 목록 조회로 키 유효성 검증
      const response = await fetch(`${this.PSYCHOLOGY_TEST_ENDPOINTS.TEST_LIST}?apikey=${this.apiKey}`);
      return response.ok;
    } catch (error) {
      console.error('API 키 유효성 검증 실패:', error);
      return false;
    }
  }

  /**
   * 추천 직업 조회 (사용자 관심사 기반)
   * @param interests 관심사 배열
   * @param limit 결과 수 제한
   */
  async getRecommendedJobs(interests: string[], limit: number = 5) {
    try {
      // 관심사별로 직업 검색하여 추천
      const recommendations = [];
      
      for (const interest of interests.slice(0, 3)) { // 최대 3개 관심사만 사용
        const jobs = await this.searchJobs(interest, 1, Math.ceil(limit / 3));
        if (jobs && jobs.data) {
          recommendations.push(...jobs.data.slice(0, Math.ceil(limit / 3)));
        }
      }

      // 중복 제거 및 정렬
      const uniqueJobs = recommendations.filter((job, index, self) => 
        index === self.findIndex(j => j.jobCode === job.jobCode)
      );

      return uniqueJobs.slice(0, limit);
    } catch (error) {
      console.error('추천 직업 조회 실패:', error);
      return [];
    }
  }
}

// 싱글톤 인스턴스 export
export default CareerNetService.getInstance();
