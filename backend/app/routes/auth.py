from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.user import UserCreate, UserLogin, UserOut
from app.models.user import User
from app.core.security import hash_password, verify_password, create_access_token, get_current_user
from pydantic import BaseModel
import uuid
from datetime import datetime, timedelta

router = APIRouter()

class ForgotRequest(BaseModel):
    email: str

class ResetRequest(BaseModel):
    token: str
    new_password: str

# REGISTER
@router.post("/register", response_model=UserOut)
def register(user: UserCreate, db: Session = Depends(get_db)):
    if user.role == "admin":
        raise HTTPException(status_code=400, detail="Cannot register as admin")
        
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed = hash_password(user.password)
    new_user = User(
        name=user.name, 
        email=user.email, 
        password=hashed, 
        role=user.role,
        phone=user.phone
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# LOGIN
@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if getattr(db_user, 'is_blocked', False):
        raise HTTPException(status_code=403, detail="Your account has been suspended by the Administrator.")

    token = create_access_token({"sub": db_user.email})

    return {
        "access_token": token,
        "token_type": "bearer"
    }

# GET CURRENT USER
@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# FORGOT PASSWORD
@router.post("/forgot-password")
def forgot_password(req: ForgotRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        # For security, don't reveal if email exists
        return {"message": "If this email is registered, you will receive a reset link."}
    
    # Generate a random token
    token = str(uuid.uuid4())
    user.reset_token = token
    user.reset_token_expires = datetime.utcnow() + timedelta(hours=1)
    db.commit()
    
    # IN A REAL APP: Send email here. 
    # FOR THIS DEMO: We return it so the user can use it easily or see it in console.
    print(f"\n[AUTH] Password reset link requested for {user.email}")
    print(f"[AUTH] Reset Token: {token}")
    print(f"[AUTH] Link: http://localhost:3000/reset-password?token={token}\n")
    
    return {
        "message": "Reset link generated (check console for demo)",
        "reset_token": token # Returning for convenience in demo
    }

# RESET PASSWORD
@router.post("/reset-password")
def reset_password(req: ResetRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        User.reset_token == req.token,
        User.reset_token_expires > datetime.utcnow()
    ).first()
    
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    user.password = hash_password(req.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()
    
    return {"message": "Password updated successfully. You can now login with your new password."}