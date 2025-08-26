# Backend

## 실행
```
python3.11 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API
- GET /api/health -> {status: "ok"}
- POST /api/xp/add {userId, delta} -> {level, xp, xpToNext, leveled_up}
- GET /api/xp/me -> {level, xp, xpToNext}
- POST /api/auth/login -> {access_token}
- GET /api/auth/me
