import firebase_admin
from firebase_admin import auth, credentials
from fastapi import Depends, HTTPException, Request

cred = credentials.ApplicationDefault()
firebase_admin.initialize_app(cred)

async def require_auth(request: Request):
    header = request.headers.get("Authorization")
    if not header or not header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing auth token")
    token = header.split(" ", 1)[1]
    try:
        decoded = auth.verify_id_token(token)
        return decoded
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {e}")
