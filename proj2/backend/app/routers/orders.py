from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from ..database import get_db
from ..schemas import PlaceOrderRequest, OrderOut
from ..models import Cart, CartItem, Item, Order, OrderItem, OrderStatus, User
from ..deps import get_current_user, require_cafe_staff_or_owner
import secrets

router = APIRouter(prefix="/orders", tags=["orders"])

@router.post("/place", response_model=OrderOut)
def place_order(data: PlaceOrderRequest, db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    cart = db.query(Cart).filter(Cart.user_id == current.id).first()
    if not cart:
        raise HTTPException(status_code=400, detail="Empty cart")
    rows = db.query(CartItem, Item).join(Item, CartItem.item_id == Item.id).filter(CartItem.cart_id == cart.id).all()
    if not rows:
        raise HTTPException(status_code=400, detail="Empty cart")
    if any(it.cafe_id != data.cafe_id for _, it in rows):
        raise HTTPException(status_code=400, detail="All items must be from the same cafe")

    total_price = round(sum(it.price * ci.quantity for ci, it in rows), 2)
    total_calories = sum(it.calories * ci.quantity for ci, it in rows)

    order = Order(user_id=current.id, cafe_id=data.cafe_id, status=OrderStatus.PENDING, total_price=total_price, total_calories=total_calories)
    db.add(order)
    db.commit()
    db.refresh(order)

    for ci, it in rows:
        oi = OrderItem(order_id=order.id, item_id=it.id, quantity=ci.quantity, assignee_user_id=ci.assignee_user_id,
                       subtotal_price=round(it.price * ci.quantity, 2), subtotal_calories=it.calories * ci.quantity)
        db.add(oi)
    order.pickup_code = secrets.token_hex(3).upper()
    db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
    db.add(order)
    db.commit()
    db.refresh(order)
    return order

@router.post("/{order_id}/cancel", response_model=OrderOut)
def cancel_order(order_id: int, db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == current.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if datetime.utcnow() > order.can_cancel_until:
        raise HTTPException(status_code=400, detail="Cancellation window passed")
    if order.status not in [OrderStatus.PENDING, OrderStatus.ACCEPTED]:
        raise HTTPException(status_code=400, detail="Order cannot be cancelled in current status")
    order.status = OrderStatus.CANCELLED
    db.add(order)
    db.commit()
    db.refresh(order)
    return order

@router.get("/my", response_model=list[OrderOut])
def my_orders(db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    return db.query(Order).filter(Order.user_id == current.id).order_by(Order.created_at.desc()).all()

@router.get("/{cafe_id}", response_model=list[OrderOut])
def cafe_orders(cafe_id: int, status: OrderStatus | None = None, db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    require_cafe_staff_or_owner(cafe_id, db, current)
    q = db.query(Order).filter(Order.cafe_id == cafe_id)
    if status:
        q = q.filter(Order.status == status)
    return q.order_by(Order.created_at.desc()).all()

@router.post("/{order_id}/status", response_model=OrderOut)
def update_status(order_id: int, new_status: OrderStatus, db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    require_cafe_staff_or_owner(order.cafe_id, db, current)
    valid_transitions = {
        OrderStatus.PENDING: {OrderStatus.ACCEPTED, OrderStatus.DECLINED},
        OrderStatus.ACCEPTED: {OrderStatus.READY, OrderStatus.CANCELLED},
        OrderStatus.READY: {OrderStatus.PICKED_UP},
    }
    if order.status in valid_transitions and new_status in valid_transitions[order.status]:
        order.status = new_status
        db.add(order)
        db.commit()
        db.refresh(order)
        return order
    raise HTTPException(status_code=400, detail="Invalid status transition")
