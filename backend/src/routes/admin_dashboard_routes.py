from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from sqlalchemy import func, case

from src.models.order import Order, db
from src.models.user import User
from src.models.menu_item import MenuItem
from src.routes.order_routes import admin_required # Re-use admin_required decorator
from datetime import datetime, date

admin_dashboard_bp = Blueprint("admin_dashboard_bp", __name__, url_prefix="/api/admin/dashboard")

@admin_dashboard_bp.route("/metrics", methods=["GET"])
@jwt_required()
@admin_required
def get_dashboard_metrics():
    try:
        # Total de Pedidos
        total_orders_count = db.session.query(func.count(Order.id)).scalar()

        # Receita Total
        total_revenue = db.session.query(func.sum(Order.total_amount)).scalar() or 0

        # Pedidos por Status
        orders_by_status = db.session.query(Order.status, func.count(Order.id)).group_by(Order.status).all()
        orders_status_dict = {status: count for status, count in orders_by_status}

        # Novos Clientes (ex: registrados hoje)
        today_start = datetime.combine(date.today(), datetime.min.time())
        new_clients_today = db.session.query(func.count(User.id)).filter(User.role == "client", User.created_at >= today_start).scalar()

        # Itens mais vendidos (Top 5)
        # This requires joining Order, OrderItem, MenuItem
        # For simplicity, this is a placeholder. A more complex query or a separate table for sales counts might be better.
        # top_items_query = db.session.query(MenuItem.name, func.sum(OrderItem.quantity).label("total_sold")) \
        #     .join(OrderItem, MenuItem.id == OrderItem.menu_item_id) \
        #     .group_by(MenuItem.name) \
        #     .order_by(func.sum(OrderItem.quantity).desc()) \
        #     .limit(5).all()
        # top_items = {name: sold for name, sold in top_items_query}
        top_items_placeholder = {"message": "Top items calculation needs a more complex query or setup."}

        # Ticket Médio
        average_ticket = total_revenue / total_orders_count if total_orders_count else 0
        
        # Pedidos de Hoje
        orders_today_count = db.session.query(func.count(Order.id)).filter(Order.order_date >= today_start).scalar()
        revenue_today = db.session.query(func.sum(Order.total_amount)).filter(Order.order_date >= today_start).scalar() or 0

        metrics = {
            "total_orders_count": total_orders_count,
            "total_revenue": round(total_revenue, 2),
            "orders_by_status": orders_status_dict,
            "new_clients_today": new_clients_today,
            "average_ticket_value": round(average_ticket, 2),
            "orders_today_count": orders_today_count,
            "revenue_today": round(revenue_today, 2),
            "top_selling_items": top_items_placeholder # Placeholder
        }
        return jsonify(metrics), 200

    except Exception as e:
        # Log the error e
        print(f"Error fetching dashboard metrics: {str(e)}")
        return jsonify({"message": "Could not fetch dashboard metrics", "error": str(e)}), 500

