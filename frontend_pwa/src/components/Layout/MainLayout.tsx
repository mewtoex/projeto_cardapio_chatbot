// frontend_pwa/src/components/Layout/MainLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, AppBar, Toolbar, IconButton, Typography, Drawer, useMediaQuery, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../../hooks/useAuth'; // Usando o novo hook de autenticação

interface MainLayoutProps {
  isAdmin?: boolean; // Propriedade para diferenciar layouts de admin/cliente
}

const drawerWidth = 240;

const MainLayout: React.FC<MainLayoutProps> = ({ isAdmin = false }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth(); // Obtém informações do usuário logado

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const getTitle = () => {
    if (isAdmin) return "Admin - Seu Restaurante";
    if (user?.role === 'cliente') return "Cliente - Seu Restaurante";
    return "Seu Restaurante"; // Título padrão
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          zIndex: (theme) => theme.zIndex.drawer + 1, // Garante que o AppBar esteja acima do Drawer
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {getTitle()}
          </Typography>
          {/* Você pode adicionar outros elementos à AppBar aqui, como botões de logout */}
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="mailbox folders"
      >
        {/* Drawer para mobile */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          <Sidebar onClose={handleDrawerToggle} isAdmin={isAdmin} />
        </Drawer>
        {/* Drawer para desktop */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          <Sidebar onClose={handleDrawerToggle} isAdmin={isAdmin} />
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: `${theme.mixins.toolbar.minHeight}px`, // Ajusta o espaçamento para o AppBar fixo
          [theme.breakpoints.up('sm')]: {
            mt: `${theme.mixins.toolbar.minHeight}px`, // Ajusta para sm em diante se o AppBar tiver altura diferente
          },
        }}
      >
        {/* Conteúdo da rota atual será renderizado aqui */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;