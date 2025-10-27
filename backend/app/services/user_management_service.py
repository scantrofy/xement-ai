from fastapi import HTTPException, status
from app.utils.security import hash_password
from app.services.firestore_service import fs_client, get_user_by_email
from app.models.user_model import UserSignup, UserUpdate
from datetime import datetime

def get_all_users():
    """Get all users from Firestore"""
    try:
        users_ref = fs_client.collection("users")
        docs = users_ref.stream()
        users = []
        for doc in docs:
            user_data = doc.to_dict()
            user_data["id"] = doc.id
            # Remove sensitive data
            user_data.pop("password", None)
            users.append(user_data)
        return {"users": users, "total": len(users)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching users: {str(e)}")

def get_user_by_id(user_id: str):
    """Get user by ID"""
    try:
        doc = fs_client.collection("users").document(user_id).get()
        if not doc.exists:
            return None
        user_data = doc.to_dict()
        user_data["id"] = doc.id
        # Remove sensitive data
        user_data.pop("password", None)
        return user_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user: {str(e)}")

def create_user_by_admin(user_data: UserSignup):
    """Create new user by admin - stores in Firestore with hashed password"""
    try:
        # Check if email already exists
        existing_user = get_user_by_email(user_data.email)
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Validate role
        if user_data.role not in ["admin", "operator"]:
            raise HTTPException(status_code=400, detail="Invalid role. Must be 'admin' or 'operator'")
        
        # Hash password
        hashed_password = hash_password(user_data.password)
        
        # Create Firestore user document
        user_doc = {
            "email": user_data.email,
            "password": hashed_password,
            "full_name": user_data.full_name,
            "organization": user_data.organization,
            "role": user_data.role,
            "is_active": True,
            "created_at": datetime.utcnow(),
        }
        
        # Add to Firestore (auto-generates document ID)
        doc_ref = fs_client.collection("users").add(user_doc)
        user_id = doc_ref[1].id
        
        return {
            "id": user_id,
            "email": user_data.email,
            "full_name": user_data.full_name,
            "organization": user_data.organization,
            "role": user_data.role,
            "is_active": True,
            "created_at": user_doc["created_at"],
            "message": "User created successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating user: {str(e)}")

def update_user(user_id: str, user_data: UserUpdate):
    """Update user information"""
    try:
        user_ref = fs_client.collection("users").document(user_id)
        
        if not user_ref.get().exists:
            raise HTTPException(status_code=404, detail="User not found")
        
        update_dict = {}
        
        if user_data.full_name is not None:
            update_dict["full_name"] = user_data.full_name
        
        if user_data.role is not None:
            if user_data.role not in ["admin", "operator"]:
                raise HTTPException(status_code=400, detail="Invalid role")
            update_dict["role"] = user_data.role
        
        if user_data.is_active is not None:
            update_dict["is_active"] = user_data.is_active
        
        if user_data.organization is not None:
            update_dict["organization"] = user_data.organization
        
        update_dict["updated_at"] = datetime.utcnow()
        
        user_ref.update(update_dict)
        
        # Return updated user
        updated_user = user_ref.get().to_dict()
        updated_user["id"] = user_id
        updated_user.pop("password", None)
        
        return {"message": "User updated successfully", "user": updated_user}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating user: {str(e)}")

def delete_user(user_id: str):
    """Delete user from Firestore"""
    try:
        user_ref = fs_client.collection("users").document(user_id)
        
        if not user_ref.get().exists:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Delete from Firestore
        user_ref.delete()
        
        return {"message": "User deleted successfully", "user_id": user_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting user: {str(e)}")
