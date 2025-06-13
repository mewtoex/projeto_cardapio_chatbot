import React from 'react';
import { TextField, Button, Box, Typography, CircularProgress, Link } from '@mui/material';
import { useAuth } from '../../../hooks/useAuth';
import { useForm } from '../../../hooks/useForm';
import { useNavigate } from 'react-router-dom';

interface ClientLoginFormData {
  email: string;
  password: string;
}

const initialFormState: ClientLoginFormData = {
  email: '',
  password: '',
};

const ClientLoginForm: React.FC = () => {
  const { login, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const { values, handleChange, handleSubmit, errors, isSubmitting } = useForm<ClientLoginFormData>(
    initialFormState,
    validateForm
  );

  function validateForm(formData: ClientLoginFormData): { [key: string]: string } {
    const newErrors: { [key: string]: string } = {};
    if (!formData.email) {
      newErrors.email = "Email é obrigatório.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido.";
    }
    if (!formData.password) {
      newErrors.password = "Senha é obrigatória.";
    }
    return newErrors;
  }

  const handleClientLogin = async () => {
    try {
      await login(values, false); // O segundo parâmetro indica que é login de cliente
      navigate('/cardapio'); // Redireciona para o cardápio após login
    } catch (error) {
      // Erro já tratado e notificado pelo useAuth/useLoading
      console.error("Erro no login do cliente (tratado pelo hook):", error);
    }
  };
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Importante para prevenir o comportamento padrão do formulário
    handleClientLogin(); // Chama a função assíncrona
  };

  return (
    <Box component="form" onSubmit={handleFormSubmit} sx={{ mt: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom align="center">
        Login do Cliente
      </Typography>
      <TextField
        fullWidth
        label="Email"
        name="email"
        type="email"
        value={values.email}
        onChange={handleChange}
        margin="normal"
        error={!!errors.email}
        helperText={errors.email}
        required
      />
      <TextField
        fullWidth
        label="Senha"
        name="password"
        type="password"
        value={values.password}
        onChange={handleChange}
        margin="normal"
        error={!!errors.password}
        helperText={errors.password}
        required
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={isSubmitting || authLoading}
      >
        {isSubmitting || authLoading ? <CircularProgress size={24} /> : 'Entrar'}
      </Button>
      <Box sx={{ textAlign: 'center' }}>
        <Link href="/forgot-password" variant="body2">
          Esqueceu sua senha?
        </Link>
      </Box>
    </Box>
  );
};

export default ClientLoginForm;