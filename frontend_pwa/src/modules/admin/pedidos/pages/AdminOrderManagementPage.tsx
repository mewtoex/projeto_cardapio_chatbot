// src/modules/admin/pedidos/pages/AdminOrderManagementPage.tsx
import React, { useEffect, useState } from "react";
import ApiService from "../../../shared/services/ApiService";
import { Link, useSearchParams } from "react-router-dom"; // useSearchParams for filtering

interface Order {
  id: string;
  clientName: string;
  date: string;
  status: string;
  total: number;
  // Add other order details as needed
}

const AdminOrderManagementPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Example: Read status filter from URL query params
  const statusFilter = searchParams.get("status");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const filters: any = {};
        if (statusFilter) {
          filters.status = statusFilter;
        }
        const fetchedOrders = await ApiService.getAdminOrders(filters);
        setOrders(fetchedOrders as Order[]); // Type assertion for simulated data
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Falha ao buscar pedidos.");
      }
      setLoading(false);
    };

    fetchOrders();
  }, [statusFilter]); // Refetch if statusFilter changes

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    // Optimistic update example (optional)
    // setOrders(prevOrders => 
    //   prevOrders.map(order => order.id === orderId ? { ...order, status: newStatus } : order)
    // );
    try {
      await ApiService.updateOrderStatus(orderId, newStatus);
      // Refetch orders to confirm change and get latest data
      const updatedOrders = await ApiService.getAdminOrders(statusFilter ? { status: statusFilter } : {});
      setOrders(updatedOrders as Order[]);
      alert(`Status do pedido ${orderId} atualizado para ${newStatus}`);
    } catch (err) {
      alert(`Falha ao atualizar status do pedido ${orderId}: ${err instanceof Error ? err.message : "Erro desconhecido"}`);
      // Optionally revert optimistic update here if it failed
    }
  };

  if (loading) {
    return <p>Carregando pedidos...</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>Erro: {error}</p>;
  }

  return (
    <div>
      <h1>Gerenciamento de Pedidos</h1>
      {/* TODO: Add filters for date, client, status etc. */}
      <div>
        <strong>Filtrar por Status: </strong>
        <button onClick={() => setSearchParams({})}>Todos</button>
        <button onClick={() => setSearchParams({ status: "Novo" })}>Novos</button>
        <button onClick={() => setSearchParams({ status: "Em Preparo" })}>Em Preparo</button>
        <button onClick={() => setSearchParams({ status: "Saiu para Entrega" })}>Saiu para Entrega</button>
        <button onClick={() => setSearchParams({ status: "Concluído" })}>Concluídos</button>
        <button onClick={() => setSearchParams({ status: "Cancelado" })}>Cancelados</button>
      </div>

      {orders.length === 0 ? (
        <p>Nenhum pedido encontrado{statusFilter ? ` com status "${statusFilter}"` : ""}.</p>
      ) : (
        <table style={{width: "100%", marginTop: "20px"}}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Data</th>
              <th>Status Atual</th>
              <th>Total</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.clientName}</td>
                <td>{new Date(order.date).toLocaleString()}</td>
                <td>{order.status}</td>
                <td>R$ {order.total.toFixed(2)}</td>
                <td>
                  {/* TODO: Link to order details page for admin */}
                  {/* <Link to={`/admin/orders/${order.id}`}>Ver Detalhes</Link> */}
                  <select 
                    value={order.status} 
                    onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                    style={{marginRight: "10px"}}
                  >
                    <option value="Novo">Novo</option>
                    <option value="Recebido">Recebido</option> {/* Added as per initial request */}
                    <option value="Em Preparo">Em Preparo</option>
                    <option value="Saiu para Entrega">Saiu para Entrega</option>
                    <option value="Concluído">Concluído</option>
                    <option value="Cancelado">Cancelado</option>
                    {/* Add other relevant statuses */}
                  </select>
                  {/* Add other actions like print, view details, etc. */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <br />
      <Link to="/admin/dashboard">Voltar ao Dashboard</Link>
    </div>
  );
};

export default AdminOrderManagementPage;

