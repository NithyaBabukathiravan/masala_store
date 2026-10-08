"""Business rules - order pricing, coupon, stock, status flow.
Price eppovum server-la thaan calculate aagum (browser anuppura price-ah nambaradhu)."""
import random
import string
from datetime import datetime
from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from .config import settings
from .models import Coupon, Order, OrderHistory, OrderItem, OrderStatus, Product
from .schemas import OrderCreate, OrderItemIn

Q = Decimal("0.01")

# Placed -> Under Review -> Confirmed -> Shipped -> Delivered  (SRS FR-44)
TRANSITIONS: dict[str, set[str]] = {
    "placed": {"under_review", "cancelled"},
    "under_review": {"confirmed", "cancelled"},
    "confirmed": {"shipped", "cancelled"},
    "shipped": {"delivered"},
    "delivered": set(),
    "cancelled": set(),
}
EDITABLE = {"placed", "under_review", "confirmed"}


# ---------- Coupon ----------
def find_coupon(db: Session, code: str | None) -> Coupon | None:
    if not code:
        return None
    return db.scalar(select(Coupon).where(Coupon.code == code.strip().upper()))


def coupon_discount(coupon: Coupon | None, subtotal: Decimal, check_usage: bool = True) -> Decimal:
    if not coupon or not coupon.is_active:
        raise HTTPException(400, "Invalid coupon code")
    if coupon.expires_at and coupon.expires_at < datetime.now():
        raise HTTPException(400, "Coupon expired")
    if check_usage and coupon.usage_limit is not None and coupon.used_count >= coupon.usage_limit:
        raise HTTPException(400, "Coupon usage limit reached")
    if subtotal < coupon.min_order:
        raise HTTPException(400, f"Minimum order of Rs. {coupon.min_order:.0f} needed for this coupon")
    if coupon.discount_type == "percent":
        d = subtotal * coupon.value / 100
        if coupon.max_discount:
            d = min(d, coupon.max_discount)
    else:
        d = coupon.value
    return min(d, subtotal).quantize(Q)


def shipping_for(subtotal: Decimal) -> Decimal:
    return Decimal("0") if subtotal >= settings.FREE_SHIPPING_ABOVE else settings.SHIPPING_FEE


# ---------- Order helpers ----------
def new_order_number(db: Session) -> str:
    while True:
        tail = "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
        number = f"MW-{datetime.now():%y%m%d}-{tail}"
        if db.scalar(select(Order.id).where(Order.order_number == number)) is None:
            return number


def _merge(items: list[OrderItemIn]) -> dict:
    merged: dict = {}
    for it in items:
        merged[it.product_id] = merged.get(it.product_id, 0) + it.quantity
    return merged


def _apply_lines(db: Session, order: Order, items: list[OrderItemIn]) -> None:
    """Items-ah validate pannitu stock kuraichu order-la set pannum."""
    merged = _merge(items)
    products = {
        p.id: p for p in db.scalars(select(Product).where(Product.id.in_(list(merged))))
    }
    for pid, qty in merged.items():
        p = products.get(pid)
        if not p or not p.is_active:
            raise HTTPException(400, f"Product not available: {pid}")
        if p.stock < qty:
            raise HTTPException(409, f"Only {p.stock} left for '{p.name}'")
    order.items.clear()
    for pid, qty in merged.items():
        p = products[pid]
        p.stock -= qty
        order.items.append(
            OrderItem(product_id=p.id, product_name=p.name, unit_price=p.price, quantity=qty)
        )


def restore_stock(db: Session, order: Order) -> None:
    for it in order.items:
        if it.product_id:
            p = db.get(Product, it.product_id)
            if p:
                p.stock += it.quantity


def recalc(db: Session, order: Order) -> None:
    order.subtotal = sum((i.unit_price * i.quantity for i in order.items), Decimal("0")).quantize(Q)
    order.discount = Decimal("0")
    if order.coupon_code:
        coupon = find_coupon(db, order.coupon_code)
        try:
            order.discount = coupon_discount(coupon, order.subtotal, check_usage=False)
        except HTTPException:
            order.discount = Decimal("0")
    order.shipping_fee = shipping_for(order.subtotal)
    order.total = (order.subtotal - order.discount + order.shipping_fee).quantize(Q)


def log(order: Order, status: str, note: str | None = None) -> None:
    order.history.append(OrderHistory(status=status, note=note))


# ---------- Public flows ----------
def place_order(db: Session, data: OrderCreate) -> Order:
    coupon = find_coupon(db, data.coupon_code)
    order = Order(
        order_number=new_order_number(db),
        customer_name=data.customer_name.strip(),
        phone=data.phone,
        email=data.email,
        address=data.address.strip(),
        city=data.city.strip(),
        pincode=data.pincode,
        notes=data.notes,
        status=OrderStatus.placed.value,
    )
    _apply_lines(db, order, data.items)
    order.subtotal = sum((i.unit_price * i.quantity for i in order.items), Decimal("0"))
    if data.coupon_code:
        coupon_discount(coupon, order.subtotal)  # invalid aanaal 400 throw
        order.coupon_code = coupon.code
        coupon.used_count += 1
    recalc(db, order)
    log(order, "placed", "Order placed by customer")
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


# ---------- Admin flows ----------
def edit_items(db: Session, order: Order, items: list[OrderItemIn], note: str | None) -> Order:
    if order.status not in EDITABLE:
        raise HTTPException(409, f"Order is '{order.status}' - items cannot be edited now")
    restore_stock(db, order)
    _apply_lines(db, order, items)
    recalc(db, order)
    log(order, order.status, note or "Items updated by admin")
    db.commit()
    db.refresh(order)
    return order


def change_status(db: Session, order: Order, new: str, note: str | None, admin_note: str | None) -> Order:
    if new == order.status:
        raise HTTPException(400, f"Order is already '{new}'")
    if new not in TRANSITIONS[order.status]:
        allowed = ", ".join(sorted(TRANSITIONS[order.status])) or "none"
        raise HTTPException(409, f"Cannot move '{order.status}' -> '{new}'. Allowed: {allowed}")
    if new == "cancelled":
        restore_stock(db, order)
        coupon = find_coupon(db, order.coupon_code)
        if coupon and coupon.used_count > 0:
            coupon.used_count -= 1
    order.status = new
    if admin_note is not None:
        order.admin_note = admin_note
    log(order, new, note)
    db.commit()
    db.refresh(order)
    return order
