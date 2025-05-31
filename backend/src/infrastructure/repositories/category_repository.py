from src.infrastructure.repositories.base_repository import BaseRepository
from src.domain.models.category import Category

class CategoryRepository(BaseRepository):
    def __init__(self, session=None):
        super().__init__(Category, session)

    def find_by_name(self, name: str):
        return self.session.query(Category).filter_by(name=name).first()