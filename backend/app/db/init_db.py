# app/db/init_db.py
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.user import User
from app.core.hashing import get_password_hash
import logging

logger = logging.getLogger(__name__)

def init_db(db: Session) -> None:
    logger.info("Starting database initialization...")
    try:
        # Check if admin user exists
        admin = db.query(User).filter(
            User.email == settings.ADMIN_EMAIL
        ).first()
        
        if not admin:
            logger.info(f"Creating admin user with email: {settings.ADMIN_EMAIL}")
            logger.info(f"Admin username will be: {settings.ADMIN_USERNAME}")
            
            # Create password hash
            hashed_password = get_password_hash(settings.ADMIN_PASSWORD)
            logger.info("Password hashed successfully")
            
            # Create new admin user
            admin = User(
                email=settings.ADMIN_EMAIL,
                username=settings.ADMIN_USERNAME,
                name=settings.ADMIN_NAME,
                hashed_password=hashed_password,
                is_active=True,
                is_superuser=True,
                role="admin"
            )
            
            # Add to database
            logger.info("Adding admin user to database...")
            db.add(admin)
            db.flush()  # Flush to get the ID
            logger.info(f"Admin user created with ID: {admin.id}")
            
            # Commit the transaction
            db.commit()
            db.refresh(admin)
            logger.info("Admin user committed to database")
            
            # Verify creation
            created_admin = db.query(User).filter(
                User.email == settings.ADMIN_EMAIL
            ).first()
            
            if created_admin:
                logger.info(f"Successfully verified admin user creation: {created_admin.email}")
            else:
                raise Exception("Failed to verify admin user creation")
        else:
            logger.info(f"Admin user already exists: {admin.email}")
            logger.info("Checking if admin user needs updates...")
            
            # Update fields if needed
            updated = False
            if admin.username != settings.ADMIN_USERNAME:
                admin.username = settings.ADMIN_USERNAME
                updated = True
            if admin.name != settings.ADMIN_NAME:
                admin.name = settings.ADMIN_NAME
                updated = True
            if not admin.is_superuser:
                admin.is_superuser = True
                updated = True
            if admin.role != "admin":
                admin.role = "admin"
                updated = True
            
            # Update password
            admin.hashed_password = get_password_hash(settings.ADMIN_PASSWORD)
            updated = True
            
            if updated:
                db.commit()
                logger.info("Updated admin user settings")
            else:
                logger.info("No updates needed for admin user")
                
    except Exception as e:
        logger.error(f"Error in init_db: {str(e)}", exc_info=True)
        db.rollback()
        raise