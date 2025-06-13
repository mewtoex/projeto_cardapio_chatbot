// frontend_pwa/src/modules/auth/pages/ResetPasswordPage.tsx
import React, { useEffect } from 'react';
import { Box, Typography, Paper, Link } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotification } from '../../../contexts/NotificationContext';
import ResetPasswordForm from '../components/ResetPasswordForm'; // Importa o novo componente de formulário

const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>(); // Obtém o token da URL
  const navigate = useNavigate();
  const notification = useNotification();

  useEffect(() => {
    if (!token) {
      notification.showError('Token de redefinição de senha ausente.');
      navigate('/login'); // Redireciona se não houver token
    }
  }, [token, navigate, notification]);

  const handleSuccess = () => {
    navigate('/login'); // Redireciona para o login após a redefinição bem-sucedida
  };

  const handleCancel = () => {
    navigate('/login');
  };

  if (!token) {
    return null; // Não renderiza nada se o token não estiver presente (o useEffect já redireciona)
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
        p: 3,
      }}
    >
      <Paper elevation={3} sx={{ p: 4, maxWidth: 450, width: '100%', borderRadius: 2 }}>
        <Typography variant="h5" component="h1" gutterBottom align="center" sx={{ mb: 3 }}>
          Redefinir Senha
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Insira sua nova senha.
        </Typography>
        <ResetPasswordForm token={token} onSuccess={handleSuccess} onCancel={handleCancel} />
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Link to="/login">Voltar ao Login</Link>
        </Box>
      </Paper>
    </Box>
  );
};

export default ResetPasswordPage;