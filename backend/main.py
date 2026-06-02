from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import settings
from backend.database.connection import Base, engine
from backend.routes import auth, reports, profile

# Proactively create PostgreSQL database tables on startup.
# This ensures a smooth onboarding experience if PostgreSQL is running.
try:
    # Import models to ensure they are registered on Base
    from backend.models import User, Report, Analysis
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully.")
except Exception as db_err:
    print(f"Error creating database tables: {str(db_err)}")

app = FastAPI(
    title=settings.APP_NAME,
    description="API backend for MediBridge AI - simplifying medical reports for patients.",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else "/docs", # Keep docs available for testing
)

# Configure CORS Middleware
# Allows request from local development servers (e.g. Vite default port 5173, Docker, etc.)
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "*" # Fallback for wider testing environments
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth.router)
app.include_router(reports.router)
app.include_router(profile.router)

@app.get("/")
def read_root():
    return {
        "app": settings.APP_NAME,
        "status": "healthy",
        "documentation": "/docs"
    }
