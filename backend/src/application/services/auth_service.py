# backend/src/application/services/auth_service.py
from flask_jwt_extended import create_access_token, create_refresh_token
from src.domain.models.user import User
from src.domain.models.address import Address
from src.infrastructure.repositories.user_repository import UserRepository
from src.infrastructure.database.extensions import db # Para commits e rollbacks
from src.domain.exceptions import ConflictError, UnauthorizedError, BadRequestError, NotFoundError

class AuthService:
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    def register_user(self, name: str, email: str, phone: str, password: str, address_data: dict) -> dict:
        if self.user_repository.get_by_email(email):
            raise ConflictError("Email already registered.")

        new_user = User(
            name=name,
            email=email,
            phone=phone,
            role='client'
        )
        new_user.set_password(password)

        try:
            db.session.add(new_user)
            db.session.flush() # Para obter o ID do usuário antes de criar o endereço

            new_address = Address(
                user_id=new_user.id,
                street=address_data["street"],
                number=address_data["number"],
                complement=address_data.get("complement"),
                district=address_data["district"],
                city=address_data["city"],
                state=address_data["state"],
                cep=address_data["cep"],
                is_primary=True # Primeiro endereço é primário por padrão
            )
            db.session.add(new_address)
            db.session.commit()

            access_token = create_access_token(identity=str(new_user.id))
            # refresh_token = create_refresh_token(identity=new_user.id) # Opcional

            user_data = new_user.to_dict(include_addresses=True)
            return {"user": user_data, "access_token": access_token}

        except Exception as e:
            db.session.rollback()
            print(f"Error during user registration: {str(e)}")
            raise BadRequestError("Could not register user. Please check your data.")

    def login_user(self, email: str, password: str, is_admin_login: bool = False) -> dict:
        user = self.user_repository.get_by_email(email)

        if not user or not user.check_password(password):
            raise UnauthorizedError("Invalid email or password.")
        
        if is_admin_login and user.role != 'admin':
            raise UnauthorizedError("Access denied. Not an administrator.")

        access_token = create_access_token(identity=str(user.id))
        user_data = user.to_dict()
        user_data["role"] = user.role # Garante que o role está na resposta

        return {"user": user_data, "access_token": access_token}

    def request_password_reset(self, email: str):
        user = self.user_repository.get_by_email(email)
        if user:
            user.set_reset_token()
            db.session.commit()
            # Em um ambiente real, enviaria o e-mail aqui
            print(f"DEBUG: Reset token for {user.email}: {user.reset_token}")
        # Sempre retorna sucesso para evitar enumeração de e-mails
        return {"message": "If the email is registered, a password reset link has been sent."}

    def reset_password(self, token: str, new_password: str):
        user = self.user_repository.session.query(User).filter_by(reset_token=token).first()

        if not user:
            raise NotFoundError("Invalid or expired token.")

        if user.reset_token_expires < db.session.info['timezone'].localize(db.session.query(db.func.now()).scalar()):
            user.invalidate_reset_token()
            db.session.commit()
            raise UnauthorizedError("Token expired. Please request a new reset.")

        user.set_password(new_password)
        user.invalidate_reset_token()
        db.session.commit()
        return {"message": "Password reset successfully!"}