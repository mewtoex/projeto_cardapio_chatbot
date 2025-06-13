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
  token: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ token, onSuccess, onCancel }) => {
  const { values, handleChange, setErrors, isDirty } = useForm<ResetPasswordFormData>(initialFormState);
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

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    const validationErrors = validateForm(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await execute(
        api.resetPassword(token, values.new_password),
        "Sua senha foi redefinida com sucesso! Faça login com a nova senha.",
        "Erro ao redefinir senha. O link pode ser inválido ou expirado."
      );
      onSuccess?.();
    } catch (err) {
      console.error("Falha ao redefinir senha:", err);
    }
  };

  return (
    <Box component="form" onSubmit={handleFormSubmit} sx={{ width: '100%' }}>
      <TextField
        fullWidth
        label="Nova Senha"
        name="new_password"
        type="password"
        value={values.new_password}
        onChange={handleChange}
        margin="normal"
        required
        error={!!error}
        helperText={error}
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
        error={!!error}
        helperText={error}
      />
      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {typeof error === 'string' ? error : 'Ocorreu um erro ao redefinir a senha'}
        </Typography>
      )}
      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
        disabled={loading || !isDirty}
      >
        {loading ? <CircularProgress size={24} /> : 'Redefinir Senha'}
      </Button>
      {onCancel && (
        <Button
          fullWidth
          variant="text"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
      )}
    </Box>
  );
};

export default ResetPasswordForm;