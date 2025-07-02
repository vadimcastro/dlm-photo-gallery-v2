# app/schemas/user.py
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    
class TokenPayload(BaseModel):
    sub: Optional[int] = None
    exp: Optional[datetime] = None

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    name: Optional[str] = None
    role: Optional[str] = None
    is_active: bool = True
    is_superuser: bool = False

class UserCreate(UserBase):
    password: str

class UserUpdate(UserBase):
    password: Optional[str] = None
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    is_superuser: Optional[bool] = None

class UserInDBBase(UserBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

class User(UserInDBBase):
    pass

class UserInDB(UserInDBBase):
    hashed_password: str