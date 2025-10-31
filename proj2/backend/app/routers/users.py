from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas import UserCreate, UserOut
from ..models import User, Role
from ..auth import hash_password
from ..deps import get_current_user

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/register", response_model=UserOut)
def register(data: UserCreate, db: Session = Depends(get_db)):
    print("REGISTER activity_level =", data.activity_level)  # debug
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    roleMap ={
        "USER": Role.USER,
        "OWNER": Role.OWNER,
        "STAFF": Role.STAFF,
        "DRIVER": Role.DRIVER
    }
    user = User(email=data.email, name=data.name, hashed_password=hash_password(data.password), 
                role=roleMap[data.role],
                dob=data.dob,
                weight_kg=data.weight_kg,
                height_cm=data.height_cm,
                activity_level=data.activity_level,
                gender=data.gender)
    db.add(user)
    db.commit()
    db.refresh(user)
    print("SAVED activity_level =", user.activity_level)  # debug

    return user

@router.get("/me", response_model=UserOut)
def get_me(current: User = Depends(get_current_user)):
    print("GET /me activity_level =", current.activity_level)  # debug
    return current

@router.delete("/me", response_model=dict)
def delete_self(current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    current.is_active = False
    db.add(current)
    db.commit()
    return {"status": "deactivated"}
