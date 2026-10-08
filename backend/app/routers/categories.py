import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Category, Product
from ..pagination import Page, PageParams, paginate
from ..schemas import CategoryIn, CategoryOut, CategoryUpdate
from ..security import get_current_admin
from ..utils import unique_slug

router = APIRouter(prefix="/api/categories", tags=["Categories"])
admin_router = APIRouter(
    prefix="/api/admin/categories", tags=["Admin - Categories"], dependencies=[Depends(get_current_admin)]
)


def _with_counts(db: Session, stmt):
    counts = (
        select(Product.category_id, func.count(Product.id).label("n"))
        .where(Product.is_active.is_(True))
        .group_by(Product.category_id)
        .subquery()
    )
    return stmt.add_columns(func.coalesce(counts.c.n, 0)).outerjoin(counts, counts.c.category_id == Category.id)


def _out(cat: Category, n: int) -> CategoryOut:
    out = CategoryOut.model_validate(cat)
    out.product_count = n
    return out


@router.get("", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    rows = db.execute(_with_counts(db, select(Category).order_by(Category.name))).all()
    return [_out(c, n) for c, n in rows]


@admin_router.get("", response_model=Page[CategoryOut])
def admin_list(
    params: PageParams = Depends(),
    search: str | None = Query(None),
    db: Session = Depends(get_db),
):
    stmt = select(Category)
    if search:
        stmt = stmt.where(Category.name.like(f"%{search}%"))
    result = paginate(db, stmt.order_by(Category.name), params)
    counts = dict(
        db.execute(select(Product.category_id, func.count(Product.id)).group_by(Product.category_id)).all()
    )
    result["items"] = [_out(c, counts.get(c.id, 0)) for c in result["items"]]
    return result


@admin_router.post("", response_model=CategoryOut, status_code=201)
def create(data: CategoryIn, db: Session = Depends(get_db)):
    if db.scalar(select(Category.id).where(func.lower(Category.name) == data.name.lower())):
        raise HTTPException(409, "Category already exists")
    cat = Category(
        name=data.name.strip(),
        slug=unique_slug(db, Category, data.slug or data.name),
        description=data.description,
        image=data.image,
    )
    db.add(cat)
    db.commit()
    return _out(cat, 0)


@admin_router.put("/{category_id}", response_model=CategoryOut)
def update(category_id: uuid.UUID, data: CategoryUpdate, db: Session = Depends(get_db)):
    cat = db.get(Category, category_id)
    if not cat:
        raise HTTPException(404, "Category not found")
    changes = data.model_dump(exclude_unset=True)
    if "slug" in changes and changes["slug"]:
        changes["slug"] = unique_slug(db, Category, changes["slug"], cat.id)
    for k, v in changes.items():
        setattr(cat, k, v)
    db.commit()
    n = db.scalar(select(func.count(Product.id)).where(Product.category_id == cat.id)) or 0
    return _out(cat, n)


@admin_router.delete("/{category_id}", status_code=204)
def delete(category_id: uuid.UUID, db: Session = Depends(get_db)):
    cat = db.get(Category, category_id)
    if not cat:
        raise HTTPException(404, "Category not found")
    if db.scalar(select(func.count(Product.id)).where(Product.category_id == cat.id)):
        raise HTTPException(409, "Category-la products irukku. Mudhalla andha products-ah move/delete pannunga.")
    db.delete(cat)
    db.commit()
