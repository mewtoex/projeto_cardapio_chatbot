// src/modules/client/pages/ClientMenuPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  Container,
  Tabs,
  Tab,
  Skeleton,
  IconButton,
  Badge,
  CircularProgress,
  Dialog, // NOVO
  DialogTitle, // NOVO
  DialogContent, // NOVO
  DialogActions, // NOVO
  TextField, // NOVO
  FormControlLabel, // NOVO
  Checkbox, // NOVO
  RadioGroup, // NOVO
  Radio, // NOVO
  FormGroup, // NOVO
  FormControl, // NOVO
  FormLabel, // NOVO
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  Add as AddIcon,
  Close as CloseIcon // NOVO
} from '@mui/icons-material';
import { useAuth } from '../../auth/contexts/AuthContext';
import ApiService from '../../shared/services/ApiService';
import { useNotification } from '../../../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';

interface MenuItem {
  id: number;
  name: string;
  category_id: string;
  category_name: string;
  price: number;
  description: string;
  available: boolean;
  image_url?: string;
  has_addons: boolean; // NOVO CAMPO
  addon_categories?: AddonCategory[]; // NOVO CAMPO
}

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface AddonCategory { // NOVO INTERFACE
  id: string;
  name: string;
  min_selections: number;
  max_selections: number;
  is_required: boolean;
  options: AddonOption[];
}

interface AddonOption { // NOVO INTERFACE
  id: string;
  addon_category_id: string;
  name: string;
  price: number;
}

interface CartItemData { // NOVO INTERFACE para estrutura do item no carrinho
  id: number; // ID do MenuItem
  name: string;
  price: number; // Preço base do MenuItem
  quantity: number;
  image_url?: string;
  category_name: string;
  observations?: string; // Observações do item
  selectedAddons?: AddonOption[]; // Adicionais selecionados
  totalItemPrice?: number; // Preço total do item com adicionais
}


const ClientMenuPage: React.FC = () => {
  const { user } = useAuth();
  const notification = useNotification();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // NOVO: Estados para o modal de adicionais/observações
  const [openItemDetailsModal, setOpenItemDetailsModal] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [itemObservations, setItemObservations] = useState<string>('');
  const [selectedAddons, setSelectedAddons] = useState<{ [categoryId: string]: AddonOption[] }>({});
  const [currentItemQuantity, setCurrentItemQuantity] = useState(1);


  const [cartItems, setCartItems] = useState<{[key: string]: CartItemData}>({}); // Atualizado para armazenar CartItemData, chave pode ser id_do_item ou id_do_item-addons_hash

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Buscar categorias
        const categoriesData = await ApiService.getCategories();
        setCategories(categoriesData);

        // Buscar itens do cardápio (agora inclui info de adicionais)
        const itemsData = await ApiService.getMenuItems({ available: true });
        // Para cada item, buscar seus adicionais se has_addons for true
        const itemsWithAddonsPromises = itemsData.map(async (item: MenuItem) => {
          if (item.has_addons) {
            const fullItemDetails = await ApiService.getMenuItemById(item.id.toString());
            return fullItemDetails;
          }
          return item;
        });
        const itemsWithFullDetails = await Promise.all(itemsWithAddonsPromises);
        setMenuItems(itemsWithFullDetails);


        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao buscar cardápio.');
        notification.showError('Erro ao carregar o cardápio');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Recuperar carrinho do localStorage
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Erro ao recuperar carrinho:', e);
      }
    }
  }, [notification]);

  // Salvar carrinho no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const filteredItems = selectedCategoryId
    ? menuItems.filter(item => item.category_id === selectedCategoryId)
    : menuItems;

  const handleCategoryChange = (_event: React.SyntheticEvent, newCategoryId: string | null) => {
    setSelectedCategoryId(newCategoryId);
  };

  const handleOpenItemDetailsModal = (item: MenuItem) => {
    setSelectedMenuItem(item);
    setItemObservations('');
    setSelectedAddons({});
    setCurrentItemQuantity(1);
    setOpenItemDetailsModal(true);
  };

  const handleCloseItemDetailsModal = () => {
    setOpenItemDetailsModal(false);
    setSelectedMenuItem(null);
    setItemObservations('');
    setSelectedAddons({});
    setCurrentItemQuantity(1);
  };

  const handleAddonSelectionChange = (categoryId: string, option: AddonOption, type: 'checkbox' | 'radio') => {
    setSelectedAddons(prev => {
      const currentCategorySelections = prev[categoryId] || [];
      let newSelections: AddonOption[] = [];
      const addonCategory = selectedMenuItem?.addon_categories?.find(cat => cat.id === categoryId);

      if (!addonCategory) return prev;

      if (type === 'checkbox') {
        if (currentCategorySelections.some(s => s.id === option.id)) {
          newSelections = currentCategorySelections.filter(s => s.id !== option.id);
        } else {
          if (addonCategory.max_selections > 0 && currentCategorySelections.length >= addonCategory.max_selections) {
            notification.showWarning(`Você pode selecionar no máximo ${addonCategory.max_selections} opções para ${addonCategory.name}.`);
            return prev;
          }
          newSelections = [...currentCategorySelections, option];
        }
      } else { // type === 'radio'
        newSelections = [option];
      }

      return {
        ...prev,
        [categoryId]: newSelections
      };
    });
  };

  const calculateAddonsPrice = () => {
    let price = 0;
    Object.values(selectedAddons).forEach(options => {
      options.forEach(option => {
        price += option.price;
      });
    });
    return price;
  };

  const handleAddQuantity = () => {
    setCurrentItemQuantity(prev => prev + 1);
  };

  const handleRemoveQuantity = () => {
    setCurrentItemQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };


  const handleAddToCartConfirm = () => {
    if (!selectedMenuItem) return;

    // Validação de adicionais obrigatórios
    let isValid = true;
    selectedMenuItem.addon_categories?.forEach(cat => {
      if (cat.is_required) {
        const currentSelections = selectedAddons[cat.id] || [];
        if (currentSelections.length < cat.min_selections) {
          notification.showError(`A categoria "${cat.name}" requer no mínimo ${cat.min_selections} seleção(ões).`);
          isValid = false;
          return;
        }
      }
    });

    if (!isValid) return;


    const addonsPrice = calculateAddonsPrice();
    const totalItemPrice = selectedMenuItem.price + addonsPrice;

    const itemToAdd: CartItemData = {
      id: selectedMenuItem.id,
      name: selectedMenuItem.name,
      price: selectedMenuItem.price, // Preço base
      quantity: currentItemQuantity,
      image_url: selectedMenuItem.image_url,
      category_name: selectedMenuItem.category_name,
      observations: itemObservations,
      selectedAddons: Object.values(selectedAddons).flat(), // Achata todas as opções selecionadas
      totalItemPrice: totalItemPrice // Preço do item + adicionais
    };

    // Gerar uma chave única para o item no carrinho (considerando adicionais e observações)
    const itemKey = `${itemToAdd.id}-${JSON.stringify(itemToAdd.selectedAddons || []).slice(0, 50)}-${itemToAdd.observations?.slice(0, 50)}`;

    setCartItems(prev => {
      const newCart = { ...prev };
      if (newCart[itemKey]) {
        newCart[itemKey].quantity += itemToAdd.quantity;
      } else {
        newCart[itemKey] = itemToAdd;
      }
      return newCart;
    });

    notification.showSuccess(`${selectedMenuItem.name} adicionado ao carrinho!`);
    handleCloseItemDetailsModal();
  };


  const getTotalCartItems = () => {
    return Object.values(cartItems).reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleGoToCart = () => {
    navigate('/client/cart');
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width="50%" height={60} />
          <Skeleton variant="text" width="70%" />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Skeleton variant="rectangular" height={48} />
        </Box>

        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Card>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="text" width="40%" />
                  <Skeleton variant="text" width="60%" height={80} />
                </CardContent>
                <CardActions>
                  <Skeleton variant="rectangular" width={120} height={36} />
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="error" gutterBottom>
          Erro ao carregar o cardápio
        </Typography>
        <Typography color="text.secondary">
          {error}
        </Typography>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => window.location.reload()}
        >
          Tentar novamente
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Cardápio
          </Typography>
          {user && (
            <Typography variant="subtitle1" color="text.secondary">
              Bem-vindo, {user.name}! O que vai pedir hoje?
            </Typography>
          )}
        </Box>

        <Badge badgeContent={getTotalCartItems()} color="error">
          <IconButton color="primary" size="large" onClick={handleGoToCart}>
            <CartIcon />
          </IconButton>
        </Badge>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={selectedCategoryId}
          onChange={handleCategoryChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          <Tab label="Todos" value={null} />
          {categories.map(category => (
            <Tab key={category.id} label={category.name} value={category.id} />
          ))}
        </Tabs>
      </Box>

      {filteredItems.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            Nenhum item encontrado para esta categoria.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredItems.map(item => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {item.image_url ? (
                  <CardMedia
                    component="img"
                    height="200"
                    image={item.image_url}
                    alt={item.name}
                  />
                ) : (
                  <Box
                    sx={{
                      height: 200,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'grey.100'
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Sem imagem
                    </Typography>
                  </Box>
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" component="div">
                      {item.name}
                    </Typography>
                    <Chip
                      label={`R$ ${item.price.toFixed(2)}`}
                      color="primary"
                      size="small"
                    />
                  </Box>
                  <Chip
                    label={item.category_name}
                    size="small"
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                  {item.has_addons && (
                    <Chip label="Com Adicionais" size="small" color="info" sx={{ mt: 1 }} />
                  )}
                </CardContent>
                <CardActions>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    fullWidth
                    onClick={() => handleOpenItemDetailsModal(item)} // Abre modal
                    disabled={!item.available}
                  >
                    {item.available ? 'Adicionar ao Carrinho' : 'Indisponível'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Modal de Detalhes do Item e Adicionais */}
      <Dialog
        open={openItemDetailsModal}
        onClose={handleCloseItemDetailsModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {selectedMenuItem?.name}
          <IconButton onClick={handleCloseItemDetailsModal}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedMenuItem && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedMenuItem.description}
              </Typography>

              {/* Observações */}
              <TextField
                fullWidth
                label="Observações (opcional)"
                multiline
                rows={2}
                value={itemObservations}
                onChange={(e) => setItemObservations(e.target.value)}
                sx={{ mb: 3 }}
              />

              {/* Seção de Adicionais */}
              {selectedMenuItem.has_addons && selectedMenuItem.addon_categories && selectedMenuItem.addon_categories.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Adicionais
                  </Typography>
                  {selectedMenuItem.addon_categories.map(cat => (
                    <FormControl component="fieldset" fullWidth key={cat.id} sx={{ mb: 2 }}>
                      <FormLabel component="legend">
                        {cat.name} ({cat.min_selections} - {cat.max_selections} seleção(ões) {cat.is_required ? '(Obrigatório)' : '(Opcional)'})
                      </FormLabel>
                      {cat.max_selections === 1 ? ( // Radio group for single selection
                        <RadioGroup
                          value={selectedAddons[cat.id]?.[0]?.id || ''}
                          onChange={(e) => {
                            const selectedOption = cat.options.find(opt => opt.id === e.target.value);
                            if (selectedOption) {
                              handleAddonSelectionChange(cat.id, selectedOption, 'radio');
                            }
                          }}
                        >
                          {cat.options.map(option => (
                            <FormControlLabel
                              key={option.id}
                              value={option.id}
                              control={<Radio />}
                              label={`${option.name} (R$ ${option.price.toFixed(2)})`}
                            />
                          ))}
                        </RadioGroup>
                      ) : ( // Checkbox for multiple selections
                        <FormGroup>
                          {cat.options.map(option => (
                            <FormControlLabel
                              key={option.id}
                              control={
                                <Checkbox
                                  checked={selectedAddons[cat.id]?.some(s => s.id === option.id) || false}
                                  onChange={() => handleAddonSelectionChange(cat.id, option, 'checkbox')}
                                />
                              }
                              label={`${option.name} (R$ ${option.price.toFixed(2)})`}
                            />
                          ))}
                        </FormGroup>
                      )}
                    </FormControl>
                  ))}
                </Box>
              )}

              {/* Quantidade e Preço Total */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton onClick={handleRemoveQuantity} disabled={currentItemQuantity <= 1}>
                    <RemoveIcon />
                  </IconButton>
                  <Typography variant="h6" sx={{ mx: 2 }}>
                    {currentItemQuantity}
                  </Typography>
                  <IconButton onClick={handleAddQuantity}>
                    <AddIcon />
                  </IconButton>
                </Box>
                <Typography variant="h5" color="primary">
                  Total: R$ {(selectedMenuItem.price * currentItemQuantity + calculateAddonsPrice() * currentItemQuantity).toFixed(2)}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseItemDetailsModal} color="inherit">
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleAddocartConfirm}
            startIcon={<AddIcon />}
          >
            Adicionar ao Carrinho
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClientMenuPage;