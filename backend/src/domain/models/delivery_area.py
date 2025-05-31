from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.sql import func
from src.infrastructure.database.extensions import db 

class DeliveryArea(db.Model):
    __tablename__ = 'delivery_areas'
    id = Column(Integer, primary_key=True)
    store_id = Column(Integer, ForeignKey('stores.id'), nullable=False)
    district_name = Column(String(100), nullable=False, unique=False)
    delivery_fee = Column(Float, nullable=False, default=0.0)

    __table_args__ = (UniqueConstraint('store_id', 'district_name', name='_store_district_uc'),)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def to_dict(self):
        return {
            'id': self.id,
            'store_id': self.store_id,
            'district_name': self.district_name,
            'delivery_fee': self.delivery_fee,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }