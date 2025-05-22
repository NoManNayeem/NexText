# backend/app/models/user.py

from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from sqlalchemy.orm import relationship
from app.db.base import Base


class User(Base):
    """
    ORM model for application users.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(128), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    sent_messages = relationship(
        "ChatMessage",
        back_populates="sender",
        foreign_keys="ChatMessage.sender_id",
        cascade="all, delete-orphan",
    )
    received_messages = relationship(
        "ChatMessage",
        back_populates="recipient",
        foreign_keys="ChatMessage.recipient_id",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} username={self.username!r}>"
