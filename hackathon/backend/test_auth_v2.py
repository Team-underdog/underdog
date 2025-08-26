#!/usr/bin/env python3
"""
새로운 인증 시스템 테스트 스크립트
"""

import asyncio
import aiohttp
import json
from typing import Dict, Any

BASE_URL = "http://localhost:8000/api"

async def test_api_endpoint(session: aiohttp.ClientSession, 
                          method: str, 
                          endpoint: str, 
                          data: Dict[str, Any] = None,
                          headers: Dict[str, str] = None) -> Dict[str, Any]:
    """API 엔드포인트 테스트"""
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method.upper() == "GET":
            async with session.get(url, headers=headers) as response:
                result = await response.json()
                return {"status": response.status, "data": result}
        elif method.upper() == "POST":
            async with session.post(url, json=data, headers=headers) as response:
                result = await response.json()
                return {"status": response.status, "data": result}
        elif method.upper() == "PUT":
            async with session.put(url, json=data, headers=headers) as response:
                result = await response.json()
                return {"status": response.status, "data": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}

async def run_auth_tests():
    """인증 시스템 테스트 실행"""
    async with aiohttp.ClientSession() as session:
        
        print("=" * 60)
        print("새로운 인증 시스템 테스트 시작")
        print("=" * 60)
        
        test_email = "test@example.com"
        test_password = "test123456"
        access_token = None
        
        # 1. 이메일 중복 확인
        print("\n1. 이메일 중복 확인 테스트")
        email_check_data = {"email": test_email}
        result = await test_api_endpoint(session, "POST", "/auth/check-email", email_check_data)
        print(f"Status: {result['status']}")
        if result['status'] == 200:
            check_result = result['data']
            print(f"이메일: {check_result['email']}")
            print(f"사용 가능: {check_result['is_available']}")
            print(f"SSAFY 등록됨: {check_result['is_ssafy_registered']}")
            print(f"메시지: {check_result['message']}")
        
        # 2. 회원가입
        print("\n2. 회원가입 테스트")
        signup_data = {
            "email": test_email,
            "password": test_password,
            "display_name": "테스트 사용자",
            "university": "테스트 대학교",
            "department": "컴퓨터공학과",
            "grade_level": 3
        }
        result = await test_api_endpoint(session, "POST", "/auth/signup", signup_data)
        print(f"Status: {result['status']}")
        if result['status'] == 200:
            signup_result = result['data']
            print(f"성공: {signup_result['success']}")
            print(f"메시지: {signup_result['message']}")
            if signup_result.get('user'):
                user = signup_result['user']
                print(f"사용자 ID: {user['id']}")
                print(f"이메일: {user['email']}")
                print(f"표시명: {user['display_name']}")
        
        # 3. 중복 이메일로 회원가입 시도
        print("\n3. 중복 이메일로 회원가입 재시도")
        result = await test_api_endpoint(session, "POST", "/auth/signup", signup_data)
        print(f"Status: {result['status']}")
        if result['status'] == 400:
            print(f"예상된 에러: {result['data']['detail']}")
        
        # 4. 로그인
        print("\n4. 로그인 테스트")
        login_data = {
            "email": test_email,
            "password": test_password
        }
        result = await test_api_endpoint(session, "POST", "/auth/login", login_data)
        print(f"Status: {result['status']}")
        if result['status'] == 200:
            login_result = result['data']
            access_token = login_result['access_token']
            print(f"토큰 타입: {login_result['token_type']}")
            print(f"만료 시간: {login_result['expires_in']}초")
            print(f"액세스 토큰: {access_token[:50]}...")
            
            user = login_result['user']
            print(f"로그인 사용자: {user['display_name']} ({user['email']})")
        
        # 5. 잘못된 비밀번호로 로그인 시도
        print("\n5. 잘못된 비밀번호로 로그인 시도")
        wrong_login_data = {
            "email": test_email,
            "password": "wrongpassword"
        }
        result = await test_api_endpoint(session, "POST", "/auth/login", wrong_login_data)
        print(f"Status: {result['status']}")
        if result['status'] == 401:
            print(f"예상된 에러: {result['data']['detail']}")
        
        if not access_token:
            print("\n⚠️ 로그인 실패로 인해 인증이 필요한 테스트를 건너뜁니다.")
            return
        
        # 6. 사용자 정보 조회 (인증 필요)
        print("\n6. 현재 사용자 정보 조회")
        headers = {"Authorization": f"Bearer {access_token}"}
        result = await test_api_endpoint(session, "GET", "/auth/me", headers=headers)
        print(f"Status: {result['status']}")
        if result['status'] == 200:
            user_info = result['data']
            print(f"사용자 ID: {user_info['id']}")
            print(f"이메일: {user_info['email']}")
            print(f"표시명: {user_info['display_name']}")
            print(f"대학교: {user_info['current_university']}")
            print(f"학과: {user_info['current_department']}")
            print(f"학년: {user_info['grade_level']}")
        
        # 7. 프로필 업데이트
        print("\n7. 프로필 업데이트")
        profile_data = {
            "display_name": "업데이트된 사용자",
            "university": "서울대학교",
            "department": "소프트웨어학과",
            "grade_level": 4
        }
        result = await test_api_endpoint(session, "PUT", "/auth/profile", profile_data, headers)
        print(f"Status: {result['status']}")
        if result['status'] == 200:
            updated_user = result['data']
            print(f"업데이트된 표시명: {updated_user['display_name']}")
            print(f"업데이트된 대학교: {updated_user['current_university']}")
            print(f"업데이트된 학과: {updated_user['current_department']}")
            print(f"업데이트된 학년: {updated_user['grade_level']}")
        
        # 8. 비밀번호 변경
        print("\n8. 비밀번호 변경")
        password_change_data = {
            "current_password": test_password,
            "new_password": "newpassword123"
        }
        result = await test_api_endpoint(session, "POST", "/auth/change-password", password_change_data, headers)
        print(f"Status: {result['status']}")
        if result['status'] == 200:
            print(f"메시지: {result['data']['message']}")
        
        # 9. 새 비밀번호로 로그인 확인
        print("\n9. 새 비밀번호로 로그인 확인")
        new_login_data = {
            "email": test_email,
            "password": "newpassword123"
        }
        result = await test_api_endpoint(session, "POST", "/auth/login", new_login_data)
        print(f"Status: {result['status']}")
        if result['status'] == 200:
            print("새 비밀번호로 로그인 성공!")
        
        # 10. 잘못된 토큰으로 접근 시도
        print("\n10. 잘못된 토큰으로 접근 시도")
        wrong_headers = {"Authorization": "Bearer invalid-token"}
        result = await test_api_endpoint(session, "GET", "/auth/me", headers=wrong_headers)
        print(f"Status: {result['status']}")
        if result['status'] == 401:
            print(f"예상된 에러: {result['data']['detail']}")
        
        print("\n" + "=" * 60)
        print("인증 시스템 테스트 완료")
        print("=" * 60)

if __name__ == "__main__":
    print("새로운 인증 시스템 테스트를 시작합니다...")
    print("백엔드 서버가 http://localhost:8000 에서 실행 중인지 확인하세요.")
    print()
    
    try:
        asyncio.run(run_auth_tests())
    except Exception as e:
        print(f"테스트 실행 중 오류 발생: {e}")
        print("백엔드 서버가 실행 중인지 확인하세요.")
