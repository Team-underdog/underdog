#!/usr/bin/env python3
"""
대량 은행 상품 생성 스크립트
Campus Credo 앱을 위한 다양한 금융 상품들을 대량 생성
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.ssafy_api_service import SSAFYAPIService
import json
from datetime import datetime
import random

def create_massive_bank_products():
    """대량의 은행 상품들 생성"""
    print("🏦 대량 은행 상품 생성 시작")
    
    ssafy_service = SSAFYAPIService()
    
    try:
        # 1. 수시입출금 상품 대량 생성
        print("\n1️⃣ 수시입출금 상품 대량 생성...")
        demand_deposit_products = [
            # 한국은행 상품들
            {"bank_code": "001", "account_name": "Campus Credo 기본통장", "description": "학생들을 위한 기본 수시입출금 통장"},
            {"bank_code": "001", "account_name": "Campus Credo 프리미엄통장", "description": "고급 서비스가 포함된 프리미엄 통장"},
            {"bank_code": "001", "account_name": "Campus Credo 청년통장", "description": "20-30대 청년을 위한 특별 통장"},
            
            # 신한은행 상품들
            {"bank_code": "002", "account_name": "SSAFY 스마트 통장", "description": "SSAFY 학생 전용 스마트 통장"},
            {"bank_code": "002", "account_name": "SSAFY 프리미엄 통장", "description": "SSAFY 우수학생 전용 프리미엄 통장"},
            {"bank_code": "002", "account_name": "신한 청년 우대 통장", "description": "청년을 위한 우대 이자 통장"},
            {"bank_code": "002", "account_name": "신한 스마트플러스 통장", "description": "스마트폰 앱 연동 통장"},
            
            # 우리은행 상품들
            {"bank_code": "003", "account_name": "우리 청년 통장", "description": "우리은행 청년 전용 통장"},
            {"bank_code": "003", "account_name": "우리 스마트 통장", "description": "우리은행 스마트 서비스 통장"},
            {"bank_code": "003", "account_name": "우리 프리미엄 통장", "description": "우리은행 프리미엄 서비스 통장"},
            
            # 국민은행 상품들
            {"bank_code": "004", "account_name": "KB스타 청년 통장", "description": "KB스타 청년 전용 통장"},
            {"bank_code": "004", "account_name": "KB스타 프리미엄 통장", "description": "KB스타 프리미엄 서비스 통장"},
            {"bank_code": "004", "account_name": "KB스타 스마트 통장", "description": "KB스타 스마트 서비스 통장"},
            
            # 하나은행 상품들
            {"bank_code": "005", "account_name": "하나 청년 통장", "description": "하나은행 청년 전용 통장"},
            {"bank_code": "005", "account_name": "하나 프리미엄 통장", "description": "하나은행 프리미엄 서비스 통장"},
            {"bank_code": "005", "account_name": "하나 스마트 통장", "description": "하나은행 스마트 서비스 통장"},
            
            # 기타 은행 상품들
            {"bank_code": "006", "account_name": "기업 청년 통장", "description": "기업은행 청년 전용 통장"},
            {"bank_code": "007", "account_name": "농협 청년 통장", "description": "농협 청년 전용 통장"},
            {"bank_code": "008", "account_name": "수협 청년 통장", "description": "수협 청년 전용 통장"},
            {"bank_code": "009", "account_name": "새마을 청년 통장", "description": "새마을금고 청년 전용 통장"},
            {"bank_code": "010", "account_name": "신협 청년 통장", "description": "신협 청년 전용 통장"}
        ]
        
        created_demand_products = []
        for product in demand_deposit_products:
            try:
                result = ssafy_service.create_demand_deposit_product(
                    product["bank_code"],
                    product["account_name"], 
                    product["description"]
                )
                if result.get('success'):
                    created_demand_products.append(product)
                    print(f"✅ {product['account_name']} 등록 성공")
                else:
                    print(f"❌ {product['account_name']} 등록 실패")
            except Exception as e:
                print(f"❌ {product['account_name']} 등록 오류: {str(e)}")
        
        print(f"📊 수시입출금 상품: {len(created_demand_products)}개 생성 완료")
        
        # 2. 예금 상품 대량 생성
        print("\n2️⃣ 예금 상품 대량 생성...")
        deposit_products = [
            # 단기 예금 (7-30일)
            {"bank_code": "001", "name": "Campus Credo 7일 예금", "period": 7, "min_balance": 100000, "max_balance": 10000000, "rate": 3.5, "description": "학생들을 위한 단기 고이자 예금", "rate_desc": "7일 만기, 연 3.5% 이자"},
            {"bank_code": "002", "name": "SSAFY 15일 예금", "period": 15, "min_balance": 200000, "max_balance": 20000000, "rate": 3.8, "description": "SSAFY 학생 전용 15일 예금", "rate_desc": "15일 만기, 연 3.8% 이자"},
            {"bank_code": "003", "name": "청년 30일 예금", "period": 30, "min_balance": 300000, "max_balance": 30000000, "rate": 4.0, "description": "청년을 위한 30일 예금", "rate_desc": "30일 만기, 연 4.0% 이자"},
            
            # 중기 예금 (60-180일)
            {"bank_code": "001", "name": "Campus Credo 60일 예금", "period": 60, "min_balance": 500000, "max_balance": 50000000, "rate": 4.2, "description": "학생들을 위한 중기 예금", "rate_desc": "60일 만기, 연 4.2% 이자"},
            {"bank_code": "002", "name": "SSAFY 90일 예금", "period": 90, "min_balance": 1000000, "max_balance": 100000000, "rate": 4.5, "description": "SSAFY 학생 전용 90일 예금", "rate_desc": "90일 만기, 연 4.5% 이자"},
            {"bank_code": "003", "name": "청년 180일 예금", "period": 180, "min_balance": 2000000, "max_balance": 200000000, "rate": 4.8, "description": "청년을 위한 180일 예금", "rate_desc": "180일 만기, 연 4.8% 이자"},
            
            # 장기 예금 (1년)
            {"bank_code": "001", "name": "Campus Credo 1년 예금", "period": 365, "min_balance": 5000000, "max_balance": 500000000, "rate": 5.0, "description": "학생들을 위한 장기 예금", "rate_desc": "1년 만기, 연 5.0% 이자"},
            {"bank_code": "002", "name": "SSAFY 1년 예금", "period": 365, "min_balance": 10000000, "max_balance": 1000000000, "rate": 5.2, "description": "SSAFY 학생 전용 1년 예금", "rate_desc": "1년 만기, 연 5.2% 이자"},
            {"bank_code": "003", "name": "청년 1년 예금", "period": 365, "min_balance": 20000000, "max_balance": 2000000000, "rate": 5.5, "description": "청년을 위한 1년 예금", "rate_desc": "1년 만기, 연 5.5% 이자"},
            
            # 특별 예금
            {"bank_code": "004", "name": "KB스타 청년 예금", "period": 90, "min_balance": 1000000, "max_balance": 100000000, "rate": 4.6, "description": "KB스타 청년 전용 예금", "rate_desc": "90일 만기, 연 4.6% 이자"},
            {"bank_code": "005", "name": "하나 청년 예금", "period": 180, "min_balance": 2000000, "max_balance": 200000000, "rate": 4.9, "description": "하나은행 청년 전용 예금", "rate_desc": "180일 만기, 연 4.9% 이자"},
            {"bank_code": "006", "name": "기업 청년 예금", "period": 365, "min_balance": 5000000, "max_balance": 500000000, "rate": 5.3, "description": "기업은행 청년 전용 예금", "rate_desc": "1년 만기, 연 5.3% 이자"}
        ]
        
        created_deposit_products = []
        for product in deposit_products:
            try:
                result = ssafy_service.create_deposit_product(
                    product["bank_code"],
                    product["name"],
                    product["period"],
                    product["min_balance"],
                    product["max_balance"],
                    product["rate"],
                    product["description"],
                    product["rate_desc"]
                )
                if result.get('success'):
                    created_deposit_products.append(product)
                    print(f"✅ {product['name']} 등록 성공")
                else:
                    print(f"❌ {product['name']} 등록 실패")
            except Exception as e:
                print(f"❌ {product['name']} 등록 오류: {str(e)}")
        
        print(f"📊 예금 상품: {len(created_deposit_products)}개 생성 완료")
        
        # 3. 적금 상품 대량 생성
        print("\n3️⃣ 적금 상품 대량 생성...")
        savings_products = [
            # 단기 적금 (7-30일)
            {"bank_code": "001", "name": "Campus Credo 7일 적금", "period": 7, "min_balance": 10000, "max_balance": 1000000, "rate": 4.0, "description": "학생들을 위한 단기 적금", "rate_desc": "7일 적금, 연 4.0% 이자"},
            {"bank_code": "002", "name": "SSAFY 15일 적금", "period": 15, "min_balance": 20000, "max_balance": 2000000, "rate": 4.3, "description": "SSAFY 학생 전용 15일 적금", "rate_desc": "15일 적금, 연 4.3% 이자"},
            {"bank_code": "003", "name": "청년 30일 적금", "period": 30, "min_balance": 50000, "max_balance": 5000000, "rate": 4.5, "description": "청년을 위한 30일 적금", "rate_desc": "30일 적금, 연 4.5% 이자"},
            
            # 중기 적금 (60-180일)
            {"bank_code": "001", "name": "Campus Credo 60일 적금", "period": 60, "min_balance": 100000, "max_balance": 10000000, "rate": 4.7, "description": "학생들을 위한 중기 적금", "rate_desc": "60일 적금, 연 4.7% 이자"},
            {"bank_code": "002", "name": "SSAFY 90일 적금", "period": 90, "min_balance": 200000, "max_balance": 20000000, "rate": 5.0, "description": "SSAFY 학생 전용 90일 적금", "rate_desc": "90일 적금, 연 5.0% 이자"},
            {"bank_code": "003", "name": "청년 180일 적금", "period": 180, "min_balance": 500000, "max_balance": 50000000, "rate": 5.3, "description": "청년을 위한 180일 적금", "rate_desc": "180일 적금, 연 5.3% 이자"},
            
            # 장기 적금 (1년)
            {"bank_code": "001", "name": "Campus Credo 1년 적금", "period": 365, "min_balance": 1000000, "max_balance": 100000000, "rate": 5.5, "description": "학생들을 위한 장기 적금", "rate_desc": "1년 적금, 연 5.5% 이자"},
            {"bank_code": "002", "name": "SSAFY 1년 적금", "period": 365, "min_balance": 2000000, "max_balance": 200000000, "rate": 5.8, "description": "SSAFY 학생 전용 1년 적금", "rate_desc": "1년 적금, 연 5.8% 이자"},
            {"bank_code": "003", "name": "청년 1년 적금", "period": 365, "min_balance": 5000000, "max_balance": 500000000, "rate": 6.0, "description": "청년을 위한 1년 적금", "rate_desc": "1년 적금, 연 6.0% 이자"},
            
            # 특별 적금
            {"bank_code": "004", "name": "KB스타 청년 적금", "period": 90, "min_balance": 200000, "max_balance": 20000000, "rate": 5.1, "description": "KB스타 청년 전용 적금", "rate_desc": "90일 적금, 연 5.1% 이자"},
            {"bank_code": "005", "name": "하나 청년 적금", "period": 180, "min_balance": 500000, "max_balance": 50000000, "rate": 5.4, "description": "하나은행 청년 전용 적금", "rate_desc": "180일 적금, 연 5.4% 이자"},
            {"bank_code": "006", "name": "기업 청년 적금", "period": 365, "min_balance": 1000000, "max_balance": 100000000, "rate": 5.7, "description": "기업은행 청년 전용 적금", "rate_desc": "1년 적금, 연 5.7% 이자"}
        ]
        
        created_savings_products = []
        for product in savings_products:
            try:
                result = ssafy_service.create_savings_product(
                    product["bank_code"],
                    product["name"],
                    product["period"],
                    product["min_balance"],
                    product["max_balance"],
                    product["rate"],
                    product["description"],
                    product["rate_desc"]
                )
                if result.get('success'):
                    created_savings_products.append(product)
                    print(f"✅ {product['name']} 등록 성공")
                else:
                    print(f"❌ {product['name']} 등록 실패")
            except Exception as e:
                print(f"❌ {product['name']} 등록 오류: {str(e)}")
        
        print(f"📊 적금 상품: {len(created_savings_products)}개 생성 완료")
        
        # 4. 대출 상품 생성
        print("\n4️⃣ 대출 상품 생성...")
        
        # 신용등급 기준 조회
        try:
            credit_criteria = ssafy_service.get_credit_rating_criteria()
            if credit_criteria.get('dataSearch', {}).get('content'):
                rating_unique_no = credit_criteria['dataSearch']['content'][0].get('ratingUniqueNo', 'RT-default')
            else:
                rating_unique_no = 'RT-default'
        except:
            rating_unique_no = 'RT-default'
        
        loan_products = [
            {"bank_code": "001", "name": "Campus Credo 학생 대출", "rating_unique_no": rating_unique_no, "period": 365, "min_balance": 1000000, "max_balance": 10000000, "rate": 5.5, "description": "학생들을 위한 저금리 대출"},
            {"bank_code": "002", "name": "SSAFY 우수학생 대출", "rating_unique_no": rating_unique_no, "period": 730, "min_balance": 2000000, "max_balance": 20000000, "rate": 4.8, "description": "SSAFY 우수학생 전용 대출"},
            {"bank_code": "003", "name": "청년 창업 대출", "rating_unique_no": rating_unique_no, "period": 1095, "min_balance": 5000000, "max_balance": 50000000, "rate": 6.0, "description": "청년 창업을 위한 대출"},
            {"bank_code": "004", "name": "KB스타 청년 대출", "rating_unique_no": rating_unique_no, "period": 365, "min_balance": 1000000, "max_balance": 15000000, "rate": 5.8, "description": "KB스타 청년 전용 대출"},
            {"bank_code": "005", "name": "하나 청년 대출", "rating_unique_no": rating_unique_no, "period": 730, "min_balance": 2000000, "max_balance": 25000000, "rate": 5.2, "description": "하나은행 청년 전용 대출"}
        ]
        
        created_loan_products = []
        for product in loan_products:
            try:
                result = ssafy_service.create_loan_product(
                    product["bank_code"],
                    product["name"],
                    product["rating_unique_no"],
                    product["period"],
                    product["min_balance"],
                    product["max_balance"],
                    product["rate"],
                    product["description"]
                )
                if result.get('success'):
                    created_loan_products.append(product)
                    print(f"✅ {product['name']} 등록 성공")
                else:
                    print(f"❌ {product['name']} 등록 실패")
            except Exception as e:
                print(f"❌ {product['name']} 등록 오류: {str(e)}")
        
        print(f"📊 대출 상품: {len(created_loan_products)}개 생성 완료")
        
        # 5. 결과 요약
        total_products = len(created_demand_products) + len(created_deposit_products) + len(created_savings_products) + len(created_loan_products)
        
        print("\n" + "=" * 60)
        print("🎉 대량 은행 상품 생성 완료!")
        print("=" * 60)
        print(f"📊 총 생성된 상품: {total_products}개")
        print(f"   💳 수시입출금: {len(created_demand_products)}개")
        print(f"   💰 예금: {len(created_deposit_products)}개")
        print(f"   📈 적금: {len(created_savings_products)}개")
        print(f"   🏠 대출: {len(created_loan_products)}개")
        print("=" * 60)
        
        # 생성된 상품 정보 저장
        products_summary = {
            'created_date': datetime.now().isoformat(),
            'total_products': total_products,
            'demand_deposit': created_demand_products,
            'deposit': created_deposit_products,
            'savings': created_savings_products,
            'loan': created_loan_products
        }
        
        with open('massive_products_summary.json', 'w', encoding='utf-8') as f:
            json.dump(products_summary, f, ensure_ascii=False, indent=2)
        
        print(f"\n💾 상품 요약 정보가 'massive_products_summary.json'에 저장되었습니다.")
        
        return True
        
    except Exception as e:
        print(f"\n❌ 대량 상품 생성 실패: {str(e)}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("대량 은행 상품 생성")
    print("=" * 60)
    
    success = create_massive_bank_products()
    
    if success:
        print("\n✅ 모든 상품 생성이 완료되었습니다!")
        print("이제 다음 단계를 진행할 수 있습니다:")
        print("1. 회원가입과 동시에 사용자 계좌 생성")
        print("2. 홈화면 계좌 정보 연동")
        print("3. 거래 시뮬레이션 연동")
    else:
        print("\n❌ 상품 생성에 실패했습니다.")
        sys.exit(1)
