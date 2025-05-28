# backend/src/models/delivery_area.py
from sqlalchemy.sql import func
from .category import db # Reutiliza a instância db

class DeliveryArea(db.Model):
    __tablename__ = 'delivery_areas'
    id = db.Column(db.Integer, primary_key=True)
    store_id = db.Column(db.Integer, db.ForeignKey('stores.id'), nullable=False)
    district_name = db.Column(db.String(100), nullable=False, unique=False) # Não único para permitir o mesmo bairro em lojas diferentes
    delivery_fee = db.Column(db.Float, nullable=False, default=0.0)

    # Adicionar uma restrição de unicidade composta se district_name deve ser único POR loja
    __table_args__ = (db.UniqueConstraint('store_id', 'district_name', name='_store_district_uc'),)

    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    updated_at = db.Column(db.DateTime(timezone=True), onupdate=func.now())

    def to_dict(self):
        return {
            'id': self.id,
            'store_id': self.store_id,
            'district_name': self.district_name,
            'delivery_fee': self.delivery_fee,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }