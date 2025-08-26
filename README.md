# underdog
신한 해커톤 언더독팀

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

## API 문서
- **백엔드 API 문서**: http://localhost:8000/docs (Swagger UI)
- **ReDoc 문서**: http://localhost:8000/redoc
- **헬스체크**: http://localhost:8000/api/health

## 트러블슈팅 가이드

### 1. Expo 터널 모드 실행 문제

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

## 성공 로그 예시
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

## 개발 환경
- **백엔드**: Python 3.11, FastAPI, SQLModel, SQLite
- **프론트엔드**: React Native, Expo SDK 53, TypeScript
- **인증**: JWT 토큰 기반 (24시간 만료)
- **데이터베이스**: SQLite (hackathon.db)
- **API**: RESTful API with OpenAPI 문서 자동생성
