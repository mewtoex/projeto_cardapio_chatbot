from .category import db # Import db from category.py to avoid circular imports

class MenuItem(db.Model):
    __tablename__ = "menu_item" # Explicitly defining table name for clarity

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(300), nullable=True)
    price = db.Column(db.Float, nullable=False)
    image_url = db.Column(db.String(255), nullable=True) # Path to image file or external URL
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=False)
    available = db.Column(db.Boolean, default=True, nullable=False) # New field for availability

    # Relationship to Category is defined by backref in Category model

    def __repr__(self):
        return f"<MenuItem {self.name}>"

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price': self.price,
            'image_url': self.image_url,
            'category_id': self.category_id,
            'category_name': self.category.name if self.category else None, # Include category name
            'available': self.available
        }

