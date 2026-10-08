from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from .config import settings

_url = make_url(settings.DATABASE_URL)
_is_sqlite = _url.get_backend_name() == "sqlite"

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
    connect_args={"check_same_thread": False} if _is_sqlite else {},
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def ensure_database() -> None:
    """MySQL-la 'masala_store' database illana thaane create pannum."""
    if not _url.get_backend_name().startswith("mysql"):
        return
    # 'mysql' system database-ku connect pannitu namma database create pannrom
    tmp = create_engine(_url.set(database="mysql"))
    with tmp.connect() as conn:
        conn.execute(
            text(
                f"CREATE DATABASE IF NOT EXISTS `{_url.database}` "
                "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
            )
        )
        conn.commit()
    tmp.dispose()