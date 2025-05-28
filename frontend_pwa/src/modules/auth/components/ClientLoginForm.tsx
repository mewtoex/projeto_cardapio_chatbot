// frontend_pwa/src/modules/auth/components/ClientLoginForm.tsx
import React, { useState } from 'react';
import AuthService from '../../shared/services/AuthService';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Box, Typography } from '@mui/material';

interface ClientLoginFormProps {
  onLoginSuccess?: () => void; // Nova prop
}

const ClientLoginForm: React.FC<ClientLoginFormProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await AuthService.clientLogin(email, password);
      login(response.user, response.access_token); // Use access_token from response
      
      if (onLoginSuccess) {
        onLoginSuccess(); // Notifica o componente pai (CheckoutPage)
      } else {
        navigate('/client/dashboard'); // Redireciona para o dashboard se não houver callback
      }
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Ocorreu um erro no login.');
    }
    setLoading(false);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
      {error && (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
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
      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Senha"
        type="password"
        id="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={loading}
      >
        {loading ? 'Entrando...' : 'Entrar'}
      </Button>
      {/* TODO: Adicionar link para recuperação de senha */}
    </Box>
  );
};

export default ClientLoginForm;