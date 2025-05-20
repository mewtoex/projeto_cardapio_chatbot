from .user import db  # Assuming db is correctly defined and imported

class OrderItem(db.Model):
    __tablename__ = "order_items"

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey("orders.id"), nullable=False)
    menu_item_id = db.Column(db.Integer, db.ForeignKey("menu_item.id"), nullable=False) # Assuming table name is menu_item
    quantity = db.Column(db.Integer, nullable=False)
    price_at_order_time = db.Column(db.Float, nullable=False) # Price of the item at the moment the order was placed

    # Relationship to MenuItem to easily fetch item details
    menu_item = db.relationship("MenuItem") # No backref needed here if MenuItem doesn't need to list OrderItems directly

    def __repr__(self):
        return f"<OrderItem {self.id} - Order {self.order_id} - Item {self.menu_item_id} x {self.quantity}>"

    def to_dict(self):
        return {
            "id": self.id,
            "order_id": self.order_id,
            "menu_item_id": self.menu_item_id,
            "quantity": self.quantity,
            "price_at_order_time": self.price_at_order_time,
            "menu_item_name": self.menu_item.name if self.menu_item else None, # Include item name
            "menu_item_description": self.menu_item.description if self.menu_item else None, # Include item description
        }

