#!/usr/bin/env python3
"""
대학교 API 테스트 스크립트
백엔드 서버가 실행 중일 때 이 스크립트를 실행하여 API 동작을 확인할 수 있습니다.
"""

import asyncio
import aiohttp
import json
from typing import Dict, Any

BASE_URL = "http://localhost:8000/api"

async def test_api_endpoint(session: aiohttp.ClientSession, 
                          method: str, 
                          endpoint: str, 
                          data: Dict[str, Any] = None) -> Dict[str, Any]:
    """API 엔드포인트 테스트"""
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method.upper() == "GET":
            async with session.get(url) as response:
                result = await response.json()
                return {"status": response.status, "data": result}
        elif method.upper() == "POST":
            async with session.post(url, json=data) as response:
                result = await response.json()
                return {"status": response.status, "data": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}

async def run_tests():
    """모든 테스트 실행"""
    async with aiohttp.ClientSession() as session:
        
        print("=" * 60)
        print("대학교 API 테스트 시작")
        print("=" * 60)
        
        # 1. 헬스 체크
        print("\n1. 헬스 체크")
        result = await test_api_endpoint(session, "GET", "/health")
        print(f"Status: {result['status']}")
        print(f"Response: {json.dumps(result.get('data', {}), ensure_ascii=False, indent=2)}")
        
        # 2. 대학교 목록 조회
        print("\n2. 대학교 목록 조회")
        result = await test_api_endpoint(session, "GET", "/universities")
        print(f"Status: {result['status']}")
        if result['status'] == 200:
            universities = result['data']
            print(f"조회된 대학교 수: {len(universities)}")
            if universities:
                print(f"첫 번째 대학교: {universities[0]['name']}")
        
        # 3. 학과 목록 조회
        print("\n3. 서울대학교 학과 목록 조회")
        result = await test_api_endpoint(session, "GET", "/universities/서울대학교/departments")
        print(f"Status: {result['status']}")
        if result['status'] == 200:
            departments = result['data']
            print(f"조회된 학과 수: {len(departments)}")
            if departments:
                print(f"첫 번째 학과: {departments[0]['name']}")
        
        # 4. 강좌 검색
        print("\n4. 강좌 검색 (서울대학교 컴퓨터공학과)")
        search_data = {
            "university_name": "서울대학교",
            "department_name": "컴퓨터공학과",
            "semester": "2024-1"
        }
        result = await test_api_endpoint(session, "POST", "/courses/search", search_data)
        print(f"Status: {result['status']}")
        if result['status'] == 200:
            courses = result['data']
            print(f"조회된 강좌 수: {len(courses)}")
            if courses:
                course = courses[0]
                print(f"첫 번째 강좌: {course['course_name']} ({course['course_code']})")
                print(f"담당교수: {course['professor']}")
                print(f"강의시간: {course['class_times']}")
        
        # 5. 인기 강좌 조회
        print("\n5. 인기 강좌 조회")
        result = await test_api_endpoint(session, "GET", "/courses/popular?limit=3")
        print(f"Status: {result['status']}")
        if result['status'] == 200:
            popular_courses = result['data']
            print(f"인기 강좌 수: {len(popular_courses)}")
            for i, course in enumerate(popular_courses, 1):
                print(f"{i}. {course['course_name']} - {course['university_name']} ({course['enrollment_rate']*100:.1f}%)")
        
        # 6. 시간 충돌 확인
        print("\n6. 시간 충돌 확인")
        result = await test_api_endpoint(session, "GET", "/courses/time-conflicts?course_codes=CS101&course_codes=CS201")
        print(f"Status: {result['status']}")
        if result['status'] == 200:
            conflict_result = result['data']
            print(f"충돌 여부: {conflict_result['has_conflicts']}")
            if conflict_result['conflicts']:
                for conflict in conflict_result['conflicts']:
                    print(f"충돌: {conflict['course1']} vs {conflict['course2']} - {conflict['conflict_day']} {conflict['conflict_time']}")
        
        # 7. 대학교 통계
        print("\n7. KAIST 통계 정보")
        result = await test_api_endpoint(session, "GET", "/universities/KAIST/stats")
        print(f"Status: {result['status']}")
        if result['status'] == 200:
            stats = result['data']
            print(f"전체 학과 수: {stats['total_departments']}")
            print(f"전체 강좌 수: {stats['total_courses']}")
            print(f"현재 학기: {stats['current_semester']}")
        
        print("\n" + "=" * 60)
        print("테스트 완료")
        print("=" * 60)

if __name__ == "__main__":
    print("대학교 API 테스트를 시작합니다...")
    print("백엔드 서버가 http://localhost:8000 에서 실행 중인지 확인하세요.")
    print()
    
    try:
        asyncio.run(run_tests())
    except Exception as e:
        print(f"테스트 실행 중 오류 발생: {e}")
        print("백엔드 서버가 실행 중인지 확인하세요.")
