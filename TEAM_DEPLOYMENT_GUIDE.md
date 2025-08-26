# 🚀 팀원 배포 가이드

## 📱 방법 1: Expo Go 앱으로 즉시 테스트 (가장 간단)

### 팀원이 해야 할 것:
1. **Expo Go 앱 설치**
   - iOS: App Store에서 "Expo Go" 검색 후 설치
   - Android: Google Play Store에서 "Expo Go" 검색 후 설치

2. **QR 코드 스캔**
   - 개발자가 `npx expo start`를 실행하면 QR 코드가 표시됨
   - Expo Go 앱에서 QR 코드 스캔
   - 또는 터널 모드: `npx expo start --tunnel` (인터넷을 통한 접근)

### 개발자가 해야 할 것:
```bash
cd hackathon/frontend
npx expo start --tunnel  # 인터넷으로 공유 가능
```

**장점**: 즉시 실행, 실시간 업데이트
**단점**: 개발자가 서버를 켜두어야 함

---

## 🌐 방법 2: Expo 공유 링크 (일시적)

### 설정 방법:
```bash
cd hackathon/frontend
npx expo start --tunnel
```

생성된 링크를 팀원들에게 공유하면 Expo Go 앱에서 바로 열 수 있습니다.

**장점**: 링크 공유만으로 접근 가능
**단점**: 개발 서버 의존적

---

## 📦 방법 3: EAS Build (프로덕션 수준)

### 초기 설정:
```bash
npm install -g @expo/cli
npx expo login  # Expo 계정 필요
npx expo install expo-dev-client
```

### eas.json 설정 파일 생성:
```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

### 빌드 실행:
```bash
npx eas build --platform all --profile preview
```

빌드 완료 후 생성되는 링크를 팀원들에게 공유

**장점**: 안정적, 앱스토어 수준 품질
**단점**: 빌드 시간 필요 (10-30분)

---

## 🖥️ 방법 4: 백엔드 배포 (선택사항)

### A) 로컬 네트워크 공유
현재 로컬 IP로 접근 가능:
```bash
cd hackathon/backend
source venv/bin/activate
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

팀원들이 `http://당신의로컬IP:8000`으로 접근

### B) 클라우드 배포 (추천)

#### Railway 배포:
1. [Railway.app](https://railway.app) 가입
2. GitHub 저장소 연결
3. 환경변수 설정:
   ```
   PORT=8000
   JWT_SECRET=your-secret-key
   ```

#### Heroku 배포:
```bash
# Procfile 생성
echo "web: uvicorn app.main:app --host 0.0.0.0 --port \$PORT" > Procfile

# 배포
git add .
git commit -m "Add Procfile for Heroku"
heroku create your-app-name
git push heroku master
```

---

## 🔧 팀원 환경 설정 가이드

### 필수 설치:
1. **Node.js** (18.0.0 이상)
2. **Git**
3. **Expo Go 앱** (모바일)

### 프로젝트 클론 및 실행:
```bash
# 1. 저장소 클론
git clone https://github.com/Team-underdog/underdog.git
cd underdog/hackathon/frontend

# 2. 의존성 설치
npm install

# 3. 실행
npx expo start
```

### 백엔드 실행 (선택):
```bash
cd hackathon/backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

---

## 📋 팀원별 역할

### 디자이너/기획자:
- **Expo Go 앱 설치** → QR 코드 스캔
- 실시간으로 디자인 검토 및 피드백

### 개발자:
- **전체 환경 설정** → 코드 수정 및 기능 추가
- EAS Build로 테스트 버전 생성

### PM/QA:
- **Expo Go 앱** → 기능 테스트
- **EAS Build** → 프로덕션 수준 테스트

---

## 🚨 문제 해결

### "네트워크 오류" 시:
1. 같은 WiFi 네트워크 확인
2. 방화벽 설정 확인
3. `--tunnel` 옵션 사용

### "앱이 로드되지 않음" 시:
1. Expo Go 앱 최신 버전 확인
2. 캐시 클리어: `npx expo start --clear`
3. Metro 재시작: `r` 키 입력

### "백엔드 연결 실패" 시:
1. `app.config.ts`의 `apiBaseUrl` 확인
2. 백엔드 서버 실행 상태 확인
3. IP 주소 정확성 확인

---

## 💡 추천 워크플로우

1. **개발 단계**: Expo Go + QR 코드
2. **내부 테스트**: EAS Build (preview)
3. **외부 공유**: EAS Build + 배포된 백엔드
4. **프로덕션**: App Store/Play Store 배포

각 단계에 맞는 방법을 선택하여 효율적으로 팀과 협업하세요! 🎉
