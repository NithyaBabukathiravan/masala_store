from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..config import settings
from ..database import get_db
from ..models import Category, Enquiry, Order, OrderItem, Product, Review
from ..security import get_current_admin

admin_router = APIRouter(
    prefix="/api/admin", tags=["Admin - Dashboard"], dependencies=[Depends(get_current_admin)]
)


@admin_router.get("/dashboard")
def dashboard(db: Session = Depends(get_db)):
    """Admin home page-ku ella numbers-um oru call-la."""
    one = lambda stmt: db.scalar(stmt) or 0  # noqa: E731
    by_status = dict(db.execute(select(Order.status, func.count(Order.id)).group_by(Order.status)).all())
    revenue = one(
        select(func.sum(Order.total)).where(Order.status.in_(["confirmed", "shipped", "delivered"]))
    )

    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    since = today - timedelta(days=6)
    rows = db.execute(
        select(func.date(Order.created_at), func.count(Order.id), func.coalesce(func.sum(Order.total), 0))
        .where(Order.created_at >= since, Order.status != "cancelled")
        .group_by(func.date(Order.created_at))
    ).all()
    daily = {str(d): (c, float(t)) for d, c, t in rows}
    last_7_days = []
    for i in range(7):
        day = (since + timedelta(days=i)).date()
        c, t = daily.get(str(day), (0, 0.0))
        last_7_days.append({"date": str(day), "orders": c, "sales": t})

    top = db.execute(
        select(OrderItem.product_name, func.sum(OrderItem.quantity).label("qty"))
        .join(Order, Order.id == OrderItem.order_id)
        .where(Order.status != "cancelled")
        .group_by(OrderItem.product_name)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(5)
    ).all()

    low = db.execute(
        select(Product.id, Product.name, Product.stock)
        .where(Product.is_active.is_(True), Product.stock <= settings.LOW_STOCK_LIMIT)
        .order_by(Product.stock)
        .limit(8)
    ).all()

    return {
        "totals": {
            "orders": one(select(func.count(Order.id))),
            "revenue": float(revenue),
            "products": one(select(func.count(Product.id))),
            "categories": one(select(func.count(Category.id))),
            "pending_reviews": one(select(func.count(Review.id)).where(Review.is_approved.is_(False))),
            "new_enquiries": one(select(func.count(Enquiry.id)).where(Enquiry.status == "new")),
            "needs_attention": by_status.get("placed", 0) + by_status.get("under_review", 0),
        },
        "orders_by_status": {
            s: by_status.get(s, 0)
            for s in ["placed", "under_review", "confirmed", "shipped", "delivered", "cancelled"]
        },
        "last_7_days": last_7_days,
        "top_products": [{"name": n, "quantity_sold": int(q)} for n, q in top],
        "low_stock": [{"id": str(i), "name": n, "stock": s} for i, n, s in low],
        "low_stock_limit": settings.LOW_STOCK_LIMIT,
    }
