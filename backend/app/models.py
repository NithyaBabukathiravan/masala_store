import enum
import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    JSON, CHAR, Boolean, Column, DateTime, Float, ForeignKey, Integer, Numeric,
    String, Table, Text, func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import TypeDecorator

from .database import Base


class GUID(TypeDecorator):
    """UUID-ah MySQL-la CHAR(36) ah store pannum (Workbench-la padikka easy)."""

    impl = CHAR(36)
    cache_ok = True

    def process_bind_param(self, value, dialect):
        return None if value is None else str(value)

    def process_result_value(self, value, dialect):
        return None if value is None else uuid.UUID(value)


def pk():
    return mapped_column(GUID, primary_key=True, default=uuid.uuid4)


def created():
    return mapped_column(DateTime, server_default=func.now())


class OrderStatus(str, enum.Enum):
    placed = "placed"
    under_review = "under_review"
    confirmed = "confirmed"
    shipped = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"


class Admin(Base):
    __tablename__ = "admins"
    id: Mapped[uuid.UUID] = pk()
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(150), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = created()


class Category(Base):
    __tablename__ = "categories"
    id: Mapped[uuid.UUID] = pk()
    name: Mapped[str] = mapped_column(String(100), unique=True)
    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    image: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = created()
    products = relationship("Product", back_populates="category")


class Product(Base):
    __tablename__ = "products"
    id: Mapped[uuid.UUID] = pk()
    name: Mapped[str] = mapped_column(String(150), index=True)
    slug: Mapped[str] = mapped_column(String(180), unique=True, index=True)
    category_id: Mapped[uuid.UUID] = mapped_column(GUID, ForeignKey("categories.id"), index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    original_price: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    image: Mapped[str | None] = mapped_column(String(255), nullable=True)
    stock: Mapped[int] = mapped_column(Integer, default=0)
    spice_level: Mapped[str | None] = mapped_column(String(20), nullable=True)
    net_weight: Mapped[str | None] = mapped_column(String(40), nullable=True)
    shelf_life: Mapped[str | None] = mapped_column(String(60), nullable=True)
    ingredients: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    rating: Mapped[float] = mapped_column(Float, default=0)
    rating_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = created()

    category = relationship("Category", back_populates="products")
    images = relationship("ProductImage", cascade="all, delete-orphan", order_by="ProductImage.position")
    reviews = relationship("Review", cascade="all, delete-orphan")


class ProductImage(Base):
    __tablename__ = "product_images"
    id: Mapped[uuid.UUID] = pk()
    product_id: Mapped[uuid.UUID] = mapped_column(GUID, ForeignKey("products.id", ondelete="CASCADE"), index=True)
    url: Mapped[str] = mapped_column(String(255))
    position: Mapped[int] = mapped_column(Integer, default=0)


class Review(Base):
    __tablename__ = "reviews"
    id: Mapped[uuid.UUID] = pk()
    product_id: Mapped[uuid.UUID] = mapped_column(GUID, ForeignKey("products.id", ondelete="CASCADE"), index=True)
    customer_name: Mapped[str] = mapped_column(String(100))
    rating: Mapped[int] = mapped_column(Integer)
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_approved: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    created_at: Mapped[datetime] = created()
    product = relationship("Product", back_populates="reviews")


recipe_products = Table(
    "recipe_products",
    Base.metadata,
    Column("recipe_id", GUID, ForeignKey("recipes.id", ondelete="CASCADE"), primary_key=True),
    Column("product_id", GUID, ForeignKey("products.id", ondelete="CASCADE"), primary_key=True),
)


class Recipe(Base):
    __tablename__ = "recipes"
    id: Mapped[uuid.UUID] = pk()
    title: Mapped[str] = mapped_column(String(150))
    slug: Mapped[str] = mapped_column(String(180), unique=True, index=True)
    image: Mapped[str | None] = mapped_column(String(255), nullable=True)
    cook_time: Mapped[str | None] = mapped_column(String(40), nullable=True)
    servings: Mapped[str | None] = mapped_column(String(40), nullable=True)
    ingredients: Mapped[list] = mapped_column(JSON, default=list)
    steps: Mapped[list] = mapped_column(JSON, default=list)
    is_published: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = created()
    products = relationship("Product", secondary=recipe_products)


class Coupon(Base):
    __tablename__ = "coupons"
    id: Mapped[uuid.UUID] = pk()
    code: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    description: Mapped[str | None] = mapped_column(String(200), nullable=True)
    discount_type: Mapped[str] = mapped_column(String(10), default="percent")  # percent | flat
    value: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    min_order: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)
    max_discount: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    usage_limit: Mapped[int | None] = mapped_column(Integer, nullable=True)
    used_count: Mapped[int] = mapped_column(Integer, default=0)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = created()


class Order(Base):
    __tablename__ = "orders"
    id: Mapped[uuid.UUID] = pk()
    order_number: Mapped[str] = mapped_column(String(30), unique=True, index=True)
    customer_name: Mapped[str] = mapped_column(String(120))
    phone: Mapped[str] = mapped_column(String(15), index=True)
    email: Mapped[str | None] = mapped_column(String(150), nullable=True)
    address: Mapped[str] = mapped_column(Text)
    city: Mapped[str] = mapped_column(String(80))
    pincode: Mapped[str] = mapped_column(String(10))
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    admin_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    coupon_code: Mapped[str | None] = mapped_column(String(40), nullable=True)
    subtotal: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)
    discount: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)
    shipping_fee: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)
    total: Mapped[Decimal] = mapped_column(Numeric(10, 2), default=0)
    status: Mapped[str] = mapped_column(String(20), default=OrderStatus.placed.value, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    items = relationship("OrderItem", cascade="all, delete-orphan")
    history = relationship(
        "OrderHistory", cascade="all, delete-orphan", order_by="OrderHistory.created_at"
    )

    @property
    def item_count(self) -> int:
        return sum(i.quantity for i in self.items)


class OrderItem(Base):
    """Product name + price snapshot - later product price maariyum order amount maaradhu."""

    __tablename__ = "order_items"
    id: Mapped[uuid.UUID] = pk()
    order_id: Mapped[uuid.UUID] = mapped_column(GUID, ForeignKey("orders.id", ondelete="CASCADE"), index=True)
    product_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID, ForeignKey("products.id", ondelete="SET NULL"), nullable=True
    )
    product_name: Mapped[str] = mapped_column(String(150))
    unit_price: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    quantity: Mapped[int] = mapped_column(Integer)

    @property
    def line_total(self) -> Decimal:
        return self.unit_price * self.quantity


class OrderHistory(Base):
    """Order timeline - customer track page-layum admin page-layum kaattalaam."""

    __tablename__ = "order_history"
    id: Mapped[uuid.UUID] = pk()
    order_id: Mapped[uuid.UUID] = mapped_column(GUID, ForeignKey("orders.id", ondelete="CASCADE"), index=True)
    status: Mapped[str] = mapped_column(String(20))
    note: Mapped[str | None] = mapped_column(String(300), nullable=True)
    created_at: Mapped[datetime] = created()


class Enquiry(Base):
    __tablename__ = "enquiries"
    id: Mapped[uuid.UUID] = pk()
    kind: Mapped[str] = mapped_column(String(10), index=True)  # bulk | export | contact
    name: Mapped[str] = mapped_column(String(120))
    company: Mapped[str | None] = mapped_column(String(150), nullable=True)
    email: Mapped[str | None] = mapped_column(String(150), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    subject: Mapped[str | None] = mapped_column(String(200), nullable=True)
    quantity: Mapped[str | None] = mapped_column(String(80), nullable=True)
    message: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(15), default="new", index=True)  # new | contacted | closed
    created_at: Mapped[datetime] = created()
