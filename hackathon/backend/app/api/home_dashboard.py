"""
홈화면 대시보드 API
사용자의 계좌 정보, 거래 내역, 재무 현황을 종합적으로 제공
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import logging
import random

from ..services.ssafy_api_service import SSAFYAPIService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/home", tags=["Home Dashboard"])

# SSAFY API 서비스 인스턴스
ssafy_service = SSAFYAPIService()

@router.get("/dashboard")
async def get_home_dashboard(user_key: str):
    """홈화면 대시보드 정보 조회"""
    try:
        print(f"🏠 홈화면 대시보드 조회: {user_key}")
        
        # 1. 계좌 요약 정보
        print("1️⃣ 계좌 요약 정보 조회...")
        account_summary = await get_account_summary(user_key)
        
        # 2. 최근 거래 내역
        print("2️⃣ 최근 거래 내역 조회...")
        recent_transactions = await get_recent_transactions(user_key, limit=10)
        
        # 3. 재무 현황
        print("3️⃣ 재무 현황 조회...")
        financial_status = await get_financial_status(user_key)
        
        # 4. 추천 상품
        print("4️⃣ 추천 상품 조회...")
        recommended_products = await get_recommended_products(user_key)
        
        # 5. 대시보드 응답 생성
        dashboard_data = {
            "success": True,
            "user_key": user_key,
            "timestamp": datetime.now().isoformat(),
            "account_summary": account_summary,
            "recent_transactions": recent_transactions,
            "financial_status": financial_status,
            "recommended_products": recommended_products
        }
        
        print(f"✅ 홈화면 대시보드 조회 완료")
        print(f"   총 계좌 수: {account_summary['total_accounts']}개")
        print(f"   총 자산: {account_summary['total_balance']:,}원")
        print(f"   최근 거래: {len(recent_transactions)}건")
        
        return dashboard_data
        
    except Exception as e:
        logger.error(f"홈화면 대시보드 조회 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"대시보드 조회 중 오류가 발생했습니다: {str(e)}")

async def get_account_summary(user_key: str) -> Dict[str, Any]:
    """계좌 요약 정보 조회"""
    try:
        # 수시입출금 계좌
        demand_accounts = ssafy_service.get_demand_deposit_accounts(user_key)
        demand_account_list = demand_accounts.get('dataSearch', {}).get('content', [])
        
        # 예금 계좌
        deposit_accounts = ssafy_service.get_deposit_accounts(user_key)
        deposit_account_list = deposit_accounts.get('dataSearch', {}).get('content', [])
        
        # 적금 계좌
        savings_accounts = ssafy_service.get_savings_accounts(user_key)
        savings_account_list = savings_accounts.get('dataSearch', {}).get('content', [])
        
        # 대출 계좌
        loan_accounts = ssafy_service.get_loan_accounts(user_key)
        loan_account_list = loan_accounts.get('dataSearch', {}).get('content', [])
        
        # 계좌별 잔액 계산
        total_balance = 0
        account_details = []
        
        # 수시입출금 계좌 잔액
        for account in demand_account_list:
            try:
                balance_info = ssafy_service.get_account_balance(
                    account.get('accountNo'), 
                    user_key
                )
                if balance_info.get('success'):
                    balance = balance_info.get('data', {}).get('balance', 0)
                    total_balance += balance
                    account_details.append({
                        'account_no': account.get('accountNo'),
                        'account_name': account.get('accountName'),
                        'account_type': '수시입출금',
                        'balance': balance,
                        'bank_name': account.get('bankName', 'N/A')
                    })
            except Exception as e:
                print(f"⚠️ 계좌 {account.get('accountNo')} 잔액 조회 실패: {str(e)}")
        
        # 예금 계좌 잔액
        for account in deposit_account_list:
            try:
                balance_info = ssafy_service.get_deposit_account_balance(
                    account.get('accountNo'), 
                    user_key
                )
                if balance_info.get('success'):
                    balance = balance_info.get('data', {}).get('balance', 0)
                    total_balance += balance
                    account_details.append({
                        'account_no': account.get('accountNo'),
                        'account_name': account.get('accountName'),
                        'account_type': '예금',
                        'balance': balance,
                        'bank_name': account.get('bankName', 'N/A')
                    })
            except Exception as e:
                print(f"⚠️ 예금 계좌 {account.get('accountNo')} 잔액 조회 실패: {str(e)}")
        
        # 적금 계좌 잔액
        for account in savings_account_list:
            try:
                balance_info = ssafy_service.get_savings_account_balance(
                    account.get('accountNo'), 
                    user_key
                )
                if balance_info.get('success'):
                    balance = balance_info.get('data', {}).get('balance', 0)
                    total_balance += balance
                    account_details.append({
                        'account_no': account.get('accountNo'),
                        'account_name': account.get('accountName'),
                        'account_type': '적금',
                        'balance': balance,
                        'bank_name': account.get('bankName', 'N/A')
                    })
            except Exception as e:
                print(f"⚠️ 적금 계좌 {account.get('accountNo')} 잔액 조회 실패: {str(e)}")
        
        # 대출 계좌 (부채로 계산)
        total_loan = 0
        for account in loan_account_list:
            try:
                balance_info = ssafy_service.get_loan_account_balance(
                    account.get('accountNo'), 
                    user_key
                )
                if balance_info.get('success'):
                    balance = balance_info.get('data', {}).get('balance', 0)
                    total_loan += balance
                    account_details.append({
                        'account_no': account.get('accountNo'),
                        'account_name': account.get('accountName'),
                        'account_type': '대출',
                        'balance': -balance,  # 대출은 음수로 표시
                        'bank_name': account.get('bankName', 'N/A')
                    })
            except Exception as e:
                print(f"⚠️ 대출 계좌 {account.get('accountNo')} 잔액 조회 실패: {str(e)}")
        
        # 순자산 계산
        net_worth = total_balance - total_loan
        
        return {
            "total_accounts": len(account_details),
            "total_balance": total_balance,
            "total_loan": total_loan,
            "net_worth": net_worth,
            "account_details": account_details,
            "account_counts": {
                "demand_deposit": len(demand_account_list),
                "deposit": len(deposit_account_list),
                "savings": len(savings_account_list),
                "loan": len(loan_account_list)
            }
        }
        
    except Exception as e:
        logger.error(f"계좌 요약 정보 조회 실패: {str(e)}")
        return {
            "total_accounts": 0,
            "total_balance": 0,
            "total_loan": 0,
            "net_worth": 0,
            "account_details": [],
            "account_counts": {"demand_deposit": 0, "deposit": 0, "savings": 0, "loan": 0}
        }

async def get_recent_transactions(user_key: str, limit: int = 10) -> List[Dict[str, Any]]:
    """최근 거래 내역 조회"""
    try:
        all_transactions = []
        
        # 수시입출금 계좌 거래 내역
        demand_accounts = ssafy_service.get_demand_deposit_accounts(user_key)
        demand_account_list = demand_accounts.get('dataSearch', {}).get('content', [])
        
        for account in demand_account_list:
            try:
                transactions = ssafy_service.get_demand_deposit_transactions(
                    account.get('accountNo'),
                    user_key,
                    limit=limit
                )
                
                if transactions.get('success'):
                    transaction_list = transactions.get('dataSearch', {}).get('content', [])
                    for tx in transaction_list:
                        tx['account_type'] = '수시입출금'
                        tx['account_name'] = account.get('accountName')
                        all_transactions.append(tx)
            except Exception as e:
                print(f"⚠️ 계좌 {account.get('accountNo')} 거래 내역 조회 실패: {str(e)}")
        
        # 예금 계좌 거래 내역
        deposit_accounts = ssafy_service.get_deposit_accounts(user_key)
        deposit_account_list = deposit_accounts.get('dataSearch', {}).get('content', [])
        
        for account in deposit_account_list:
            try:
                transactions = ssafy_service.get_deposit_transactions(
                    account.get('accountNo'),
                    user_key,
                    limit=limit
                )
                
                if transactions.get('success'):
                    transaction_list = transactions.get('dataSearch', {}).get('content', [])
                    for tx in transaction_list:
                        tx['account_type'] = '예금'
                        tx['account_name'] = account.get('accountName')
                        all_transactions.append(tx)
            except Exception as e:
                print(f"⚠️ 예금 계좌 {account.get('accountNo')} 거래 내역 조회 실패: {str(e)}")
        
        # 적금 계좌 거래 내역
        savings_accounts = ssafy_service.get_savings_accounts(user_key)
        savings_account_list = savings_accounts.get('dataSearch', {}).get('content', [])
        
        for account in savings_account_list:
            try:
                transactions = ssafy_service.get_savings_transactions(
                    account.get('accountNo'),
                    user_key,
                    limit=limit
                )
                
                if transactions.get('success'):
                    transaction_list = transactions.get('dataSearch', {}).get('content', [])
                    for tx in transaction_list:
                        tx['account_type'] = '적금'
                        tx['account_name'] = account.get('accountName')
                        all_transactions.append(tx)
            except Exception as e:
                print(f"⚠️ 적금 계좌 {account.get('accountNo')} 거래 내역 조회 실패: {str(e)}")
        
        # 날짜순으로 정렬하고 최근 거래만 반환
        all_transactions.sort(key=lambda x: x.get('transactionDate', ''), reverse=True)
        
        return all_transactions[:limit]
        
    except Exception as e:
        logger.error(f"최근 거래 내역 조회 실패: {str(e)}")
        return []

async def get_financial_status(user_key: str) -> Dict[str, Any]:
    """재무 현황 조회"""
    try:
        # 신용등급
        try:
            credit_rating = ssafy_service.get_my_credit_rating(user_key)
            credit_score = credit_rating.get('data', {}).get('creditScore', 0)
            credit_grade = credit_rating.get('data', {}).get('creditGrade', 'N/A')
        except Exception as e:
            print(f"⚠️ 신용등급 조회 실패: {str(e)}")
            credit_score = 0
            credit_grade = 'N/A'
        
        # 월별 수입/지출 분석 (최근 3개월)
        monthly_analysis = await analyze_monthly_finances(user_key)
        
        # 재무 목표 달성률
        financial_goals = await calculate_financial_goals(user_key)
        
        return {
            "credit_score": credit_score,
            "credit_grade": credit_grade,
            "monthly_analysis": monthly_analysis,
            "financial_goals": financial_goals
        }
        
    except Exception as e:
        logger.error(f"재무 현황 조회 실패: {str(e)}")
        return {
            "credit_score": 0,
            "credit_grade": "N/A",
            "monthly_analysis": {},
            "financial_goals": {}
        }

async def analyze_monthly_finances(user_key: str) -> Dict[str, Any]:
    """월별 재무 분석"""
    try:
        current_month = datetime.now()
        monthly_data = {}
        
        for i in range(3):  # 최근 3개월
            target_month = current_month - timedelta(days=30*i)
            month_key = target_month.strftime("%Y-%m")
            
            # 해당 월의 거래 내역 분석
            monthly_income = 0
            monthly_expense = 0
            
            # 수시입출금 계좌 거래 내역에서 월별 분석
            demand_accounts = ssafy_service.get_demand_deposit_accounts(user_key)
            demand_account_list = demand_accounts.get('dataSearch', {}).get('content', [])
            
            for account in demand_accounts.get('dataSearch', {}).get('content', []):
                try:
                    transactions = ssafy_service.get_demand_deposit_transactions(
                        account.get('accountNo'),
                        user_key,
                        limit=100  # 충분한 거래 내역 조회
                    )
                    
                    if transactions.get('success'):
                        transaction_list = transactions.get('dataSearch', {}).get('content', [])
                        for tx in transaction_list:
                            tx_date = tx.get('transactionDate', '')
                            if tx_date.startswith(month_key):
                                amount = tx.get('amount', 0)
                                if amount > 0:
                                    monthly_income += amount
                                else:
                                    monthly_expense += abs(amount)
                except Exception as e:
                    print(f"⚠️ 월별 재무 분석 실패: {str(e)}")
            
            monthly_data[month_key] = {
                "income": monthly_income,
                "expense": monthly_expense,
                "net": monthly_income - monthly_expense
            }
        
        return monthly_data
        
    except Exception as e:
        logger.error(f"월별 재무 분석 실패: {str(e)}")
        return {}

async def calculate_financial_goals(user_key: str) -> Dict[str, Any]:
    """재무 목표 달성률 계산"""
    try:
        # 계좌 요약 정보 조회
        account_summary = await get_account_summary(user_key)
        total_balance = account_summary['total_balance']
        net_worth = account_summary['net_worth']
        
        # 목표 설정 (예시)
        goals = {
            "emergency_fund": {
                "target": 1000000,  # 100만원 비상금
                "current": min(total_balance, 1000000),
                "description": "비상금 100만원 모으기"
            },
            "savings_rate": {
                "target": 0.3,  # 수입의 30% 저축
                "current": 0.0,  # 실제 계산 필요
                "description": "수입의 30% 저축하기"
            },
            "debt_free": {
                "target": 0,  # 대출 0원
                "current": max(0, -net_worth),
                "description": "대출 완전 상환하기"
            }
        }
        
        # 달성률 계산
        for goal_key, goal in goals.items():
            if goal['target'] > 0:
                goal['achievement_rate'] = min(100, (goal['current'] / goal['target']) * 100)
            else:
                goal['achievement_rate'] = 100 if goal['current'] == 0 else 0
        
        return goals
        
    except Exception as e:
        logger.error(f"재무 목표 달성률 계산 실패: {str(e)}")
        return {}

async def get_recommended_products(user_key: str) -> List[Dict[str, Any]]:
    """추천 상품 조회"""
    try:
        recommended = []
        
        # 계좌 요약 정보 조회
        account_summary = await get_account_summary(user_key)
        total_balance = account_summary['total_balance']
        
        # 사용 가능한 상품 조회
        try:
            # 예금 상품
            deposit_products = ssafy_service.get_deposit_products()
            deposit_list = deposit_products.get('dataSearch', {}).get('content', [])
            
            # 적금 상품
            savings_products = ssafy_service.get_savings_products()
            savings_list = savings_products.get('dataSearch', {}).get('content', [])
            
            # 대출 상품
            loan_products = ssafy_service.get_loan_products()
            loan_list = loan_products.get('dataSearch', {}).get('content', [])
            
            # 추천 로직
            if total_balance < 500000:  # 50만원 미만
                # 적금 상품 추천
                if savings_list:
                    recommended.append({
                        'type': '적금',
                        'product': savings_list[0],
                        'reason': '소액으로 시작할 수 있는 적금 상품',
                        'priority': 'high'
                    })
            
            elif total_balance < 2000000:  # 200만원 미만
                # 예금 상품 추천
                if deposit_list:
                    recommended.append({
                        'type': '예금',
                        'product': deposit_list[0],
                        'reason': '안정적인 수익을 위한 예금 상품',
                        'priority': 'medium'
                    })
            
            else:  # 200만원 이상
                # 고금리 상품 추천
                high_rate_products = []
                for product in deposit_list + savings_list:
                    rate = product.get('rate', 0)
                    if rate >= 4.0:  # 4% 이상
                        high_rate_products.append(product)
                
                if high_rate_products:
                    recommended.append({
                        'type': '고금리 상품',
                        'product': high_rate_products[0],
                        'reason': '높은 수익률을 위한 고금리 상품',
                        'priority': 'high'
                    })
            
            # 신용등급이 좋은 경우 대출 상품 추천
            try:
                credit_rating = ssafy_service.get_my_credit_rating(user_key)
                credit_score = credit_rating.get('data', {}).get('creditScore', 0)
                
                if credit_score >= 700 and loan_list:  # 신용점수 700 이상
                    recommended.append({
                        'type': '대출',
                        'product': loan_list[0],
                        'reason': '우수한 신용등급으로 저금리 대출 가능',
                        'priority': 'low'
                    })
            except Exception as e:
                print(f"⚠️ 신용등급 조회 실패: {str(e)}")
                
        except Exception as e:
            print(f"⚠️ 상품 조회 실패: {str(e)}")
        
        return recommended[:3]  # 최대 3개 추천
        
    except Exception as e:
        logger.error(f"추천 상품 조회 실패: {str(e)}")
        return []

@router.get("/account-details/{account_no}")
async def get_account_details(account_no: str, user_key: str):
    """특정 계좌 상세 정보 조회"""
    try:
        print(f"🔍 계좌 상세 정보 조회: {account_no}")
        
        # 계좌 타입 확인
        account_type = await determine_account_type(account_no, user_key)
        
        if account_type == "demand_deposit":
            # 수시입출금 계좌 상세
            account_info = ssafy_service.get_demand_deposit_account(account_no, user_key)
            balance_info = ssafy_service.get_account_balance(account_no, user_key)
            transactions = ssafy_service.get_demand_deposit_transactions(account_no, user_key, limit=50)
            
        elif account_type == "deposit":
            # 예금 계좌 상세
            account_info = ssafy_service.get_deposit_account(account_no, user_key)
            balance_info = ssafy_service.get_deposit_account_balance(account_no, user_key)
            transactions = ssafy_service.get_deposit_transactions(account_no, user_key, limit=50)
            
        elif account_type == "savings":
            # 적금 계좌 상세
            account_info = ssafy_service.get_savings_account(account_no, user_key)
            balance_info = ssafy_service.get_savings_account_balance(account_no, user_key)
            transactions = ssafy_service.get_savings_transactions(account_no, user_key, limit=50)
            
        elif account_type == "loan":
            # 대출 계좌 상세
            account_info = ssafy_service.get_loan_account(account_no, user_key)
            balance_info = ssafy_service.get_loan_account_balance(account_no, user_key)
            transactions = ssafy_service.get_loan_transactions(account_no, user_key, limit=50)
            
        else:
            raise HTTPException(status_code=400, detail="계좌 타입을 확인할 수 없습니다.")
        
        # 응답 데이터 구성
        response_data = {
            "success": True,
            "account_no": account_no,
            "account_type": account_type,
            "account_info": account_info.get('dataSearch', {}).get('content', [{}])[0] if account_info.get('success') else {},
            "balance_info": balance_info.get('data', {}) if balance_info.get('success') else {},
            "transactions": transactions.get('dataSearch', {}).get('content', []) if transactions.get('success') else []
        }
        
        print(f"✅ 계좌 상세 정보 조회 완료: {account_no}")
        
        return response_data
        
    except Exception as e:
        logger.error(f"계좌 상세 정보 조회 실패: {str(e)}")
        raise HTTPException(status_code=500, detail=f"계좌 상세 정보 조회 중 오류가 발생했습니다: {str(e)}")

async def determine_account_type(account_no: str, user_key: str) -> str:
    """계좌 타입 확인"""
    try:
        # 각 계좌 타입별로 조회 시도
        try:
            ssafy_service.get_demand_deposit_account(account_no, user_key)
            return "demand_deposit"
        except:
            pass
        
        try:
            ssafy_service.get_deposit_account(account_no, user_key)
            return "deposit"
        except:
            pass
        
        try:
            ssafy_service.get_savings_account(account_no, user_key)
            return "savings"
        except:
            pass
        
        try:
            ssafy_service.get_loan_account(account_no, user_key)
            return "loan"
        except:
            pass
        
        return "unknown"
        
    except Exception as e:
        logger.error(f"계좌 타입 확인 실패: {str(e)}")
        return "unknown"
