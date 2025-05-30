# backend/src/routes/store_routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.store import Store, db
from src.models.address import Address
from src.routes.order_routes import admin_required # Reutiliza o decorador admin_required

store_bp = Blueprint("store_bp", __name__, url_prefix="/api/admin/stores")

@store_bp.route("/me", methods=["GET"])
@jwt_required()
@admin_required
def get_my_store():
    current_user_id = get_jwt_identity()
    store = Store.query.filter_by(admin_user_id=current_user_id).first()
    if not store:
        #return jsonify({"message": "Loja não encontrada para este administrador. Por favor, cadastre uma."}), 404
        return jsonify([]), 200
    return jsonify(store.to_dict()), 200

@store_bp.route("/me", methods=["POST"])
@jwt_required()
@admin_required
def create_my_store():
    current_user_id = get_jwt_identity()
    if Store.query.filter_by(admin_user_id=current_user_id).first():
        return jsonify({"message": "Você já possui uma loja cadastrada."}), 409
    data = request.get_json()
    required_fields_store = ["name", "phone", "email"]
    required_fields_address = ["street", "number", "district", "city", "state", "cep"]

    if not data or not all(f in data for f in required_fields_store) or \
       "address" not in data or not all(f in data["address"] for f in required_fields_address):
        return jsonify({"message": "Dados da loja ou endereço incompletos."}), 400

    try:
        new_address = Address(
            street=data["address"]["street"],
            number=data["address"]["number"],
            complement=data["address"].get("complement"),
            district=data["address"]["district"],
            city=data["address"]["city"],
            state=data["address"]["state"],
            cep=data["address"]["cep"],
            is_primary=True,
            
        )
        db.session.add(new_address)
        db.session.flush() 

        new_store = Store(
            name=data["name"],
            phone=data["phone"],
            email=data["email"],
            address_id=new_address.id,
            admin_user_id=current_user_id
        )
        print(new_store)
        db.session.add(new_store)
        db.session.commit()
        return jsonify(new_store.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Erro ao cadastrar loja.", "error": str(e)}), 500

@store_bp.route("/me", methods=["PUT"])
@jwt_required()
@admin_required
def update_my_store():
    current_user_id = get_jwt_identity()
    store = Store.query.filter_by(admin_user_id=current_user_id).first()
    if not store:
        return jsonify({"message": "Loja não encontrada."}), 404

    data = request.get_json()
    if not data:
        return jsonify({"message": "Corpo da requisição vazio."}), 400

    store.name = data.get("name", store.name)
    store.phone = data.get("phone", store.phone)
    store.email = data.get("email", store.email)

    if "address" in data and store.address:
        address_data = data["address"]
        store.address.street = address_data.get("street", store.address.street)
        store.address.number = address_data.get("number", store.address.number)
        store.address.complement = address_data.get("complement", store.address.complement)
        store.address.district = address_data.get("district", store.address.district)
        store.address.city = address_data.get("city", store.address.city)
        store.address.state = address_data.get("state", store.address.state)
        store.address.cep = address_data.get("cep", store.address.cep)

    try:
        db.session.commit()
        return jsonify(store.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Erro ao atualizar loja.", "error": str(e)}), 500