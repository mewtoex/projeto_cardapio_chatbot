# backend/src/infrastructure/repositories/delivery_area_repository.py
from typing import List
from src.infrastructure.repositories.base_repository import BaseRepository
from src.domain.models.delivery_area import DeliveryArea

class DeliveryAreaRepository(BaseRepository):
    def __init__(self, session=None):
        super().__init__(DeliveryArea, session)

    def get_by_store_id(self, store_id: int) -> List[DeliveryArea]:
        return self.session.query(DeliveryArea).filter_by(store_id=store_id).all()

    def get_by_store_and_district(self, store_id: int, district_name: str) -> DeliveryArea:
        return self.session.query(DeliveryArea).filter_by(store_id=store_id, district_name=district_name).first()

    def find_existing_area_for_update(self, store_id: int, district_name: str, exclude_id: int) -> DeliveryArea:
        return self.session.query(DeliveryArea).filter(
            DeliveryArea.store_id == store_id,
            DeliveryArea.district_name == district_name,
            DeliveryArea.id != exclude_id
        ).first()