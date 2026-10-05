import os

from dotenv import load_dotenv
from sqlalchemy import create_engine, text


load_dotenv()

database_url = os.getenv("DATABASE_URL")

if not database_url:
    raise RuntimeError("DATABASE_URL is not configured")

engine = create_engine(database_url)

with engine.connect() as connection:
    version = connection.execute(text("SELECT version()")).scalar()
    vector = connection.execute(
        text(
            "SELECT extversion "
            "FROM pg_extension "
            "WHERE extname = 'vector'"
        )
    ).scalar()

print("PostgreSQL connection: OK")
print(f"PostgreSQL: {version}")
print(f"pgvector: {vector}")