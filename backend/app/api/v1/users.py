# backend/app/api/v1/users.py

from datetime import timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_

from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserRead, Token
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    decode_access_token,
)
from app.core.config import ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/api/v1/users", tags=["users"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/users/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Decode JWT token, validate, and return the User instance.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_access_token(token)
        username: str = payload.get("sub")
        if not username:
            raise credentials_exception
    except Exception:
        raise credentials_exception

    result = await db.execute(select(User).filter_by(username=username))
    user = result.scalars().first()
    if not user:
        raise credentials_exception
    return user


@router.post(
    "/register",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
async def register_user(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new user with a hashed password.
    """
    # Check for existing username or email
    result = await db.execute(
        select(User).filter(
            (User.username == user_in.username) | (User.email == user_in.email)
        )
    )
    if result.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered",
        )

    user = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.post(
    "/login",
    response_model=Token,
    summary="Obtain JWT access token",
)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    """
    Authenticate user and return a JWT access token.
    """
    result = await db.execute(select(User).filter_by(username=form_data.username))
    user = result.scalars().first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get(
    "/me",
    response_model=UserRead,
    summary="Get current authenticated user",
)
async def read_current_user(
    current_user: User = Depends(get_current_user),
):
    """
    Return the profile of the currently authenticated user.
    """
    return current_user


@router.get(
    "/",
    response_model=List[UserRead],
    summary="List or search users",
)
async def list_users(
    q: Optional[str] = Query(None, description="Filter by username or email"),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return a paginated list of users.
    If `q` is provided, filter by username or email substring.
    """
    stmt = select(User)
    if q:
        pattern = f"%{q}%"
        stmt = stmt.filter(
            or_(
                User.username.ilike(pattern),
                User.email.ilike(pattern),
            )
        )
    stmt = stmt.offset(skip).limit(limit)

    result = await db.execute(stmt)
    return result.scalars().all()
