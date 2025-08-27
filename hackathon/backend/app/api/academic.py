from fastapi import APIRouter, HTTPException, Depends, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select
from typing import Optional, List
from datetime import datetime, timedelta
import random

from ..db.session import get_session
from ..models.academic import (
    AcademicRecord, Course, Scholarship,
    AcademicRecordResponse, CourseResponse, ScholarshipResponse, AcademicSummaryResponse
)
from ..models.user import User
from ..services.user_service import JWTService

router = APIRouter()
security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_session)
) -> User:
    """현재 인증된 사용자 정보 반환"""
    token = credentials.credentials
    user = JWTService.get_user_from_token(token, db)
    
    if not user:
        raise HTTPException(
            status_code=401,
            detail="유효하지 않은 토큰입니다",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user


@router.get("/academic/record", response_model=AcademicRecordResponse)
async def get_academic_record(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """현재 사용자의 학사 정보 조회"""
    try:
        # 사용자의 학사 정보 조회
        academic_record = db.exec(
            select(AcademicRecord).where(AcademicRecord.user_id == current_user.id)
        ).first()
        
        if not academic_record:
            # 목업 데이터 생성
            academic_record = create_mock_academic_record(current_user.id, db)
        
        return AcademicRecordResponse(
            id=academic_record.id,
            student_id=academic_record.student_id,
            university=academic_record.university,
            department=academic_record.department,
            major=academic_record.major,
            grade_level=academic_record.grade_level,
            semester=academic_record.semester,
            enrollment_status=academic_record.enrollment_status,
            total_credits=academic_record.total_credits,
            required_credits=academic_record.required_credits,
            gpa=academic_record.gpa,
            major_gpa=academic_record.major_gpa,
            expected_graduation=academic_record.expected_graduation,
            graduation_date=academic_record.graduation_date,
            created_at=academic_record.created_at,
            updated_at=academic_record.updated_at
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"학사 정보 조회 중 오류가 발생했습니다: {str(e)}"
        )


@router.get("/academic/courses", response_model=List[CourseResponse])
async def get_courses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """현재 사용자의 수강 과목 조회"""
    try:
        # 사용자의 학사 정보 조회
        academic_record = db.exec(
            select(AcademicRecord).where(AcademicRecord.user_id == current_user.id)
        ).first()
        
        if not academic_record:
            # 목업 데이터 생성
            academic_record = create_mock_academic_record(current_user.id, db)
        
        # 수강 과목 조회
        courses = db.exec(
            select(Course).where(Course.academic_record_id == academic_record.id)
        ).all()
        
        if not courses:
            # 목업 데이터 생성
            courses = create_mock_courses(academic_record.id, db)
        
        return [
            CourseResponse(
                id=course.id,
                course_code=course.course_code,
                course_name=course.course_name,
                course_type=course.course_type,
                credits=course.credits,
                grade=course.grade,
                grade_point=course.grade_point,
                year=course.year,
                semester=course.semester,
                created_at=course.created_at
            )
            for course in courses
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"수강 과목 조회 중 오류가 발생했습니다: {str(e)}"
        )


@router.get("/academic/scholarships", response_model=List[ScholarshipResponse])
async def get_scholarships(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """현재 사용자의 장학금 정보 조회"""
    try:
        # 장학금 정보 조회
        scholarships = db.exec(
            select(Scholarship).where(Scholarship.user_id == current_user.id)
        ).all()
        
        if not scholarships:
            # 목업 데이터 생성
            scholarships = create_mock_scholarships(current_user.id, db)
        
        return [
            ScholarshipResponse(
                id=scholarship.id,
                scholarship_name=scholarship.scholarship_name,
                scholarship_type=scholarship.scholarship_type,
                amount=scholarship.amount,
                semester=scholarship.semester,
                year=scholarship.year,
                status=scholarship.status,
                created_at=scholarship.created_at
            )
            for scholarship in scholarships
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"장학금 정보 조회 중 오류가 발생했습니다: {str(e)}"
        )


@router.get("/academic/summary", response_model=AcademicSummaryResponse)
async def get_academic_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """현재 사용자의 학사 요약 정보 조회"""
    try:
        # 학사 정보 조회
        academic_record = db.exec(
            select(AcademicRecord).where(AcademicRecord.user_id == current_user.id)
        ).first()
        
        if not academic_record:
            # 목업 데이터 생성
            academic_record = create_mock_academic_record(current_user.id, db)
        
        # 수강 과목 조회
        courses = db.exec(
            select(Course).where(Course.academic_record_id == academic_record.id)
        ).all()
        
        if not courses:
            # 목업 데이터 생성
            courses = create_mock_courses(academic_record.id, db)
        
        # 장학금 정보 조회
        scholarships = db.exec(
            select(Scholarship).where(Scholarship.user_id == current_user.id)
        ).all()
        
        if not scholarships:
            # 목업 데이터 생성
            scholarships = create_mock_scholarships(current_user.id, db)
        
        # 진행률 계산
        credit_progress = (academic_record.total_credits / academic_record.required_credits) * 100
        graduation_progress = min(credit_progress, 100)
        
        return AcademicSummaryResponse(
            academic_record=AcademicRecordResponse(
                id=academic_record.id,
                student_id=academic_record.student_id,
                university=academic_record.university,
                department=academic_record.department,
                major=academic_record.major,
                grade_level=academic_record.grade_level,
                semester=academic_record.semester,
                enrollment_status=academic_record.enrollment_status,
                total_credits=academic_record.total_credits,
                required_credits=academic_record.required_credits,
                gpa=academic_record.gpa,
                major_gpa=academic_record.major_gpa,
                expected_graduation=academic_record.expected_graduation,
                graduation_date=academic_record.graduation_date,
                created_at=academic_record.created_at,
                updated_at=academic_record.updated_at
            ),
            courses=[
                CourseResponse(
                    id=course.id,
                    course_code=course.course_code,
                    course_name=course.course_name,
                    course_type=course.course_type,
                    credits=course.credits,
                    grade=course.grade,
                    grade_point=course.grade_point,
                    year=course.year,
                    semester=course.semester,
                    created_at=course.created_at
                )
                for course in courses
            ],
            scholarships=[
                ScholarshipResponse(
                    id=scholarship.id,
                    scholarship_name=scholarship.scholarship_name,
                    scholarship_type=scholarship.scholarship_type,
                    amount=scholarship.amount,
                    semester=scholarship.semester,
                    year=scholarship.year,
                    status=scholarship.status,
                    created_at=scholarship.created_at
                )
                for scholarship in scholarships
            ],
            credit_progress=credit_progress,
            graduation_progress=graduation_progress
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"학사 요약 정보 조회 중 오류가 발생했습니다: {str(e)}"
        )


# 목업 데이터 생성 함수들
def create_mock_academic_record(user_id: int, db: Session) -> AcademicRecord:
    """목업 학사 정보 생성"""
    universities = ["SSAFY 대학교", "한국대학교", "서울대학교", "연세대학교"]
    departments = ["소프트웨어개발", "컴퓨터공학", "정보통신공학", "전자공학"]
    majors = ["웹개발", "모바일개발", "AI/ML", "데이터사이언스"]
    
    academic_record = AcademicRecord(
        user_id=user_id,
        student_id=f"2024{random.randint(1000, 9999)}",
        university=random.choice(universities),
        department=random.choice(departments),
        major=random.choice(majors),
        grade_level=random.randint(1, 4),
        semester=random.randint(1, 2),
        enrollment_status="재학",
        total_credits=random.uniform(30.0, 90.0),
        required_credits=130.0,
        gpa=random.uniform(3.0, 4.5),
        major_gpa=random.uniform(3.2, 4.5),
        expected_graduation=datetime.now() + timedelta(days=random.randint(365, 1095)),
        created_at=datetime.now(),
        updated_at=datetime.now()
    )
    
    db.add(academic_record)
    db.commit()
    db.refresh(academic_record)
    
    return academic_record


def create_mock_courses(academic_record_id: int, db: Session) -> List[Course]:
    """목업 수강 과목 생성"""
    course_data = [
        ("CS101", "프로그래밍 기초", "전공필수", 3.0, "A+", 4.5, 2024, 1),
        ("CS102", "자료구조", "전공필수", 3.0, "A", 4.0, 2024, 1),
        ("CS201", "알고리즘", "전공필수", 3.0, "B+", 3.5, 2024, 1),
        ("CS202", "데이터베이스", "전공선택", 3.0, "A", 4.0, 2024, 1),
        ("GE101", "영어", "교양필수", 2.0, "A+", 4.5, 2024, 1),
        ("GE102", "수학", "교양필수", 3.0, "B", 3.0, 2024, 1),
    ]
    
    courses = []
    for code, name, type_, credits, grade, grade_point, year, semester in course_data:
        course = Course(
            academic_record_id=academic_record_id,
            course_code=code,
            course_name=name,
            course_type=type_,
            credits=credits,
            grade=grade,
            grade_point=grade_point,
            year=year,
            semester=semester,
            created_at=datetime.now()
        )
        courses.append(course)
        db.add(course)
    
    db.commit()
    return courses


def create_mock_scholarships(user_id: int, db: Session) -> List[Scholarship]:
    """목업 장학금 정보 생성"""
    scholarship_data = [
        ("성적우수장학금", "성적우수", 500000, "1학기", 2024),
        ("근로장학금", "근로", 300000, "1학기", 2024),
        ("국가장학금", "국가", 1000000, "1학기", 2024),
    ]
    
    scholarships = []
    for name, type_, amount, semester, year in scholarship_data:
        scholarship = Scholarship(
            user_id=user_id,
            scholarship_name=name,
            scholarship_type=type_,
            amount=amount,
            semester=semester,
            year=year,
            status="지급완료",
            created_at=datetime.now()
        )
        scholarships.append(scholarship)
        db.add(scholarship)
    
    db.commit()
    return scholarships
