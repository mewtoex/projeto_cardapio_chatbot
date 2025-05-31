# backend/src/application/services/menu_service.py
from typing import List, Optional
from werkzeug.datastructures import FileStorage # Importar para type hinting
from src.domain.models.menu_item import MenuItem
from src.infrastructure.repositories.menu_item_repository import MenuItemRepository
from src.infrastructure.repositories.category_repository import CategoryRepository
from src.infrastructure.repositories.addon_repository import AddonCategoryRepository
from src.domain.exceptions import NotFoundError, ConflictError, BadRequestError

class MenuItemService:
    def __init__(self, menu_item_repository: MenuItemRepository, 
                 category_repository: CategoryRepository,
                 addon_category_repository: AddonCategoryRepository,
                 image_storage_service): # image_storage_service será a função de upload
        self.menu_item_repository = menu_item_repository
        self.category_repository = category_repository
        self.addon_category_repository = addon_category_repository
        self.image_storage_service = image_storage_service

    def get_all_menu_items(self) -> List[MenuItem]:
        return self.menu_item_repository.get_all()

    def get_filtered_menu_items(self, category_id: Optional[str] = None, 
                                 name: Optional[str] = None, 
                                 available: Optional[bool] = None) -> List[MenuItem]:
        return self.menu_item_repository.get_filtered(category_id, name, available)

    def get_menu_item_by_id(self, item_id: int) -> MenuItem:
        return self.menu_item_repository.get_by_id_with_addons(item_id)

    def create_menu_item(self, name: str, description: Optional[str], price: float, 
                         category_id: int, available: bool, has_addons: bool, 
                         addon_category_ids: List[int], image_file: Optional[FileStorage]) -> MenuItem:
        
        category = self.category_repository.get_by_id(category_id) # Valida se categoria existe

        if price <= 0:
            raise BadRequestError("Price must be positive.")

        image_url = None
        if image_file:
            image_url = self.image_storage_service(image_file) # Chama o serviço de upload

        new_item = MenuItem(
            name=name,
            description=description,
            price=price,
            category_id=category.id,
            available=available,
            image_url=image_url,
            has_addons=has_addons
        )

        if has_addons and addon_category_ids:
            # Associa categorias de adicionais
            for cat_id in addon_category_ids:
                addon_cat = self.addon_category_repository.get_by_id(cat_id) # Valida se existe
                new_item.addon_categories.append(addon_cat)
        elif has_addons and not addon_category_ids:
            raise BadRequestError("Item marked as having addons but no addon categories provided.")

        return self.menu_item_repository.add(new_item)

    def update_menu_item(self, item_id: int, name: Optional[str] = None, description: Optional[str] = None, 
                         price: Optional[float] = None, category_id: Optional[int] = None, 
                         available: Optional[bool] = None, has_addons: Optional[bool] = None, 
                         addon_category_ids: Optional[List[int]] = None, 
                         image_file: Optional[FileStorage] = None) -> MenuItem:
        
        item = self.menu_item_repository.get_by_id_with_addons(item_id) # Garante que addons são carregados

        if name is not None:
            item.name = name
        if description is not None:
            item.description = description
        if price is not None:
            if price <= 0:
                raise BadRequestError("Price must be positive.")
            item.price = price
        if category_id is not None:
            category = self.category_repository.get_by_id(category_id)
            item.category_id = category.id
        if available is not None:
            item.available = available
        
        if has_addons is not None:
            item.has_addons = has_addons
            if item.has_addons:
                if addon_category_ids is None: # Se has_addons for True e não vier lista, erro
                    raise BadRequestError("Item marked as having addons but no addon categories provided for update.")
                
                # Sincroniza as categorias de adicionais
                item.addon_categories.clear() # Limpa as existentes
                for cat_id in addon_category_ids:
                    addon_cat = self.addon_category_repository.get_by_id(cat_id)
                    item.addon_categories.append(addon_cat)
            else:
                item.addon_categories.clear() # Se não tem adicionais, limpa as associações

        if image_file:
            # Lógica para remover imagem antiga, se necessário, antes de fazer upload
            item.image_url = self.image_storage_service(image_file)
        # Se image_file for None e a URL da imagem tiver sido removida (ex: frontend envia image_url vazio)
        # if image_file is None and 'image_url' in request.form and request.form['image_url'] == '':
        #     item.image_url = None

        return self.menu_item_repository.update(item)

    def delete_menu_item(self, item_id: int):
        item = self.menu_item_repository.get_by_id(item_id)
        # TODO: Adicionar verificação se o item está em algum pedido antes de deletar
        self.menu_item_repository.delete(item)

    def update_item_availability(self, item_id: int, available: bool) -> MenuItem:
        item = self.menu_item_repository.get_by_id(item_id)
        item.available = available
        return self.menu_item_repository.update(item)