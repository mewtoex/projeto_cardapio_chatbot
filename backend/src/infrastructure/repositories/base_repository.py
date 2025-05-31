# backend/src/infrastructure/repositories/base_repository.py
from sqlalchemy.exc import IntegrityError
from src.infrastructure.database.extensions import db
from src.domain.exceptions import ConflictError, NotFoundError, ApplicationException

class BaseRepository:
    def __init__(self, model, session=None):
        self.model = model
        self.session = session or db.session

    def get_all(self):
        return self.session.query(self.model).all()

    def get_by_id(self, entity_id: int):
        entity = self.session.query(self.model).get(entity_id)
        if not entity:
            raise NotFoundError(f"{self.model.__name__} with ID {entity_id} not found.")
        return entity

    def add(self, entity):
        try:
            self.session.add(entity)
            self.session.commit()
            return entity
        except IntegrityError as e:
            self.session.rollback()
            # Tentar extrair uma mensagem mais amigável da exceção de integridade
            if "Duplicate entry" in str(e) or "UNIQUE constraint failed" in str(e):
                raise ConflictError(f"A {self.model.__name__} with similar unique attributes already exists.")
            raise ApplicationException(f"Database integrity error: {str(e)}")
        except Exception as e:
            self.session.rollback()
            raise ApplicationException(f"Error adding {self.model.__name__}: {str(e)}")

    def update(self, entity):
        try:
            self.session.commit()
            return entity
        except IntegrityError as e:
            self.session.rollback()
            if "Duplicate entry" in str(e) or "UNIQUE constraint failed" in str(e):
                raise ConflictError(f"Another {self.model.__name__} with similar unique attributes already exists.")
            raise ApplicationException(f"Database integrity error: {str(e)}")
        except Exception as e:
            self.session.rollback()
            raise ApplicationException(f"Error updating {self.model.__name__}: {str(e)}")

    def delete(self, entity):
        try:
            self.session.delete(entity)
            self.session.commit()
        except Exception as e:
            self.session.rollback()
            raise ApplicationException(f"Error deleting {self.model.__name__}: {str(e)}")