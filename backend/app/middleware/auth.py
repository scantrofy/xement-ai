from fastapi import Depends, HTTPException, Request
from app.services.firestore_service import fs_client, verify_token

async def require_auth(request: Request):
    """Verify token and return user data from Firestore"""
    header = request.headers.get("Authorization")
    if not header or not header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing auth token")
    token = header.split(" ", 1)[1]
    try:
        token_data = verify_token(token)
        if not token_data:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        return token_data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {e}")

async def require_admin(request: Request):
    """Middleware to require admin role"""
    header = request.headers.get("Authorization")
    if not header or not header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing auth token")
    token = header.split(" ", 1)[1]
    try:
        token_data = verify_token(token)
        if not token_data:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        
        user_id = token_data.get("user_id")
        
        user_doc = fs_client.collection("users").document(user_id).get()
        if not user_doc.exists:
            raise HTTPException(status_code=403, detail="User not found")
        
        user_data = user_doc.to_dict()
        if user_data.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
        
        return token_data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {e}")
