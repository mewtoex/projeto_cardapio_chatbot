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

interface AddonOption {
  id: string;
  addon_category_id: string;
  name: string;
  price: number;
}

interface ICartItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  image_url?: string;
  category_name: string;
  observations?: string;
  selectedAddons?: AddonOption[];
  totalItemPrice: number;
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
    const loadCartItems = () => {
      try {
        setLoading(true);

        const savedCart = localStorage.getItem('cartItems');
        if (!savedCart) {
          setCartItems([]);
          setLoading(false);
          return;
        }

        const parsedCart = JSON.parse(savedCart);
        const fullCartItems: ICartItem[] = Object.values(parsedCart);
        setCartItems(fullCartItems);
      } catch (error) {
        notification.showError("Erro ao carregar itens do carrinho. O carrinho pode estar corrompido e será limpo.");
        console.error("Erro ao carregar carrinho:", error);
        localStorage.removeItem('cartItems');
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadCartItems();
  }, [notification]);

  useEffect(() => {
    const newSubtotal = cartItems.reduce(
      (sum, item) => sum + item.totalItemPrice * item.quantity,
      0
    );
    setSubtotal(newSubtotal);
  }, [cartItems]);

  const handleUpdateQuantity = (itemKey: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemKey);
      return;
    }

    setCartItems(prevItems => {
      const updatedItems = prevItems.map((item) => {
        // Recria a chave do item para garantir que a comparação seja precisa
        const addonsHash = item.selectedAddons?.map(a => a.id).sort().join(',') || '';
        const observationsHash = item.observations ? item.observations.slice(0, 50) : '';
        const currentItemKey = `${item.id}-${addonsHash}-${observationsHash}`;

        if (currentItemKey === itemKey) {
          return { ...item, quantity: newQuantity };
        }
        return item;
      });

      // Atualiza o localStorage com base na estrutura de objeto original
      const savedCart = localStorage.getItem('cartItems');
      if (savedCart) {
        try {
          const cartData = JSON.parse(savedCart);
          const itemToUpdateKey = Object.keys(cartData).find(key => key === itemKey);
          if (itemToUpdateKey) {
            cartData[itemToUpdateKey].quantity = newQuantity;
            localStorage.setItem('cartItems', JSON.stringify(cartData));
          }
        } catch (e) {
          console.error("Erro ao atualizar carrinho no localStorage:", e);
          notification.showError("Erro ao salvar alterações no carrinho.");
        }
      }
      return updatedItems;
    });
    notification.showSuccess("Quantidade atualizada");
  };

  const handleRemoveItem = (itemKey: string) => {
    const itemToRemove = cartItems.find(item => {
        const addonsHash = item.selectedAddons?.map(a => a.id).sort().join(',') || '';
        const observationsHash = item.observations ? item.observations.slice(0, 50) : '';
        const currentItemKey = `${item.id}-${addonsHash}-${observationsHash}`;
        return currentItemKey === itemKey;
    });

    setCartItems((prevItems) => prevItems.filter((item) => {
      const addonsHash = item.selectedAddons?.map(a => a.id).sort().join(',') || '';
      const observationsHash = item.observations ? item.observations.slice(0, 50) : '';
      const currentItemKey = `${item.id}-${addonsHash}-${observationsHash}`;
      return currentItemKey !== itemKey;
    }));

    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        delete cartData[itemKey];
        localStorage.setItem('cartItems', JSON.stringify(cartData));
      } catch (e) {
        console.error("Erro ao remover item do carrinho no localStorage:", e);
        notification.showError("Erro ao remover item do carrinho.");
      }
    }

    if (itemToRemove) {
      notification.showInfo(`${itemToRemove.name} removido do carrinho`);
    }
  };


  const handleApplyCoupon = async () => {
    try {
      if (couponCode.toUpperCase() === "DESC10") {
        const discountAmount = subtotal * 0.1;
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
      navigate("/client/checkout");
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
                  {cartItems.map((item) => {
                    const addonsHash = item.selectedAddons?.map(a => a.id).sort().join(',') || '';
                    const observationsHash = item.observations ? item.observations.slice(0, 50) : '';
                    const itemKey = `${item.id}-${addonsHash}-${observationsHash}`;
                    return (
                      <React.Fragment key={itemKey}>
                        <ListItem alignItems="flex-start" sx={{ py: 1.5 }}> {/* Ajuste do padding vertical */}
                          <ListItemAvatar sx={{ mr: 2 }}> {/* Adicionado margin-right */}
                            {item.image_url ? (
                              <Avatar
                                alt={item.name}
                                src={item.image_url}
                                variant="rounded"
                                sx={{ width: 70, height: 70 }}
                              />
                            ) : (
                              <Avatar
                                variant="rounded"
                                sx={{ width: 70, height: 70, bgcolor: 'grey.300' }}
                              >
                                <Typography variant="caption" color="text.secondary">
                                  {item.name.charAt(0)}
                                </Typography>
                              </Avatar>
                            )}
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="subtitle1" fontWeight="bold">{item.name}</Typography> {/* Texto mais negrito */}
                                <Chip
                                  label={item.category_name}
                                  size="small"
                                  variant="outlined"
                                  sx={{ ml: 1 }}
                                />
                              </Box>
                            }
                            secondary={
                              <Box sx={{ mt: 0.5 }}> {/* Ajuste de margem superior */}
                                <Typography
                                  component="span"
                                  variant="body2"
                                  color="text.primary"
                                  display="block" // Garante que ocupe a linha inteira
                                >
                                  R$ {item.price.toFixed(2)} cada (base)
                                </Typography>
                                {item.selectedAddons && item.selectedAddons.length > 0 && (
                                  <Box sx={{ mt: 0.5 }}>
                                    <Typography variant="body2" color="text.secondary">
                                      Adicionais: {item.selectedAddons.map(addon => addon.name).join(', ')}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      (+ R$ {(item.totalItemPrice - item.price).toFixed(2)})
                                    </Typography>
                                  </Box>
                                )}
                                {item.observations && (
                                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mt: 0.5 }}>
                                    Obs: {item.observations}
                                  </Typography>
                                )}
                              </Box>
                            }
                            sx={{ ml: 0 }} /* Removido ml:2 que existia antes para aproximar o texto da imagem */
                          />
                          <ListItemSecondaryAction>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}> {/* Valor total do item em negrito */}
                                R$ {(item.totalItemPrice * item.quantity).toFixed(2)}
                              </Typography>

                              <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 10 }}>
                                <IconButton
                                  edge="end"
                                  aria-label="diminuir"
                                  onClick={() => handleUpdateQuantity(itemKey, item.quantity - 1)}
                                  size="small"
                                >
                                  <RemoveIcon />
                                </IconButton>

                                <TextField
                                  value={item.quantity}
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    if (!isNaN(value)) {
                                      handleUpdateQuantity(itemKey, value);
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
                                  onClick={() => handleUpdateQuantity(itemKey, item.quantity + 1)}
                                  size="small"
                                >
                                  <AddIcon />
                                </IconButton>

                                <IconButton
                                  edge="end"
                                  aria-label="remover"
                                  onClick={() => handleRemoveItem(itemKey)}
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
                        <Divider variant="inset" component="li" sx={{ my: 1,marginTop: 5,marginBottom: 5 }} /> 
                      </React.Fragment>
                    );
                  })}
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