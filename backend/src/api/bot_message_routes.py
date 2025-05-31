# backend/src/api/bot_message_routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from src.application.services.bot_message_service import BotMessageService
from src.infrastructure.repositories.bot_message_repository import BotMessageRepository
from src.infrastructure.database.extensions import db
from src.infrastructure.security.auth_utils import admin_required
from src.api.serializers.bot_message_schema import BotMessageSchema # Importar schema

bot_message_bp = Blueprint("bot_message_bp", __name__, url_prefix="/api/bot_messages")

# Inicialização do repositório e serviço
bot_message_repository = BotMessageRepository(session=db.session)
bot_message_service = BotMessageService(repository=bot_message_repository)

# Instâncias dos Schemas
bot_message_schema = BotMessageSchema()
bot_messages_schema = BotMessageSchema(many=True)

# --- Public/Chatbot Route ---
@bot_message_bp.route("", methods=["GET"])
def get_active_bot_messages_route():
    messages = bot_message_service.get_active_messages()
    return jsonify(bot_messages_schema.dump(messages)), 200

# --- Admin Routes ---
@bot_message_bp.route("/admin", methods=["POST"])
@jwt_required()
@admin_required
def create_bot_message_admin_route():
    data = request.get_json()
    validated_data = bot_message_schema.load(data)

    new_message = bot_message_service.create_message(
        command=validated_data['command'],
        response_text=validated_data['response_text'],
        is_active=validated_data.get('is_active', True)
    )
    return jsonify(bot_message_schema.dump(new_message)), 201

@bot_message_bp.route("/admin", methods=["GET"])
@jwt_required()
@admin_required
def get_all_bot_messages_admin_route():
    messages = bot_message_service.get_all_messages_admin()
    return jsonify(bot_messages_schema.dump(messages)), 200

@bot_message_bp.route("/admin/<int:message_id>", methods=["PUT"])
@jwt_required()
@admin_required
def update_bot_message_admin_route(message_id: int):
    data = request.get_json()
    validated_data = bot_message_schema.load(data, partial=True)

    updated_message = bot_message_service.update_message(
        message_id=message_id,
        command=validated_data.get('command'),
        response_text=validated_data.get('response_text'),
        is_active=validated_data.get('is_active')
    )
    return jsonify(bot_message_schema.dump(updated_message)), 200

@bot_message_bp.route("/admin/<int:message_id>", methods=["DELETE"])
@jwt_required()
@admin_required
def delete_bot_message_admin_route(message_id: int):
    bot_message_service.delete_message(message_id)
    return jsonify({"message": "Bot message deleted successfully"}), 200