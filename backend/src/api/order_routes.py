# backend/src/api/order_routes.py
from flask import Blueprint, request, jsonify, render_template, make_response
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, date
from io import BytesIO
from xhtml2pdf import pisa
from src.application.services.order_service import OrderService
from src.infrastructure.repositories.order_repository import OrderRepository
from src.infrastructure.repositories.user_repository import UserRepository
from src.infrastructure.repositories.address_repository import AddressRepository
from src.infrastructure.repositories.menu_item_repository import MenuItemRepository
from src.infrastructure.repositories.store_repository import StoreRepository
from src.infrastructure.repositories.delivery_area_repository import DeliveryAreaRepository
from src.infrastructure.database.extensions import db
from src.infrastructure.security.auth_utils import admin_required # Importar o decorador centralizado
from src.api.serializers.order_schema import OrderSchema, OrderItemSchema, OrderShortSchema, OrderCreateSchema # Importar schemas
from src.domain.exceptions import BadRequestError, NotFoundError # Exceções personalizadas

order_bp = Blueprint("order_bp", __name__, url_prefix="/api/orders")

# Inicialização dos repositórios e serviço
order_repository = OrderRepository(session=db.session)
user_repository = UserRepository(session=db.session)
address_repository = AddressRepository(session=db.session)
menu_item_repository = MenuItemRepository(session=db.session)
store_repository = StoreRepository(session=db.session)
delivery_area_repository = DeliveryAreaRepository(session=db.session)

order_service = OrderService(
    order_repository=order_repository,
    user_repository=user_repository,
    address_repository=address_repository,
    menu_item_repository=menu_item_repository,
    store_repository=store_repository,
    delivery_area_repository=delivery_area_repository
)

# Instâncias dos Schemas
order_schema = OrderSchema()
order_short_schema = OrderShortSchema(many=True)
order_items_schema = OrderItemSchema(many=True)
order_create_schema = OrderCreateSchema()


@order_bp.route("", methods=["POST"])
@jwt_required()
def create_client_order_route():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    validated_data = order_create_schema.load(data) # Valida a entrada

    new_order = order_service.create_order(
        user_id=int(current_user_id),
        address_id=validated_data['address_id'],
        payment_method=validated_data['payment_method'],
        items_data=validated_data['items'],
        cash_provided=validated_data.get('cash_provided')
    )
    return jsonify(order_schema.dump(new_order)), 201

@order_bp.route("", methods=["GET"])
@jwt_required()
def get_client_orders_route():
    current_user_id = get_jwt_identity()
    status_filter = request.args.get("status")
    start_date = request.args.get("data_inicio")
    end_date = request.args.get("data_fim")

    orders = order_service.get_client_orders(
        user_id=int(current_user_id),
        status_filter=status_filter,
        start_date=start_date,
        end_date=end_date
    )
    return jsonify(order_short_schema.dump(orders)), 200

@order_bp.route("/<int:order_id>", methods=["GET"])
@jwt_required()
def get_client_order_details_route(order_id: int):
    current_user_id = get_jwt_identity()
    order = order_service.get_client_order_details(order_id, int(current_user_id))
    return jsonify(order_schema.dump(order)), 200

@order_bp.route("/<int:order_id>/cancel", methods=["PATCH"])
@jwt_required()
def cancel_client_order_route(order_id: int):
    current_user_id = get_jwt_identity()
    updated_order = order_service.cancel_client_order(order_id, int(current_user_id))
    return jsonify(order_schema.dump(updated_order)), 200

@order_bp.route("order_items/<int:order_id>", methods=["GET"])
@jwt_required()
def get_order_items_route(order_id: int):
    order_items = order_service.get_order_items_by_order_id(order_id)
    return jsonify(order_items_schema.dump(order_items)), 200

# --- Admin Order Routes ---
@order_bp.route("/admin", methods=["GET"])
@jwt_required()
@admin_required
def get_all_orders_admin_route():
    status_filter = request.args.get("status")
    start_date = request.args.get("data_inicio")
    end_date = request.args.get("data_fim")
    client_id = request.args.get("cliente_id", type=int)

    orders = order_service.get_all_orders_admin(
        status_filter=status_filter,
        start_date=start_date,
        end_date=end_date,
        client_id=client_id
    )
    return jsonify(order_schema.dump(orders)), 200

@order_bp.route("/admin/<int:order_id>", methods=["GET"])
@jwt_required()
@admin_required
def get_order_details_admin_route(order_id: int):
    order = order_service.get_admin_order_details(order_id)
    return jsonify(order_schema.dump(order)), 200

@order_bp.route("/admin/<int:order_id>/status", methods=["PATCH"])
@jwt_required()
@admin_required
def update_order_status_admin_route(order_id: int):
    data = request.get_json()
    new_status = data.get("status")
    if not new_status:
        raise BadRequestError("New status is required.")
    
    updated_order = order_service.update_order_status_admin(order_id, new_status)
    return jsonify(order_schema.dump(updated_order)), 200

@order_bp.route("/admin/<int:order_id>/approve_cancellation", methods=["PATCH"])
@jwt_required()
@admin_required
def approve_order_cancellation_admin_route(order_id: int):
    updated_order = order_service.approve_order_cancellation_admin(order_id)
    return jsonify(order_schema.dump(updated_order)), 200

@order_bp.route("/admin/<int:order_id>/reject_cancellation", methods=["PATCH"])
@jwt_required()
@admin_required
def reject_order_cancellation_admin_route(order_id: int):
    updated_order = order_service.reject_order_cancellation_admin(order_id)
    return jsonify(order_schema.dump(updated_order)), 200

@order_bp.route("/admin/<int:order_id>/print", methods=["GET"])
@jwt_required()
@admin_required
def print_order_admin_route(order_id: int):
    order_data = order_service.get_admin_order_details(order_id) # Obtenha os dados detalhados

    main_store = store_repository.get_first_store() # Obtenha a loja principal
    if not main_store:
        raise NotFoundError("Store configurations not found for printing.")
    
    delivery_fee_for_receipt = 0.0
    # Obter taxa de entrega
    if order_data.address_id:
        client_address = address_repository.get_by_id(order_data.address_id)
        delivery_area = delivery_area_repository.get_by_store_and_district(
            store_id=main_store.id,
            district_name=client_address.district
        )
        if delivery_area:
            delivery_fee_for_receipt = delivery_area.delivery_fee

    # Recalcular total_amount_items (se o total_amount do pedido já incluir a taxa)
    total_amount_items = order_data.total_amount - delivery_fee_for_receipt
    
    # Renderizar HTML com os dados
    rendered_html = render_template(
        "order_receipt.html",
        order=order_data.to_dict(), # Passar o dicionário completo da ordem
        store=main_store.to_dict(), # Passar o dicionário completo da loja
        delivery_fee=delivery_fee_for_receipt,
        total_amount_items=total_amount_items
    )

    result_file = BytesIO()
    pisa_status = pisa.CreatePDF(
        rendered_html,    
        dest=result_file)   

    if pisa_status.err:
        raise BadRequestError(f"Error generating PDF: {pisa_status.err}")

    pdf = result_file.getvalue() 

    response = make_response(pdf)
    response.headers["Content-Type"] = "application/pdf"
    response.headers["Content-Disposition"] = f"inline; filename=pedido_{order_id}.pdf"
    return response