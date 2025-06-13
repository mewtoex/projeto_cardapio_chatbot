import React from 'react';
import { TextField, Button, Box, CircularProgress, Typography } from '@mui/material';
import { useForm } from '../../../hooks/useForm';
import api from '../../../api/api';
import { useLoading } from '../../../hooks/useLoading'; 

interface ForgotPasswordFormData {
  email: string;
}

const initialFormState: ForgotPasswordFormData = {
  email: '',
};

interface ForgotPasswordFormProps {
  onSuccess?: () => void; 
  onCancel?: () => void; 
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onSuccess, onCancel }) => {
  const { values, handleChange, setErrors, isDirty } = useForm<ForgotPasswordFormData>(initialFormState);
  const { loading, error, execute } = useLoading(); 

  function validateForm(formData: ForgotPasswordFormData): { [key: string]: string } {
    const newErrors: { [key: string]: string } = {};
    if (!formData.email) {
      newErrors.email = "Email é obrigatório.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido.";
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
        api.forgotPassword(values.email),
        "Se um e-mail estiver registrado, um link de redefinição de senha será enviado.", 
        "Erro ao enviar link de redefinição de senha." 
      );
      onSuccess?.(); 
    } catch (err) {
      console.error("Falha ao solicitar redefinição de senha:", err);
    }
  };

  return (
    <Box component="form" onSubmit={handleFormSubmit} sx={{ width: '100%' }}>
      <TextField
        fullWidth
        label="Email"
        name="email"
        type="email"
        value={values.email}
        onChange={handleChange}
        margin="normal"
        required
        error={!!error}
        helperText={error}
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
        disabled={loading || !isDirty}
      >
        {loading ? <CircularProgress size={24} /> : 'Enviar Link de Redefinição'}
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

export default ForgotPasswordForm;