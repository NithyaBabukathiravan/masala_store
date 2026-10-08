import re
import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session


def slugify(text: str) -> str:
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text.strip().lower()).strip("-")
    return text or "item"


def unique_slug(db: Session, model, base: str, exclude_id: uuid.UUID | None = None) -> str:
    base = slugify(base)
    slug, n = base, 2
    while True:
        stmt = select(model.id).where(model.slug == slug)
        if exclude_id:
            stmt = stmt.where(model.id != exclude_id)
        if db.scalar(stmt) is None:
            return slug
        slug = f"{base}-{n}"
        n += 1


def parse_uuid(value: str) -> uuid.UUID | None:
    try:
        return uuid.UUID(value)
    except ValueError:
        return None
