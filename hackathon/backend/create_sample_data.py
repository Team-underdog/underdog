#!/usr/bin/env python3
"""
테스트용 샘플 데이터 생성 스크립트
"""

import asyncio
from sqlmodel import Session, create_engine, select
from app.models.chronicle import ChroniclePost
from app.models.user import User
from app.db.session import engine
from datetime import datetime, timedelta
import json

def create_sample_chronicle_posts():
    """샘플 크로니클 포스트 생성"""
    
    # 데이터베이스 연결
    with Session(engine) as session:
        # 사용자 ID 2가 존재하는지 확인
        user = session.exec(select(User).where(User.id == 2)).first()
        if not user:
            print("❌ 사용자 ID 2를 찾을 수 없습니다. 먼저 사용자를 생성해주세요.")
            return
        
        # 기존 크로니클 포스트 삭제
        existing_posts = session.exec(select(ChroniclePost)).all()
        for post in existing_posts:
            session.delete(post)
        session.commit()
        
        # 샘플 포스트 데이터
        sample_posts = [
            {
                "user_id": 2,
                "type": "user_post",
                "title": "오늘의 학습 성과",
                "description": "알고리즘 문제 3개를 해결했습니다!",
                "timestamp": datetime.now() - timedelta(hours=2),
                "rewards": json.dumps({"credo": 15, "skillXp": {"skillName": "학업", "amount": 30}}),
                "user_content": json.dumps({"text": "백준 온라인 저지에서 DP 문제들을 풀었어요.", "image": None, "isUserGenerated": True})
            },
            {
                "user_id": 2,
                "type": "user_post",
                "description": "도서관에서 4시간 공부",
                "title": "집중력 향상의 비밀",
                "timestamp": datetime.now() - timedelta(days=1),
                "rewards": json.dumps({"credo": 20, "skillXp": {"skillName": "자기계발", "amount": 40}}),
                "user_content": json.dumps({"text": "중앙도서관에서 데이터베이스 설계 공부를 했습니다.", "image": None, "isUserGenerated": True})
            },
            {
                "user_id": 2,
                "type": "user_post",
                "title": "팀 프로젝트 진행상황",
                "description": "프론트엔드 UI 구현 완료!",
                "timestamp": datetime.now() - timedelta(days=2),
                "rewards": json.dumps({"credo": 25, "skillXp": {"skillName": "대외활동", "amount": 50}}),
                "user_content": json.dumps({"text": "React Native로 모바일 앱 UI를 완성했습니다.", "image": None, "isUserGenerated": True})
            }
        ]
        
        # 포스트 생성
        for post_data in sample_posts:
            post = ChroniclePost(**post_data)
            session.add(post)
        
        session.commit()
        print(f"✅ {len(sample_posts)}개의 샘플 크로니클 포스트를 생성했습니다.")

if __name__ == "__main__":
    create_sample_chronicle_posts()
