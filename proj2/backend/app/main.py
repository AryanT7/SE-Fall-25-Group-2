from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from .routers import auth as auth_router
from .routers import users as users_router
from .routers import cafes as cafes_router
from .routers import items as items_router
from .routers import cart as cart_router
from .routers import orders as orders_router
from .routers import payments as payments_router
from .routers import goals as goals_router
from .routers import admin as admin_router
from .routers import analytics as analytics_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Cafe Calories API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(users_router.router)
app.include_router(cafes_router.router)
app.include_router(items_router.router)
app.include_router(cart_router.router)
app.include_router(orders_router.router)
app.include_router(payments_router.router)
app.include_router(goals_router.router)
app.include_router(admin_router.router)
app.include_router(analytics_router.router)

@app.get("/")
def root():
    return {"ok": True, "service": "Cafe Calories API"}
