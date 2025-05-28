// src/modules/auth/pages/ForgotPasswordPage.tsx
import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import AuthService from '../../shared/services/AuthService';
import { useNotification } from '../../../contexts/NotificationContext';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const notification = useNotification();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      // AuthService precisa de um método para forgotPassword
      // Vamos adicionar isso ao ApiService mais tarde
      // Por enquanto, simulamos uma chamada.
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simula requisição
      notification.showInfo('Se o e-mail estiver registrado, um link de redefinição de senha será enviado.');
      // O ideal seria que o AuthService fizesse a chamada real para a API:
      // await AuthService.forgotPassword(email);
    } catch (error) {
      notification.showError('Erro ao solicitar redefinição de senha. Tente novamente.');
      console.error('Erro ao solicitar recuperação de senha:', error);
    } finally {
      setLoading(false);
    }
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
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Enviando...' : 'Redefinir Senha'}
          </Button>
        </Box>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Link to="/login">Voltar ao Login</Link>
        </Box>
      </Paper>
    </Box>
  );
};

export default ForgotPasswordPage;