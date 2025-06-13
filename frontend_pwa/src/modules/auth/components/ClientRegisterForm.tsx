// frontend_pwa/src/modules/auth/components/ClientRegisterForm.tsx
import React from 'react';
import { TextField, Button, Box, Typography, CircularProgress, Link } from '@mui/material';
import { useAuth } from '../../../hooks/useAuth';
import { useForm } from '../../../hooks/useForm';
import { useNavigate } from 'react-router-dom';
import { type UserRegisterData } from '../../../types';

const initialFormState: UserRegisterData = {
  name: '',
  email: '',
  password: '',
  phone: '',
  address: '', // Campo de endereço adicionado aqui
};

const ClientRegisterForm: React.FC = () => {
  const { register, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const { values, handleChange, handleSubmit, errors, isSubmitting } = useForm<UserRegisterData>(
    initialFormState,
    validateForm
  );

  function validateForm(formData: UserRegisterData): { [key: string]: string } {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório.";
    }
    if (!formData.email) {
      newErrors.email = "Email é obrigatório.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido.";
    }
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "A senha deve ter no mínimo 6 caracteres.";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Telefone é obrigatório.";
    }
    if (!formData.address.trim()) {
      newErrors.address = "Endereço é obrigatório.";
    }
    return newErrors;
  }

  const handleClientRegister = async () => {
    try {
      await register(values);
      // Redireciona para o cardápio ou dashboard do cliente após o registro e login automático
      navigate('/cardapio'); 
    } catch (error) {
      // Erro já tratado e notificado pelo useAuth/useLoading
      console.error("Erro no registro do cliente (tratado pelo hook):", error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(handleClientRegister)} sx={{ mt: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom align="center">
        Cadastro de Cliente
      </Typography>
      <TextField
        fullWidth
        label="Nome Completo"
        name="name"
        value={values.name}
        onChange={handleChange}
        margin="normal"
        error={!!errors.name}
        helperText={errors.name}
        required
      />
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
        label="Telefone"
        name="phone"
        value={values.phone}
        onChange={handleChange}
        margin="normal"
        error={!!errors.phone}
        helperText={errors.phone}
        required
      />
      <TextField
        fullWidth
        label="Endereço (Rua, Número, Bairro, Cidade)"
        name="address"
        value={values.address}
        onChange={handleChange}
        margin="normal"
        multiline
        rows={2}
        error={!!errors.address}
        helperText={errors.address}
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
        {isSubmitting || authLoading ? <CircularProgress size={24} /> : 'Cadastrar'}
      </Button>
      <Box sx={{ textAlign: 'center' }}>
        Já tem uma conta? <Link href="/login" variant="body2">Faça Login</Link>
      </Box>
    </Box>
  );
};

export default ClientRegisterForm;