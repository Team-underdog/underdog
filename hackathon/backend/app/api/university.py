from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from ..services.university_service import (
    UniversityDataService, 
    CourseCrawlingService, 
    DepartmentService
)

router = APIRouter()

# Pydantic 모델들
class UniversityResponse(BaseModel):
    id: Optional[int] = None
    name: str
    english_name: Optional[str] = None
    university_type: str
    location: Optional[str] = None
    website: Optional[str] = None
    course_page_url: Optional[str] = None

class DepartmentResponse(BaseModel):
    id: Optional[int] = None
    name: str
    english_name: Optional[str] = None
    college_name: Optional[str] = None
    degree_type: Optional[str] = None

class CourseScheduleResponse(BaseModel):
    day_of_week: int
    start_time: str
    end_time: str
    building: Optional[str] = None
    room: Optional[str] = None

class CourseResponse(BaseModel):
    id: Optional[int] = None
    course_code: str
    course_name: str
    english_name: Optional[str] = None
    course_type: str
    credits: Optional[int] = None
    professor: Optional[str] = None
    class_times: Optional[str] = None
    classroom: Optional[str] = None
    capacity: Optional[int] = None
    enrolled: Optional[int] = None
    semester: str
    grade_level: Optional[int] = None
    schedules: List[CourseScheduleResponse] = []

class CourseSearchRequest(BaseModel):
    university_name: str
    department_name: str
    semester: Optional[str] = "2024-1"


# 의존성 주입
def get_university_service():
    return UniversityDataService()

def get_crawling_service():
    return CourseCrawlingService()

def get_department_service():
    return DepartmentService()


@router.get("/universities", response_model=List[UniversityResponse])
async def get_universities(
    university_service: UniversityDataService = Depends(get_university_service)
):
    """대학교 목록 조회"""
    try:
        # 실제 API에서 데이터를 가져오거나, 샘플 데이터 사용
        universities = await university_service.get_sample_universities()
        
        return [
            UniversityResponse(
                name=univ["name"],
                english_name=univ.get("english_name"),
                university_type=univ["university_type"],
                location=univ.get("location"),
                website=univ.get("website"),
                course_page_url=univ.get("course_page_url")
            )
            for univ in universities
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"대학교 목록 조회 실패: {str(e)}")


@router.get("/universities/{university_name}/departments", response_model=List[DepartmentResponse])
async def get_departments(
    university_name: str,
    department_service: DepartmentService = Depends(get_department_service)
):
    """특정 대학교의 학과 목록 조회"""
    try:
        departments = await department_service.get_departments_by_university(university_name)
        
        return [
            DepartmentResponse(
                name=dept["name"],
                college_name=dept.get("college_name"),
                degree_type=dept.get("degree_type")
            )
            for dept in departments
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"학과 목록 조회 실패: {str(e)}")


@router.post("/courses/search", response_model=List[CourseResponse])
async def search_courses(
    search_request: CourseSearchRequest,
    crawling_service: CourseCrawlingService = Depends(get_crawling_service)
):
    """대학교 + 학과별 강좌 검색 (크롤링)"""
    try:
        courses = await crawling_service.crawl_university_courses(
            search_request.university_name,
            search_request.department_name
        )
        
        response_courses = []
        for course in courses:
            # 시간표 정보 파싱
            schedules = []
            if course.get("class_times"):
                parsed_schedules = crawling_service.parse_class_time(course["class_times"])
                schedules = [
                    CourseScheduleResponse(
                        day_of_week=schedule["day_of_week"],
                        start_time=schedule["start_time"],
                        end_time=schedule["end_time"]
                    )
                    for schedule in parsed_schedules
                ]
            
            course_response = CourseResponse(
                course_code=course["course_code"],
                course_name=course["course_name"],
                course_type=course["course_type"],
                credits=course.get("credits"),
                professor=course.get("professor"),
                class_times=course.get("class_times"),
                classroom=course.get("classroom"),
                capacity=course.get("capacity"),
                enrolled=course.get("enrolled"),
                semester=course.get("semester", search_request.semester),
                grade_level=course.get("grade_level"),
                schedules=schedules
            )
            response_courses.append(course_response)
        
        return response_courses
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"강좌 검색 실패: {str(e)}")


@router.get("/courses/popular")
async def get_popular_courses(
    limit: int = Query(default=10, ge=1, le=50, description="조회할 인기 강좌 수")
):
    """인기 강좌 목록 조회 (수강신청률 기준)"""
    try:
        # 실제로는 DB에서 수강신청률이 높은 강좌들을 조회
        popular_courses = [
            {
                "course_name": "머신러닝 기초",
                "university_name": "KAIST",
                "professor": "김AI",
                "enrollment_rate": 0.95,
                "course_type": "전공선택"
            },
            {
                "course_name": "웹 프로그래밍",
                "university_name": "서울대학교",
                "professor": "이웹",
                "enrollment_rate": 0.92,
                "course_type": "전공선택"
            },
            {
                "course_name": "데이터베이스 시스템",
                "university_name": "연세대학교",
                "professor": "박DB",
                "enrollment_rate": 0.88,
                "course_type": "전공필수"
            }
        ]
        
        return popular_courses[:limit]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"인기 강좌 조회 실패: {str(e)}")


@router.get("/courses/time-conflicts")
async def check_time_conflicts(
    course_codes: List[str] = Query(..., description="시간 충돌을 확인할 강좌 코드들")
):
    """강좌 시간 충돌 확인"""
    try:
        # 실제로는 각 강좌의 시간표를 조회하여 충돌 검사
        conflicts = []
        
        # 샘플 충돌 검사 결과
        if len(course_codes) >= 2:
            conflicts.append({
                "course1": course_codes[0],
                "course2": course_codes[1],
                "conflict_day": "월요일",
                "conflict_time": "09:00-10:30",
                "severity": "완전충돌"
            })
        
        return {
            "has_conflicts": len(conflicts) > 0,
            "conflicts": conflicts,
            "total_courses": len(course_codes)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"시간 충돌 확인 실패: {str(e)}")


@router.get("/universities/{university_name}/stats")
async def get_university_stats(university_name: str):
    """대학교 통계 정보"""
    try:
        # 실제로는 DB에서 해당 대학교의 통계를 조회
        stats = {
            "university_name": university_name,
            "total_departments": 45,
            "total_courses": 1250,
            "current_semester": "2024-1",
            "last_updated": datetime.utcnow().isoformat(),
            "popular_departments": [
                {"name": "컴퓨터공학과", "course_count": 85},
                {"name": "경영학과", "course_count": 72},
                {"name": "전자공학과", "course_count": 68}
            ]
        }
        
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"대학교 통계 조회 실패: {str(e)}")
