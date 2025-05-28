// src/components/Layout/MainLayout.tsx
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
  
  useEffect(() => {
    const calculateCartTotal = () => {
      const savedCart = localStorage.getItem('cartItems');
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          const totalCount = Object.values(parsedCart).reduce((sum: number, item: any) => sum + item.quantity, 0);
          setCartItemsCount(totalCount);
        } catch (e) {
          console.error('Erro ao calcular total do carrinho no localStorage:', e);
          setCartItemsCount(0);
        }
      } else {
        setCartItemsCount(0);
      }
    };

    calculateCartTotal();
    window.addEventListener('storage', calculateCartTotal); // Escuta por mudanças no localStorage

    // Cleanup do event listener
    return () => {
      window.removeEventListener('storage', calculateCartTotal);
    };
  }, []); // Dependências vazias para rodar apenas uma vez na montagem


  const isAdmin = user?.role === 'admin';
  const title = isAdmin ? 'Painel Administrativo' : 'Cardápio Online';
  
  const handleCartClick = () => {
    navigate('/client/cart');
    notification.showInfo('Acessando o carrinho');
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
              <Badge badgeContent={cartItemsCount} color="error"> {/* Usando o estado cartItemsCount */}
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
          )}
        </Toolbar>
      </AppBar>
      
      <Sidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        cartItemsCount={cartItemsCount} // Passando a contagem atualizada para o Sidebar
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