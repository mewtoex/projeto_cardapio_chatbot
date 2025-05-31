from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from src.application.services.menu_service import MenuItemService
from src.application.services.category_service import CategoryService # Para categorias
from src.infrastructure.repositories.menu_item_repository import MenuItemRepository
from src.infrastructure.repositories.category_repository import CategoryRepository
from src.infrastructure.repositories.addon_repository import AddonCategoryRepository
from src.infrastructure.database.extensions import db
from src.infrastructure.security.auth_utils import admin_required
from src.api.serializers.menu_item_schema import MenuItemSchema, MenuItemDetailSchema # Novos schemas
from src.api.serializers.category_schema import category_schema, categories_schema
from src.domain.exceptions import BadRequestError, NotFoundError
from src.infrastructure.storage.ftp_storage import upload_image_to_ftp # Importar a função de upload

menu_item_bp = Blueprint("menu_item_bp", __name__, url_prefix="/api/menu_items")
category_bp = Blueprint("category_bp", __name__, url_prefix="/api/categories") # Manter ou mesclar

menu_item_repository = MenuItemRepository(session=db.session)
category_repository = CategoryRepository(session=db.session)
addon_category_repository = AddonCategoryRepository(session=db.session)

menu_item_service = MenuItemService(
    menu_item_repository=menu_item_repository,
    category_repository=category_repository,
    addon_category_repository=addon_category_repository,
    image_storage_service=upload_image_to_ftp # Passa a função de upload como serviço
)
category_service = CategoryService(repository=category_repository)

menu_item_schema = MenuItemSchema()
menu_items_schema = MenuItemSchema(many=True)
menu_item_detail_schema = MenuItemDetailSchema()


@menu_item_bp.route("", methods=["GET"])
def get_menu_items():
    category_id_filter = request.args.get("category_id")
    name_filter = request.args.get("name")
    availability_filter = request.args.get("disponivel", type=lambda v: v.lower() == "true")
    
    items = menu_item_service.get_filtered_menu_items(
        category_id=category_id_filter,
        name=name_filter,
        available=availability_filter
    )
    return jsonify(menu_items_schema.dump(items)), 200


@menu_item_bp.route("/<int:item_id>", methods=["GET"])
def get_menu_item_detail(item_id: int):
    item = menu_item_service.get_menu_item_by_id(item_id)
    return jsonify(menu_item_detail_schema.dump(item)), 200

@menu_item_bp.route("/admin", methods=["POST"])
@jwt_required()
@admin_required
def create_menu_item_admin():
    data = request.form.to_dict()
    image_file = request.files.get("image")
    addon_category_ids = request.form.getlist("addon_category_ids[]")
    data['addon_category_ids'] = addon_category_ids 

    validated_data = menu_item_schema.load(data)

    new_item = menu_item_service.create_menu_item(
        name=validated_data['name'],
        description=validated_data.get('description'),
        price=validated_data['price'],
        category_id=validated_data['category_id'],
        available=validated_data.get('available', True),
        has_addons=validated_data.get('has_addons', False),
        addon_category_ids=validated_data.get('addon_category_ids', []),
        image_file=image_file # Passa o objeto FileStorage diretamente
    )
    return jsonify(menu_item_detail_schema.dump(new_item)), 201

@menu_item_bp.route("/admin/<int:item_id>", methods=["PUT"])
@jwt_required()
@admin_required
def update_menu_item_admin(item_id: int):
    data = request.form.to_dict()
    image_file = request.files.get("image")
    addon_category_ids = request.form.getlist("addon_category_ids[]")
    data['addon_category_ids'] = addon_category_ids 
    
    validated_data = menu_item_schema.load(data, partial=True) 

    updated_item = menu_item_service.update_menu_item(
        item_id=item_id,
        name=validated_data.get('name'),
        description=validated_data.get('description'),
        price=validated_data.get('price'),
        category_id=validated_data.get('category_id'),
        available=validated_data.get('available'),
        has_addons=validated_data.get('has_addons'),
        addon_category_ids=validated_data.get('addon_category_ids'),
        image_file=image_file
    )
    return jsonify(menu_item_detail_schema.dump(updated_item)), 200

@menu_item_bp.route("/admin/<int:item_id>", methods=["DELETE"])
@jwt_required()
@admin_required
def delete_menu_item_admin(item_id: int):
    menu_item_service.delete_menu_item(item_id)
    return jsonify({"message": "Menu item deleted successfully"}), 200

@menu_item_bp.route("/admin/<int:item_id>/availability", methods=["PATCH"])
@jwt_required()
@admin_required
def toggle_menu_item_availability_admin(item_id: int):
    data = request.get_json()
    if "disponivel" not in data or not isinstance(data["disponivel"], bool):
        raise BadRequestError("Campo 'disponivel' é obrigatório e deve ser um booleano.")
    
    updated_item = menu_item_service.update_item_availability(item_id, data["disponivel"])
    return jsonify(menu_item_schema.dump(updated_item)), 200

@category_bp.route('', methods=['POST'])
@jwt_required()
@admin_required
def create_category_route(): 
    data = request.get_json()
    validated_data = category_schema.load(data)
    
    new_category = category_service.create_new_category(
        name=validated_data['name'], 
        description=validated_data.get('description')
    )
    return jsonify(category_schema.dump(new_category)), 201

@category_bp.route('', methods=['GET'])
def get_categories_route():
    categories = category_service.get_all_categories()
    return jsonify(categories_schema.dump(categories)), 200

@category_bp.route('/<int:category_id>', methods=['GET'])
def get_category_by_id_route(category_id: int):
    category = category_service.get_category_by_id(category_id)
    return jsonify(category_schema.dump(category)), 200

@category_bp.route('/<int:category_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_category_route(category_id: int):
    data = request.get_json()
    validated_data = category_schema.load(data, partial=True)
    
    updated_category = category_service.update_existing_category(
        category_id=category_id,
        name=validated_data.get('name'), 
        description=validated_data.get('description')
    )
    return jsonify(category_schema.dump(updated_category)), 200

@category_bp.route('/<int:category_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_category_route(category_id: int):
    category_service.delete_category(category_id)
    return jsonify({'message': 'Category deleted successfully'}), 200