# backend/src/application/services/addon_service.py
from typing import List
from src.domain.models.addon import AddonCategory, AddonOption
from src.infrastructure.repositories.addon_repository import AddonCategoryRepository, AddonOptionRepository
from src.domain.exceptions import NotFoundError, ConflictError

class AddonService:
    def __init__(self, addon_category_repository: AddonCategoryRepository, addon_option_repository: AddonOptionRepository):
        self.addon_category_repository = addon_category_repository
        self.addon_option_repository = addon_option_repository

    # --- AddonCategory Services ---
    def get_all_addon_categories(self) -> List[AddonCategory]:
        return self.addon_category_repository.get_all_with_options()

    def get_addon_category_by_id(self, category_id: int) -> AddonCategory:
        return self.addon_category_repository.get_by_id(category_id)

    def create_addon_category(self, name: str, min_selections: int, max_selections: int, is_required: bool) -> AddonCategory:
        existing_category = self.addon_category_repository.find_by_name(name)
        if existing_category:
            raise ConflictError(f"Addon category '{name}' already exists.")

        new_category = AddonCategory(
            name=name,
            min_selections=min_selections,
            max_selections=max_selections,
            is_required=is_required
        )
        return self.addon_category_repository.add(new_category)

    def update_addon_category(self, category_id: int, name: str = None, min_selections: int = None, max_selections: int = None, is_required: bool = None) -> AddonCategory:
        category = self.addon_category_repository.get_by_id(category_id)

        if name and name != category.name:
            existing_category = self.addon_category_repository.find_by_name(name)
            if existing_category and existing_category.id != category_id:
                raise ConflictError(f"Another addon category with name '{name}' already exists.")
            category.name = name
        
        if min_selections is not None:
            category.min_selections = min_selections
        if max_selections is not None:
            category.max_selections = max_selections
        if is_required is not None:
            category.is_required = is_required
        
        return self.addon_category_repository.update(category)

    def delete_addon_category(self, category_id: int):
        category = self.addon_category_repository.get_by_id(category_id)
        if category.options.count() > 0:
            raise ConflictError("Cannot delete addon category with associated options. Delete options first.")
        # Verifica se está associada a algum item de menu
        if category.menu_items_associated.count() > 0:
            raise ConflictError("Cannot delete addon category associated with menu items. Remove from items first.")
        self.addon_category_repository.delete(category)

    # --- AddonOption Services ---
    def create_addon_option(self, addon_category_id: int, name: str, price: float) -> AddonOption:
        category = self.addon_category_repository.get_by_id(addon_category_id) # Garante que a categoria existe
        
        # Verifica se a opção já existe na categoria
        existing_option = self.addon_option_repository.find_by_name_in_category(category.id, name)
        if existing_option:
            raise ConflictError(f"Addon option '{name}' already exists in this category.")

        new_option = AddonOption(
            addon_category_id=category.id,
            name=name,
            price=price
        )
        return self.addon_option_repository.add(new_option)

    def update_addon_option(self, option_id: int, name: str = None, price: float = None) -> AddonOption:
        option = self.addon_option_repository.get_by_id(option_id)

        if name and name != option.name:
             existing_option = self.addon_option_repository.find_by_name_in_category(option.addon_category_id, name)
             if existing_option and existing_option.id != option_id:
                 raise ConflictError(f"Another addon option with name '{name}' already exists in this category.")
             option.name = name

        if price is not None:
            option.price = price
        
        return self.addon_option_repository.update(option)

    def delete_addon_option(self, option_id: int):
        option = self.addon_option_repository.get_by_id(option_id)
        # TODO: Adicionar verificação se a opção está em OrderItemAddon antes de deletar
        self.addon_option_repository.delete(option)