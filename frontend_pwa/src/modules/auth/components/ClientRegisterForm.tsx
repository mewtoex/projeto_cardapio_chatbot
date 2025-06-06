// frontend_pwa/src/modules/auth/components/ClientRegisterForm.tsx
import React, { useState } from 'react';
import AuthService from '../../shared/services/AuthService';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Box, Typography, Checkbox, FormControlLabel, Grid, Link } from '@mui/material';
import { useNotification } from '../../../contexts/NotificationContext';

interface ClientRegisterFormProps {
  onRegisterSuccess?: () => void; // Nova prop
}

const ClientRegisterForm: React.FC<ClientRegisterFormProps> = ({ onRegisterSuccess }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [addressCep, setAddressCep] = useState('');
  const [addressStreet, setAddressStreet] = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [addressComplement, setAddressComplement] = useState('');
  const [addressDistrict, setAddressDistrict] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressState, setAddressState] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth(); 
  const navigate = useNavigate();
  const notification = useNotification();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("As senhas não conferem!");
      notification.showError("As senhas não conferem!");
      return;
    }
    if (!termsAccepted) {
      setError("Você precisa aceitar os Termos de Uso e Política de Privacidade.");
      notification.showError("Você precisa aceitar os Termos de Uso e Política de Privacidade.");
      return;
    }
    setLoading(true);
    try {
      const userData = {
        name,
        phone,
        email,
        password, 
        address: {
          cep: addressCep,
          street: addressStreet,
          number: addressNumber,
          complement: addressComplement,
          district: addressDistrict,
          city: addressCity,
          state: addressState,
        }
      };
      const response = await AuthService.clientRegister(userData);
      
      // Automaticamente loga o usuário após o registro bem-sucedido
      login(response.user, response.access_token);
      
      notification.showSuccess("Conta criada e login realizado com sucesso!");
      if (onRegisterSuccess) {
        onRegisterSuccess(); // Notifica o componente pai (CheckoutPage)
      } else {
        navigate('/client/dashboard'); // Redireciona para o dashboard se não houver callback
      }
    } catch (err) {
      const errorMessage = typeof err === 'string' ? err : 'Ocorreu um erro no registro.';
      setError(errorMessage);
      notification.showError(errorMessage);
    }
    setLoading(false);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
      {error && <Typography color="error" variant="body2" sx={{ mb: 2 }}>{error}</Typography>}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Nome Completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Telefone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={loading}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Confirmar Senha"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
          />
        </Grid>
      </Grid>
      
      <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Endereço Principal</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="CEP" value={addressCep} onChange={(e) => setAddressCep(e.target.value)} required disabled={loading} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Rua/Avenida" value={addressStreet} onChange={(e) => setAddressStreet(e.target.value)} required disabled={loading} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth label="Número" value={addressNumber} onChange={(e) => setAddressNumber(e.target.value)} required disabled={loading} />
        </Grid>
        <Grid item xs={12} sm={8}>
          <TextField fullWidth label="Complemento" value={addressComplement} onChange={(e) => setAddressComplement(e.target.value)} disabled={loading} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Bairro" value={addressDistrict} onChange={(e) => setAddressDistrict(e.target.value)} required disabled={loading} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth label="Cidade" value={addressCity} onChange={(e) => setAddressCity(e.target.value)} required disabled={loading} />
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth label="Estado" value={addressState} onChange={(e) => setAddressState(e.target.value)} required disabled={loading} />
        </Grid>
      </Grid>

      <FormControlLabel
        control={<Checkbox checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} disabled={loading} />}
        label={
          <Typography variant="body2">
            Li e aceito os <Link to="/terms" style={{ textDecoration: 'none' }}>Termos de Uso</Link> e <Link to="/privacy" style={{ textDecoration: 'none' }}>Política de Privacidade</Link>.
          </Typography>
        }
        sx={{ mt: 2, mb: 2 }}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={loading}
      >
        {loading ? 'Registrando...' : 'Criar Conta'}
      </Button>
    </Box>
  );
};

export default ClientRegisterForm;