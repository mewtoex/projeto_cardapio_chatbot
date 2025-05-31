# backend/src/api/user_routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.application.services.user_service import UserService
from src.infrastructure.repositories.user_repository import UserRepository
from src.infrastructure.repositories.address_repository import AddressRepository
from src.infrastructure.database.extensions import db
from src.api.serializers.user_schema import UserProfileSchema, AddressSchema # Importar schemas
from src.domain.exceptions import BadRequestError # Exceção para validação

user_profile_bp = Blueprint("user_profile_bp", __name__, url_prefix="/api/users")

# Inicialização dos repositórios e serviço
user_repository = UserRepository(session=db.session)
address_repository = AddressRepository(session=db.session)
user_service = UserService(user_repository=user_repository, address_repository=address_repository)

# Instâncias dos Schemas
user_profile_schema = UserProfileSchema()
address_schema = AddressSchema()
addresses_schema = AddressSchema(many=True)

@user_profile_bp.route("/me", methods=["GET"])
@jwt_required()
def get_my_profile():
    current_user_id = get_jwt_identity()
    user = user_service.get_user_profile(int(current_user_id))
    return jsonify(user_profile_schema.dump(user)), 200

@user_profile_bp.route("/me", methods=["PUT"])
@jwt_required()
def update_my_profile():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validação via schema (permite atualização parcial)
    validated_data = user_profile_schema.load(data, partial=True)

    updated_user = user_service.update_user_profile(
        user_id=int(current_user_id),
        name=validated_data.get("name"),
        phone=validated_data.get("phone"),
        current_password=validated_data.get("current_password"),
        new_password=validated_data.get("new_password")
    )
    return jsonify(user_profile_schema.dump(updated_user)), 200

@user_profile_bp.route("/me/addresses", methods=["POST"])
@jwt_required()
def add_my_address():
    current_user_id = get_jwt_identity()
    data = request.get_json()

    # Validação via schema
    validated_data = address_schema.load(data)

    new_address = user_service.add_user_address(int(current_user_id), validated_data)
    return jsonify(address_schema.dump(new_address)), 201

@user_profile_bp.route("/me/addresses", methods=["GET"])
@jwt_required()
def get_my_addresses():
    current_user_id = get_jwt_identity()
    addresses = user_service.get_user_addresses(int(current_user_id))
    return jsonify(addresses_schema.dump(addresses)), 200

@user_profile_bp.route("/me/addresses/<int:address_id>", methods=["PUT"])
@jwt_required()
def update_my_address(address_id: int):
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validação via schema (permite atualização parcial)
    validated_data = address_schema.load(data, partial=True)

    updated_address = user_service.update_user_address(
        user_id=int(current_user_id),
        address_id=address_id,
        address_data=validated_data
    )
    return jsonify(address_schema.dump(updated_address)), 200

@user_profile_bp.route("/me/addresses/<int:address_id>", methods=["DELETE"])
@jwt_required()
def delete_my_address(address_id: int):
    current_user_id = get_jwt_identity()
    user_service.delete_user_address(int(current_user_id), address_id)
    return jsonify({"message": "Address deleted successfully"}), 200

@user_profile_bp.route("/me/addresses/<int:address_id>/set_primary", methods=["PATCH"])
@jwt_required()
def set_primary_address(address_id: int):
    current_user_id = get_jwt_identity()
    primary_address = user_service.set_primary_address(int(current_user_id), address_id)
    return jsonify(address_schema.dump(primary_address)), 200

# TODO: Rotas Admin para gerenciar todos os usuários seriam em um novo blueprint (ex: admin_users_routes.py)
# e chamariam métodos no UserService (ou um AdminUserService)