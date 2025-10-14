from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Payment, PaymentStatus, Order, OrderStatus, User
from ..deps import get_current_user

router = APIRouter(prefix="/payments", tags=["payments"])

@router.post("/{order_id}")
def create_payment(order_id: int, db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == current.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status not in [OrderStatus.PENDING, OrderStatus.ACCEPTED]:
        raise HTTPException(status_code=400, detail="Order not payable in current status")
    p = Payment(order_id=order.id, amount=order.total_price, status=PaymentStatus.PAID, provider="MOCK")
    db.add(p)
    db.commit()
    db.refresh(p)
    return p
