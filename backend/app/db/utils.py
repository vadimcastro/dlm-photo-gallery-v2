import logging
from typing import Generator
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings

logger = logging.getLogger(__name__)

# Create SQLAlchemy engine
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Generator[Session, None, None]:
    """Get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_db_connection():
    """Test the database connection and verify table existence."""
    try:
        # Create engine
        engine = create_engine(settings.DATABASE_URL)
        
        # Test basic connection
        with engine.connect() as connection:
            # Check if tables exist
            inspector = inspect(engine)
            tables = inspector.get_table_names()
            logger.info(f"Existing tables in database: {tables}")
            
            if "users" not in tables:
                logger.warning("Users table does not exist - will be created during initialization")
            
            return True
            
    except SQLAlchemyError as e:
        logger.error(f"Database connection error: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error while connecting to database: {str(e)}")
        return False