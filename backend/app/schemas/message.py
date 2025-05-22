# backend/app/schemas/message.py

from datetime import datetime
from pydantic import BaseModel, Field


class MessageBase(BaseModel):
    """
    Shared properties for a chat message.
    """
    recipient_id: int = Field(..., example=2, description="ID of the message recipient")
    content: str = Field(..., example="Hello there!", description="The text content of the message")


class MessageCreate(MessageBase):
    """
    Properties required for creating a new chat message.
    """
    pass


class MessageRead(MessageBase):
    """
    Properties returned when reading a chat message.
    """
    id: int = Field(..., example=1, description="Unique message ID")
    sender_id: int = Field(..., example=1, description="ID of the message sender")
    timestamp: datetime = Field(
        ...,
        example="2025-05-22T12:34:56Z",
        description="ISO 8601 timestamp when the message was created"
    )

    class Config:
        orm_mode = True
