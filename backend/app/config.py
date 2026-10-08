from decimal import Decimal
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DATABASE_URL: str # No default - must come from.env

    SECRET_KEY: str # No default - must come from.env, no "change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    ADMIN_EMAIL: str = "admin@masalaworld.com"
    ADMIN_PASSWORD: str # Must come from.env
    ADMIN_NAME: str = "Masala Admin"

    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:5174"

    FREE_SHIPPING_ABOVE: Decimal = Decimal("349")
    SHIPPING_FEE: Decimal = Decimal("40")
    LOW_STOCK_LIMIT: int = 10

    UPLOAD_DIR: Path = Path("uploads")
    MAX_UPLOAD_MB: int = 5

    @property
    def cors_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

settings = Settings()