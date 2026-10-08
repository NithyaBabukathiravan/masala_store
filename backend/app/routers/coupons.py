import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Coupon
from ..pagination import Page, PageParams, paginate
from ..schemas import CouponIn, CouponOut, CouponUpdate
from ..security import get_current_admin

admin_router = APIRouter(
    prefix="/api/admin/coupons", tags=["Admin - Coupons"], dependencies=[Depends(get_current_admin)]
)


@admin_router.get("", response_model=Page[CouponOut])
def list_coupons(
    params: PageParams = Depends(),
    search: str | None = None,
    is_active: bool | None = Query(None),
    db: Session = Depends(get_db),
):
    stmt = select(Coupon)
    if search:
        stmt = stmt.where(Coupon.code.like(f"%{search.upper()}%"))
    if is_active is not None:
        stmt = stmt.where(Coupon.is_active.is_(is_active))
    return paginate(db, stmt.order_by(Coupon.created_at.desc()), params)


@admin_router.post("", response_model=CouponOut, status_code=201)
def create(data: CouponIn, db: Session = Depends(get_db)):
    code = data.code.strip().upper()
    if db.scalar(select(Coupon.id).where(Coupon.code == code)):
        raise HTTPException(409, "Coupon code already exists")
    if data.discount_type == "percent" and data.value > 100:
        raise HTTPException(400, "Percent discount cannot be more than 100")
    coupon = Coupon(**{**data.model_dump(), "code": code})
    db.add(coupon)
    db.commit()
    db.refresh(coupon)
    return coupon


@admin_router.put("/{coupon_id}", response_model=CouponOut)
def update(coupon_id: uuid.UUID, data: CouponUpdate, db: Session = Depends(get_db)):
    coupon = db.get(Coupon, coupon_id)
    if not coupon:
        raise HTTPException(404, "Coupon not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(coupon, k, v)
    db.commit()
    db.refresh(coupon)
    return coupon


@admin_router.delete("/{coupon_id}", status_code=204)
def delete(coupon_id: uuid.UUID, db: Session = Depends(get_db)):
    coupon = db.get(Coupon, coupon_id)
    if not coupon:
        raise HTTPException(404, "Coupon not found")
    db.delete(coupon)
    db.commit()
