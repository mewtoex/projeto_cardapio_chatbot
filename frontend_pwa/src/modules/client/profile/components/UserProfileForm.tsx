import React, { useEffect } from 'react';
import { TextField, Button, Box, CircularProgress, Typography } from '@mui/material';
import { useForm } from '../../../../hooks/useForm';
import { type User } from '../../../../types';
import InputMask from 'react-input-mask';

interface UserProfileFormProps {
  initialData?: User | null;
  onSubmit: (formData: User) => Promise<void>;
  isSaving: boolean;
  onCancel: () => void;
}

const initialFormState: User = {
  id: 0,
  name: '',
  email: '',
  phone: '', 
  role: 'cliente', 
};

const UserProfileForm: React.FC<UserProfileFormProps> = ({ 
  initialData, 
  onSubmit, 
  isSaving,
  onCancel 
}) => {
  const { values, handleChange, setAllValues, isDirty, errors, setErrors } = useForm<User>(initialFormState, validateForm);

  useEffect(() => {
    if (initialData) {
      setAllValues(initialData);
    } else {
      setAllValues(initialFormState);
    }
  }, [initialData, setAllValues]);

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    handleChange(event); 

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

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    const validationErrors = validateForm(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const dataToSubmit = {
        ...values,
        id: initialData?.id || 0,
        role: initialData?.role || 'cliente'
      };
      await onSubmit(dataToSubmit);
    } catch (error) {
      console.error("Erro ao submeter formulário:", error);
    }
  };

  return (
    <Box component="form" onSubmit={handleFormSubmit} sx={{ p: 2 }}>
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
        disabled 
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
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
        <Button 
          variant="outlined" 
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          variant="contained" 
          color="primary" 
          disabled={isSaving || !isDirty}
        >
          {isSaving ? <CircularProgress size={24} /> : 'Salvar Alterações'}
        </Button>
      </Box>
    </Box>
  );
};

export default UserProfileForm;