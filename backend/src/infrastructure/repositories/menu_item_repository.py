# backend/src/infrastructure/repositories/menu_item_repository.py
from typing import List, Optional
from sqlalchemy.orm import joinedload
from src.infrastructure.repositories.base_repository import BaseRepository
from src.domain.models.menu_item import MenuItem
from src.domain.models.category import Category # Necessário para o join
from src.domain.models.addon import AddonCategory, AddonOption # Necessário para o join e opções


class MenuItemRepository(BaseRepository):
    def __init__(self, session=None):
        super().__init__(MenuItem, session)

    def get_filtered(self, category_id: Optional[str] = None, 
                     name: Optional[str] = None, 
                     available: Optional[bool] = None) -> List[MenuItem]:
        query = self.session.query(MenuItem)
        if category_id:
            query = query.filter(MenuItem.category_id == category_id)
        if name:
            query = query.filter(MenuItem.name.ilike(f"%{name}%"))
        if available is not None:
            query = query.filter(MenuItem.available == available)
        
        # Otimização: Carrega a categoria para evitar N+1 queries na serialização
        query = query.options(joinedload(MenuItem.category)) 
        return query.order_by(MenuItem.name).all()

    def get_by_id_with_addons(self, item_id: int) -> MenuItem:
        """
        Busca um MenuItem pelo ID e carrega suas categorias de adicionais e opções.
        """
        item = self.session.query(MenuItem) \
            .options(
                joinedload(MenuItem.category),
                joinedload(MenuItem.addon_categories).joinedload(AddonCategory.options)
            ) \
            .filter(MenuItem.id == item_id) \
            .first()
        
        if not item:
            raise NotFoundError(f"Menu item with ID {item_id} not found.")
        return item