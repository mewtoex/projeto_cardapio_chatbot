from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from src.models.user import User, db
from src.models.address import Address

user_profile_bp = Blueprint("user_profile_bp", __name__, url_prefix="/api/users")

@user_profile_bp.route("/me", methods=["GET"])
@jwt_required()
def get_my_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    return jsonify(user.to_dict(include_addresses=True)), 200

@user_profile_bp.route("/me", methods=["PUT"])
@jwt_required()
def update_my_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"message": "Request body is missing JSON"}), 400

    if "name" in data:
        user.name = data["name"]
    if "phone" in data:
        user.phone = data["phone"]
    
    # Password update requires current password for security, or a separate endpoint
    if "new_password" in data and "current_password" in data:
        if user.check_password(data["current_password"]):
            user.set_password(data["new_password"])
        else:
            return jsonify({"message": "Current password is incorrect"}), 400
    elif "new_password" in data and not "current_password" in data:
        return jsonify({"message": "Current password is required to set a new password"}), 400

    try:
        db.session.commit()
        return jsonify(user.to_dict(include_addresses=True)), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Could not update profile", "error": str(e)}), 500

@user_profile_bp.route("/me/addresses", methods=["POST"])
@jwt_required()
def add_my_address():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    data = request.get_json()
    required_fields = ["street", "number", "district", "city", "state", "cep"]
    if not data or not all(field in data for field in required_fields):
        return jsonify({"message": f"Missing required fields: {required_fields}"}), 400

    # If this is the only address, or if is_primary is explicitly true and no other primary exists, set it.
    # For simplicity, new addresses are not primary unless specified and handled.
    is_primary = data.get("is_primary", False)
    if is_primary:
        # Ensure only one primary address
        Address.query.filter_by(user_id=current_user_id, is_primary=True).update({"is_primary": False})

    new_address = Address(
        user_id=current_user_id,
        street=data["street"],
        number=data["number"],
        complement=data.get("complement"),
        district=data["district"],
        city=data["city"],
        state=data["state"],
        cep=data["cep"],
        is_primary=is_primary
    )
    try:
        db.session.add(new_address)
        db.session.commit()
        return jsonify(new_address.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Could not add address", "error": str(e)}), 500

@user_profile_bp.route("/me/addresses", methods=["GET"])
@jwt_required()
def get_my_addresses():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    addresses = Address.query.filter_by(user_id=current_user_id).all()
    return jsonify([address.to_dict() for address in addresses]), 200

@user_profile_bp.route("/me/addresses/<int:address_id>", methods=["PUT"])
@jwt_required()
def update_my_address(address_id):
    current_user_id = get_jwt_identity()
    address = Address.query.filter_by(id=address_id, user_id=current_user_id).first()
    if not address:
        return jsonify({"message": "Address not found or does not belong to user"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"message": "Request body is missing JSON"}), 400

    address.street = data.get("street", address.street)
    address.number = data.get("number", address.number)
    address.complement = data.get("complement", address.complement)
    address.district = data.get("district", address.district)
    address.city = data.get("city", address.city)
    address.state = data.get("state", address.state)
    address.cep = data.get("cep", address.cep)
    
    if "is_primary" in data and data["is_primary"] == True:
        Address.query.filter_by(user_id=current_user_id, is_primary=True).update({"is_primary": False})
        address.is_primary = True
    elif "is_primary" in data and data["is_primary"] == False:
        # Prevent unsetting primary if it's the only address, or handle logic to set another as primary
        address.is_primary = False

    try:
        db.session.commit()
        return jsonify(address.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Could not update address", "error": str(e)}), 500

@user_profile_bp.route("/me/addresses/<int:address_id>", methods=["DELETE"])
@jwt_required()
def delete_my_address(address_id):
    current_user_id = get_jwt_identity()
    address = Address.query.filter_by(id=address_id, user_id=current_user_id).first()
    if not address:
        return jsonify({"message": "Address not found or does not belong to user"}), 404
    
    # Add logic: if it is primary and other addresses exist, prompt to set another primary or handle automatically.
    # For now, simple delete.
    try:
        db.session.delete(address)
        db.session.commit()
        return jsonify({"message": "Address deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Could not delete address", "error": str(e)}), 500

@user_profile_bp.route("/me/addresses/<int:address_id>/set_primary", methods=["PATCH"])
@jwt_required()
def set_primary_address(address_id):
    current_user_id = get_jwt_identity()
    address_to_set_primary = Address.query.filter_by(id=address_id, user_id=current_user_id).first()

    if not address_to_set_primary:
        return jsonify({"message": "Address not found or does not belong to user"}), 404

    try:
        # Set all other addresses for this user to not primary
        Address.query.filter(Address.user_id == current_user_id, Address.id != address_id).update({"is_primary": False})
        # Set the selected address to primary
        address_to_set_primary.is_primary = True
        db.session.commit()
        return jsonify(address_to_set_primary.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Could not set primary address", "error": str(e)}), 500

# TODO: Admin routes for managing all users (GET /, GET /<id>, PUT /<id>, DELETE /<id>)
# These would require an admin role check decorator.

