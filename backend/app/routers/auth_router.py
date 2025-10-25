from fastapi import APIRouter, HTTPException, Depends
from app.models.user_model import UserSignup, UserLogin
from app.services.auth_service import signup_user, login_user
from app.services.firestore_service import verify_token, fs_client
from app.middleware.auth import require_auth

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup")
def signup(user: UserSignup):
    return signup_user(user)

@router.post("/login")
def login(credentials: UserLogin):
    return login_user(credentials)

@router.get("/me")
def get_current_user(user=Depends(require_auth)):
    """Get current authenticated user info from Firebase token"""
    return {
        "uid": user.get("uid"),
        "email": user.get("email"),
        "email_verified": user.get("email_verified", False),
        "name": user.get("name"),
    }

@router.post("/logout")
def logout(user=Depends(require_auth)):
    """Logout endpoint - Firebase handles token invalidation on client side"""
    return {"message": "Logged out successfully", "email": user.get("email")}
