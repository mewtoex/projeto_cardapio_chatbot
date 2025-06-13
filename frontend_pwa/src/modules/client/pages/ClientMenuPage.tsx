import React, { useEffect, useState } from 'react';
import {
  Typography, Box, Grid, Card, CardMedia, CardContent, CardActions,
  Button, Chip, Container, Tabs, Tab, Skeleton, IconButton, Badge,
  CircularProgress,
} from '@mui/material';
import { ShoppingCart as CartIcon, Add as AddIcon, Image as ImageIcon } from '@mui/icons-material';
import { useAuth } from '../../auth/contexts/AuthContext';
import api from '../../../api/api';
import { useNotification } from '../../../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../../../hooks/useLoading'; 
import { useCart } from '../../../hooks/useCart'; 
import AddToCartModal from '../components/AddToCartModal'; 
import { type MenuItem, type Category } from '../../../types';

const ClientMenuPage: React.FC = () => {
  const { user } = useAuth();
  const notification = useNotification();
  const navigate = useNavigate();

  const { data: menuItems, loading: loadingItems, error: itemsError, execute: fetchItems } = useLoading<MenuItem[]>();
  const { data: categories, loading: loadingCategories, error: categoriesError, execute: fetchCategories } = useLoading<Category[]>();
  const { getTotalCartItems } = useCart();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [openItemDetailsModal, setOpenItemDetailsModal] = useState(false);
  const [selectedMenuItemForModal, setSelectedMenuItemForModal] = useState<MenuItem | null>(null);

  const [loadingModalItem, setLoadingModalItem] = useState(false);
  const [errorModalItem, setErrorModalItem] = useState<string | null>(null);


  useEffect(() => {
    fetchCategories(api.getCategories(), undefined, "Erro ao carregar categorias.");
    fetchItems(api.getMenuItems({ available: true }), undefined, "Erro ao carregar itens do cardápio.");
  }, [fetchCategories, fetchItems]);

  const filteredItems = selectedCategoryId
    ? menuItems?.filter(item => String(item.category_id) === selectedCategoryId) || []
    : menuItems || [];

  const handleCategoryChange = (_event: React.SyntheticEvent, newCategoryId: string | null) => {
    setSelectedCategoryId(newCategoryId);
  };

  const handleOpenItemDetailsModal = async (item: MenuItem) => {
    setLoadingModalItem(true);
    setErrorModalItem(null); 
    try {
      const fullItemDetails = await api.getMenuItemById(item.id.toString());
      setSelectedMenuItemForModal(fullItemDetails); 
      setOpenItemDetailsModal(true);
    } catch (e: any) {
      console.error("Falha ao carregar detalhes do item:", e);
      setErrorModalItem(e.message || "Erro ao carregar detalhes do item.");
      notification.showError("Erro ao carregar detalhes do item.");
    } finally {
      setLoadingModalItem(false); 
    }
  };

  const handleCloseItemDetailsModal = () => {
    setOpenItemDetailsModal(false);
    setSelectedMenuItemForModal(null); 
    setErrorModalItem(null); 
  };

  const handleAddToCart = (item: MenuItem) => {
    notification.showSuccess(`"${item.name}" adicionado ao carrinho!`);
  };

  if (loadingItems || loadingCategories) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom align="center">Cardápio</Typography>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={selectedCategoryId} onChange={handleCategoryChange} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>
            {Array.from(new Array(5)).map((_, index) => (
              <Tab key={index} label={<Skeleton width={80} />} value={index.toString()} disabled />
            ))}
          </Tabs>
        </Box>
        <Grid container spacing={3}>
          {Array.from(new Array(6)).map((_, index) => (
            <Grid size={{ xs: 12, sm: 6, md:4 }} key={index}>
              <Card>
                <Skeleton variant="rectangular" height={140} />
                <CardContent>
                  <Skeleton width="80%" height={24} />
                  <Skeleton width="60%" height={16} />
                  <Skeleton width="40%" height={16} />
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <Skeleton variant="rectangular" width={80} height={36} />
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  // Renderização de erro inicial
  if (itemsError || categoriesError) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h6" color="error" align="center">
          Ocorreu um erro ao carregar o cardápio ou as categorias. Por favor, tente novamente mais tarde.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">Cardápio</Typography>
        <IconButton color="inherit" onClick={() => navigate('/cart')}>
          <Badge badgeContent={getTotalCartItems()} color="primary">
            <CartIcon fontSize="large" />
          </Badge>
        </IconButton>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={selectedCategoryId} onChange={handleCategoryChange} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>
          <Tab label="Todos" value={null} />
          {categories?.map((category) => (
            <Tab key={category.id} label={category.name} value={category.id.toString()} />
          ))}
        </Tabs>
      </Box>

      <Grid container spacing={3}>
        {filteredItems.length === 0 ? (
          <Grid size={{ xs: 12 }} >
            <Typography variant="subtitle1" align="center" sx={{ mt: 4 }}>
              Nenhum item disponível nesta categoria.
            </Typography>
          </Grid>
        ) : (
          filteredItems.map((item) => (
            <Grid  size={{ xs: 12, sm: 6, md:4 }}  key={item.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ position: 'relative', pt: '56.25%' /* 16:9 Aspect Ratio */ }}>
                  {item.image_url ? (
                    <CardMedia
                      component="img"
                      image={item.image_url}
                      alt={item.name}
                      sx={{
                        position: 'absolute',
                        top: 0, left: 0, width: '100%', height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                        e.currentTarget.src = 'https://via.placeholder.com/150';
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0, left: 0, width: '100%', height: '100%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backgroundColor: '#f0f0f0', color: '#ccc'
                      }}
                    >
                      <ImageIcon sx={{ fontSize: 80 }} />
                    </Box>
                  )}
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="div">
                    {item.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                    R$ {item.price.toFixed(2).replace('.', ',')}
                  </Typography>
                  {item.available === false && (
                    <Chip label="Indisponível" color="error" size="small" sx={{ mt: 1 }} />
                  )}
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <Button size="small" onClick={() => handleOpenItemDetailsModal(item)}>
                    Ver Detalhes
                  </Button>
                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => handleAddToCart(item)}
                    disabled={!item.available}
                  >
                    Adicionar
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      
      {selectedMenuItemForModal && (
        <AddToCartModal
          open={openItemDetailsModal}
          onClose={handleCloseItemDetailsModal}
          menuItem={selectedMenuItemForModal}
          isLoading={loadingModalItem} 
          error={errorModalItem}    
        />
      )}
    </Container>
  );
};

export default ClientMenuPage;