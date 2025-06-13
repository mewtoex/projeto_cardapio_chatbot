# backend/src/domain/models/store.py
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from src.infrastructure.database.extensions import db

class Store(db.Model):
    __tablename__ = 'stores'
    id = Column(Integer, primary_key=True)
    name = Column(String(150), nullable=False)
    phone = Column(String(20), nullable=True)
    email = Column(String(120), nullable=True)
    cnpj = Column(String(14), unique=True, nullable=True) # Adicionado campo CNPJ
    address_id = Column(Integer, ForeignKey('addresses.id'), nullable=False)
    admin_user_id = Column(Integer, ForeignKey('users.id'), nullable=True)

    address = relationship('Address', backref='store_owner', uselist=False)
    delivery_areas = relationship('DeliveryArea', backref='store', lazy='dynamic')

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def to_dict(self):
        from .address import Address
        return {
            'id': self.id,
            'name': self.name,
            'phone': self.phone,
            'email': self.email,
            'cnpj': self.cnpj, # Incluir CNPJ no dict
            'address_id': self.address_id,
            'address': self.address.to_dict() if self.address else None,
            'admin_user_id': self.admin_user_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }