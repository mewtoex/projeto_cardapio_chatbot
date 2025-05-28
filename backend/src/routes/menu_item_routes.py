from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required
from werkzeug.utils import secure_filename
from static.uploads.img import img_upload
import os

from src.models.menu_item import MenuItem, db
from src.models.category import Category
from src.models.addon import AddonCategory # Importe AddonCategory
from src.routes.order_routes import admin_required

menu_item_bp = Blueprint("menu_item_bp", __name__, url_prefix="/api/menu_items")

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}

def allowed_file(filename):
    return "." in filename and \
           filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

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
    if availability_filter is not None:
       query = query.filter(MenuItem.available == availability_filter)
    
    items = query.order_by(MenuItem.name).all()
    # Não inclua adicionais aqui para evitar sobrecarga em listagens
    return jsonify([item.to_dict() for item in items]), 200


@menu_item_bp.route("/<int:item_id>", methods=["GET"])
def get_menu_item_detail(item_id):
    item = MenuItem.query.get(item_id)
    if not item:
        return jsonify({"message": "Menu item not found"}), 404
    # Inclua os adicionais para a visualização detalhada
    return jsonify(item.to_dict(include_addons=True)), 200

@menu_item_bp.route("/admin", methods=["POST"])
@jwt_required()
@admin_required
def create_menu_item_admin():
    data = request.form
    required_fields = ["name", "description", "price", "category_id"]

    img_url_serv = img_upload(request)
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

    has_addons = data.get("has_addons", "false").lower() == "true"
    addon_category_ids = request.form.getlist("addon_category_ids[]") # Espera uma lista de IDs

    new_item = MenuItem(
        name=data["name"],
        description=data["description"],
        price=price,
        category_id=data["category_id"],
        available=data.get("available", "true").lower() == "true",
        image_url=img_url_serv,
        has_addons=has_addons 
    )

    if has_addons and addon_category_ids:
        for cat_id in addon_category_ids:
            addon_cat = AddonCategory.query.get(cat_id)
            if addon_cat:
                new_item.addon_categories.append(addon_cat)
            else:
                return jsonify({"message": f"Addon Category with ID {cat_id} not found."}), 400
    elif has_addons and not addon_category_ids:
        return jsonify({"message": "Item marked as having addons but no addon categories provided."}), 400

    try:
        db.session.add(new_item)
        db.session.commit()
        return jsonify(new_item.to_dict(include_addons=True)), 201
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

    data = request.form
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
    
    # Atualizar has_addons e as associações
    if "has_addons" in data:
        item.has_addons = data.get("has_addons").lower() == "true"
        if item.has_addons:
            addon_category_ids = request.form.getlist("addon_category_ids[]")
            if not addon_category_ids:
                return jsonify({"message": "Item marked as having addons but no addon categories provided for update."}), 400
            
            item.addon_categories.clear()
            for cat_id in addon_category_ids:
                addon_cat = AddonCategory.query.get(cat_id)
                if addon_cat:
                    item.addon_categories.append(addon_cat)
                else:
                    return jsonify({"message": f"Addon Category with ID {cat_id} not found."}), 400
        else:
            item.addon_categories.clear()

    if "image" in request.files:
        file = request.files["image"]
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            save_path = os.path.join(current_app.config["UPLOAD_FOLDER"], filename)
            file.save(save_path)
            item.image_url = f"/static/uploads/{filename}"
        elif file.filename != "":
            return jsonify({"message": "File type not allowed"}), 400

    try:
        db.session.commit()
        return jsonify(item.to_dict(include_addons=True)), 200
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
    if "disponivel" not in data or not isinstance(data["disponivel"], bool):
        return jsonify({"message": "Invalid or missing \"available\" field (must be boolean)"}), 400
    
    item.available = data["disponivel"]
    try:
        db.session.commit()
        return jsonify(item.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Could not update item availability", "error": str(e)}), 500