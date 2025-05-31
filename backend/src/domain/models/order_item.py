from sqlalchemy import Column, Integer, String, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from src.infrastructure.database.extensions import db 

class OrderItem(db.Model):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    menu_item_id = Column(Integer, ForeignKey("menu_item.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    price_at_order_time = Column(Float, nullable=False)
    menu_item_description = Column(String(50), nullable=True)
    observations = Column(String(500), nullable=True)
    selected_addons_json = Column(JSON, nullable=True) 

    menu_item = relationship("MenuItem") 
    selected_addons = relationship('OrderItemAddon', backref='order_item_parent', lazy=True) 

    def __repr__(self):
        return f"<OrderItem {self.id} - Order {self.order_id} - Item {self.menu_item_id} x {self.quantity}>"

    def to_dict(self):
        from .menu_item import MenuItem
        from .addon import OrderItemAddon

        data = {
            "id": self.id,
            "order_id": self.order_id,
            "menu_item_id": self.menu_item_id,
            "quantity": self.quantity,
            "price_at_order_time": self.price_at_order_time,
            "menu_item_name": self.menu_item.name if self.menu_item else None,
            "menu_item_description": self.menu_item.description if self.menu_item else self.menu_item_description, 
        }
        if self.selected_addons_json:
            data['selected_addons'] = self.selected_addons_json
        else:
            data['selected_addons'] = [addon.to_dict() for addon in self.selected_addons]
        return data