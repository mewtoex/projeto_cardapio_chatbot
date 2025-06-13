// frontend_pwa/src/modules/admin/loja/components/StoreForm.tsx
import React, { useEffect } from 'react';
import { TextField, Button, Box, CircularProgress, FormControlLabel, Switch, Typography } from '@mui/material';
import { useForm } from '../../../../hooks/useForm';
import { type Store } from '../../../../types';

interface StoreFormProps {
  initialData?: Store | null;
  onSubmit: (formData: Store) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

const initialFormState: Store = { // Use o tipo Store diretamente para o formulário
  name: "",
  address: "",
  phone: "",
  is_open: true,
  opening_hours: "",
  avg_preparation_time_minutes: 30, // Valor padrão
};

const StoreForm: React.FC<StoreFormProps> = ({
  initialData, onSubmit, onCancel, isSaving
}) => {
  const { values, handleChange, handleManualChange, handleSubmit, setAllValues, isDirty, errors, setErrors } = useForm<Store>(initialFormState, validateForm);

  useEffect(() => {
    if (initialData) {
      setAllValues(initialData); // Define todos os valores iniciais
    } else {
      setAllValues(initialFormState); // Reseta para o estado inicial para "nova loja"
    }
  }, [initialData, setAllValues]);

  function validateForm(formData: Store): { [key: string]: string } {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = "Nome da loja é obrigatório.";
    if (!formData.address.trim()) newErrors.address = "Endereço é obrigatório.";
    if (!formData.phone.trim()) newErrors.phone = "Telefone é obrigatório.";
    if (!formData.opening_hours.trim()) newErrors.opening_hours = "Horário de funcionamento é obrigatório.";
    if (isNaN(formData.avg_preparation_time_minutes) || formData.avg_preparation_time_minutes <= 0) {
      newErrors.avg_preparation_time_minutes = "Tempo de preparo deve ser um número positivo.";
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
        label="Nome da Loja"
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
        label="Endereço da Loja"
        name="address"
        value={values.address}
        onChange={handleChange}
        margin="normal"
        required
        error={!!errors.address}
        helperText={errors.address}
      />
      <TextField
        fullWidth
        label="Telefone da Loja"
        name="phone"
        value={values.phone}
        onChange={handleChange}
        margin="normal"
        required
        error={!!errors.phone}
        helperText={errors.phone}
      />
      <TextField
        fullWidth
        label="Horário de Funcionamento (Ex: 09:00-23:00)"
        name="opening_hours"
        value={values.opening_hours}
        onChange={handleChange}
        margin="normal"
        required
        error={!!errors.opening_hours}
        helperText={errors.opening_hours}
      />
      <TextField
        fullWidth
        label="Tempo Médio de Preparo (minutos)"
        name="avg_preparation_time_minutes"
        type="number"
        inputProps={{ min: 1 }}
        value={values.avg_preparation_time_minutes}
        onChange={handleChange}
        margin="normal"
        required
        error={!!errors.avg_preparation_time_minutes}
        helperText={errors.avg_preparation_time_minutes}
      />
      <FormControlLabel
        control={
          <Switch
            checked={values.is_open}
            onChange={(e) => handleManualChange('is_open', e.target.checked)}
            color="primary"
          />
        }
        label="Loja Aberta"
        sx={{ mt: 2 }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button onClick={onCancel} color="inherit" sx={{ mr: 1 }} disabled={isSaving}>
          Cancelar
        </Button>
        <Button type="submit" variant="contained" color="primary" disabled={isSaving || !isDirty}>
          {isSaving ? <CircularProgress size={24} /> : 'Salvar Configurações'}
        </Button>
      </Box>
    </Box>
  );
};

export default StoreForm;