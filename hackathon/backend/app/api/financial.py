from fastapi import APIRouter, HTTPException, Depends, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select
from typing import Optional, List
from datetime import datetime, timedelta
import random


from ..db.session import get_session
from ..models.financial import (
    BankAccount, Transaction, FinancialProduct, UserProduct, CreditScore,
    BankAccountResponse, TransactionResponse, FinancialProductResponse, 
    UserProductResponse, CreditScoreResponse, FinancialSummaryResponse
)
from ..models.user import User
from ..services.user_service import JWTService

# 신한그룹 브랜드 정보
SHINHAN_GROUP = {
    "primary_color": "#004191",  # 신한 블루
    "secondary_color": "#00A3E0",  # 신한 그린
    "accent_color": "#FF6B35",  # 신한 오렌지
    "banks": ["신한은행", "신한카드", "신한투자증권", "신한생명", "신한캐피탈"],
    "slogan": "당신과 함께하는 금융",
    "ssafy_partnership": "SSAFY 학생 전용 특별 혜택"
}

router = APIRouter()
security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_session)
) -> User:
    """현재 인증된 사용자 정보 반환"""
    token = credentials.credentials
    user = JWTService.get_user_from_token(token, db)
    
    if not user:
        raise HTTPException(
            status_code=401,
            detail="유효하지 않은 토큰입니다",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user


@router.get("/financial/accounts", response_model=List[BankAccountResponse])
async def get_bank_accounts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """현재 사용자의 은행 계좌 목록 조회"""
    try:
        # 사용자의 계좌 목록 조회
        accounts = db.exec(
            select(BankAccount).where(BankAccount.user_id == current_user.id)
        ).all()
        
        if not accounts:
            # 목업 데이터 생성
            accounts = create_mock_bank_accounts(current_user.id, db)
        
        return [
            BankAccountResponse(
                id=account.id,
                account_number=account.account_number,
                bank_name=account.bank_name,
                account_type=account.account_type,
                account_name=account.account_name,
                balance=account.balance,
                currency=account.currency,
                is_active=account.is_active,
                created_date=account.created_date,
                last_transaction_date=account.last_transaction_date,
                created_at=account.created_at,
                updated_at=account.updated_at
            )
            for account in accounts
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"계좌 목록 조회 중 오류가 발생했습니다: {str(e)}"
        )


@router.get("/financial/transactions", response_model=List[TransactionResponse])
async def get_transactions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
    account_id: Optional[int] = None,
    limit: int = 20
):
    """현재 사용자의 거래 내역 조회"""
    try:
        # 사용자의 계좌 ID 목록 조회
        user_accounts = db.exec(
            select(BankAccount).where(BankAccount.user_id == current_user.id)
        ).all()
        
        if not user_accounts:
            # 목업 데이터 생성
            user_accounts = create_mock_bank_accounts(current_user.id, db)
        
        # 특정 계좌의 거래 내역 조회
        if account_id:
            transactions = db.exec(
                select(Transaction)
                .where(Transaction.account_id == account_id)
                .order_by(Transaction.transaction_date.desc())
                .limit(limit)
            ).all()
        else:
            # 모든 계좌의 거래 내역 조회
            account_ids = [account.id for account in user_accounts]
            transactions = db.exec(
                select(Transaction)
                .where(Transaction.account_id.in_(account_ids))
                .order_by(Transaction.transaction_date.desc())
                .limit(limit)
            ).all()
        
        if not transactions:
            # 목업 데이터 생성
            transactions = create_mock_transactions(user_accounts, db)
        
        return [
            TransactionResponse(
                id=transaction.id,
                transaction_type=transaction.transaction_type,
                amount=transaction.amount,
                balance_after=transaction.balance_after,
                description=transaction.description,
                category=transaction.category,
                transaction_date=transaction.transaction_date,
                created_at=transaction.created_at
            )
            for transaction in transactions
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"거래 내역 조회 중 오류가 발생했습니다: {str(e)}"
        )


@router.get("/financial/products", response_model=List[FinancialProductResponse])
async def get_financial_products(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
    product_type: Optional[str] = None
):
    """금융 상품 목록 조회"""
    try:
        # 상품 타입별 조회
        if product_type:
            products = db.exec(
                select(FinancialProduct)
                .where(FinancialProduct.product_type == product_type)
                .where(FinancialProduct.is_active == True)
            ).all()
        else:
            products = db.exec(
                select(FinancialProduct)
                .where(FinancialProduct.is_active == True)
            ).all()
        
        if not products:
            # 목업 데이터 생성
            products = create_mock_financial_products(db)
        
        return [
            FinancialProductResponse(
                id=product.id,
                product_code=product.product_code,
                product_name=product.product_name,
                product_type=product.product_type,
                bank_name=product.bank_name,
                interest_rate=product.interest_rate,
                min_amount=product.min_amount,
                max_amount=product.max_amount,
                term_months=product.term_months,
                description=product.description,
                features=product.features,
                is_active=product.is_active,
                created_at=product.created_at,
                updated_at=product.updated_at
            )
            for product in products
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"금융 상품 조회 중 오류가 발생했습니다: {str(e)}"
        )


@router.get("/financial/user-products", response_model=List[UserProductResponse])
async def get_user_products(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """현재 사용자의 가입 상품 목록 조회"""
    try:
        # 사용자의 가입 상품 조회
        user_products = db.exec(
            select(UserProduct).where(UserProduct.user_id == current_user.id)
        ).all()
        
        if not user_products:
            # 목업 데이터 생성
            user_products = create_mock_user_products(current_user.id, db)
        
        return [
            UserProductResponse(
                id=up.id,
                product=FinancialProductResponse(
                    id=up.product.id,
                    product_code=up.product.product_code,
                    product_name=up.product.product_name,
                    product_type=up.product.product_type,
                    bank_name=up.product.bank_name,
                    interest_rate=up.product.interest_rate,
                    min_amount=up.product.min_amount,
                    max_amount=up.product.max_amount,
                    term_months=up.product.term_months,
                    description=up.product.description,
                    features=up.product.features,
                    is_active=up.product.is_active,
                    created_at=up.product.created_at,
                    updated_at=up.product.updated_at
                ),
                account=BankAccountResponse(
                    id=up.account.id,
                    account_number=up.account.account_number,
                    bank_name=up.account.bank_name,
                    account_type=up.account.account_type,
                    account_name=up.account.account_name,
                    balance=up.account.balance,
                    currency=up.account.currency,
                    is_active=up.account.is_active,
                    created_date=up.account.created_date,
                    last_transaction_date=up.account.last_transaction_date,
                    created_at=up.account.created_at,
                    updated_at=up.account.updated_at
                ),
                amount=up.amount,
                start_date=up.start_date,
                end_date=up.end_date,
                status=up.status,
                total_interest=up.total_interest,
                last_interest_date=up.last_interest_date,
                created_at=up.created_at,
                updated_at=up.updated_at
            )
            for up in user_products
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"가입 상품 조회 중 오류가 발생했습니다: {str(e)}"
        )


@router.get("/financial/credit-score", response_model=CreditScoreResponse)
async def get_credit_score(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """현재 사용자의 신용점수 조회"""
    try:
        # 사용자의 신용점수 조회
        credit_score = db.exec(
            select(CreditScore).where(CreditScore.user_id == current_user.id)
        ).first()
        
        if not credit_score:
            # 목업 데이터 생성
            credit_score = create_mock_credit_score(current_user.id, db)
        
        return CreditScoreResponse(
            id=credit_score.id,
            score=credit_score.score,
            grade=credit_score.grade,
            last_updated=credit_score.last_updated,
            credit_limit=credit_score.credit_limit,
            used_credit=credit_score.used_credit,
            created_at=credit_score.created_at,
            updated_at=credit_score.updated_at
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"신용점수 조회 중 오류가 발생했습니다: {str(e)}"
        )


@router.get("/financial/summary", response_model=FinancialSummaryResponse)
async def get_financial_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """현재 사용자의 금융 요약 정보 조회"""
    try:
        # 사용자의 계좌 목록 조회 (안전한 처리)
        try:
            accounts = db.exec(
                select(BankAccount).where(BankAccount.user_id == current_user.id)
            ).all()
            
            if not accounts:
                # 목업 데이터 생성
                accounts = create_mock_bank_accounts(current_user.id, db)
        except Exception as e:
            print(f"⚠️ 계좌 조회 실패, 목업 데이터 사용: {e}")
            accounts = create_mock_bank_accounts(current_user.id, db)
        
        # 신용점수 조회 (안전한 처리)
        try:
            credit_score = db.exec(
                select(CreditScore).where(CreditScore.user_id == current_user.id)
            ).first()
            
            if not credit_score:
                # 목업 데이터 생성
                credit_score = create_mock_credit_score(current_user.id, db)
        except Exception as e:
            print(f"⚠️ 신용점수 조회 실패, 목업 데이터 사용: {e}")
            credit_score = create_mock_credit_score(current_user.id, db)
        
        # 거래 내역 조회 (최근 10건) - 안전한 처리
        try:
            account_ids = [account.id for account in accounts] if accounts else []
            if account_ids:
                transactions = db.exec(
                    select(Transaction)
                    .where(Transaction.account_id.in_(account_ids))
                    .order_by(Transaction.transaction_date.desc())
                    .limit(10)
                ).all()
            else:
                transactions = []
            
            if not transactions:
                # 목업 데이터 생성
                transactions = create_mock_transactions(accounts, db)
        except Exception as e:
            print(f"⚠️ 거래내역 조회 실패, 목업 데이터 사용: {e}")
            transactions = create_mock_transactions(accounts, db)
        
        # 가입 상품 조회 (안전한 처리)
        try:
            user_products = db.exec(
                select(UserProduct).where(UserProduct.user_id == current_user.id)
            ).all()
            
            if not user_products:
                # 목업 데이터 생성
                user_products = create_mock_user_products(current_user.id, db)
        except Exception as e:
            print(f"⚠️ 가입상품 조회 실패, 목업 데이터 사용: {e}")
            user_products = create_mock_user_products(current_user.id, db)
        
        # 요약 정보 계산 (안전한 처리)
        try:
            total_balance = sum(account.balance for account in accounts if account.account_type == "수시입출금")
            total_assets = sum(account.balance for account in accounts if account.account_type in ["수시입출금", "예금", "적금"])
            total_liabilities = sum(account.balance for account in accounts if account.account_type == "대출")
            net_worth = total_assets - total_liabilities
        except Exception as e:
            print(f"⚠️ 요약 정보 계산 실패, 기본값 사용: {e}")
            total_balance = 0
            total_assets = 0
            total_liabilities = 0
            net_worth = 0
        
        return FinancialSummaryResponse(
            total_balance=total_balance,
            total_assets=total_assets,
            total_liabilities=total_liabilities,
            net_worth=net_worth,
            credit_score=CreditScoreResponse(
                id=credit_score.id,
                score=credit_score.score,
                grade=credit_score.grade,
                last_updated=credit_score.last_updated,
                credit_limit=credit_score.credit_limit,
                used_credit=credit_score.used_credit,
                created_at=credit_score.created_at,
                updated_at=credit_score.updated_at
            ),
            accounts=[
                BankAccountResponse(
                    id=account.id,
                    account_number=account.account_number,
                    bank_name=account.bank_name,
                    account_type=account.account_type,
                    account_name=account.account_name,
                    balance=account.balance,
                    currency=account.currency,
                    is_active=account.is_active,
                    created_date=account.created_date,
                    last_transaction_date=account.last_transaction_date,
                    created_at=account.created_at,
                    updated_at=account.updated_at
                )
                for account in accounts
            ],
            recent_transactions=[
                TransactionResponse(
                    id=transaction.id,
                    transaction_type=transaction.transaction_type,
                    amount=transaction.amount,
                    balance_after=transaction.balance_after,
                    description=transaction.description,
                    category=transaction.category,
                    transaction_date=transaction.transaction_date,
                    created_at=transaction.created_at
                )
                for transaction in transactions
            ],
            products=[
                UserProductResponse(
                    id=up.id,
                    product=FinancialProductResponse(
                        id=up.product.id,
                        product_code=up.product.product_code,
                        product_name=up.product.product_name,
                        product_type=up.product.product_type,
                        bank_name=up.product.bank_name,
                        interest_rate=up.product.interest_rate,
                        min_amount=up.product.min_amount,
                        max_amount=up.product.max_amount,
                        term_months=up.product.term_months,
                        description=up.product.description,
                        features=up.product.features,
                        is_active=up.product.is_active,
                        created_at=up.product.created_at,
                        updated_at=up.product.updated_at
                    ),
                    account=BankAccountResponse(
                        id=up.account.id,
                        account_number=up.account.account_number,
                        bank_name=up.account.bank_name,
                        account_type=up.account.account_type,
                        account_name=up.account.account_name,
                        balance=up.account.balance,
                        currency=up.account.currency,
                        is_active=up.account.is_active,
                        created_date=up.account.created_date,
                        last_transaction_date=up.account.last_transaction_date,
                        created_at=up.account.created_at,
                        updated_at=up.account.updated_at
                    ),
                    amount=up.amount,
                    start_date=up.start_date,
                    end_date=up.end_date,
                    status=up.status,
                    total_interest=up.total_interest,
                    last_interest_date=up.last_interest_date,
                    created_at=up.created_at,
                    updated_at=up.updated_at
                )
                for up in user_products
            ]
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"금융 요약 정보 조회 중 오류가 발생했습니다: {str(e)}"
        )


# 목업 데이터 생성 함수들
def create_mock_bank_accounts(user_id: int, db: Session) -> List[BankAccount]:
    """목업 은행 계좌 생성 (신한그룹 통일)"""
    # 신한그룹 계열사들
    shinhan_banks = ["신한은행", "신한카드", "신한투자증권", "신한생명", "신한캐피탈"]
    account_types = ["수시입출금", "예금", "적금", "대출", "투자", "보험"]
    
    accounts = []
    for i, account_type in enumerate(account_types):
        # 신한그룹 계열사 중에서 선택
        bank_name = random.choice(shinhan_banks)
        
        # 계좌 타입별 적절한 은행 선택
        if account_type in ["투자"]:
            bank_name = "신한투자증권"
        elif account_type in ["보험"]:
            bank_name = "신한생명"
        elif account_type in ["대출"]:
            bank_name = random.choice(["신한은행", "신한캐피탈"])
        else:
            bank_name = random.choice(["신한은행", "신한카드"])
        
        account = BankAccount(
            user_id=user_id,
            account_number=f"{random.randint(1000000000000000, 9999999999999999)}",
            bank_name=bank_name,
            account_type=account_type,
            account_name=f"신한그룹 {account_type} 계좌",
            balance=random.randint(100000, 10000000),
            currency="KRW",
            is_active=True,
            created_date=datetime.now() - timedelta(days=random.randint(30, 365)),
            last_transaction_date=datetime.now() - timedelta(days=random.randint(1, 7)),
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        accounts.append(account)
        db.add(account)
    
    db.commit()
    return accounts


def create_mock_transactions(accounts: List[BankAccount], db: Session) -> List[Transaction]:
    """목업 거래 내역 생성 (신한그룹 통일)"""
    transaction_types = ["입금", "출금", "이체", "이자", "투자수익", "보험료", "카드결제"]
    categories = ["생활비", "교통비", "식비", "학비", "투자", "보험", "카드", "기타"]
    descriptions = [
        # 신한은행 관련
        "월급", "ATM출금", "이체", "이자지급", "장학금", "용돈",
        
        # 신한카드 관련
        "신한카드 결제", "교통카드충전", "온라인 쇼핑", "음식점 결제",
        
        # 신한투자증권 관련
        "투자수익", "펀드 수익", "주식 배당", "투자 상환",
        
        # 신한생명 관련
        "보험료 납부", "보험금 지급", "실비보험 청구",
        
        # 신한캐피탈 관련
        "대출 상환", "이자 납부", "수수료",
        
        # 기타
        "식사비", "도서구입", "교통비", "통신비"
    ]
    
    transactions = []
    for account in accounts:
        for i in range(random.randint(5, 15)):
            amount = random.randint(1000, 500000)
            transaction_type = random.choice(transaction_types)
            
            # 출금인 경우 음수로 처리
            if transaction_type == "출금":
                amount = -amount
            
            transaction = Transaction(
                account_id=account.id,
                transaction_type=transaction_type,
                amount=amount,
                balance_after=account.balance + amount,
                description=random.choice(descriptions),
                category=random.choice(categories),
                transaction_date=datetime.now() - timedelta(days=random.randint(1, 30)),
                created_at=datetime.now()
            )
            transactions.append(transaction)
            db.add(transaction)
    
    db.commit()
    return transactions


def create_mock_financial_products(db: Session) -> List[FinancialProduct]:
    """목업 금융 상품 생성 (신한그룹 통일)"""
    products = [
        # 신한은행 상품들
        ("SH_SAV001", "SSAFY 특별 예금", "예금", "신한은행", 3.8, 1000000, 50000000, 12, "SSAFY 학생 전용 특별 예금 상품", "높은 이자율, 자유로운 입출금"),
        ("SH_SAV002", "청년 스마트 적금", "적금", "신한은행", 4.5, 100000, 1000000, 24, "청년을 위한 적금 상품", "복리 효과, 목돈 마련"),
        ("SH_LOAN001", "학생 전용 대출", "대출", "신한은행", 2.5, 1000000, 10000000, 36, "학생 전용 저금리 대출", "낮은 금리, 긴 상환기간"),
        
        # 신한카드 상품들
        ("SH_CARD001", "SSAFY 학생 카드", "카드", "신한카드", 0.0, 0, 0, 0, "SSAFY 학생 전용 신용카드", "연회비 면제, 다양한 혜택"),
        ("SH_CARD002", "청년 체크카드", "카드", "신한카드", 0.0, 0, 0, 0, "청년을 위한 체크카드", "연회비 면제, 현금백 혜택"),
        
        # 신한투자증권 상품들
        ("SH_INV001", "청년 투자 상품", "투자", "신한투자증권", 5.2, 500000, 10000000, 12, "청년을 위한 투자 상품", "안정적인 수익률, 분산 투자"),
        ("SH_INV002", "SSAFY 특별 펀드", "투자", "신한투자증권", 6.0, 1000000, 20000000, 24, "SSAFY 학생 전용 투자 상품", "높은 수익률, 전문 운용"),
        
        # 신한생명 상품들
        ("SH_INS001", "청년 보장보험", "보험", "신한생명", 0.0, 50000, 1000000, 120, "청년을 위한 보장보험", "저렴한 보험료, 다양한 보장"),
        ("SH_INS002", "학생 실비보험", "보험", "신한생명", 0.0, 30000, 500000, 60, "학생 전용 실비보험", "저렴한 보험료, 의료비 보장"),
        
        # 신한캐피탈 상품들
        ("SH_CAP001", "청년 소액대출", "대출", "신한캐피탈", 3.2, 100000, 5000000, 24, "청년을 위한 소액대출", "빠른 승인, 간편한 상환"),
    ]
    
    product_objects = []
    for code, name, type_, bank, rate, min_amt, max_amt, term, desc, features in products:
        product = FinancialProduct(
            product_code=code,
            product_name=name,
            product_type=type_,
            bank_name=bank,
            interest_rate=rate,
            min_amount=min_amt,
            max_amount=max_amt,
            term_months=term,
            description=desc,
            features=features,
            is_active=True,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        product_objects.append(product)
        db.add(product)
    
    db.commit()
    return product_objects


def create_mock_user_products(user_id: int, db: Session) -> List[UserProduct]:
    """목업 사용자 상품 가입 생성"""
    # 먼저 상품과 계좌가 필요
    products = db.exec(select(FinancialProduct)).all()
    if not products:
        products = create_mock_financial_products(db)
    
    accounts = db.exec(select(BankAccount).where(BankAccount.user_id == user_id)).all()
    if not accounts:
        accounts = create_mock_bank_accounts(user_id, db)
    
    user_products = []
    for i in range(random.randint(1, 3)):
        product = random.choice(products)
        account = random.choice(accounts)
        
        user_product = UserProduct(
            user_id=user_id,
            product_id=product.id,
            account_id=account.id,
            amount=random.randint(product.min_amount, min(product.max_amount, 5000000)),
            start_date=datetime.now() - timedelta(days=random.randint(30, 180)),
            end_date=datetime.now() + timedelta(days=random.randint(180, 365)),
            status="가입중",
            total_interest=random.randint(10000, 100000),
            last_interest_date=datetime.now() - timedelta(days=random.randint(1, 30)),
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        user_products.append(user_product)
        db.add(user_product)
    
    db.commit()
    return user_products


def create_mock_credit_score(user_id: int, db: Session) -> CreditScore:
    """목업 신용점수 생성"""
    score = random.randint(600, 900)
    grades = ["A+", "A", "B+", "B", "C+", "C", "D"]
    
    # 점수에 따른 등급 결정
    if score >= 850:
        grade = "A+"
    elif score >= 800:
        grade = "A"
    elif score >= 750:
        grade = "B+"
    elif score >= 700:
        grade = "B"
    elif score >= 650:
        grade = "C+"
    elif score >= 600:
        grade = "C"
    else:
        grade = "D"
    
    credit_score = CreditScore(
        user_id=user_id,
        score=score,
        grade=grade,
        last_updated=datetime.now(),
        credit_limit=random.randint(1000000, 10000000),
        used_credit=random.randint(0, 5000000),
        created_at=datetime.now(),
        updated_at=datetime.now()
    )
    
    db.add(credit_score)
    db.commit()
    db.refresh(credit_score)
    
    return credit_score
