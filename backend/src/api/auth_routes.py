# backend/src/api/auth_routes.py
from flask import Blueprint, request, jsonify, url_for
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.application.services.auth_service import AuthService
from src.infrastructure.repositories.user_repository import UserRepository
from src.infrastructure.database.extensions import db
from src.api.serializers.user_schema import UserLoginSchema, UserRegisterSchema
from src.domain.exceptions import ConflictError, UnauthorizedError, BadRequestError, NotFoundError

auth_bp = Blueprint("auth_bp", __name__, url_prefix="/api/auth")

# Inicialização do repositório e serviço
user_repository = UserRepository(session=db.session)
auth_service = AuthService(user_repository=user_repository)

# Instâncias dos Schemas
user_login_schema = UserLoginSchema()
user_register_schema = UserRegisterSchema()

@auth_bp.route("/register", methods=["POST"])
def register_user_route():
    data = request.get_json()
    print('ddd')

    validated_data = user_register_schema.load(data)
    response_data = auth_service.register_user(
        name=validated_data['name'],
        email=validated_data['email'],
        phone=validated_data['phone'],
        password=validated_data['password'],
        address_data=validated_data['address']
    )
    return jsonify(response_data), 201

@auth_bp.route("/login", methods=["POST"])
def login_user_route():
    data = request.get_json()
    validated_data = user_login_schema.load(data)

    response_data = auth_service.login_user(
        email=validated_data['email'],
        password=validated_data['password'],
        is_admin_login=False
    )
    return jsonify(response_data), 200

@auth_bp.route("/admin", methods=["POST"])
def login_admin_route():
    data = request.get_json()
    validated_data = user_login_schema.load(data)

    response_data = auth_service.login_user(
        email=validated_data['email'],
        password=validated_data['password'],
        is_admin_login=True
    )
    return jsonify(response_data), 200

@auth_bp.route("/forgot_password", methods=["POST"])
def forgot_password_route():
    data = request.get_json()
    if not data or not data.get("email"):
        raise BadRequestError("Email é obrigatório.")
    
    auth_service.request_password_reset(data["email"])
    return jsonify({"message": "Se o e-mail estiver registrado, um link de redefinição de senha será enviado."}), 200

@auth_bp.route("/reset_password", methods=["POST"])
def reset_password_route():
    data = request.get_json()
    token = data.get("token")
    new_password = data.get("new_password")

    if not token or not new_password:
        raise BadRequestError("Token e nova senha são obrigatórios.")
    
    auth_service.reset_password(token, new_password)
    return jsonify({"message": "Senha redefinida com sucesso!"}), 200

@auth_bp.route("/reset_password_page/<string:token>", methods=["GET"])
def reset_password_page(token: str):
    # Esta rota é um placeholder para o frontend processar o token.
    # Em um aplicativo real, o frontend teria uma rota dedicada para isso.
    return f"Redirecionando para a página de redefinição de senha... Token recebido: {token}"