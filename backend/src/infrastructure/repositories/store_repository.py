# backend/src/infrastructure/repositories/store_repository.py
from sqlalchemy.orm import joinedload
from src.infrastructure.repositories.base_repository import BaseRepository
from src.domain.models.store import Store
from src.domain.models.address import Address # Para o joinedload

class StoreRepository(BaseRepository):
    def __init__(self, session=None):
        super().__init__(Store, session)

    def get_by_admin_user_id(self, admin_user_id: int) -> Store:
        return self.session.query(Store).filter_by(admin_user_id=admin_user_id).options(joinedload(Store.address)).first()
    
    def get_by_cnpj(self, cnpj: str) -> Store: # Novo método para buscar por CNPJ
        return self.session.query(Store).filter_by(cnpj=cnpj).first()

    def get_first_store(self) -> Store:
        """
        Retorna a primeira loja cadastrada no sistema. 
        Útil para sistemas com uma única loja principal.
        """
        return self.session.query(Store).options(joinedload(Store.address)).first()