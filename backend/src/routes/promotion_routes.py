from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from sqlalchemy.exc import IntegrityError

from src.models.promotion import Promotion, db
from src.routes.order_routes import admin_required # Re-use admin_required decorator

promotion_bp = Blueprint("promotion_bp", __name__, url_prefix="/api/promotions")

# --- Public/Client Routes ---
@promotion_bp.route("", methods=["GET"])
def get_active_promotions():
    # Add filtering for active promotions, date ranges, etc.
    promotions = Promotion.query.filter_by(active=True).all() # Example: only active
    return jsonify([p.to_dict() for p in promotions]), 200

@promotion_bp.route("/<int:promotion_id>", methods=["GET"])
def get_promotion_details(promotion_id):
    promotion = Promotion.query.get(promotion_id)
    if not promotion:
        return jsonify({"message": "Promotion not found"}), 404
    return jsonify(promotion.to_dict()), 200

# --- Admin Routes ---
@promotion_bp.route("/admin", methods=["POST"])
@jwt_required()
@admin_required
def create_promotion_admin():
    data = request.get_json()
    required_fields = ["name", "description"]
    if not data or not all(field in data for field in required_fields):
        return jsonify({"message": f"Missing required fields: {required_fields}"}), 400

    new_promotion = Promotion(
        name=data["name"],
        description=data["description"],
        discount_percentage=data.get("discount_percentage"),
        discount_fixed_amount=data.get("discount_fixed_amount"),
        start_date=data.get("start_date"),
        end_date=data.get("end_date"),
        active=data.get("active", True)
    )
    try:
        db.session.add(new_promotion)
        db.session.commit()
        return jsonify(new_promotion.to_dict()), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Error creating promotion. Check data integrity (e.g., unique constraints)."}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Could not create promotion", "error": str(e)}), 500

@promotion_bp.route("/admin/all", methods=["GET"])
@jwt_required()
@admin_required
def get_all_promotions_admin():
    promotions = Promotion.query.all()
    return jsonify([p.to_dict() for p in promotions]), 200

@promotion_bp.route("/admin/<int:promotion_id>", methods=["PUT"])
@jwt_required()
@admin_required
def update_promotion_admin(promotion_id):
    promotion = Promotion.query.get(promotion_id)
    if not promotion:
        return jsonify({"message": "Promotion not found"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"message": "Request body is missing JSON"}), 400

    promotion.name = data.get("name", promotion.name)
    promotion.description = data.get("description", promotion.description)
    promotion.discount_percentage = data.get("discount_percentage", promotion.discount_percentage)
    promotion.discount_fixed_amount = data.get("discount_fixed_amount", promotion.discount_fixed_amount)
    promotion.start_date = data.get("start_date", promotion.start_date)
    promotion.end_date = data.get("end_date", promotion.end_date)
    promotion.active = data.get("active", promotion.active)

    try:
        db.session.commit()
        return jsonify(promotion.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Could not update promotion", "error": str(e)}), 500

@promotion_bp.route("/admin/<int:promotion_id>", methods=["DELETE"])
@jwt_required()
@admin_required
def delete_promotion_admin(promotion_id):
    promotion = Promotion.query.get(promotion_id)
    if not promotion:
        return jsonify({"message": "Promotion not found"}), 404
    
    try:
        db.session.delete(promotion)
        db.session.commit()
        return jsonify({"message": "Promotion deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Could not delete promotion", "error": str(e)}), 500

