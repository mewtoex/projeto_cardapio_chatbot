# backend/src/api/addon_routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from src.application.services.addon_service import AddonService
from src.infrastructure.repositories.addon_repository import AddonCategoryRepository, AddonOptionRepository
from src.infrastructure.database.extensions import db
from src.infrastructure.security.auth_utils import admin_required
from src.api.serializers.addon_schema import AddonCategorySchema, AddonOptionSchema

addon_bp = Blueprint("addon_bp", __name__, url_prefix="/api/addons")

# Inicialização dos repositórios
addon_category_repository = AddonCategoryRepository(session=db.session)
addon_option_repository = AddonOptionRepository(session=db.session)

# Inicialização do serviço
addon_service = AddonService(
    addon_category_repository=addon_category_repository,
    addon_option_repository=addon_option_repository
)

# Instâncias dos Schemas
addon_category_schema = AddonCategorySchema()
addon_categories_schema = AddonCategorySchema(many=True)
addon_option_schema = AddonOptionSchema()
addon_options_schema = AddonOptionSchema(many=True)

# --- Rotas para AddonCategory ---
@addon_bp.route("/categories", methods=["POST"])
@jwt_required()
@admin_required
def create_addon_category_route():
    data = request.get_json()
    validated_data = addon_category_schema.load(data)

    new_category = addon_service.create_addon_category(
        name=validated_data['name'],
        min_selections=validated_data.get('min_selections', 0),
        max_selections=validated_data.get('max_selections', 0),
        is_required=validated_data.get('is_required', False)
    )
    return jsonify(addon_category_schema.dump(new_category)), 201

@addon_bp.route("/categories", methods=["GET"])
def get_addon_categories_route():
    categories = addon_service.get_all_addon_categories()
    return jsonify(addon_categories_schema.dump(categories)), 200

@addon_bp.route("/categories/<int:category_id>", methods=["PUT"])
@jwt_required()
@admin_required
def update_addon_category_route(category_id: int):
    data = request.get_json()
    validated_data = addon_category_schema.load(data, partial=True)

    updated_category = addon_service.update_addon_category(
        category_id=category_id,
        name=validated_data.get('name'),
        min_selections=validated_data.get('min_selections'),
        max_selections=validated_data.get('max_selections'),
        is_required=validated_data.get('is_required')
    )
    return jsonify(addon_category_schema.dump(updated_category)), 200

@addon_bp.route("/categories/<int:category_id>", methods=["DELETE"])
@jwt_required()
@admin_required
def delete_addon_category_route(category_id: int):
    addon_service.delete_addon_category(category_id)
    return jsonify({"message": "Addon category deleted successfully"}), 200

# --- Rotas para AddonOption ---
@addon_bp.route("/categories/<int:category_id>/options", methods=["POST"])
@jwt_required()
@admin_required
def create_addon_option_route(category_id: int):
    data = request.get_json()
    validated_data = addon_option_schema.load(data) # Não inclua addon_category_id no schema de input

    new_option = addon_service.create_addon_option(
        addon_category_id=category_id,
        name=validated_data['name'],
        price=validated_data['price']
    )
    return jsonify(addon_option_schema.dump(new_option)), 201

@addon_bp.route("/options/<int:option_id>", methods=["PUT"])
@jwt_required()
@admin_required
def update_addon_option_route(option_id: int):
    data = request.get_json()
    validated_data = addon_option_schema.load(data, partial=True)

    updated_option = addon_service.update_addon_option(
        option_id=option_id,
        name=validated_data.get('name'),
        price=validated_data.get('price')
    )
    return jsonify(addon_option_schema.dump(updated_option)), 200

@addon_bp.route("/options/<int:option_id>", methods=["DELETE"])
@jwt_required()
@admin_required
def delete_addon_option_route(option_id: int):
    addon_service.delete_addon_option(option_id)
    return jsonify({"message": "Addon option deleted successfully"}), 200