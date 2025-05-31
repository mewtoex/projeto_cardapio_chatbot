# backend/src/app_factory.py
import os
from flask import Flask, send_from_directory, jsonify
from src.infrastructure.database.extensions import db # Mantenha o import do db centralizado
from src.config.app_config import configure_app # Importa a função de configuração
# Importar modelos apenas para db.create_all() (ainda necessário para SQLAlchemy descobrir modelos)
from src.domain.models.user import User
from src.domain.models.address import Address
from src.domain.models.category import Category
from src.domain.models.menu_item import MenuItem
from src.domain.models.order import Order
from src.domain.models.order_item import OrderItem
from src.domain.models.promotion import Promotion
from src.domain.models.addon import AddonCategory, AddonOption, OrderItemAddon
from src.domain.models.bot_message import BotMessage
from src.domain.models.store import Store
from src.domain.models.delivery_area import DeliveryArea

# Importar Blueprints
from src.api.auth_routes import auth_bp
from src.api.user_routes import user_profile_bp
from src.api.order_routes import order_bp
from src.api.menu_routes import menu_item_bp
from src.api.addon_routes import addon_bp
from src.api.bot_message_routes import bot_message_bp
from src.api.store_routes import store_bp
from src.api.delivery_routes import delivery_bp
from src.api.admin_dashboard_routes import admin_dashboard_bp


def create_app():
    app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), "static"))

    configure_app(app) # Chama a função de configuração

    # Registrar Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(user_profile_bp)
    app.register_blueprint(order_bp)
    app.register_blueprint(menu_item_bp)
    app.register_blueprint(addon_bp)
    app.register_blueprint(bot_message_bp)
    app.register_blueprint(store_bp)
    app.register_blueprint(delivery_bp)
    app.register_blueprint(admin_dashboard_bp)

    # Rotas de servir arquivos estáticos e health check (ainda podem ser mantidas aqui)
    @app.route("/api/health", methods=["GET"])
    def health_check():
        return jsonify({"status": "ok", "message": "API is healthy"}), 200

    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve_static(path):
        if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        else:
            index_path = os.path.join(app.static_folder, "index.html")
            if os.path.exists(index_path):
                return send_from_directory(app.static_folder, "index.html")
            else:
                if path == "":
                    return jsonify({
                        "message": "Welcome to the Cardapio API!",
                        "health_check": "/api/health"
                    })
                return jsonify({"message": "Resource not found"}), 404

    return app