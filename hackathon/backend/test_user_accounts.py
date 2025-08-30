#!/usr/bin/env python3
"""
사용자 계좌 생성 및 테스트 스크립트
SSAFY API를 사용한 실제 계좌 생성 테스트
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.ssafy_api_service import SSAFYAPIService
import json
from datetime import datetime

def create_test_user_accounts():
    """테스트용 사용자 계좌 생성"""
    print("👤 사용자 계좌 생성 테스트 시작")
    
    ssafy_service = SSAFYAPIService()
    
    try:
        # 1. 테스트 사용자 계정 생성
        print("\n1️⃣ 테스트 사용자 계정 생성...")
        test_users = [
            "test1@ssafy.com",
            "test2@ssafy.com", 
            "student@ssafy.com"
        ]
        
        created_users = []
        for email in test_users:
            try:
                result = ssafy_service.create_user_account(email)
                if result.get('success'):
                    user_key = result.get('data', {}).get('userKey')
                    created_users.append({
                        'email': email,
                        'user_key': user_key,
                        'status': 'success'
                    })
                    print(f"✅ {email} 계정 생성 성공: {user_key}")
                else:
                    created_users.append({
                        'email': email,
                        'user_key': None,
                        'status': 'failed',
                        'error': result.get('message', '알 수 없는 오류')
                    })
                    print(f"❌ {email} 계정 생성 실패")
            except Exception as e:
                created_users.append({
                    'email': email,
                    'user_key': None,
                    'status': 'error',
                    'error': str(e)
                })
                print(f"❌ {email} 계정 생성 오류: {str(e)}")
        
        # 2. 수시입출금 상품 조회
        print("\n2️⃣ 수시입출금 상품 조회...")
        demand_products = ssafy_service.get_demand_deposit_products()
        available_products = demand_products.get('dataSearch', {}).get('content', [])
        
        if not available_products:
            print("⚠️ 등록된 수시입출금 상품이 없습니다. 먼저 상품을 등록해주세요.")
            return False
        
        print(f"✅ 사용 가능한 상품: {len(available_products)}개")
        for product in available_products[:3]:  # 처음 3개만 표시
            print(f"  - {product.get('accountName', 'N/A')} (ID: {product.get('accountTypeUniqueNo', 'N/A')})")
        
        # 3. 테스트 계좌 생성
        print("\n3️⃣ 테스트 계좌 생성...")
        
        successful_accounts = []
        for user in created_users:
            if user['status'] == 'success' and user['user_key']:
                try:
                    # 첫 번째 상품으로 계좌 생성
                    product = available_products[0]
                    account_type_unique_no = product.get('accountTypeUniqueNo')
                    
                    if account_type_unique_no:
                        result = ssafy_service.create_demand_deposit_account(
                            account_type_unique_no, 
                            user['user_key']
                        )
                        
                        if result.get('success'):
                            account_no = result.get('data', {}).get('accountNo')
                            successful_accounts.append({
                                'email': user['email'],
                                'user_key': user['user_key'],
                                'account_no': account_no,
                                'product_name': product.get('accountName')
                            })
                            print(f"✅ {user['email']} 계좌 생성 성공: {account_no}")
                        else:
                            print(f"❌ {user['email']} 계좌 생성 실패: {result.get('message', '알 수 없는 오류')}")
                    else:
                        print(f"⚠️ {user['email']}: 상품 ID를 찾을 수 없음")
                        
                except Exception as e:
                    print(f"❌ {user['email']} 계좌 생성 오류: {str(e)}")
        
        # 4. 계좌 정보 확인
        print("\n4️⃣ 생성된 계좌 정보 확인...")
        for account in successful_accounts:
            try:
                # 계좌 상세 정보 조회
                account_info = ssafy_service.get_demand_deposit_account(
                    account['account_no'], 
                    account['user_key']
                )
                
                if account_info.get('success'):
                    print(f"✅ {account['email']} 계좌 정보:")
                    print(f"    계좌번호: {account['account_no']}")
                    print(f"    상품명: {account['product_name']}")
                    print(f"    상태: {account_info.get('data', {}).get('accountStatus', 'N/A')}")
                else:
                    print(f"❌ {account['email']} 계좌 정보 조회 실패")
                    
            except Exception as e:
                print(f"❌ {account['email']} 계좌 정보 조회 오류: {str(e)}")
        
        # 5. 계좌 잔액 확인 (초기 잔액은 0)
        print("\n5️⃣ 계좌 잔액 확인...")
        for account in successful_accounts:
            try:
                balance_info = ssafy_service.get_account_balance(
                    account['account_no'], 
                    account['user_key']
                )
                
                if balance_info.get('success'):
                    balance = balance_info.get('data', {}).get('balance', 0)
                    print(f"✅ {account['email']} 잔액: {balance:,}원")
                else:
                    print(f"❌ {account['email']} 잔액 조회 실패")
                    
            except Exception as e:
                print(f"❌ {account['email']} 잔액 조회 오류: {str(e)}")
        
        print(f"\n🎉 계좌 생성 테스트 완료!")
        print(f"성공한 계좌: {len(successful_accounts)}개")
        
        return successful_accounts
        
    except Exception as e:
        print(f"\n❌ 계좌 생성 테스트 실패: {str(e)}")
        return False

def test_account_operations(accounts):
    """계좌 작업 테스트 (입금, 출금, 이체)"""
    if not accounts:
        print("⚠️ 테스트할 계좌가 없습니다.")
        return
    
    print("\n💳 계좌 작업 테스트 시작...")
    
    ssafy_service = SSAFYAPIService()
    
    for account in accounts:
        try:
            print(f"\n📝 {account['email']} 계좌 작업 테스트...")
            
            # 1. 입금 테스트
            print("  1️⃣ 입금 테스트...")
            deposit_result = ssafy_service.deposit_to_account(
                account['account_no'],
                100000,  # 10만원 입금
                "테스트 입금",
                account['user_key']
            )
            
            if deposit_result.get('success'):
                print("     ✅ 10만원 입금 성공")
                
                # 잔액 확인
                balance_info = ssafy_service.get_account_balance(
                    account['account_no'], 
                    account['user_key']
                )
                if balance_info.get('success'):
                    balance = balance_info.get('data', {}).get('balance', 0)
                    print(f"     💰 현재 잔액: {balance:,}원")
                
                # 2. 출금 테스트
                print("  2️⃣ 출금 테스트...")
                withdraw_result = ssafy_service.withdraw_from_account(
                    account['account_no'],
                    30000,  # 3만원 출금
                    "테스트 출금",
                    account['user_key']
                )
                
                if withdraw_result.get('success'):
                    print("     ✅ 3만원 출금 성공")
                    
                    # 잔액 확인
                    balance_info = ssafy_service.get_account_balance(
                        account['account_no'], 
                        account['user_key']
                    )
                    if balance_info.get('success'):
                        balance = balance_info.get('data', {}).get('balance', 0)
                        print(f"     💰 현재 잔액: {balance:,}원")
                else:
                    print(f"     ❌ 출금 실패: {withdraw_result.get('message', '알 수 없는 오류')}")
            else:
                print(f"     ❌ 입금 실패: {deposit_result.get('message', '알 수 없는 오류')}")
                
        except Exception as e:
            print(f"     ❌ 계좌 작업 테스트 오류: {str(e)}")
    
    print("\n🎉 계좌 작업 테스트 완료!")

def test_transaction_history(accounts):
    """거래내역 조회 테스트"""
    if not accounts:
        print("⚠️ 테스트할 계좌가 없습니다.")
        return
    
    print("\n📊 거래내역 조회 테스트 시작...")
    
    ssafy_service = SSAFYAPIService()
    
    for account in accounts:
        try:
            print(f"\n📝 {account['email']} 거래내역 조회...")
            
            # 최근 30일 거래내역 조회
            transactions = ssafy_service.get_transaction_history(
                account['account_no'],
                (datetime.now().replace(day=1)).strftime("%Y%m%d"),  # 이번 달 1일
                datetime.now().strftime("%Y%m%d"),  # 오늘
                "A",  # 전체
                "DESC",  # 최신순
                account['user_key']
            )
            
            if transactions.get('success'):
                transaction_list = transactions.get('data', {}).get('dataSearch', {}).get('content', [])
                print(f"     📊 거래내역: {len(transaction_list)}건")
                
                for tx in transaction_list[:5]:  # 최근 5건만 표시
                    tx_type = "입금" if tx.get('transactionType') == 'M' else "출금"
                    amount = tx.get('transactionBalance', 0)
                    summary = tx.get('transactionSummary', 'N/A')
                    date = tx.get('transactionDate', 'N/A')
                    
                    print(f"       {date} | {tx_type} | {amount:,}원 | {summary}")
            else:
                print(f"     ❌ 거래내역 조회 실패: {transactions.get('message', '알 수 없는 오류')}")
                
        except Exception as e:
            print(f"     ❌ 거래내역 조회 오류: {str(e)}")
    
    print("\n🎉 거래내역 조회 테스트 완료!")

if __name__ == "__main__":
    print("=" * 60)
    print("사용자 계좌 생성 및 테스트")
    print("=" * 60)
    
    # 1. 계좌 생성
    accounts = create_test_user_accounts()
    
    if accounts:
        # 2. 계좌 작업 테스트
        test_account_operations(accounts)
        
        # 3. 거래내역 조회 테스트
        test_transaction_history(accounts)
        
        print("\n" + "=" * 60)
        print("✅ 모든 테스트 완료!")
        print("이제 다음 단계를 진행할 수 있습니다:")
        print("1. 거래내역 시뮬레이션")
        print("2. Campus Credo 앱 기능 구현")
        print("=" * 60)
        
        # 생성된 계좌 정보 저장
        with open('test_accounts.json', 'w', encoding='utf-8') as f:
            json.dump(accounts, f, ensure_ascii=False, indent=2)
        print("\n💾 테스트 계좌 정보가 'test_accounts.json'에 저장되었습니다.")
        
    else:
        print("\n❌ 계좌 생성 실패")
        sys.exit(1)
