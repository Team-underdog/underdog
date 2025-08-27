from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class ChroniclePost(SQLModel, table=True):
    __tablename__ = "chronicle_posts"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    type: str = Field(default="user_post", max_length=50)
    title: str = Field(max_length=200)
    description: Optional[str] = Field(default=None)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    rewards: Optional[str] = Field(default=None)  # JSON 문자열로 저장 (호환성 유지)
    user_content: Optional[str] = Field(default=None)  # JSON 문자열로 저장 (호환성 유지)
    
    def __repr__(self):
        return f"<ChroniclePost(id={self.id}, user_id={self.user_id}, type={self.type})>"
