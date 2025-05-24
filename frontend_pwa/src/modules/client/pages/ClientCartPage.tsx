// src/modules/client/pages/ClientCartPage.tsx
import React, { useState, useEffect } from "react";
import { 
  Typography, 
  Box, 
  Paper, 
  Divider, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  IconButton, 
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  ListItemSecondaryAction,
  Chip,
  Collapse,
  Alert,
  Fade,
  CircularProgress
} from "@mui/material";
import { 
  Add as AddIcon, 
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingBag as ShoppingBagIcon,
  ArrowBack as ArrowBackIcon
} from "@mui/icons-material";
import { useAuth } from "../../auth/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useNotification } from "../../../contexts/NotificationContext";
import ApiService from "../../../modules/shared/services/ApiService";

// Interface para itens do carrinho
interface ICartItem {
  id: number;
  name: string;
  quantidade: number;
  price: number;
  imagem_url?: string;
  category_name: string;
}

const ClientCartPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const notification = useNotification();
  const [cartItems, setCartItems] = useState<ICartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [subtotal, setSubtotal] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(5.0);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [showCouponAlert, setShowCouponAlert] = useState(false);
  const [couponAlertType, setCouponAlertType] = useState<"success" | "error">("success");
  const [couponAlertMessage, setCouponAlertMessage] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    const loadCartItems = async () => {
      try {
        setLoading(true);
        
        // Recuperar carrinho do localStorage
        const savedCart = localStorage.getItem('cartItems');
        if (!savedCart) {
          setCartItems([]);
          setLoading(false);
          return;
        }
        
        const cartItemIds = Object.entries(JSON.parse(savedCart))
          .map(([id, quantity]) => ({ id: parseInt(id), quantity: quantity as number }));
        
        if (cartItemIds.length === 0) {
          setCartItems([]);
          setLoading(false);
          return;
        }
        
        // Buscar detalhes dos itens da API
        const itemsData = await ApiService.getMenuItems();
        
        // Mapear itens do carrinho com detalhes completos
        const fullCartItems = cartItemIds.map(cartItem => {
          const itemDetails = itemsData.find((item: any) => item.id === cartItem.id);
          if (!itemDetails) return null;
          
          return {
            id: itemDetails.id,
            name: itemDetails.name,
            quantidade: cartItem.quantity,
            price: itemDetails.price,
            imagem_url: itemDetails.imagem_url,
            category_name: itemDetails.category_name
          };
        }).filter(item => item !== null) as ICartItem[];
        
        setCartItems(fullCartItems);
      } catch (error) {
        notification.showError("Erro ao carregar itens do carrinho");
        console.error("Erro ao carregar carrinho:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCartItems();
  }, [notification]);

  useEffect(() => {
    // Recalcular subtotal sempre que os itens do carrinho mudarem
    const newSubtotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantidade,
      0
    );
    setSubtotal(newSubtotal);
  }, [cartItems]);

  const handleUpdateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      // Mostrar confirmação antes de remover
      handleRemoveItem(itemId);
      return;
    }

    // Atualizar o item no carrinho
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, quantidade: newQuantity } : item
      )
    );
    
    // Atualizar no localStorage
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      const cartData = JSON.parse(savedCart);
      cartData[itemId] = newQuantity;
      localStorage.setItem('cartItems', JSON.stringify(cartData));
    }
    
    notification.showSuccess("Quantidade atualizada");
  };

  const handleRemoveItem = (itemId: number) => {
    const itemToRemove = cartItems.find(item => item.id === itemId);
    
    // Remover do estado
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
    
    // Remover do localStorage
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      const cartData = JSON.parse(savedCart);
      delete cartData[itemId];
      localStorage.setItem('cartItems', JSON.stringify(cartData));
    }
    
    if (itemToRemove) {
      notification.showInfo(`${itemToRemove.name} removido do carrinho`);
    }
  };

  const handleApplyCoupon = async () => {
    try {
      // Em uma implementação real, você chamaria a API para validar o cupom
      // const response = await ApiService.validateCoupon(couponCode);
      
      // Simulação de validação de cupom
      if (couponCode.toUpperCase() === "DESC10") {
        const discountAmount = subtotal * 0.1; // 10% de desconto
        setDiscount(discountAmount);
        setCouponAlertType("success");
        setCouponAlertMessage("Cupom aplicado com sucesso! 10% de desconto.");
        notification.showSuccess("Cupom aplicado com sucesso!");
      } else {
        setDiscount(0);
        setCouponAlertType("error");
        setCouponAlertMessage("Cupom inválido ou expirado.");
        notification.showError("Cupom inválido ou expirado");
      }
      setShowCouponAlert(true);
      
      // Esconder o alerta após alguns segundos
      setTimeout(() => {
        setShowCouponAlert(false);
      }, 3000);
    } catch (error) {
      notification.showError("Erro ao aplicar cupom");
      setShowCouponAlert(false);
    }
  };

  const handleCheckout = async () => {
    try {
      setIsCheckingOut(true);
      
      // Em uma implementação real, você enviaria os dados do carrinho para a API
      // const orderData = {
      //   items: cartItems.map(item => ({
      //     id_item: item.id,
      //     quantidade: item.quantidade
      //   })),
      //   cupom: couponCode || undefined,
      //   valor_entrega: deliveryFee
      // };
      // await ApiService.createOrder(orderData);
      
      // Simulação de processamento
      setTimeout(() => {
        navigate("/client/checkout");
      }, 1000);
    } catch (error) {
      notification.showError("Erro ao processar pedido");
      setIsCheckingOut(false);
    }
  };

  const totalAmount = subtotal + deliveryFee - discount;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Carregando carrinho...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Meu Carrinho</Typography>
        <Button 
          component={Link} 
          to="/client/menu"
          startIcon={<ArrowBackIcon />}
          color="inherit"
        >
          Voltar ao Cardápio
        </Button>
      </Box>

      {user && (
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          Revise seus itens, {user.name}
        </Typography>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, mb: { xs: 3, md: 0 } }}>
            {cartItems.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <ShoppingBagIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Seu carrinho está vazio
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Adicione itens do cardápio para começar seu pedido
                </Typography>
                <Button 
                  variant="contained" 
                  component={Link} 
                  to="/client/menu"
                >
                  Ver Cardápio
                </Button>
              </Box>
            ) : (
              <>
                <Typography variant="h6" gutterBottom>
                  Itens do Pedido ({cartItems.length})
                </Typography>
                <List sx={{ width: '100%' }}>
                  {cartItems.map((item) => (
                    <React.Fragment key={item.id}>
                      <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                          {item.imagem_url ? (
                            <Avatar 
                              alt={item.name} 
                              src={item.imagem_url} 
                              variant="rounded"
                              sx={{ width: 70, height: 70 }}
                            />
                          ) : (
                            <Avatar 
                              variant="rounded"
                              sx={{ width: 70, height: 70, bgcolor: 'grey.300' }}
                            >
                              {item.name.charAt(0)}
                            </Avatar>
                          )}
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="subtitle1">{item.name}</Typography>
                              <Chip 
                                label={item.category_name} 
                                size="small" 
                                variant="outlined"
                                sx={{ ml: 1 }}
                              />
                            </Box>
                          }
                          secondary={
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              R$ {item.price.toFixed(2)} cada
                            </Typography>
                          }
                          sx={{ ml: 2 }}
                        />
                        <ListItemSecondaryAction>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>
                              R$ {(item.price * item.quantidade).toFixed(2)}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <IconButton 
                                edge="end" 
                                aria-label="diminuir" 
                                onClick={() => handleUpdateQuantity(item.id, item.quantidade - 1)}
                                size="small"
                              >
                                <RemoveIcon />
                              </IconButton>
                              
                              <TextField
                                value={item.quantidade}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value);
                                  if (!isNaN(value)) {
                                    handleUpdateQuantity(item.id, value);
                                  }
                                }}
                                inputProps={{ 
                                  min: 1, 
                                  style: { textAlign: 'center' } 
                                }}
                                variant="outlined"
                                size="small"
                                sx={{ width: 60, mx: 1 }}
                              />
                              
                              <IconButton 
                                edge="end" 
                                aria-label="aumentar" 
                                onClick={() => handleUpdateQuantity(item.id, item.quantidade + 1)}
                                size="small"
                              >
                                <AddIcon />
                              </IconButton>
                              
                              <IconButton 
                                edge="end" 
                                aria-label="remover" 
                                onClick={() => handleRemoveItem(item.id)}
                                color="error"
                                sx={{ ml: 1 }}
                                size="small"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </Box>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))}
                </List>
              </>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Resumo do Pedido
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={8}>
                    <Typography variant="body1">Subtotal</Typography>
                  </Grid>
                  <Grid item xs={4} sx={{ textAlign: 'right' }}>
                    <Typography variant="body1">R$ {subtotal.toFixed(2)}</Typography>
                  </Grid>
                  
                  <Grid item xs={8}>
                    <Typography variant="body1">Taxa de Entrega</Typography>
                  </Grid>
                  <Grid item xs={4} sx={{ textAlign: 'right' }}>
                    <Typography variant="body1">R$ {deliveryFee.toFixed(2)}</Typography>
                  </Grid>
                  
                  {discount > 0 && (
                    <>
                      <Grid item xs={8}>
                        <Typography variant="body1" color="success.main">
                          Desconto
                        </Typography>
                      </Grid>
                      <Grid item xs={4} sx={{ textAlign: 'right' }}>
                        <Typography variant="body1" color="success.main">
                          -R$ {discount.toFixed(2)}
                        </Typography>
                      </Grid>
                    </>
                  )}
                </Grid>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6">R$ {totalAmount.toFixed(2)}</Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Grid container spacing={1}>
                  <Grid item xs={8}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Cupom de Desconto"
                      variant="outlined"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <Button 
                      fullWidth 
                      variant="outlined"
                      onClick={handleApplyCoupon}
                      disabled={!couponCode}
                      sx={{ height: '100%' }}
                    >
                      Aplicar
                    </Button>
                  </Grid>
                </Grid>
                
                <Collapse in={showCouponAlert}>
                  <Alert 
                    severity={couponAlertType} 
                    sx={{ mt: 1 }}
                    onClose={() => setShowCouponAlert(false)}
                  >
                    {couponAlertMessage}
                  </Alert>
                </Collapse>
              </Box>
              
              <Button
                fullWidth
                variant="contained"
                size="large"
                disabled={cartItems.length === 0 || isCheckingOut}
                onClick={handleCheckout}
                sx={{ mt: 2 }}
              >
                {isCheckingOut ? "Processando..." : "Finalizar Pedido"}
              </Button>
              
              <Button
                fullWidth
                component={Link}
                to="/client/menu"
                sx={{ mt: 2 }}
              >
                Continuar Comprando
              </Button>
            </CardContent>
          </Card>
          
          <Paper sx={{ p: 2, mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Métodos de Pagamento Aceitos
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip label="Cartão de Crédito" size="small" />
              <Chip label="Cartão de Débito" size="small" />
              <Chip label="Pix" size="small" />
              <Chip label="Dinheiro" size="small" />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ClientCartPage;
