from passlib.context import CryptContext
from jose import jwt, JWTError
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import get_db
from models.database_model import User
from pathlib import Path

ctxt=CryptContext(schemes=['bcrypt'], deprecated='auto')

env_path = Path(__file__).resolve().parent / '.env'
load_dotenv(dotenv_path=env_path)

#load_dotenv()
token_expiry_str = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

if not token_expiry_str or not SECRET_KEY or not ALGORITHM:
    raise ValueError('TOKEN_EXPIRY_TIME, SECRET_KEY, or ALGORITHM not set')
TOKEN_EXPIRY_TIME= int(token_expiry_str)

#to create a password hash function
def hash_password(password: str) -> str:
    return ctxt.hash(password)

#to verify the hashed password
def verify_password(plain: str, hashed: str) -> bool:
    return ctxt.verify(plain, hashed)

def create_token(user_id: int, role: str) -> str:
    # to calculate the expiry time
    expiry_time = datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRY_TIME)

    # Build a payload dictionary with three keys: sub (the user id as a string), role, and exp (the expiry datetime as a timestamp)
    payload = {
        'sub': str(user_id),
        'role': role,
        'exp': int(expiry_time.timestamp())
    }

    # Encode and return the token using jwt.encode() with the SECRET_KEY and ALGORITHM
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer()), 
    db: Session = Depends(get_db)
):
    # to decode the token
    try:
        print(f"DEBUG SECRET_KEY: {SECRET_KEY}")
        print(f"DEBUG ALGORITHM: {ALGORITHM}")
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Invalid or expired token'
        )
    # to Extract the user ID from the payload
    sub = payload.get('sub')
    if sub is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid token: missing user id')
    payload_user_id = int(sub)
    # to Look up the user in the database
    user = db.query(User).filter(User.id == payload_user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='user not found')
    return user






