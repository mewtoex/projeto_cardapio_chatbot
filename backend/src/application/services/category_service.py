# backend/src/application/services/category_service.py
from typing import List, Dict
from src.domain.models.category import Category
from src.infrastructure.repositories.category_repository import CategoryRepository
from src.domain.exceptions import NotFoundError, ConflictError

class CategoryService:
    def __init__(self, repository: CategoryRepository):
        self.repository = repository

    def get_all_categories(self) -> List[Category]:
        return self.repository.get_all()

    def get_category_by_id(self, category_id: int) -> Category:
        return self.repository.get_by_id(category_id)

    def create_new_category(self, name: str, description: str = None) -> Category:
        existing_category = self.repository.find_by_name(name)
        if existing_category:
            raise ConflictError(f"Category '{name}' already exists.")
            
        new_category = Category(name=name, description=description)
        return self.repository.add(new_category)

    def update_existing_category(self, category_id: int, name: str = None, description: str = None) -> Category:
        category = self.repository.get_by_id(category_id)
        
        if name and name != category.name:
            existing_category = self.repository.find_by_name(name)
            if existing_category and existing_category.id != category_id:
                raise ConflictError(f"Another category with name '{name}' already exists.")
            category.name = name

        if description is not None:
            category.description = description
            
        return self.repository.update(category)

    def delete_category(self, category_id: int):
        category = self.repository.get_by_id(category_id)
        if category.menu_items.count() > 0:
            raise ConflictError("Cannot delete category with associated menu items.")
        self.repository.delete(category)