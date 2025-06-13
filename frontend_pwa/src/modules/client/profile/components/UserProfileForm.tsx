// frontend_pwa/src/modules/client/profile/components/UserProfileForm.tsx
import React, { useEffect } from 'react';
import { TextField, Button, Box, CircularProgress, Typography } from '@mui/material';
import { useForm } from '../../../../hooks/useForm';
import { type User } from '../../../../types';
import InputMask from 'react-input-mask'; // Importe InputMask

interface UserProfileFormProps {
  initialData?: User | null;
  onSubmit: (formData: User) => Promise<void>;
  isSaving: boolean;
}

const initialFormState: User = {
  id: '',
  name: '',
  email: '',
  phone: '', // Adicionado telefone no estado inicial
  role: 'client', // Valor padrão
  created_at: '',
  updated_at: '',
};

const UserProfileForm: React.FC<UserProfileFormProps> = ({ initialData, onSubmit, isSaving }) => {
  const { values, handleChange, handleManualChange, handleSubmit, setAllValues, isDirty, errors, setErrors } = useForm<User>(initialFormState, validateForm);

  useEffect(() => {
    if (initialData) {
      setAllValues(initialData);
    } else {
      setAllValues(initialFormState);
    }
  }, [initialData, setAllValues]);

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

  function validateForm(formData: User): { [key: string]: string } {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = "Nome é obrigatório.";
    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido.";
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
    // Garante que apenas os campos editáveis são enviados
    const dataToSubmit = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      // Não enviar created_at, updated_at, id, role (são gerenciados pelo backend ou imutáveis aqui)
    };
    await onSubmit(dataToSubmit as User); // Fazendo um cast para User, pois o onSubmit espera User
  };

  return (
    <Box component="form" onSubmit={handleSubmit(submitForm)} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Dados Pessoais
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
        disabled // Email geralmente não é editável diretamente pelo perfil
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
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button type="submit" variant="contained" color="primary" disabled={isSaving || !isDirty}>
          {isSaving ? <CircularProgress size={24} /> : 'Salvar Alterações'}
        </Button>
      </Box>
    </Box>
  );
};

export default UserProfileForm;