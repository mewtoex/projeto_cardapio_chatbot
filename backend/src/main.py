# backend/src/main.py
import os
import sys
from datetime import timedelta, datetime, timezone # Adicionar timezone
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv

from src.models.user import User, db
from src.models.address import Address
from src.models.category import Category
from src.models.menu_item import MenuItem
from src.models.order import Order
from src.models.order_item import OrderItem
from src.models.promotion import Promotion
from src.models.addon import AddonCategory, AddonOption, OrderItemAddon
from src.models.bot_message import BotMessage
# NOVOS MODELOS PARA ENTREGA
from src.models.store import Store
from src.models.delivery_area import DeliveryArea


# Import blueprints
from src.routes.auth_routes import auth_bp
from src.routes.user_profile_routes import user_profile_bp
from src.routes.order_routes import order_bp
from src.routes.category_routes import category_bp
from src.routes.menu_item_routes import menu_item_bp
from src.routes.addon_routes import addon_bp
from src.routes.bot_message_routes import bot_message_bp
# NOVOS BLUEPRINTS PARA ENTREGA
from src.routes.store_routes import store_bp
from src.routes.delivery_routes import delivery_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), "static"))

# --- Carregar variáveis de ambiente do backend.env ---
load_dotenv(dotenv_path="backend.env")

# --- App Configuration ---
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "uma_chave_secreta_incrivelmente_forte_e_dificil_de_adivinhar")

# CORS Configuration
CORS(app, resources={r"/api/*": {
    "origins": "*",
    "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"]
}})
# Database Configuration
DB_USERNAME = os.getenv("DB_USERNAME")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")

#FTP CONFIG
app.config["FTP_HOST"] = os.getenv("FTP_HOST")
app.config["FTP_USER"] = os.getenv("FTP_USER")
app.config["FTP_PASS"] = os.getenv("FTP_PASS")
app.config["FTP_DIR"] = os.getenv("FTP_DIR", "/")

if not all([DB_USERNAME, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME]):
    print("ALERTA: Uma ou mais variáveis de configuração do banco de dados não foram carregadas do backend.env!")
app.config["SQLALCHEMY_DATABASE_URI"] = f"mysql+pymysql://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Upload folder for images
UPLOAD_FOLDER = os.path.join(app.root_path, "static", "uploads")
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Initialize SQLAlchemy with the app
db.init_app(app)

# NOVO: Configurar um timezone para a sessão do SQLAlchemy
# Isso é importante para comparações de data e hora corretas
with app.app_context():
    db.session.info['timezone'] = timezone.utc # Usar UTC para consistência


# JWT Configuration
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "um_jwt_segredo_super_secreto_e_longo")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=30)
jwt = JWTManager(app)
# --- Database Creation ---
with app.app_context():
    print("Creating database tables if they don't exist...")
    db.create_all()
    print("Database tables checked/created.")

# --- Register Blueprints ---
app.register_blueprint(auth_bp)
app.register_blueprint(user_profile_bp)
app.register_blueprint(order_bp)
app.register_blueprint(category_bp)
app.register_blueprint(menu_item_bp)
app.register_blueprint(addon_bp)
app.register_blueprint(bot_message_bp)
# NOVOS BLUEPRINTS REGISTRADOS
app.register_blueprint(store_bp)
app.register_blueprint(delivery_bp)


# --- Basic Routes ---
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

@jwt.unauthorized_loader
def unauthorized_callback(error_string):
    return jsonify(message=error_string), 401

@jwt.invalid_token_loader
def invalid_token_callback(error_string):
    return jsonify(message=error_string), 422

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify(message="Token has expired"), 401

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)), debug=os.getenv("FLASK_DEBUG", "True").lower() == "true")