// frontend_pwa/src/modules/client/pages/ClientCheckoutPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Container, Paper, Grid, Divider, CircularProgress,
  TextField, FormControl, InputLabel, Select, MenuItem, FormLabel, RadioGroup, FormControlLabel, Radio,
  List,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../hooks/useCart';
import { useAddresses } from '../../../hooks/useAddresses'; 
import { useAuth } from '../../auth/contexts/AuthContext';
import { useLoading } from '../../../hooks/useLoading';
import { useNotification } from '../../../contexts/NotificationContext';
import api from '../../../api/api';
import AddressSelection from '../components/AddressSelection'; 
import PaymentMethodSelection from '../components/PaymentMethodSelection'; 
import { type Address, type OrderCreateItem } from '../../../types';

const ClientCheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, getCartSubtotal, clearCart } = useCart();
  const { user } = useAuth();
  const notification = useNotification();
  const { addresses, loading: loadingAddresses, error: addressesError } = useAddresses(); 

  const { loading: submittingOrder, error: orderError, execute: submitOrder } = useLoading();
  const { loading: calculatingDelivery, error: deliveryError, execute: calculateDelivery } = useLoading<{ delivery_fee: number; message?: string }>();

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [cashProvided, setCashProvided] = useState<number | null>(null);
  const [deliveryFee, setDeliveryFee] = useState<number>(0);

  useEffect(() => {
    if (Object.keys(cartItems).length === 0) {
      notification.showWarning("Seu carrinho está vazio. Redirecionando para o cardápio.");
      navigate('/cardapio');
    }
  }, [cartItems, navigate, notification]);

  useEffect(() => {
    const fetchFee = async () => {
      if (selectedAddressId) {
        try {
          const result = await calculateDelivery(
            api.calculateDeliveryFee(selectedAddressId),
            undefined, 
            "Erro ao calcular taxa de entrega."
          );
          setDeliveryFee(result?.delivery_fee || 0);
        } catch (e) {
          setDeliveryFee(0); 
        }
      } else {
        setDeliveryFee(0);
      }
    };
    fetchFee();
  }, [selectedAddressId, calculateDelivery]);

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
  };

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPaymentMethod(method);
  };

  const handleCashProvidedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    setCashProvided(isNaN(value) ? null : value);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      notification.showError("Por favor, selecione um endereço de entrega.");
      return;
    }
    if (!selectedPaymentMethod) {
      notification.showError("Por favor, selecione um método de pagamento.");
      return;
    }

    const itemsToOrder: OrderCreateItem[] = Object.values(cartItems).map(item => ({
      menu_item_id: item.id,
      quantity: item.quantity,
      observations: item.observations,
      addon_options_ids: item.selectedAddons?.map(addon => addon.id) || [],
    }));

    const orderPayload = {
      address_id: parseInt(selectedAddressId, 10), 
      payment_method: selectedPaymentMethod,
      items: itemsToOrder,
      cash_provided: selectedPaymentMethod === 'dinheiro' && cashProvided !== null ? cashProvided : undefined,
    };

    try {
      await submitOrder(
        api.createOrder(orderPayload),
        "Pedido realizado com sucesso!",
        "Erro ao finalizar pedido."
      );
      clearCart(); 
      navigate('/client/pedidos'); 
    } catch (err) {
      console.error("Falha ao criar pedido:", err);
    }
  };

  const subtotal = getCartSubtotal();
  const totalAmount = subtotal + deliveryFee;
  const changeDue = (selectedPaymentMethod === 'dinheiro' && cashProvided !== null && cashProvided > totalAmount)
    ? cashProvided - totalAmount
    : 0;

  if (loadingAddresses || calculatingDelivery) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>Carregando dados do checkout...</Typography>
        </Paper>
      </Container>
    );
  }

  if (addressesError || orderError || deliveryError) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', color: 'error.main' }}>
          <Typography variant="h6">Erro ao carregar dados do checkout:</Typography>
          <Typography>{addressesError || orderError || deliveryError}</Typography>
          <Button onClick={() => window.location.reload()} sx={{ mt: 2 }}>Tentar Novamente</Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 3 }}>
        Checkout
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 7 }}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              1. Endereço de Entrega
            </Typography>
            <AddressSelection
              addresses={addresses || []}
              selectedAddressId={selectedAddressId}
              onSelectAddress={handleAddressSelect}
            />
            {addresses && addresses.length === 0 && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Você não tem endereços cadastrados. Por favor, adicione um em seu perfil.
                </Typography>
                <Button variant="outlined" sx={{ mt: 1 }} onClick={() => navigate('/client/perfil')}>
                  Ir para Perfil
                </Button>
              </Box>
            )}
            {selectedAddressId && deliveryFee > 0 && (
              <Typography variant="body2" color="success.main" sx={{ mt: 2 }}>
                Taxa de Entrega para este endereço: R$ {deliveryFee.toFixed(2)}
              </Typography>
            )}
            {selectedAddressId && deliveryFee === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Entrega gratuita para este endereço.
              </Typography>
            )}
          </Paper>

          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              2. Método de Pagamento
            </Typography>
            <PaymentMethodSelection
              selectedMethod={selectedPaymentMethod}
              onSelectMethod={handlePaymentMethodSelect}
            />
            {selectedPaymentMethod === 'dinheiro' && (
              <TextField
                fullWidth
                label="Valor em dinheiro (para troco)"
                type="number"
                inputProps={{ min: totalAmount.toFixed(2), step: 0.01 }}
                value={cashProvided === null ? '' : cashProvided}
                onChange={handleCashProvidedChange}
                margin="normal"
                sx={{ mt: 2 }}
                helperText={
                  cashProvided !== null && cashProvided < totalAmount
                    ? "Valor deve ser maior ou igual ao total do pedido."
                    : changeDue > 0
                    ? `Troco para: R$ ${changeDue.toFixed(2)}`
                    : ""
                }
                error={cashProvided !== null && cashProvided < totalAmount}
              />
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 5}} >
          <Paper elevation={3} sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h5" gutterBottom>
              Resumo do Pedido
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List  disablePadding>
              {Object.values(cartItems).map((item, index) => (
                <Box key={index} sx={{ mb: 1.5 }}>
                  <Typography variant="body2" component="div" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{item.quantity}x {item.name}</span>
                    <span>R$ {(item.totalItemPrice * item.quantity).toFixed(2)}</span>
                  </Typography>
                  {item.selectedAddons && item.selectedAddons.length > 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 2, display: 'block' }}>
                      Adicionais: {item.selectedAddons.map(addon => addon.name).join(', ')}
                    </Typography>
                  )}
                  {item.observations && (
                     <Typography variant="caption" color="text.secondary" sx={{ ml: 2, fontStyle: 'italic', display: 'block' }}>
                       Obs: {item.observations}
                     </Typography>
                  )}
                </Box>
              ))}
            </List>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1">Subtotal:</Typography>
              <Typography variant="body1">R$ {subtotal.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1">Taxa de Entrega:</Typography>
              <Typography variant="body1">R$ {deliveryFee.toFixed(2)}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Total Geral:</Typography>
              <Typography variant="h6">R$ {totalAmount.toFixed(2)}</Typography>
            </Box>
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              onClick={handlePlaceOrder}
              disabled={submittingOrder || !selectedAddressId || !selectedPaymentMethod || (selectedPaymentMethod === 'dinheiro' && (cashProvided === null || cashProvided < totalAmount))}
              sx={{ py: 1.5 }}
            >
              {submittingOrder ? <CircularProgress size={24} /> : 'Finalizar Pedido'}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ClientCheckoutPage;