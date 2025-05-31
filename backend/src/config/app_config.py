# backend/src/config/app_config.py
import os
from datetime import timedelta, timezone
from src.infrastructure.database.extensions import db
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from src.utils.error_handlers import register_error_handlers
from src.config.settings import settings # Importa as configurações do settings.py


def configure_app(app):
    # Carregar configurações do objeto settings
    app.config["SECRET_KEY"] = settings.SECRET_KEY
    app.config["SQLALCHEMY_DATABASE_URI"] = settings.SQLALCHEMY_DATABASE_URI
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = settings.SQLALCHEMY_TRACK_MODIFICATIONS
    app.config["JWT_SECRET_KEY"] = settings.JWT_SECRET_KEY
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=settings.JWT_ACCESS_TOKEN_EXPIRES_HOURS)
    app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRES_DAYS)
    
    # Configurações FTP
    app.config["FTP_HOST"] = settings.FTP_HOST
    app.config["FTP_USER"] = settings.FTP_USER
    app.config["FTP_PASS"] = settings.FTP_PASS
    app.config["FTP_DIR"] = settings.FTP_DIR

    # Configurar pasta de uploads (garante que exista)
    upload_path = os.path.join(app.root_path, settings.UPLOAD_FOLDER_NAME)
    app.config["UPLOAD_FOLDER"] = upload_path
    if not os.path.exists(upload_path):
        os.makedirs(upload_path)

    # Inicializar extensões
    db.init_app(app)
    JWTManager(app) # Inicializa o JWTManager, não precisa armazenar a instância se não for usar em decoradores fora
    CORS(app, resources={r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }})

    # Configurar um timezone para a sessão do SQLAlchemy
    with app.app_context():
        db.session.info['timezone'] = timezone.utc
        # Criar tabelas (apenas para desenvolvimento, em produção use migrações)
        print("Creating database tables if they don't exist...")
        db.create_all()
        print("Database tables checked/created.")

    # Registrar tratadores de erro globais
    register_error_handlers(app)