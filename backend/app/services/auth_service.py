from fastapi import HTTPException, status
from app.utils.security import hash_password, verify_password
from app.services.firestore_service import get_user_by_email, create_auth_token, fs_client
from app.models.user_model import UserSignup, UserLogin
from datetime import datetime

def signup_user(user_data: UserSignup):
    existing = get_user_by_email(user_data.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    if user_data.role not in ["admin", "operator"]:
        raise HTTPException(status_code=400, detail="Invalid role")

    hashed_pw = hash_password(user_data.password)
    user_doc = {
        "email": user_data.email,
        "password": hashed_pw,
        "full_name": user_data.full_name,
        "organization": user_data.organization,
        "role": user_data.role,
        "created_at": datetime.utcnow(),
        "is_active": True,
    }
    doc_ref = fs_client.collection("users").add(user_doc)
    user_id = doc_ref[1].id
    token = create_auth_token(user_id, user_data.email, user_data.role)
    return {"token": token, "user": {**user_data.dict(), "id": user_id}}

def login_user(credentials: UserLogin):
    user = get_user_by_email(credentials.email)
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="User inactive")

    token = create_auth_token(user["id"], user["email"], user["role"])
    return {"token": token, "user": {k: user[k] for k in ["id", "email", "full_name", "organization", "role"]}}
