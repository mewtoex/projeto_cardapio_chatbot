// frontend_pwa/src/modules/client/profile/components/UserProfileForm.tsx
import React, { useEffect } from 'react';
import { TextField, Button, Box, CircularProgress, Typography } from '@mui/material';
import { useForm } from '../../../../hooks/useForm';
import { type UserProfile } from '../../../../types';

interface UserProfileFormProps {
  initialData?: UserProfile | null;
  onSubmit: (formData: Partial<UserProfile>) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

interface UserProfileFormData {
  name: string;
  email: string;
  phone: string;
}

const initialFormState: UserProfileFormData = {
  name: "",
  email: "",
  phone: "",
};

const UserProfileForm: React.FC<UserProfileFormProps> = ({
  initialData, onSubmit, onCancel, isSaving
}) => {
  const { values, handleChange, handleSubmit, setAllValues, isDirty, errors, setErrors } = useForm<UserProfileFormData>(initialFormState, validateForm);

  useEffect(() => {
    if (initialData) {
      setAllValues({
        name: initialData.name,
        email: initialData.email,
        phone: initialData.phone,
      });
    } else {
      setAllValues(initialFormState); // Reseta para o estado inicial para "novo perfil" (se fosse o caso de criação, mas aqui é edição)
    }
  }, [initialData, setAllValues]);

  function validateForm(formData: UserProfileFormData): { [key: string]: string } {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório.";
    }
    if (!formData.email) {
      newErrors.email = "Email é obrigatório.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido.";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Telefone é obrigatório.";
    }
    return newErrors;
  }

  const submitForm = async () => {
    await onSubmit(values);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(submitForm)} sx={{ p: 2 }}>
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
        disabled // Email geralmente não é editável diretamente
      />
      <TextField
        fullWidth
        label="Telefone"
        name="phone"
        value={values.phone}
        onChange={handleChange}
        margin="normal"
        required
        error={!!errors.phone}
        helperText={errors.phone}
      />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button onClick={onCancel} color="inherit" sx={{ mr: 1 }} disabled={isSaving}>
          Cancelar
        </Button>
        <Button type="submit" variant="contained" color="primary" disabled={isSaving || !isDirty}>
          {isSaving ? <CircularProgress size={24} /> : 'Salvar Alterações'}
        </Button>
      </Box>
    </Box>
  );
};

export default UserProfileForm;