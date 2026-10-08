import uuid
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Enquiry
from ..pagination import Page, PageParams, paginate
from ..ratelimit import rate_limit
from ..schemas import EnquiryIn, EnquiryOut, EnquiryStatusIn
from ..security import get_current_admin

router = APIRouter(prefix="/api/enquiries", tags=["Enquiries"])
admin_router = APIRouter(
    prefix="/api/admin/enquiries", tags=["Admin - Enquiries"], dependencies=[Depends(get_current_admin)]
)


@router.post("", response_model=EnquiryOut, status_code=201, dependencies=[Depends(rate_limit(5, 60))])
def create(data: EnquiryIn, db: Session = Depends(get_db)):
    """Bulk / Export / Contact form - moonum idhe endpoint (kind field-ala veru paduthum)."""
    if not data.email and not data.phone:
        raise HTTPException(400, "Email illa phone - onnu kudunga, namma contact panna")
    enquiry = Enquiry(**data.model_dump())
    db.add(enquiry)
    db.commit()
    db.refresh(enquiry)
    return enquiry


@admin_router.get("", response_model=Page[EnquiryOut])
def list_enquiries(
    params: PageParams = Depends(),
    kind: Literal["bulk", "export", "contact"] | None = None,
    status: Literal["new", "contacted", "closed"] | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
):
    stmt = select(Enquiry)
    if kind:
        stmt = stmt.where(Enquiry.kind == kind)
    if status:
        stmt = stmt.where(Enquiry.status == status)
    if search:
        like = f"%{search}%"
        stmt = stmt.where(Enquiry.name.like(like) | Enquiry.company.like(like) | Enquiry.phone.like(like))
    return paginate(db, stmt.order_by(Enquiry.created_at.desc()), params)


@admin_router.patch("/{enquiry_id}/status", response_model=EnquiryOut)
def set_status(enquiry_id: uuid.UUID, data: EnquiryStatusIn, db: Session = Depends(get_db)):
    enquiry = db.get(Enquiry, enquiry_id)
    if not enquiry:
        raise HTTPException(404, "Enquiry not found")
    enquiry.status = data.status
    db.commit()
    db.refresh(enquiry)
    return enquiry


@admin_router.delete("/{enquiry_id}", status_code=204)
def delete(enquiry_id: uuid.UUID, db: Session = Depends(get_db)):
    enquiry = db.get(Enquiry, enquiry_id)
    if not enquiry:
        raise HTTPException(404, "Enquiry not found")
    db.delete(enquiry)
    db.commit()
