# backend/src/infrastructure/repositories/bot_message_repository.py
from typing import List, Optional
from src.infrastructure.repositories.base_repository import BaseRepository
from src.domain.models.bot_message import BotMessage

class BotMessageRepository(BaseRepository):
    def __init__(self, session=None):
        super().__init__(BotMessage, session)

    def get_all_active(self) -> List[BotMessage]:
        return self.session.query(BotMessage).filter_by(is_active=True).all()

    def get_by_command(self, command: str) -> Optional[BotMessage]:
        return self.session.query(BotMessage).filter_by(command=command).first()