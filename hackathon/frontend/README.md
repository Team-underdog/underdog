# Frontend (Expo)

## 실행
```
npm i
npm run start
```
Expo Go 앱으로 QR 스캔(같은 네트워크)

## 환경설정
- `app.config.ts`의 `extra.apiBaseUrl`에 백엔드 URL 설정 (예: http://<로컬IP>:8000)

## 기능
- 홈 화면: 현재 레벨/XP 표시
- +XP 20 / +XP 80 버튼
- 레벨업 시 Lottie + Haptics
