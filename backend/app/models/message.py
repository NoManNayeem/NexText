# backend/app/models/message.py

"""
ORM model for chat messages between users.
"""

from sqlalchemy import Column, Integer, ForeignKey, Text, DateTime, func
from sqlalchemy.orm import relationship
from app.db.base import Base


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    recipient_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    content = Column(Text, nullable=False)
    timestamp = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # ORM relationships, matching back_populates on User model
    sender = relationship(
        "User",
        back_populates="sent_messages",
        foreign_keys=[sender_id],
    )
    recipient = relationship(
        "User",
        back_populates="received_messages",
        foreign_keys=[recipient_id],
    )

    def __repr__(self) -> str:
        return (
            f"<ChatMessage id={self.id} "
            f"from={self.sender_id} to={self.recipient_id} "
            f"at={self.timestamp}>"
        )
