"""
routers/auth_router.py

Handles registration, login, profile management, and public user lookup.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timezone
import secrets
from datetime import datetime, timezone, timedelta
from models.database_model import PasswordResetToken
from schemas.auth import ForgotPasswordRequest, ResetPasswordRequest
from utils.email import send_welcome, send_password_reset
from database import get_db
from models.database_model import User, LandlordProfile
from schemas.auth import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    AuthResponse,          # ← add this
    UpdateProfileRequest,
    UpdateAvatarRequest,
    UpdateLandlordProfileRequest,
    UserResponse,
    PublicUserResponse,
)
from auth import get_current_user, hash_password, verify_password, create_token
from dependencies import Role, Status
from utils.nysc import parse_state_code, derive_role
import asyncio
from limiter import limiter, get_limit
from fastapi import Request







router = APIRouter(prefix="/auth", tags=["Auth"])
# ─── Helper Function ─────────────────────────────────────────────────────────────
async def _send_welcome_safe(email: str, name: str):
    try:
        await send_welcome(email, name)
    except Exception:
        pass  # Never crash registration due to email failure
# ─── Registration ─────────────────────────────────────────────────────────────

@router.post("/registration", response_model=AuthResponse, status_code=201)
@limiter.limit(lambda: get_limit("5/minute"))

async def register(
    request: Request,
    data: RegisterRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):

 
    """
    Register a new user.
    - PCMs register with callup number only (state code added later).
    - Landlords register with role=landlord and are set to pending_verification.
    - Role is always pcm or landlord at registration — never self-assigned higher.
    """
    # Check for existing email
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    # Check for duplicate callup number
    if data.callup_number:
        if db.query(User).filter(User.callup_number == data.callup_number).first():
            raise HTTPException(status_code=400, detail="This callup number is already registered.")

    # Check for duplicate phone
    if data.phone_no:
        if db.query(User).filter(User.phone_no == data.phone_no).first():
            raise HTTPException(status_code=400, detail="This phone number is already registered.")

    # Landlords start as pending_verification
    initial_status = (
        Status.pending_verification
        if data.role == Role.landlord
        else Status.active
    )

    new_user = User(
        full_name     = data.full_name,
        email         = data.email,
        password_hash = hash_password(data.password),
        phone_no      = data.phone_no,
        callup_number = data.callup_number,
        role          = data.role,
        status        = initial_status,
    )

    db.add(new_user)
    db.flush()  # get new_user.id before commit

    # Create landlord profile if registering as landlord
    if data.role == Role.landlord:
        landlord_profile = LandlordProfile(
            user_id = new_user.id,
            lga     = data.lga,
        )
        db.add(landlord_profile)

    try:
        db.commit()
        db.refresh(new_user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Registration failed. Please check your details.")

    background_tasks.add_task(_send_welcome_safe, new_user.email, new_user.full_name)

    token = create_token(new_user.id, new_user.role)
    return AuthResponse(token=token, user=new_user)

# ─── Login ────────────────────────────────────────────────────────────────────

@router.post('/login', response_model=AuthResponse, status_code=200)
@limiter.limit(lambda: get_limit("10/minute"))
async def login_user(request: Request, data: LoginRequest, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(User.email == data.email).first()
    print(f"DEBUG: Looking for email: {data.email}")
    print(f"DEBUG: User found: {existing_user}")
    
    
    
    
    if not existing_user:
        print("DEBUG: No user found with that email")
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    
    password_check = verify_password(data.password, existing_user.password_hash)
    print(f"DEBUG: Password check result: {password_check}")
    
    if not password_check:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if existing_user.status == Status.suspended:
        raise HTTPException(status_code=403, detail="Account suspended")
    
    token = create_token(existing_user.id, existing_user.role)
    return AuthResponse(token=token, user=existing_user)



# ─── Forget Password ─────────────────────────────────────────────────────────────

@router.post("/forgot-password", status_code=200)
@limiter.limit(lambda: get_limit("3/minute"))
async def forgot_password(request: Request, data: ForgotPasswordRequest, db: Session = Depends(get_db)):
 
    user = db.query(User).filter(User.email == data.email).first()
    # Always return 200 to prevent email enumeration
    if not user:
        return {"message": "If that email exists, a reset link has been sent."}

    # Invalidate old tokens
    db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == user.id,
        PasswordResetToken.used == False,
    ).update({"used": True})

    token = secrets.token_urlsafe(32)
    reset = PasswordResetToken(
        user_id    = user.id,
        token      = token,
        expires_at = datetime.now(timezone.utc) + timedelta(hours=1),
    )
    db.add(reset)
    db.commit()

    await send_password_reset(user.email, user.full_name, token)
    return {"message": "If that email exists, a reset link has been sent."}



# ─── Password Reset ─────────────────────────────────────────────────────────────


@router.post("/reset-password", status_code=200)
async def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    record = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == data.token,
        PasswordResetToken.used  == False,
    ).first()

    if not record or record.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Invalid or expired reset link.")

    user = db.query(User).filter(User.id == record.user_id).first()
    user.password_hash = hash_password(data.password)
    record.used = True
    db.commit()
    return {"message": "Password reset successful. You can now log in."}




# ─── Current user ─────────────────────────────────────────────────────────────

@router.get("/me", response_model=UserResponse, status_code=200)
async def get_me(current_user: User = Depends(get_current_user)):
    """Return the currently authenticated user's full profile."""
    return current_user


# ─── Profile update ───────────────────────────────────────────────────────────

@router.patch("/me/profile", response_model=UserResponse, status_code=200)
async def update_profile(
    data: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Partial profile update. Supplying a state code or camp_start_date
    immediately recalculates and updates the user's role.
    """
    if data.full_name is not None:
        current_user.full_name = data.full_name

    if data.phone_no is not None:
        existing = db.query(User).filter(
            User.phone_no == data.phone_no,
            User.id != current_user.id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Phone number already in use.")
        current_user.phone_no = data.phone_no

    if data.callup_number is not None:
        existing = db.query(User).filter(
            User.callup_number == data.callup_number,
            User.id != current_user.id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Callup number already registered.")
        current_user.callup_number = data.callup_number

    if data.nysc_state_code is not None:
        existing = db.query(User).filter(
            User.nysc_state_code == data.nysc_state_code,
            User.id != current_user.id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="State code already registered.")

        parsed = parse_state_code(data.nysc_state_code)
        current_user.nysc_state_code = data.nysc_state_code
        current_user.state           = parsed["state"]

    if data.stream is not None:
        current_user.stream = data.stream

    if data.camp_start_date is not None:
        current_user.camp_start_date = data.camp_start_date

    # Recalculate role if any NYSC field was touched
    nysc_fields_updated = any([
        data.nysc_state_code,
        data.stream,
        data.camp_start_date,
    ])
    if nysc_fields_updated:
        current_user.role = derive_role(current_user)

    db.commit()
    db.refresh(current_user)
    return current_user


# ─── Avatar update ────────────────────────────────────────────────────────────

@router.patch("/me/avatar", response_model=UserResponse, status_code=200)
async def update_avatar(
    data: UpdateAvatarRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update the authenticated user's profile picture URL."""
    current_user.profile_picture_url = data.profile_picture_url
    db.commit()
    db.refresh(current_user)
    return current_user


# ─── Landlord profile update ──────────────────────────────────────────────────

@router.patch("/me/landlord-profile", response_model=UserResponse, status_code=200)
async def update_landlord_profile(
    data: UpdateLandlordProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update landlord-specific profile fields."""
    if current_user.role != Role.landlord:
        raise HTTPException(status_code=403, detail="Only landlords can update landlord profile.")

    profile = current_user.landlord_profile
    if not profile:
        # Create profile if it somehow doesn't exist
        profile = LandlordProfile(user_id=current_user.id)
        db.add(profile)

    if data.lga is not None:
        profile.lga = data.lga

    db.commit()
    db.refresh(current_user)
    return current_user


# ─── Public user lookup ───────────────────────────────────────────────────────

@router.get("/users/{user_id}", response_model=PublicUserResponse, status_code=200)
async def get_public_user(user_id: int, db: Session = Depends(get_db)):
    """
    Public profile lookup by user ID. No auth required.
    phone_no is returned — frontend gates display behind login check.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return user