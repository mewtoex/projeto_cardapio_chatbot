// frontend_pwa/src/modules/client/pages/ClientMenuPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Typography, Box, Grid, Card, CardMedia, CardContent, CardActions,
  Button, Chip, Container, Tabs, Tab, Skeleton, IconButton, Badge,
  CircularProgress,
} from '@mui/material';
import { ShoppingCart as CartIcon, Add as AddIcon, Image as ImageIcon } from '@mui/icons-material';
import { useAuth } from '../../auth/contexts/AuthContext'; // Mantém para informações do usuário
import api from '../../../api/api';
import { useNotification } from '../../../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../../../hooks/useLoading'; // Novo hook de loading
import { useCart } from '../../../hooks/useCart'; // Novo hook de carrinho
import AddToCartModal from '../components/AddToCartModal'; // Novo componente de modal
import { type MenuItem, type Category } from '../../../types';

const ClientMenuPage: React.FC = () => {
  const { user } = useAuth();
  const notification = useNotification();
  const navigate = useNavigate();

  // Hooks para carregar dados
  const { data: menuItems, loading: loadingItems, error: itemsError, execute: fetchItems } = useLoading<MenuItem[]>();
  const { data: categories, loading: loadingCategories, error: categoriesError, execute: fetchCategories } = useLoading<Category[]>();
  const { getTotalCartItems } = useCart(); // Obtém a quantidade de itens no carrinho

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [openItemDetailsModal, setOpenItemDetailsModal] = useState(false);
  const [selectedMenuItemForModal, setSelectedMenuItemForModal] = useState<MenuItem | null>(null);

  useEffect(() => {
    // Carrega categorias e itens do menu na montagem do componente
    fetchCategories(api.getCategories(), undefined, "Erro ao carregar categorias.");
    fetchItems(api.getMenuItems({ available: true }), undefined, "Erro ao carregar itens do cardápio.");
  }, [fetchCategories, fetchItems]);

  // Filtra itens com base na categoria selecionada
  const filteredItems = selectedCategoryId
    ? menuItems?.filter(item => String(item.category_id) === selectedCategoryId) || []
    : menuItems || [];

  const handleCategoryChange = (_event: React.SyntheticEvent, newCategoryId: string | null) => {
    setSelectedCategoryId(newCategoryId);
  };

  const handleOpenItemDetailsModal = async (item: MenuItem) => {
    // Busca os detalhes completos do item para o modal, incluindo adicionais
    try {
      const fullItemDetails = await fetchItems(api.getMenuItemById(item.id.toString()), undefined, "Erro ao carregar detalhes do item.");
      if (fullItemDetails) {
        // A API de getMenuItemById retorna um único objeto MenuItem, não um array.
        // Se a API retornar um array por algum motivo, ajuste para `fullItemDetails[0]`.
        setSelectedMenuItemForModal(fullItemDetails); 
        setOpenItemDetailsModal(true);
      }
    } catch (e) {
      // O erro já é tratado pelo useLoading e exibido via useNotification
      console.error("Falha ao abrir detalhes do item:", e);
    }
  };

  const handleCloseItemDetailsModal = () => {
    setOpenItemDetailsModal(false);
    setSelectedMenuItemForModal(null);
  };

  const handleGoToCart = () => {
    navigate('/client/carrinho'); // Redireciona para a página do carrinho
  };

  const loading = loadingItems || loadingCategories;
  const error = itemsError || categoriesError;

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
          onClick={() => window.location.reload()} // Oferece opção de recarregar a página
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
          {categories?.map(category => (
            <Tab key={category.id} label={category.name} value={String(category.id)} /> // Valor deve ser string
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
                    sx={{ objectFit: 'cover' }}
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
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>
                  <Chip
                    label={item.category_name}
                    size="small"
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
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
                    onClick={() => handleOpenItemDetailsModal(item)}
                    disabled={!item.available}
                    sx={{ py: 1.5 }}
                  >
                    {item.available ? 'Adicionar ao Carrinho' : 'Indisponível'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Modal para detalhes do item e adição ao carrinho */}
      <AddToCartModal
        open={openItemDetailsModal}
        onClose={handleCloseItemDetailsModal}
        menuItem={selectedMenuItemForModal}
      />
    </Box>
  );
};

export default ClientMenuPage;