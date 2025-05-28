from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from src.models.bot_message import BotMessage, db
from src.routes.order_routes import admin_required # Re-use admin_required decorator

bot_message_bp = Blueprint("bot_message_bp", __name__, url_prefix="/api/bot_messages")

# --- Public/Chatbot Route ---
@bot_message_bp.route("", methods=["GET"])
def get_active_bot_messages():
    messages = BotMessage.query.filter_by(is_active=True).all()
    return jsonify([msg.to_dict() for msg in messages]), 200

# --- Admin Routes ---
@bot_message_bp.route("/admin", methods=["POST"])
@jwt_required()
@admin_required
def create_bot_message_admin():
    data = request.get_json()
    if not data or not "command" in data or not "response_text" in data:
        return jsonify({"message": "Missing command or response_text"}), 400
    
    if BotMessage.query.filter_by(command=data["command"]).first():
        return jsonify({"message": "Command already exists"}), 409

    new_message = BotMessage(
        command=data["command"],
        response_text=data["response_text"],
        is_active=data.get("is_active", True)
    )
    try:
        db.session.add(new_message)
        db.session.commit()
        return jsonify(new_message.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error creating bot message", "error": str(e)}), 500

@bot_message_bp.route("/admin", methods=["GET"])
@jwt_required()
@admin_required
def get_all_bot_messages_admin():
    messages = BotMessage.query.all()
    return jsonify([msg.to_dict() for msg in messages]), 200

@bot_message_bp.route("/admin/<int:message_id>", methods=["PUT"])
@jwt_required()
@admin_required
def update_bot_message_admin(message_id):
    message = BotMessage.query.get_or_404(message_id)
    data = request.get_json()

    if "command" in data:
        message.command = data["command"]
    if "response_text" in data:
        message.response_text = data["response_text"]
    if "is_active" in data:
        message.is_active = data["is_active"]
    
    try:
        db.session.commit()
        return jsonify(message.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error updating bot message", "error": str(e)}), 500

@bot_message_bp.route("/admin/<int:message_id>", methods=["DELETE"])
@jwt_required()
@admin_required
def delete_bot_message_admin(message_id):
    message = BotMessage.query.get_or_404(message_id)
    try:
        db.session.delete(message)
        db.session.commit()
        return jsonify({"message": "Bot message deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Error deleting bot message", "error": str(e)}), 500