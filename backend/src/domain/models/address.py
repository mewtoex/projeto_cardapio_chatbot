# backend/src/domain/models/address.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from src.infrastructure.database.extensions import db 

class Address(db.Model):
    __tablename__ = "addresses"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True) 
    street = Column(String(255), nullable=False)
    number = Column(String(50), nullable=False)
    complement = Column(String(100), nullable=True)
    district = Column(String(100), nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(50), nullable=False)
    cep = Column(String(20), nullable=False)
    is_primary = Column(Boolean, default=False, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Address {self.street}, {self.number} - User {self.user_id}>"

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'street': self.street,
            'number': self.number,
            'complement': self.complement,
            'district': self.district,
            'city': self.city,
            'state': self.state,
            'cep': self.cep,
            'is_primary': self.is_primary,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }