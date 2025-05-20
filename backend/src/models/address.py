from sqlalchemy.sql import func # For default datetime
from .user import db # Assuming db is correctly defined and imported in user.py or a central extensions.py

class Address(db.Model):
    __tablename__ = "addresses"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    street = db.Column(db.String(255), nullable=False)
    number = db.Column(db.String(50), nullable=False)
    complement = db.Column(db.String(100), nullable=True)
    district = db.Column(db.String(100), nullable=False) # Bairro
    city = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(50), nullable=False) # UF
    cep = db.Column(db.String(20), nullable=False) # CEP / Postal Code
    is_primary = db.Column(db.Boolean, default=False, nullable=False)

    # Timestamps
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    updated_at = db.Column(db.DateTime(timezone=True), onupdate=func.now())

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

