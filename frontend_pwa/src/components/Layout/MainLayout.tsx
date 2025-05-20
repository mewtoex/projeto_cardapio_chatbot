// src/components/Layout/MainLayout.tsx
import React, { useState } from 'react';
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
  
  // Simulação de contagem de itens no carrinho - será substituída por estado real
  const cartItemsCount = 3;
  
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
              <Badge badgeContent={cartItemsCount} color="error">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
          )}
        </Toolbar>
      </AppBar>
      
      <Sidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        cartItemsCount={cartItemsCount}
      />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8, // Espaço para a AppBar
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
