from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..schemas import ItemCreate, ItemOut
from ..models import Item, Cafe, User, Role
from ..deps import get_current_user

router = APIRouter(prefix="/items", tags=["items"])

@router.post("/{cafe_id}", response_model=ItemOut)
def add_item(cafe_id: int, data: ItemCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    cafe = db.query(Cafe).filter(Cafe.id == cafe_id).first()
    if not cafe:
        raise HTTPException(status_code=404, detail="Cafe not found")
    if not (user.role == Role.ADMIN or cafe.owner_id == user.id):
        raise HTTPException(status_code=403, detail="Only owner/admin can add items")
    item = Item(cafe_id=cafe_id, **data.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.get("/{cafe_id}", response_model=List[ItemOut])
def list_items(cafe_id: int, q: str | None = None, db: Session = Depends(get_db)):
    query = db.query(Item).filter(Item.cafe_id == cafe_id, Item.active == True)
    if q:
        like = f"%{q}%"
        query = query.filter(Item.name.ilike(like))
    return query.order_by(Item.name).all()
