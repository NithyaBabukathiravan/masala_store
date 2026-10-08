from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import select

from .config import settings
from .database import Base, SessionLocal, engine, ensure_database
from .models import Admin
from .routers import (
    auth, categories, coupons, dashboard, enquiries, orders, products, recipes, reviews, uploads,
)
from .security import hash_password


def ensure_admin() -> None:
    with SessionLocal() as db:
        if db.scalar(select(Admin.id).limit(1)) is None:
            db.add(
                Admin(
                    name=settings.ADMIN_NAME,
                    email=settings.ADMIN_EMAIL.lower(),
                    hashed_password=hash_password(settings.ADMIN_PASSWORD),
                )
            )
            db.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    ensure_database()
    Base.metadata.create_all(bind=engine)
    ensure_admin()
    yield


settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(
    title="Masala World API",
    version="1.0.0",
    description=(
        "Masala & Spices e-commerce backend - FastAPI + MySQL.\n\n"
        "- Customer APIs: `/api/...` (login venaam)\n"
        "- Admin APIs: `/api/admin/...` (JWT - Authorize button use pannunga)\n"
        "- Ella list APIs-layum `?page=1&size=10` pagination irukku."
    ),
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

app.include_router(auth.router)
app.include_router(dashboard.admin_router)
app.include_router(uploads.admin_router)
for module in (categories, products, recipes, orders, enquiries):
    app.include_router(module.router)
    app.include_router(module.admin_router)
app.include_router(coupons.admin_router)
app.include_router(reviews.admin_router)


@app.get("/", tags=["Health"])
def root():
    return {"app": "Masala World API", "status": "running", "docs": "/docs"}


@app.get("/api/config", tags=["Health"])
def store_config():
    """Frontend-ku: free shipping progress bar-ku thevaiyana values."""
    return {
        "free_shipping_above": float(settings.FREE_SHIPPING_ABOVE),
        "shipping_fee": float(settings.SHIPPING_FEE),
        "currency": "INR",
    }
