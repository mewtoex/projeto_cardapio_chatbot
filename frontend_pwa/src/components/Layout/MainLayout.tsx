// frontend_pwa/src/components/Layout/MainLayout.tsx
import React, { useState, useEffect } from 'react'; // Importar useEffect
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Box, 
  Badge, 
  useMediaQuery, 
  useTheme,
  Container
} from '@mui/material';
import { 
  Menu as MenuIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../modules/auth/contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user } = useAuth();
  const notification = useNotification();
  const [cartItemsCount, setCartItemsCount] = useState(0); // Estado para a contagem do carrinho
  
  // Atualizar a contagem do carrinho do localStorage
  useEffect(() => {
    const updateCartCount = () => {
      const savedCart = localStorage.getItem('cartItems');
      if (savedCart) {
        try {
          const cartData = JSON.parse(savedCart);
          const total = Object.values(cartData).reduce((sum: number, quantity: any) => sum + quantity, 0);
          setCartItemsCount(total);
        } catch (e) {
          console.error("Erro ao parsear dados do carrinho do localStorage:", e);
          setCartItemsCount(0);
        }
      } else {
        setCartItemsCount(0);
      }
    };

    // Chamar na montagem
    updateCartCount();

    // Adicionar listener para o evento customizado de atualização do carrinho
    window.addEventListener('cartUpdated', updateCartCount);

    // Remover listener na desmontagem
    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);
  
  const isAdmin = user?.role === 'admin';
  const title = isAdmin ? 'Painel Administrativo' : 'Cardápio Online';
  
  const handleCartClick = () => {
    navigate('/client/cart');
  };
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setSidebarOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          
          {!isAdmin && (
            <IconButton color="inherit" onClick={handleCartClick}>
              <Badge badgeContent={cartItemsCount} color="error"> {/* Usar o estado cartItemsCount */}
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
          )}
        </Toolbar>
      </AppBar>
      
      <Sidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        cartItemsCount={cartItemsCount} // Passar a contagem para a Sidebar
      />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8, 
          width: '100%'
        }}
      >
        <Container maxWidth="lg">
          {children}
        </Container>
      </Box>
    </Box>
  );
};