from ftplib import FTP
from io import BytesIO
from flask import current_app, jsonify
from werkzeug.utils import secure_filename

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in {"png", "jpg", "jpeg", "gif"}

def img_upload(data):


    # Verifica se o campo 'imagem' foi enviado
    if "image" in data.files:
        file = data.files["image"]


        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)

            file_data = BytesIO()
            file.save(file_data)
            file_data.seek(0)

  
            print(f"[{current_app.config['FTP_HOST']}]") 
            try:
                ftp = FTP(current_app.config["FTP_HOST"])
                ftp.login(current_app.config["FTP_USER"], current_app.config["FTP_PASS"])          
                ftp.cwd(current_app.config["FTP_DIR"])
                ftp.storbinary(f"STOR {filename}", file_data)
                ftp.quit()
                url =f"{current_app.config['FTP_DIR'].lstrip('/')}/{filename}"
                return 'https://www.drivehq.com/file/df.aspx/publish/whandersonba/' + url
            except Exception as e:
                print(e)

                return jsonify({"message": "Erro ao enviar imagem por FTP", "error": str(e)}), 500
        elif file.filename != "":

            return jsonify({"message": "Tipo de arquivo não permitido"}), 400
    else:
        return None  
