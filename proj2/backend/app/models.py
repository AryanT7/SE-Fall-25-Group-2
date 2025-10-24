from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Float, DateTime, Enum, Text, Date, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
from .database import Base
import enum

class Role(str, enum.Enum):
    USER = "USER"
    OWNER = "OWNER"
    STAFF = "STAFF"
    ADMIN = "ADMIN"
    DRIVER = "DRIVER"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(Role), default=Role.USER, nullable=False)
    is_active = Column(Boolean, default=True)
    height_cm = Column(Float, nullable=True)
    weight_kg = Column(Float, nullable=True)
    sex = Column(String, nullable=True)  # "M"/"F"/"X"
    dob = Column(Date, nullable=True)

    owned_cafes = relationship("Cafe", back_populates="owner")

class Cafe(Base):
    __tablename__ = "cafes"
    id = Column(Integer, primary_key=True)
    name = Column(String, index=True, nullable=False)
    address = Column(String, nullable=True)
    active = Column(Boolean, default=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    owner = relationship("User", back_populates="owned_cafes")
    items = relationship("Item", back_populates="cafe")
    reviews = relationship("Review", back_populates="cafe", cascade="all, delete-orphan")
    review_summary = relationship("ReviewSummary", back_populates="cafe", uselist=False)


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    cafe_id = Column(Integer, ForeignKey("cafes.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Float, nullable=True)
    text = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    cafe = relationship("Cafe", back_populates="reviews")
    user = relationship("User")

class ReviewSummary(Base):
    __tablename__ = "review_summaries"

    id = Column(Integer, primary_key=True, index=True)
    cafe_id = Column(Integer, ForeignKey("cafes.id"), unique=True, nullable=False)
    summary_text = Column(Text, nullable=False)
    review_count = Column(Integer, default=0)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    cafe = relationship("Cafe", back_populates="review_summary")


class StaffAssignment(Base):
    __tablename__ = "staff_assignments"
    __table_args__ = (UniqueConstraint('user_id', 'cafe_id', name='uq_staff_cafe'),)
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    cafe_id = Column(Integer, ForeignKey("cafes.id"), nullable=False)
    role = Column(Enum(Role), default=Role.STAFF, nullable=False)

class Item(Base):
    __tablename__ = "items"
    id = Column(Integer, primary_key=True)
    cafe_id = Column(Integer, ForeignKey("cafes.id"), index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    ingredients = Column(Text, nullable=True)
    calories = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    quantity = Column(String, nullable=True)  # e.g., "350ml" or "1 slice"
    servings = Column(Float, nullable=True)   # per item
    veg_flag = Column(Boolean, default=True)
    kind = Column(String, nullable=True)  # dessert, milkshake, etc.
    active = Column(Boolean, default=True)

    cafe = relationship("Cafe", back_populates="items")

class Cart(Base):
    __tablename__ = "carts"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class CartItem(Base):
    __tablename__ = "cart_items"
    id = Column(Integer, primary_key=True)
    cart_id = Column(Integer, ForeignKey("carts.id"), index=True)
    item_id = Column(Integer, ForeignKey("items.id"))
    quantity = Column(Integer, default=1)
    assignee_user_id = Column(Integer, ForeignKey("users.id"))  # who will consume

class OrderStatus(str, enum.Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    DECLINED = "DECLINED"
    READY = "READY"
    PICKED_UP = "PICKED_UP"
    CANCELLED = "CANCELLED"
    REFUNDED = "REFUNDED"
    DELIVERED = "DELIVERED"

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    cafe_id = Column(Integer, ForeignKey("cafes.id"), index=True)
    driver_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=True)
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING)
    created_at = Column(DateTime, default=datetime.utcnow)
    can_cancel_until = Column(DateTime, default=lambda: datetime.utcnow() + timedelta(minutes=15))
    pickup_code = Column(String, nullable=True)
    total_price = Column(Float, default=0.0)
    total_calories = Column(Integer, default=0)

class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("orders.id"), index=True)
    item_id = Column(Integer, ForeignKey("items.id"))
    quantity = Column(Integer, default=1)
    assignee_user_id = Column(Integer, ForeignKey("users.id"))
    subtotal_price = Column(Float, default=0.0)
    subtotal_calories = Column(Integer, default=0)

class PaymentStatus(str, enum.Enum):
    CREATED = "CREATED"
    PAID = "PAID"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"

class DriverStatus(str, enum.Enum):
    IDLE = "IDLE"
    OCCUPIED = "OCCUPIED"

class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("orders.id"), index=True)
    provider = Column(String, default="MOCK")
    amount = Column(Float, default=0.0)
    status = Column(Enum(PaymentStatus), default=PaymentStatus.CREATED)
    created_at = Column(DateTime, default=datetime.utcnow)

class CalorieGoal(Base):
    __tablename__ = "calorie_goals"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    period = Column(String)  # daily/weekly/monthly
    target_calories = Column(Integer, nullable=False)
    start_date = Column(Date, nullable=False)

class RefundRequest(Base):
    __tablename__ = "refund_requests"
    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("orders.id"), index=True)
    reason = Column(Text)
    status = Column(String, default="PENDING")  # APPROVED/REJECTED

class DriverLocation(Base):
    __tablename__ = "driver_locations"
    id = Column(Integer, primary_key=True)
    driver_id = Column(Integer, ForeignKey("users.id"), index=True)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    status = Column(Enum(DriverStatus), default=DriverStatus.IDLE, nullable=False)