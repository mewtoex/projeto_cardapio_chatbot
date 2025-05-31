# backend/src/domain/models/addon.py
from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from src.infrastructure.database.extensions import db # Importa o db centralizado

# Tabela de associação para MenuItem e AddonCategory
item_addon_categories = Table('item_addon_categories', db.Model.metadata,
    Column('menu_item_id', Integer, ForeignKey('menu_item.id'), primary_key=True),
    Column('addon_category_id', Integer, ForeignKey('addon_category.id'), primary_key=True)
)

class AddonCategory(db.Model):
    __tablename__ = 'addon_category'
    id = Column(Integer, primary_key=True)
    name = Column(String(80), nullable=False)
    min_selections = Column(Integer, default=0, nullable=False)
    max_selections = Column(Integer, default=0, nullable=False)
    is_required = Column(Boolean, default=False, nullable=False)
    options = relationship('AddonOption', backref='addon_category_parent', lazy=True) # Renomeado backref

    def to_dict(self):
        # Importação local para evitar ciclos de importação
        from .menu_item import MenuItem
        return {
            'id': self.id,
            'name': self.name,
            'min_selections': self.min_selections,
            'max_selections': self.max_selections,
            'is_required': self.is_required,
            'options': [option.to_dict() for option in self.options]
        }

class AddonOption(db.Model):
    __tablename__ = 'addon_option'
    id = Column(Integer, primary_key=True)
    addon_category_id = Column(Integer, ForeignKey('addon_category.id'), nullable=False)
    name = Column(String(100), nullable=False)
    price = Column(Float, default=0.0, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'addon_category_id': self.addon_category_id,
            'name': self.name,
            'price': self.price
        }

class OrderItemAddon(db.Model):
    __tablename__ = 'order_item_addons'
    id = Column(Integer, primary_key=True)
    order_item_id = Column(Integer, ForeignKey('order_items.id'), nullable=False)
    addon_option_id = Column(Integer, ForeignKey('addon_option.id'), nullable=True)
    addon_name = Column(String(100), nullable=False)
    addon_price = Column(Float, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'order_item_id': self.order_item_id,
            'addon_option_id': self.addon_option_id,
            'addon_name': self.addon_name,
            'addon_price': self.addon_price
        }