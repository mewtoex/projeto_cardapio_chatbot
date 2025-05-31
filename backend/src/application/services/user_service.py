# backend/src/application/services/user_service.py
from typing import List, Optional, Dict
from src.domain.models.user import User
from src.domain.models.address import Address
from src.infrastructure.repositories.user_repository import UserRepository
from src.infrastructure.repositories.address_repository import AddressRepository
from src.domain.exceptions import NotFoundError, ConflictError, BadRequestError, UnauthorizedError

class UserService:
    def __init__(self, user_repository: UserRepository, address_repository: AddressRepository):
        self.user_repository = user_repository
        self.address_repository = address_repository

    def get_user_profile(self, user_id: int) -> User:
        return self.user_repository.get_by_id_with_addresses(user_id)

    def update_user_profile(self, user_id: int, name: Optional[str] = None, 
                           phone: Optional[str] = None, 
                           current_password: Optional[str] = None, 
                           new_password: Optional[str] = None) -> User:
        user = self.user_repository.get_by_id(user_id)

        if name is not None:
            user.name = name
        if phone is not None:
            user.phone = phone
        
        if new_password:
            if not current_password:
                raise BadRequestError("Current password is required to set a new password.")
            if not user.check_password(current_password):
                raise UnauthorizedError("Current password is incorrect.")
            user.set_password(new_password)
        
        return self.user_repository.update(user)

    def get_user_addresses(self, user_id: int) -> List[Address]:
        user = self.user_repository.get_by_id(user_id) # Garante que o usuário existe
        return self.address_repository.get_by_user_id(user_id)

    def add_user_address(self, user_id: int, address_data: Dict) -> Address:
        user = self.user_repository.get_by_id(user_id) # Garante que o usuário existe
        
        # Validar campos obrigatórios (pode ser feito com Marshmallow/Pydantic no serializador)
        required_fields = ["street", "number", "district", "city", "state", "cep"]
        if not all(field in address_data for field in required_fields):
            raise BadRequestError(f"Missing required address fields: {required_fields}")

        is_primary = address_data.get("is_primary", False)
        if is_primary:
            self.address_repository.unset_primary_for_user(user_id)

        new_address = Address(
            user_id=user_id,
            street=address_data["street"],
            number=address_data["number"],
            complement=address_data.get("complement"),
            district=address_data["district"],
            city=address_data["city"],
            state=address_data["state"],
            cep=address_data["cep"],
            is_primary=is_primary
        )
        return self.address_repository.add(new_address)

    def update_user_address(self, user_id: int, address_id: int, address_data: Dict) -> Address:
        address = self.address_repository.get_by_id_and_user_id(address_id, user_id)

        if "is_primary" in address_data and address_data["is_primary"]:
            self.address_repository.unset_primary_for_user(user_id)
            address.is_primary = True
        elif "is_primary" in address_data and not address_data["is_primary"]:
            # Lógica para evitar deixar o usuário sem endereço principal se este for o único
            if address.is_primary and self.address_repository.get_total_addresses_for_user(user_id) > 1:
                address.is_primary = False
            elif address.is_primary and self.address_repository.get_total_addresses_for_user(user_id) == 1:
                 raise BadRequestError("Cannot unset primary for the only address. Set another as primary first.")
            else:
                 address.is_primary = False # Apenas permite desmarcar se não for primário ou houver outros

        address.street = address_data.get("street", address.street)
        address.number = address_data.get("number", address.number)
        address.complement = address_data.get("complement", address.complement)
        address.district = address_data.get("district", address.district)
        address.city = address_data.get("city", address.city)
        address.state = address_data.get("state", address.state)
        address.cep = address_data.get("cep", address.cep)
        
        return self.address_repository.update(address)

    def delete_user_address(self, user_id: int, address_id: int):
        address = self.address_repository.get_by_id_and_user_id(address_id, user_id)
        if address.is_primary and self.address_repository.get_total_addresses_for_user(user_id) > 1:
            raise BadRequestError("Cannot delete primary address. Set another address as primary first.")
        elif address.is_primary and self.address_repository.get_total_addresses_for_user(user_id) == 1:
            # Se for o único endereço e primário, permite deletar (o usuário ficará sem endereço)
            pass
        self.address_repository.delete(address)

    def set_primary_address(self, user_id: int, address_id: int) -> Address:
        address_to_set_primary = self.address_repository.get_by_id_and_user_id(address_id, user_id)
        self.address_repository.unset_primary_for_user(user_id)
        address_to_set_primary.is_primary = True
        return self.address_repository.update(address_to_set_primary)