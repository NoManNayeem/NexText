# backend/app/schemas/user.py

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    """
    Shared properties for a user.
    """
    username: str = Field(
        ...,
        min_length=3,
        max_length=50,
        example="alice"
    )
    email: EmailStr = Field(
        ...,
        example="alice@example.com"
    )


class UserCreate(UserBase):
    """
    Properties required for creating a new user.
    """
    password: str = Field(
        ...,
        min_length=8,
        example="securePassword123"
    )


class UserRead(UserBase):
    """
    Properties returned in user read operations.
    """
    id: int = Field(..., example=1)
    is_active: bool = Field(..., example=True)
    created_at: datetime = Field(..., example="2025-05-22T12:34:56Z")

    class Config:
        orm_mode = True


class Token(BaseModel):
    """
    JWT access token response schema.
    """
    access_token: str = Field(..., example="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
    token_type: str = Field(..., example="bearer")


class TokenData(BaseModel):
    """
    Data extracted from a validated JWT token.
    """
    username: Optional[str] = None
