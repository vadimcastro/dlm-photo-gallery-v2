# app/core/security.py
from datetime import datetime, timedelta
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.core.config import settings
from app.crud.crud_user import crud_user
import logging

logger = logging.getLogger(__name__)

def create_access_token(data: dict) -> str:
    try:
        logger.debug(f"Creating access token for user data: {data}")
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        
        encoded_jwt = jwt.encode(
            to_encode, 
            settings.SECRET_KEY, 
            algorithm=settings.ALGORITHM
        )
        
        logger.debug("Token created successfully")
        return encoded_jwt
    except Exception as e:
        logger.error(f"Error creating access token: {str(e)}")
        raise

def decode_token(token: str) -> dict:
    try:
        logger.debug(f"Decoding token: {token[:10]}...")
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        logger.debug(f"Token decoded successfully")
        return payload
    except JWTError as e:
        logger.error(f"Token decode error: {str(e)}")
        return None

def get_user_from_token(token: str, db: Session):
    try:
        payload = decode_token(token)
        if not payload:
            logger.warning("Invalid token payload")
            return None

        email: str = payload.get("sub")
        if not email:
            logger.warning("No email in token payload")
            return None

        user = crud_user.get_by_email(db, email=email)
        if not user:
            logger.warning(f"No user found for email: {email}")
            return None
            
        logger.debug(f"Successfully retrieved user from token: {email}")
        return user
            
    except Exception as e:
        logger.error(f"Error in get_user_from_token: {str(e)}")
        return None