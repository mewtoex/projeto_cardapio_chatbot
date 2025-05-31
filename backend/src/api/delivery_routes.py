# backend/src/api/delivery_routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.application.services.delivery_service import DeliveryService
from src.infrastructure.repositories.delivery_area_repository import DeliveryAreaRepository
from src.infrastructure.repositories.store_repository import StoreRepository
from src.infrastructure.repositories.address_repository import AddressRepository
from src.infrastructure.database.extensions import db
from src.infrastructure.security.auth_utils import admin_required
from src.api.serializers.delivery_area_schema import DeliveryAreaSchema # Importar schema
from src.domain.exceptions import BadRequestError, NotFoundError # Exceções personalizadas

delivery_bp = Blueprint("delivery_bp", __name__, url_prefix="/api")

# Inicialização dos repositórios e serviço
delivery_area_repository = DeliveryAreaRepository(session=db.session)
store_repository = StoreRepository(session=db.session)
address_repository = AddressRepository(session=db.session)

delivery_service = DeliveryService(
    delivery_area_repository=delivery_area_repository,
    store_repository=store_repository,
    address_repository=address_repository
)

# Instâncias dos Schemas
delivery_area_schema = DeliveryAreaSchema()
delivery_areas_schema = DeliveryAreaSchema(many=True)

# --- Rotas Admin para Gerenciar Áreas de Entrega ---
@delivery_bp.route("/admin/delivery_areas", methods=["POST"])
@jwt_required()
@admin_required
def create_delivery_area_route():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    validated_data = delivery_area_schema.load(data) # Valida a entrada

    new_area = delivery_service.create_delivery_area(
        admin_user_id=int(current_user_id),
        district_name=validated_data['district_name'],
        delivery_fee=validated_data['delivery_fee']
    )
    return jsonify(delivery_area_schema.dump(new_area)), 201

@delivery_bp.route("/admin/delivery_areas", methods=["GET"])
@jwt_required()
@admin_required
def get_delivery_areas_route():
    current_user_id = get_jwt_identity()
    areas = delivery_service.get_delivery_areas_for_admin_store(int(current_user_id))
    return jsonify(delivery_areas_schema.dump(areas)), 200

@delivery_bp.route("/admin/delivery_areas/<int:area_id>", methods=["PUT"])
@jwt_required()
@admin_required
def update_delivery_area_route(area_id: int):
    current_user_id = get_jwt_identity()
    data = request.get_json()
    validated_data = delivery_area_schema.load(data, partial=True) # Permite atualização parcial

    updated_area = delivery_service.update_delivery_area(
        admin_user_id=int(current_user_id),
        area_id=area_id,
        district_name=validated_data.get('district_name'),
        delivery_fee=validated_data.get('delivery_fee')
    )
    return jsonify(delivery_area_schema.dump(updated_area)), 200

@delivery_bp.route("/admin/delivery_areas/<int:area_id>", methods=["DELETE"])
@jwt_required()
@admin_required
def delete_delivery_area_route(area_id: int):
    current_user_id = get_jwt_identity()
    delivery_service.delete_delivery_area(int(current_user_id), area_id)
    return jsonify({"message": "Delivery area deleted successfully."}), 200

# --- Rota Pública para Calcular Taxa de Entrega para o Cliente ---
@delivery_bp.route("/delivery_fee/calculate", methods=["POST"])
@jwt_required()
def calculate_delivery_fee_route():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    address_id = data.get("address_id")

    if not address_id:
        raise BadRequestError("ID do endereço é obrigatório.")

    fee_info = delivery_service.calculate_delivery_fee_for_client_address(
        user_id=int(current_user_id),
        address_id=address_id
    )
    return jsonify(fee_info), 200