from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from src.infrastructure.database.extensions import db 
from .addon import item_addon_categories 

class MenuItem(db.Model):
    __tablename__ = "menu_item"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(String(300), nullable=True)
    price = Column(Float, nullable=False)
    image_url = Column(String(255), nullable=True)
    category_id = Column(Integer, ForeignKey('category.id'), nullable=False)
    available = Column(Boolean, default=True, nullable=False)
    has_addons = Column(Boolean, default=False, nullable=False)

    # Relacionamentos
    category = relationship('Category', backref='menu_items', lazy=True) 
    addon_categories = relationship(
        'AddonCategory',
        secondary=item_addon_categories,
        backref=db.backref('menu_items_associated', lazy='dynamic') 
    )

    def __repr__(self):
        return f"<MenuItem {self.name}>"

    def to_dict(self, include_addons=False):
        data = {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price': self.price,
            'image_url': self.image_url,
            'category_id': self.category_id,
            'category_name': self.category.name if self.category else None,
            'available': self.available,
            'has_addons': self.has_addons
        }
        if include_addons:
            from .addon import AddonCategory
            data['addon_categories'] = [ac.to_dict() for ac in self.addon_categories]
        return data