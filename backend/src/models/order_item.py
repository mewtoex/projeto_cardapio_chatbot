from .user import db  

class OrderItem(db.Model):
    __tablename__ = "order_items"

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey("orders.id"), nullable=False)
    menu_item_id = db.Column(db.Integer, db.ForeignKey("menu_item.id"), nullable=False) 
    quantity = db.Column(db.Integer, nullable=False)
    price_at_order_time = db.Column(db.Float, nullable=False)
    menu_item = db.relationship("MenuItem") 
    menu_item_description = db.Column(db.String(50), nullable=False)
    
    def __repr__(self):
        return f"<OrderItem {self.id} - Order {self.order_id} - Item {self.menu_item_id} x {self.quantity}>"

    def to_dict(self):
        return {
            "id": self.id,
            "order_id": self.order_id,
            "menu_item_id": self.menu_item_id,
            "quantity": self.quantity,
            "price_at_order_time": self.price_at_order_time,
            "menu_item_name": self.menu_item.name if self.menu_item else None, 
            "menu_item_description": self.menu_item_description, 
        }

