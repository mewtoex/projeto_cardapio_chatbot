// src/modules/auth/pages/ResetPasswordPage.tsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthService from '../../shared/services/AuthService';
import { useNotification } from '../../../contexts/NotificationContext';

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const notification = useNotification();
  const [token, setToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      notification.showError('Token de redefinição de senha ausente.');
      navigate('/login'); // Redireciona se não houver token
    }
  }, [searchParams, navigate, notification]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setValidationError(null);

    if (newPassword !== confirmPassword) {
      setValidationError('As senhas não conferem.');
      return;
    }
    // Adicione validações de senha mais robustas aqui (tamanho mínimo, caracteres especiais etc.)
    if (newPassword.length < 6) {
      setValidationError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (!token) {
      notification.showError('Token de redefinição de senha inválido ou ausente.');
      return;
    }

    setLoading(true);
    try {
      // AuthService precisa de um método para resetPassword
      // Vamos adicionar isso ao ApiService mais tarde
      // Por enquanto, simulamos uma chamada.
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simula requisição
      // O ideal seria que o AuthService fizesse a chamada real para a API:
      // await AuthService.resetPassword(token, newPassword);

      notification.showSuccess('Senha redefinida com sucesso! Faça login com sua nova senha.');
      navigate('/login');
    } catch (error) {
      notification.showError('Erro ao redefinir senha. O token pode ser inválido ou expirado.');
      console.error('Erro ao redefinir senha:', error);
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
          Redefinir Senha
        </Typography>
        {validationError && (
          <Typography color="error" variant="body2" sx={{ mb: 2 }}>
            {validationError}
          </Typography>
        )}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Nova Senha"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={loading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Confirmar Nova Senha"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading || !token} // Desabilita se não houver token
          >
            {loading ? 'Redefinindo...' : 'Redefinir Senha'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ResetPasswordPage;