from .category import db 
from .addon import item_addon_categories 
class MenuItem(db.Model):
    __tablename__ = "menu_item" 

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(300), nullable=True)
    price = db.Column(db.Float, nullable=False)
    image_url = db.Column(db.String(255), nullable=True) 
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=False)
    available = db.Column(db.Boolean, default=True, nullable=False)
    has_addons = db.Column(db.Boolean, default=False, nullable=False) 

    addon_categories = db.relationship(
        'AddonCategory',
        secondary=item_addon_categories,
        backref=db.backref('menu_items', lazy='dynamic')
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
            data['addon_categories'] = [ac.to_dict() for ac in self.addon_categories]
        return data