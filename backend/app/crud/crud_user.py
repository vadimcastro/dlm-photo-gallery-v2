# app/crud/crud_user.py
from typing import Optional
from sqlalchemy.orm import Session
from app.models.user import User
from app.core.hashing import verify_password
import logging

logger = logging.getLogger(__name__)

class CRUDUser:
    def get_by_email(self, db: Session, *, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()
    
    def get_by_username(self, db: Session, *, username: str) -> Optional[User]:
        return db.query(User).filter(User.username == username).first()

    def authenticate(self, db: Session, *, email: str, password: str) -> Optional[User]:
        logger.info(f"Authenticating user: {email}")
        
        user = self.get_by_email(db, email=email)
        if not user:
            logger.warning(f"No user found for email: {email}")
            return None
            
        logger.info("User found, verifying password")
        if not verify_password(password, user.hashed_password):
            logger.warning(f"Invalid password for user: {email}")
            return None
            
        logger.info(f"Authentication successful for user: {email}")
        return user

    def is_active(self, user: User) -> bool:
        return user.is_active

    def is_superuser(self, user: User) -> bool:
        return user.is_superuser

crud_user = CRUDUser()