import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/contexts/AuthContext';
import ApiService from '../../shared/services/ApiService';
import { Link } from 'react-router-dom';
import { type OrderItem } from '../../../types';
interface ClientOrderItemPageProps {
  order_id: string;
}

const ClientOrderItemPage: React.FC<ClientOrderItemPageProps> = (prop) => {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (user && prop.order_id) {
        try {
          setLoading(true);
          console.log(prop.order_id)
          const fetchedOrders = await ApiService.getItemsOrder(prop.order_id);
          setOrders(fetchedOrders as OrderItem[]);
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Falha ao buscar Items do pedidos.');
        }
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, token, prop.order_id]); // Adicionar prop.order_id como dependência

  if (loading) {
    return <p>Carregando items do pedidos...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>Erro: {error}</p>;
  }

  return (
    <div>
      <h1>Itens do Pedido #{prop.order_id}</h1> {/* Exibir o ID do pedido */}
      {orders.length === 0 ? (
        <p>Nenhum item encontrado para este pedido.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID do Item</th>
              <th>Produto</th>
              <th>Quantidade</th>
              <th>Observação</th>
              <th>Valor Unitário (no pedido)</th>
            </tr>
          </thead> 
          <tbody>
            {orders?.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.menu_item_name}</td>
                <td>{item.quantity}</td>
                <td>{item.observations || '-'}</td> {/* Usar observations */}
                <td>R$ {item.price_at_order_time.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <br />
      <Link to="/client/orders">Voltar para Meus Pedidos</Link>
    </div>
  );
};

export default ClientOrderItemPage;