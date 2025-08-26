# 📱 Campus Chronicle Frontend

## 🚀 실행 방법
```bash
npm install
npm run start
```
Expo Go 앱으로 QR 스캔 (같은 네트워크 필요)

## ⚙️ 환경설정
- `app.config.ts`의 `extra.apiBaseUrl`에 백엔드 URL 설정
- 예시: `http://172.20.10.8:8000`

## 📱 화면 구성

### 🔐 로그인 (`/login`)
- 픽셀 아트 로고 애니메이션
- 이메일/비밀번호 입력 폼
- 구글/애플 소셜 로그인 UI
- SSAFY API 연동 및 에러 처리

### ✍️ 회원가입 (`/signup`) 
- 4단계 멀티스텝 폼
- 이메일 → 비밀번호 → 개인정보 → 완료
- 실시간 폼 검증 및 진행도 표시
- 대학/학과 선택, 약관 동의

### 🎯 온보딩 (`/onboarding`)
- 자동 슬라이드 이미지 카루셀
- 그라데이션 오버레이 효과
- 부드러운 전환 애니메이션

## 🧩 주요 컴포넌트

### UI 컴포넌트
- `Input`: 라벨, 아이콘, 에러 표시가 있는 입력 필드
- `Button`: 프라이머리/세컨더리 스타일 버튼
- `Picker`: 드롭다운 선택 컴포넌트
- `Checkbox`: 체크박스 및 라벨
- `ProgressIndicator`: 원형 진행도 표시

### 특수 컴포넌트  
- `PixelLogo`: 글리치 효과가 있는 애니메이션 로고
- `OnboardingCarousel`: 자동 슬라이드 이미지 카루셀
- `SignupForm`: 4단계 회원가입 폼 로직
- `SocialLogin`: 구글/애플 로그인 버튼

## 🎨 디자인 시스템

### 📐 레이아웃
- **Container**: `paddingHorizontal: 28px` (일관된 좌우 여백)
- **Header**: 투명 배경, 하단 경계선
- **Content**: flex 확장, 상단 여백 20px
- **Card**: 16px 내부 패딩, 둥근 모서리

### 🎯 애니메이션
- **페이드인**: 화면 전환 시 부드러운 등장
- **스케일**: 버튼 터치 시 축소 효과  
- **글리치**: 로고의 픽셀 아트 효과
- **슬라이드**: 카루셀 이미지 전환

### 🔤 타이포그래피
- **제목**: 24px, 굵게, 중앙 정렬
- **부제목**: 14px, 회색, 중앙 정렬  
- **라벨**: 16px, 굵게, 좌측 정렬
- **링크**: 파란색, 밑줄

## 🔧 기술 세부사항

### 라이브러리
- **@expo/vector-icons**: Feather 아이콘 세트
- **expo-router**: 파일 기반 네비게이션
- **expo-secure-store**: 토큰 보안 저장
- **expo-haptics**: 햅틱 피드백
- **expo-constants**: 앱 설정 관리

### 상태 관리
- React Hooks (`useState`, `useEffect`, `useCallback`, `useMemo`)
- `useRef`로 애니메이션 값 관리
- 폼 상태 및 검증 로직

### 네트워크
- Fetch API with timeout
- 에러 매핑 및 사용자 친화적 메시지
- SSAFY API 응답 코드 처리

## 🐛 디버깅 팁
- Metro bundler 재시작: `r` 키
- 캐시 클리어: `npm start -- --clear`
- 디바이스 로그: Expo DevTools 사용
