# 🚀 Underdog Hackathon Project - v2

## 📋 프로젝트 개요

대학생을 위한 게이미피케이션 기반 성장 플랫폼으로, 스킬트리 시스템, AI 상담, 크레도 시스템을 통해 개인의 성장을 시각화하고 분석합니다.

## ✨ 주요 기능

### 🎯 **스킬트리 시스템**
- **학사 스킬**: 출석률, GPA, 강의 수료 등 학업 성과 추적
- **금융 스킬**: 저축, 투자, 신용관리 등 금융 역량 관리
- **크로니클 스킬**: 소통, 네트워킹, 지식 공유 활동 기록
- **실시간 XP 및 레벨링**: 성장 과정을 게임처럼 체험

### 🤖 **AI 개인 분석 시스템**
- **"나 알아보기" 기능**: Gemini AI를 활용한 맞춤형 성장 분석
- **강점 분석**: 사용자의 뛰어난 능력과 성과 분석
- **개선점 제시**: 발전 가능한 영역과 구체적 개선 방안
- **성향 분석**: 행동 패턴과 성격적 특성 분석
- **맞춤형 추천**: 현재 상황에 최적화된 개선 방안
- **직업 추천**: 강점과 성향을 고려한 적합한 직업군 제안
- **스킬 인사이트**: 스킬트리에서 주목해야 할 핵심 영역
- **성장 경로**: 단계별 발전 로드맵 제시

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

### **Frontend (React Native)**
- **스킬트리 시각화**: 인터랙티브한 스킬 노드와 연결선
- **AI 분석 결과 표시**: 모달 형태의 상세 분석 리포트
- **실시간 데이터 동기화**: 백엔드 API와의 실시간 연동
- **반응형 UI**: 다양한 화면 크기에 최적화된 인터페이스

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
- React Native 개발 환경
- Google Gemini API 키

### **Backend 설정**
```bash
cd hackathon/backend
pip install -r requirements.txt
pip install google-genai
export GEMINI_API_KEY="your_api_key_here"
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### **Frontend 설정**
```bash
cd hackathon/frontend
npm install
npm start
```

## 📊 **API 엔드포인트**

### **AI Advisor API**
- `GET /api/ai-advisor/health` - 서비스 상태 확인
- `POST /api/ai-advisor/generate` - AI 텍스트 생성
- `POST /api/ai-advisor/financial-advice` - 금융 상담
- `POST /api/ai-advisor/budget-analysis` - 예산 분석

### **스킬트리 API**
- `GET /api/skills/academic` - 학사 스킬 데이터
- `GET /api/skills/financial` - 금융 스킬 데이터
- `POST /api/skills/update-xp` - 스킬 XP 업데이트

### **크레도 시스템 API**
- `GET /api/xp/progress/{user_id}` - 사용자 진행 상황
- `POST /api/xp/earn` - XP 획득
- `GET /api/quests` - 퀘스트 목록

## 🎮 **사용자 경험**

### **온보딩**
1. 회원가입 및 프로필 설정
2. 초기 스킬트리 생성
3. 첫 번째 퀘스트 시작

### **일상 사용**
1. 스킬트리에서 현재 상태 확인
2. "나 알아보기"로 AI 분석 받기
3. 퀘스트 완료로 XP 획득
4. 크로니클에 활동 기록

### **성장 추적**
1. 레벨업과 크레도 점수 확인
2. AI 분석 결과를 통한 개선점 파악
3. 맞춤형 추천사항 실행

## 🔒 **보안 및 개인정보**

- **API 키 보안**: 백엔드에서만 API 키 관리
- **사용자 데이터**: 개인정보 암호화 및 보호
- **접근 제어**: 인증된 사용자만 데이터 접근 가능

## 🚀 **향후 개발 계획**

### **v2.1 (예정)**
- [ ] Google GenAI SDK 완전 통합
- [ ] 실시간 AI 채팅 상담
- [ ] 스킬트리 시각화 개선

### **v2.2 (예정)**
- [ ] 모바일 푸시 알림
- [ ] 소셜 기능 강화
- [ ] 데이터 분석 대시보드

## 👥 **개발팀**

- **Backend**: FastAPI, Python, SQLAlchemy
- **Frontend**: React Native, TypeScript
- **AI**: Google Gemini API, Google GenAI SDK
- **Database**: SQLite (개발), PostgreSQL (운영)

## 📄 **라이선스**

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

---

**Last Updated**: 2025-08-30  
**Version**: 2.0.0  
**Status**: 🟢 Production Ready
