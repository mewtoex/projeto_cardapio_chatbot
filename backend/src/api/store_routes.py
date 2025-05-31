# backend/src/api/store_routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.application.services.store_service import StoreService
from src.infrastructure.repositories.store_repository import StoreRepository
from src.infrastructure.repositories.address_repository import AddressRepository
from src.infrastructure.database.extensions import db
from src.infrastructure.security.auth_utils import admin_required
from src.api.serializers.store_schema import StoreSchema # Importar schema
from src.domain.exceptions import NotFoundError, ConflictError, BadRequestError

store_bp = Blueprint("store_bp", __name__, url_prefix="/api/admin/stores")

# Inicialização dos repositórios e serviço
store_repository = StoreRepository(session=db.session)
address_repository = AddressRepository(session=db.session) # Necessário para StoreService
store_service = StoreService(store_repository=store_repository, address_repository=address_repository)

# Instâncias dos Schemas
store_schema = StoreSchema()

@store_bp.route("/me", methods=["GET"])
@jwt_required()
@admin_required
def get_my_store_route():
    current_user_id = get_jwt_identity()
    store = store_service.get_my_store(int(current_user_id))
    # Retorna 200 com array vazio se não encontrar, conforme frontend espera
    if not store:
        return jsonify([]), 200 
    return jsonify(store_schema.dump(store)), 200

@store_bp.route("/me", methods=["POST"])
@jwt_required()
@admin_required
def create_my_store_route():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    validated_data = store_schema.load(data) # Valida a entrada

    new_store = store_service.create_my_store(
        admin_user_id=int(current_user_id),
        name=validated_data['name'],
        phone=validated_data['phone'],
        email=validated_data['email'],
        address_data=validated_data['address']
    )
    return jsonify(store_schema.dump(new_store)), 201

@store_bp.route("/me", methods=["PUT"])
@jwt_required()
@admin_required
def update_my_store_route():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    validated_data = store_schema.load(data, partial=True) # Permite atualização parcial

    updated_store = store_service.update_my_store(
        admin_user_id=int(current_user_id),
        name=validated_data.get('name'),
        phone=validated_data.get('phone'),
        email=validated_data.get('email'),
        address_data=validated_data.get('address')
    )
    return jsonify(store_schema.dump(updated_store)), 200