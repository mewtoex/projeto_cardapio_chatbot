from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from src.models.addon import AddonCategory, AddonOption, db
from src.routes.order_routes import admin_required # Re-use admin_required decorator

addon_bp = Blueprint("addon_bp", __name__, url_prefix="/api/addons")

# --- Rotas para AddonCategory (Admin) ---
@addon_bp.route("/categories", methods=["POST"])
@jwt_required()
@admin_required
def create_addon_category():
    data = request.get_json()
    if not data or not "name" in data:
        return jsonify({"message": "Missing addon category name"}), 400

    new_category = AddonCategory(
        name=data["name"],
        min_selections=data.get("min_selections", 0),
        max_selections=data.get("max_selections", 0),
        is_required=data.get("is_required", False)
    )
    try:
        db.session.add(new_category)
        db.session.commit()
        return jsonify(new_category.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error creating addon category", "error": str(e)}), 500

@addon_bp.route("/categories", methods=["GET"])
def get_addon_categories():
    categories = AddonCategory.query.all()
    return jsonify([cat.to_dict() for cat in categories]), 200

@addon_bp.route("/categories/<int:category_id>", methods=["PUT"])
@jwt_required()
@admin_required
def update_addon_category(category_id):
    category = AddonCategory.query.get_or_404(category_id)
    data = request.get_json()

    if "name" in data:
        category.name = data["name"]
    if "min_selections" in data:
        category.min_selections = data["min_selections"]
    if "max_selections" in data:
        category.max_selections = data["max_selections"]
    if "is_required" in data:
        category.is_required = data["is_required"]

    try:
        db.session.commit()
        return jsonify(category.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error updating addon category", "error": str(e)}), 500

@addon_bp.route("/categories/<int:category_id>", methods=["DELETE"])
@jwt_required()
@admin_required
def delete_addon_category(category_id):
    category = AddonCategory.query.get_or_404(category_id)
    if category.options.count() > 0:
        return jsonify({"message": "Cannot delete category with associated options."}), 400
    if category.menu_items.count() > 0: # Verifica se está associada a algum item
        return jsonify({"message": "Cannot delete category associated with menu items."}), 400

    try:
        db.session.delete(category)
        db.session.commit()
        return jsonify({"message": "Addon category deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error deleting addon category", "error": str(e)}), 500

# --- Rotas para AddonOption (Admin) ---
@addon_bp.route("/categories/<int:category_id>/options", methods=["POST"])
@jwt_required()
@admin_required
def create_addon_option(category_id):
    category = AddonCategory.query.get_or_404(category_id)
    data = request.get_json()
    if not data or not "name" in data or not "price" in data:
        return jsonify({"message": "Missing addon option name or price"}), 400

    try:
        price = float(data["price"])
        if price < 0:
            raise ValueError("Price cannot be negative")
    except ValueError:
        return jsonify({"message": "Invalid price format"}), 400

    new_option = AddonOption(
        addon_category_id=category.id,
        name=data["name"],
        price=price
    )
    try:
        db.session.add(new_option)
        db.session.commit()
        return jsonify(new_option.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error creating addon option", "error": str(e)}), 500

@addon_bp.route("/options/<int:option_id>", methods=["PUT"])
@jwt_required()
@admin_required
def update_addon_option(option_id):
    option = AddonOption.query.get_or_404(option_id)
    data = request.get_json()

    if "name" in data:
        option.name = data["name"]
    if "price" in data:
        try:
            price = float(data["price"])
            if price < 0: raise ValueError("Price cannot be negative")
            option.price = price
        except ValueError:
            return jsonify({"message": "Invalid price format"}), 400
    
    try:
        db.session.commit()
        return jsonify(option.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error updating addon option", "error": str(e)}), 500

@addon_bp.route("/options/<int:option_id>", methods=["DELETE"])
@jwt_required()
@admin_required
def delete_addon_option(option_id):
    option = AddonOption.query.get_or_404(option_id)
    try:
        db.session.delete(option)
        db.session.commit()
        return jsonify({"message": "Addon option deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error deleting addon option", "error": str(e)}), 500