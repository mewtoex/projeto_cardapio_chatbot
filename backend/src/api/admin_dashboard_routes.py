# backend/src/api/admin_dashboard_routes.py
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from datetime import datetime, date
from src.application.services.order_service import OrderService # Usar o serviço de ordem para métricas
from src.infrastructure.repositories.order_repository import OrderRepository
from src.infrastructure.repositories.user_repository import UserRepository
from src.infrastructure.repositories.address_repository import AddressRepository
from src.infrastructure.repositories.menu_item_repository import MenuItemRepository
from src.infrastructure.repositories.store_repository import StoreRepository
from src.infrastructure.repositories.delivery_area_repository import DeliveryAreaRepository
from src.infrastructure.database.extensions import db
from src.infrastructure.security.auth_utils import admin_required
from src.domain.exceptions import BadRequestError

admin_dashboard_bp = Blueprint("admin_dashboard_bp", __name__, url_prefix="/api/admin/dashboard")

# Inicialização dos repositórios e serviço (certifique-se de que todas as dependências estão presentes)
order_repository = OrderRepository(session=db.session)
user_repository = UserRepository(session=db.session) # Necessário para o serviço de ordem
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

@admin_dashboard_bp.route("/metrics", methods=["GET"])
@jwt_required()
@admin_required
def get_dashboard_metrics_route():
    date_filter_str = request.args.get("order_date")
    filter_date = None
    if date_filter_str:
        try:
            filter_date = datetime.strptime(date_filter_str, "%Y-%m-%d").date()
        except ValueError:
            raise BadRequestError("Invalid date format. Use YYYY-MM-DD.")
    
    metrics = order_service.get_dashboard_resume_orders(filter_date)
    
    return jsonify(metrics), 200