from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Admin
from ..ratelimit import rate_limit
from ..schemas import AdminOut, LoginIn, TokenOut
from ..security import create_access_token, get_current_admin, verify_password

router = APIRouter(prefix="/api/admin", tags=["Admin Auth"])


def _login(db: Session, email: str, password: str) -> TokenOut:
    admin = db.scalar(select(Admin).where(Admin.email == email.lower().strip()))
    if not admin or not admin.is_active or not verify_password(password, admin.hashed_password):
        raise HTTPException(401, "Wrong email or password")
    return TokenOut(access_token=create_access_token(admin.id))


@router.post("/login", response_model=TokenOut, dependencies=[Depends(rate_limit(10, 60))])
def login(data: LoginIn, db: Session = Depends(get_db)):
    """React admin app use pannum JSON login."""
    return _login(db, data.email, data.password)


@router.post("/token", response_model=TokenOut, include_in_schema=True)
def swagger_token(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Swagger-la 'Authorize' button-ku (username = email)."""
    return _login(db, form.username, form.password)


@router.get("/me", response_model=AdminOut)
def me(admin: Admin = Depends(get_current_admin)):
    return admin
