from sqlalchemy.sql import func
from .category import db # Reutilize a instância db

class BotMessage(db.Model):
    __tablename__ = 'bot_messages'
    id = db.Column(db.Integer, primary_key=True)
    command = db.Column(db.String(100), unique=True, nullable=False) # Ex: "saudacao", "item_nao_encontrado"
    response_text = db.Column(db.Text, nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    last_updated = db.Column(db.DateTime(timezone=True), onupdate=func.now())

    def to_dict(self):
        return {
            'id': self.id,
            'command': self.command,
            'response_text': self.response_text,
            'is_active': self.is_active,
            'last_updated': self.last_updated.isoformat() if self.last_updated else None
        }