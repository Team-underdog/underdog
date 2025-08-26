import requests
import aiohttp
from typing import List, Dict, Optional
from bs4 import BeautifulSoup
import json
import logging
from datetime import datetime
from ..core.config import settings

logger = logging.getLogger(__name__)


class UniversityDataService:
    """대학교 데이터 수집 서비스"""
    
    def __init__(self):
        # 공공데이터포털 API 키
        self.api_key = settings.OPENDATA_API_KEY
        self.base_url = "https://apis.data.go.kr"
    
    async def get_universities_from_openapi(self) -> List[Dict]:
        """공공데이터포털에서 대학교 목록 조회"""
        try:
            # 대학알리미 API 또는 교육부 대학정보 API 사용
            url = f"{self.base_url}/B553530/univ/getUnivList"
            params = {
                "serviceKey": self.api_key,
                "returnType": "json",
                "numOfRows": 1000,
                "pageNo": 1
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        return self._parse_university_data(data)
                    else:
                        logger.error(f"API 요청 실패: {response.status}")
                        return []
        except Exception as e:
            logger.error(f"대학교 목록 조회 실패: {e}")
            return []
    
    def _parse_university_data(self, api_data: Dict) -> List[Dict]:
        """API 응답 데이터를 파싱하여 대학교 정보 추출"""
        universities = []
        
        try:
            items = api_data.get("response", {}).get("body", {}).get("items", [])
            
            for item in items:
                university = {
                    "name": item.get("schoolName", ""),
                    "english_name": item.get("schoolEnglishName", ""),
                    "university_type": self._determine_university_type(item.get("schoolType", "")),
                    "location": item.get("adres", ""),
                    "phone": item.get("telNo", ""),
                    "website": item.get("hmpgAdres", ""),
                    "establishment_year": item.get("fondYy", "")
                }
                universities.append(university)
        except Exception as e:
            logger.error(f"대학교 데이터 파싱 실패: {e}")
        
        return universities
    
    def _determine_university_type(self, school_type: str) -> str:
        """학교 유형 문자열을 표준화"""
        if "국립" in school_type:
            return "국립"
        elif "공립" in school_type:
            return "공립"
        elif "사립" in school_type:
            return "사립"
        elif "전문" in school_type:
            return "전문"
        else:
            return "사립"  # 기본값
    
    async def get_sample_universities(self) -> List[Dict]:
        """샘플 대학교 데이터 (API 키가 없는 경우 테스트용)"""
        return [
            {
                "name": "서울대학교",
                "english_name": "Seoul National University",
                "university_type": "국립",
                "location": "서울특별시 관악구",
                "website": "https://www.snu.ac.kr",
                "course_page_url": "https://sugang.snu.ac.kr"
            },
            {
                "name": "연세대학교",
                "english_name": "Yonsei University",
                "university_type": "사립",
                "location": "서울특별시 서대문구",
                "website": "https://www.yonsei.ac.kr",
                "course_page_url": "https://portal.yonsei.ac.kr"
            },
            {
                "name": "고려대학교",
                "english_name": "Korea University",
                "university_type": "사립",
                "location": "서울특별시 성북구",
                "website": "https://www.korea.ac.kr",
                "course_page_url": "https://sugang.korea.ac.kr"
            },
            {
                "name": "KAIST",
                "english_name": "Korea Advanced Institute of Science and Technology",
                "university_type": "국립",
                "location": "대전광역시 유성구",
                "website": "https://www.kaist.ac.kr",
                "course_page_url": "https://portal.kaist.ac.kr"
            }
        ]


class CourseCrawlingService:
    """대학교 강좌 크롤링 서비스"""
    
    def __init__(self):
        self.session = None
    
    async def crawl_university_courses(self, university_name: str, department_name: str) -> List[Dict]:
        """특정 대학교의 강좌 정보 크롤링"""
        try:
            # 대학교별 크롤링 전략 선택
            if "서울대" in university_name:
                return await self._crawl_snu_courses(department_name)
            elif "연세대" in university_name:
                return await self._crawl_yonsei_courses(department_name)
            elif "고려대" in university_name:
                return await self._crawl_korea_courses(department_name)
            else:
                return await self._crawl_generic_courses(university_name, department_name)
        except Exception as e:
            logger.error(f"강좌 크롤링 실패 ({university_name}): {e}")
            return []
    
    async def _crawl_snu_courses(self, department_name: str) -> List[Dict]:
        """서울대학교 강좌 크롤링"""
        # 실제 구현시에는 해당 대학의 수강신청 시스템 구조에 맞게 구현
        return await self._get_sample_courses("서울대학교", department_name)
    
    async def _crawl_yonsei_courses(self, department_name: str) -> List[Dict]:
        """연세대학교 강좌 크롤링"""
        return await self._get_sample_courses("연세대학교", department_name)
    
    async def _crawl_korea_courses(self, department_name: str) -> List[Dict]:
        """고려대학교 강좌 크롤링"""
        return await self._get_sample_courses("고려대학교", department_name)
    
    async def _crawl_generic_courses(self, university_name: str, department_name: str) -> List[Dict]:
        """일반적인 대학교 강좌 크롤링"""
        return await self._get_sample_courses(university_name, department_name)
    
    async def _get_sample_courses(self, university_name: str, department_name: str) -> List[Dict]:
        """샘플 강좌 데이터"""
        base_courses = [
            {
                "course_code": "CS101",
                "course_name": "컴퓨터과학개론",
                "course_type": "전공필수",
                "credits": 3,
                "professor": "김교수",
                "class_times": "월 09:00-10:30, 수 09:00-10:30",
                "classroom": "공학관 101호",
                "capacity": 50,
                "enrolled": 45,
                "semester": "2024-1",
                "grade_level": 1
            },
            {
                "course_code": "CS201",
                "course_name": "자료구조",
                "course_type": "전공필수",
                "credits": 3,
                "professor": "이교수",
                "class_times": "화 10:30-12:00, 목 10:30-12:00",
                "classroom": "공학관 102호",
                "capacity": 40,
                "enrolled": 38,
                "semester": "2024-1",
                "grade_level": 2
            },
            {
                "course_code": "CS301",
                "course_name": "알고리즘",
                "course_type": "전공필수",
                "credits": 3,
                "professor": "박교수",
                "class_times": "월 13:30-15:00, 수 13:30-15:00",
                "classroom": "공학관 103호",
                "capacity": 35,
                "enrolled": 33,
                "semester": "2024-1",
                "grade_level": 3
            }
        ]
        
        # 학과별로 강좌를 맞춤화
        if "컴퓨터" in department_name or "소프트웨어" in department_name:
            return base_courses
        elif "경영" in department_name:
            return [
                {
                    "course_code": "BUS101",
                    "course_name": "경영학원론",
                    "course_type": "전공필수",
                    "credits": 3,
                    "professor": "최교수",
                    "class_times": "월 09:00-10:30, 수 09:00-10:30",
                    "classroom": "경영관 201호",
                    "capacity": 60,
                    "enrolled": 55,
                    "semester": "2024-1",
                    "grade_level": 1
                }
            ]
        else:
            # 일반적인 강좌들
            return [
                {
                    "course_code": "GEN101",
                    "course_name": f"{department_name} 개론",
                    "course_type": "전공필수",
                    "credits": 3,
                    "professor": "전담교수",
                    "class_times": "월 09:00-10:30, 수 09:00-10:30",
                    "classroom": "강의동 301호",
                    "capacity": 50,
                    "enrolled": 45,
                    "semester": "2024-1",
                    "grade_level": 1
                }
            ]
    
    def parse_class_time(self, time_string: str) -> List[Dict]:
        """강의시간 문자열을 파싱하여 구조화된 데이터로 변환"""
        schedules = []
        
        try:
            # "월 09:00-10:30, 수 09:00-10:30" 형태의 문자열 파싱
            time_parts = time_string.split(", ")
            
            day_mapping = {
                "월": 0, "화": 1, "수": 2, "목": 3, "금": 4, "토": 5, "일": 6
            }
            
            for part in time_parts:
                part = part.strip()
                if " " in part:
                    day_char = part.split()[0]
                    time_range = part.split()[1]
                    
                    if day_char in day_mapping and "-" in time_range:
                        start_time, end_time = time_range.split("-")
                        
                        schedule = {
                            "day_of_week": day_mapping[day_char],
                            "start_time": start_time,
                            "end_time": end_time
                        }
                        schedules.append(schedule)
        except Exception as e:
            logger.error(f"강의시간 파싱 실패: {e}")
        
        return schedules


class DepartmentService:
    """학과 정보 서비스"""
    
    async def get_departments_by_university(self, university_name: str) -> List[Dict]:
        """대학교별 학과 목록 조회"""
        # 실제로는 각 대학교 홈페이지나 API에서 조회
        # 여기서는 샘플 데이터 제공
        
        common_departments = [
            {"name": "컴퓨터공학과", "college_name": "공과대학", "degree_type": "학사"},
            {"name": "소프트웨어학과", "college_name": "공과대학", "degree_type": "학사"},
            {"name": "전자공학과", "college_name": "공과대학", "degree_type": "학사"},
            {"name": "기계공학과", "college_name": "공과대학", "degree_type": "학사"},
            {"name": "경영학과", "college_name": "경영대학", "degree_type": "학사"},
            {"name": "경제학과", "college_name": "사회과학대학", "degree_type": "학사"},
            {"name": "국어국문학과", "college_name": "인문대학", "degree_type": "학사"},
            {"name": "영어영문학과", "college_name": "인문대학", "degree_type": "학사"},
            {"name": "수학과", "college_name": "자연과학대학", "degree_type": "학사"},
            {"name": "물리학과", "college_name": "자연과학대학", "degree_type": "학사"}
        ]
        
        return common_departments
