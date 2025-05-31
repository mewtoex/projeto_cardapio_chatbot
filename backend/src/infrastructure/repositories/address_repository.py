# backend/src/infrastructure/repositories/address_repository.py
from typing import List
from src.infrastructure.repositories.base_repository import BaseRepository
from src.domain.models.address import Address
from src.domain.exceptions import NotFoundError

class AddressRepository(BaseRepository):
    def __init__(self, session=None):
        super().__init__(Address, session)

    def get_by_user_id(self, user_id: int) -> List[Address]:
        return self.session.query(Address).filter_by(user_id=user_id).all()

    def get_by_id_and_user_id(self, address_id: int, user_id: int) -> Address:
        address = self.session.query(Address).filter_by(id=address_id, user_id=user_id).first()
        if not address:
            raise NotFoundError("Address not found or does not belong to user.")
        return address

    def unset_primary_for_user(self, user_id: int):
        self.session.query(Address).filter_by(user_id=user_id, is_primary=True).update({"is_primary": False})
        self.session.commit() # Commit imediatamente para garantir a transação separada

    def get_total_addresses_for_user(self, user_id: int) -> int:
        return self.session.query(Address).filter_by(user_id=user_id).count()
    
    def update_existing_address_data(self, address: Address, street: Optional[str] = None, 
                                     number: Optional[str] = None, complement: Optional[str] = None,
                                     district: Optional[str] = None, city: Optional[str] = None,
                                     state: Optional[str] = None, cep: Optional[str] = None) -> Address:
        """
        Atualiza dados de um objeto Address existente.
        """
        if street is not None:
            address.street = street
        if number is not None:
            address.number = number
        if complement is not None:
            address.complement = complement
        if district is not None:
            address.district = district
        if city is not None:
            address.city = city
        if state is not None:
            address.state = state
        if cep is not None:
            address.cep = cep
        
        return self.update(address) # Usa o método update da BaseRepository