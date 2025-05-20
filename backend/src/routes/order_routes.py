from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import desc # For ordering

from src.models.user import User, db
from src.models.order import Order
from src.models.order_item import OrderItem
from src.models.menu_item import MenuItem
from src.models.address import Address

from functools import wraps
def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user or user.role != "admin":
            return jsonify(message="Admins only! Access denied."), 403
        return fn(*args, **kwargs)
    return wrapper

order_bp = Blueprint("order_bp", __name__, url_prefix="/api/orders")

@order_bp.route("", methods=["POST"])
@jwt_required()
def create_client_order():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    required_fields = ["address_id", "payment_method", "items"]
    if not data or not all(field in data for field in required_fields):
        return jsonify({"message": f"Missing required fields: {required_fields}"}), 400
    if not isinstance(data["items"], list) or not data["items"]:
        return jsonify({"message": "Items list cannot be empty"}), 400

    address = Address.query.filter_by(id=data["address_id"], user_id=current_user_id).first()
    if not address:
        return jsonify({"message": "Invalid address or address does not belong to user"}), 404

    total_amount = 0
    order_items_to_create = []

    for item_data in data["items"]:
        menu_item_id = item_data.get("menu_item_id")
        quantity = item_data.get("quantity")
        if not menu_item_id or not isinstance(quantity, int) or quantity <= 0:
            return jsonify({"message": f"Invalid item data: {item_data}"}), 400
        
        menu_item = MenuItem.query.get(menu_item_id)
        if not menu_item or not menu_item.available:
            return jsonify({"message": f"Menu item {menu_item_id} not found or unavailable"}), 404
        
        price_at_order_time = menu_item.price
        total_amount += price_at_order_time * quantity
        order_items_to_create.append(OrderItem(
            menu_item_id=menu_item_id,
            quantity=quantity,
            price_at_order_time=price_at_order_time
        ))

    if not order_items_to_create:
         return jsonify({"message": "No valid items to order"}), 400

    try:
        new_order = Order(
            user_id=current_user_id,
            address_id=data["address_id"],
            payment_method=data["payment_method"],
            cash_provided=data.get("cash_provided") if data["payment_method"] == "dinheiro" else None,
            total_amount=total_amount,
            status="Recebido" # Initial status
        )
        db.session.add(new_order)
        db.session.flush() # Get new_order.id

        for oi_to_create in order_items_to_create:
            oi_to_create.order_id = new_order.id
            db.session.add(oi_to_create)
        
        db.session.commit()
        return jsonify(new_order.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Could not create order", "error": str(e)}), 500

@order_bp.route("", methods=["GET"])
@jwt_required()
def get_client_orders():
    current_user_id = get_jwt_identity()
    # TODO: Add pagination
    orders = Order.query.filter_by(user_id=current_user_id).order_by(desc(Order.order_date)).all()
    return jsonify([order.to_short_dict() for order in orders]), 200

@order_bp.route("/<int:order_id>", methods=["GET"])
@jwt_required()
def get_client_order_details(order_id):
    current_user_id = get_jwt_identity()
    order = Order.query.filter_by(id=order_id, user_id=current_user_id).first()
    if not order:
        return jsonify({"message": "Order not found or does not belong to user"}), 404
    return jsonify(order.to_dict()), 200

@order_bp.route("/<int:order_id>/cancel", methods=["PATCH"])
@jwt_required()
def cancel_client_order(order_id):
    current_user_id = get_jwt_identity()
    order = Order.query.filter_by(id=order_id, user_id=current_user_id).first()
    if not order:
        return jsonify({"message": "Order not found or does not belong to user"}), 404

    # Define statuses where client can directly cancel or request cancellation
    cancellable_statuses = ["Recebido"]
    request_cancellation_statuses = ["Em preparo"] # Example

    if order.status in cancellable_statuses:
        order.status = "Cancelado"
    elif order.status in request_cancellation_statuses:
        order.status = "Cancelamento Solicitado"
    else:
        return jsonify({"message": f"Order in status 	riggers {order.status}\' cannot be cancelled or requested for cancellation by client at this stage."}), 400

    try:
        db.session.commit()
        return jsonify(order.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Could not update order status", "error": str(e)}), 500

# --- Admin Order Routes ---
@order_bp.route("/admin", methods=["GET"])
@jwt_required()
@admin_required
def get_all_orders_admin():
    # TODO: Add filtering (status, date range, client_id) and pagination
    status_filter = request.args.get("status")
    query = Order.query
    if status_filter:
        query = query.filter(Order.status == status_filter)
    
    orders = query.order_by(desc(Order.order_date)).all()
    return jsonify([order.to_dict() for order in orders]), 200 # Full dict for admin

@order_bp.route("/admin/<int:order_id>", methods=["GET"])
@jwt_required()
@admin_required
def get_order_details_admin(order_id):
    order = Order.query.get(order_id)
    if not order:
        return jsonify({"message": "Order not found"}), 404
    return jsonify(order.to_dict()), 200

@order_bp.route("/admin/<int:order_id>/status", methods=["PATCH"])
@jwt_required()
@admin_required
def update_order_status_admin(order_id):
    order = Order.query.get(order_id)
    if not order:
        return jsonify({"message": "Order not found"}), 404

    data = request.get_json()
    new_status = data.get("status")
    if not new_status:
        return jsonify({"message": "New status is required"}), 400
    
    # TODO: Validate new_status against a list of allowed statuses
    allowed_statuses = ["Recebido", "Em preparo", "Saiu para entrega", "Concluído", "Cancelado"]
    if new_status not in allowed_statuses:
        return jsonify({"message": f"Invalid status: {new_status}. Allowed: {allowed_statuses}"}), 400

    order.status = new_status
    try:
        db.session.commit()
        return jsonify(order.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Could not update order status", "error": str(e)}), 500

@order_bp.route("/admin/<int:order_id>/approve_cancellation", methods=["PATCH"])
@jwt_required()
@admin_required
def approve_order_cancellation_admin(order_id):
    order = Order.query.get(order_id)
    if not order:
        return jsonify({"message": "Order not found"}), 404
    if order.status != "Cancelamento Solicitado":
        return jsonify({"message": "Order is not awaiting cancellation approval"}), 400
    
    order.status = "Cancelado"
    try:
        db.session.commit()
        # TODO: Add logic for stock refund, notifications, etc.
        return jsonify(order.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Could not approve cancellation", "error": str(e)}), 500

@order_bp.route("/admin/<int:order_id>/reject_cancellation", methods=["PATCH"])
@jwt_required()
@admin_required
def reject_order_cancellation_admin(order_id):
    order = Order.query.get(order_id)
    if not order:
        return jsonify({"message": "Order not found"}), 404
    if order.status != "Cancelamento Solicitado":
        return jsonify({"message": "Order is not awaiting cancellation approval"}), 400
    
    # Revert to a previous status or a specific status like "Em preparo"
    # For simplicity, let's assume it goes back to "Em preparo" or the admin sets it via /status endpoint
    order.status = "Em preparo" # Or the status before "Cancelamento Solicitado"
    try:
        db.session.commit()
        return jsonify(order.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Could not reject cancellation", "error": str(e)}), 500

