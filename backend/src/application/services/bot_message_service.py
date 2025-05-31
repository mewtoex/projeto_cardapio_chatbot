# backend/src/application/services/bot_message_service.py
from typing import List, Optional
from src.domain.models.bot_message import BotMessage
from src.infrastructure.repositories.bot_message_repository import BotMessageRepository
from src.domain.exceptions import NotFoundError, ConflictError

class BotMessageService:
    def __init__(self, repository: BotMessageRepository):
        self.repository = repository

    def get_active_messages(self) -> List[BotMessage]:
        return self.repository.get_all_active()

    def get_all_messages_admin(self) -> List[BotMessage]:
        return self.repository.get_all()

    def create_message(self, command: str, response_text: str, is_active: bool = True) -> BotMessage:
        if self.repository.get_by_command(command):
            raise ConflictError("Command already exists.")
        
        new_message = BotMessage(
            command=command,
            response_text=response_text,
            is_active=is_active
        )
        return self.repository.add(new_message)

    def update_message(self, message_id: int, command: Optional[str] = None, response_text: Optional[str] = None, is_active: Optional[bool] = None) -> BotMessage:
        message = self.repository.get_by_id(message_id)

        if command and command != message.command:
            # Garante que o comando não está sendo alterado para um existente
            existing_message = self.repository.get_by_command(command)
            if existing_message and existing_message.id != message_id:
                raise ConflictError(f"Command '{command}' already exists for another message.")
            message.command = command # Permitir alterar se não houver conflito

        if response_text is not None:
            message.response_text = response_text
        if is_active is not None:
            message.is_active = is_active
        
        return self.repository.update(message)

    def delete_message(self, message_id: int):
        message = self.repository.get_by_id(message_id)
        self.repository.delete(message)