# backend/src/infrastructure/repositories/user_repository.py
from sqlalchemy.orm import joinedload
from src.infrastructure.repositories.base_repository import BaseRepository
from src.domain.models.user import User

class UserRepository(BaseRepository):
    def __init__(self, session=None):
        super().__init__(User, session)

    def get_by_email(self, email: str) -> User:
        return self.session.query(User).filter_by(email=email).first()

    def get_by_cpf(self, cpf: str) -> User: # Novo método para buscar por CPF
        return self.session.query(User).filter_by(cpf=cpf).first()

    def get_by_id_with_addresses(self, user_id: int) -> User:
        user = self.session.query(User).options(joinedload(User.addresses)).get(user_id)
        if not user:
            raise NotFoundError(f"User with ID {user_id} not found.")
        return user