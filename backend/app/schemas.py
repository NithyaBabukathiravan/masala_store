import uuid
from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, computed_field

from .models import OrderStatus


class ORM(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ---------- Auth ----------
class LoginIn(BaseModel):
    email: EmailStr
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AdminOut(ORM):
    id: uuid.UUID
    name: str
    email: str


# ---------- Category ----------
class CategoryIn(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    slug: str | None = None
    description: str | None = None
    image: str | None = None


class CategoryUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=100)
    slug: str | None = None
    description: str | None = None
    image: str | None = None


class CategoryMini(ORM):
    id: uuid.UUID
    name: str
    slug: str


class CategoryOut(CategoryMini):
    description: str | None = None
    image: str | None = None
    product_count: int = 0


# ---------- Product ----------
class ProductImageOut(ORM):
    id: uuid.UUID
    url: str
    position: int


class ProductIn(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    slug: str | None = None
    category_id: uuid.UUID
    description: str | None = None
    price: Decimal = Field(gt=0)
    original_price: Decimal | None = Field(None, gt=0)
    image: str | None = None
    stock: int = Field(0, ge=0)
    spice_level: Literal["Mild", "Medium", "Spicy"] | None = None
    net_weight: str | None = None
    shelf_life: str | None = None
    ingredients: str | None = None
    is_featured: bool = False
    is_active: bool = True
    gallery: list[str] = []


class ProductUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=150)
    slug: str | None = None
    category_id: uuid.UUID | None = None
    description: str | None = None
    price: Decimal | None = Field(None, gt=0)
    original_price: Decimal | None = Field(None, gt=0)
    image: str | None = None
    stock: int | None = Field(None, ge=0)
    spice_level: Literal["Mild", "Medium", "Spicy"] | None = None
    net_weight: str | None = None
    shelf_life: str | None = None
    ingredients: str | None = None
    is_featured: bool | None = None
    is_active: bool | None = None
    gallery: list[str] | None = None


class StockIn(BaseModel):
    stock: int | None = Field(None, ge=0, description="Exact stock set panna")
    add: int | None = Field(None, description="+/- adjust panna (e.g. 20 or -5)")


class ProductOut(ORM):
    id: uuid.UUID
    name: str
    slug: str
    description: str | None
    price: Decimal
    original_price: Decimal | None
    image: str | None
    stock: int
    spice_level: str | None
    net_weight: str | None
    shelf_life: str | None
    ingredients: str | None
    is_featured: bool
    is_active: bool
    rating: float
    rating_count: int
    category: CategoryMini
    images: list[ProductImageOut] = []
    created_at: datetime

    @computed_field
    @property
    def discount_percent(self) -> int:
        if self.original_price and self.original_price > self.price:
            return int(round((self.original_price - self.price) / self.original_price * 100))
        return 0

    @computed_field
    @property
    def in_stock(self) -> bool:
        return self.stock > 0


# ---------- Review ----------
class ReviewIn(BaseModel):
    customer_name: str = Field(min_length=2, max_length=100)
    rating: int = Field(ge=1, le=5)
    comment: str | None = Field(None, max_length=1000)


class ReviewOut(ORM):
    id: uuid.UUID
    product_id: uuid.UUID
    customer_name: str
    rating: int
    comment: str | None
    is_approved: bool
    created_at: datetime


class ReviewAdminOut(ReviewOut):
    product_name: str | None = None


class ModerateIn(BaseModel):
    approved: bool


# ---------- Recipe ----------
class ProductLite(ORM):
    id: uuid.UUID
    name: str
    slug: str
    price: Decimal
    image: str | None


class RecipeIn(BaseModel):
    title: str = Field(min_length=2, max_length=150)
    slug: str | None = None
    image: str | None = None
    cook_time: str | None = None
    servings: str | None = None
    ingredients: list[str] = []
    steps: list[str] = []
    is_published: bool = True
    product_ids: list[uuid.UUID] = []


class RecipeUpdate(BaseModel):
    title: str | None = None
    slug: str | None = None
    image: str | None = None
    cook_time: str | None = None
    servings: str | None = None
    ingredients: list[str] | None = None
    steps: list[str] | None = None
    is_published: bool | None = None
    product_ids: list[uuid.UUID] | None = None


class RecipeOut(ORM):
    id: uuid.UUID
    title: str
    slug: str
    image: str | None
    cook_time: str | None
    servings: str | None
    ingredients: list[str]
    steps: list[str]
    is_published: bool
    products: list[ProductLite] = []


# ---------- Coupon ----------
class CouponIn(BaseModel):
    code: str = Field(min_length=3, max_length=40)
    description: str | None = None
    discount_type: Literal["percent", "flat"] = "percent"
    value: Decimal = Field(gt=0)
    min_order: Decimal = Field(0, ge=0)
    max_discount: Decimal | None = Field(None, gt=0)
    usage_limit: int | None = Field(None, ge=1)
    expires_at: datetime | None = None
    is_active: bool = True


class CouponUpdate(BaseModel):
    description: str | None = None
    discount_type: Literal["percent", "flat"] | None = None
    value: Decimal | None = Field(None, gt=0)
    min_order: Decimal | None = Field(None, ge=0)
    max_discount: Decimal | None = None
    usage_limit: int | None = None
    expires_at: datetime | None = None
    is_active: bool | None = None


class CouponOut(ORM):
    id: uuid.UUID
    code: str
    description: str | None
    discount_type: str
    value: Decimal
    min_order: Decimal
    max_discount: Decimal | None
    usage_limit: int | None
    used_count: int
    expires_at: datetime | None
    is_active: bool
    created_at: datetime


class CouponCheckOut(BaseModel):
    code: str
    valid: bool = True
    discount: Decimal
    message: str


# ---------- Orders ----------
class OrderItemIn(BaseModel):
    product_id: uuid.UUID
    quantity: int = Field(ge=1, le=100)


class OrderCreate(BaseModel):
    customer_name: str = Field(min_length=2, max_length=120)
    phone: str = Field(pattern=r"^\d{10}$", description="10-digit mobile number")
    email: EmailStr | None = None
    address: str = Field(min_length=5)
    city: str = Field(min_length=2, max_length=80)
    pincode: str = Field(pattern=r"^\d{6}$")
    notes: str | None = Field(None, max_length=500)
    coupon_code: str | None = None
    items: list[OrderItemIn] = Field(min_length=1)


class OrderItemOut(ORM):
    id: uuid.UUID
    product_id: uuid.UUID | None
    product_name: str
    unit_price: Decimal
    quantity: int
    line_total: Decimal


class HistoryOut(ORM):
    status: str
    note: str | None
    created_at: datetime


class OrderPublic(ORM):
    id: uuid.UUID
    order_number: str
    customer_name: str
    phone: str
    email: str | None
    address: str
    city: str
    pincode: str
    notes: str | None
    coupon_code: str | None
    subtotal: Decimal
    discount: Decimal
    shipping_fee: Decimal
    total: Decimal
    status: str
    created_at: datetime
    items: list[OrderItemOut]
    history: list[HistoryOut]


class OrderOut(OrderPublic):
    admin_note: str | None = None
    updated_at: datetime | None = None


class OrderListOut(ORM):
    id: uuid.UUID
    order_number: str
    customer_name: str
    phone: str
    city: str
    total: Decimal
    status: str
    item_count: int
    created_at: datetime


class OrderItemsUpdate(BaseModel):
    items: list[OrderItemIn] = Field(min_length=1)
    note: str | None = Field(None, max_length=300)


class StatusUpdate(BaseModel):
    status: OrderStatus
    note: str | None = Field(None, max_length=300)
    admin_note: str | None = None


# ---------- Enquiry ----------
class EnquiryIn(BaseModel):
    kind: Literal["bulk", "export", "contact"] = "contact"
    name: str = Field(min_length=2, max_length=120)
    company: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    subject: str | None = None
    quantity: str | None = None
    message: str | None = Field(None, max_length=2000)


class EnquiryOut(ORM):
    id: uuid.UUID
    kind: str
    name: str
    company: str | None
    email: str | None
    phone: str | None
    subject: str | None
    quantity: str | None
    message: str | None
    status: str
    created_at: datetime


class EnquiryStatusIn(BaseModel):
    status: Literal["new", "contacted", "closed"]
