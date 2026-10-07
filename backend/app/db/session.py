from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import get_settings


settings = get_settings()

engine = create_engine(
    settings.database_url,
    pool_pre_ping=False,
    pool_size=5,
    max_overflow=5,
    pool_recycle=1800,
)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)