// frontend_pwa/src/modules/admin/auth/components/AdminLoginForm.tsx
import React from 'react';
import { TextField, Button, Box, Typography, CircularProgress } from '@mui/material';
import { useAuth } from '../../../../hooks/useAuth'; // Usando o novo hook de autenticação
import { useForm } from '../../../../hooks/useForm'; // Usando o hook useForm
import { useNavigate } from 'react-router-dom';

interface AdminLoginFormData {
  email: string;
  password: string;
}

const initialFormState: AdminLoginFormData = {
  email: '',
  password: '',
};

const AdminLoginForm: React.FC = () => {
  const { login, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const { values, handleChange, handleSubmit, errors, isSubmitting } = useForm<AdminLoginFormData>(
    initialFormState,
    validateForm
  );

  function validateForm(formData: AdminLoginFormData): { [key: string]: string } {
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

  const handleAdminLogin = async () => {
    try {
      await login(values, true); // O segundo parâmetro indica que é login de admin
      navigate('/admin/dashboard'); // Redireciona para o dashboard do admin
    } catch (error) {
      // Erro já tratado e notificado pelo useAuth/useLoading
      console.error("Erro no login do admin (tratado pelo hook):", error);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(handleAdminLogin)} sx={{ mt: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom align="center">
        Login do Administrador
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
    </Box>
  );
};

export default AdminLoginForm;