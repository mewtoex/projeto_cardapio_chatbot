import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Container, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, CircularProgress, Tabs, Tab, TextField, InputAdornment
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../api/api';
import { useLoading } from '../../../hooks/useLoading';
import { useNotification } from '../../../contexts/NotificationContext';
import { type Order, OrderStatus, OrderStatusMapping } from '../../../types';
import { Search as SearchIcon, CalendarToday as CalendarTodayIcon } from '@mui/icons-material';

const ClientOrderHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const notification = useNotification();
  const {
    data: orders,
    loading,
    error,
    execute: fetchOrders,
  } = useLoading<Order[]>();

  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

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
      api.getClientOrders(filters),
      undefined,
      "Erro ao carregar seu histórico de pedidos."
    );
  };

  const filteredOrders = orders?.filter(order =>
    order.id.toString().includes(searchQuery) ||
    order.items.some(item => item.menu_item_name.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  const handleFilterStatusChange = (_event: React.SyntheticEvent, newValue: string) => {
    setFilterStatus(newValue);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };


  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>Carregando seus pedidos...</Typography>
        </Paper>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', color: 'error.main' }}>
          <Typography variant="h6">Erro ao carregar seu histórico de pedidos:</Typography>
          <Typography>{error}</Typography>
          <Button onClick={loadOrders} sx={{ mt: 2 }}>Tentar Novamente</Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 3 }}>
        Meus Pedidos
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={filterStatus}
          onChange={handleFilterStatusChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          {Object.entries(OrderStatusMapping).map(([key, value]) => (
            <Tab key={key} label={value} value={key} />
          ))}
          <Tab label="Todos" value="todos" />
        </Tabs>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Data Início"
            type="date"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          <TextField
            label="Data Fim"
            type="date"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          <Button variant="outlined" onClick={loadOrders} startIcon={<CalendarTodayIcon />}>
            Filtrar por Data
          </Button>
        </Box>
        <TextField
          label="Buscar por ID ou item"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 200 }}
        />
      </Box>

      {filteredOrders.length === 0 ? (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Você não tem pedidos com os filtros selecionados.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/cardapio')} sx={{ mt: 2 }}>
            Fazer um Pedido
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID do Pedido</TableCell>
                <TableCell>Data</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Itens</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
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
                  <TableCell>
                    {order.items.map(item => item.menu_item_name).join(', ')}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      component={Link}
                      to={`/client/pedidos/${order.id}`}
                    >
                      Ver Detalhes
                    </Button>
                    {order.status === OrderStatus.PENDENTE && (
                      <Button
                        variant="text"
                        color="error"
                        size="small"
                        onClick={() => {  }}
                        sx={{ ml: 1 }}
                      >
                        Cancelar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default ClientOrderHistoryPage;