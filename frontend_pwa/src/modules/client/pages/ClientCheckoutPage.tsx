// frontend_pwa/src/modules/client/pages/ClientCheckoutPage.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import ApiService from "../../shared/services/ApiService";
import { useNotification } from '../../../contexts/NotificationContext';
import { Box, Button, Typography, Paper, RadioGroup, FormControlLabel, Radio, TextField, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import ClientLoginForm from "../../auth/components/ClientLoginForm"; // Reutilizar o formulário de login
import ClientRegisterForm from "../../auth/components/ClientRegisterForm"; // Reutilizar o formulário de registro


interface Address {
  id: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  cep: string;
  isPrimary?: boolean;
}
interface CartItemDetails {
  item_cardapio_id: string; // ID do item no cardápio (vem da API)
  nome: string; // Vem da API
  quantidade: number; // Vem do localStorage
  preco_unitario_momento: number; // Vem da API
  observacoes_item?: string; // Pode ser adicionado futuramente
}

const ClientCheckoutPage: React.FC = () => {
  const { user, isAuthenticated, login } = useAuth(); // Obter a função de login
  const navigate = useNavigate();
  const notification = useNotification();
  const [userAddresses, setUserAddresses] = useState<Address[]>([]
  );
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [cashAmount, setCashAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItemDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCart, setLoadingCart] = useState(true);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [openAuthDialog, setOpenAuthDialog] = useState(false); // Estado para o modal de autenticação
  const [authFormType, setAuthFormType] = useState<'login' | 'register'>('login'); // Tipo de formulário no modal

  const subtotal = cartItems.reduce((sum, item) => sum + item.preco_unitario_momento * item.quantidade, 0);
  const deliveryFee = 5.0;
  const total = subtotal + deliveryFee;

  // Carregar dados de checkout (endereços e carrinho)
  useEffect(() => {
    const loadCheckoutData = async () => {
      setLoadingAddresses(true);
      setLoadingCart(true);
      setError(null);
      
      if (isAuthenticated && user) { // Apenas busca endereços se estiver autenticado
        try {
          const profileData = await ApiService.getUserAddress();
          if (profileData) {
            setUserAddresses(profileData);
            const primaryAddress = profileData.find((addr: Address) => addr.isPrimary);
            if (primaryAddress) {
              setSelectedAddressId(primaryAddress.id);
            }
          } else {
            setUserAddresses([]);
          }
        } catch (err) {
          setError("Falha ao buscar endereços. " + (err instanceof Error ? err.message : String(err)));
          notification.showError("Falha ao buscar endereços.");
        } finally {
          setLoadingAddresses(false);
        }
      } else {
        setLoadingAddresses(false); // Se não autenticado, não há endereços para carregar
      }

      try {
        const savedCart = localStorage.getItem("cartItems");
        const cartData = savedCart ? JSON.parse(savedCart) : {};
        const itemIds = Object.keys(cartData);
        if (itemIds.length === 0) {
          setCartItems([]);
          setLoadingCart(false);
          return;
        }
        const allMenuItems = await ApiService.getMenuItems();

        const detailedCartItems: CartItemDetails[] = itemIds.map(id => {
          const menuItem = allMenuItems.find((item: any) => String(item.id) === id);
          if (!menuItem) return null; 
          return {
            item_cardapio_id: String(menuItem.id),
            nome: menuItem.name,
            quantidade: cartData[id],
            preco_unitario_momento: menuItem.price, 
          };
        }).filter(item => item !== null) as CartItemDetails[];

        setCartItems(detailedCartItems);

      } catch (err) {
        setError("Falha ao carregar itens do carrinho. " + (err instanceof Error ? err.message : String(err)));
        notification.showError("Falha ao carregar itens do carrinho.");
        setCartItems([]);
      } finally {
        setLoadingCart(false);
      }
    };

    loadCheckoutData();
  }, [isAuthenticated, user, notification]); 

  // Observar mudanças no estado de autenticação para recarregar endereços
  useEffect(() => {
    if (isAuthenticated && user) {
      const fetchAddresses = async () => {
        setLoadingAddresses(true);
        try {
          const profileData = await ApiService.getUserAddress();
          if (profileData) {
            setUserAddresses(profileData);
            const primaryAddress = profileData.find((addr: Address) => addr.isPrimary);
            if (primaryAddress) {
              setSelectedAddressId(primaryAddress.id);
            }
          } else {
            setUserAddresses([]);
          }
        } catch (err) {
          notification.showError("Falha ao recarregar endereços após login.");
        } finally {
          setLoadingAddresses(false);
        }
      };
      fetchAddresses();
    }
  }, [isAuthenticated, user, notification]);

  const handleConfirmOrder = async () => {
    if (!isAuthenticated) {
      setOpenAuthDialog(true); // Abre o modal de autenticação se não estiver logado
      return;
    }

    if (!selectedAddressId) {
      setError("Por favor, selecione um endereço de entrega.");
      return;
    }
    if (!paymentMethod) {
      setError("Por favor, selecione uma forma de pagamento.");
      return;
    }
    if (cartItems.length === 0) {
      setError("Seu carrinho está vazio.");
      return;
    }

    let valorPagoDinheiro: number | undefined = undefined;
    if (paymentMethod === "DINHEIRO") {
      const parsedCashAmount = parseFloat(cashAmount);
      if (isNaN(parsedCashAmount) || parsedCashAmount < total) {
        setError("Para pagamento em dinheiro, informe um valor igual ou superior ao total do pedido para o troco.");
        return;
      }
      valorPagoDinheiro = parsedCashAmount;
    }

    setError(null);
    setLoading(true);
    
    const orderData = {
      address_id: selectedAddressId,
      payment_method: paymentMethod,
      items: cartItems.map(item => ({
        menu_item_id: item.item_cardapio_id,
        quantity: item.quantidade,
        price_at_order_time: item.preco_unitario_momento || 0,
        // Adicione observações_item aqui se forem coletadas
      })),
      valor_pago_dinheiro: valorPagoDinheiro,
    };

    try {
      const response = await ApiService.createOrder(orderData);
      notification.showSuccess(`Pedido #${response.id} confirmado!`); // Usar response.id conforme a API
      localStorage.removeItem("cartItems");
      setCartItems([]);
      window.dispatchEvent(new Event('cartUpdated')); // Notificar MainLayout para zerar carrinho
      navigate(`/client/orders`); // Redirecionar para o histórico de pedidos
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Falha ao confirmar o pedido.";
      setError(errorMessage);
      notification.showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = () => {
    setOpenAuthDialog(false); // Fecha o modal
    // Após o login/registro, o useEffect que observa `isAuthenticated` e `user` será acionado e recarregará os endereços.
    notification.showSuccess("Login/Cadastro realizado com sucesso! Prossiga com seu pedido.");
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Finalizar Pedido</Typography>
      {user && <Typography variant="subtitle1" color="text.secondary">Quase lá, {user.name}!</Typography>}
      {error && <Typography sx={{ color: "red", mb: 2 }}>{error}</Typography>}

      {!isAuthenticated && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Você não está logado. Por favor, faça login ou cadastre-se para finalizar o pedido.
        </Alert>
      )}

      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Resumo do Pedido</Typography>
        {loadingCart ? (
          <CircularProgress size={20} />
        ) : cartItems.length > 0 ? (
          cartItems.map(item => (
            <Typography key={item.item_cardapio_id}>
              {item.nome} (x{item.quantidade}) - R$ {(item.preco_unitario_momento * item.quantidade).toFixed(2)}
            </Typography>
          ))
        ) : (
          <Typography>Seu carrinho está vazio. Adicione itens <Link to="/client/menu">aqui</Link>.</Typography>
        )}
        <Divider sx={{ my: 1 }} />
        <Typography>Subtotal: R$ {subtotal.toFixed(2)}</Typography>
        <Typography>Taxa de Entrega: R$ {deliveryFee.toFixed(2)}</Typography>
        <Typography variant="h5" sx={{ mt: 1 }}><strong>Total a Pagar: R$ {total.toFixed(2)}</strong></Typography>
      </Paper>

      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Endereço de Entrega</Typography>
        {loadingAddresses ? (
          <CircularProgress size={20} />
        ) : isAuthenticated && userAddresses.length > 0 ? (
          <RadioGroup
            value={selectedAddressId}
            onChange={(e) => setSelectedAddressId(e.target.value)}
          >
            {userAddresses.map(addr => (
              <FormControlLabel
                key={addr.id}
                value={addr.id}
                control={<Radio />}
                label={
                  <Box>
                    <Typography>{addr.street}, {addr.number}{addr.complement ? ` - ${addr.complement}` : ""} - {addr.district}</Typography>
                    <Typography variant="body2" color="text.secondary">{addr.city} - {addr.state}, CEP: {addr.cep} {addr.isPrimary && '(Principal)'}</Typography>
                  </Box>
                }
              />
            ))}
          </RadioGroup>
        ) : (
          <Typography>
            {isAuthenticated ? 'Nenhum endereço cadastrado. ' : 'Faça login para gerenciar seus endereços. '}
            <Link to="/client/profile">Adicionar/Gerenciar Endereços no Perfil</Link>
          </Typography>
        )}
      </Paper>

      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Forma de Pagamento</Typography>
        <RadioGroup
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <FormControlLabel value="CARTAO_CREDITO" control={<Radio />} label="Cartão de Crédito" />
          <FormControlLabel value="CARTAO_DEBITO" control={<Radio />} label="Cartão de Débito" />
          <FormControlLabel value="PIX" control={<Radio />} label="PIX" />
          <FormControlLabel value="DINHEIRO" control={<Radio />} label="Dinheiro" />
        </RadioGroup>
        {paymentMethod === "DINHEIRO" && (
          <TextField
            label="Troco para (R$)"
            type="number"
            value={cashAmount}
            onChange={(e) => setCashAmount(e.target.value)}
            fullWidth
            margin="normal"
            inputProps={{ min: total.toFixed(2), step: "0.01" }}
            placeholder={`Ex: ${total.toFixed(2)} ou mais`}
          />
        )}
      </Paper>

      <Button
        variant="contained"
        color="primary"
        fullWidth
        size="large"
        onClick={handleConfirmOrder}
        disabled={loading || loadingAddresses || loadingCart || cartItems.length === 0 || (!isAuthenticated && !openAuthDialog)}
      >
        {loading ? "Confirmando..." : (isAuthenticated ? "Confirmar Pedido" : "Login/Cadastre-se para Finalizar")}
      </Button>
      <Button
        component={Link}
        to="/client/cart"
        fullWidth
        sx={{ mt: 2 }}
      >
        Voltar ao Carrinho
      </Button>

      {/* Modal de Autenticação */}
      <Dialog open={openAuthDialog} onClose={() => setOpenAuthDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" component="span">
            {authFormType === 'login' ? 'Faça Login' : 'Crie sua Conta'}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={() => setOpenAuthDialog(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {authFormType === 'login' ? (
            <ClientLoginForm onLoginSuccess={handleAuthSuccess} />
          ) : (
            <ClientRegisterForm onRegisterSuccess={handleAuthSuccess} />
          )}
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            {authFormType === 'login' ? (
              <Typography variant="body2">
                Não tem conta? <Link to="#" onClick={() => setAuthFormType('register')}>Cadastre-se</Link>
              </Typography>
            ) : (
              <Typography variant="body2">
                Já tem conta? <Link to="#" onClick={() => setAuthFormType('login')}>Faça Login</Link>
              </Typography>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ClientCheckoutPage;