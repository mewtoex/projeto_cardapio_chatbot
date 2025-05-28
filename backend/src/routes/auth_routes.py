# backend/src/routes/auth_routes.py
from flask import Blueprint, request, jsonify, url_for
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity

from src.models.user import User, db
from src.models.address import Address
from datetime import datetime, timedelta

auth_bp = Blueprint("auth_bp", __name__, url_prefix="/api/auth")

@auth_bp.route("/register", methods=["POST"])
def register_user():
    data = request.get_json()
    address_data = data.get("address", {})

    if not data:
        return jsonify({"message": "Request body is missing JSON"}), 400

    required_fields = ["name", "email", "password", "phone", "street", "number", "district", "city", "state", "cep"]
    address_required = ["street", "number", "district", "city", "state", "cep"]

    missing_fields = []
    for field in ["name", "email", "password", "phone"]:
         if field not in data or not data[field]:
            missing_fields.append(field)
    for field in address_required:
        if field not in address_data or not address_data[field]:
            missing_fields.append(f"address.{field}")

    if missing_fields:
        return jsonify({"message": f"Missing required fields: {', '.join(missing_fields)}"}), 400

    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"message": "Email already registered"}), 409 # 409 Conflict

    try:
        new_user = User(
            name=data["name"],
            email=data["email"],
            phone=data["phone"],
            role='client'
        )
        new_user.set_password(data["password"]) # Hashes the password
        db.session.add(new_user)
        db.session.flush() # Flush to get new_user.id for the address
        new_address = Address(
            user_id=new_user.id,
            street=address_data["street"],
            number=address_data["number"],
            complement=address_data.get("complement"),
            district=address_data["district"],
            city=address_data["city"],
            state=address_data["state"],
            cep=address_data["cep"],
            is_primary=True # First address is primary
        )
        db.session.add(new_address)
        db.session.commit()

        # Create tokens
        access_token = create_access_token(identity=str(new_user.id))
        # refresh_token = create_refresh_token(identity=new_user.id) # Optional

        user_data = new_user.to_dict(include_addresses=True)

        return jsonify({
            "message": "User registered successfully",
            "user": user_data,
            "access_token": access_token,
            # "refresh_token": refresh_token
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"Error during registration: {str(e)}")
        return jsonify({"message": "Could not register user. Please try again later.", "error": str(e)}), 500

@auth_bp.route("/login", methods=["POST"])
def login_user():
    data = request.get_json()
    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"message": "Email and password are required"}), 400

    user = User.query.filter_by(email=data["email"]).first()

    if user and user.check_password(data["password"]):
        access_token = create_access_token(identity=str(user.id))
        
        user_data = user.to_dict()
        user_data["role"] = user.role

        return jsonify({
            "message": "Login successful",
            "access_token": access_token,
            "user": user_data
        }), 200
    else:
        return jsonify({"message": "Invalid email or password"}), 401

@auth_bp.route("/admin", methods=["POST"])
def login_admin():
    data = request.get_json()
    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"message": "Email and password are required"}), 400

    user = User.query.filter_by(email=data["email"]).first()

    if user and user.check_password(data["password"]):
        access_token = create_access_token(identity=str(user.id))

        user_data = user.to_dict()
        user_data["role"] = user.role

        if('admin' != user_data["role"]):
            return jsonify({"message": "User not admin"}), 401

        return jsonify({
            "message": "Login successful",
            "access_token": access_token,
            "user": user_data
        }), 200
    else:
        return jsonify({"message": "Invalid email or password"}), 401

# NOVO ENDPOINT: Solicitar recuperação de senha
@auth_bp.route("/forgot_password", methods=["POST"])
def forgot_password():
    data = request.get_json()
    email = data.get("email")
    if not email:
        return jsonify({"message": "Email é obrigatório"}), 400

    user = User.query.filter_by(email=email).first()
    if user:
        user.set_reset_token()
        db.session.commit()

        # ***** INÍCIO DO PLACEHOLDER PARA ENVIO DE E-MAIL *****
        # Em um ambiente de produção, você integraria um serviço de e-mail aqui.
        # Por exemplo, usando Flask-Mail:
        # from flask_mail import Message, Mail
        # msg = Message("Redefinir Senha - Seu Restaurante", sender="noreply@seurestaurante.com", recipients=[user.email])
        # reset_url = url_for('auth_bp.reset_password_page', token=user.reset_token, _external=True)
        # msg.body = f"Clique no link para redefinir sua senha: {reset_url}\nEste link expira em 1 hora."
        # mail.send(msg)

        # Para fins de desenvolvimento, apenas imprimimos o token ou o URL.
        # No frontend, você redirecionaria para uma página que informa o usuário
        # para verificar o e-mail.
        reset_url = url_for('auth_bp.reset_password_page', token=user.reset_token, _external=True)
        print(f"DEBUG: Link de Recuperação de Senha para {user.email}: {reset_url}")
        # ***** FIM DO PLACEHOLDER PARA ENVIO DE E-MAIL *****

    # Sempre retornar uma mensagem genérica para segurança (evita enumerar e-mails)
    return jsonify({"message": "Se o e-mail estiver registrado, um link de redefinição de senha será enviado."}), 200

# NOVO ENDPOINT: Redefinir senha (recebe token e nova senha)
@auth_bp.route("/reset_password", methods=["POST"])
def reset_password():
    data = request.get_json()
    token = data.get("token")
    new_password = data.get("new_password")

    if not token or not new_password:
        return jsonify({"message": "Token e nova senha são obrigatórios"}), 400

    user = User.query.filter_by(reset_token=token).first()

    if not user:
        return jsonify({"message": "Token inválido ou expirado."}), 400

    if user.reset_token_expires < datetime.now(db.session.info['timezone']):
        user.invalidate_reset_token()
        db.session.commit()
        return jsonify({"message": "Token expirado. Solicite uma nova redefinição."}), 400

    user.set_password(new_password)
    user.invalidate_reset_token() # Invalida o token após uso
    try:
        db.session.commit()
        return jsonify({"message": "Senha redefinida com sucesso!"}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error resetting password: {str(e)}")
        return jsonify({"message": "Erro ao redefinir senha. Tente novamente."}), 500

@auth_bp.route("/reset_password_page/<string:token>", methods=["GET"])
def reset_password_page(token):
    return "Redirecionando para a página de redefinição de senha... Se isso não acontecer, copie o token e use-o na aplicação: " + token, 200