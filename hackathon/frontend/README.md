# Frontend - React Native Expo 앱

언더독팀 해커톤 프로젝트의 모바일 앱 프론트엔드입니다.

## 실행 방법

```bash
# 의존성 설치
npm install

# Expo 앱 실행
npx expo start --go

# 또는 특정 플랫폼 실행
npx expo start --ios      # iOS 시뮬레이터
npx expo start --android  # Android 에뮬레이터
npx expo start --web      # 웹 브라우저
```

## 주요 기능

### 1. 사용자 인증
- **회원가입/로그인**: 이메일 기반 자체 회원가입 시스템
- **자동 로그인**: JWT 토큰 기반 자동 인증
- **프로필 관리**: 사용자 정보 수정 및 관리

### 2. 온보딩
- **캐러셀 인터페이스**: 앱 기능 소개 및 가이드
- **대학교/학과 설정**: 개인화된 서비스 제공

### 3. 홈 화면
- **사용자 프로필 표시**: 대학교, 학과, 학년 정보
- **레벨링 시스템**: XP 기반 사용자 레벨 관리
- **실시간 데이터 연동**: 백엔드 API와 실시간 동기화

### 4. UI/UX 컴포넌트
- **현대적인 디자인**: 깔끔하고 직관적인 인터페이스
- **애니메이션**: Lottie 애니메이션 지원
- **반응형 레이아웃**: 다양한 디바이스 화면 대응

## 화면 구성

### 주요 화면들
- `app/index.tsx` - 앱 진입점, 자동 로그인 처리
- `app/login.tsx` - 로그인 화면
- `app/signup.tsx` - 회원가입 화면
- `app/onboarding.tsx` - 온보딩 캐러셀
- `app/home.tsx` - 메인 홈 화면
- `app/profile-edit.tsx` - 프로필 편집

### 개발/테스트 화면들
- `app/home-new.tsx` - 새로운 홈 화면 버전
- `app/home-broken.tsx` - 이전 버전 (디버깅용)
- `app/test.tsx` - 테스트 화면

## 컴포넌트 구조

```
components/
├── ui/                    # 기본 UI 컴포넌트
│   ├── Button.tsx        # 버튼 컴포넌트
│   ├── Input.tsx         # 입력 필드
│   ├── Checkbox.tsx      # 체크박스
│   └── Modal.tsx         # 모달
├── figma/                # Figma 디자인 기반 컴포넌트
│   └── ImageWithFallback.tsx
├── OnboardingCarousel.tsx # 온보딩 캐러셀
├── PixelLogo.tsx         # 픽셀 스타일 로고
├── ProgressIndicator.tsx  # 진행률 표시
└── UniversityPicker.tsx  # 대학교 선택기
```

## API 연동

### 백엔드 연결
- **Base URL**: `http://localhost:8000` (개발 환경)
- **API 타입**: RESTful API
- **인증**: JWT Bearer 토큰

### 주요 API 엔드포인트
```typescript
// 인증 관련
POST /api/auth/login      // 로그인
POST /api/auth/signup     // 회원가입
GET  /api/auth/me         // 사용자 정보 조회
PUT  /api/auth/profile    // 프로필 업데이트

// XP 시스템
GET  /api/xp/me           // 현재 XP/레벨 조회
POST /api/xp/add          // XP 추가

// 대학교 정보
GET  /api/universities    // 대학교 목록
GET  /api/universities/{name}/departments // 학과 목록
```

## 상태 관리

### 로컬 스토리지
- **토큰 저장**: `AsyncStorage`를 통한 JWT 토큰 관리
- **사용자 설정**: 앱 설정 및 사용자 선호도

### 전역 상태
- 현재는 각 화면에서 개별적으로 상태 관리
- 향후 Context API 또는 Redux 도입 고려

## 개발 환경

### 기술 스택
- **React Native**: 크로스 플랫폼 모바일 앱 프레임워크
- **Expo SDK 53**: 개발 및 빌드 도구
- **TypeScript**: 타입 안전성
- **Expo Router**: 파일 기반 라우팅

### 주요 의존성
```json
{
  "expo": "~53.x.x",
  "@expo/vector-icons": "^14.x.x",
  "expo-router": "~4.x.x",
  "lottie-react-native": "^7.x.x",
  "react-native": "~0.76.x",
  "typescript": "^5.x.x"
}
```

## 디버깅 및 로깅

### 개발 로그
앱에서는 상세한 로깅을 통해 디버깅을 지원합니다:

```javascript
LOG  🔗 API Base URL: http://localhost:8000
LOG  🔑 토큰 존재 여부: true/false
LOG  📡 API 응답 상태: 200
LOG  ✅ 사용자 데이터 수신: {user_data}
```

### 에러 처리
- **네트워크 에러**: API 연결 실패 시 적절한 에러 메시지 표시
- **인증 에러**: 토큰 만료 시 자동 로그인 화면 리다이렉트
- **AbortError**: 요청 취소 시 안전한 처리

## 빌드 및 배포

### 개발 빌드
```bash
npx expo run:ios    # iOS
npx expo run:android # Android
```

### 프로덕션 빌드
```bash
# EAS Build 사용
npx eas build --platform all
```

### 웹 배포
```bash
npx expo export:web
```

## 트러블슈팅

### 일반적인 문제들

1. **Expo 서버 시작 실패**
   ```bash
   # 캐시 정리
   npx expo start --clear
   ```

2. **Metro bundler 문제**
   ```bash
   # Metro 캐시 정리
   npx expo start --reset-cache
   ```

3. **API 연결 문제**
   - 백엔드 서버가 실행 중인지 확인
   - 네트워크 설정 확인 (localhost vs IP 주소)

4. **토큰 인증 문제**
   - AsyncStorage에서 토큰 수동 삭제
   - 로그아웃 후 재로그인

### 성능 최적화

- **이미지 최적화**: `ImageWithFallback` 컴포넌트 사용
- **레이지 로딩**: 화면별 지연 로딩 구현
- **API 캐싱**: 중복 요청 방지

## 향후 개발 계획

### 추가 예정 기능
- [ ] 오프라인 모드 지원
- [ ] 푸시 알림
- [ ] 다크 모드
- [ ] 다국어 지원
- [ ] 성능 모니터링

### 코드 개선 사항
- [ ] 전역 상태 관리 (Context API/Redux)
- [ ] 컴포넌트 단위 테스트
- [ ] API 요청 인터셉터
- [ ] 에러 바운더리 구현

## 참고 자료

- [Expo 공식 문서](https://docs.expo.dev/)
- [React Native 공식 문서](https://reactnative.dev/)
- [TypeScript 가이드](https://www.typescriptlang.org/)