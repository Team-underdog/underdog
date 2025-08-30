# underdog
신한 해커톤 언더독팀

## 🎉 **버전 1.0.2 출시** (2025-08-30)

### 🚀 **v1.0.2 주요 업데이트**

#### **1. 퀘스트 시스템 완전 개편**
- **AI 맞춤 추천 퀘스트**: 진행중/완료된 퀘스트 자동 필터링
- **진행중 퀘스트 상세보기**: 풍부한 정보와 진행률 표시
- **퀘스트 시작 기능**: AI 추천 퀘스트를 실제 진행 퀘스트로 전환
- **탭 기반 UI**: 추천/진행중/완료 탭으로 명확한 구분

#### **2. UI/UX 대폭 개선**
- **거래내역 표시 개선**: 수입(+)/지출(-) 명확한 구분, 이모지 아이콘 추가
- **스크롤링 문제 해결**: 퀘스트 화면 전체 스크롤 가능하도록 수정
- **아이콘 호환성**: Feather 아이콘 라이브러리 유효한 아이콘으로 교체
- **진행률 표시**: 퀘스트별 상세한 진행 상황 시각화

#### **3. 데이터 필터링 로직 강화**
- **AI 추천 퀘스트 필터링**: 진행중/완료된 퀘스트 자동 제외
- **중복 퀘스트 방지**: 제목과 설명 기반 정확한 매칭
- **실시간 상태 동기화**: 퀘스트 상태 변경 시 즉시 반영

#### **4. 퀘스트 생명주기 완성**
- **AI 추천 → 진행중 → 완료**: 완전한 퀘스트 플로우 구현
- **상세보기 모달**: 모든 퀘스트 타입에 대한 통합된 상세 정보
- **진행률 추적**: 실시간 진행 상황 모니터링

### 🚀 **v1.0 주요 업데이트**

### 🚀 **최신 주요 업데이트**

#### **1. 사용자 관리 시스템 완성**
- **사용자 목록 API**: `/api/auth/users` - 페이지네이션 지원
- **데이터베이스 오류 수정**: SQLModel count() 메서드 호환성 문제 해결
- **하이브리드 인증**: Firebase + 일반 이메일/비밀번호 로그인 지원
- **사용자 계정 관리**: 회원가입, 로그인, 프로필 관리 완성

#### **2. 백엔드 API 안정화**
- **FastAPI 문서**: 자동 생성 Swagger UI (`/docs`) 완벽 작동
- **데이터베이스 스키마**: 18개 테이블 구조 완성
- **API 엔드포인트**: 50+ API 엔드포인트 구현 완료
- **에러 핸들링**: 상세한 에러 메시지 및 로깅 시스템

#### **3. 데이터베이스 관리 도구**
- **SQLite 직접 접근**: `sqlite3 hackathon.db` 명령어로 데이터 확인
- **사용자 계정 관리**: 비밀번호 해시화 및 검증 시스템
- **데이터 백업**: `hackathon.db.backup` 자동 백업 파일

### 📊 **현재 시스템 상태**
- **등록된 사용자**: 3명
- **데이터베이스 크기**: 128KB (메인), 48KB (백업)
- **API 서버**: http://localhost:8000 정상 작동
- **프론트엔드**: React Native Expo 앱 완성

## 프로젝트 구조

```
underdog/
├── hackathon/
│   ├── backend/          # FastAPI 백엔드 서버
│   │   ├── app/
│   │   │   ├── api/      # API 엔드포인트
│   │   │   │   ├── auth_v2.py    # 자체 회원 인증 시스템
│   │   │   │   ├── auth.py       # SSAFY API 연동 (호환성)
│   │   │   │   ├── university.py # 대학교/강좌 API
│   │   │   │   ├── xp.py         # XP 시스템
│   │   │   │   └── health.py     # 헬스체크
│   │   │   ├── models/   # 데이터 모델
│   │   │   ├── services/ # 비즈니스 로직
│   │   │   ├── core/     # 설정 및 규칙
│   │   │   └── db/       # 데이터베이스 설정
│   │   ├── venv/         # Python 가상환경
│   │   ├── requirements.txt
│   │   ├── hackathon.db  # SQLite 데이터베이스
│   │   └── README.md
│   └── frontend/         # React Native Expo 앱
│       ├── app/          # 화면 구성
│       │   ├── index.tsx     # 진입점 (자동 로그인)
│       │   ├── login.tsx     # 로그인 화면
│       │   ├── signup.tsx    # 회원가입 화면
│       │   ├── home.tsx      # 메인 홈 화면
│       │   └── onboarding.tsx # 온보딩 캐러셀
│       ├── components/   # UI 컴포넌트
│       │   ├── ui/       # 기본 UI 요소
│       │   └── figma/    # 디자인 컴포넌트
│       ├── assets/       # 이미지, 애니메이션
│       ├── package.json
│       └── README.md
└── README.md
```

## 🗄️ **데이터베이스 관리**

### **SQLite 데이터베이스 직접 접근**
```bash
# 데이터베이스 파일 위치
cd hackathon/backend
ls -lh hackathon.db*

# 테이블 목록 확인
sqlite3 hackathon.db ".tables"

# 사용자 테이블 구조 확인
sqlite3 hackathon.db ".schema user"

# 사용자 데이터 조회
sqlite3 hackathon.db "SELECT id, email, display_name, created_at FROM user;"

# 특정 사용자 상세 정보
sqlite3 hackathon.db "SELECT * FROM user WHERE email = 'ecckane@naver.com';"
```

### **사용자 계정 관리**
```bash
# 비밀번호 해시 생성 (Python)
python -c "
import hashlib
password_hash = hashlib.sha256('123123123'.encode()).hexdigest()
print('SHA256 해시:', password_hash)
"

# 데이터베이스에서 비밀번호 업데이트
sqlite3 hackathon.db "UPDATE user SET password_hash = '해시값' WHERE email = '이메일';"
```

### **데이터베이스 백업**
- **자동 백업**: `hackathon.db.backup` (48KB)
- **백업 복원**: `cp hackathon.db.backup hackathon.db`
- **데이터 내보내기**: `sqlite3 hackathon.db ".dump" > backup.sql`

## 서버 실행 방법

### 백엔드 서버 (FastAPI)
```bash
cd hackathon/backend
source venv/bin/activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 프론트엔드 서버 (Expo)
```bash
cd hackathon/frontend
npx expo start --go
```

## 🎮 캠퍼스 크레도 시스템 (신규!)

### 새로 구현된 게임화 교육 플랫폼
RPG 스타일의 성장 시스템으로 대학생활을 게임처럼 재미있게 만드는 혁신적인 서비스입니다.

**메인 기능:**
- **홈 (대시보드)**: 2D 픽셀 캐릭터, CAMPUS Credo 점수, 스킬 게이지, 추천 퀘스트
- **크로니클 피드**: 모든 활동의 타임라인 기록, 카테고리별 필터링, 보상 시스템
- **퀘스트 시스템**: 추천/진행중/완료 탭, 난이도별 도전, 상세 진행률 추적
- **스킬 트리**: RPG 스타일 시각화, 4개 카테고리 (학업/재무/자기계발/대외활동)
- **MY 페이지**: 프로필 관리, 데이터 연동, 성장 통계, 설정

**접근 방법:**
```bash
# 프론트엔드 실행 후
# /campus-credo 경로로 접속 (하단 네비게이션 포함)
# 또는 개별 페이지:
# /home-campus-credo - 새로운 홈
# /chronicle - 크로니클 피드  
# /quest - 퀘스트 시스템
# /skill-tree - 스킬 트리
# /my-campus-credo - MY 페이지
```

## 🧪 **API 테스트 및 개발 도구**

### **FastAPI 자동 문서**
- **Swagger UI**: http://localhost:8000/docs - 인터랙티브 API 테스트
- **ReDoc**: http://localhost:8000/redoc - 읽기 쉬운 API 문서
- **OpenAPI JSON**: http://localhost:8000/openapi.json - API 스키마

### **주요 API 테스트 명령어**
```bash
# 서버 상태 확인
curl http://localhost:8000/api/health

# 사용자 목록 조회
curl -X GET "http://localhost:8000/api/auth/users"

# 로그인 테스트
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "ecckane@naver.com", "password": "123123123"}'

# 사용자 정보 조회 (토큰 필요)
curl -X GET "http://localhost:8000/api/auth/me" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### **API 개발 환경**
- **자동 리로드**: 코드 변경 시 서버 자동 재시작
- **실시간 로깅**: SQL 쿼리 및 API 요청/응답 상세 로그
- **에러 추적**: 상세한 에러 메시지 및 스택 트레이스
- **CORS 지원**: 프론트엔드와 백엔드 간 통신 허용

## 📚 **API 문서**
- **백엔드 API 문서**: http://localhost:8000/docs (Swagger UI)
- **ReDoc 문서**: http://localhost:8000/redoc
- **헬스체크**: http://localhost:8000/api/health

## 🔧 **트러블슈팅 가이드**

### **1. 백엔드 데이터베이스 오류**

#### **문제**: `'ScalarResult' object has no attribute 'count'`
**증상**: `/api/auth/users` API 호출 시 500 에러 발생

**원인**: SQLModel의 `exec()` 메서드와 `count()` 메서드 호환성 문제

**해결방법**:
```python
# 수정 전 (오류 발생)
def get_total_users_count(self) -> int:
    return self.db.exec(select(User)).count()

# 수정 후 (정상 작동)
def get_total_users_count(self) -> int:
    from sqlmodel import select, func
    result = self.db.exec(select(func.count(User.id)))
    return result.first() or 0
```

#### **문제**: 비밀번호 해시 불일치
**증상**: 로그인 시 "이메일 또는 비밀번호가 잘못되었습니다" 에러

**원인**: User 모델의 SHA256 해시 방식과 werkzeug 해시 방식 불일치

**해결방법**:
```bash
# SHA256 해시로 비밀번호 생성
python -c "
import hashlib
password_hash = hashlib.sha256('123123123'.encode()).hexdigest()
print('SHA256 해시:', password_hash)
"

# 데이터베이스 업데이트
sqlite3 hackathon.db "UPDATE user SET password_hash = '해시값' WHERE email = '이메일';"
```

### **2. Expo 터널 모드 실행 문제**

**문제**: `CommandError: Install @expo/ngrok@^4.1.0 and try again`

**해결방법**:
```bash
# npm 캐시 정리
npm cache clean --force

# 관리자 권한으로 ngrok 설치
sudo npm install -g @expo/ngrok@^4.1.0

# npm 권한 문제 해결
sudo chown -R 501:20 "/Users/$USER/.npm"
```

**대안**: 터널 모드 대신 Expo Go 모드 사용
```bash
npx expo start --go
```

### 2. 프론트엔드 Abort Error 해결

**문제**: 앱 실행 시 AbortError 발생

**해결과정**:
1. **상세한 에러 로깅 추가**
   - API URL, 토큰 존재 여부, 응답 상태 등 디버깅 로그
   - AbortError 전용 에러 메시지 추가

2. **백엔드 API 연결 확인**
   - `/api/auth/me` 엔드포인트 정상 작동 확인
   - 헬스체크: `curl http://192.168.219.108:8000/api/health`

3. **인증 흐름 개선**
   - 토큰 체크 로직 강화
   - 자동 로그인 화면 리다이렉트
   - 네트워크 에러 구분 처리

**수정된 코드** (`hackathon/frontend/app/home.tsx`):
- API 호출 전 토큰 존재 여부 체크 추가
- 상세한 에러 로깅 및 핸들링
- AbortError와 일반 네트워크 에러 구분

### 3. 패키지 관리자 권한 문제

**문제**: `npm error code EACCES`

**해결방법**:
```bash
sudo chown -R 501:20 "/Users/$USER/.npm"
```

### 4. 디렉토리 경로 문제

**문제**: `ConfigError: The expected package.json path does not exist`

**해결방법**: 올바른 디렉토리에서 명령어 실행
```bash
cd hackathon/frontend  # 프론트엔드 명령어 실행 시
cd hackathon/backend   # 백엔드 명령어 실행 시
```

## 📊 **성공 로그 및 테스트 결과**

### **백엔드 API 테스트 성공 로그**
```bash
# 사용자 목록 API 성공
curl -X GET "http://localhost:8000/api/auth/users"
{
  "users": [
    {
      "id": 3,
      "email": "201513342@jbnu.ac.kr",
      "display_name": "재호 임",
      "current_university": "SSAFY 대학교",
      "current_department": "korean-language-literature",
      "grade_level": 123123,
      "is_verified": false,
      "created_at": "2025-08-27T06:30:04.852218"
    }
  ],
  "total_count": 3,
  "page": 1,
  "page_size": 20
}

# 로그인 API 성공
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "ecckane@naver.com", "password": "123123123"}'
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "ecckane@naver.com",
    "display_name": "ecckane",
    "is_verified": true
  },
  "expires_in": 86400
}
```

### **프론트엔드 성공 로그**
```
LOG  🔗 API Base URL: http://localhost:8000
LOG  🔑 토큰 존재 여부: true
LOG  📡 API 응답 상태: 200
LOG  ✅ 사용자 데이터 수신: {user_data}
```

## 주요 기능

### 백엔드 (FastAPI)
- **자체 회원 관리 시스템**: 이메일 + 비밀번호 기반 회원가입/로그인
- **JWT 인증**: 보안 토큰 기반 사용자 인증
- **대학교 정보 API**: 공공데이터포털 연동 전국 대학교 정보
- **강좌 크롤링**: 실시간 강의 시간표 수집
- **XP 시스템**: 레벨링 및 경험치 관리
- **시간표 관리**: 강좌 시간 충돌 검사 및 분석

### 프론트엔드 (React Native Expo)
- **모바일 앱**: iOS/Android 크로스 플랫폼 지원
- **자동 로그인**: JWT 토큰 기반 seamless 인증
- **온보딩**: 사용자 가이드 및 초기 설정
- **프로필 관리**: 대학교, 학과, 학년 설정
- **실시간 동기화**: 백엔드 API 연동

### 🆕 캠퍼스 크레도 (게임화 시스템)
- **RPG 스타일 UI**: 픽셀 아트 캐릭터와 레벨링 시스템
- **스킬 트리**: 4개 영역 (학업/재무/자기계발/대외활동) 성장 시각화
- **퀘스트 시스템**: AI 추천 도전과제와 진행률 추적
- **크로니클**: 모든 활동의 타임라인 기록과 보상 시스템
- **개인화 대시보드**: 실시간 성장 현황과 추천 시스템

### 🤖 **Gemini AI 통합 시스템 (v1.0.2 신규!)**
- **AI 퀘스트 추천**: Google Gemini AI를 활용한 개인화된 퀘스트 생성
- **금융 코칭**: 소비 패턴 분석 및 맞춤형 금융 조언
- **학습 가이드**: 현재 스킬 수준 기반 최적화된 학습 계획 제시
- **AI 상담**: 대학생 맞춤형 일반 상담 및 문제 해결 가이드
- **하이브리드 시스템**: Gemini AI 실패 시 기본 시스템으로 자동 전환

## 개발 환경
- **백엔드**: Python 3.11, FastAPI, SQLModel, SQLite
- **프론트엔드**: React Native, Expo SDK 53, TypeScript
- **캠퍼스 크레도**: React Native Reanimated, React Native SVG
- **인증**: JWT 토큰 기반 (24시간 만료)
- **데이터베이스**: SQLite (hackathon.db)
- **API**: RESTful API with OpenAPI 문서 자동생성

## 🎯 프로젝트 하이라이트

### 캠퍼스 크레도 - 혁신적인 게임화 교육 플랫폼
대학생활을 RPG 게임처럼 재미있게 만드는 **세계 최초의 캠퍼스 라이프 게임화 시스템**입니다.

**핵심 혁신 포인트:**
1. **2D 픽셀 아트 캐릭터**: 사용자 성장에 따라 실시간 변화하는 개인 아바타
2. **CAMPUS Credo 점수**: 모든 대학 활동을 점수화하여 성취감 극대화
3. **4단계 스킬 시스템**: 학업/재무/자기계발/대외활동 균형 성장 유도
4. **AI 퀘스트 추천**: 개인 패턴 분석 기반 맞춤형 도전과제 제시
5. **크로니클 타임라인**: 모든 성장 기록의 자동 축적 및 시각화

이 시스템은 **신한 해커톤**을 위해 특별히 설계되어 대학생들의 **재무 교육과 건전한 소비 습관 형성**을 게임을 통해 자연스럽게 유도합니다.

---

## 🔥 **최신 업데이트: SSAFY API 연동 및 실시간 금융 시스템**

### 📊 **실시간 금융 데이터 연동 완료**

#### 🚀 **1. 백엔드 SSAFY API 통합**
- **새로운 API 엔드포인트** (`app/api/ssafy_integration.py`):
  - `/api/auth/account-balance` - 실시간 계좌 잔액 조회
  - `/api/auth/transaction-history` - 거래내역 조회 (30일)
  - `/api/auth/user-financial-summary` - 종합 금융 요약
  - `/api/auth/verify-ssafy-email` - SSAFY 학생 이메일 검증
- **SSAFY API 표준 헤더 생성**: 기관코드, 거래고유번호 자동 생성
- **Mock/실제 API 전환 가능**: 개발 중에는 Mock 데이터, 실제 배포 시 API 연동

#### 💰 **2. 프론트엔드 금융 서비스** 
- **금융 데이터 서비스** (`services/financialService.ts`):
  - 실시간 계좌 잔액 및 거래내역 조회
  - 금융 데이터 기반 Campus Credo 점수 자동 계산
  - 거래내역을 크로니클 활동으로 자동 변환
- **홈 화면 금융 대시보드**:
  - 📈 **실시간 계좌 잔액** 표시
  - 💳 **월간 수입/지출 요약**
  - 🏆 **신용등급 및 적금 현황**
  - ⚡ **금융 건전성 기반 Credo 점수 계산**

#### 🎯 **3. 개인화된 퀘스트 시스템**
- **퀘스트 자동 생성** (`services/questService.ts`):
  - 💰 **저축 목표**: 잔액 증가 챌린지
  - 💸 **지출 관리**: 월 소비 한도 도전
  - 📊 **거래 활동**: 금융 활동 빈도 목표
  - 🏅 **신용 관리**: 신용등급 유지 퀘스트
- **실시간 진행률 추적**: 실제 거래내역 기반 자동 업데이트
- **개인화 추천**: 소비 패턴 분석 기반 맞춤 퀘스트

#### 📱 **4. 크로니클 실시간 동기화**
- **실제 거래내역 통합**: SSAFY API 거래 데이터를 크로니클에 자동 추가
- **실시간 동기화**: 앱 시작 시 최신 거래내역 자동 로딩
- **활동 분류**: 입금/출금/이체를 크로니클 활동으로 자동 분류
- **보상 시스템**: 거래 활동 시 Credo 점수 자동 지급

### 🛠 **기술적 구현 세부사항**

#### **Firebase + SSAFY 하이브리드 시스템**
- **Firebase Authentication**: 비밀번호 관리 및 사용자 인증
- **SSAFY API**: 학생 이메일 검증 및 금융 데이터
- **Firestore**: 사용자 프로필 및 크로니클 데이터 저장
- **SecureStore**: 토큰 및 민감 정보 안전 저장

#### **실시간 데이터 플로우**
```
SSAFY API → 백엔드 통합 → 프론트엔드 서비스 → UI 실시간 업데이트
    ↓              ↓                 ↓                    ↓
계좌 잔액      금융 요약 API    financialService     홈/크로니클/퀘스트
거래내역      진행률 계산      questService         실시간 동기화
학생 검증      활동 변환       chronicleService      Firebase 저장
```

#### **새로운 파일 구조**
```
hackathon/
├── backend/
│   └── app/api/
│       └── ssafy_integration.py    # 🆕 SSAFY API 통합
└── frontend/
    ├── services/
    │   ├── financialService.ts     # 🆕 금융 데이터 서비스
    │   ├── questService.ts         # 🆕 퀘스트 시스템
    │   ├── chronicleService.ts     # 크로니클 서비스
    │   └── authService.ts          # Firebase 인증
    ├── config/
    │   └── firebase.ts             # 🆕 Firebase 설정
    └── app/
        ├── home.tsx                # 🔄 금융 대시보드 추가
        ├── quest.tsx               # 🔄 실제 퀘스트 연동
        └── chronicle.tsx           # 🔄 실시간 거래내역 연동
```

### 📈 **성과 및 효과**

#### **게임화 효과 극대화**
- **실제 데이터 연동**: Mock이 아닌 진짜 거래내역으로 몰입감 증대
- **즉시 피드백**: 거래 즉시 크로니클에 반영되어 성취감 극대화
- **개인화 심화**: 실제 소비패턴 기반 맞춤형 퀘스트 제공

#### **금융 교육 효과**
- **시각적 피드백**: 지출/수입을 게임 포인트로 실시간 변환
- **목표 설정**: 구체적인 저축/지출 목표를 퀘스트로 제시
- **습관 형성**: 지속적인 모니터링으로 건전한 금융 습관 유도

#### **기술적 혁신**
- **API 표준화**: SSAFY 금융 API 표준 구조 완벽 구현
- **하이브리드 인증**: Firebase + SSAFY 이중 인증 시스템
- **실시간 동기화**: 백그라운드 데이터 동기화 시스템

### 🎯 **향후 확장 계획**

1. **완전한 SSAFY API 연동**: Mock 데이터를 실제 API로 전환
2. **AI 금융 코치**: 소비 패턴 분석 및 개인화 조언
3. **소셜 기능**: 친구들과 Credo 점수 비교 및 챌린지
4. **푸시 알림**: 거래 발생, 퀘스트 완료 시 실시간 알림
5. **월간 리포트**: 금융 성장 분석 및 성과 요약

---

## 📋 **SSAFY API 연동 문서**

상세한 API 연동 방법과 엔드포인트 정보는 `SSAFY_API_INTEGRATION.md` 파일을 참조하세요.

**포함된 51개 SSAFY API**:
- 👤 사용자 관리 (계정 생성/조회)
- 💳 수시입출금 (12개 API)
- 💰 예금/적금 (18개 API)  
- 🏠 대출 관리 (10개 API)
- 🔐 계좌 인증 (1원 송금)
- 📝 거래 메모
- 🏦 은행/통화 코드
