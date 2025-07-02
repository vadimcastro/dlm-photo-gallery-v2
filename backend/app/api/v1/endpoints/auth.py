# app/api/v1/endpoints/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.crud.crud_user import crud_user
from app.core.security import create_access_token, get_user_from_token
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)
router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    logger.info(f"Login attempt for user: {form_data.username}")
    try:
        user = crud_user.authenticate(
            db, 
            email=form_data.username, 
            password=form_data.password
        )
        
        if not user:
            logger.warning(f"Authentication failed for user: {form_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )

        access_token = create_access_token(data={"sub": user.email})
        logger.info(f"Login successful for user: {form_data.username}")
        
        return {
            "access_token": access_token,
            "token_type": "bearer"
        }
    except Exception as e:
        logger.error(f"Login error: {str(e)}", exc_info=True)
        raise

@router.get("/me")
async def read_users_me(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    logger.debug(f"Accessing /me endpoint with token: {token[:10]}...")
    user = get_user_from_token(token, db)
    if not user:
        logger.warning("Invalid token or user not found")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
    
    logger.debug(f"Successfully retrieved user data for: {user.email}")
    return user