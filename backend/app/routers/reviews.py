import uuid
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from ..database import get_db
from ..models import Product, Review
from ..pagination import Page, PageParams, paginate
from ..schemas import ModerateIn, ReviewAdminOut
from ..security import get_current_admin

admin_router = APIRouter(
    prefix="/api/admin/reviews", tags=["Admin - Reviews"], dependencies=[Depends(get_current_admin)]
)


def refresh_rating(db: Session, product_id: uuid.UUID) -> None:
    avg, count = db.execute(
        select(func.avg(Review.rating), func.count(Review.id)).where(
            Review.product_id == product_id, Review.is_approved.is_(True)
        )
    ).one()
    product = db.get(Product, product_id)
    if product:
        product.rating = round(float(avg or 0), 1)
        product.rating_count = count


def _out(r: Review) -> ReviewAdminOut:
    out = ReviewAdminOut.model_validate(r)
    out.product_name = r.product.name if r.product else None
    return out


@admin_router.get("", response_model=Page[ReviewAdminOut])
def list_reviews(
    params: PageParams = Depends(),
    status: Literal["pending", "approved", "all"] = "pending",
    db: Session = Depends(get_db),
):
    stmt = select(Review).options(joinedload(Review.product))
    if status != "all":
        stmt = stmt.where(Review.is_approved.is_(status == "approved"))
    result = paginate(db, stmt.order_by(Review.created_at.desc()), params)
    result["items"] = [_out(r) for r in result["items"]]
    return result


@admin_router.patch("/{review_id}/moderate", response_model=ReviewAdminOut)
def moderate(review_id: uuid.UUID, data: ModerateIn, db: Session = Depends(get_db)):
    review = db.get(Review, review_id)
    if not review:
        raise HTTPException(404, "Review not found")
    review.is_approved = data.approved
    db.flush()
    refresh_rating(db, review.product_id)
    db.commit()
    return _out(review)


@admin_router.delete("/{review_id}", status_code=204)
def delete(review_id: uuid.UUID, db: Session = Depends(get_db)):
    review = db.get(Review, review_id)
    if not review:
        raise HTTPException(404, "Review not found")
    pid = review.product_id
    db.delete(review)
    db.flush()
    refresh_rating(db, pid)
    db.commit()
