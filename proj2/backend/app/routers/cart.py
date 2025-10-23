from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from collections import defaultdict
from ..database import get_db
from ..schemas import CartAddItem, CartSummary, CartOut
from ..models import Cart, CartItem, Item, User
from ..deps import get_current_user

router = APIRouter(prefix="/cart", tags=["cart"])


@router.get("/", response_model=CartOut)
def get_cart(db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    cart = get_or_create_cart(db, current.id)
    return CartOut(id=cart.id, user_id=cart.user_id, created_at=cart.created_at)


def get_or_create_cart(db: Session, user_id: int) -> Cart:
    cart = db.query(Cart).filter(Cart.user_id == user_id).first()
    if not cart:
        cart = Cart(user_id=user_id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart

@router.post("/add", response_model=dict)
def add_to_cart(data: CartAddItem, db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    item = db.query(Item).filter(Item.id == data.item_id, Item.active == True).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    assignee_id = current.id
    if data.assignee_email:
        assignee = db.query(User).filter(User.email == data.assignee_email, User.is_active == True).first()
        if not assignee:
            raise HTTPException(status_code=400, detail="Assignee must be a registered active user")
        assignee_id = assignee.id
    cart = get_or_create_cart(db, current.id)
    ci = CartItem(cart_id=cart.id, item_id=item.id, quantity=data.quantity, assignee_user_id=assignee_id)
    db.add(ci)
    db.commit()
    return {"status": "added"}

@router.get("/summary", response_model=CartSummary)
def cart_summary(db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    cart = get_or_create_cart(db, current.id)
    rows = db.query(CartItem, Item, User).join(Item, CartItem.item_id == Item.id).join(User, CartItem.assignee_user_id == User.id).filter(CartItem.cart_id == cart.id).all()
    by_person = defaultdict(lambda: {"calories": 0.0, "price": 0.0})
    total_cals = 0
    total_price = 0.0
    for ci, it, person in rows:
        cals = it.calories * ci.quantity
        price = it.price * ci.quantity
        email = person.email
        by_person[email]["calories"] += cals
        by_person[email]["price"] += price
        total_cals += cals
        total_price += price
    return CartSummary(by_person=by_person, total_calories=total_cals, total_price=round(total_price, 2))

@router.delete("/clear", response_model=dict)
def clear_cart(db: Session = Depends(get_db), current: User = Depends(get_current_user)):
    cart = get_or_create_cart(db, current.id)
    db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
    db.commit()
    return {"status": "cleared"}
