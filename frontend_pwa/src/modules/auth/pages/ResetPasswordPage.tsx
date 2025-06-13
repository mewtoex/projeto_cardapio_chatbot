import React from 'react';
import { Box, Container, Paper, Typography, Link } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import ForgotPasswordForm from '../components/ForgotPasswordForm'; 

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/login'); 
  };

  const handleCancel = () => {
    navigate('/login');
  };

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
          Esqueceu sua senha?
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Informe seu email para receber um link de redefinição.
        </Typography>
        <ForgotPasswordForm onSuccess={handleSuccess} onCancel={handleCancel} />
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Link component={RouterLink} to="/login">
            Voltar ao Login
          </Link>
        </Box>
      </Paper>
    </Box>
  );
};

export default ForgotPasswordPage;