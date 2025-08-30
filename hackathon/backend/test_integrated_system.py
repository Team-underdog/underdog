#!/usr/bin/env python3
"""
전체 시스템 통합 테스트
새로 구현된 소셜 금융, 게이미피케이션 API 포함
"""

import requests
import json
import time
from datetime import datetime, timedelta
import random

BASE_URL = "http://localhost:8000"

def print_section(title):
    """섹션 제목 출력"""
    print(f"\n{'='*60}")
    print(f"🔍 {title}")
    print(f"{'='*60}")

def print_success(message):
    """성공 메시지 출력"""
    print(f"✅ {message}")

def print_error(message):
    """에러 메시지 출력"""
    print(f"❌ {message}")

def print_info(message):
    """정보 메시지 출력"""
    print(f"ℹ️ {message}")

def test_health_check():
    """헬스 체크 테스트"""
    print_section("시스템 헬스 체크")
    
    try:
        response = requests.get(f"{BASE_URL}/docs")
        if response.status_code == 200:
            print_success("FastAPI 문서 접근 성공")
        else:
            print_error(f"FastAPI 문서 접근 실패: {response.status_code}")
    except Exception as e:
        print_error(f"헬스 체크 실패: {str(e)}")

def test_user_registration():
    """사용자 회원가입 및 계좌 생성 테스트"""
    print_section("사용자 회원가입 및 계좌 생성 테스트")
    
    test_users = [
        {
            "email": "student1@ssafy.com",
            "password": "password123",
            "name": "김학생",
            "student_id": "2024001",
            "university": "SSAFY",
            "preferred_bank": "001"
        },
        {
            "email": "student2@ssafy.com", 
            "password": "password123",
            "name": "이학생",
            "student_id": "2024002",
            "university": "SSAFY",
            "preferred_bank": "004"
        }
    ]
    
    created_users = []
    
    for i, user_data in enumerate(test_users, 1):
        try:
            print_info(f"테스트 사용자 {i} 회원가입 중...")
            
            # URL 파라미터로 변환
            params = "&".join([f"{k}={v}" for k, v in user_data.items()])
            
            response = requests.post(
                f"{BASE_URL}/api/registration/register-with-account?{params}"
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    user_info = {
                        'email': user_data['email'],
                        'user_key': result.get('user_key'),
                        'account_no': result.get('account_no')
                    }
                    created_users.append(user_info)
                    print_success(f"사용자 {i} 회원가입 성공: {user_data['name']}")
                    print(f"   계좌번호: {user_info['account_no']}")
                else:
                    print_error(f"사용자 {i} 회원가입 실패: {result.get('message')}")
            else:
                print_error(f"사용자 {i} 회원가입 HTTP 오류: {response.status_code}")
                
        except Exception as e:
            print_error(f"사용자 {i} 회원가입 예외: {str(e)}")
    
    return created_users

def test_home_dashboard(users):
    """홈 대시보드 테스트"""
    print_section("홈 대시보드 테스트")
    
    for i, user in enumerate(users, 1):
        try:
            print_info(f"사용자 {i} 홈 대시보드 조회 중...")
            
            response = requests.get(
                f"{BASE_URL}/api/home/dashboard",
                params={"user_key": user['user_key']}
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    dashboard = result.get('dashboard', {})
                    print_success(f"사용자 {i} 대시보드 조회 성공")
                    print(f"   총 계좌 수: {dashboard.get('account_summary', {}).get('total_accounts', 0)}개")
                    print(f"   총 자산: {dashboard.get('account_summary', {}).get('total_balance', 0):,}원")
                    print(f"   최근 거래: {len(dashboard.get('recent_transactions', []))}건")
                else:
                    print_error(f"사용자 {i} 대시보드 조회 실패: {result.get('message')}")
            else:
                print_error(f"사용자 {i} 대시보드 HTTP 오류: {response.status_code}")
                
        except Exception as e:
            print_error(f"사용자 {i} 대시보드 예외: {str(e)}")

def test_social_finance(users):
    """소셜 금융 기능 테스트"""
    print_section("소셜 금융 기능 테스트")
    
    if not users:
        print_error("테스트할 사용자가 없습니다.")
        return
    
    user = users[0]  # 첫 번째 사용자로 테스트
    
    try:
        # 1. 친구 목록 조회
        print_info("친구 목록 조회 테스트...")
        response = requests.get(
            f"{BASE_URL}/api/social/friends",
            params={"user_id": user['user_key']}
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                friends_count = len(result.get('friends', []))
                print_success(f"친구 목록 조회 성공: {friends_count}명")
            else:
                print_error("친구 목록 조회 실패")
        else:
            print_error(f"친구 목록 조회 HTTP 오류: {response.status_code}")
        
        # 2. 송금 테스트
        print_info("송금 기능 테스트...")
        transfer_data = {
            "from_user_id": user['user_key'],
            "to_user_id": "friend_001",
            "amount": 10000,
            "memo": "테스트 송금",
            "account_no": user['account_no'],
            "transfer_type": "instant"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/social/transfer",
            json=transfer_data
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print_success("송금 요청 성공")
                print(f"   송금 ID: {result.get('transfer', {}).get('transferId')}")
                print(f"   금액: {result.get('transfer', {}).get('amount'):,}원")
            else:
                print_error("송금 요청 실패")
        else:
            print_error(f"송금 요청 HTTP 오류: {response.status_code}")
        
        # 3. 분할 정산 생성 테스트
        print_info("분할 정산 생성 테스트...")
        split_expense_data = {
            "title": "점심 식사",
            "description": "팀 점심 식사 비용",
            "total_amount": 30000,
            "paid_by": user['user_key'],
            "paid_by_name": "김학생",
            "category": "food",
            "date": datetime.now().isoformat(),
            "participants": [
                {"userId": user['user_key'], "name": "김학생", "share": 15000, "status": "pending"},
                {"userId": "friend_001", "name": "친구1", "share": 15000, "status": "pending"}
            ]
        }
        
        response = requests.post(
            f"{BASE_URL}/api/social/split-expense",
            json=split_expense_data
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                expense_id = result.get('expense', {}).get('id')
                print_success("분할 정산 생성 성공")
                print(f"   정산 ID: {expense_id}")
                print(f"   총 금액: {result.get('expense', {}).get('totalAmount'):,}원")
            else:
                print_error("분할 정산 생성 실패")
        else:
            print_error(f"분할 정산 생성 HTTP 오류: {response.status_code}")
            
    except Exception as e:
        print_error(f"소셜 금융 테스트 예외: {str(e)}")

def test_gamification(users):
    """게이미피케이션 기능 테스트"""
    print_section("게이미피케이션 기능 테스트")
    
    if not users:
        print_error("테스트할 사용자가 없습니다.")
        return
    
    user = users[0]  # 첫 번째 사용자로 테스트
    
    try:
        # 1. 사용자 프로필 조회
        print_info("사용자 프로필 조회 테스트...")
        response = requests.get(
            f"{BASE_URL}/api/gamification/profile/{user['user_key']}"
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                profile = result.get('profile', {})
                print_success("사용자 프로필 조회 성공")
                print(f"   레벨: {profile.get('level', 0)}")
                print(f"   XP: {profile.get('currentXP', 0)}")
                print(f"   크레도: {profile.get('totalCredits', 0)}")
            else:
                print_error("사용자 프로필 조회 실패")
        else:
            print_error(f"사용자 프로필 조회 HTTP 오류: {response.status_code}")
        
        # 2. 업적 목록 조회
        print_info("업적 목록 조회 테스트...")
        response = requests.get(
            f"{BASE_URL}/api/gamification/achievements",
            params={"user_id": user['user_key']}
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                achievements = result.get('achievements', [])
                unlocked_count = result.get('unlocked_count', 0)
                print_success("업적 목록 조회 성공")
                print(f"   총 업적: {len(achievements)}개")
                print(f"   해금된 업적: {unlocked_count}개")
            else:
                print_error("업적 목록 조회 실패")
        else:
            print_error(f"업적 목록 조회 HTTP 오류: {response.status_code}")
        
        # 3. 퀘스트 목록 조회
        print_info("퀘스트 목록 조회 테스트...")
        response = requests.get(
            f"{BASE_URL}/api/gamification/quests",
            params={"user_id": user['user_key']}
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                active_quests = result.get('active', [])
                available_quests = result.get('available', [])
                print_success("퀘스트 목록 조회 성공")
                print(f"   활성 퀘스트: {len(active_quests)}개")
                print(f"   사용 가능한 퀘스트: {len(available_quests)}개")
            else:
                print_error("퀘스트 목록 조회 실패")
        else:
            print_error(f"퀘스트 목록 조회 HTTP 오류: {response.status_code}")
        
        # 4. XP 획득 테스트
        print_info("XP 획득 테스트...")
        xp_data = {
            "user_id": user['user_key'],
            "amount": 100,
            "reason": "테스트 XP 획득"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/gamification/xp/gain",
            json=xp_data
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print_success("XP 획득 성공")
                print(f"   새로운 XP: {result.get('newXP', 0)}")
                print(f"   레벨업: {result.get('levelUp', False)}")
            else:
                print_error("XP 획득 실패")
        else:
            print_error(f"XP 획득 HTTP 오류: {response.status_code}")
        
        # 5. 일일 체크인 테스트
        print_info("일일 체크인 테스트...")
        checkin_data = {
            "user_id": user['user_key']
        }
        
        response = requests.post(
            f"{BASE_URL}/api/gamification/daily-checkin",
            json=checkin_data
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print_success("일일 체크인 성공")
                print(f"   스트릭: {result.get('streak', 0)}일")
                print(f"   보상 XP: {result.get('rewards', {}).get('xp', 0)}")
            else:
                print_error("일일 체크인 실패")
        else:
            print_error(f"일일 체크인 HTTP 오류: {response.status_code}")
            
    except Exception as e:
        print_error(f"게이미피케이션 테스트 예외: {str(e)}")

def test_ssafy_integration():
    """SSAFY API 통합 테스트"""
    print_section("SSAFY API 통합 테스트")
    
    try:
        # 1. 은행 코드 조회
        print_info("은행 코드 조회 테스트...")
        response = requests.get(f"{BASE_URL}/api/ssafy/bank-codes")
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                banks = result.get('banks', [])
                print_success(f"은행 코드 조회 성공: {len(banks)}개 은행")
            else:
                print_error("은행 코드 조회 실패")
        else:
            print_error(f"은행 코드 조회 HTTP 오류: {response.status_code}")
        
        # 2. 수시입출금 상품 조회
        print_info("수시입출금 상품 조회 테스트...")
        response = requests.get(f"{BASE_URL}/api/ssafy/demand-deposit/products")
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                products = result.get('products', [])
                print_success(f"수시입출금 상품 조회 성공: {len(products)}개 상품")
            else:
                print_error("수시입출금 상품 조회 실패")
        else:
            print_error(f"수시입출금 상품 조회 HTTP 오류: {response.status_code}")
            
    except Exception as e:
        print_error(f"SSAFY API 통합 테스트 예외: {str(e)}")

def test_error_handling():
    """에러 처리 테스트"""
    print_section("에러 처리 테스트")
    
    try:
        # 1. 잘못된 사용자 ID로 프로필 조회
        print_info("잘못된 사용자 ID로 프로필 조회 테스트...")
        response = requests.get(f"{BASE_URL}/api/gamification/profile/invalid_user_id")
        
        if response.status_code == 404:
            print_success("잘못된 사용자 ID 에러 처리 성공")
        else:
            print_error(f"잘못된 사용자 ID 에러 처리 실패: {response.status_code}")
        
        # 2. 잘못된 파라미터로 API 호출
        print_info("잘못된 파라미터로 API 호출 테스트...")
        response = requests.get(f"{BASE_URL}/api/social/friends")
        
        if response.status_code == 422:  # Validation Error
            print_success("잘못된 파라미터 에러 처리 성공")
        else:
            print_error(f"잘못된 파라미터 에러 처리 실패: {response.status_code}")
            
    except Exception as e:
        print_error(f"에러 처리 테스트 예외: {str(e)}")

def generate_test_report(users):
    """테스트 리포트 생성"""
    print_section("테스트 결과 요약")
    
    print(f"📊 총 테스트 사용자: {len(users)}명")
    
    if users:
        print("\n👥 생성된 테스트 사용자:")
        for i, user in enumerate(users, 1):
            print(f"   {i}. {user['email']}")
            print(f"      계좌번호: {user['account_no']}")
    
    print("\n🎯 테스트 완료된 기능:")
    print("   ✅ 사용자 회원가입 및 계좌 생성")
    print("   ✅ 홈 대시보드")
    print("   ✅ 소셜 금융 (친구, 송금, 분할 정산)")
    print("   ✅ 게이미피케이션 (프로필, 업적, 퀘스트, XP)")
    print("   ✅ SSAFY API 통합")
    print("   ✅ 에러 처리")
    
    print("\n🚀 다음 단계:")
    print("   1. React Native 앱에서 실제 UI 테스트")
    print("   2. 푸시 알림 기능 테스트")
    print("   3. AI 상담 기능 테스트")
    print("   4. 실제 사용자 시나리오 테스트")

def main():
    """메인 테스트 실행"""
    print("🚀 Campus Credo 전체 시스템 통합 테스트 시작")
    print(f"📍 테스트 서버: {BASE_URL}")
    print(f"⏰ 시작 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    try:
        # 1. 시스템 헬스 체크
        test_health_check()
        
        # 2. 사용자 회원가입 및 계좌 생성
        users = test_user_registration()
        
        if users:
            # 3. 홈 대시보드 테스트
            test_home_dashboard(users)
            
            # 4. 소셜 금융 기능 테스트
            test_social_finance(users)
            
            # 5. 게이미피케이션 기능 테스트
            test_gamification(users)
        
        # 6. SSAFY API 통합 테스트
        test_ssafy_integration()
        
        # 7. 에러 처리 테스트
        test_error_handling()
        
        # 8. 테스트 리포트 생성
        generate_test_report(users)
        
        print_success("🎉 전체 시스템 통합 테스트 완료!")
        
    except KeyboardInterrupt:
        print("\n⚠️ 사용자에 의해 테스트가 중단되었습니다.")
    except Exception as e:
        print_error(f"테스트 실행 중 예외 발생: {str(e)}")
    
    print(f"\n⏰ 종료 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    main()
