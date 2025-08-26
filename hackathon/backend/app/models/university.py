from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
from enum import Enum


class UniversityType(str, Enum):
    NATIONAL = "국립"  # 국립대학
    PUBLIC = "공립"    # 공립대학
    PRIVATE = "사립"   # 사립대학
    SPECIALIZED = "전문"  # 전문대학


class University(SQLModel, table=True):
    """대학교 정보 모델"""
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, description="대학교명")
    english_name: Optional[str] = Field(default=None, description="영문명")
    university_type: UniversityType = Field(description="대학교 유형")
    
    # 기본 정보
    establishment_year: Optional[int] = Field(default=None, description="설립연도")
    location: Optional[str] = Field(default=None, description="소재지")
    address: Optional[str] = Field(default=None, description="주소")
    phone: Optional[str] = Field(default=None, description="전화번호")
    website: Optional[str] = Field(default=None, description="홈페이지")
    
    # 크롤링 관련 정보
    course_page_url: Optional[str] = Field(default=None, description="강의 시간표 페이지 URL")
    last_crawled_at: Optional[datetime] = Field(default=None, description="마지막 크롤링 시간")
    
    # 메타 정보
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # 관계
    departments: List["Department"] = Relationship(back_populates="university")
    courses: List["Course"] = Relationship(back_populates="university")


class Department(SQLModel, table=True):
    """학과/전공 정보 모델"""
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, description="학과명")
    english_name: Optional[str] = Field(default=None, description="영문 학과명")
    
    # 대학교 연결
    university_id: int = Field(foreign_key="university.id")
    university: University = Relationship(back_populates="departments")
    
    # 학과 정보
    college_name: Optional[str] = Field(default=None, description="단과대학명")
    degree_type: Optional[str] = Field(default=None, description="학위 유형 (학사/석사/박사)")
    
    # 메타 정보
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # 관계
    courses: List["Course"] = Relationship(back_populates="department")


class CourseType(str, Enum):
    MAJOR_REQUIRED = "전공필수"      # 전공필수
    MAJOR_ELECTIVE = "전공선택"      # 전공선택
    GENERAL_REQUIRED = "교양필수"    # 교양필수
    GENERAL_ELECTIVE = "교양선택"    # 교양선택
    TEACHING = "교직"               # 교직과목


class Course(SQLModel, table=True):
    """강좌 정보 모델"""
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # 기본 강좌 정보
    course_code: str = Field(index=True, description="강좌코드")
    course_name: str = Field(index=True, description="강좌명")
    english_name: Optional[str] = Field(default=None, description="영문 강좌명")
    
    # 대학교/학과 연결
    university_id: int = Field(foreign_key="university.id")
    university: University = Relationship(back_populates="courses")
    
    department_id: Optional[int] = Field(default=None, foreign_key="department.id")
    department: Optional[Department] = Relationship(back_populates="courses")
    
    # 강좌 상세 정보
    course_type: CourseType = Field(description="과목 유형")
    credits: Optional[int] = Field(default=None, description="학점")
    professor: Optional[str] = Field(default=None, description="담당교수")
    
    # 시간표 정보
    class_times: Optional[str] = Field(default=None, description="강의시간 (JSON 형태)")
    classroom: Optional[str] = Field(default=None, description="강의실")
    
    # 수강 정보
    capacity: Optional[int] = Field(default=None, description="수강정원")
    enrolled: Optional[int] = Field(default=None, description="수강신청인원")
    
    # 학기 정보
    semester: str = Field(description="학기 (예: 2024-1)")
    grade_level: Optional[int] = Field(default=None, description="대상학년")
    
    # 메타 정보
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class CourseSchedule(SQLModel, table=True):
    """강좌 시간표 모델 (요일별 시간)"""
    id: Optional[int] = Field(default=None, primary_key=True)
    
    course_id: int = Field(foreign_key="course.id")
    
    # 시간 정보
    day_of_week: int = Field(description="요일 (0:월, 1:화, 2:수, 3:목, 4:금, 5:토, 6:일)")
    start_time: str = Field(description="시작시간 (HH:MM)")
    end_time: str = Field(description="종료시간 (HH:MM)")
    
    # 장소 정보
    building: Optional[str] = Field(default=None, description="건물명")
    room: Optional[str] = Field(default=None, description="강의실")
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
