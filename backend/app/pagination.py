from math import ceil
from typing import Generic, TypeVar

from fastapi import Query
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.orm import Session

T = TypeVar("T")


class Page(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    size: int
    pages: int
    has_next: bool
    has_prev: bool


class PageParams:
    """?page=1&size=10 - ella list API-layum idhaiye use pannrom."""

    def __init__(
        self,
        page: int = Query(1, ge=1, description="Page number (1 irundhu start)"),
        size: int = Query(10, ge=1, le=100, description="Oru page-la evlo items"),
    ):
        self.page = page
        self.size = size


def paginate(db: Session, stmt, params: PageParams) -> dict:
    total = db.scalar(select(func.count()).select_from(stmt.order_by(None).subquery())) or 0
    rows = db.scalars(stmt.limit(params.size).offset((params.page - 1) * params.size)).all()
    pages = ceil(total / params.size) if total else 0
    return {
        "items": rows,
        "total": total,
        "page": params.page,
        "size": params.size,
        "pages": pages,
        "has_next": params.page < pages,
        "has_prev": params.page > 1,
    }
