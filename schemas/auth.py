from pydantic import EmailStr, BaseModel
from typing import Optional
from dependencies import Role, Status
from datetime import datetime

#Schema for RegisterRequest
class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    phone_no: Optional[str] = None
    nysc_state_code: Optional[str] = None
    batch_stream: Optional[str] = None
    role: Role  
    
#Schema for LoginRequest
class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    
#Schema for UserResponse
class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    phone_no: Optional[str] = None
    nysc_state_code: Optional[str] = None
    batch_stream: Optional[str] = None
    role: Role
    status: Status
    created_at: Optional[datetime]=None
    
    class Config:
        from_attributes = True
        
#Schema for AuthResponse
class AuthResponse(BaseModel):
    token: str
    user: UserResponse
    
    


