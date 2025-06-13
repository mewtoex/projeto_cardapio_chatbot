// frontend_pwa/src/modules/client/pages/ClientCartPage.tsx
import React from 'react';
import {
  Box, Typography, Button, Container, Paper, Grid, Divider, CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../hooks/useCart'; // Usando o hook useCart
import CartItem from '../components/CartItem'; // Novo componente CartItem
import { useNotification } from '../../../contexts/NotificationContext';

const ClientCartPage: React.FC = () => {
  const { cartItems, getTotalCartItems, getCartSubtotal, clearCart } = useCart();
  const notification = useNotification();
  const navigate = useNavigate();

  const handleClearCart = () => {
    clearCart();
    notification.showInfo("Carrinho esvaziado.");
  };

  const handleCheckout = () => {
    if (getTotalCartItems() === 0) {
      notification.showWarning("Seu carrinho está vazio. Adicione itens antes de prosseguir.");
      return;
    }
    navigate('/client/checkout');
  };

  const cartItemsArray = Object.entries(cartItems);

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 3 }}>
        Seu Carrinho
      </Typography>

      {getTotalCartItems() === 0 ? (
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Seu carrinho está vazio.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/cardapio')} sx={{ mt: 2 }}>
            Explorar Cardápio
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 3 }}>
              {cartItemsArray.map(([key, item]) => (
                <CartItem key={key} item={item} itemKey={key} />
              ))}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button variant="outlined" color="error" onClick={handleClearCart}>
                  Esvaziar Carrinho
                </Button>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Resumo do Pedido
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Itens ({getTotalCartItems()}):</Typography>
                <Typography variant="body1">R$ {getCartSubtotal().toFixed(2)}</Typography>
              </Box>
              {/* Adicione taxas de entrega, descontos, etc., aqui se aplicável */}
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6">R$ {getCartSubtotal().toFixed(2)}</Typography>
              </Box>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleCheckout}
                sx={{ py: 1.5 }}
              >
                Continuar para o Checkout
              </Button>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default ClientCartPage;