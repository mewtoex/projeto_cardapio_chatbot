# backend/src/application/services/delivery_service.py
from typing import List, Optional
from src.domain.models.delivery_area import DeliveryArea
from src.infrastructure.repositories.delivery_area_repository import DeliveryAreaRepository
from src.infrastructure.repositories.store_repository import StoreRepository
from src.infrastructure.repositories.address_repository import AddressRepository
from src.domain.exceptions import NotFoundError, ConflictError, BadRequestError
from typing import List, Optional, Dict 

class DeliveryService:
    def __init__(self, delivery_area_repository: DeliveryAreaRepository, 
                 store_repository: StoreRepository,
                 address_repository: AddressRepository):
        self.delivery_area_repository = delivery_area_repository
        self.store_repository = store_repository
        self.address_repository = address_repository

    # --- Admin Services for Delivery Areas ---
    def create_delivery_area(self, admin_user_id: int, district_name: str, delivery_fee: float) -> DeliveryArea:
        store = self.store_repository.get_by_admin_user_id(admin_user_id)
        if not store:
            raise NotFoundError("Store not found for this administrator.")

        existing_area = self.delivery_area_repository.get_by_store_and_district(store.id, district_name)
        if existing_area:
            raise ConflictError(f"Delivery area for district '{district_name}' already exists for your store.")

        if delivery_fee < 0:
            raise BadRequestError("Delivery fee cannot be negative.")

        new_area = DeliveryArea(
            store_id=store.id,
            district_name=district_name,
            delivery_fee=delivery_fee
        )
        return self.delivery_area_repository.add(new_area)

    def get_delivery_areas_for_admin_store(self, admin_user_id: int) -> List[DeliveryArea]:
        store = self.store_repository.get_by_admin_user_id(admin_user_id)
        if not store:
            return [] # Ou levantar NotFoundError se a loja for obrigatória
        return self.delivery_area_repository.get_by_store_id(store.id)

    def update_delivery_area(self, admin_user_id: int, area_id: int, 
                             district_name: Optional[str] = None, delivery_fee: Optional[float] = None) -> DeliveryArea:
        store = self.store_repository.get_by_admin_user_id(admin_user_id)
        if not store:
            raise NotFoundError("Store not found for this administrator.")

        area = self.delivery_area_repository.get_by_id(area_id)
        if area.store_id != store.id:
            raise ForbiddenError("Delivery area does not belong to your store.")

        if district_name is not None and district_name != area.district_name:
            existing_area = self.delivery_area_repository.find_existing_area_for_update(store.id, district_name, area_id)
            if existing_area:
                raise ConflictError(f"Another delivery area with name '{district_name}' already exists for your store.")
            area.district_name = district_name
        
        if delivery_fee is not None:
            if delivery_fee < 0:
                raise BadRequestError("Delivery fee cannot be negative.")
            area.delivery_fee = delivery_fee
        
        return self.delivery_area_repository.update(area)

    def delete_delivery_area(self, admin_user_id: int, area_id: int):
        store = self.store_repository.get_by_admin_user_id(admin_user_id)
        if not store:
            raise NotFoundError("Store not found for this administrator.")
        
        area = self.delivery_area_repository.get_by_id(area_id)
        if area.store_id != store.id:
            raise ForbiddenError("Delivery area does not belong to your store.")
        
        self.delivery_area_repository.delete(area)

    # --- Client Service for Delivery Fee Calculation ---
    def calculate_delivery_fee_for_client_address(self, user_id: int, address_id: int) -> Dict:
        client_address = self.address_repository.get_by_id_and_user_id(address_id, user_id)
        
        # Assume que há UMA loja principal no sistema.
        main_store = self.store_repository.get_first_store()
        if not main_store:
            # Se não há loja cadastrada, não há como calcular a taxa de entrega.
            # Retorna 0.0 com uma mensagem explicativa.
            return {"delivery_fee": 0.0, "message": "No store configured to calculate delivery fee."}

        delivery_area = self.delivery_area_repository.get_by_store_and_district(
            store_id=main_store.id,
            district_name=client_address.district
        )

        if delivery_area:
            return {"delivery_fee": delivery_area.delivery_fee, "district_name": client_address.district}
        else:
            return {"delivery_fee": 0.0, "message": f"No specific fee for district '{client_address.district}'. It might be a zero-fee area or not covered."}