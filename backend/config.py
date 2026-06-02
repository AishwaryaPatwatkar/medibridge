import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv
load_dotenv(override=True)

class Settings(BaseSettings):
    # App Config
    APP_NAME: str = "MediBridge AI API"
    DEBUG: bool = False
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000"
    
    # Database Config
    DATABASE_URL: str
    
    # JWT Config
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # Cloudinary Config
    CLOUDINARY_CLOUD_NAME: str
    CLOUDINARY_API_KEY: str
    CLOUDINARY_API_SECRET: str
    
    # Gemini AI Config
    GEMINI_API_KEY: str
    
    # Tesseract OCR Config
    # Default path for Windows if not specified, on Linux docker it will just be "tesseract"
    TESSERACT_CMD: str = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
