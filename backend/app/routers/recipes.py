import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from ..database import get_db
from ..models import Product, Recipe
from ..pagination import Page, PageParams, paginate
from ..schemas import RecipeIn, RecipeOut, RecipeUpdate
from ..security import get_current_admin
from ..utils import parse_uuid, unique_slug

router = APIRouter(prefix="/api/recipes", tags=["Recipes"])
admin_router = APIRouter(
    prefix="/api/admin/recipes", tags=["Admin - Recipes"], dependencies=[Depends(get_current_admin)]
)


def _base():
    return select(Recipe).options(selectinload(Recipe.products))


def _products(db: Session, ids: list[uuid.UUID]) -> list[Product]:
    found = list(db.scalars(select(Product).where(Product.id.in_(ids)))) if ids else []
    if len(found) != len(set(ids)):
        raise HTTPException(400, "Some product_ids are invalid")
    return found


@router.get("", response_model=Page[RecipeOut])
def list_recipes(
    params: PageParams = Depends(), search: str | None = Query(None), db: Session = Depends(get_db)
):
    stmt = _base().where(Recipe.is_published.is_(True))
    if search:
        stmt = stmt.where(Recipe.title.like(f"%{search}%"))
    return paginate(db, stmt.order_by(Recipe.created_at.desc()), params)


@router.get("/{key}", response_model=RecipeOut)
def get_recipe(key: str, db: Session = Depends(get_db)):
    rid = parse_uuid(key)
    stmt = _base().where(Recipe.id == rid if rid else Recipe.slug == key)
    recipe = db.scalars(stmt).first()
    if not recipe or not recipe.is_published:
        raise HTTPException(404, "Recipe not found")
    return recipe


@admin_router.get("", response_model=Page[RecipeOut])
def admin_list(params: PageParams = Depends(), search: str | None = None, db: Session = Depends(get_db)):
    stmt = _base()
    if search:
        stmt = stmt.where(Recipe.title.like(f"%{search}%"))
    return paginate(db, stmt.order_by(Recipe.created_at.desc()), params)


@admin_router.post("", response_model=RecipeOut, status_code=201)
def create(data: RecipeIn, db: Session = Depends(get_db)):
    fields = data.model_dump(exclude={"product_ids", "slug"})
    recipe = Recipe(**fields, slug=unique_slug(db, Recipe, data.slug or data.title))
    recipe.products = _products(db, data.product_ids)
    db.add(recipe)
    db.commit()
    db.refresh(recipe)
    return recipe


@admin_router.put("/{recipe_id}", response_model=RecipeOut)
def update(recipe_id: uuid.UUID, data: RecipeUpdate, db: Session = Depends(get_db)):
    recipe = db.scalars(_base().where(Recipe.id == recipe_id)).first()
    if not recipe:
        raise HTTPException(404, "Recipe not found")
    changes = data.model_dump(exclude_unset=True)
    ids = changes.pop("product_ids", None)
    if changes.get("slug"):
        changes["slug"] = unique_slug(db, Recipe, changes["slug"], recipe.id)
    else:
        changes.pop("slug", None)
    for k, v in changes.items():
        setattr(recipe, k, v)
    if ids is not None:
        recipe.products = _products(db, ids)
    db.commit()
    db.refresh(recipe)
    return recipe


@admin_router.delete("/{recipe_id}", status_code=204)
def delete(recipe_id: uuid.UUID, db: Session = Depends(get_db)):
    recipe = db.get(Recipe, recipe_id)
    if not recipe:
        raise HTTPException(404, "Recipe not found")
    db.delete(recipe)
    db.commit()
