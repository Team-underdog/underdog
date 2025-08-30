#!/usr/bin/env python3
"""
SSAFY API 상품 데이터 등록 스크립트
실제 은행 상품들을 SSAFY API에 등록
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.ssafy_api_service import SSAFYAPIService
import json
from datetime import datetime

def create_bank_products():
    """은행 상품들 생성"""
    print("🏦 SSAFY API 상품 데이터 등록 시작")
    
    ssafy_service = SSAFYAPIService()
    
    try:
        # 1. 은행코드 조회
        print("\n1️⃣ 은행코드 조회...")
        bank_codes = ssafy_service.get_bank_codes()
        print(f"✅ 은행코드 조회 성공: {len(bank_codes.get('dataSearch', {}).get('content', []))}개 은행")
        
        # 은행코드가 없으면 기본 은행코드 사용
        if not bank_codes.get('dataSearch', {}).get('content'):
            print("⚠️ 등록된 은행코드가 없습니다. 기본 은행코드를 사용합니다.")
            default_banks = [
                {"bankCode": "001", "bankName": "한국은행"},
                {"bankCode": "002", "bankName": "신한은행"},
                {"bankCode": "003", "bankName": "우리은행"},
                {"bankCode": "004", "bankName": "국민은행"},
                {"bankCode": "005", "bankName": "하나은행"}
            ]
        else:
            default_banks = bank_codes['dataSearch']['content']
        
        # 2. 수시입출금 상품 등록
        print("\n2️⃣ 수시입출금 상품 등록...")
        demand_deposit_products = [
            {
                "bank_code": "001",
                "account_name": "Campus Credo 통장",
                "account_description": "학생들을 위한 특별한 수시입출금 통장"
            },
            {
                "bank_code": "002", 
                "account_name": "SSAFY 스마트 통장",
                "account_description": "SSAFY 학생 전용 스마트 통장"
            },
            {
                "bank_code": "003",
                "account_name": "청년 우대 통장",
                "account_description": "20-30대 청년을 위한 우대 이자 통장"
            }
        ]
        
        for product in demand_deposit_products:
            try:
                result = ssafy_service.create_demand_deposit_product(
                    product["bank_code"],
                    product["account_name"], 
                    product["account_description"]
                )
                print(f"✅ {product['account_name']} 등록 성공")
            except Exception as e:
                print(f"❌ {product['account_name']} 등록 실패: {str(e)}")
        
        # 3. 예금 상품 등록
        print("\n3️⃣ 예금 상품 등록...")
        deposit_products = [
            {
                "bank_code": "001",
                "account_name": "Campus Credo 7일 예금",
                "subscription_period": 7,
                "min_balance": 100000,
                "max_balance": 10000000,
                "interest_rate": 3.5,
                "account_description": "학생들을 위한 단기 고이자 예금",
                "rate_description": "7일 만기, 연 3.5% 이자"
            },
            {
                "bank_code": "002",
                "account_name": "SSAFY 30일 예금",
                "subscription_period": 30,
                "min_balance": 500000,
                "max_balance": 50000000,
                "interest_rate": 4.2,
                "account_description": "SSAFY 학생 전용 30일 예금",
                "rate_description": "30일 만기, 연 4.2% 이자"
            },
            {
                "bank_code": "003",
                "account_name": "청년 90일 예금",
                "subscription_period": 90,
                "min_balance": 1000000,
                "max_balance": 100000000,
                "interest_rate": 4.8,
                "account_description": "청년을 위한 중기 예금",
                "rate_description": "90일 만기, 연 4.8% 이자"
            }
        ]
        
        for product in deposit_products:
            try:
                result = ssafy_service.create_deposit_product(
                    product["bank_code"],
                    product["account_name"],
                    product["subscription_period"],
                    product["min_balance"],
                    product["max_balance"],
                    product["interest_rate"],
                    product["account_description"],
                    product["rate_description"]
                )
                print(f"✅ {product['account_name']} 등록 성공")
            except Exception as e:
                print(f"❌ {product['account_name']} 등록 실패: {str(e)}")
        
        # 4. 적금 상품 등록
        print("\n4️⃣ 적금 상품 등록...")
        savings_products = [
            {
                "bank_code": "001",
                "account_name": "Campus Credo 7일 적금",
                "subscription_period": 7,
                "min_balance": 10000,
                "max_balance": 1000000,
                "interest_rate": 4.0,
                "account_description": "학생들을 위한 단기 적금",
                "rate_description": "7일 적금, 연 4.0% 이자"
            },
            {
                "bank_code": "002",
                "account_name": "SSAFY 30일 적금",
                "subscription_period": 30,
                "min_balance": 50000,
                "max_balance": 5000000,
                "interest_rate": 4.5,
                "account_description": "SSAFY 학생 전용 30일 적금",
                "rate_description": "30일 적금, 연 4.5% 이자"
            },
            {
                "bank_code": "003",
                "account_name": "청년 90일 적금",
                "subscription_period": 90,
                "min_balance": 100000,
                "max_balance": 10000000,
                "interest_rate": 5.2,
                "account_description": "청년을 위한 중기 적금",
                "rate_description": "90일 적금, 연 5.2% 이자"
            }
        ]
        
        for product in savings_products:
            try:
                result = ssafy_service.create_savings_product(
                    product["bank_code"],
                    product["account_name"],
                    product["subscription_period"],
                    product["min_balance"],
                    product["max_balance"],
                    product["interest_rate"],
                    product["account_description"],
                    product["rate_description"]
                )
                print(f"✅ {product['account_name']} 등록 성공")
            except Exception as e:
                print(f"❌ {product['account_name']} 등록 실패: {str(e)}")
        
        # 5. 대출 상품 등록
        print("\n5️⃣ 대출 상품 등록...")
        
        # 먼저 신용등급 기준 조회
        try:
            credit_criteria = ssafy_service.get_credit_rating_criteria()
            if credit_criteria.get('dataSearch', {}).get('content'):
                rating_unique_no = credit_criteria['dataSearch']['content'][0].get('ratingUniqueNo', 'RT-default')
            else:
                rating_unique_no = 'RT-default'
        except:
            rating_unique_no = 'RT-default'
        
        loan_products = [
            {
                "bank_code": "001",
                "account_name": "Campus Credo 학생 대출",
                "rating_unique_no": rating_unique_no,
                "loan_period": 365,
                "min_balance": 1000000,
                "max_balance": 10000000,
                "interest_rate": 5.5,
                "account_description": "학생들을 위한 저금리 대출"
            },
            {
                "bank_code": "002",
                "account_name": "SSAFY 우수학생 대출",
                "rating_unique_no": rating_unique_no,
                "loan_period": 730,
                "min_balance": 2000000,
                "max_balance": 20000000,
                "interest_rate": 4.8,
                "account_description": "SSAFY 우수학생 전용 대출"
            }
        ]
        
        for product in loan_products:
            try:
                result = ssafy_service.create_loan_product(
                    product["bank_code"],
                    product["account_name"],
                    product["rating_unique_no"],
                    product["loan_period"],
                    product["min_balance"],
                    product["max_balance"],
                    product["interest_rate"],
                    product["account_description"]
                )
                print(f"✅ {product['account_name']} 등록 성공")
            except Exception as e:
                print(f"❌ {product['account_name']} 등록 실패: {str(e)}")
        
        print("\n🎉 모든 상품 등록 완료!")
        return True
        
    except Exception as e:
        print(f"\n❌ 상품 등록 실패: {str(e)}")
        return False

def verify_products():
    """등록된 상품들 확인"""
    print("\n🔍 등록된 상품들 확인...")
    
    ssafy_service = SSAFYAPIService()
    
    try:
        # 수시입출금 상품 확인
        demand_products = ssafy_service.get_demand_deposit_products()
        print(f"📊 수시입출금 상품: {len(demand_products.get('dataSearch', {}).get('content', []))}개")
        
        # 예금 상품 확인
        deposit_products = ssafy_service.get_deposit_products()
        print(f"📊 예금 상품: {len(deposit_products.get('dataSearch', {}).get('content', []))}개")
        
        # 적금 상품 확인
        savings_products = ssafy_service.get_savings_products()
        print(f"📊 적금 상품: {len(savings_products.get('dataSearch', {}).get('content', []))}개")
        
        # 대출 상품 확인
        loan_products = ssafy_service.get_loan_products()
        print(f"📊 대출 상품: {len(loan_products.get('dataSearch', {}).get('content', []))}개")
        
        return True
        
    except Exception as e:
        print(f"❌ 상품 확인 실패: {str(e)}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("SSAFY API 상품 데이터 등록")
    print("=" * 60)
    
    # 1. 상품 등록
    success = create_bank_products()
    
    if success:
        # 2. 등록된 상품 확인
        verify_products()
        
        print("\n" + "=" * 60)
        print("✅ 상품 등록 완료!")
        print("이제 다음 단계를 진행할 수 있습니다:")
        print("1. 사용자 계좌 생성 테스트")
        print("2. 거래내역 시뮬레이션")
        print("3. Campus Credo 앱 기능 구현")
        print("=" * 60)
    else:
        print("\n❌ 상품 등록 실패")
        sys.exit(1)
