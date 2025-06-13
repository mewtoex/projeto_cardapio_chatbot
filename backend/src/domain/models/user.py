# backend/src/domain/models/user.py
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import Column, Integer, String, DateTime, Boolean # Importar colunas
from sqlalchemy.sql import func
from datetime import datetime, timedelta
from src.infrastructure.database.extensions import db # Importa o db centralizado

class User(db.Model):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    name = Column(String(150), nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    phone = Column(String(20), nullable=True)
    cpf = Column(String(11), unique=True, nullable=True) # Adicionado campo CPF
    password_hash = Column(String(256), nullable=False) 
    role = Column(String(20), nullable=False, default='client')

    reset_token = Column(String(100), unique=True, nullable=True)
    reset_token_expires = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    addresses = db.relationship('Address', backref='user', lazy='dynamic')
    orders = db.relationship('Order', backref='user', lazy='dynamic')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def set_reset_token(self):
        import secrets
        self.reset_token = secrets.token_urlsafe(32)
        self.reset_token_expires = datetime.now(db.session.info['timezone']) + timedelta(hours=1) 

    def invalidate_reset_token(self):
        self.reset_token = None
        self.reset_token_expires = None

    def __repr__(self):
        return f'<User {self.name} ({self.email})>'

    def to_dict(self, include_addresses=False, include_orders=False):
        data = {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'cpf': self.cpf, # Incluir CPF no dict
            'role': self.role
        }
        if include_addresses:
            from .address import Address 
            data['addresses'] = [address.to_dict() for address in self.addresses]
        if include_orders:
            from .order import Order
            data['orders'] = [order.to_short_dict() for order in self.orders]
        return data