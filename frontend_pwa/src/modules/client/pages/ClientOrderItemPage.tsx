import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/contexts/AuthContext';
import ApiService from '../../shared/services/ApiService';
import { Link } from 'react-router-dom';


interface Order {
  id: string;
  menu_item_description: string;
  menu_item_name: string;
  price_at_order_time: number;
  quantity: number;
}

const ClientOrderItemPage: React.FC = (prop) => {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (user) {
        try {
          setLoading(true);
          console.log(prop.order_id)
          const fetchedOrders = await ApiService.getItemsOrder(prop.order_id);
          setOrders(fetchedOrders as Order[]);
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Falha ao buscar Items do pedidos.');
        }
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, token]);

  if (loading) {
    return <p>Carregando items do pedidos...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>Erro: {error}</p>;
  }

  return (
    <div>
      <h1>Meus Pedidos</h1>
      {user && <p>Histórico de pedidos de {user.name}:</p>}
      {orders.length === 0 ? (
        <p>Você ainda não fez nenhum pedido.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID do Pedido</th>
              <th>Produto</th>
              <th>Quantidade</th>
              <th>Oberservação</th>
              <th>Valor</th>
            </tr>
          </thead> 
          <tbody>
            {orders?.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.menu_item_name}</td>
                <td>{order.quantity}</td>
                <td>{order.menu_item_description}</td>
                <td>{order.price_at_order_time}</td>
                <td>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <br />
      <Link to="/client/dashboard">Voltar ao Dashboard</Link>
    </div>
  );
};

export default ClientOrderItemPage;

