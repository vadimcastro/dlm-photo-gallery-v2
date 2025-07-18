# app/core/config.py
from pydantic_settings import BaseSettings
from typing import List
from functools import lru_cache
import secrets
import os
from .parameters import parameter_store

class Settings(BaseSettings):
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "DLM Photo Gallery API")
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"
    
    # Database settings
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "password")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "dlm-photo-gallery-v2")
    POSTGRES_HOST: str = os.getenv("POSTGRES_HOST", "db")
    POSTGRES_PORT: int = int(os.getenv("POSTGRES_PORT", "5432"))
    
    @property
    def DATABASE_URL(self) -> str:
        # Try Parameter Store first, fallback to constructed URL
        if os.getenv('ENVIRONMENT') == 'production':
            try:
                param_url = parameter_store.get_database_url()
                if param_url and param_url.strip():  # Check if we got a valid URL
                    return param_url
            except:
                pass
            # Fallback to environment variables for production
            return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
    # Admin user settings
    ADMIN_EMAIL: str = os.getenv("ADMIN_EMAIL", "danieminnock25@gmail.com")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "gallery123")
    ADMIN_USERNAME: str = os.getenv("ADMIN_USERNAME", "dan")
    ADMIN_NAME: str = os.getenv("ADMIN_NAME", "Dan")
    
    # Redis settings
    @property
    def REDIS_URL(self) -> str:
        if os.getenv('ENVIRONMENT') == 'production':
            try:
                param_url = parameter_store.get_redis_url()
                if param_url and param_url.strip():
                    return param_url
            except:
                pass
            return os.getenv('REDIS_URL', "redis://redis:6379/0")
        return "redis://redis:6379/0"
    
    # JWT Settings
    @property
    def SECRET_KEY(self) -> str:
        if os.getenv('ENVIRONMENT') == 'production':
            try:
                param_secret = parameter_store.get_secret_key()
                if param_secret and param_secret.strip():
                    return param_secret
            except:
                pass
            return os.getenv('SECRET_KEY', secrets.token_urlsafe(32))
        return os.getenv('SECRET_KEY', secrets.token_urlsafe(32))
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS Settings
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://frontend:3000",
        "http://0.0.0.0:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://0.0.0.0:8000",
        "http://api:8000",
        "http://206.81.2.168:3000",  # Production frontend
        "http://206.81.2.168:8000",  # Production API
    ]
    CORS_CREDENTIALS: bool = True
    CORS_METHODS: List[str] = ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]
    CORS_HEADERS: List[str] = [
        "Content-Type",
        "Authorization",
        "Accept",
        "Origin",
        "X-Requested-With",
    ]
    CORS_MAX_AGE: int = 3600

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "allow"

settings = Settings()