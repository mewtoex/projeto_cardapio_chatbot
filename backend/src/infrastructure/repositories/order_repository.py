# backend/src/infrastructure/repositories/order_repository.py
from typing import List, Optional, Dict
from sqlalchemy import desc, func, cast, Date
from sqlalchemy.orm import joinedload
from src.infrastructure.repositories.base_repository import BaseRepository
from src.domain.models.order import Order
from src.domain.models.order_item import OrderItem
from src.domain.models.user import User
from src.domain.models.address import Address
from src.domain.models.menu_item import MenuItem
from src.domain.models.addon import OrderItemAddon # Para carregar no order_item
from src.infrastructure.database.extensions import db
from src.domain.exceptions import NotFoundError # Importar NotFoundError

class OrderRepository(BaseRepository):
    def __init__(self, session=None):
        super().__init__(Order, session)

    def get_orders_by_user(self, user_id: int, status_filter: Optional[str] = None, 
                           start_date: Optional[str] = None, end_date: Optional[str] = None) -> List[Order]:
        query = self.session.query(Order).filter_by(user_id=user_id)
        if status_filter:
            query = query.filter(Order.status == status_filter)
        if start_date:
            query = query.filter(cast(Order.order_date, Date) >= start_date)
        if end_date:
            query = query.filter(cast(Order.order_date, Date) <= end_date)
        
        # Carrega o usuário para o to_short_dict sem N+1
        query = query.options(joinedload(Order.user))
        return query.order_by(desc(Order.order_date)).all()

    def get_by_id_and_user_id(self, order_id: int, user_id: int) -> Order:
        order = self.session.query(Order) \
            .options(
                joinedload(Order.user), 
                joinedload(Order.address),
                joinedload(Order.items).joinedload(OrderItem.menu_item),
                joinedload(Order.items).joinedload(OrderItem.selected_addons)
            ) \
            .filter_by(id=order_id, user_id=user_id).first()
        if not order:
            raise NotFoundError("Order not found or does not belong to user.")
        return order

    def get_all_orders_admin(self, status_filter: Optional[str] = None, 
                             start_date: Optional[str] = None, end_date: Optional[str] = None, 
                             client_id: Optional[int] = None) -> List[Order]:
        query = self.session.query(Order) \
            .options(
                joinedload(Order.user), 
                joinedload(Order.address),
                joinedload(Order.items).joinedload(OrderItem.menu_item),
                joinedload(Order.items).joinedload(OrderItem.selected_addons)
            )
        if status_filter:
            query = query.filter(Order.status == status_filter)
        if client_id:
            query = query.filter(Order.user_id == client_id)
        if start_date:
            query = query.filter(cast(Order.order_date, Date) >= start_date)
        if end_date:
            query = query.filter(cast(Order.order_date, Date) <= end_date)
        
        return query.order_by(desc(Order.order_date)).all()

    def get_by_id_with_details(self, order_id: int) -> Order:
        order = self.session.query(Order) \
            .options(
                joinedload(Order.user), 
                joinedload(Order.address),
                joinedload(Order.items).joinedload(OrderItem.menu_item),
                joinedload(Order.items).joinedload(OrderItem.selected_addons)
            ) \
            .get(order_id)
        if not order:
            raise NotFoundError(f"Order with ID {order_id} not found.")
        return order

    def get_items_for_order(self, order_id: int) -> List[OrderItem]:
        # Carrega itens de pedido com detalhes do menu_item e adicionais
        items = self.session.query(OrderItem) \
            .options(
                joinedload(OrderItem.menu_item),
                joinedload(OrderItem.selected_addons)
            ) \
            .filter_by(order_id=order_id).all()
        return items

    def get_status_counts_for_date(self, target_date: date) -> Dict[str, int]:
        status_counts = self.session.query(Order.status, func.count(Order.id)).\
            filter(cast(Order.order_date, Date) == target_date).\
            group_by(Order.status).\
            all()
        return {status: count for status, count in status_counts}

    def get_daily_total_amount(self, target_date: date) -> float:
        total_amount = self.session.query(func.sum(Order.total_amount)).\
            filter(cast(Order.order_date, Date) == target_date).\
            scalar()
        return total_amount if total_amount is not None else 0.0