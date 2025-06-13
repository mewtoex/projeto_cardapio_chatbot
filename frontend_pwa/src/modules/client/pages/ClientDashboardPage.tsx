// frontend_pwa/src/modules/client/pages/ClientDashboardPage.tsx
import React, { useEffect } from 'react';
import { Box, Typography, Button, Container, Paper, Grid, CircularProgress, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/contexts/AuthContext';
import { useLoading } from '../../../hooks/useLoading';
import api from '../../../api/api';
import { useNotification } from '../../../contexts/NotificationContext';
import { type UserProfile } from '../../../types';

const ClientDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth(); // Obtém o usuário do AuthContext
  const notification = useNotification();
  const { 
    data: userProfile, 
    loading: loadingProfile, 
    error: profileError, 
    execute: fetchUserProfile 
  } = useLoading<UserProfile>();

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserProfile(api.getUserProfile(), undefined, "Erro ao carregar dados do perfil.");
    }
  }, [isAuthenticated, fetchUserProfile]);

  if (!isAuthenticated) {
    // Caso o usuário não esteja autenticado, redireciona para o login
    // (Embora ProtectedRoute já deva lidar com isso, é uma segurança extra)
    navigate('/login');
    return null;
  }

  if (loadingProfile) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>Carregando perfil...</Typography>
        </Paper>
      </Container>
    );
  }

  if (profileError) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', color: 'error.main' }}>
          <Typography variant="h6">Erro ao carregar seu perfil:</Typography>
          <Typography>{profileError}</Typography>
          <Button onClick={() => fetchUserProfile(api.getUserProfile(), undefined, "Erro ao recarregar perfil.")} sx={{ mt: 2 }}>Tentar Novamente</Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 3 }}>
        Seu Dashboard
      </Typography>

      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Bem-vindo, {userProfile?.name || user?.name}!
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Aqui você pode acompanhar seus pedidos, gerenciar seu perfil e explorar o cardápio.
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Button
              variant="contained"
              fullWidth
              sx={{ py: 1.5 }}
              onClick={() => navigate('/cardapio')}
            >
              Explorar Cardápio
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              variant="outlined"
              fullWidth
              sx={{ py: 1.5 }}
              onClick={() => navigate('/client/pedidos')}
            >
              Meus Pedidos
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              variant="outlined"
              fullWidth
              sx={{ py: 1.5 }}
              onClick={() => navigate('/client/perfil')}
            >
              Meu Perfil
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              variant="outlined"
              fullWidth
              sx={{ py: 1.5 }}
              onClick={() => navigate('/client/carrinho')}
            >
              Meu Carrinho
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Você pode adicionar um resumo dos últimos pedidos aqui também */}
      {/* Exemplo: */}
      {/* <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>Últimos Pedidos</Typography>
        {/* Renderize uma lista dos últimos pedidos do usuário aqui */}
      {/* </Paper> */}
    </Container>
  );
};

export default ClientDashboardPage;