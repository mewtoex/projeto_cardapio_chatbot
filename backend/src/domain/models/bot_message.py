from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from sqlalchemy.sql import func
from src.infrastructure.database.extensions import db 

class BotMessage(db.Model):
    __tablename__ = 'bot_messages'
    id = Column(Integer, primary_key=True)
    command = Column(String(100), unique=True, nullable=False)
    response_text = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    last_updated = Column(DateTime(timezone=True), onupdate=func.now())

    def to_dict(self):
        return {
            'id': self.id,
            'command': self.command,
            'response_text': self.response_text,
            'is_active': self.is_active,
            'last_updated': self.last_updated.isoformat() if self.last_updated else None
        }