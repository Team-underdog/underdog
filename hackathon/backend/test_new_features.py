#!/usr/bin/env python3
"""
새로 구현된 기능들 테스트 스크립트
1. 회원가입과 동시에 계좌 생성
2. 홈화면 대시보드 연동
3. 계좌 상태 확인
"""

import sys
import os
import requests
import json
from datetime import datetime

# 백엔드 서버 URL
BASE_URL = "http://localhost:8000"

def test_user_registration():
    """회원가입과 동시에 계좌 생성 테스트"""
    print("=" * 60)
    print("🧪 회원가입 및 계좌 생성 테스트")
    print("=" * 60)
    
    # 테스트 사용자 정보
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
            "preferred_bank": "002"
        },
        {
            "email": "student3@ssafy.com",
            "password": "password123", 
            "name": "박학생",
            "student_id": "2024003",
            "university": "SSAFY",
            "preferred_bank": "003"
        }
    ]
    
    created_users = []
    
    for i, user_data in enumerate(test_users, 1):
        print(f"\n👤 테스트 사용자 {i} 회원가입: {user_data['email']}")
        
        try:
            # 회원가입 API 호출
            response = requests.post(
                f"{BASE_URL}/api/registration/register-with-account",
                params=user_data
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    print(f"✅ 회원가입 성공!")
                    print(f"   사용자 ID: {result.get('user_id')}")
                    print(f"   User Key: {result.get('user_key')}")
                    print(f"   계좌번호: {result.get('account_no')}")
                    print(f"   상품명: {result.get('account_name')}")
                    print(f"   은행명: {result.get('bank_name')}")
                    print(f"   환영 금액: {result.get('welcome_amount'):,}원")
                    
                    created_users.append({
                        'email': user_data['email'],
                        'user_key': result.get('user_key'),
                        'account_no': result.get('account_no')
                    })
                else:
                    print(f"❌ 회원가입 실패: {result.get('message', '알 수 없는 오류')}")
            else:
                print(f"❌ HTTP 오류: {response.status_code}")
                print(f"   응답: {response.text}")
                
        except Exception as e:
            print(f"❌ 요청 실패: {str(e)}")
    
    print(f"\n📊 회원가입 결과: {len(created_users)}/{len(test_users)} 성공")
    
    # 성공한 사용자 정보 저장
    if created_users:
        with open('test_users.json', 'w', encoding='utf-8') as f:
            json.dump(created_users, f, ensure_ascii=False, indent=2)
        print(f"💾 테스트 사용자 정보가 'test_users.json'에 저장되었습니다.")
    
    return created_users

def test_home_dashboard(users):
    """홈화면 대시보드 테스트"""
    print("\n" + "=" * 60)
    print("🏠 홈화면 대시보드 테스트")
    print("=" * 60)
    
    for i, user in enumerate(users, 1):
        print(f"\n👤 사용자 {i} 대시보드: {user['email']}")
        
        try:
            # 홈화면 대시보드 API 호출
            response = requests.get(
                f"{BASE_URL}/api/home/dashboard",
                params={"user_key": user['user_key']}
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    print(f"✅ 대시보드 조회 성공!")
                    
                    # 계좌 요약 정보
                    account_summary = result.get('account_summary', {})
                    print(f"   총 계좌 수: {account_summary.get('total_accounts', 0)}개")
                    print(f"   총 자산: {account_summary.get('total_balance', 0):,}원")
                    print(f"   총 대출: {account_summary.get('total_loan', 0):,}원")
                    print(f"   순자산: {account_summary.get('net_worth', 0):,}원")
                    
                    # 계좌별 상세 정보
                    account_details = account_summary.get('account_details', [])
                    for account in account_details:
                        print(f"     - {account.get('account_name')}: {account.get('balance'):,}원 ({account.get('account_type')})")
                    
                    # 최근 거래 내역
                    recent_transactions = result.get('recent_transactions', [])
                    print(f"   최근 거래: {len(recent_transactions)}건")
                    
                    # 재무 현황
                    financial_status = result.get('financial_status', {})
                    credit_score = financial_status.get('credit_score', 0)
                    print(f"   신용점수: {credit_score}")
                    
                    # 추천 상품
                    recommended_products = result.get('recommended_products', [])
                    print(f"   추천 상품: {len(recommended_products)}개")
                    
                else:
                    print(f"❌ 대시보드 조회 실패: {result.get('message', '알 수 없는 오류')}")
            else:
                print(f"❌ HTTP 오류: {response.status_code}")
                print(f"   응답: {response.text}")
                
        except Exception as e:
            print(f"❌ 요청 실패: {str(e)}")

def test_account_status(users):
    """계좌 상태 확인 테스트"""
    print("\n" + "=" * 60)
    print("🔍 계좌 상태 확인 테스트")
    print("=" * 60)
    
    for i, user in enumerate(users, 1):
        print(f"\n👤 사용자 {i} 계좌 상태: {user['email']}")
        
        try:
            # 계좌 상태 확인 API 호출
            response = requests.get(
                f"{BASE_URL}/api/registration/check-account-status",
                params={"user_key": user['user_key']}
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    print(f"✅ 계좌 상태 확인 성공!")
                    
                    accounts = result.get('accounts', {})
                    print(f"   수시입출금: {accounts.get('demand_deposit', 0)}개")
                    print(f"   예금: {accounts.get('deposit', 0)}개")
                    print(f"   적금: {accounts.get('savings', 0)}개")
                    print(f"   대출: {accounts.get('loan', 0)}개")
                    
                    total_balance = result.get('total_balance', 0)
                    print(f"   총 잔액: {total_balance:,}원")
                    
                    credit_score = result.get('credit_score', 0)
                    credit_grade = result.get('credit_grade', 'N/A')
                    print(f"   신용점수: {credit_score} ({credit_grade})")
                    
                else:
                    print(f"❌ 계좌 상태 확인 실패: {result.get('message', '알 수 없는 오류')}")
            else:
                print(f"❌ HTTP 오류: {response.status_code}")
                print(f"   응답: {response.text}")
                
        except Exception as e:
            print(f"❌ 요청 실패: {str(e)}")

def test_available_products():
    """사용 가능한 상품 목록 조회 테스트"""
    print("\n" + "=" * 60)
    print("🏦 사용 가능한 상품 목록 테스트")
    print("=" * 60)
    
    try:
        # 상품 목록 조회 API 호출
        response = requests.get(f"{BASE_URL}/api/registration/available-products")
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print(f"✅ 상품 목록 조회 성공!")
                
                total_count = result.get('total_count', {})
                print(f"   수시입출금: {total_count.get('demand_deposit', 0)}개")
                print(f"   예금: {total_count.get('deposit', 0)}개")
                print(f"   적금: {total_count.get('savings', 0)}개")
                print(f"   대출: {total_count.get('loan', 0)}개")
                
                # 상품 상세 정보 (첫 번째 상품만)
                products = result.get('products', {})
                if products.get('demand_deposit'):
                    first_product = products['demand_deposit'][0]
                    print(f"\n   📋 첫 번째 수시입출금 상품:")
                    print(f"      상품명: {first_product.get('accountName', 'N/A')}")
                    print(f"      은행코드: {first_product.get('bankCode', 'N/A')}")
                    print(f"      설명: {first_product.get('description', 'N/A')}")
                
            else:
                print(f"❌ 상품 목록 조회 실패: {result.get('message', '알 수 없는 오류')}")
        else:
            print(f"❌ HTTP 오류: {response.status_code}")
            print(f"   응답: {response.text}")
            
    except Exception as e:
        print(f"❌ 요청 실패: {str(e)}")

def test_account_details(users):
    """계좌 상세 정보 조회 테스트"""
    print("\n" + "=" * 60)
    print("📋 계좌 상세 정보 조회 테스트")
    print("=" * 60)
    
    for i, user in enumerate(users, 1):
        print(f"\n👤 사용자 {i} 계좌 상세: {user['email']}")
        
        try:
            # 계좌 상세 정보 조회 API 호출
            response = requests.get(
                f"{BASE_URL}/api/home/account-details/{user['account_no']}",
                params={"user_key": user['user_key']}
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    print(f"✅ 계좌 상세 정보 조회 성공!")
                    
                    account_type = result.get('account_type', 'N/A')
                    account_info = result.get('account_info', {})
                    balance_info = result.get('balance_info', {})
                    transactions = result.get('transactions', [])
                    
                    print(f"   계좌 타입: {account_type}")
                    print(f"   계좌명: {account_info.get('accountName', 'N/A')}")
                    print(f"   잔액: {balance_info.get('balance', 0):,}원")
                    print(f"   거래 내역: {len(transactions)}건")
                    
                    # 최근 거래 3건 표시
                    if transactions:
                        print(f"   📊 최근 거래 내역:")
                        for j, tx in enumerate(transactions[:3], 1):
                            amount = tx.get('amount', 0)
                            date = tx.get('transactionDate', 'N/A')
                            memo = tx.get('memo', 'N/A')
                            print(f"      {j}. {date} | {amount:+,}원 | {memo}")
                    
                else:
                    print(f"❌ 계좌 상세 정보 조회 실패: {result.get('message', '알 수 없는 오류')}")
            else:
                print(f"❌ HTTP 오류: {response.status_code}")
                print(f"   응답: {response.text}")
                
        except Exception as e:
            print(f"❌ 요청 실패: {str(e)}")

def main():
    """메인 테스트 실행"""
    print("🚀 Campus Credo 새 기능 테스트 시작")
    print(f"📡 백엔드 서버: {BASE_URL}")
    print(f"⏰ 시작 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    try:
        # 1. 회원가입 및 계좌 생성 테스트
        created_users = test_user_registration()
        
        if not created_users:
            print("\n❌ 테스트 사용자 생성에 실패했습니다. 테스트를 중단합니다.")
            return
        
        # 2. 홈화면 대시보드 테스트
        test_home_dashboard(created_users)
        
        # 3. 계좌 상태 확인 테스트
        test_account_status(created_users)
        
        # 4. 사용 가능한 상품 목록 테스트
        test_available_products()
        
        # 5. 계좌 상세 정보 테스트
        test_account_details(created_users)
        
        print("\n" + "=" * 60)
        print("🎉 모든 테스트 완료!")
        print("=" * 60)
        print("✅ 구현된 기능들:")
        print("   1. 회원가입과 동시에 계좌 생성")
        print("   2. 홈화면 대시보드 연동")
        print("   3. 계좌 상태 확인")
        print("   4. 상품 목록 조회")
        print("   5. 계좌 상세 정보 조회")
        print("\n💡 다음 단계:")
        print("   - 프론트엔드에서 이 API들을 연동하여 UI 구현")
        print("   - 실제 사용자 시나리오에 맞는 추가 기능 개발")
        print("   - 에러 처리 및 사용자 경험 개선")
        
    except KeyboardInterrupt:
        print("\n\n⚠️ 사용자에 의해 테스트가 중단되었습니다.")
    except Exception as e:
        print(f"\n❌ 테스트 실행 중 오류 발생: {str(e)}")

if __name__ == "__main__":
    main()
