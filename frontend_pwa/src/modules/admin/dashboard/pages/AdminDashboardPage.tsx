// frontend_pwa/src/modules/admin/dashboard/pages/AdminDashboardPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Paper, CircularProgress, Alert, Card, CardContent,
  Tab, Tabs, List, ListItem, ListItemText, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon, AttachMoney as AttachMoneyIcon,
  CheckCircleOutline as CheckCircleOutlineIcon, Schedule as ScheduleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import api from '../../../../api/api';
import { useLoading } from '../../../../hooks/useLoading';
import { useNotification } from '../../../../contexts/NotificationContext';
import { OrderStatusMapping } from '../../../../types'; // Supondo que você tenha um tipo para mapeamento de status

interface DashboardMetrics {
  status_counts: { [key: string]: number };
  filter_date: string;
  daily_total_amount: number;
}

const AdminDashboardPage: React.FC = () => {
  const notification = useNotification();
  const { 
    data: metrics, 
    loading: loadingMetrics, 
    error: metricsError, 
    execute: fetchMetrics 
  } = useLoading<DashboardMetrics>();

  const {
    data: recentOrders,
    loading: loadingOrders,
    error: ordersError,
    execute: fetchRecentOrders,
  } = useLoading<any[]>(); // Use o tipo Order se estiver definido

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]); // Data atual

  useEffect(() => {
    loadDashboardData();
  }, [selectedDate]); // Recarrega quando a data muda

  const loadDashboardData = async () => {
    // Busca métricas do dia
    await fetchMetrics(
      api.getDashboardResumeOrders(selectedDate),
      undefined,
      "Erro ao carregar métricas do dashboard."
    );
    // Busca pedidos recentes (você pode querer filtrar por data também)
    await fetchRecentOrders(
      api.getAdminOrders({ data_inicio: selectedDate, data_fim: selectedDate }), // Filtrando pedidos por data
      undefined,
      "Erro ao carregar pedidos recentes."
    );
  };

  const totalOrders = metrics ? Object.values(metrics.status_counts).reduce((sum, count) => sum + count, 0) : 0;
  const totalAmount = metrics ? metrics.daily_total_amount : 0;

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
  };

  if (loadingMetrics || loadingOrders) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={80} />
      </Box>
    );
  }

  if (metricsError || ordersError) {
    return (
      <Alert severity="error" sx={{ mt: 3 }}>
        <Typography variant="h6">Erro ao carregar dados do dashboard:</Typography>
        <Typography>{metricsError || ordersError}</Typography>
        <Button onClick={loadDashboardData} sx={{ mt: 1 }}>Tentar novamente</Button>
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard do Administrador
      </Typography>

      <Box sx={{ mb: 3 }}>
        <FormControl variant="outlined" sx={{ minWidth: 200 }}>
          <TextField
            label="Pedidos do Dia"
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </FormControl>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ShoppingCartIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Total de Pedidos</Typography>
              </Box>
              <Typography variant="h4">{totalOrders}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AttachMoneyIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Faturamento do Dia</Typography>
              </Box>
              <Typography variant="h4">R$ {totalAmount.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        {Object.entries(metrics?.status_counts || {}).map(([status, count]) => (
          <Grid item xs={12} sm={6} md={3} key={status}>
            <Card elevation={3}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {status === 'concluido' && <CheckCircleOutlineIcon color="success" sx={{ mr: 1 }} />}
                  {status === 'pendente' && <ScheduleIcon color="warning" sx={{ mr: 1 }} />}
                  {status === 'cancelado' && <CancelIcon color="error" sx={{ mr: 1 }} />}
                  {/* Adicione mais ícones conforme os status */}
                  <Typography variant="h6">{OrderStatusMapping[status] || status}</Typography>
                </Box>
                <Typography variant="h4">{count}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
        Pedidos Recentes ({selectedDate})
      </Typography>
      {recentOrders && recentOrders.length > 0 ? (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID do Pedido</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Hora</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.client_name}</TableCell>
                  <TableCell>R$ {order.total_amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip label={OrderStatusMapping[order.status] || order.status} color={
                      order.status === 'concluido' ? 'success' :
                      order.status === 'cancelado' ? 'error' :
                      'info'
                    } size="small" />
                  </TableCell>
                  <TableCell>{new Date(order.order_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          Nenhum pedido encontrado para esta data.
        </Typography>
      )}
    </Box>
  );
};

export default AdminDashboardPage;