from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..schemas import CafeCreate, CafeOut, OCRResult
from ..models import Cafe, User, Role
from ..deps import get_current_user, require_roles
from ..services.ocr import parse_menu_pdf

router = APIRouter(prefix="/cafes", tags=["cafes"])

@router.post("/", response_model=CafeOut)
def create_cafe(data: CafeCreate, db: Session = Depends(get_db), owner: User = Depends(require_roles(Role.OWNER, Role.ADMIN))):
    cafe = Cafe(name=data.name, address=data.address, owner_id=owner.id if owner.role == Role.OWNER else None)
    db.add(cafe)
    db.commit()
    db.refresh(cafe)
    return cafe

@router.get("/", response_model=List[CafeOut])
def list_cafes(q: str | None = None, db: Session = Depends(get_db)):
    query = db.query(Cafe).filter(Cafe.active == True)
    if q:
        like = f"%{q}%"
        query = query.filter(Cafe.name.ilike(like))
    return query.order_by(Cafe.name).all()

@router.post("/{cafe_id}/menu/upload", response_model=OCRResult)
def upload_menu(cafe_id: int, pdf: UploadFile = File(...), db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    cafe = db.query(Cafe).filter(Cafe.id == cafe_id).first()
    if not cafe:
        raise HTTPException(status_code=404, detail="Cafe not found")
    if not (user.role == Role.ADMIN or cafe.owner_id == user.id):
        raise HTTPException(status_code=403, detail="Only owner/admin can upload menu")
    content = pdf.file.read()
    items = parse_menu_pdf(content)
    return OCRResult(items=items)
