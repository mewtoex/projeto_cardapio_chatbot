from sqlalchemy.sql import func
from .user import db  # Assuming db is correctly defined and imported

class Promotion(db.Model):
    __tablename__ = "promotions"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.String(300), nullable=True)
    discount_percentage = db.Column(db.Float, nullable=True) # e.g., 0.10 for 10%
    discount_fixed_amount = db.Column(db.Float, nullable=True) # e.g., 5.00 for R$5.00 off
    start_date = db.Column(db.DateTime(timezone=True), nullable=True)
    end_date = db.Column(db.DateTime(timezone=True), nullable=True)
    active = db.Column(db.Boolean, default=True, nullable=False)
    # Potentially, a relationship to specific MenuItems or Categories if promotions are targeted
    # For example, a many-to-many relationship with MenuItem:
    # items = db.relationship("MenuItem", secondary=promotion_menu_item_association, back_populates="promotions")

    # Timestamps
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    updated_at = db.Column(db.DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Promotion {self.name} - Active: {self.active}>"

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "discount_percentage": self.discount_percentage,
            "discount_fixed_amount": self.discount_fixed_amount,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "active": self.active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

# If using a many-to-many relationship for targeted promotions, define the association table:
# promotion_menu_item_association = db.Table("promotion_menu_item",
#     db.Column("promotion_id", db.Integer, db.ForeignKey("promotions.id"), primary_key=True),
#     db.Column("menu_item_id", db.Integer, db.ForeignKey("menu_item.id"), primary_key=True)
# )
# And MenuItem would need: promotions = db.relationship("Promotion", secondary=promotion_menu_item_association, back_populates="items")

