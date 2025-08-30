#!/usr/bin/env python3
"""
거래내역 시뮬레이션 스크립트
실제 학생들의 일상적인 금융 활동을 시뮬레이션
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.ssafy_api_service import SSAFYAPIService
import json
from datetime import datetime, timedelta
import random

def load_test_accounts():
    """테스트 계좌 정보 로드"""
    try:
        with open('test_accounts.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print("❌ test_accounts.json 파일을 찾을 수 없습니다.")
        print("먼저 test_user_accounts.py를 실행하여 계좌를 생성해주세요.")
        return None

def simulate_student_life(account, days=30):
    """학생의 일상적인 금융 활동 시뮬레이션"""
    print(f"\n🎓 {account['email']} 학생의 {days}일간 금융 활동 시뮬레이션...")
    
    ssafy_service = SSAFYAPIService()
    
    # 학생별 특성 설정
    student_profiles = {
        "test1@ssafy.com": {
            "type": "열심히 공부하는 학생",
            "monthly_allowance": 500000,  # 월 용돈
            "spending_pattern": "conservative"  # 절약형
        },
        "test2@ssafy.com": {
            "type": "활동적인 학생", 
            "monthly_allowance": 800000,  # 월 용돈
            "spending_pattern": "moderate"  # 보통형
        },
        "student@ssafy.com": {
            "type": "SSAFY 우수학생",
            "monthly_allowance": 1000000,  # 월 용돈 + 장학금
            "spending_pattern": "balanced"  # 균형형
        }
    }
    
    profile = student_profiles.get(account['email'], {
        "type": "일반 학생",
        "monthly_allowance": 600000,
        "spending_pattern": "moderate"
    })
    
    print(f"   📋 학생 유형: {profile['type']}")
    print(f"   💰 월 용돈: {profile['monthly_allowance']:,}원")
    
    # 시뮬레이션 시작
    current_balance = 0
    transactions = []
    
    for day in range(days):
        current_date = datetime.now() - timedelta(days=days-day-1)
        
        # 1. 월초 용돈 입금 (매월 1일)
        if current_date.day == 1:
            try:
                result = ssafy_service.deposit_to_account(
                    account['account_no'],
                    profile['monthly_allowance'],
                    f"{current_date.month}월 용돈",
                    account['user_key']
                )
                if result.get('success'):
                    current_balance += profile['monthly_allowance']
                    transactions.append({
                        'date': current_date.strftime("%Y-%m-%d"),
                        'type': '입금',
                        'amount': profile['monthly_allowance'],
                        'summary': f"{current_date.month}월 용돈",
                        'balance': current_balance
                    })
                    print(f"     💰 {current_date.strftime('%m/%d')} 용돈 입금: +{profile['monthly_allowance']:,}원")
            except Exception as e:
                print(f"     ❌ 용돈 입금 실패: {str(e)}")
        
        # 2. 일상적인 지출
        daily_spending = generate_daily_spending(profile['spending_pattern'], current_date)
        
        if daily_spending > 0:
            try:
                result = ssafy_service.withdraw_from_account(
                    account['account_no'],
                    daily_spending,
                    get_spending_summary(daily_spending, current_date),
                    account['user_key']
                )
                if result.get('success'):
                    current_balance -= daily_spending
                    transactions.append({
                        'date': current_date.strftime("%Y-%m-%d"),
                        'type': '출금',
                        'amount': daily_spending,
                        'summary': get_spending_summary(daily_spending, current_date),
                        'balance': current_balance
                    })
                    print(f"     💸 {current_date.strftime('%m/%d')} 지출: -{daily_spending:,}원 ({get_spending_summary(daily_spending, current_date)})")
            except Exception as e:
                print(f"     ❌ 지출 실패: {str(e)}")
        
        # 3. 특별한 수입 (알바, 장학금 등)
        if random.random() < 0.1:  # 10% 확률로 특별 수입
            special_income = random.choice([50000, 100000, 200000, 300000])
            try:
                result = ssafy_service.deposit_to_account(
                    account['account_no'],
                    special_income,
                    get_income_summary(special_income),
                    account['user_key']
                )
                if result.get('success'):
                    current_balance += special_income
                    transactions.append({
                        'date': current_date.strftime("%Y-%m-%d"),
                        'type': '입금',
                        'amount': special_income,
                        'summary': get_income_summary(special_income),
                        'balance': current_balance
                    })
                    print(f"     🎉 {current_date.strftime('%m/%d')} 특별 수입: +{special_income:,}원 ({get_income_summary(special_income)})")
            except Exception as e:
                print(f"     ❌ 특별 수입 실패: {str(e)}")
    
    # 4. 최종 잔액 확인
    try:
        balance_info = ssafy_service.get_account_balance(
            account['account_no'], 
            account['user_key']
        )
        if balance_info.get('success'):
            actual_balance = balance_info.get('data', {}).get('balance', 0)
            print(f"     💰 최종 잔액: {actual_balance:,}원")
            print(f"     📊 총 거래: {len(transactions)}건")
        else:
            print(f"     ❌ 잔액 조회 실패")
    except Exception as e:
        print(f"     ❌ 잔액 조회 오류: {str(e)}")
    
    return transactions

def generate_daily_spending(spending_pattern, date):
    """일일 지출 금액 생성"""
    # 주말에는 더 많은 지출
    is_weekend = date.weekday() >= 5
    
    base_spending = {
        "conservative": 5000,      # 절약형: 기본 5천원
        "moderate": 8000,          # 보통형: 기본 8천원  
        "balanced": 10000,         # 균형형: 기본 1만원
        "active": 15000            # 활동형: 기본 1.5만원
    }
    
    daily_amount = base_spending.get(spending_pattern, 8000)
    
    # 주말 보너스
    if is_weekend:
        daily_amount *= 1.5
    
    # 랜덤 변동 (±30%)
    variation = random.uniform(0.7, 1.3)
    daily_amount = int(daily_amount * variation)
    
    # 특별한 날 지출 증가
    if date.day in [15, 30]:  # 월중, 월말
        daily_amount *= 1.2
    
    return int(daily_amount)

def get_spending_summary(amount, date):
    """지출 요약 생성"""
    spending_categories = [
        "식비", "교통비", "카페", "편의점", "온라인 쇼핑",
        "영화/문화", "운동", "도서", "취미", "기타"
    ]
    
    # 금액에 따른 카테고리 선택
    if amount < 5000:
        category = random.choice(["식비", "교통비", "편의점"])
    elif amount < 15000:
        category = random.choice(["카페", "온라인 쇼핑", "도서"])
    else:
        category = random.choice(["영화/문화", "운동", "취미"])
    
    return f"{category}"

def get_income_summary(amount):
    """수입 요약 생성"""
    if amount <= 50000:
        return "알바비"
    elif amount <= 100000:
        return "과외비"
    elif amount <= 200000:
        return "프로젝트 수당"
    else:
        return "장학금"

def simulate_financial_products(accounts):
    """금융 상품 가입 시뮬레이션"""
    print(f"\n🏦 금융 상품 가입 시뮬레이션...")
    
    ssafy_service = SSAFYAPIService()
    
    for account in accounts:
        try:
            print(f"\n📝 {account['email']} 금융 상품 가입...")
            
            # 1. 예금 상품 가입
            try:
                deposit_products = ssafy_service.get_deposit_products()
                if deposit_products.get('dataSearch', {}).get('content'):
                    product = deposit_products['dataSearch']['content'][0]
                    deposit_amount = random.choice([100000, 200000, 500000])
                    
                    result = ssafy_service.create_deposit_account(
                        account['account_no'],  # 출금 계좌
                        product.get('accountTypeUniqueNo'),
                        deposit_amount,
                        account['user_key']
                    )
                    
                    if result.get('success'):
                        print(f"     ✅ 예금 가입: {product.get('accountName', 'N/A')} - {deposit_amount:,}원")
                    else:
                        print(f"     ❌ 예금 가입 실패")
                else:
                    print(f"     ⚠️ 등록된 예금 상품이 없습니다.")
            except Exception as e:
                print(f"     ❌ 예금 가입 오류: {str(e)}")
            
            # 2. 적금 상품 가입
            try:
                savings_products = ssafy_service.get_savings_products()
                if savings_products.get('dataSearch', {}).get('content'):
                    product = savings_products['dataSearch']['content'][0]
                    monthly_amount = random.choice([50000, 100000, 200000])
                    
                    result = ssafy_service.create_savings_account(
                        product.get('accountTypeUniqueNo'),
                        monthly_amount,
                        account['account_no'],  # 출금 계좌
                        account['user_key']
                    )
                    
                    if result.get('success'):
                        print(f"     ✅ 적금 가입: {product.get('accountName', 'N/A')} - 월 {monthly_amount:,}원")
                    else:
                        print(f"     ❌ 적금 가입 실패")
                else:
                    print(f"     ⚠️ 등록된 적금 상품이 없습니다.")
            except Exception as e:
                print(f"     ❌ 적금 가입 오류: {str(e)}")
                
        except Exception as e:
            print(f"     ❌ 금융 상품 가입 시뮬레이션 오류: {str(e)}")
    
    print("\n🎉 금융 상품 가입 시뮬레이션 완료!")

def generate_financial_report(accounts):
    """금융 리포트 생성"""
    print(f"\n📊 금융 리포트 생성...")
    
    for account in accounts:
        try:
            print(f"\n📈 {account['email']} 금융 리포트")
            print("=" * 50)
            
            # 계좌 정보
            print(f"🏦 계좌번호: {account['account_no']}")
            print(f"📋 상품명: {account['product_name']}")
            
            # 잔액 정보
            ssafy_service = SSAFYAPIService()
            balance_info = ssafy_service.get_account_balance(
                account['account_no'], 
                account['user_key']
            )
            
            if balance_info.get('success'):
                balance = balance_info.get('data', {}).get('balance', 0)
                print(f"💰 현재 잔액: {balance:,}원")
                
                # 잔액 등급
                if balance >= 1000000:
                    grade = "🏆 금융왕"
                elif balance >= 500000:
                    grade = "🥈 우수"
                elif balance >= 100000:
                    grade = "🥉 보통"
                else:
                    grade = "📚 초보"
                
                print(f"🏅 등급: {grade}")
            
            # 거래내역 요약
            try:
                transactions = ssafy_service.get_transaction_history(
                    account['account_no'],
                    (datetime.now() - timedelta(days=30)).strftime("%Y%m%d"),
                    datetime.now().strftime("%Y%m%d"),
                    "A", "DESC", account['user_key']
                )
                
                if transactions.get('success'):
                    tx_list = transactions.get('data', {}).get('dataSearch', {}).get('content', [])
                    
                    if tx_list:
                        total_income = sum([int(tx.get('transactionBalance', 0)) for tx in tx_list if tx.get('transactionType') == 'M'])
                        total_expense = sum([int(tx.get('transactionBalance', 0)) for tx in tx_list if tx.get('transactionType') == 'D'])
                        
                        print(f"📊 최근 30일 거래내역:")
                        print(f"   💰 총 수입: +{total_income:,}원")
                        print(f"   💸 총 지출: -{total_expense:,}원")
                        print(f"   📈 순수입: +{total_income - total_expense:,}원")
                        print(f"   📝 거래건수: {len(tx_list)}건")
                    else:
                        print(f"📊 최근 30일 거래내역: 없음")
                else:
                    print(f"📊 거래내역 조회 실패")
                    
            except Exception as e:
                print(f"📊 거래내역 조회 오류: {str(e)}")
            
            print("=" * 50)
            
        except Exception as e:
            print(f"❌ 금융 리포트 생성 오류: {str(e)}")

if __name__ == "__main__":
    print("=" * 60)
    print("거래내역 시뮬레이션")
    print("=" * 60)
    
    # 1. 테스트 계좌 로드
    accounts = load_test_accounts()
    
    if not accounts:
        sys.exit(1)
    
    print(f"📋 시뮬레이션 대상 계좌: {len(accounts)}개")
    
    # 2. 학생 생활 시뮬레이션
    all_transactions = []
    for account in accounts:
        transactions = simulate_student_life(account, days=30)
        all_transactions.append({
            'email': account['email'],
            'transactions': transactions
        })
    
    # 3. 금융 상품 가입 시뮬레이션
    simulate_financial_products(accounts)
    
    # 4. 금융 리포트 생성
    generate_financial_report(accounts)
    
    # 5. 결과 저장
    simulation_result = {
        'simulation_date': datetime.now().isoformat(),
        'duration_days': 30,
        'accounts': accounts,
        'transactions': all_transactions
    }
    
    with open('simulation_result.json', 'w', encoding='utf-8') as f:
        json.dump(simulation_result, f, ensure_ascii=False, indent=2)
    
    print("\n" + "=" * 60)
    print("🎉 거래내역 시뮬레이션 완료!")
    print("이제 다음 단계를 진행할 수 있습니다:")
    print("1. Campus Credo 앱 기능 구현")
    print("2. 크로니클 시스템 연동")
    print("3. 금융 퀘스트 생성")
    print("=" * 60)
    print(f"\n💾 시뮬레이션 결과가 'simulation_result.json'에 저장되었습니다.")
