import React, { useEffect, useState } from "react";
import ApiService from "../../../shared/services/ApiService";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from '@mui/material';
import ClientOrderItemPage from '../../../client/pages/ClientOrderItemPage';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { styled } from '@mui/material/styles';

interface Order {
  id: string;
  user_name: string;
  order_date: string;
  status: string;
  total_amount: number;
}

const AdminOrderManagementPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const [orderId, setOrderId] = useState('0');

  const statusFilter = searchParams.get("status");
  const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
      padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
      padding: theme.spacing(1),
    },
  }));
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
  }, [statusFilter]); //
  const handleOpenItemsOrder = (date: string) => {
    console.log(date)
    setOrderId(date)
    setOpen(true);
  }

  const handleClose = () => {
    setOpen(false);
  };
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
        <table style={{ width: "100%", marginTop: "20px" }}>
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
                <td>{order.user_name}</td>
                <td>{new Date(order.order_date).toLocaleString()}</td>
                <td>{order.status}</td>
                <td>R$ {order.total_amount.toFixed(2)}</td>
                <td>
                  <select
                    value={order.status}
                    onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                    style={{ marginRight: "10px" }}
                  >
                    <option value="Novo">Novo</option>
                    <option value="Recebido">Recebido</option>
                    <option value="Em Preparo">Em Preparo</option>
                    <option value="Saiu para Entrega">Saiu para Entrega</option>
                    <option value="Concluído">Concluído</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                  <Button
                    variant="contained"
                    onClick={() => handleOpenItemsOrder(order.id)}
                  >
                    Ver Detalhes
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <br /> <>
        <BootstrapDialog
          onClose={handleClose}
          aria-labelledby="customized-dialog-title"
          open={open}
        >
          <DialogContent dividers>
            <ClientOrderItemPage
              order_id={orderId}
            />
          </DialogContent>
        </BootstrapDialog>

      </>
      <Link to="/admin/dashboard">Voltar ao Dashboard</Link>
    </div>
  );
};

export default AdminOrderManagementPage;

