from sqlmodel import SQLModel, Field
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel


class AcademicRecord(SQLModel, table=True):
    """학사 정보 모델"""
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # 사용자 정보
    user_id: int = Field(foreign_key="user.id", description="사용자 ID")
    
    # 학사 기본 정보
    student_id: str = Field(description="학번")
    university: str = Field(description="대학교명")
    department: str = Field(description="학과/전공명")
    major: Optional[str] = Field(default=None, description="세부전공")
    grade_level: int = Field(description="학년")
    semester: int = Field(description="학기")
    enrollment_status: str = Field(default="재학", description="재학상태: 재학/휴학/졸업")
    
    # 학점 정보
    total_credits: float = Field(default=0.0, description="총 취득학점")
    required_credits: float = Field(default=130.0, description="졸업필수학점")
    gpa: float = Field(default=0.0, description="평점평균")
    major_gpa: Optional[float] = Field(default=None, description="전공평점평균")
    
    # 졸업 정보
    expected_graduation: Optional[datetime] = Field(default=None, description="예상졸업일")
    graduation_date: Optional[datetime] = Field(default=None, description="졸업일")
    
    # 타임스탬프
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Course(SQLModel, table=True):
    """수강 과목 모델"""
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # 학사 정보 연결
    academic_record_id: int = Field(foreign_key="academicrecord.id", description="학사정보 ID")
    
    # 과목 정보
    course_code: str = Field(description="과목코드")
    course_name: str = Field(description="과목명")
    course_type: str = Field(description="과목구분: 전공필수/전공선택/교양필수/교양선택")
    credits: float = Field(description="학점")
    grade: str = Field(description="성적: A+/A/B+/B/C+/C/D+/D/F")
    grade_point: float = Field(description="성적점수")
    
    # 학기 정보
    year: int = Field(description="학년도")
    semester: int = Field(description="학기")
    
    # 타임스탬프
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Scholarship(SQLModel, table=True):
    """장학금 정보 모델"""
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # 사용자 정보
    user_id: int = Field(foreign_key="user.id", description="사용자 ID")
    
    # 장학금 정보
    scholarship_name: str = Field(description="장학금명")
    scholarship_type: str = Field(description="장학금구분: 성적우수/근로/국가/기타")
    amount: int = Field(description="장학금액")
    semester: str = Field(description="지급학기")
    year: int = Field(description="지급년도")
    status: str = Field(default="지급예정", description="상태: 지급예정/지급완료")
    
    # 타임스탬프
    created_at: datetime = Field(default_factory=datetime.utcnow)


# Pydantic 모델들 (API 요청/응답용)
class AcademicRecordResponse(BaseModel):
    """학사 정보 응답 모델"""
    id: int
    student_id: str
    university: str
    department: str
    major: Optional[str]
    grade_level: int
    semester: int
    enrollment_status: str
    total_credits: float
    required_credits: float
    gpa: float
    major_gpa: Optional[float]
    expected_graduation: Optional[datetime]
    graduation_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime


class CourseResponse(BaseModel):
    """수강 과목 응답 모델"""
    id: int
    course_code: str
    course_name: str
    course_type: str
    credits: float
    grade: str
    grade_point: float
    year: int
    semester: int
    created_at: datetime


class ScholarshipResponse(BaseModel):
    """장학금 정보 응답 모델"""
    id: int
    scholarship_name: str
    scholarship_type: str
    amount: int
    semester: str
    year: int
    status: str
    created_at: datetime


class AcademicSummaryResponse(BaseModel):
    """학사 요약 정보 응답 모델"""
    academic_record: AcademicRecordResponse
    courses: List[CourseResponse]
    scholarships: List[ScholarshipResponse]
    credit_progress: float  # 학점 진행률
    graduation_progress: float  # 졸업 진행률
