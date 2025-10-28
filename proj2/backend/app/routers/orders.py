from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from ..database import get_db
from ..schemas import PlaceOrderRequest, OrderOut, AssignDriverRequest
from ..models import Cart, CartItem, Item, Order, OrderItem, OrderStatus, User, Cafe
from ..deps import get_current_user, require_cafe_staff_or_owner
from ..services.driver import find_nearest_idle_driver, update_driver_status_to_occupied
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
        
        # If order is delivered, set driver back to IDLE
        if new_status == OrderStatus.DELIVERED and order.driver_id:
            from ..services.driver import update_driver_status_to_idle
            update_driver_status_to_idle(order.driver_id, db)
        
        return order
    raise HTTPException(status_code=400, detail="Invalid status transition")


@router.post("/{order_id}/assign-driver", response_model=OrderOut)
def assign_driver(order_id: int, assignment: AssignDriverRequest = None, db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    """
    Assign a driver to an order.
    If driver_id is not provided, automatically selects the nearest idle driver.
    Only cafe staff/owners and admins can assign drivers.
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Check permissions
    require_cafe_staff_or_owner(order.cafe_id, db, current)
    
    # Check if order already has a driver
    if order.driver_id:
        raise HTTPException(status_code=400, detail="Order already has a driver assigned")
    
    # Check if order status allows driver assignment
    if order.status not in [OrderStatus.ACCEPTED, OrderStatus.READY]:
        raise HTTPException(status_code=400, detail="Order must be ACCEPTED or READY to assign a driver")
    
    driver_id = None
    distance = None
    
    if assignment and assignment.driver_id:
        # Manually assign specific driver
        driver_id = assignment.driver_id
        
        # Check if driver exists and is actually a driver
        driver = db.query(User).filter(User.id == driver_id).first()
        if not driver:
            raise HTTPException(status_code=404, detail="Driver not found")
        
        # Verify driver is idle
        from ..services.driver import get_latest_driver_location
        from ..models import DriverStatus
        latest_location = get_latest_driver_location(driver_id, db)
        if not latest_location or latest_location.status != DriverStatus.IDLE:
            raise HTTPException(status_code=400, detail="Driver is not available (not idle)")
    else:
        # Auto-assign nearest idle driver
        cafe = db.query(Cafe).filter(Cafe.id == order.cafe_id).first()
        if not cafe:
            raise HTTPException(status_code=404, detail="Cafe not found")
        
        result = find_nearest_idle_driver(cafe.lat, cafe.lng, db)
        if not result:
            raise HTTPException(status_code=404, detail="No idle drivers available")
        
        driver, distance = result
        driver_id = driver.id
    
    # Assign driver to order
    order.driver_id = driver_id
    db.add(order)
    db.commit()
    
    # Update driver status to OCCUPIED
    update_driver_status_to_occupied(driver_id, db)
    
    db.refresh(order)
    
    return order
