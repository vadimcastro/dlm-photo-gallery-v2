# app/db/session.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

try:
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,  # Enable connection health checks
        pool_size=5,  # Set a reasonable pool size
        max_overflow=10  # Allow up to 10 connections beyond the pool size
    )
    logger.info(f"Database connection established to {settings.POSTGRES_HOST}")
except Exception as e:
    logger.error(f"Failed to create database engine: {str(e)}")
    raise

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)