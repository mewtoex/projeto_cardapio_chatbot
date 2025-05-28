# backend/src/models/store.py
from sqlalchemy.sql import func
from .category import db # Reutiliza a instância db

class Store(db.Model):
    __tablename__ = 'stores'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    email = db.Column(db.String(120), nullable=True)
    address_id = db.Column(db.Integer, db.ForeignKey('addresses.id'), nullable=False)
    # Um admin pode ser o "dono" da loja, mas pode ser 1:N
    admin_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True) # Quem gerencia a loja

    address = db.relationship('Address', backref='store_owner', uselist=False) # Relação 1-para-1 ou 1-para-muitos
    delivery_areas = db.relationship('DeliveryArea', backref='store', lazy='dynamic')

    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    updated_at = db.Column(db.DateTime(timezone=True), onupdate=func.now())

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'phone': self.phone,
            'email': self.email,
            'address_id': self.address_id,
            'address': self.address.to_dict() if self.address else None,
            'admin_user_id': self.admin_user_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }