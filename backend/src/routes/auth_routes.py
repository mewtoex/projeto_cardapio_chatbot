from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity

from src.models.user import User, db
from src.models.address import Address

auth_bp = Blueprint("auth_bp", __name__, url_prefix="/api/auth")

@auth_bp.route("/register", methods=["POST"])
def register_user():
    data = request.get_json()
    address_data = data.get("address", {})
    print(address_data)

    if not data:
        return jsonify({"message": "Request body is missing JSON"}), 400

    required_fields = ["name", "email", "password", "phone", "street", "number", "district", "city", "state", "cep"]
    address_required = ["street", "number", "district", "city", "state", "cep"]

    missing_fields = []
    for field in ["name", "email", "password", "phone"]:
         if field not in data or not data[field]:
            missing_fields.append(field)
    for field in address_required:
        if field not in address_data or not address_data[field]:
            missing_fields.append(f"address.{field}")

    if missing_fields:
        return jsonify({"message": f"Missing required fields: {', '.join(missing_fields)}"}), 400

    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"message": "Email already registered"}), 409 # 409 Conflict

    try:
        new_user = User(
            name=data["name"],
            email=data["email"],
            phone=data["phone"],
            role='client' 
        )
        new_user.set_password(data["password"]) # Hashes the password
        db.session.add(new_user)
        db.session.flush() # Flush to get new_user.id for the address
        new_address = Address(
            user_id=new_user.id,
            street=address_data["street"],
            number=address_data["number"],
            complement=address_data.get("complement"),
            district=address_data["district"],
            city=address_data["city"],
            state=address_data["state"],
            cep=address_data["cep"],
            is_primary=True # First address is primary
        )
        db.session.add(new_address)
        db.session.commit()

        # Create tokens
        access_token = create_access_token(identity=str(new_user.id))
        # refresh_token = create_refresh_token(identity=new_user.id) # Optional

        user_data = new_user.to_dict(include_addresses=True)

        return jsonify({
            "message": "User registered successfully",
            "user": user_data,
            "access_token": access_token,
            # "refresh_token": refresh_token
        }), 201

    except Exception as e:
        db.session.rollback()
        # Log the error e for debugging
        print(f"Error during registration: {str(e)}")
        return jsonify({"message": "Could not register user. Please try again later.", "error": str(e)}), 500

@auth_bp.route("/login", methods=["POST"])
def login_user():
    data = request.get_json()
    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"message": "Email and password are required"}), 400

    user = User.query.filter_by(email=data["email"]).first()

    if user and user.check_password(data["password"]):
        access_token = create_access_token(identity=str(user.id))
        # refresh_token = create_refresh_token(identity=user.id) # Optional
        
        user_data = user.to_dict() # Basic user data, can be expanded
        user_data["role"] = user.role # Ensure role is included

        return jsonify({
            "message": "Login successful",
            "access_token": access_token,
            # "refresh_token": refresh_token,
            "user": user_data
        }), 200
    else:
        return jsonify({"message": "Invalid email or password"}), 401



@auth_bp.route("/admin", methods=["POST"])
def login_admin():
    data = request.get_json()
    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"message": "Email and password are required"}), 400

    user = User.query.filter_by(email=data["email"]).first()

    if user and user.check_password(data["password"]):
        access_token = create_access_token(identity=str(user.id))

        user_data = user.to_dict() 
        user_data["role"] = user.role 
        print(user_data["role"])

        if('admin' != user_data["role"]):
            return jsonify({"message": "User not admin"}), 401

        return jsonify({
            "message": "Login successful",
            "access_token": access_token,
            "user": user_data
        }), 200
    else:
        return jsonify({"message": "Invalid email or password"}), 401
