from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict
from datetime import datetime, date
from .models import Role, OrderStatus, PaymentStatus

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    sub: str
    uid: int
    role: Role
    exp: int

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    email: EmailStr
    name: str
    password: str
    role: str = "User"  # Default role is User

class UserOut(UserBase):
    id: int
    role: Role
    is_active: bool
    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    role: str

class CafeCreate(BaseModel):
    name: str
    address: Optional[str] = None

class CafeOut(BaseModel):
    id: int
    name: str
    address: Optional[str]
    active: bool
    class Config:
        from_attributes = True

class ItemCreate(BaseModel):
    name: str
    description: Optional[str] = None
    ingredients: Optional[str] = None
    calories: int
    price: float
    quantity: Optional[str] = None
    servings: Optional[float] = None
    veg_flag: bool = True
    kind: Optional[str] = None

class ItemOut(ItemCreate):
    id: int
    cafe_id: int
    active: bool
    class Config:
        from_attributes = True

class CartAddItem(BaseModel):
    item_id: int
    quantity: int = Field(ge=1, default=1)
    assignee_email: Optional[EmailStr] = None

class CartSummary(BaseModel):
    by_person: Dict[str, Dict[str, float]]
    total_calories: int
    total_price: float

class PlaceOrderRequest(BaseModel):
    cafe_id: int

class OrderOut(BaseModel):
    id: int
    cafe_id: int
    status: OrderStatus
    created_at: datetime
    total_price: float
    total_calories: int
    can_cancel_until: datetime
    class Config:
        from_attributes = True

class PaymentOut(BaseModel):
    id: int
    order_id: int
    amount: float
    status: PaymentStatus
    provider: str
    class Config:
        from_attributes = True

class GoalSet(BaseModel):
    period: str  # daily/weekly/monthly
    target_calories: int
    start_date: date

class GoalOut(GoalSet):
    id: int
    class Config:
        from_attributes = True

class GoalRecommendationRequest(BaseModel):
    height_cm: float
    weight_kg: float
    sex: str = "M"
    age_years: int = 25
    activity: str = "moderate"  # sedentary/light/moderate/active/very_active

class OCRMenuItem(BaseModel):
    name: str
    calories: int
    price: float
    ingredients: Optional[str] = None
    quantity: Optional[str] = None
    servings: Optional[float] = None
    veg_flag: bool = True
    kind: Optional[str] = None

class OCRResult(BaseModel):
    items: List[OCRMenuItem]

class DriverLocationIn(BaseModel):
    lat: float
    lng: float
    timestamp: datetime

class AssignedOrderOut(OrderOut):
    driver_id: Optional[int]

class DriverLocationOut(BaseModel):
    driver_id: int
    lat: float
    lng: float
    timestamp: datetime

class DriverLoginRequest(BaseModel):
    email: EmailStr
    password: str

class CartOut(BaseModel):
    id: int
    user_id: int
    created_at: datetime
    class Config:
        from_attributes = True
