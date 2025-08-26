# Backend

## 실행
```bash
python3.11 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 환경 변수 설정
백엔드 실행 전 환경 변수를 설정하세요:

```bash
# .env 파일 생성
export BACKEND_PORT=8000
export JWT_SECRET=your-secret-key-here
export DATABASE_URL=sqlite:///./hackathon.db
export SSAFY_LOGIN_URL=https://finopenapi.ssafy.io/ssafy/api/v1/member/
export SSAFY_API_KEY=1924d3d047eb472ab5a81df01977485c
export OPENDATA_API_KEY=your-opendata-api-key-here
export CRAWLING_ENABLED=true
export CRAWLING_DELAY=1.0
```

## API 엔드포인트

### 기본 API
- GET /api/health -> {status: "ok"}
- POST /api/xp/add {userId, delta} -> {level, xp, xpToNext, leveled_up}
- GET /api/xp/me -> {level, xp, xpToNext}

### 인증 API (새로운 자체 회원 시스템)
- POST /api/auth/check-email -> 이메일 중복 확인 (SSAFY API 연동)
- POST /api/auth/signup -> 회원가입 (이메일 + 비밀번호)
- POST /api/auth/login -> 로그인 (이메일 + 비밀번호)
- GET /api/auth/me -> 현재 사용자 정보 조회
- PUT /api/auth/profile -> 프로필 업데이트
- POST /api/auth/change-password -> 비밀번호 변경
- DELETE /api/auth/account -> 회원 탈퇴

### 기존 SSAFY 인증 API (호환성 유지)
- POST /api/auth/login -> SSAFY API 프록시 로그인
- POST /api/auth/signup -> SSAFY API 프록시 회원가입

### 대학교 API
- GET /api/universities -> 대학교 목록 조회
- GET /api/universities/{university_name}/departments -> 특정 대학교의 학과 목록
- POST /api/courses/search -> 대학교 + 학과별 강좌 검색 (크롤링)
- GET /api/courses/popular -> 인기 강좌 목록
- GET /api/courses/time-conflicts -> 강좌 시간 충돌 확인
- GET /api/universities/{university_name}/stats -> 대학교 통계 정보

## 주요 기능

### 1. 자체 회원 관리 시스템
- **이메일 중복 확인**: SSAFY API와 연동하여 실시간 이메일 중복 검사
- **안전한 회원가입**: 이메일 + 비밀번호 기반 회원가입
- **JWT 기반 인증**: 보안이 강화된 토큰 기반 로그인 시스템
- **프로필 관리**: 대학교, 학과, 학년 등 개인정보 관리
- **비밀번호 보안**: SHA256 해시 기반 비밀번호 저장

### 2. 대학교 정보 조회
공공데이터포털 API를 활용하여 전국 대학교 목록과 기본 정보를 제공합니다.

### 3. 강좌 크롤링
각 대학교의 수강신청 시스템에서 강좌 정보를 크롤링하여 실시간 강의 시간표를 제공합니다.
- 강좌명, 교수명, 강의시간, 강의실 정보
- 수강정원 및 현재 신청인원
- 강좌 유형 (전공필수/선택, 교양 등)

### 4. 시간표 관리
- 강좌 시간 충돌 검사
- 요일별 시간표 파싱
- 시간대별 강의실 정보

### 5. 통계 및 분석
- 대학교별 인기 강좌 분석
- 수강신청률 통계
- 학과별 강좌 개설 현황

## 데이터 모델

### User (사용자)
- 이메일, 해시된 비밀번호
- SSAFY API 연동 정보 (userId, userKey, userName 등)
- 프로필 정보 (표시명, 프로필 이미지)
- 학습 정보 (대학교, 학과, 학년)
- 계정 상태 (활성화, 이메일 인증 여부)

### University (대학교)
- 대학교명, 영문명, 유형 (국립/공립/사립)
- 소재지, 연락처, 홈페이지
- 크롤링 대상 페이지 URL

### Department (학과)
- 학과명, 단과대학, 학위유형
- 대학교와의 연관관계

### Course (강좌)
- 강좌코드, 강좌명, 담당교수
- 강의시간, 강의실, 학점
- 수강정원, 신청인원

### CourseSchedule (시간표)
- 요일별 시간 정보
- 강의실 및 건물 정보

## 크롤링 설정
`CRAWLING_ENABLED=true`로 설정하면 실시간 크롤링이 활성화됩니다.
`CRAWLING_DELAY`로 크롤링 간격을 조절할 수 있습니다.

## 테스트 방법

### 인증 시스템 테스트
```bash
python test_auth_v2.py
```

### 대학교 API 테스트
```bash
python test_university_api.py
```

## 개발 참고사항
- **FastAPI 자동 문서**: http://localhost:8000/docs
- **SQLite 데이터베이스**: `hackathon.db` 파일로 자동 생성
- **JWT 토큰**: 24시간 만료, Authorization 헤더에 Bearer 토큰 사용
- **비동기 처리**: aiohttp를 통한 비동기 HTTP 요청
- **크롤링**: BeautifulSoup4와 Selenium 지원
- **ORM**: SQLModel을 사용한 타입 안전 데이터베이스 ORM

## 보안 고려사항
- 비밀번호는 SHA256으로 해시화하여 저장
- JWT 토큰에는 민감한 정보 포함하지 않음
- SSAFY API 키는 환경변수로 관리
- CORS 설정으로 허용된 도메인만 접근 가능
