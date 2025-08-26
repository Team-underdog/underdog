# Hackathon Monorepo

데모 시나리오: 로그인(더미) → 홈 → +XP → 레벨업 연출(Lottie)

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

## 품질 기준
- GET /api/health 200 OK
- 앱에서 레벨/XP 표시 및 +XP 버튼 동작
- 레벨업 시 Lottie 연출 및 Haptics
- 네트워크 실패 시에도 화면 유지(폴백)
