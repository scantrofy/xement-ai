from google.cloud import firestore
from datetime import datetime, timedelta
import secrets

fs_client = firestore.Client()
USERS_COLLECTION = "users"
TOKENS_COLLECTION = "auth_tokens"

def get_user_by_email(email: str):
    users_ref = fs_client.collection(USERS_COLLECTION)
    query = users_ref.where("email", "==", email).limit(1)
    docs = list(query.stream())
    if docs:
        data = docs[0].to_dict()
        data["id"] = docs[0].id
        return data
    return None

def create_auth_token(user_id, email, role):
    token = secrets.token_urlsafe(32)
    token_data = {
        "token": token,
        "user_id": user_id,
        "email": email,
        "role": role,
        "created_at": datetime.utcnow(),
        "expires_at": datetime.utcnow() + timedelta(days=7),
    }
    fs_client.collection(TOKENS_COLLECTION).document(token).set(token_data)
    return token

def verify_token(token: str):
    doc = fs_client.collection(TOKENS_COLLECTION).document(token).get()
    if not doc.exists:
        return None
    data = doc.to_dict()
    if data["expires_at"] < datetime.utcnow():
        return None
    return data
