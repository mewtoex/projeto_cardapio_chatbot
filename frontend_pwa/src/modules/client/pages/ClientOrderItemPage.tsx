import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Grid, Divider, CircularProgress, Button,
  List, ListItem, ListItemText, Chip, IconButton
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../api/api';
import { useLoading } from '../../../hooks/useLoading';
import { useNotification } from '../../../contexts/NotificationContext';
import ConfirmationDialog from '../../../components/UI/ConfirmationDialog';
import { type Order, OrderStatus, OrderStatusMapping } from '../../../types';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const ClientOrderItemPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const notification = useNotification();

  const {
    data: orderDetails,
    loading,
    error,
    execute: fetchOrderDetails,
    setData: setOrderDetailsManually,
  } = useLoading<Order>();

  const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState(false);

  useEffect(() => {
    if (orderId) {
      loadOrderDetails(orderId);
    }
  }, [orderId]); 

  const loadOrderDetails = async (id: string) => {
    await fetchOrderDetails(
      api.getClientOrderDetails(id),
      undefined,
      "Erro ao carregar detalhes do pedido."
    );
  };

  const handleCancelOrderRequest = () => {
    setIsConfirmCancelOpen(true);
  };

  const confirmCancelOrder = async () => {
    if (orderDetails && orderId) {
      try {
        const updatedOrder = await api.cancelClientOrder(orderId);
        notification.showSuccess("Solicitação de cancelamento enviada com sucesso!");
        setOrderDetailsManually(updatedOrder); 
      } catch (err: any) {
        notification.showError(err.message || "Falha ao solicitar cancelamento do pedido.");
      } finally {
        setIsConfirmCancelOpen(false);
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !orderDetails) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error" gutterBottom>
          {error || "Pedido não encontrado ou erro ao carregar."}
        </Typography>
        <Button onClick={() => navigate('/client/pedidos')} sx={{ mt: 2 }}>Voltar para Meus Pedidos</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <IconButton onClick={() => navigate('/client/pedidos')} sx={{ mb: 2 }}>
        <ArrowBackIcon />
        <Typography variant="button" sx={{ ml: 1 }}>Voltar para Meus Pedidos</Typography>
      </IconButton>

      <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2">
            Detalhes do Pedido #{orderDetails.id}
          </Typography>
          <Chip label={OrderStatusMapping[orderDetails.status] || orderDetails.status} color={
            orderDetails.status === OrderStatus.CONCLUIDO ? 'success' :
            orderDetails.status === OrderStatus.CANCELADO ? 'error' :
            orderDetails.status === OrderStatus.PENDENTE ? 'warning' :
            'info'
          } />
        </Box>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}> 
            <Typography variant="subtitle1" gutterBottom>
              **Informações do Pedido**
            </Typography>
            <Typography variant="body2">**Data do Pedido:** {new Date(orderDetails.order_date).toLocaleString('pt-BR')}</Typography>
            <Typography variant="body2">**Total:** R$ {orderDetails.total_amount.toFixed(2)}</Typography>
            <Typography variant="body2">**Método de Pagamento:** {orderDetails.payment_method}</Typography>
            {orderDetails.payment_method === 'dinheiro' && orderDetails.cash_provided && (
                <Typography variant="body2">**Valor pago em dinheiro:** R$ {orderDetails.cash_provided.toFixed(2)}</Typography>
            )}
            {orderDetails.payment_method === 'dinheiro' && orderDetails.cash_provided && orderDetails.cash_provided > orderDetails.total_amount && (
                <Typography variant="body2">**Troco:** R$ {(orderDetails.cash_provided - orderDetails.total_amount).toFixed(2)}</Typography>
            )}

            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              **Endereço de Entrega**
            </Typography>
            {orderDetails.delivery_address ? (
              <>
                <Typography variant="body2">{orderDetails.delivery_address.street}, {orderDetails.delivery_address.number}</Typography>
                <Typography variant="body2">{orderDetails.delivery_address.district_name}, {orderDetails.delivery_address.city}</Typography>
                <Typography variant="body2">CEP: {orderDetails.delivery_address.zip_code}</Typography>
                <Typography variant="body2">Complemento: {orderDetails.delivery_address.complement || '-'}</Typography>
              </>
            ) : (
              <Typography variant="body2">Nenhum endereço de entrega associado.</Typography>
            )}
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} >
            <Typography variant="subtitle1" gutterBottom>
              **Itens do Pedido**
            </Typography>
            <List dense>
              {orderDetails.items.map((item) => (
                <ListItem key={item.id} disablePadding sx={{ mb: 1 }}>
                  <ListItemText
                    primary={`${item.quantity}x ${item.menu_item_name} - R$ ${(item.price * item.quantity).toFixed(2)}`}
                    secondary={
                      <>
                        {item.addon_options && item.addon_options.length > 0 && (
                          <Typography component="span" variant="body2" color="text.secondary" sx={{ display: 'block' }}>
                            Adicionais: {item.addon_options.map(addon => addon.name).join(', ')}
                          </Typography>
                        )}
                        {item.observations && (
                          <Typography component="span" variant="body2" color="text.secondary" sx={{ display: 'block', fontStyle: 'italic' }}>
                            Obs: {item.observations}
                          </Typography>
                        )}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ textAlign: 'center', mt: 3 }}>
        {orderDetails.status === OrderStatus.PENDENTE || orderDetails.status === OrderStatus.EM_PREPARO ? (
          <Button
            variant="contained"
            color="error"
            onClick={handleCancelOrderRequest}
            disabled={loading}
          >
            Solicitar Cancelamento do Pedido
          </Button>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Este pedido não pode mais ser cancelado.
          </Typography>
        )}
      </Box>

      <ConfirmationDialog
        open={isConfirmCancelOpen}
        onClose={() => setIsConfirmCancelOpen(false)}
        onConfirm={confirmCancelOrder}
        title="Confirmar Cancelamento"
        message="Tem certeza que deseja solicitar o cancelamento deste pedido? Esta ação será enviada para a administração para aprovação."
        confirmButtonText="Sim, Cancelar"
        confirmButtonColor="error"
      />
    </Box>
  );
};

export default ClientOrderItemPage;