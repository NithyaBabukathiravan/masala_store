import uuid
from decimal import Decimal
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload, selectinload

from ..config import settings
from ..database import get_db
from ..models import Category, Product, ProductImage, Review
from ..pagination import Page, PageParams, paginate
from ..ratelimit import rate_limit
from ..schemas import ProductIn, ProductOut, ProductUpdate, ReviewIn, ReviewOut, StockIn
from ..security import get_current_admin
from ..utils import parse_uuid, unique_slug

router = APIRouter(prefix="/api/products", tags=["Products"])
admin_router = APIRouter(
    prefix="/api/admin/products", tags=["Admin - Products"], dependencies=[Depends(get_current_admin)]
)

SORTS = {
    "newest": Product.created_at.desc(),
    "price_asc": Product.price.asc(),
    "price_desc": Product.price.desc(),
    "rating": Product.rating.desc(),
    "name": Product.name.asc(),
}


def _base():
    return select(Product).options(joinedload(Product.category), selectinload(Product.images))


def _filter(stmt, search, category, min_price, max_price, spice_level, featured, in_stock):
    if search:
        like = f"%{search}%"
        stmt = stmt.where(Product.name.like(like) | Product.description.like(like))
    if category:
        stmt = stmt.where(Product.category.has(Category.slug == category))
    if min_price is not None:
        stmt = stmt.where(Product.price >= min_price)
    if max_price is not None:
        stmt = stmt.where(Product.price <= max_price)
    if spice_level:
        stmt = stmt.where(Product.spice_level == spice_level)
    if featured is not None:
        stmt = stmt.where(Product.is_featured.is_(featured))
    if in_stock:
        stmt = stmt.where(Product.stock > 0)
    return stmt


def _get(db: Session, key: str, only_active: bool = True) -> Product:
    pid = parse_uuid(key)
    stmt = _base().where(Product.id == pid if pid else Product.slug == key)
    if only_active:
        stmt = stmt.where(Product.is_active.is_(True))
    product = db.scalars(stmt).first()
    if not product:
        raise HTTPException(404, "Product not found")
    return product


def _set_gallery(product: Product, urls: list[str]) -> None:
    product.images.clear()
    for i, url in enumerate(urls):
        product.images.append(ProductImage(url=url, position=i))


# ---------------- Public ----------------
@router.get("", response_model=Page[ProductOut])
def list_products(
    params: PageParams = Depends(),
    search: str | None = Query(None, description="Name / description search"),
    category: str | None = Query(None, description="Category slug"),
    min_price: Decimal | None = Query(None, ge=0),
    max_price: Decimal | None = Query(None, ge=0),
    spice_level: Literal["Mild", "Medium", "Spicy"] | None = None,
    featured: bool | None = None,
    in_stock: bool = False,
    sort: Literal["newest", "price_asc", "price_desc", "rating", "name"] = "newest",
    db: Session = Depends(get_db),
):
    stmt = _filter(
        _base().where(Product.is_active.is_(True)),
        search, category, min_price, max_price, spice_level, featured, in_stock,
    )
    return paginate(db, stmt.order_by(SORTS[sort], Product.id), params)


@router.get("/{key}", response_model=ProductOut)
def get_product(key: str, db: Session = Depends(get_db)):
    """key = UUID illa slug (e.g. /api/products/garam-masala)."""
    return _get(db, key)


@router.get("/{key}/related", response_model=list[ProductOut])
def related(key: str, limit: int = Query(4, ge=1, le=12), db: Session = Depends(get_db)):
    """'Complete the meal' / related products - same category-la irundhu."""
    p = _get(db, key)
    stmt = (
        _base()
        .where(Product.category_id == p.category_id, Product.id != p.id, Product.is_active.is_(True))
        .order_by(Product.rating.desc())
        .limit(limit)
    )
    return db.scalars(stmt).all()


@router.get("/{key}/reviews", response_model=Page[ReviewOut])
def product_reviews(key: str, params: PageParams = Depends(), db: Session = Depends(get_db)):
    p = _get(db, key)
    stmt = select(Review).where(Review.product_id == p.id, Review.is_approved.is_(True))
    return paginate(db, stmt.order_by(Review.created_at.desc()), params)


@router.post(
    "/{key}/reviews", response_model=ReviewOut, status_code=201,
    dependencies=[Depends(rate_limit(5, 60))],
)
def add_review(key: str, data: ReviewIn, db: Session = Depends(get_db)):
    """Review save aagum, but admin approve pannina thaan website-la theriyum."""
    p = _get(db, key)
    review = Review(product_id=p.id, **data.model_dump())
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


# ---------------- Admin ----------------
@admin_router.get("", response_model=Page[ProductOut])
def admin_list(
    params: PageParams = Depends(),
    search: str | None = None,
    category: str | None = None,
    is_active: bool | None = None,
    low_stock: bool = Query(False, description="Stock kammiya irukkura products mattum"),
    sort: Literal["newest", "price_asc", "price_desc", "rating", "name", "stock"] = "newest",
    db: Session = Depends(get_db),
):
    stmt = _filter(_base(), search, category, None, None, None, None, False)
    if is_active is not None:
        stmt = stmt.where(Product.is_active.is_(is_active))
    if low_stock:
        stmt = stmt.where(Product.stock <= settings.LOW_STOCK_LIMIT)
    order = Product.stock.asc() if sort == "stock" else SORTS[sort]
    return paginate(db, stmt.order_by(order, Product.id), params)


@admin_router.get("/{product_id}", response_model=ProductOut)
def admin_get(product_id: uuid.UUID, db: Session = Depends(get_db)):
    return _get(db, str(product_id), only_active=False)


@admin_router.post("", response_model=ProductOut, status_code=201)
def create(data: ProductIn, db: Session = Depends(get_db)):
    if not db.get(Category, data.category_id):
        raise HTTPException(400, "Invalid category_id")
    fields = data.model_dump(exclude={"gallery", "slug"})
    product = Product(**fields, slug=unique_slug(db, Product, data.slug or data.name))
    _set_gallery(product, data.gallery)
    db.add(product)
    db.commit()
    return _get(db, str(product.id), only_active=False)


@admin_router.put("/{product_id}", response_model=ProductOut)
def update(product_id: uuid.UUID, data: ProductUpdate, db: Session = Depends(get_db)):
    product = _get(db, str(product_id), only_active=False)
    changes = data.model_dump(exclude_unset=True)
    gallery = changes.pop("gallery", None)
    if "category_id" in changes and not db.get(Category, changes["category_id"]):
        raise HTTPException(400, "Invalid category_id")
    if changes.get("slug"):
        changes["slug"] = unique_slug(db, Product, changes["slug"], product.id)
    else:
        changes.pop("slug", None)
    for k, v in changes.items():
        setattr(product, k, v)
    if gallery is not None:
        _set_gallery(product, gallery)
    db.commit()
    return _get(db, str(product.id), only_active=False)


@admin_router.patch("/{product_id}/stock", response_model=ProductOut)
def update_stock(product_id: uuid.UUID, data: StockIn, db: Session = Depends(get_db)):
    """Quick stock update: {"stock": 50} (exact) illa {"add": -3} (adjust)."""
    product = _get(db, str(product_id), only_active=False)
    if data.stock is None and data.add is None:
        raise HTTPException(400, "Send 'stock' or 'add'")
    new = data.stock if data.stock is not None else product.stock + (data.add or 0)
    if new < 0:
        raise HTTPException(400, "Stock cannot go below 0")
    product.stock = new
    db.commit()
    return _get(db, str(product.id), only_active=False)


@admin_router.patch("/{product_id}/toggle", response_model=ProductOut)
def toggle_active(product_id: uuid.UUID, db: Session = Depends(get_db)):
    """Show / hide product (delete pannaama)."""
    product = _get(db, str(product_id), only_active=False)
    product.is_active = not product.is_active
    db.commit()
    return _get(db, str(product.id), only_active=False)


@admin_router.delete("/{product_id}", status_code=204)
def delete(product_id: uuid.UUID, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(404, "Product not found")
    db.delete(product)
    db.commit()
