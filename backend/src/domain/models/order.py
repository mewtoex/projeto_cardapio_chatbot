from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from src.infrastructure.database.extensions import db # Importa o db centralizado

class Order(db.Model):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    address_id = Column(Integer, ForeignKey('addresses.id'), nullable=False)
    order_date = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    status = Column(String(50), nullable=False, default='Recebido')
    total_amount = Column(Float, nullable=False)
    payment_method = Column(String(50), nullable=False)
    cash_provided = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship('User', backref='user_orders') 
    address = relationship('Address', backref='address_orders')
    items = relationship('OrderItem', backref='order', lazy='dynamic')

    def __repr__(self):
        return f"<Order {self.id} - User {self.user_id} - Status {self.status}>"

    def to_dict(self):
        from .order_item import OrderItem
        from .user import User
        from .address import Address

        return {
            'id': self.id,
            'user_id': self.user_id,
            'address_id': self.address_id,
            'order_date': self.order_date.isoformat() if self.order_date else None,
            'status': self.status,
            'total_amount': self.total_amount,
            'payment_method': self.payment_method,
            'cash_provided': self.cash_provided,
            'items': [item.to_dict() for item in self.items.all()],
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'user_name': self.user.name if self.user else None,
            'user_email': self.user.email if self.user else None,
        }

    def to_short_dict(self):
        from .user import User
        return {
            'id': self.id,
            'user_id': self.user_id,
            'order_date': self.order_date.isoformat() if self.order_date else None,
            'status': self.status,
            'total_amount': self.total_amount,
            'user_name': self.user.name if self.user else None,
        }