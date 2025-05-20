from sqlalchemy.sql import func
from .user import db # Assuming db is correctly defined and imported in user.py or a central extensions.py

class Order(db.Model):
    __tablename__ = "orders"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    address_id = db.Column(db.Integer, db.ForeignKey('addresses.id'), nullable=False)
    order_date = db.Column(db.DateTime(timezone=True), server_default=func.now(), nullable=False)
    status = db.Column(db.String(50), nullable=False, default='Recebido') 
    # Status examples: "Recebido", "Em preparo", "Saiu para entrega", "Concluído", "Cancelado", "Cancelamento Solicitado"
    total_amount = db.Column(db.Float, nullable=False)
    payment_method = db.Column(db.String(50), nullable=False) # e.g., "cartao", "pix", "dinheiro"
    cash_provided = db.Column(db.Float, nullable=True) # For change calculation if payment_method is "dinheiro"

    # Timestamps
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    updated_at = db.Column(db.DateTime(timezone=True), onupdate=func.now())

    # Relationships
    items = db.relationship('OrderItem', backref='order', lazy='dynamic')
    # Relationship to user is defined in User model (backref='orders')
    # Relationship to address (optional, if you want to access address directly from order)
    # delivery_address = db.relationship('Address', backref='orders_for_address') # This might be redundant if user.addresses is primary way to get address

    def __repr__(self):
        return f"<Order {self.id} - User {self.user_id} - Status {self.status}>"

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'address_id': self.address_id,
            'order_date': self.order_date.isoformat() if self.order_date else None,
            'status': self.status,
            'total_amount': self.total_amount,
            'payment_method': self.payment_method,
            'cash_provided': self.cash_provided,
            'items': [item.to_dict() for item in self.items],
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'user_name': self.user.name if self.user else None, # Include user name
            'user_email': self.user.email if self.user else None, # Include user email
        }

    def to_short_dict(self): # For lists where full item details might be too much
        return {
            'id': self.id,
            'user_id': self.user_id,
            'order_date': self.order_date.isoformat() if self.order_date else None,
            'status': self.status,
            'total_amount': self.total_amount,
            'user_name': self.user.name if self.user else None,
        }

