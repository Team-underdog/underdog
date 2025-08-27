from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
from pydantic import BaseModel


if TYPE_CHECKING:
    from .user import User


class BankAccount(SQLModel, table=True):
    """은행 계좌 모델"""
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # 사용자 정보
    user_id: int = Field(foreign_key="user.id", description="사용자 ID")
    
    # 계좌 기본 정보
    account_number: str = Field(unique=True, description="계좌번호")
    bank_name: str = Field(description="은행명")
    account_type: str = Field(description="계좌구분: 수시입출금/예금/적금/대출")
    account_name: str = Field(description="계좌명")
    balance: int = Field(default=0, description="잔액 (1원 단위)")
    currency: str = Field(default="KRW", description="통화")
    
    # 계좌 상태
    is_active: bool = Field(default=True, description="활성화여부")
    created_date: datetime = Field(description="개설일")
    last_transaction_date: Optional[datetime] = Field(default=None, description="최종거래일")
    
    # 타임스탬프
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # 관계 정의
    user: Optional["User"] = Relationship(back_populates="bank_accounts")
    user_products: List["UserProduct"] = Relationship(back_populates="account")


class Transaction(SQLModel, table=True):
    """거래 내역 모델"""
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # 계좌 정보
    account_id: int = Field(foreign_key="bankaccount.id", description="계좌 ID")
    
    # 거래 정보
    transaction_type: str = Field(description="거래구분: 입금/출금/이체/이자")
    amount: int = Field(description="거래금액 (1원 단위)")
    balance_after: int = Field(description="거래후잔액 (1원 단위)")
    description: str = Field(description="거래내용")
    category: str = Field(description="카테고리: 생활비/교통비/식비/학비/기타")
    
    # 거래 시간
    transaction_date: datetime = Field(description="거래일시")
    
    # 타임스탬프
    created_at: datetime = Field(default_factory=datetime.utcnow)


class FinancialProduct(SQLModel, table=True):
    """금융 상품 모델"""
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # 상품 기본 정보
    product_code: str = Field(unique=True, description="상품코드")
    product_name: str = Field(description="상품명")
    product_type: str = Field(description="상품구분: 예금/적금/대출/카드")
    bank_name: str = Field(description="은행명")
    
    # 상품 조건
    interest_rate: float = Field(description="이자율(%)")
    min_amount: int = Field(description="최소가입금액 (1원 단위)")
    max_amount: int = Field(description="최대가입금액 (1원 단위)")
    term_months: int = Field(description="가입기간(개월)")
    
    # 상품 설명
    description: Optional[str] = Field(default=None, description="상품설명")
    features: Optional[str] = Field(default=None, description="상품특징")
    
    # 상품 상태
    is_active: bool = Field(default=True, description="활성화여부")
    
    # 타임스탬프
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # 관계 정의
    user_products: List["UserProduct"] = Relationship(back_populates="product")


class UserProduct(SQLModel, table=True):
    """사용자 상품 가입 모델"""
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # 사용자 및 상품 정보
    user_id: int = Field(foreign_key="user.id", description="사용자 ID")
    product_id: int = Field(foreign_key="financialproduct.id", description="상품 ID")
    account_id: int = Field(foreign_key="bankaccount.id", description="계좌 ID")
    
    # 가입 정보
    amount: int = Field(description="가입금액 (1원 단위)")
    start_date: datetime = Field(description="가입일")
    end_date: datetime = Field(description="만기일")
    status: str = Field(default="가입중", description="상태: 가입중/만기/해지")
    
    # 수익 정보
    total_interest: int = Field(default=0, description="총 이자 (1원 단위)")
    last_interest_date: Optional[datetime] = Field(default=None, description="최종이자지급일")
    
    # 타임스탬프
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # 관계 정의
    user: Optional["User"] = Relationship(back_populates="user_products")
    product: Optional["FinancialProduct"] = Relationship(back_populates="user_products")
    account: Optional["BankAccount"] = Relationship(back_populates="user_products")


class CreditScore(SQLModel, table=True):
    """신용점수 모델"""
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # 사용자 정보
    user_id: int = Field(foreign_key="user.id", description="사용자 ID")
    
    # 신용점수 정보
    score: int = Field(description="신용점수")
    grade: str = Field(description="신용등급: A+/A/B+/B/C+/C/D")
    last_updated: datetime = Field(description="최종업데이트일")
    
    # 신용 정보
    credit_limit: int = Field(default=0, description="신용한도 (1원 단위)")
    used_credit: int = Field(default=0, description="사용신용 (1원 단위)")
    
    # 타임스탬프
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# Pydantic 모델들 (API 요청/응답용)
class BankAccountResponse(BaseModel):
    """은행 계좌 응답 모델"""
    id: int
    account_number: str
    bank_name: str
    account_type: str
    account_name: str
    balance: int
    currency: str
    is_active: bool
    created_date: datetime
    last_transaction_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime


class TransactionResponse(BaseModel):
    """거래 내역 응답 모델"""
    id: int
    transaction_type: str
    amount: int
    balance_after: int
    description: str
    category: str
    transaction_date: datetime
    created_at: datetime


class FinancialProductResponse(BaseModel):
    """금융 상품 응답 모델"""
    id: int
    product_code: str
    product_name: str
    product_type: str
    bank_name: str
    interest_rate: float
    min_amount: int
    max_amount: int
    term_months: int
    description: Optional[str]
    features: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime


class UserProductResponse(BaseModel):
    """사용자 상품 가입 응답 모델"""
    id: int
    product: FinancialProductResponse
    account: BankAccountResponse
    amount: int
    start_date: datetime
    end_date: datetime
    status: str
    total_interest: int
    last_interest_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime


class CreditScoreResponse(BaseModel):
    """신용점수 응답 모델"""
    id: int
    score: int
    grade: str
    last_updated: datetime
    credit_limit: int
    used_credit: int
    created_at: datetime
    updated_at: datetime


class FinancialSummaryResponse(BaseModel):
    """금융 요약 정보 응답 모델"""
    total_balance: int
    total_assets: int
    total_liabilities: int
    net_worth: int
    credit_score: CreditScoreResponse
    accounts: List[BankAccountResponse]
    recent_transactions: List[TransactionResponse]
    products: List[UserProductResponse]
