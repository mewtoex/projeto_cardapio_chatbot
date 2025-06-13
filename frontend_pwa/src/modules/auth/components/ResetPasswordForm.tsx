// frontend_pwa/src/modules/auth/components/ResetPasswordForm.tsx
import React from 'react';
import { TextField, Button, Box, CircularProgress, Typography } from '@mui/material';
import { useForm } from '../../../hooks/useForm';
import api from '../../../api/api';
import { useLoading } from '../../../hooks/useLoading';

interface ResetPasswordFormData {
  new_password: string;
  confirm_password: string;
}

const initialFormState: ResetPasswordFormData = {
  new_password: '',
  confirm_password: '',
};

interface ResetPasswordFormProps {
  token: string; // Token deve ser passado como prop
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ token, onSuccess, onCancel }) => {
  const { values, handleChange, handleSubmit, errors, isSubmitting } = useForm<ResetPasswordFormData>(
    initialFormState,
    validateForm
  );
  const { loading, error, execute } = useLoading();

  function validateForm(formData: ResetPasswordFormData): { [key: string]: string } {
    const newErrors: { [key: string]: string } = {};
    if (!formData.new_password || formData.new_password.length < 6) {
      newErrors.new_password = "A nova senha deve ter no mínimo 6 caracteres.";
    }
    if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = "As senhas não coincidem.";
    }
    return newErrors;
  }

  const handleResetPassword = async () => {
    try {
      await execute(
        api.resetPassword(token, values.new_password),
        "Sua senha foi redefinida com sucesso! Faça login com a nova senha.",
        "Erro ao redefinir senha. O link pode ser inválido ou expirado."
      );
      onSuccess?.();
    } catch (err) {
      console.error("Falha ao redefinir senha (tratado por hook):", err);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(handleResetPassword)} sx={{ width: '100%' }}>
      <TextField
        fullWidth
        label="Nova Senha"
        name="new_password"
        type="password"
        value={values.new_password}
        onChange={handleChange}
        margin="normal"
        required
        error={!!errors.new_password}
        helperText={errors.new_password}
      />
      <TextField
        fullWidth
        label="Confirmar Nova Senha"
        name="confirm_password"
        type="password"
        value={values.confirm_password}
        onChange={handleChange}
        margin="normal"
        required
        error={!!errors.confirm_password}
        helperText={errors.confirm_password}
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
        {isSubmitting || loading ? <CircularProgress size={24} /> : 'Redefinir Senha'}
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

export default ResetPasswordForm;