from passlib.context import CryptContext #For password hashing
from jose import JWTError, jwt #For JWT Token based authentication
from datetime import datetime, timedelta #For JWT Token time expiration
from typing import Optional #For optional parameters
from fastapi import Depends, HTTPException #For dependency injection and error handling
from fastapi.security import OAuth2PasswordBearer #For authentication
from sqlalchemy.orm import Session #For database sessions
import os #For environment variables
from dotenv import load_dotenv #For loading environment variables

from app.db.database import get_db #For getting database sessions
from app.models.user import User #For getting user model

# Load env
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY") #Used for signing JWT tokens
ALGORITHM = os.getenv("ALGORITHM") #Used for signing JWT tokens
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")) #For JWT Token time expiration

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")#Uses bcrypt for secure password storage

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
# Optional variant – never raises 401, just returns None when no token is present
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)


#  Password Hashing
def hash_password(password: str): #Used to hash passwords (plain password --> hashed password)
    return pwd_context.hash(password)


def verify_password(plain, hashed): #Used to verify passwords (hashed password --> plain password)
    return pwd_context.verify(plain, hashed)


#  JWT Token (creates tokens after login )
def create_access_token(data: dict): #Used to create JWT tokens
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM) #encode tokens with JWT


#  Get Current User (verfiy tokens and extract user data)
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")

        if email is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.email == email).first()

    if user is None:
        raise credentials_exception

    if getattr(user, 'is_blocked', False):
        raise HTTPException(
            status_code=403, 
            detail="Your account has been suspended by the Administrator."
        )

    return user


#  Get Optional User – uses auto_error=False scheme so missing token returns None
async def get_optional_user(
    token: Optional[str] = Depends(oauth2_scheme_optional),
    db: Session = Depends(get_db)
):
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
        user = db.query(User).filter(User.email == email).first()
        if user and getattr(user, 'is_blocked', False):
            return None
        return user
    except JWTError:
        return None


#  Admin Only Access
def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Access denied. Admin privileges required."
        )
    return current_user