from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from backend.config import settings

# In case we want to use SQLite for tests or if Postgres is not configured yet,
# we add a fallback butDATABASE_URL is required by settings validation.
engine = create_engine(
    settings.DATABASE_URL,
    # pool_pre_ping checks the connection validity before using it from the pool
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
