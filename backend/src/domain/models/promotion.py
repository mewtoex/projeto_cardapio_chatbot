from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from sqlalchemy.sql import func
from src.infrastructure.database.extensions import db 

class Promotion(db.Model):
    __tablename__ = "promotions"

    id = Column(Integer, primary_key=True)
    name = Column(String(150), nullable=False)
    description = Column(String(300), nullable=True)
    discount_percentage = Column(Float, nullable=True)
    discount_fixed_amount = Column(Float, nullable=True)
    start_date = Column(DateTime(timezone=True), nullable=True)
    end_date = Column(DateTime(timezone=True), nullable=True)
    active = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

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