from pydantic import BaseModel, EmailStr
from datetime import datetime

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