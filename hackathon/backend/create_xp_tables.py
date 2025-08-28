#!/usr/bin/env python3
"""
XP 시스템 데이터베이스 테이블 생성 스크립트
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlmodel import SQLModel, create_engine, Session
from app.models.xp import UserXP, XPActivity
from app.models.user import User
from app.db.session import get_session
from app.core.config import settings

def create_xp_tables():
    """XP 시스템 테이블 생성"""
    print("🚀 XP 시스템 테이블 생성 시작...")
    
    # 데이터베이스 엔진 생성
    engine = create_engine(settings.DATABASE_URL, echo=True)
    
    # 테이블 생성
    SQLModel.metadata.create_all(engine)
    print("✅ XP 테이블 생성 완료!")
    
    # 기존 사용자들을 위한 XP 데이터 초기화
    with Session(engine) as session:
        # 모든 사용자 조회
        from sqlmodel import text
        users = session.exec(text("SELECT id FROM user")).all()
        
        if users:
            print(f"📊 {len(users)}명의 기존 사용자 XP 데이터 초기화...")
            
            for user_id in users:
                # UserXP 데이터가 이미 있는지 확인
                existing_xp = session.exec(
                    text(f"SELECT id FROM user_xp WHERE user_id = {user_id[0]}")
                ).first()
                
                if not existing_xp:
                    # 새 XP 데이터 생성
                    new_xp = UserXP(
                        user_id=user_id[0],
                        current_level=1,
                        current_xp=0,
                        total_xp=0,
                        credo_score=0
                    )
                    session.add(new_xp)
                    print(f"  - 사용자 {user_id[0]} XP 데이터 생성")
            
            session.commit()
            print("✅ 기존 사용자 XP 데이터 초기화 완료!")
        else:
            print("ℹ️  초기화할 사용자가 없습니다.")
    
    print("\n🎉 XP 시스템 데이터베이스 설정 완료!")
    print("📋 생성된 테이블:")
    print("  - user_xp: 사용자 XP 정보")
    print("  - xp_activities: XP 활동 기록")

if __name__ == "__main__":
    create_xp_tables()
