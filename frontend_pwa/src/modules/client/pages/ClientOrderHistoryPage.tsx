// src/modules/client/pages/ClientOrderHistoryPage.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/contexts/AuthContext';
import ApiService from '../../shared/services/ApiService';
import { Link } from 'react-router-dom';

interface Order {
  id: string;
  date: string;
  status: string;
  total: number;
  // Add other order details as needed
}

const ClientOrderHistoryPage: React.FC = () => {
  const { user, token } = useAuth(); // Assuming token might be needed for API calls
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (user) {
        try {
          setLoading(true);
          const fetchedOrders = await ApiService.getClientOrders({}); 
          setOrders(fetchedOrders as Order[]); 
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Falha ao buscar histórico de pedidos.');
        }
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, token]);

  if (loading) {
    return <p>Carregando histórico de pedidos...</p>;
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
              <th>Data</th>
              <th>Status</th>
              <th>Total</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{new Date(order.date).toLocaleDateString()}</td>
                <td>{order.status}</td>
                <td>R$ {order.total.toFixed(2)}</td>
                <td>
                  {/* TODO: Link to order details page */}
                  <Link to={`/client/orders/${order.id}`}>Ver Detalhes</Link>
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

export default ClientOrderHistoryPage;

