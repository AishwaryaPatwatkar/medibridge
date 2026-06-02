from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from backend.config import settings

# In case we want to use SQLite for tests or if Postgres is not configured yet,
# we add a fallback butDATABASE_URL is required by settings validation.
# Render database strings start with postgres:// which SQLAlchemy no longer supports.
# Replace with postgresql:// if needed.
database_url = settings.DATABASE_URL
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

engine = create_engine(
    database_url,
    # pool_pre_ping checks the connection validity before using it from the pool
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
