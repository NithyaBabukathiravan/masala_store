from decimal import Decimal
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DATABASE_URL: str = "mysql+pymysql://root:password@localhost:3306/masala_store"

    SECRET_KEY: str = "change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    ADMIN_EMAIL: str = "admin@masalaworld.com"
    ADMIN_PASSWORD: str = "Admin@12345"
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
