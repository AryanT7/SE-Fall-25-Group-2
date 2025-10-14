from pydantic import BaseModel
import os

class Settings(BaseModel):
    APP_NAME: str = "Cafe Calories API"
    JWT_SECRET: str = os.getenv("JWT_SECRET", "dev-secret-change-me")
    JWT_ALG: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_EXPIRE_MIN", 60))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_EXPIRE_DAYS", 7))
    SQLALCHEMY_DATABASE_URI: str = os.getenv("DATABASE_URL", "sqlite:///./app.db")
    ORDER_CANCEL_GRACE_MINUTES: int = int(os.getenv("ORDER_CANCEL_GRACE_MINUTES", 15))

settings = Settings()
