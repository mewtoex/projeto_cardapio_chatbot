from ftplib import FTP
from io import BytesIO
from flask import current_app, jsonify
from werkzeug.utils import secure_filename
from PIL import Image # Importar Pillow para validação de imagem
import os
import magic # Importar python-magic se instalada

def allowed_file_extension(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in {"png", "jpg", "jpeg", "gif"}

def validate_image_content(file_stream):
    """
    Valida o conteúdo do arquivo para garantir que é uma imagem legítima.
    Usa Pillow para tentar abrir a imagem e verificar a integridade.
    Opcionalmente, usa python-magic para verificar o MIME type real.
    """
    file_stream.seek(0) # Voltar ao início do stream

    # 1. Validação de MIME type (via magic number) usando python-magic (mais robusto)
    try:
        mime = magic.from_buffer(file_stream.read(2048), mime=True) # Lê os primeiros bytes
        if mime not in ['image/jpeg', 'image/png', 'image/gif']:
            return False, f"Conteúdo do arquivo inválido. Detectado: {mime}."
    except Exception as e:
        # Fallback se python-magic não estiver disponível ou falhar
        print(f"python-magic falhou ou não está instalada: {e}. Prosseguindo com validação Pillow.")
        pass # Continua para a validação Pillow

    file_stream.seek(0) # Voltar ao início novamente para Pillow

    # 2. Validação de integridade da imagem via Pillow
    try:
        img = Image.open(file_stream)
        img.verify() # Tenta verificar a integridade do arquivo de imagem
        # Opcional: verificar o formato da imagem após a verificação
        if img.format not in ['JPEG', 'PNG', 'GIF']:
            return False, f"Formato de imagem inválido (Pillow). Detectado: {img.format}."
        return True, "Imagem válida."
    except Exception as e:
        return False, f"Não é uma imagem válida ou arquivo corrompido: {str(e)}"
    finally:
        file_stream.seek(0) # Resetar a posição do stream após a leitura

def img_upload(data):
    # Verifica se o campo 'imagem' foi enviado
    if "image" not in data.files:
        return None # Nenhum arquivo de imagem enviado

    file = data.files["image"]

    if file.filename == '':
        return None # Campo de arquivo vazio

    # 1. Validação da extensão do arquivo
    if not allowed_file_extension(file.filename):
        return jsonify({"message": "Tipo de arquivo não permitido pela extensão"}), 400

    file_data = BytesIO()
    file.save(file_data) # Salva o arquivo temporariamente em memória
    file_data.seek(0) # Volta ao início do stream de bytes

    # 2. Validação do conteúdo do arquivo (Magic Number/Integridade)
    is_valid_image, validation_message = validate_image_content(file_data)
    if not is_valid_image:
        return jsonify({"message": validation_message}), 400

    # 3. Validação de tamanho (exemplo, 5 MB)
    MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 # 5 MB
    if len(file_data.getvalue()) > MAX_FILE_SIZE_BYTES:
         return jsonify({"message": f"Arquivo muito grande. Máximo {MAX_FILE_SIZE_BYTES / (1024 * 1024):.0f}MB."}), 400


    filename = secure_filename(file.filename)
    # Opcional: Adicionar UUID ao nome do arquivo para evitar colisões
    # import uuid
    # filename = f"{uuid.uuid4().hex}_{filename}"

    print(f"[{current_app.config['FTP_HOST']}]")
    try:
        ftp = FTP(current_app.config["FTP_HOST"])
        ftp.login(current_app.config["FTP_USER"], current_app.config["FTP_PASS"])
        ftp.cwd(current_app.config["FTP_DIR"])
        ftp.storbinary(f"STOR {filename}", file_data)
        ftp.quit()
        url = f"{current_app.config['FTP_DIR'].lstrip('/')}/{filename}"
        return 'https://www.drivehq.com/file/df.aspx/publish/whandersonba/' + url
    except Exception as e:
        print(e)
        return jsonify({"message": "Erro ao enviar imagem por FTP", "error": str(e)}), 500