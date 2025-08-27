import { authToken } from './authService';

const API_BASE_URL = 'http://localhost:8000/api';

export interface AcademicRecord {
  id: number;
  student_id: string;
  university: string;
  department: string;
  major?: string;
  grade_level: number;
  semester: number;
  enrollment_status: string;
  total_credits: number;
  required_credits: number;
  gpa: number;
  major_gpa?: number;
  expected_graduation?: string;
  graduation_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: number;
  course_code: string;
  course_name: string;
  course_type: string;
  credits: number;
  grade: string;
  grade_point: number;
  year: number;
  semester: number;
  created_at: string;
}

export interface Scholarship {
  id: number;
  scholarship_name: string;
  scholarship_type: string;
  amount: number;
  semester: string;
  year: number;
  status: string;
  created_at: string;
}

export interface AcademicSummary {
  academic_record: AcademicRecord;
  courses: Course[];
  scholarships: Scholarship[];
  credit_progress: number;
  graduation_progress: number;
}

class AcademicService {
  private async getAuthHeaders() {
    const token = await authToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  async getAcademicRecord(): Promise<AcademicRecord> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/academic/record`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`학사 정보 조회 실패: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('학사 정보 조회 오류:', error);
      throw error;
    }
  }

  async getCourses(): Promise<Course[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/academic/courses`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`수강 과목 조회 실패: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('수강 과목 조회 오류:', error);
      throw error;
    }
  }

  async getScholarships(): Promise<Scholarship[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/academic/scholarships`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`장학금 정보 조회 실패: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('장학금 정보 조회 오류:', error);
      throw error;
    }
  }

  async getAcademicSummary(): Promise<AcademicSummary> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/academic/summary`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`학사 요약 정보 조회 실패: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('학사 요약 정보 조회 오류:', error);
      throw error;
    }
  }
}

export const academicService = new AcademicService();
