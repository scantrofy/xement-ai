from fastapi import APIRouter, HTTPException, Depends, status
from app.models.user_model import UserSignup, UserUpdate
from app.services.user_management_service import (
    get_all_users,
    create_user_by_admin,
    update_user,
    delete_user,
    get_user_by_id,
)
from app.middleware.auth import require_auth, require_admin

router = APIRouter(prefix="/admin/users", tags=["User Management"])

@router.get("")
def list_users(user=Depends(require_admin)):
    """Get all users - Admin only"""
    return get_all_users()

@router.post("")
def create_new_user(user_data: UserSignup, current_user=Depends(require_admin)):
    """Create new user - Admin only"""
    return create_user_by_admin(user_data)

@router.get("/{user_id}")
def get_user(user_id: str, current_user=Depends(require_admin)):
    """Get user by ID - Admin only"""
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/{user_id}")
def update_user_info(user_id: str, user_data: UserUpdate, current_user=Depends(require_admin)):
    """Update user info - Admin only"""
    return update_user(user_id, user_data)

@router.delete("/{user_id}")
def delete_user_account(user_id: str, current_user=Depends(require_admin)):
    """Delete user - Admin only"""
    return delete_user(user_id)
