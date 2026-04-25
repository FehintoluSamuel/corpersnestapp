from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.database_model import User
from schemas.auth import RegisterRequest, LoginRequest, AuthResponse, UserResponse
from auth import hash_password, verify_password, create_token, get_current_user



router=APIRouter(prefix='/auth', tags=['Authentication'])
from fastapi import HTTPException, status
from sqlalchemy.exc import SQLAlchemyError

@router.post('/registration', response_model=AuthResponse, status_code=201)
async def register_new_user(data: RegisterRequest, db: Session = Depends(get_db)):
    try:
        # 1. Check if user exists
        existing_user = db.query(User).filter(User.email == data.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")

        # 2. Hash password
        hashed_password = hash_password(data.password)

        # 3. Create user object
        new_user = User(
            email=data.email,
            password_hash=hashed_password,
            full_name=data.full_name,
            phone_no=data.phone_no,
            nysc_state_code=data.nysc_state_code,
            batch_stream=data.batch_stream,
            role=data.role
        )

        # 4. Save to DB
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # 5. Create token
        token = create_token(new_user.id, new_user.role)

        # 6. Return response
        return AuthResponse(
            token=token,
            user=new_user
        )

    except SQLAlchemyError as db_error:
        db.rollback()
        print("DATABASE ERROR:", str(db_error))
        raise HTTPException(
            status_code=500,
            detail=str(db_error)
        )

    except Exception as e:
        db.rollback()
        print("GENERAL ERROR:", str(e))
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

#for existing user login
@router.post('/login', response_model=AuthResponse, status_code=200)
async def login_user(data:LoginRequest, db:Session= Depends(get_db)):
    #to look up the user by email
    existing_user=db.query(User).filter(User.email==data.email).first()
    if not existing_user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    #to verify the password
    if not verify_password(data.password, existing_user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    #to verify if account is suspended
    if existing_user.status== 'suspended':
        raise HTTPException(status_code=403, detail="Account suspended")
    #to create a JWT token
    token= create_token(existing_user.id, existing_user.role)
    #to return the token and user object
    return AuthResponse(token=token, user=existing_user)

#to get the current user
@router.get('/me', response_model=UserResponse, status_code=200) 
async def get_profile(current_user: User=Depends(get_current_user)):
    #to return user
    return current_user















