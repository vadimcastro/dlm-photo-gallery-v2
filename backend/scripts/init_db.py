from app.db.session import SessionLocal
from app.db.init_db import init_db
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    logger.info("Creating database session...")
    db = SessionLocal()
    try:
        logger.info("Initializing database...")
        init_db(db)
        logger.info("Database initialization complete!")
    finally:
        db.close()

if __name__ == "__main__":
    main()