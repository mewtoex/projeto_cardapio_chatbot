from .category import db # Reutilize a instância db
from sqlalchemy.sql import func

# Tabela de associação para MenuItem e AddonCategory
item_addon_categories = db.Table('item_addon_categories',
    db.Column('menu_item_id', db.Integer, db.ForeignKey('menu_item.id'), primary_key=True),
    db.Column('addon_category_id', db.Integer, db.ForeignKey('addon_category.id'), primary_key=True)
)

class AddonCategory(db.Model):
    __tablename__ = 'addon_category'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    min_selections = db.Column(db.Integer, default=0, nullable=False)
    max_selections = db.Column(db.Integer, default=0, nullable=False)
    is_required = db.Column(db.Boolean, default=False, nullable=False)
    options = db.relationship('AddonOption', backref='addon_category', lazy=True)

    def to_dict(self):
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
    id = db.Column(db.Integer, primary_key=True)
    addon_category_id = db.Column(db.Integer, db.ForeignKey('addon_category.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, default=0.0, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'addon_category_id': self.addon_category_id,
            'name': self.name,
            'price': self.price
        }

class OrderItemAddon(db.Model):
    __tablename__ = 'order_item_addons'
    id = db.Column(db.Integer, primary_key=True)
    order_item_id = db.Column(db.Integer, db.ForeignKey('order_items.id'), nullable=False)
    addon_option_id = db.Column(db.Integer, db.ForeignKey('addon_option.id'), nullable=True) # Pode ser NULL se for adicional personalizado
    addon_name = db.Column(db.String(100), nullable=False)
    addon_price = db.Column(db.Float, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'order_item_id': self.order_item_id,
            'addon_option_id': self.addon_option_id,
            'addon_name': self.addon_name,
            'addon_price': self.addon_price
        }