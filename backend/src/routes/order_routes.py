from flask import Blueprint, request, jsonify, render_template, make_response # Adicionar render_template, make_response
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import desc, func, cast, Date
from datetime import datetime, date, timedelta
from weasyprint import HTML, CSS 
from src.models.user import User, db
from src.models.order import Order
from src.models.order_item import OrderItem
from src.models.menu_item import MenuItem
from src.models.address import Address
from src.models.addon import AddonOption, OrderItemAddon
from src.models.store import Store 

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
        observations = item_data.get("observations") # NOVO: Observações do item
        selected_addons_data = item_data.get("selected_addons", []) # NOVO: Adicionais selecionados

        if not menu_item_id or not isinstance(quantity, int) or quantity <= 0:
            return jsonify({"message": f"Invalid item data: {item_data}"}), 400
        
        menu_item = MenuItem.query.get(menu_item_id)
        if not menu_item or not menu_item.available:
            return jsonify({"message": f"Menu item {menu_item_id} not found or unavailable"}), 404
        
        price_at_order_time = menu_item.price
        
        # Processar adicionais selecionados
        order_item_addons_to_create = []
        for addon_data in selected_addons_data:
            addon_option_id = addon_data.get('id')
            addon_name = addon_data.get('name')
            addon_price = addon_data.get('price')

            if not addon_option_id or not addon_name or addon_price is None:
                return jsonify({"message": f"Invalid addon data: {addon_data}"}), 400
            
            # Opcional: validar se o addon_option_id existe e pertence ao menu_item
            # addon_option = AddonOption.query.get(addon_option_id)
            # if not addon_option or addon_option.price != addon_price: # ou outra validação mais complexa
            #     return jsonify({"message": f"Invalid addon option {addon_option_id} or price mismatch."}), 400

            price_at_order_time += addon_price
            order_item_addons_to_create.append(OrderItemAddon(
                addon_option_id=addon_option_id,
                addon_name=addon_name,
                addon_price=addon_price
            ))


        total_amount += price_at_order_time * quantity
        
        new_order_item = OrderItem(
            menu_item_id=menu_item_id,
            quantity=quantity,
            price_at_order_time=price_at_order_time,
            observations=observations, # Salva observações
            selected_addons_json=selected_addons_data # Salva JSON de adicionais para flexibilidade
        )
        # Adiciona os OrderItemAddon relacionados
        for oia in order_item_addons_to_create:
            new_order_item.selected_addons.append(oia)

        order_items_to_create.append(new_order_item)


    if not order_items_to_create:
         return jsonify({"message": "No valid items to order"}), 400

    try:
        new_order = Order(
            user_id=current_user_id,
            address_id=data["address_id"],
            payment_method=data["payment_method"],
            cash_provided=data.get("cash_provided") if data["payment_method"].lower() == "dinheiro" else None,
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
    request_cancellation_statuses = ["Em Preparo"] # Example

    if order.status in cancellable_statuses:
        order.status = "Cancelado"
    elif order.status in request_cancellation_statuses:
        order.status = "Cancelamento Solicitado"
    else:
        return jsonify({"message": f"Order in status {order.status} cannot be cancelled or requested for cancellation by client at this stage."}), 400

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
    print(new_status)

    if not new_status:
        return jsonify({"message": "New status is required"}), 400
    
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

@order_bp.route("order_items/<int:order_id>", methods=["GET"])
@jwt_required()
def get_order_Items(order_id):
    order_items = OrderItem.query.filter_by(order_id=order_id).all()
    if not order_items:
        return jsonify({"message": "Order items not found for this order"}), 404
    return jsonify([item.to_dict() for item in order_items])


@order_bp.route("resume", methods=["GET"])
@jwt_required()
@admin_required
def get_resume_orders_admin():
    status_filter = request.args.get("status")
    query = Order.query
    date_filter_str = request.args.get("order_date")
    if date_filter_str:
        try:
            filter_date = datetime.strptime(date_filter_str, "%Y-%m-%d").date()
        except ValueError:
            return jsonify({"error": "Formato de data inválido. Use YYYY-MM-DD."}), 400
    else:
        filter_date = date.today()
    if status_filter:
        query = query.filter(Order.status == status_filter)
    
    query = query.filter(cast(Order.order_date, Date) == filter_date)
    orders = query.order_by(desc(Order.order_date)).all()
    status_counts = db.session.query(Order.status, func.count(Order.id)).\
        filter(cast(Order.order_date, Date) == filter_date).\
        group_by(Order.status).\
        all()
    
    status_counts_dict = {status: count for status, count in status_counts}
    daily_total_amount = sum(order.total_amount for order in orders)

    response_data = {
        "status_counts": status_counts_dict,
        "filter_date": filter_date.isoformat(),
        "daily_total_amount": round(daily_total_amount, 2),
       
    }

    return jsonify(response_data), 200

# NOVO ENDPOINT: Imprimir Pedido (Admin)
@order_bp.route("/admin/<int:order_id>/print", methods=["GET"])
@jwt_required()
@admin_required
def print_order_admin(order_id):
    order = Order.query.get(order_id)
    if not order:
        return jsonify({"message": "Pedido não encontrado"}), 404

    # Para o template, precisamos dos detalhes completos do pedido e do endereço
    order_data = order.to_dict()
    
    # Busca o endereço associado ao pedido
    order_address = Address.query.get(order_data['address_id'])
    if order_address:
        order_data['address'] = order_address.to_dict()
    else:
        order_data['address'] = {'street': 'N/A', 'number': 'N/A', 'district': 'N/A', 'city': 'N/A', 'state': 'N/A', 'cep': 'N/A'}

    # Busca os detalhes da loja (assumindo uma loja principal por enquanto)
    main_store = Store.query.first() # Pega a primeira loja cadastrada
    if not main_store:
        return jsonify({"message": "Configurações da loja não encontradas para impressão."}), 500
    
    store_address = Address.query.get(main_store.address_id)
    if store_address:
        main_store.address = store_address # Anexa o objeto de endereço ao objeto da loja
    
    delivery_fee_for_receipt = 0.0
    if order_address:
        delivery_area = DeliveryArea.query.filter_by(
            store_id=main_store.id,
            district_name=order_address.district
        ).first()
        if delivery_area:
            delivery_fee_for_receipt = delivery_area.delivery_fee
    
    # Passando os dados para o template HTML
    rendered_html = render_template(
        "order_receipt.html",
        order=order_data,
        store=main_store,
        delivery_fee=delivery_fee_for_receipt,
        total_amount_items=(order.total_amount - delivery_fee_for_receipt) # Subtotal dos itens
    )

    # Gera o PDF
    pdf = HTML(string=rendered_html).write_pdf()

    response = make_response(pdf)
    response.headers["Content-Type"] = "application/pdf"
    response.headers["Content-Disposition"] = f"inline; filename=pedido_{order_id}.pdf"
    return response