// frontend_pwa/src/modules/auth/components/ForgotPasswordForm.tsx
import React from 'react';
import { TextField, Button, Box, CircularProgress, Typography } from '@mui/material';
import { useForm } from '../../../hooks/useForm';
import api from '../../../api/api';
import { useLoading } from '../../../hooks/useLoading'; // Para gerenciar o estado de loading e erros de API

interface ForgotPasswordFormData {
  email: string;
}

const initialFormState: ForgotPasswordFormData = {
  email: '',
};

interface ForgotPasswordFormProps {
  onSuccess?: () => void; // Callback opcional para sucesso
  onCancel?: () => void; // Callback opcional para cancelar
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onSuccess, onCancel }) => {
  const { values, handleChange, handleSubmit, errors, isSubmitting } = useForm<ForgotPasswordFormData>(
    initialFormState,
    validateForm
  );
  const { loading, error, execute } = useLoading(); // Usando useLoading para a chamada de API

  function validateForm(formData: ForgotPasswordFormData): { [key: string]: string } {
    const newErrors: { [key: string]: string } = {};
    if (!formData.email) {
      newErrors.email = "Email é obrigatório.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido.";
    }
    return newErrors;
  }

  const handleForgotPassword = async () => {
    try {
      await execute(
        api.forgotPassword(values.email),
        "Se um e-mail estiver registrado, um link de redefinição de senha será enviado.", // Mensagem de sucesso para o usuário
        "Erro ao enviar link de redefinição de senha." // Mensagem de erro genérica
      );
      onSuccess?.(); // Chama o callback de sucesso, se fornecido
    } catch (err) {
      // O erro já é tratado e notificado pelo `useLoading`
      console.error("Falha ao solicitar redefinição de senha (tratado por hook):", err);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(handleForgotPassword)} sx={{ width: '100%' }}>
      <TextField
        fullWidth
        label="Email"
        name="email"
        type="email"
        value={values.email}
        onChange={handleChange}
        margin="normal"
        required
        error={!!errors.email}
        helperText={errors.email}
      />
      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={isSubmitting || loading}
      >
        {isSubmitting || loading ? <CircularProgress size={24} /> : 'Enviar Link de Redefinição'}
      </Button>
      {onCancel && (
        <Button
          fullWidth
          variant="text"
          onClick={onCancel}
          disabled={isSubmitting || loading}
        >
          Cancelar
        </Button>
      )}
    </Box>
  );
};

export default ForgotPasswordForm;