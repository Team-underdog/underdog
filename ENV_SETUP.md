# 환경 변수 설정 가이드

이 가이드는 프로젝트에서 사용하는 환경 변수를 설정하는 방법을 안내합니다.

## 📁 파일 구조

```
underdog/
├── .env                           # 메인 프로젝트 환경변수 (옵션)
├── .gitignore                     # Git 무시 파일 목록
├── hackathon/
│   ├── backend/
│   │   ├── .env                   # 백엔드 환경변수 ⭐ 중요!
│   │   ├── .env.example           # 백엔드 템플릿 파일
│   │   └── .gitignore            # 백엔드 Git 무시 파일
│   └── frontend/
│       ├── .env                   # 프론트엔드 환경변수 ⭐ 중요!
│       ├── .env.example           # 프론트엔드 템플릿 파일
│       └── .gitignore            # 프론트엔드 Git 무시 파일
└── ENV_SETUP.md                  # 이 파일
```

## 🚀 빠른 설정

### 1단계: 백엔드 환경변수 설정

```bash
# 백엔드 디렉토리로 이동
cd hackathon/backend

# 템플릿에서 실제 .env 파일 생성 (이미 생성됨)
cp .env.example .env

# .env 파일 편집
nano .env  # 또는 code .env
```

### 2단계: 프론트엔드 환경변수 설정

```bash
# 프론트엔드 디렉토리로 이동
cd hackathon/frontend

# 템플릿에서 실제 .env 파일 생성 (이미 생성됨)
cp .env.example .env

# .env 파일 편집
nano .env  # 또는 code .env
```

## 🔑 중요한 API 키들

### 백엔드에서 설정해야 할 키들

#### 1. JWT 보안 키 (필수)
```bash
# 랜덤한 강력한 키로 변경하세요
JWT_SECRET=super-secret-key-please-change-this-in-production
```

#### 2. SSAFY API 키
```bash
SSAFY_API_KEY=여기에_실제_SSAFY_API_키_입력
```

#### 3. 공공데이터포털 API 키
```bash
OPENDATA_API_KEY=여기에_실제_공공데이터포털_API_키_입력
```

### 프론트엔드에서 설정해야 할 키들

#### 1. API 서버 URL (개발 환경)
```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000
```

#### 2. 외부 서비스 키들 (향후 사용)
```bash
# Google API (지도, 인증 등)
EXPO_PUBLIC_GOOGLE_API_KEY=여기에_구글_API_키_입력

# Kakao API (지도, 로그인 등)
EXPO_PUBLIC_KAKAO_API_KEY=여기에_카카오_API_키_입력
```

## 📝 환경 변수 사용법

### 백엔드에서 환경 변수 읽기

```python
import os
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

# 환경 변수 사용
jwt_secret = os.getenv("JWT_SECRET")
ssafy_api_key = os.getenv("SSAFY_API_KEY")
opendata_key = os.getenv("OPENDATA_API_KEY")

# 기본값 설정
port = int(os.getenv("BACKEND_PORT", 8000))
debug = os.getenv("DEBUG", "false").lower() == "true"
```

### 프론트엔드에서 환경 변수 읽기

```typescript
// Expo에서는 EXPO_PUBLIC_ 접두사가 필요합니다
const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
const googleApiKey = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;
const isDebug = process.env.EXPO_PUBLIC_DEBUG === "true";

// 사용 예시
const response = await fetch(`${apiBaseUrl}/api/auth/me`);
```

## 🔒 보안 주의사항

### ✅ 해야 할 것들
- **.env 파일은 절대 GitHub에 커밋하지 않기**
- 강력한 JWT 시크릿 키 사용
- 프로덕션과 개발 환경 분리
- API 키는 필요한 곳에서만 사용

### ❌ 하지 말아야 할 것들
- .env 파일을 공개 저장소에 업로드
- 코드에 직접 API 키 하드코딩
- 약한 패스워드나 시크릿 키 사용
- 불필요한 권한의 API 키 사용

## 🛠️ 트러블슈팅

### 문제 1: 환경 변수가 로드되지 않음

**해결책:**
```bash
# 백엔드: python-dotenv가 설치되어 있는지 확인
pip install python-dotenv

# .env 파일이 올바른 위치에 있는지 확인
ls -la hackathon/backend/.env
ls -la hackathon/frontend/.env
```

### 문제 2: 프론트엔드에서 환경 변수 undefined

**해결책:**
```bash
# Expo에서는 EXPO_PUBLIC_ 접두사가 필요합니다
# ❌ 잘못된 방법
API_KEY=your-key

# ✅ 올바른 방법  
EXPO_PUBLIC_API_KEY=your-key
```

### 문제 3: Git에서 .env 파일이 추적됨

**해결책:**
```bash
# 이미 추적 중인 .env 파일 제거
git rm --cached .env
git rm --cached hackathon/backend/.env
git rm --cached hackathon/frontend/.env

# .gitignore가 제대로 설정되어 있는지 확인
cat .gitignore
```

## 📚 참고 자료

- [Python-dotenv 문서](https://pypi.org/project/python-dotenv/)
- [Expo 환경 변수 가이드](https://docs.expo.dev/guides/environment-variables/)
- [Git에서 민감한 데이터 제거하기](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)

## 🎯 체크리스트

설정 완료 후 다음 사항들을 확인하세요:

- [ ] `hackathon/backend/.env` 파일이 존재하고 API 키가 설정됨
- [ ] `hackathon/frontend/.env` 파일이 존재하고 API URL이 설정됨
- [ ] `.gitignore`에 `.env` 파일들이 포함되어 있음
- [ ] 백엔드 서버가 환경 변수를 올바르게 읽고 있음
- [ ] 프론트엔드 앱이 API 서버에 연결됨
- [ ] `.env` 파일들이 Git 상태에서 무시되고 있음

모든 설정이 완료되면 다음 명령어로 서버를 실행하세요:

```bash
# 백엔드 실행
cd hackathon/backend
source venv/bin/activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 프론트엔드 실행 (새 터미널)
cd hackathon/frontend  
npx expo start --go
```

