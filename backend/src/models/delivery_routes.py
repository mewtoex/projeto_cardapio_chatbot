# backend/src/routes/delivery_routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.delivery_area import DeliveryArea, db
from src.models.store import Store
from src.models.address import Address
from src.routes.order_routes import admin_required # Reutiliza o decorador admin_required

delivery_bp = Blueprint("delivery_bp", __name__, url_prefix="/api")

# --- Rotas Admin para Gerenciar Áreas de Entrega ---
@delivery_bp.route("/admin/delivery_areas", methods=["POST"])
@jwt_required()
@admin_required
def create_delivery_area():
    current_user_id = get_jwt_identity()
    store = Store.query.filter_by(admin_user_id=current_user_id).first()
    if not store:
        return jsonify({"message": "Loja não encontrada para este administrador."}), 404

    data = request.get_json()
    if not data or not "district_name" in data or "delivery_fee" not in data:
        return jsonify({"message": "Nome do bairro e taxa de entrega são obrigatórios."}), 400

    # Verifica se já existe uma área de entrega para o mesmo bairro e loja
    if DeliveryArea.query.filter_by(store_id=store.id, district_name=data["district_name"]).first():
        return jsonify({"message": f"Área de entrega para o bairro '{data['district_name']}' já cadastrada."}), 409

    try:
        fee = float(data["delivery_fee"])
        if fee < 0:
            return jsonify({"message": "Taxa de entrega não pode ser negativa."}), 400
    except ValueError:
        return jsonify({"message": "Formato de taxa de entrega inválido."}), 400

    new_area = DeliveryArea(
        store_id=store.id,
        district_name=data["district_name"],
        delivery_fee=fee
    )
    try:
        db.session.add(new_area)
        db.session.commit()
        return jsonify(new_area.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Erro ao cadastrar área de entrega.", "error": str(e)}), 500

@delivery_bp.route("/admin/delivery_areas", methods=["GET"])
@jwt_required()
@admin_required
def get_delivery_areas():
    current_user_id = get_jwt_identity()
    store = Store.query.filter_by(admin_user_id=current_user_id).first()
    if not store:
        return jsonify({"message": "Loja não encontrada para este administrador."}), 404

    areas = DeliveryArea.query.filter_by(store_id=store.id).all()
    return jsonify([area.to_dict() for area in areas]), 200

@delivery_bp.route("/admin/delivery_areas/<int:area_id>", methods=["PUT"])
@jwt_required()
@admin_required
def update_delivery_area(area_id):
    current_user_id = get_jwt_identity()
    store = Store.query.filter_by(admin_user_id=current_user_id).first()
    if not store:
        return jsonify({"message": "Loja não encontrada para este administrador."}), 404

    area = DeliveryArea.query.filter_by(id=area_id, store_id=store.id).first()
    if not area:
        return jsonify({"message": "Área de entrega não encontrada ou não pertence à sua loja."}), 404

    data = request.get_json()
    if not data:
        return jsonify({"message": "Corpo da requisição vazio."}), 400

    if "district_name" in data:
        # Verifica se a nova nome de bairro já existe para a mesma loja (exceto a própria área)
        existing_area = DeliveryArea.query.filter(
            DeliveryArea.store_id == store.id,
            DeliveryArea.district_name == data["district_name"],
            DeliveryArea.id != area_id
        ).first()
        if existing_area:
            return jsonify({"message": f"Já existe uma área de entrega com o nome '{data['district_name']}' para sua loja."}), 409
        area.district_name = data["district_name"]

    if "delivery_fee" in data:
        try:
            fee = float(data["delivery_fee"])
            if fee < 0:
                return jsonify({"message": "Taxa de entrega não pode ser negativa."}), 400
            area.delivery_fee = fee
        except ValueError:
            return jsonify({"message": "Formato de taxa de entrega inválido."}), 400

    try:
        db.session.commit()
        return jsonify(area.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Erro ao atualizar área de entrega.", "error": str(e)}), 500

@delivery_bp.route("/admin/delivery_areas/<int:area_id>", methods=["DELETE"])
@jwt_required()
@admin_required
def delete_delivery_area(area_id):
    current_user_id = get_jwt_identity()
    store = Store.query.filter_by(admin_user_id=current_user_id).first()
    if not store:
        return jsonify({"message": "Loja não encontrada para este administrador."}), 404

    area = DeliveryArea.query.filter_by(id=area_id, store_id=store.id).first()
    if not area:
        return jsonify({"message": "Área de entrega não encontrada ou não pertence à sua loja."}), 404

    try:
        db.session.delete(area)
        db.session.commit()
        return jsonify({"message": "Área de entrega excluída com sucesso."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Erro ao excluir área de entrega.", "error": str(e)}), 500

# --- Rota Pública para Calcular Taxa de Entrega para o Cliente ---
@delivery_bp.route("/delivery_fee/calculate", methods=["POST"])
@jwt_required()
def calculate_delivery_fee():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    address_id = data.get("address_id")

    if not address_id:
        return jsonify({"message": "ID do endereço é obrigatório."}), 400

    client_address = Address.query.filter_by(id=address_id, user_id=current_user_id).first()
    if not client_address:
        return jsonify({"message": "Endereço não encontrado ou não pertence ao usuário."}), 404

    # Assume que há UMA loja principal no sistema.
    # Em um sistema com múltiplas lojas, seria necessário especificar qual loja.
    main_store = Store.query.first() # Pega a primeira loja cadastrada
    if not main_store:
        return jsonify({"message": "Nenhuma loja cadastrada para calcular taxa de entrega."}), 500

    # Busca a área de entrega pelo nome do bairro do cliente para a loja principal
    delivery_area = DeliveryArea.query.filter_by(
        store_id=main_store.id,
        district_name=client_address.district
    ).first()

    if delivery_area:
        return jsonify({"delivery_fee": delivery_area.delivery_fee, "district_name": client_address.district}), 200
    else:
        # Se o bairro não estiver nas áreas de entrega, pode ser taxa zero ou não entregar
        # Definindo taxa padrão para bairros não cobertos como 0 (ou um valor maior)
        return jsonify({"delivery_fee": 0.0, "message": f"Não há taxa específica para o bairro '{client_address.district}'. Pode haver taxa zero ou não ser uma área de entrega."}), 200