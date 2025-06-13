// frontend_pwa/src/router/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // Usando o novo hook de autenticação
import { Box, Typography, CircularProgress } from '@mui/material';

interface ProtectedRouteProps {
  allowedRoles?: string[]; // Ex: ['admin', 'cliente']
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth(); // Obtém o usuário, status de autenticação e loading

  if (loading) {
    // Exibe um spinner de carregamento enquanto o estado de autenticação está sendo verificado
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Verificando autenticação...</Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    // Se não estiver autenticado, redireciona para a página de login
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role || '')) {
    // Se o usuário não tiver um papel permitido, redireciona para uma página de acesso negado ou dashboard
    return <Navigate to="/" replace />; // Ou para uma página 403 / acesso negado
  }

  // Se estiver autenticado e tiver o papel correto, renderiza as rotas filhas
  return <Outlet />;
};

export default ProtectedRoute;