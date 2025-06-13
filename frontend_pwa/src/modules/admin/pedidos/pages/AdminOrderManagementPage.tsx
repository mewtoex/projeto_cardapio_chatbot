// frontend_pwa/src/modules/admin/pedidos/pages/AdminOrderManagementPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, CircularProgress, Chip, Menu, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Tabs, Tab
} from '@mui/material';
import {
  Edit as EditIcon, Delete as DeleteIcon, MoreVert as MoreVertIcon,
  Print as PrintIcon, CheckCircleOutline as CheckCircleOutlineIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import api from '../../../../api/api';
import { useLoading } from '../../../../hooks/useLoading';
import { useNotification } from '../../../../contexts/NotificationContext';
import ConfirmationDialog from '../../../../components/UI/ConfirmationDialog';
import { type Order, OrderStatus, OrderStatusMapping } from '../../../../types'; // Assumindo OrderStatusMapping

const AdminOrderManagementPage: React.FC = () => {
  const notification = useNotification();
  const {
    data: orders,
    loading,
    error,
    execute: fetchOrders,
    setData: setOrdersManually,
  } = useLoading<Order[]>();

  const [filterStatus, setFilterStatus] = useState<string>('todos'); // 'todos', 'pendente', 'em_preparo', 'a_caminho', 'concluido', 'cancelado'
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedOrderForMenu, setSelectedOrderForMenu] = useState<Order | null>(null);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState<'cancel' | 'approveCancellation' | 'rejectCancellation' | null>(null);

  useEffect(() => {
    loadOrders();
  }, [filterStatus, filterStartDate, filterEndDate]);

  const loadOrders = async () => {
    const filters: { status?: string; data_inicio?: string; data_fim?: string } = {};
    if (filterStatus !== 'todos') {
      filters.status = filterStatus;
    }
    if (filterStartDate) {
      filters.data_inicio = filterStartDate;
    }
    if (filterEndDate) {
      filters.data_fim = filterEndDate;
    }

    await fetchOrders(
      api.getAdminOrders(filters),
      undefined,
      "Erro ao carregar pedidos."
    );
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>, order: Order) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrderForMenu(order);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedOrderForMenu(null);
  };

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    if (selectedOrderForMenu) {
      try {
        const updatedOrder = await api.updateOrderStatus(selectedOrderForMenu.id.toString(), newStatus);
        notification.showSuccess(`Status do pedido ${selectedOrderForMenu.id} atualizado para "${OrderStatusMapping[newStatus]}".`);
        setOrdersManually(prev => prev ? prev.map(order => (order.id === updatedOrder.id ? updatedOrder : order)) : []);
      } catch (err: any) {
        notification.showError(err.message || "Falha ao atualizar status do pedido.");
      } finally {
        handleMenuClose();
      }
    }
  };

  const handlePrintOrder = async () => {
    if (selectedOrderForMenu) {
      try {
        const blob = await api.printOrder(selectedOrderForMenu.id.toString());
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        notification.showSuccess("PDF do pedido gerado com sucesso!");
      } catch (err: any) {
        notification.showError(err.message || "Falha ao gerar PDF do pedido.");
      } finally {
        handleMenuClose();
      }
    }
  };

  const handleRequestCancellation = (order: Order) => {
    setSelectedOrderForMenu(order);
    setConfirmationAction('cancel');
    setIsConfirmModalOpen(true);
  };

  const handleApproveCancellation = (order: Order) => {
    setSelectedOrderForMenu(order);
    setConfirmationAction('approveCancellation');
    setIsConfirmModalOpen(true);
  };

  const handleRejectCancellation = (order: Order) => {
    setSelectedOrderForMenu(order);
    setConfirmationAction('rejectCancellation');
    setIsConfirmModalOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedOrderForMenu || !confirmationAction) return;

    try {
      let updatedOrder: Order;
      switch (confirmationAction) {
        case 'cancel':
          updatedOrder = await api.cancelClientOrder(selectedOrderForMenu.id.toString());
          notification.showSuccess("Solicitação de cancelamento enviada com sucesso!");
          break;
        case 'approveCancellation':
          updatedOrder = await api.approveOrderCancellationAdmin(selectedOrderForMenu.id.toString());
          notification.showSuccess("Cancelamento do pedido aprovado!");
          break;
        case 'rejectCancellation':
          updatedOrder = await api.rejectOrderCancellationAdmin(selectedOrderForMenu.id.toString());
          notification.showInfo("Cancelamento do pedido rejeitado.");
          break;
        default:
          break;
      }
      // Atualiza o estado da lista de pedidos
      setOrdersManually(prev => prev ? prev.map(order => (order.id === updatedOrder.id ? updatedOrder : order)) : []);
    } catch (err: any) {
      notification.showError(err.message || "Falha na operação.");
    } finally {
      setIsConfirmModalOpen(false);
      setConfirmationAction(null);
      setSelectedOrderForMenu(null);
      handleMenuClose(); // Garante que o menu é fechado
    }
  };

  const getConfirmationMessage = () => {
    if (!selectedOrderForMenu) return "";
    switch (confirmationAction) {
      case 'cancel':
        return `Tem certeza que deseja solicitar o cancelamento do pedido #${selectedOrderForMenu.id}?`;
      case 'approveCancellation':
        return `Tem certeza que deseja aprovar o cancelamento do pedido #${selectedOrderForMenu.id}? Esta ação não pode ser desfeita.`;
      case 'rejectCancellation':
        return `Tem certeza que deseja rejeitar o pedido de cancelamento do pedido #${selectedOrderForMenu.id}?`;
      default:
        return "";
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Gerenciamento de Pedidos
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Visualize e gerencie todos os pedidos do restaurante.
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Tabs value={filterStatus} onChange={(_e, newValue) => setFilterStatus(newValue)} aria-label="Filtro de Status">
          {Object.entries(OrderStatusMapping).map(([key, value]) => (
            <Tab key={key} label={value} value={key} />
          ))}
          <Tab label="Todos" value="todos" />
        </Tabs>
        <TextField
          label="Data Início"
          type="date"
          value={filterStartDate}
          onChange={(e) => setFilterStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Data Fim"
          type="date"
          value={filterEndDate}
          onChange={(e) => setFilterEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <Button variant="contained" onClick={loadOrders} startIcon={<CheckCircleOutlineIcon />}>
          Aplicar Filtros
        </Button>
      </Box>

      {loading && <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />}
      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      {!loading && !error && (orders?.length === 0 ? (
        <Typography variant="h6" color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
          Nenhum pedido encontrado com os filtros selecionados.
        </Typography>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Data</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Endereço de Entrega</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders?.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.client_name}</TableCell>
                  <TableCell>{new Date(order.order_date).toLocaleString('pt-BR')}</TableCell>
                  <TableCell>R$ {order.total_amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip label={OrderStatusMapping[order.status] || order.status} color={
                      order.status === OrderStatus.CONCLUIDO ? 'success' :
                      order.status === OrderStatus.CANCELADO ? 'error' :
                      order.status === OrderStatus.PENDENTE ? 'warning' :
                      'info'
                    } size="small" />
                  </TableCell>
                  <TableCell>{order.delivery_address?.street}, {order.delivery_address?.number}</TableCell>
                  <TableCell>
                    <IconButton
                      aria-label="mais ações"
                      aria-controls="order-menu"
                      aria-haspopup="true"
                      onClick={(e) => handleMenuClick(e, order)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                    <Menu
                      id="order-menu"
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl) && selectedOrderForMenu?.id === order.id}
                      onClose={handleMenuClose}
                    >
                      <MenuItem onClick={() => handleUpdateStatus(OrderStatus.EM_PREPARO)} disabled={order.status !== OrderStatus.PENDENTE}>
                        Em Preparo
                      </MenuItem>
                      <MenuItem onClick={() => handleUpdateStatus(OrderStatus.A_CAMINHO)} disabled={order.status !== OrderStatus.EM_PREPARO}>
                        A Caminho
                      </MenuItem>
                      <MenuItem onClick={() => handleUpdateStatus(OrderStatus.CONCLUIDO)} disabled={order.status !== OrderStatus.A_CAMINHO}>
                        Concluído
                      </MenuItem>
                      {order.status === OrderStatus.SOLICITADO_CANCELAMENTO && (
                        <MenuItem onClick={() => handleApproveCancellation(order)}>
                          Aprovar Cancelamento
                        </MenuItem>
                      )}
                      {order.status === OrderStatus.SOLICITADO_CANCELAMENTO && (
                        <MenuItem onClick={() => handleRejectCancellation(order)}>
                          Rejeitar Cancelamento
                        </MenuItem>
                      )}
                      {order.status !== OrderStatus.CANCELADO && order.status !== OrderStatus.CONCLUIDO && (
                        <MenuItem onClick={() => handleRequestCancellation(order)}>
                          Solicitar Cancelamento (Cliente)
                        </MenuItem>
                      )}
                      <MenuItem onClick={handlePrintOrder}>
                        <PrintIcon sx={{ mr: 1 }} /> Imprimir Pedido
                      </MenuItem>
                      {/* Você pode adicionar um link para ver detalhes do pedido */}
                      {/* <MenuItem onClick={() => navigate(`/admin/pedidos/${order.id}`)}>Ver Detalhes</MenuItem> */}
                    </Menu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ))}

      <ConfirmationDialog
        open={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmAction}
        title="Confirmar Ação"
        message={getConfirmationMessage()}
        confirmButtonText={confirmationAction === 'cancel' ? 'Sim, Cancelar' : confirmationAction === 'approveCancellation' ? 'Sim, Aprovar' : 'Sim, Rejeitar'}
        confirmButtonColor={confirmationAction === 'cancel' || confirmationAction === 'approveCancellation' ? 'error' : 'primary'}
      />
    </Box>
  );
};

export default AdminOrderManagementPage;