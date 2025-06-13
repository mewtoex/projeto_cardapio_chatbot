import React from 'react';
import {
  Box, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography
} from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home as HomeIcon, Dashboard as DashboardIcon, RestaurantMenu as RestaurantMenuIcon,
  ShoppingCart as ShoppingCartIcon, ListAlt as ListAltIcon, Person as PersonIcon,
  AdminPanelSettings as AdminPanelSettingsIcon, Store as StoreIcon, LocalShipping as LocalShippingIcon,
  Message as MessageIcon, ExitToApp as ExitToAppIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth'; 
import AuthService from '../../modules/shared/services/AuthService'; 

interface SidebarProps {
  onClose: () => void;
  isAdmin?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose, isAdmin }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout: authLogout } = useAuth(); 

  const handleLogout = () => {
    authLogout(); 
    onClose(); 
    navigate('/login'); 
  };

  // Links para clientes
  const clientLinks = [
    { text: 'Cardápio', icon: <RestaurantMenuIcon />, path: '/cardapio' },
    { text: 'Carrinho', icon: <ShoppingCartIcon />, path: '/client/carrinho' },
    { text: 'Meus Pedidos', icon: <ListAltIcon />, path: '/client/pedidos' },
    { text: 'Meu Perfil', icon: <PersonIcon />, path: '/client/perfil' },
  ];

  const adminLinks = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
    { text: 'Gerenciar Itens', icon: <RestaurantMenuIcon />, path: '/admin/itens' },
    { text: 'Gerenciar Pedidos', icon: <ListAltIcon />, path: '/admin/pedidos' },
    { text: 'Configurar Loja', icon: <StoreIcon />, path: '/admin/loja' },
    { text: 'Áreas de Entrega', icon: <LocalShippingIcon />, path: '/admin/entregas' },
    { text: 'Mensagens do Bot', icon: <MessageIcon />, path: '/admin/mensagens-bot' },
  ];

  const currentLinks = isAdmin ? adminLinks : clientLinks;

  return (
    <Box sx={{ width: 240, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar>
        <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
          {isAdmin ? 'Admin Panel' : 'Seu Restaurante'}
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ flexGrow: 1 }}>
        {currentLinks.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/')}
              onClick={onClose}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {user ? (
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon>
                <ExitToAppIcon />
              </ListItemIcon>
              <ListItemText primary="Sair" />
            </ListItemButton>
          </ListItem>
        ) : (
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/login" onClick={onClose}>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Login/Registro" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </Box>
  );
};

export default Sidebar;