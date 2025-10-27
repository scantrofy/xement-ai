from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserSignup(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    organization: str
    role: str  # admin/operator

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    role: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    organization: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    organization: str
    role: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True