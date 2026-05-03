"""
schemas/auth.py

Pydantic schemas for all auth-related endpoints.
"""

from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime, date
from dependencies import Role, Status
from utils.nysc import parse_callup_number, parse_state_code


# ─── Registration ─────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    full_name:      str
    email:          EmailStr
    password:       str
    phone_no:       Optional[str] = None
    callup_number:  Optional[str] = None   # NYSC/FUA/2025/107449
    role:           Optional[Role] = Role.pcm

    # Landlord-specific — only required when role=landlord
    lga:            Optional[str] = None

    @field_validator("callup_number")
    @classmethod
    def validate_callup(cls, v):
        if v is None:
            return v
        if not parse_callup_number(v):
            raise ValueError(
                "Invalid callup number. Expected format: NYSC/XXX/YYYY/NNNNNN"
            )
        return v.strip().upper()

    @field_validator("role")
    @classmethod
    def validate_role(cls, v):
        # Only pcm and landlord can self-register.
        # incoming_corper/outgoing_corper/alumni are derived automatically.
        # admin is assigned manually via the admin router.
        if v not in (Role.pcm, Role.landlord):
            raise ValueError(
                "You can only register as a PCM or Landlord."
            )
        return v


    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one number")
        return v

# ─── Login ────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email:    EmailStr
    password: str


class TokenResponse(BaseModel):
    token: str
    token_type:   str = "bearer"


# ─── Profile update ───────────────────────────────────────────────────────────

class UpdateProfileRequest(BaseModel):
    """
    Partial update — all fields optional.
    Supplying nysc_state_code, stream, or camp_start_date triggers
    an immediate role recalculation.
    """
    full_name:       Optional[str]  = None
    phone_no:        Optional[str]  = None
    callup_number:   Optional[str]  = None
    nysc_state_code: Optional[str]  = None   # AB/25A/2008
    stream:          Optional[int]  = None   # 1 or 2
    camp_start_date: Optional[date] = None   # actual camp start from call-up letter

    @field_validator("nysc_state_code")
    @classmethod
    def validate_state_code(cls, v):
        if v is None:
            return v
        if not parse_state_code(v):
            raise ValueError(
                "Invalid state code. Expected format: AB/25A/2008"
            )
        return v.strip().upper()

    @field_validator("callup_number")
    @classmethod
    def validate_callup(cls, v):
        if v is None:
            return v
        if not parse_callup_number(v):
            raise ValueError(
                "Invalid callup number. Expected format: NYSC/XXX/YYYY/NNNNNN"
            )
        return v.strip().upper()

    @field_validator("stream")
    @classmethod
    def validate_stream(cls, v):
        if v is not None and v not in (1, 2):
            raise ValueError("Stream must be 1 or 2.")
        return v


class UpdateAvatarRequest(BaseModel):
    profile_picture_url: str


# ─── Landlord profile update ──────────────────────────────────────────────────

class UpdateLandlordProfileRequest(BaseModel):
    lga: Optional[str] = None


# ─── Responses ────────────────────────────────────────────────────────────────

class LandlordProfileResponse(BaseModel):
    id:                int
    lga:               Optional[str] = None
    verified_by:       Optional[int] = None
    verified_at:       Optional[datetime] = None
    verification_note: Optional[str] = None

    class Config:
        from_attributes = True


class UserResponse(BaseModel):
    id:                  int
    full_name:           str
    email:               EmailStr
    phone_no:            Optional[str] = None
    callup_number:       Optional[str] = None
    nysc_state_code:     Optional[str] = None
    stream:              Optional[int] = None
    state:               Optional[str] = None
    batch_stream:        Optional[str] = None   # legacy
    camp_start_date:     Optional[date] = None
    role:                Role
    status:              Status
    profile_picture_url: Optional[str] = None
    created_at:          Optional[datetime] = None
    landlord_profile:    Optional[LandlordProfileResponse] = None

    class Config:
        from_attributes = True


class PublicUserResponse(BaseModel):
    """
    Returned by GET /auth/users/{user_id}.
    phone_no is included — the frontend gates it behind a login check.
    """
    id:                  int
    full_name:           str
    role:                Role
    status:              Status
    state:               Optional[str] = None
    phone_no:            Optional[str] = None
    profile_picture_url: Optional[str] = None
    created_at:          Optional[datetime] = None

    class Config:
        from_attributes = True 
    
    
    
class AuthResponse(BaseModel):
    token:      str
    token_type: str = "bearer"
    user:       UserResponse

    class Config:
        from_attributes = True       
    
    
    
    
# ─── Password Reset ────────────────────────────────────────────────────────────────
    
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token:    str
    password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("At least 8 characters")
        if not any(c.isupper() for c in v):
            raise ValueError("At least one uppercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("At least one number")
        return v