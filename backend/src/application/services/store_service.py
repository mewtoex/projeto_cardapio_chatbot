# backend/src/application/services/store_service.py
from typing import Dict, Optional
from src.domain.models.store import Store
from src.domain.models.address import Address
from src.infrastructure.repositories.store_repository import StoreRepository
from src.infrastructure.repositories.address_repository import AddressRepository
from src.domain.exceptions import NotFoundError, ConflictError, BadRequestError
from src.utils.validators import validate_cnpj # Importar para validação de CNPJ

class StoreService:
    def __init__(self, store_repository: StoreRepository, address_repository: AddressRepository):
        self.store_repository = store_repository
        self.address_repository = address_repository

    def get_my_store(self, admin_user_id: int) -> Optional[Store]:
        """Retorna a loja associada ao administrador logado, ou None se não houver."""
        return self.store_repository.get_by_admin_user_id(admin_user_id)

    def create_my_store(self, admin_user_id: int, name: str, phone: str, email: str, address_data: Dict, cnpj: str = None) -> Store:
        if self.store_repository.get_by_admin_user_id(admin_user_id):
            raise ConflictError("You already have a store registered.")
        
        if cnpj:
            existing_store_with_cnpj = self.store_repository.get_by_cnpj(cnpj)
            if existing_store_with_cnpj:
                raise ConflictError("CNPJ já registrado por outra loja.")

        # Validação de campos de endereço
        required_address_fields = ["street", "number", "district", "city", "state", "cep"]
        if not all(field in address_data for field in required_address_fields):
            raise BadRequestError(f"Missing required address fields: {required_address_fields}")

        # Criação do endereço (a loja terá um endereço)
        new_address = Address(
            street=address_data["street"],
            number=address_data["number"],
            complement=address_data.get("complement"),
            district=address_data["district"],
            city=address_data["city"],
            state=address_data["state"],
            cep=address_data["cep"],
            is_primary=False # Endereço de loja não é 'primary' no sentido de usuário
        )
        self.address_repository.add(new_address) # Adiciona e comita o endereço primeiro

        new_store = Store(
            name=name,
            phone=phone,
            email=email,
            cnpj=cnpj, # Adicionado cnpj
            address_id=new_address.id,
            admin_user_id=admin_user_id
        )
        return self.store_repository.add(new_store)

    def update_my_store(self, admin_user_id: int, name: Optional[str] = None, 
                        phone: Optional[str] = None, email: Optional[str] = None, 
                        address_data: Optional[Dict] = None, cnpj: Optional[str] = None) -> Store:
        store = self.store_repository.get_by_admin_user_id(admin_user_id)
        if not store:
            raise NotFoundError("Store not found for this administrator.")

        if name is not None:
            store.name = name
        if phone is not None:
            store.phone = phone
        if email is not None:
            store.email = email
        
        if cnpj is not None and cnpj != store.cnpj:
            existing_store_with_cnpj = self.store_repository.get_by_cnpj(cnpj)
            if existing_store_with_cnpj and existing_store_with_cnpj.id != store.id:
                raise ConflictError("CNPJ já registrado por outra loja.")
            store.cnpj = cnpj

        if address_data is not None and store.address:
            # Atualiza o endereço associado à loja
            updated_address = self.address_repository.update_existing_address_data(
                address=store.address,
                street=address_data.get("street"),
                number=address_data.get("number"),
                complement=address_data.get("complement"),
                district=address_data.get("district"),
                city=address_data.get("city"),
                state=address_data.get("state"),
                cep=address_data.get("cep")
            )
            # O relacionamento deve atualizar automaticamente, mas o update no repo comita
            store.address = updated_address # Garante que a relação está atualizada

        return self.store_repository.update(store)