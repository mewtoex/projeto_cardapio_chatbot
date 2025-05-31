# backend/src/infrastructure/storage/ftp_storage.py
from ftplib import FTP
from io import BytesIO
from flask import current_app
from werkzeug.utils import secure_filename
from PIL import Image 
import os
import magic 
from src.domain.exceptions import BadRequestError, ServiceUnavailableError 

def allowed_file_extension(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in {"png", "jpg", "jpeg", "gif"}

def validate_image_content(file_stream):
    """
    Valida o conteúdo do arquivo para garantir que é uma imagem legítima.
    Usa Pillow para tentar abrir a imagem e verificar a integridade.
    Opcionalmente, usa python-magic para verificar o MIME type real.
    """
    file_stream.seek(0)

    try:
        mime = magic.from_buffer(file_stream.read(2048), mime=True) 
        if mime not in ['image/jpeg', 'image/png', 'image/gif']:
            return False, f"Conteúdo do arquivo inválido. Detectado: {mime}."
    except Exception as e:
        print(f"python-magic falhou ou não está instalada: {e}. Prosseguindo com validação Pillow.")
        pass

    file_stream.seek(0) 

    try:
        img = Image.open(file_stream)
        img.verify() 
        if img.format not in ['JPEG', 'PNG', 'GIF']:
            return False, f"Formato de imagem inválido (Pillow). Detectado: {img.format}."
        return True, "Imagem válida."
    except Exception as e:
        return False, f"Não é uma imagem válida ou arquivo corrompido: {str(e)}"
    finally:
        file_stream.seek(0)

def upload_image_to_ftp(file):
    """
    Faz o upload de um arquivo de imagem para o servidor FTP.
    Retorna a URL pública da imagem se o upload for bem-sucedido.
    Levanta exceções para erros de validação ou upload.
    """
    if file.filename == '':
        return None 

    if not allowed_file_extension(file.filename):
        raise BadRequestError("Tipo de arquivo não permitido pela extensão.")

    file_data = BytesIO()
    file.save(file_data) 
    file_data.seek(0) 

    is_valid_image, validation_message = validate_image_content(file_data)
    if not is_valid_image:
        raise BadRequestError(validation_message)

    MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 # 5 MB
    if len(file_data.getvalue()) > MAX_FILE_SIZE_BYTES:
         raise BadRequestError(f"Arquivo muito grande. Máximo {MAX_FILE_SIZE_BYTES / (1024 * 1024):.0f}MB.")

    filename = secure_filename(file.filename)


    try:
        ftp = FTP(current_app.config["FTP_HOST"])
        ftp.login(current_app.config["FTP_USER"], current_app.config["FTP_PASS"])
        ftp.cwd(current_app.config["FTP_DIR"])
        ftp.storbinary(f"STOR {filename}", file_data)
        ftp.quit()
        url = f"{current_app.config['FTP_DIR'].lstrip('/')}/{filename}"
        return 'https://www.drivehq.com/file/df.aspx/publish/whandersonba/' + url
    except Exception as e:
        print(f"Erro ao enviar imagem por FTP: {e}")
        raise ServiceUnavailableError("Erro ao enviar imagem para o servidor de arquivos.")