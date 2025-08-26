# Hackathon Monorepo

## 📱 Campus Chronicle - 대학생 성장 기록 앱

### 🎯 데모 시나리오
로그인 → 회원가입 → 온보딩 → 홈 → +XP → 레벨업 연출(Lottie)

### 📅 최근 업데이트 (2024-12-19)
- ✅ **UI/UX 완전 구현**: 웹 참조 디자인을 React Native로 완전 이식
- ✅ **로그인/회원가입 시스템**: SSAFY API 연동 및 폼 검증
- ✅ **온보딩 카루셀**: 자동 슬라이드 및 애니메이션
- ✅ **픽셀 로고 애니메이션**: 글리치 효과 및 페이드인 
- ✅ **일관된 디자인 시스템**: 통일된 여백, 컴포넌트 재사용
- ✅ **반응형 UI**: 터치 피드백 및 햅틱 지원

## 설치

### Backend
```
cd hackathon/backend
python3.11 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 >/tmp/hackathon_be.log 2>&1 &
```
헬스체크:
```
curl http://localhost:8000/api/health
```

### Frontend (Expo)
```
cd hackathon/frontend
npm i
npm run start
```
Expo Go로 LAN URL/QR 접속

## 환경변수
- BACKEND_PORT=8000
- JWT_SECRET=dev-secret
- DATABASE_URL=sqlite:///./hackathon.db (옵션)

프론트 `app.config.ts`의 `extra.apiBaseUrl`에 백엔드 주소(예: http://<로컬IP>:8000)를 설정

## 🎨 주요 기능

### Frontend (React Native/Expo)
- 📱 **로그인/회원가입**: 멀티스텝 폼, 이메일 검증, 소셜 로그인 UI
- 🎨 **애니메이션**: 픽셀 로고, 온보딩 카루셀, 버튼 인터랙션
- 🧩 **컴포넌트**: Input, Button, Picker, Checkbox, ProgressIndicator
- 📐 **디자인 시스템**: 28px 통일 여백, 일관된 컬러/타이포그래피
- 📱 **네비게이션**: Expo Router 기반 스크린 전환

### Backend (FastAPI)
- 🔐 **인증 API**: SSAFY API 프록시, JWT 토큰 관리
- 📊 **사용자 진행도**: XP/레벨 시스템
- 🛡️ **보안**: CORS 설정, 에러 핸들링

## 🔧 기술 스택
- **Frontend**: React Native, Expo, TypeScript
- **Backend**: FastAPI, SQLAlchemy, SQLModel  
- **애니메이션**: React Native Animated API
- **네비게이션**: Expo Router
- **아이콘**: @expo/vector-icons (Feather)
- **스토리지**: expo-secure-store
- **피드백**: expo-haptics

## 품질 기준
- ✅ GET /api/health 200 OK
- ✅ 앱에서 레벨/XP 표시 및 +XP 버튼 동작
- ✅ 레벨업 시 Lottie 연출 및 Haptics
- ✅ 네트워크 실패 시에도 화면 유지(폴백)
- ✅ 반응형 UI 및 일관된 디자인
- ✅ 멀티스텝 회원가입 플로우
