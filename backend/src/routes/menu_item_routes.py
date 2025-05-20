from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required
from werkzeug.utils import secure_filename
import os

from src.models.menu_item import MenuItem, db
from src.models.category import Category # Import Category if needed for validation or display
from src.routes.order_routes import admin_required # Re-use admin_required decorator

menu_item_bp = Blueprint("menu_item_bp", __name__, url_prefix="/api/menu_items")

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}

def allowed_file(filename):
    return "." in filename and \
           filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# --- Public/Client Routes ---
@menu_item_bp.route("", methods=["GET"])
def get_menu_items():
    category_id_filter = request.args.get("category_id")
    name_filter = request.args.get("name")
    availability_filter = request.args.get("disponivel", type=lambda v: v.lower() == "true")
    query = MenuItem.query
    if category_id_filter:
        query = query.filter(MenuItem.category_id == category_id_filter)
    if name_filter:
        query = query.filter(MenuItem.name.ilike(f"%{name_filter}%"))
    #if availability_filter is not None:
    #   query = query.filter(MenuItem.available == availability_filter)
    
    items = query.order_by(MenuItem.name).all()
    return jsonify([item.to_dict() for item in items]), 200


@menu_item_bp.route("/<int:item_id>", methods=["GET"])
def get_menu_item_detail(item_id):
    item = MenuItem.query.get(item_id)
    if not item:
        return jsonify({"message": "Menu item not found"}), 404
    return jsonify(item.to_dict()), 200

# --- Admin Routes ---
@menu_item_bp.route("/admin", methods=["POST"])
@jwt_required()
@admin_required
def create_menu_item_admin():
    data = request.form # Use request.form for multipart/form-data
    
    required_fields = ["name", "description", "price", "category_id"]
    if not all(field in data for field in required_fields):
        return jsonify({"message": f"Missing required fields: {required_fields}"}), 400

    # Validate category_id
    category = Category.query.get(data["category_id"])
    if not category:
        return jsonify({"message": "Invalid category_id"}), 400

    try:
        price = float(data["price"])
        if price <= 0:
            raise ValueError("Price must be positive")
    except ValueError:
        return jsonify({"message": "Invalid price format"}), 400

    new_item = MenuItem(
        name=data["name"],
        description=data["description"],
        price=price,
        category_id=data["category_id"],
        available=data.get("available", "true").lower() == "true"
    )

    if "image" in request.files:
        file = request.files["image"]
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            # Ensure unique filename to prevent overwrites, e.g., by prefixing with item ID or timestamp
            # For now, simple save. This needs improvement for production (e.g. UUID for filename)
            save_path = os.path.join(current_app.config["UPLOAD_FOLDER"], filename)
            file.save(save_path)
            new_item.image_url = f"/static/uploads/{filename}" # URL to access the image
        elif file.filename != "": # File was provided but not allowed
             return jsonify({"message": "File type not allowed"}), 400

    try:
        db.session.add(new_item)
        db.session.commit()
        return jsonify(new_item.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Could not create menu item", "error": str(e)}), 500

@menu_item_bp.route("/admin/<int:item_id>", methods=["PUT"])
@jwt_required()
@admin_required
def update_menu_item_admin(item_id):
    item = MenuItem.query.get(item_id)
    if not item:
        return jsonify({"message": "Menu item not found"}), 404

    data = request.form # Use request.form for multipart/form-data
    if not data and not request.files:
        return jsonify({"message": "Request body or files missing"}), 400

    item.name = data.get("name", item.name)
    item.description = data.get("description", item.description)
    if "price" in data:
        try:
            price = float(data["price"])
            if price <= 0: raise ValueError("Price must be positive")
            item.price = price
        except ValueError:
            return jsonify({"message": "Invalid price format"}), 400
    if "category_id" in data:
        category = Category.query.get(data["category_id"])
        if not category:
            return jsonify({"message": "Invalid category_id"}), 400
        item.category_id = data["category_id"]
    if "available" in data:
        item.available = data.get("available").lower() == "true"

    if "image" in request.files:
        file = request.files["image"]
        if file and allowed_file(file.filename):
            # Optional: Delete old image if it exists and is different
            # if item.image_url and os.path.exists(os.path.join(current_app.config["UPLOAD_FOLDER"], os.path.basename(item.image_url))):
            #     os.remove(os.path.join(current_app.config["UPLOAD_FOLDER"], os.path.basename(item.image_url)))
            filename = secure_filename(file.filename)
            save_path = os.path.join(current_app.config["UPLOAD_FOLDER"], filename)
            file.save(save_path)
            item.image_url = f"/static/uploads/{filename}"
        elif file.filename != "":
            return jsonify({"message": "File type not allowed"}), 400

    try:
        db.session.commit()
        return jsonify(item.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Could not update menu item", "error": str(e)}), 500

@menu_item_bp.route("/admin/<int:item_id>", methods=["DELETE"])
@jwt_required()
@admin_required
def delete_menu_item_admin(item_id):
    item = MenuItem.query.get(item_id)
    if not item:
        return jsonify({"message": "Menu item not found"}), 404
    
    # Optional: Delete image file from server
    # if item.image_url and os.path.exists(os.path.join(current_app.config["UPLOAD_FOLDER"], os.path.basename(item.image_url))):
    #     try:
    #         os.remove(os.path.join(current_app.config["UPLOAD_FOLDER"], os.path.basename(item.image_url)))
    #     except OSError as e:
    #         print(f"Error deleting image file: {e.strerror}") # Log error

    try:
        db.session.delete(item)
        db.session.commit()
        return jsonify({"message": "Menu item deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Could not delete menu item", "error": str(e)}), 500

@menu_item_bp.route("/admin/<int:item_id>/availability", methods=["PATCH"])
@jwt_required()
@admin_required
def toggle_menu_item_availability_admin(item_id):
    item = MenuItem.query.get(item_id)
    if not item:
        return jsonify({"message": "Menu item not found"}), 404

    data = request.get_json()
    if "available" not in data or not isinstance(data["available"], bool):
        return jsonify({"message": "Invalid or missing \"available\" field (must be boolean)"}), 400

    item.available = data["available"]
    try:
        db.session.commit()
        return jsonify(item.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Could not update item availability", "error": str(e)}), 500

# Note: Reordering items (PATCH /admin/reorder) would require a more complex logic, 
# potentially adding an `order_index` field to MenuItem and updating it for multiple items in a transaction.
# This is a placeholder if that functionality is needed.

