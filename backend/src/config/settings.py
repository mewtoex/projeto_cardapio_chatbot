# backend/src/config/settings.py
import os
from dotenv import load_dotenv

# Carrega as variáveis de ambiente do arquivo .env no diretório raiz do backend
# (ou onde seu backend.env estiver)
load_dotenv(dotenv_path="backend.env") 

class AppSettings:
    SECRET_KEY = os.getenv("SECRET_KEY", "uma_chave_secreta_padrao_muito_segura")
    
    # Configurações do Banco de Dados
    DB_USERNAME = os.getenv("DB_USERNAME")
    DB_PASSWORD = os.getenv("DB_PASSWORD")
    DB_HOST = os.getenv("DB_HOST")
    DB_PORT = os.getenv("DB_PORT")
    DB_NAME = os.getenv("DB_NAME")
    SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False # Recomendado para economizar recursos

    # Configurações JWT
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "um_jwt_segredo_muito_secreto_e_longo")
    JWT_ACCESS_TOKEN_EXPIRES_HOURS = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES_HOURS", 1))
    JWT_REFRESH_TOKEN_EXPIRES_DAYS = int(os.getenv("JWT_REFRESH_TOKEN_EXPIRES_DAYS", 30))

    # Configurações FTP para Upload de Imagens
    FTP_HOST = os.getenv("FTP_HOST")
    FTP_USER = os.getenv("FTP_USER")
    FTP_PASS = os.getenv("FTP_PASS")
    FTP_DIR = os.getenv("FTP_DIR", "/")

    # Pasta de uploads local (para servir estáticos, se não usar FTP)
    # Certifique-se que o caminho esteja correto em relação à raiz do app Flask
    UPLOAD_FOLDER_NAME = "static/uploads" # Dentro de src/static/uploads
    

settings = AppSettings()