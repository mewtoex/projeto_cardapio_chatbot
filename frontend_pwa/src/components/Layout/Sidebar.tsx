// frontend_pwa/src/components/Layout/Sidebar.tsx
import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  Box,
  Typography,
  Avatar
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Restaurant as RestaurantIcon,
  ShoppingCart as ShoppingCartIcon,
  History as HistoryIcon,
  ExitToApp as LogoutIcon,
  Message as MessageIcon,
  Store as StoreIcon, // Import new icon for Store
  LocalShipping as LocalShippingIcon // Import new icon for Delivery
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../modules/auth/contexts/AuthContext';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  cartItemsCount?: number; // Adicionar prop para contagem de itens
}

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose, cartItemsCount = 0 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const isAdmin = user?.role === 'admin';

  const clientMenuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/client/dashboard' },
    { text: 'Cardápio', icon: <RestaurantIcon />, path: '/client/menu' },
    { text: 'Carrinho', icon: <ShoppingCartIcon />, path: '/client/cart', badge: cartItemsCount }, // Usar a prop badge
    { text: 'Meus Pedidos', icon: <HistoryIcon />, path: '/client/orders' },
  ];

  const adminMenuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
    { text: 'Gerenciar Itens', icon: <RestaurantIcon />, path: '/admin/items' },
    { text: 'Gerenciar Pedidos', icon: <HistoryIcon />, path: '/admin/orders' },
    { text: 'Mensagens do Bot', icon: <MessageIcon />, path: '/admin/bot-messages' }, 
    { text: 'Gerenciar Loja', icon: <StoreIcon />, path: '/admin/store' }, // New Admin route
    { text: 'Áreas de Entrega', icon: <LocalShippingIcon />, path: '/admin/delivery-areas' }, // New Admin route
  ];

  const menuItems = isAdmin ? adminMenuItems : clientMenuItems;

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    if (logout) {
      logout();
    }
    navigate('/login');
    onClose();
  };

  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Box sx={{ width: 250, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ mr: 2 }}>
            {user?.name?.charAt(0) || 'U'}
          </Avatar>
          <Box>
            <Typography variant="subtitle1">{user?.name || 'Usuário'}</Typography>
            <Typography variant="body2" color="text.secondary">
              {isAdmin ? 'Administrador' : 'Cliente'}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => handleNavigate(item.path)}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  '&:hover': {
                    backgroundColor: 'primary.light',
                  }
                }
              }}
            >
              <ListItemIcon>
                {item.badge !== undefined ? ( // Verificar se a badge existe
                  <Badge badgeContent={item.badge} color="error">
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        <List>
          <ListItem button onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Sair" />
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
};