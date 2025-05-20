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
  CircularProgress
} from '@mui/material';
import { 
  ShoppingCart as CartIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useAuth } from '../../auth/contexts/AuthContext';
import ApiService from '../../shared/services/ApiService';
import { useNotification } from '../../../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';

interface MenuItem {
  id: number;
  nome: string;
  categoria_id: string;
  categoria_nome: string;
  preco: number;
  descricao: string;
  disponivel: boolean;
  imagem_url?: string;
}

interface Category {
  id: string;
  nome: string;
  descricao?: string;
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
  const [cartItems, setCartItems] = useState<{[key: number]: number}>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Buscar categorias
        const categoriesData = await ApiService.getCategories();
        setCategories(categoriesData);
        
        // Buscar itens do cardápio
        const itemsData = await ApiService.getMenuItems({ disponivel: true });
        setMenuItems(itemsData);
        
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
    ? menuItems.filter(item => item.categoria_id === selectedCategoryId)
    : menuItems;

  const handleCategoryChange = (_event: React.SyntheticEvent, newCategoryId: string | null) => {
    setSelectedCategoryId(newCategoryId);
  };

  const handleAddToCart = (item: MenuItem) => {
    if (!item.disponivel) {
      notification.showError(`${item.nome} não está disponível no momento`);
      return;
    }
    
    setCartItems(prev => {
      const currentQuantity = prev[item.id] || 0;
      const newQuantity = currentQuantity + 1;
      
      notification.showSuccess(`${item.nome} adicionado ao carrinho`);
      
      return {
        ...prev,
        [item.id]: newQuantity
      };
    });
  };

  const getTotalCartItems = () => {
    return Object.values(cartItems).reduce((sum, quantity) => sum + quantity, 0);
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
            <Tab key={category.id} label={category.nome} value={category.id} />
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
                {item.imagem_url ? (
                  <CardMedia
                    component="img"
                    height="200"
                    image={item.imagem_url}
                    alt={item.nome}
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
                      {item.nome}
                    </Typography>
                    <Chip 
                      label={`R$ ${item.preco.toFixed(2)}`}
                      color="primary"
                      size="small"
                    />
                  </Box>
                  <Chip 
                    label={item.categoria_nome} 
                    size="small" 
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {item.descricao}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    fullWidth
                    onClick={() => handleAddToCart(item)}
                    disabled={!item.disponivel}
                  >
                    {item.disponivel ? 'Adicionar ao Carrinho' : 'Indisponível'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ClientMenuPage;
