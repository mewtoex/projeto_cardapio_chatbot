// src/modules/client/pages/ClientOrderHistoryPage.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../auth/contexts/AuthContext';
import ApiService from '../../shared/services/ApiService';
import { Link } from 'react-router-dom';
import { Button } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import ClientOrderItemPage from './ClientOrderItemPage';
import { styled } from '@mui/material/styles';
import { type Order } from '../../../types'; 

const ClientOrderHistoryPage: React.FC = () => {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [orderId, setOrderId] = useState('0');
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
  const handleOpenItemsOrder = (id: string) => { // Renomeado 'date' para 'id' para clareza
    console.log(id)
    setOrderId(id)
    setOpen(true);
  }

  const handleClose = () => {
    setOpen(false);
  };
  return (
    <div>
      <h1>Meus Pedidos</h1>
      {user && <p>Histórico de pedidos de {user.name}:</p>}
      {orders.length === 0 ? (
        <p>Você ainda não fez nenhum pedido.</p>
      ) : (<>
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
                <td>{new Date(order.order_date).toLocaleDateString()}</td>
                <td>{order.status}</td>
                <td>R$ {order.total_amount.toFixed(2)}</td>
                <td>
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
        <>
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
      </>
      )}
      <br />
      <Link to="/client/dashboard">Voltar ao Dashboard</Link>
    </div>
  );
};

export default ClientOrderHistoryPage;