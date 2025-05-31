from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from src.domain.models.user import User
from src.domain.exceptions import UnauthorizedError, ForbiddenError 

def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user:
            raise UnauthorizedError("User not found.") 
        if user.role != "admin":
            raise ForbiddenError("Admins only! Access denied.") 
        return fn(*args, **kwargs)
    return wrapper

