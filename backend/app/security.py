import uuid
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from .config import settings
from .database import get_db
from .models import Admin

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/admin/token", auto_error=False)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode()[:72], bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode()[:72], hashed.encode())
    except ValueError:
        return False


def create_access_token(admin_id: uuid.UUID) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(
        {"sub": str(admin_id), "exp": expire}, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )


def get_current_admin(
    token: str | None = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> Admin:
    err = HTTPException(
        status.HTTP_401_UNAUTHORIZED,
        "Login required",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise err
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        admin = db.get(Admin, uuid.UUID(payload["sub"]))
    except (jwt.PyJWTError, KeyError, ValueError):
        raise err
    if not admin or not admin.is_active:
        raise err
    return admin
