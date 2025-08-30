# 🚀 Underdog Hackathon Project - v3.0.1

## 📱 **즉시 실행하기 (1분)**

### **🚀 QR 코드로 바로 시작!**
![Expo Go QR Code](frontend/입장큐알.png)

**위 QR 코드를 스캔하여 즉시 앱을 실행하세요!**

### **📱 Expo Go 설치 방법**
1. **App Store에서 설치**: "Expo Go" 검색 후 설치
2. **QR 코드 스캔**: 위 QR 코드를 Expo Go 앱으로 스캔
3. **즉시 실행**: 앱이 자동으로 다운로드되고 실행됩니다!

### **🍎 iPhone 환경에 최적화**
- **iOS 네이티브 성능**: React Native로 구현된 최적화된 UI
- **iPhone 디스플레이**: 모든 iPhone 모델에 최적화된 반응형 디자인
- **iOS 제스처**: iPhone 사용자에게 친숙한 스와이프, 탭 제스처
- **iOS 디자인 가이드**: Apple Human Interface Guidelines 준수
- **60fps 애니메이션**: 부드러운 UI 전환과 인터랙션
- **메모리 효율성**: 최적화된 이미지 로딩과 캐싱

---

## 📋 프로젝트 개요

대학생을 위한 게이미피케이션 기반 성장 플랫폼으로, 스킬트리 시스템, AI 상담, 크레도 시스템을 통해 개인의 성장을 시각화하고 분석합니다.

**🎯 v3.0.1 주요 업데이트:**
- ✅ **Expo Go QR 코드**: 실제 QR 코드로 즉시 실행 가능
- ✅ **자동 로그인**: 매번 로그인할 필요 없음
- ✅ **크로니클 시스템 완벽 구현**: 포스트 CRUD, 실시간 동기화, 권한 관리
- ✅ **크레도 시스템 데이터베이스 연동**: 모든 활동이 실제 DB에 반영
- ✅ **AI Holland 성향 분석**: 크로니클 내용 기반 성향 분석 및 점수 업데이트
- ✅ **포스트 삭제 기능**: 완벽한 데이터베이스 연동 및 UI 동기화
- ✅ **실시간 크레도 점수**: 포스트 생성/삭제 시 즉시 점수 반영

## ✨ 주요 기능

### 🎯 **스킬트리 시스템**
- **학사 스킬**: 출석률, GPA, 강의 수료 등 학업 성과 추적
- **금융 스킬**: 저축, 투자, 신용관리 등 금융 역량 관리
- **크로니클 스킬**: 소통, 네트워킹, 지식 공유 활동 기록
- **실시간 XP 및 레벨링**: 성장 과정을 게임처럼 체험

### 🤖 **AI 개인 분석 시스템**
- **"나 어필하기" 기능**: Gemini AI를 활용한 맞춤형 자기소개 생성
- **Holland 성향 분석**: 크로니클 내용 기반 성향 분석 및 점수 업데이트
- **강점 분석**: 사용자의 뛰어난 능력과 성과 분석
- **개선점 제시**: 발전 가능한 영역과 구체적 개선 방안
- **맞춤형 추천**: 현재 상황에 최적화된 개선 방안

### 💰 **크레도 시스템**
- **경험치 축적**: 다양한 활동을 통한 XP 획득
- **레벨업 시스템**: 단계별 성장과 보상
- **퀘스트 시스템**: 목표 지향적 미션과 도전
- **성취도 추적**: 진행 상황과 달성률 모니터링

### 📱 **크로니클 시스템**
- **활동 기록**: 일상, 학습, 금융 등 다양한 주제의 게시글
- **소통 플랫폼**: 사용자 간 경험 공유와 네트워킹
- **참여율 추적**: 활동 참여도와 영향력 측정

## 🏗️ **기술 아키텍처**

### **Frontend (React Native + Expo)**
- **Expo SDK**: 최신 Expo 기능으로 빠른 개발과 배포
- **스킬트리 시각화**: 인터랙티브한 스킬 노드와 연결선
- **AI 분석 결과 표시**: 모달 형태의 상세 분석 리포트
- **실시간 데이터 동기화**: 백엔드 API와의 실시간 연동
- **반응형 UI**: iPhone을 포함한 다양한 화면 크기에 최적화

### **Backend (FastAPI + Python)**
- **AI 프록시 서버**: Gemini API 호출을 위한 백엔드 프록시
- **Google GenAI SDK**: 공식 Google AI 라이브러리 통합
- **폴백 시스템**: SDK 실패 시 requests 방식으로 자동 전환
- **RESTful API**: 체계적인 API 구조와 문서화

### **AI Integration (Google Gemini)**
- **Gemini 2.5 Flash**: 최신 AI 모델을 활용한 개인화 분석
- **프롬프트 엔지니어링**: 사용자 데이터 기반 맞춤형 분석
- **한국어 최적화**: 한국어 사용자를 위한 자연스러운 응답

## 🔧 **설치 및 실행**

### **Prerequisites**
- Python 3.9+
- Node.js 16+
- Expo CLI
- Google Gemini API 키

### **Backend 설정**
```bash
cd hackathon/backend
pip install -r requirements.txt
pip install google-genai
export GEMINI_API_KEY="your_api_key_here"

# ⚠️ 중요: 올바른 실행 경로 사용
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# ❌ 잘못된 실행 방법 (연결 오류 발생)
# python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### **Frontend 설정**
```bash
cd hackathon/frontend
npm install

# Expo 개발 서버 시작
npm start

# 또는 EAS Build로 APK 생성
eas build -p android --profile preview
```

## 📊 **API 엔드포인트**

### **AI Advisor API**
- `GET /api/ai-advisor/health` - 서비스 상태 확인
- `POST /api/ai-advisor/generate` - AI 텍스트 생성
- `POST /api/ai-advisor/self-promotion` - 자기소개 생성
- `POST /api/ai-advisor/analyze-chronicle-holland` - Holland 성향 분석

### **XP/Credo API**
- `GET /api/xp/progress/{user_id}` - 사용자 크레도 진행상황
- `POST /api/xp/add` - 크레도 점수 추가
- `POST /api/xp/deduct-for-deletion` - 삭제 시 크레도 차감

### **Chronicle API**
- `GET /api/chronicle/posts` - 크로니클 포스트 목록
- `POST /api/chronicle/posts` - 새 포스트 생성
- `DELETE /api/chronicle/posts/{post_id}` - 포스트 삭제

## 🎮 **사용법**

### **1. 앱 실행**
- Expo Go 앱으로 QR 코드 스캔
- 또는 `npm start` 후 시뮬레이터/실제 기기에서 실행

### **2. 크로니클 사용**
- 홈 화면에서 "크로니클" 탭 선택
- 사진과 글을 함께 포스트 작성
- AI가 자동으로 Holland 성향 분석
- 크레도 점수 자동 증가

### **3. AI 분석 활용**
- "혜택 확인" → "나 어필하기" 버튼 클릭
- AI가 크로니클 내용을 분석하여 자기소개 생성
- Holland 성향 점수 확인 및 업데이트

### **4. 크레도 시스템**
- 모든 활동에서 크레도 점수 획득
- 레벨업을 통한 성장 체험
- 실시간 점수 업데이트 확인

## 🚀 **배포 및 빌드**

### **Expo Go (개발/테스트)**
```bash
npm start
# QR 코드 스캔으로 즉시 실행
```

### **EAS Build (프로덕션 APK)**
```bash
# Android APK 빌드
eas build -p android --profile preview

# iOS IPA 빌드
eas build -p ios --profile preview
```

## 📈 **성능 최적화**

### **iPhone 최적화**
- **60fps 애니메이션**: 부드러운 UI 전환과 인터랙션
- **메모리 효율성**: 최적화된 이미지 로딩과 캐싱
- **배터리 효율성**: 백그라운드 작업 최소화
- **네트워크 최적화**: 효율적인 API 호출과 데이터 동기화

## 🔍 **문제 해결**

### **네트워크 연결 오류**
- 백엔드 서버가 `0.0.0.0:8000`에서 실행 중인지 확인
- 같은 Wi-Fi 네트워크에서 실행 중인지 확인
- 방화벽에서 8000번 포트 허용 확인

### **Expo Go 실행 오류**
- Expo Go 앱을 최신 버전으로 업데이트
- 캐시 클리어: `npm start --clear`
- 네트워크 연결 상태 확인

## 📞 **지원 및 문의**

- **GitHub Issues**: 버그 리포트 및 기능 요청
- **개발팀**: 언더독팀 해커톤 프로젝트
- **버전**: v3.0.0 (2024년 8월 30일)

---

**🎉 언더독팀 해커톤 프로젝트 v3.0.0 완성!**
**📱 iPhone에 최적화된 최고의 성장 플랫폼을 경험해보세요!**
