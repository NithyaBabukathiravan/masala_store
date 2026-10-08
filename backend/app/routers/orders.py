import uuid
from datetime import date, datetime, time
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from .. import services
from ..database import get_db
from ..models import Order, OrderStatus
from ..pagination import Page, PageParams, paginate
from ..ratelimit import rate_limit
from ..schemas import (
    CouponCheckOut, OrderCreate, OrderItemsUpdate, OrderListOut, OrderOut, OrderPublic, StatusUpdate,
)
from ..security import get_current_admin

router = APIRouter(prefix="/api", tags=["Orders (customer)"])
admin_router = APIRouter(
    prefix="/api/admin/orders", tags=["Admin - Orders"], dependencies=[Depends(get_current_admin)]
)


# ---------------- Customer ----------------
@router.post(
    "/orders", response_model=OrderPublic, status_code=201,
    dependencies=[Depends(rate_limit(10, 60))],
)
def place_order(data: OrderCreate, db: Session = Depends(get_db)):
    """Login venaam. Payment illa - admin phone/WhatsApp-la confirm pannuvaar."""
    return services.place_order(db, data)


@router.get("/orders/track", response_model=OrderPublic, dependencies=[Depends(rate_limit(20, 60))])
def track_order(
    order_number: str = Query(..., examples=["MW-261008-AB12"]),
    phone: str = Query(..., min_length=10, max_length=10),
    db: Session = Depends(get_db),
):
    order = db.scalar(
        select(Order).where(Order.order_number == order_number.strip().upper(), Order.phone == phone)
    )
    if not order:
        raise HTTPException(404, "Order not found. Order number & phone check pannunga.")
    return order


@router.get("/coupons/validate", response_model=CouponCheckOut)
def validate_coupon(code: str, subtotal: float = Query(..., gt=0), db: Session = Depends(get_db)):
    amount = Decimal(str(subtotal))
    discount = services.coupon_discount(services.find_coupon(db, code), amount)
    return CouponCheckOut(code=code.upper(), discount=discount, message=f"You save Rs. {discount}!")


# ---------------- Admin ----------------
def _get(db: Session, order_id: uuid.UUID) -> Order:
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(404, "Order not found")
    return order


@admin_router.get("", response_model=Page[OrderListOut])
def admin_list(
    params: PageParams = Depends(),
    status: OrderStatus | None = None,
    search: str | None = Query(None, description="Order number / name / phone"),
    date_from: date | None = None,
    date_to: date | None = None,
    db: Session = Depends(get_db),
):
    stmt = select(Order).options(selectinload(Order.items))
    if status:
        stmt = stmt.where(Order.status == status.value)
    if search:
        like = f"%{search}%"
        stmt = stmt.where(
            Order.order_number.like(like) | Order.customer_name.like(like) | Order.phone.like(like)
        )
    if date_from:
        stmt = stmt.where(Order.created_at >= datetime.combine(date_from, time.min))
    if date_to:
        stmt = stmt.where(Order.created_at <= datetime.combine(date_to, time.max))
    return paginate(db, stmt.order_by(Order.created_at.desc()), params)


@admin_router.get("/{order_id}", response_model=OrderOut)
def admin_get(order_id: uuid.UUID, db: Session = Depends(get_db)):
    return _get(db, order_id)


@admin_router.patch("/{order_id}/items", response_model=OrderOut)
def edit_items(order_id: uuid.UUID, data: OrderItemsUpdate, db: Session = Depends(get_db)):
    """Admin line items add/adjust pannalaam (shipped aagura varaikkum)."""
    return services.edit_items(db, _get(db, order_id), data.items, data.note)


@admin_router.patch("/{order_id}/status", response_model=OrderOut)
def change_status(order_id: uuid.UUID, data: StatusUpdate, db: Session = Depends(get_db)):
    return services.change_status(db, _get(db, order_id), data.status.value, data.note, data.admin_note)
