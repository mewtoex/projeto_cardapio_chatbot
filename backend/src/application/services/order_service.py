# backend/src/application/services/order_service.py
from typing import List, Optional, Dict
from datetime import datetime, date
from src.domain.models.order import Order
from src.domain.models.order_item import OrderItem
from src.domain.models.menu_item import MenuItem
from src.domain.models.address import Address
from src.domain.models.store import Store
from src.domain.models.delivery_area import DeliveryArea
from src.domain.models.addon import OrderItemAddon
from src.infrastructure.repositories.order_repository import OrderRepository
from src.infrastructure.repositories.user_repository import UserRepository
from src.infrastructure.repositories.address_repository import AddressRepository
from src.infrastructure.repositories.menu_item_repository import MenuItemRepository
from src.infrastructure.repositories.store_repository import StoreRepository
from src.infrastructure.repositories.delivery_area_repository import DeliveryAreaRepository
from src.infrastructure.database.extensions import db # Para transações e queries diretas
from src.domain.exceptions import NotFoundError, BadRequestError, ConflictError


class OrderService:
    def __init__(self, order_repository: OrderRepository, user_repository: UserRepository, 
                 address_repository: AddressRepository, menu_item_repository: MenuItemRepository,
                 store_repository: StoreRepository, delivery_area_repository: DeliveryAreaRepository):
        self.order_repository = order_repository
        self.user_repository = user_repository
        self.address_repository = address_repository
        self.menu_item_repository = menu_item_repository
        self.store_repository = store_repository
        self.delivery_area_repository = delivery_area_repository

    def create_order(self, user_id: int, address_id: int, payment_method: str, items_data: List[Dict], cash_provided: Optional[float] = None) -> Order:
        user = self.user_repository.get_by_id(user_id)
        address = self.address_repository.get_by_id_and_user_id(address_id, user_id)

        total_amount = 0.0
        order_items_to_create = []

        for item_data in items_data:
            menu_item_id = item_data.get("menu_item_id")
            quantity = item_data.get("quantity")
            observations = item_data.get("observations")
            selected_addons_data = item_data.get("selected_addons", [])

            if not menu_item_id or not isinstance(quantity, int) or quantity <= 0:
                raise BadRequestError(f"Invalid item data: {item_data}")
            
            menu_item = self.menu_item_repository.get_by_id(menu_item_id)
            if not menu_item or not menu_item.available:
                raise NotFoundError(f"Menu item {menu_item_id} not found or unavailable.")
            
            price_at_order_time_for_item = menu_item.price
            
            order_item_addons_to_create = []
            for addon_data in selected_addons_data:
                addon_option_id = addon_data.get('id')
                addon_name = addon_data.get('name')
                addon_price = addon_data.get('price')

                if not addon_option_id or not addon_name or addon_price is None:
                    raise BadRequestError(f"Invalid addon data: {addon_data}")
                
                # Poderia validar o addon_option_id e preço real do addon aqui também
                price_at_order_time_for_item += addon_price
                order_item_addons_to_create.append(OrderItemAddon(
                    addon_option_id=addon_option_id,
                    addon_name=addon_name,
                    addon_price=addon_price
                ))

            total_amount += price_at_order_time_for_item * quantity
            
            new_order_item = OrderItem(
                menu_item_id=menu_item_id,
                quantity=quantity,
                price_at_order_time=price_at_order_time_for_item,
                observations=observations,
                selected_addons_json=selected_addons_data
            )
            for oia in order_item_addons_to_create:
                new_order_item.selected_addons.append(oia)

            order_items_to_create.append(new_order_item)

        if not order_items_to_create:
             raise BadRequestError("No valid items to order.")

        # Recalcular o total com taxa de entrega
        delivery_fee = self.calculate_delivery_fee_for_address(address.id)
        total_amount += delivery_fee
        
        new_order = Order(
            user_id=user_id,
            address_id=address_id,
            payment_method=payment_method,
            cash_provided=cash_provided if payment_method.lower() == "dinheiro" else None,
            total_amount=total_amount,
            status="Recebido"
        )
        # Associa os order_items antes de adicionar a ordem ao banco
        new_order.items = order_items_to_create 
        
        return self.order_repository.add(new_order)

    def get_client_orders(self, user_id: int, status_filter: Optional[str] = None, 
                          start_date: Optional[str] = None, end_date: Optional[str] = None) -> List[Order]:
        return self.order_repository.get_orders_by_user(user_id, status_filter, start_date, end_date)

    def get_client_order_details(self, order_id: int, user_id: int) -> Order:
        order = self.order_repository.get_by_id_and_user_id(order_id, user_id)
        return order

    def cancel_client_order(self, order_id: int, user_id: int) -> Order:
        order = self.order_repository.get_by_id_and_user_id(order_id, user_id)
        
        cancellable_statuses = ["Recebido"]
        request_cancellation_statuses = ["Em Preparo"]

        if order.status in cancellable_statuses:
            order.status = "Cancelado"
        elif order.status in request_cancellation_statuses:
            order.status = "Cancelamento Solicitado"
        else:
            raise BadRequestError(f"Order in status {order.status} cannot be cancelled by client at this stage.")
        
        return self.order_repository.update(order)

    def get_all_orders_admin(self, status_filter: Optional[str] = None, 
                             start_date: Optional[str] = None, end_date: Optional[str] = None, 
                             client_id: Optional[int] = None) -> List[Order]:
        return self.order_repository.get_all_orders_admin(status_filter, start_date, end_date, client_id)

    def get_admin_order_details(self, order_id: int) -> Order:
        return self.order_repository.get_by_id_with_details(order_id)

    def update_order_status_admin(self, order_id: int, new_status: str) -> Order:
        order = self.order_repository.get_by_id(order_id)
        order.status = new_status
        return self.order_repository.update(order)

    def approve_order_cancellation_admin(self, order_id: int) -> Order:
        order = self.order_repository.get_by_id(order_id)
        if order.status != "Cancelamento Solicitado":
            raise BadRequestError("Order is not awaiting cancellation approval.")
        order.status = "Cancelado"
        return self.order_repository.update(order)

    def reject_order_cancellation_admin(self, order_id: int) -> Order:
        order = self.order_repository.get_by_id(order_id)
        if order.status != "Cancelamento Solicitado":
            raise BadRequestError("Order is not awaiting cancellation approval.")
        order.status = "Em Preparo" # Ou outro status adequado
        return self.order_repository.update(order)

    def get_order_items_by_order_id(self, order_id: int) -> List[OrderItem]:
        order = self.order_repository.get_by_id(order_id) # Garante que a ordem existe
        return self.order_repository.get_items_for_order(order_id)

    def get_dashboard_resume_orders(self, filter_date: Optional[date] = None) -> Dict:
        if filter_date is None:
            filter_date = date.today()
        
        status_counts = self.order_repository.get_status_counts_for_date(filter_date)
        daily_total_amount = self.order_repository.get_daily_total_amount(filter_date)

        return {
            "status_counts": status_counts,
            "filter_date": filter_date.isoformat(),
            "daily_total_amount": round(daily_total_amount, 2),
        }

    def calculate_delivery_fee_for_address(self, address_id: int) -> float:
        client_address = self.address_repository.get_by_id(address_id)
        
        main_store = self.store_repository.get_first_store()
        if not main_store:
            # Poderia ser um erro ou retornar 0.0 dependendo da regra de negócio
            print("Nenhuma loja cadastrada para calcular taxa de entrega. Retornando 0.0.")
            return 0.0

        delivery_area = self.delivery_area_repository.get_by_store_and_district(
            store_id=main_store.id,
            district_name=client_address.district
        )

        return delivery_area.delivery_fee if delivery_area else 0.0