# backend/src/infrastructure/repositories/addon_repository.py
from src.infrastructure.repositories.base_repository import BaseRepository
from src.domain.models.addon import AddonCategory, AddonOption

class AddonCategoryRepository(BaseRepository):
    def __init__(self, session=None):
        super().__init__(AddonCategory, session)

    def find_by_name(self, name: str):
        return self.session.query(AddonCategory).filter_by(name=name).first()

    def get_all_with_options(self):
        """Retorna todas as categorias de adicionais com suas opções carregadas."""
        return self.session.query(AddonCategory).options(db.joinedload(AddonCategory.options)).all()

class AddonOptionRepository(BaseRepository):
    def __init__(self, session=None):
        super().__init__(AddonOption, session)

    def find_by_name_in_category(self, category_id: int, name: str):
        return self.session.query(AddonOption).filter_by(addon_category_id=category_id, name=name).first()