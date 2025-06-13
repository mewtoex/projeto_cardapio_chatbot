// frontend_pwa/src/modules/auth/components/ClientRegisterForm.tsx
import React from 'react';
import { TextField, Button, Box, Typography, CircularProgress } from '@mui/material';
import { useForm } from '../../../hooks/useForm';
import { type RegisterData } from '../../../types';
import InputMask from 'react-input-mask'; // Importe InputMask

interface ClientRegisterFormProps {
  onSubmit: (formData: RegisterData) => Promise<void>;
  onLoginRedirect: () => void;
  isSubmitting: boolean;
}

const initialFormState: RegisterData = {
  name: '',
  email: '',
  password: '',
  confirm_password: '',
  phone: '', // Adicionado telefone no estado inicial
};

const ClientRegisterForm: React.FC<ClientRegisterFormProps> = ({ onSubmit, onLoginRedirect, isSubmitting }) => {
  const { values, handleChange, handleSubmit, errors, setErrors } = useForm<RegisterData>(initialFormState, validateForm);

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    handleChange(event); // Atualiza o valor do telefone no estado do formulário

    const cleanPhone = value.replace(/\D/g, '');
    if (cleanPhone.length > 0 && (cleanPhone.length < 10 || cleanPhone.length > 11)) {
        setErrors(prev => ({ ...prev, phone: "Telefone inválido." }));
    } else {
        setErrors(prev => ({ ...prev, phone: "" }));
    }
  };

  function validateForm(formData: RegisterData): { [key: string]: string } {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = "Nome é obrigatório.";
    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido.";
    }
    if (!formData.password.trim()) {
      newErrors.password = "Senha é obrigatória.";
    } else if (formData.password.length < 6) {
      newErrors.password = "A senha deve ter no mínimo 6 caracteres.";
    }
    if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = "As senhas não coincidem.";
    }

    // Validação para telefone
    if (!formData.phone.trim()) {
      newErrors.phone = "Telefone é obrigatório.";
    } else {
      const cleanPhone = formData.phone.replace(/\D/g, '');
      if (cleanPhone.length < 10 || cleanPhone.length > 11) {
        newErrors.phone = "Telefone inválido (mínimo 10, máximo 11 dígitos com DDD).";
      }
    }

    return newErrors;
  }

  const submitForm = async () => {
    await onSubmit(values);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
  e.preventDefault(); 
  submitForm();
};

  return (
    <Box component="form" onSubmit={handleFormSubmit} sx={{ maxWidth: 400, mx: 'auto', mt: 4, p: 3, border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <Typography variant="h5" component="h1" gutterBottom align="center">
        Criar Nova Conta
      </Typography>
      <TextField
        fullWidth
        label="Nome Completo"
        name="name"
        value={values.name}
        onChange={handleChange}
        margin="normal"
        required
        error={!!errors.name}
        helperText={errors.name}
      />
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
      <InputMask
        mask="(99) 99999-9999"
        value={values.phone}
        onChange={handlePhoneChange}
        maskChar="_"
      >
        {(inputProps: any) => (
          <TextField
            {...inputProps}
            fullWidth
            label="Telefone (com DDD)"
            name="phone"
            margin="normal"
            required
            error={!!errors.phone}
            helperText={errors.phone}
            placeholder="(99) 99999-9999"
          />
        )}
      </InputMask>
      <TextField
        fullWidth
        label="Senha"
        name="password"
        type="password"
        value={values.password}
        onChange={handleChange}
        margin="normal"
        required
        error={!!errors.password}
        helperText={errors.password}
      />
      <TextField
        fullWidth
        label="Confirmar Senha"
        name="confirm_password"
        type="password"
        value={values.confirm_password}
        onChange={handleChange}
        margin="normal"
        required
        error={!!errors.confirm_password}
        helperText={errors.confirm_password}
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        sx={{ mt: 3, mb: 2 }}
        disabled={isSubmitting}
      >
        {isSubmitting ? <CircularProgress size={24} /> : 'Registrar'}
      </Button>
      <Button
        fullWidth
        variant="text"
        onClick={onLoginRedirect}
        disabled={isSubmitting}
      >
        Já tem uma conta? Faça login
      </Button>
    </Box>
  );
};

export default ClientRegisterForm;