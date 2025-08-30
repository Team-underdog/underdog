# Campus Credo 앱 기능 구현 가이드 🎓

## 🚀 **구현 가능한 핵심 기능들**

### **1. 학생 인증 시스템** ✅
```typescript
// 프론트엔드에서 SSAFY 학생 인증
const verifyStudent = async (email: string) => {
  const response = await fetch('/api/ssafy/verify-student', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  return response.json();
};
```

**기능:**
- SSAFY 학생 이메일 검증
- 실제 SSAFY API 연동
- 학생 정보 자동 입력

### **2. 금융 크로니클 시스템** 📊
```typescript
// 사용자 거래내역을 크로니클에 표시
const getTransactionHistory = async (userKey: string, days: number = 30) => {
  const response = await fetch(`/api/ssafy/user/recent-transactions?user_key=${userKey}&days=${days}`);
  return response.json();
};
```

**기능:**
- 실제 계좌 거래내역 자동 수집
- 일일/주간/월간 거래 요약
- 지출 패턴 분석
- 용돈 관리 추천

### **3. 금융 퀘스트 시스템** 🎮
```typescript
// 예적금 상품 정보로 퀘스트 생성
const getFinancialProducts = async () => {
  const [deposits, savings] = await Promise.all([
    fetch('/api/ssafy/deposit/products').then(r => r.json()),
    fetch('/api/ssafy/savings/products').then(r => r.json())
  ]);
  
  return {
    deposits: deposits.data,
    savings: savings.data
  };
};
```

**퀘스트 예시:**
- **"첫 적금 도전"**: 10만원 적금 가입하기
- **"이자 수익왕"**: 3개월 이상 예금 가입하기
- **"절약 마스터"**: 한 달 지출 30만원 이하로 줄이기
- **"용돈 관리왕"**: 월말까지 용돈 10만원 이상 남기기

### **4. 개인 신용 관리** 🏆
```typescript
// 개인 신용등급 및 금융 현황
const getFinancialSummary = async (userKey: string) => {
  const response = await fetch(`/api/ssafy/user/financial-summary?user_key=${userKey}`);
  return response.json();
};
```

**기능:**
- 실제 신용등급 조회
- 금융 상품 가입 현황
- 월별 수입/지출 분석
- 개인화된 금융 조언

### **5. 보안 강화 시스템** 🔐
```typescript
// 계좌 소유권 확인 (1원 송금 인증)
const verifyAccountOwnership = async (accountNo: string, userKey: string) => {
  const response = await fetch('/api/ssafy/account-auth/open', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ account_no: accountNo, auth_text: 'CAMPUS_CREDO', user_key: userKey })
  });
  return response.json();
};
```

**기능:**
- 1원 송금을 통한 계좌 인증
- 보안 강화된 금융 서비스
- 사용자 신원 확인

## 🏗️ **구현 단계별 가이드**

### **Phase 1: 기본 인증 및 계좌 연동**
1. **SSAFY 학생 인증** 구현
2. **계좌 정보 조회** 기능
3. **기본 잔액 표시**

### **Phase 2: 거래내역 및 크로니클**
1. **거래내역 자동 수집** 시스템
2. **크로니클 UI** 구현
3. **거래 카테고리** 분류

### **Phase 3: 금융 퀘스트 시스템**
1. **퀘스트 생성** 엔진
2. **진행도 추적** 시스템
3. **보상 시스템** 구현

### **Phase 4: 고급 기능**
1. **AI 기반 금융 조언**
2. **목표 설정 및 달성** 추적
3. **친구와의 금융 비교** 기능

## 💡 **구현 아이디어**

### **1. 스마트 알림 시스템**
```typescript
// 지출 패턴 기반 알림
const smartNotifications = {
  highSpending: "오늘 지출이 평소보다 30% 많습니다!",
  lowBalance: "계좌 잔액이 10만원 이하입니다.",
  savingGoal: "이번 주 절약 목표 달성까지 5만원 남았습니다!",
  interestEarning: "적금 이자가 1만원 적립되었습니다!"
};
```

### **2. AI 금융 어시스턴트**
```typescript
// Gemini AI를 활용한 개인화 조언
const getFinancialAdvice = async (userData: any) => {
  const prompt = `사용자의 금융 현황을 분석하여 개인화된 조언을 제공해주세요:
  - 현재 잔액: ${userData.balance}원
  - 월 수입: ${userData.monthlyIncome}원
  - 월 지출: ${userData.monthlyExpense}원
  - 가입 상품: ${userData.products.join(', ')}`;
  
  return await geminiService.generateAdvice(prompt);
};
```

### **3. 게이미피케이션 요소**
```typescript
// 금융 활동 기반 레벨업 시스템
const calculateFinancialLevel = (userData: any) => {
  const score = 
    (userData.savingsBalance / 1000000) * 30 +      // 적금/예금 30점
    (userData.creditScore / 1000) * 20 +            // 신용점수 20점
    (userData.consistentSaving ? 25 : 0) +          // 꾸준한 저축 25점
    (userData.diversifiedProducts ? 25 : 0);        // 상품 다양화 25점
  
  if (score >= 90) return { level: 5, title: "🏆 금융 마스터" };
  if (score >= 70) return { level: 4, title: "🥈 금융 전문가" };
  if (score >= 50) return { level: 3, title: "🥉 금융 중급자" };
  if (score >= 30) return { level: 2, title: "📚 금융 초급자" };
  return { level: 1, title: "🌱 금융 새내기" };
};
```

## 🔧 **기술적 구현 포인트**

### **1. 실시간 데이터 동기화**
```typescript
// WebSocket 또는 Server-Sent Events로 실시간 업데이트
const setupRealTimeUpdates = (userKey: string) => {
  const eventSource = new EventSource(`/api/ssafy/realtime/${userKey}`);
  
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    updateUI(data); // 실시간 UI 업데이트
  };
};
```

### **2. 오프라인 지원**
```typescript
// Service Worker로 오프라인 거래내역 조회
const setupOfflineSupport = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }
};
```

### **3. 데이터 캐싱 전략**
```typescript
// 거래내역 캐싱으로 성능 최적화
const cacheTransactionData = async (userKey: string) => {
  const cache = await caches.open('financial-data');
  const response = await fetch(`/api/ssafy/user/recent-transactions?user_key=${userKey}`);
  await cache.put(`/transactions/${userKey}`, response);
};
```

## 📱 **UI/UX 구현 가이드**

### **1. 대시보드 디자인**
- **상단**: 잔액, 신용등급, 레벨
- **중앙**: 최근 거래내역, 퀘스트 진행도
- **하단**: 빠른 액션 (입금, 출금, 이체)

### **2. 크로니클 화면**
- **타임라인**: 날짜별 거래내역
- **카테고리별**: 지출 분석 차트
- **트렌드**: 월별 수입/지출 변화

### **3. 퀘스트 화면**
- **진행중**: 현재 도전 중인 퀘스트
- **완료**: 달성한 퀘스트와 보상
- **새로운**: 도전 가능한 퀘스트

## 🚀 **빠른 시작 가이드**

### **1. 기본 설정**
```bash
# 백엔드 서버 실행
cd hackathon/backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 상품 데이터 등록
python create_ssafy_products.py

# 테스트 계좌 생성
python test_user_accounts.py

# 거래내역 시뮬레이션
python simulate_transactions.py
```

### **2. 프론트엔드 연동**
```typescript
// API 기본 설정
const API_BASE = 'http://localhost:8000/api/ssafy';

// 학생 인증
const verifyStudent = async (email: string) => {
  const response = await fetch(`${API_BASE}/verify-student?email=${email}`);
  return response.json();
};

// 거래내역 조회
const getTransactions = async (userKey: string) => {
  const response = await fetch(`${API_BASE}/user/recent-transactions?user_key=${userKey}`);
  return response.json();
};
```

## 🎯 **다음 단계**

이제 다음 중 어떤 기능을 먼저 구현하고 싶으신지 말씀해주세요:

1. **학생 인증 시스템** - SSAFY 학생 인증 및 계정 생성
2. **크로니클 시스템** - 거래내역을 타임라인으로 표시
3. **퀘스트 시스템** - 금융 목표 달성 게임
4. **AI 금융 어시스턴트** - Gemini AI 기반 개인화 조언
5. **실시간 알림** - 지출 패턴 기반 스마트 알림

어떤 기능부터 시작하고 싶으신가요? 🚀
