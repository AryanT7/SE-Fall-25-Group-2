from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Cafe, Role
from ..deps import require_roles

router = APIRouter(prefix="/admin", tags=["admin"])

@router.post("/block_user/{user_id}")
def block_user(user_id: int, db: Session = Depends(get_db), admin: User = Depends(require_roles(Role.ADMIN))):
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    u.is_active = False
    db.add(u)
    db.commit()
    return {"status": "blocked"}

@router.post("/cafes", response_model=dict)
def create_cafe_admin(name: str, address: str | None = None, owner_id: int | None = None, db: Session = Depends(get_db), admin: User = Depends(require_roles(Role.ADMIN))):
    c = Cafe(name=name, address=address, owner_id=owner_id)
    db.add(c)
    db.commit()
    db.refresh(c)
    return {"id": c.id}

@router.delete("/cafes/{cafe_id}")
def delete_cafe(cafe_id: int, db: Session = Depends(get_db), admin: User = Depends(require_roles(Role.ADMIN))):
    c = db.query(Cafe).filter(Cafe.id == cafe_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Cafe not found")
    db.delete(c)
    db.commit()
    return {"status": "deleted"}
