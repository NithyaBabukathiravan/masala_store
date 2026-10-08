import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile

from ..config import settings
from ..security import get_current_admin

admin_router = APIRouter(
    prefix="/api/admin", tags=["Admin - Uploads"], dependencies=[Depends(get_current_admin)]
)
ALLOWED = {".png", ".jpg", ".jpeg", ".webp", ".gif"}


@admin_router.post("/uploads", status_code=201)
async def upload_image(file: UploadFile):
    """Product / recipe image upload. Return aagura url-ah product 'image' field-la podalaam."""
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED:
        raise HTTPException(400, "Only png, jpg, jpeg, webp, gif allowed")
    data = await file.read()
    if len(data) > settings.MAX_UPLOAD_MB * 1024 * 1024:
        raise HTTPException(413, f"File too big (max {settings.MAX_UPLOAD_MB} MB)")
    settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    name = f"{uuid.uuid4().hex}{ext}"
    (settings.UPLOAD_DIR / name).write_bytes(data)
    return {"url": f"/uploads/{name}", "filename": name}
