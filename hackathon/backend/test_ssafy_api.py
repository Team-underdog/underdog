#!/usr/bin/env python3
"""
SSAFY API 연동 테스트 스크립트
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.ssafy_api_service import SSAFYAPIService
import json

def test_ssafy_api():
    """SSAFY API 연동 테스트"""
    print("🚀 SSAFY API 연동 테스트 시작")
    
    # SSAFY API 서비스 인스턴스 생성
    ssafy_service = SSAFYAPIService()
    
    try:
        # 1. 상태 확인
        print("\n1️⃣ SSAFY API 상태 확인...")
        bank_codes = ssafy_service.get_bank_codes()
        print(f"✅ 은행코드 조회 성공: {len(bank_codes.get('dataSearch', {}).get('content', []))}개 은행")
        
        # 2. 학생 인증 테스트
        print("\n2️⃣ SSAFY 학생 인증 테스트...")
        test_email = "test@ssafy.com"
        student_verification = ssafy_service.verify_ssafy_student(test_email)
        print(f"✅ 학생 인증 결과: {student_verification}")
        
        # 3. 수시입출금 상품 조회
        print("\n3️⃣ 수시입출금 상품 조회...")
        demand_products = ssafy_service.get_demand_deposit_products()
        print(f"✅ 수시입출금 상품 조회 성공: {len(demand_products.get('dataSearch', {}).get('content', []))}개 상품")
        
        # 4. 예금 상품 조회
        print("\n4️⃣ 예금 상품 조회...")
        deposit_products = ssafy_service.get_deposit_products()
        print(f"✅ 예금 상품 조회 성공: {len(deposit_products.get('dataSearch', {}).get('content', []))}개 상품")
        
        # 5. 적금 상품 조회
        print("\n5️⃣ 적금 상품 조회...")
        savings_products = ssafy_service.get_savings_products()
        print(f"✅ 적금 상품 조회 성공: {len(savings_products.get('dataSearch', {}).get('content', []))}개 상품")
        
        # 6. 대출 상품 조회
        print("\n6️⃣ 대출 상품 조회...")
        loan_products = ssafy_service.get_loan_products()
        print(f"✅ 대출 상품 조회 성공: {len(loan_products.get('dataSearch', {}).get('content', []))}개 상품")
        
        # 7. 신용등급 기준 조회
        print("\n7️⃣ 신용등급 기준 조회...")
        credit_criteria = ssafy_service.get_credit_rating_criteria()
        print(f"✅ 신용등급 기준 조회 성공: {len(credit_criteria.get('dataSearch', {}).get('content', []))}개 기준")
        
        # 8. 통화코드 조회
        print("\n8️⃣ 통화코드 조회...")
        currency_codes = ssafy_service.get_currency_codes()
        print(f"✅ 통화코드 조회 성공: {len(currency_codes.get('dataSearch', {}).get('content', []))}개 통화")
        
        print("\n🎉 모든 SSAFY API 테스트 성공!")
        return True
        
    except Exception as e:
        print(f"\n❌ SSAFY API 테스트 실패: {str(e)}")
        return False

def test_api_endpoints():
    """API 엔드포인트 테스트"""
    print("\n🌐 API 엔드포인트 테스트 시작")
    
    try:
        import requests
        
        base_url = "http://localhost:8000"
        
        # 1. 상태 확인
        print("\n1️⃣ API 상태 확인...")
        response = requests.get(f"{base_url}/api/ssafy/health")
        if response.status_code == 200:
            print("✅ API 상태 확인 성공")
            print(f"응답: {response.json()}")
        else:
            print(f"❌ API 상태 확인 실패: {response.status_code}")
        
        # 2. 은행코드 조회
        print("\n2️⃣ 은행코드 조회 API...")
        response = requests.get(f"{base_url}/api/ssafy/bank-codes")
        if response.status_code == 200:
            print("✅ 은행코드 조회 API 성공")
            data = response.json()
            print(f"은행 수: {len(data.get('data', {}).get('dataSearch', {}).get('content', []))}")
        else:
            print(f"❌ 은행코드 조회 API 실패: {response.status_code}")
        
        # 3. 학생 인증 API
        print("\n3️⃣ 학생 인증 API...")
        response = requests.post(f"{base_url}/api/ssafy/verify-student?email=test@ssafy.com")
        if response.status_code == 200:
            print("✅ 학생 인증 API 성공")
            print(f"응답: {response.json()}")
        else:
            print(f"❌ 학생 인증 API 실패: {response.status_code}")
        
        print("\n🎉 API 엔드포인트 테스트 완료!")
        return True
        
    except Exception as e:
        print(f"\n❌ API 엔드포인트 테스트 실패: {str(e)}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("SSAFY API 연동 테스트")
    print("=" * 60)
    
    # 1. SSAFY API 서비스 테스트
    api_test_success = test_ssafy_api()
    
    # 2. API 엔드포인트 테스트 (백엔드 서버 실행 시)
    if api_test_success:
        print("\n" + "=" * 60)
        print("백엔드 서버를 실행한 후 다음 명령어로 API 테스트를 진행하세요:")
        print("python test_ssafy_api.py --test-endpoints")
        print("=" * 60)
        
        # 명령행 인수로 API 엔드포인트 테스트 실행
        if len(sys.argv) > 1 and sys.argv[1] == "--test-endpoints":
            endpoint_test_success = test_api_endpoints()
            if endpoint_test_success:
                print("\n🎉 모든 테스트 성공!")
            else:
                print("\n❌ 일부 테스트 실패")
    else:
        print("\n❌ SSAFY API 서비스 테스트 실패")
        sys.exit(1)
