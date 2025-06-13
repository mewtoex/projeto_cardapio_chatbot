// frontend_pwa/src/modules/client/profile/components/AddressForm.tsx
import React, { useEffect } from 'react';
import { TextField, Button, Box, CircularProgress, FormControlLabel, Switch, Typography } from '@mui/material';
import { useForm } from '../../../../hooks/useForm';
import { type Address } from '../../../../types';

interface AddressFormProps {
  initialData?: Address | null;
  onSubmit: (formData: Address) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

const initialFormState: Address = {
  id: 0, // Será ignorado na criação, mas usado na edição
  user_id: 0, // Será definido pelo backend ou useAuth
  street: "",
  number: "",
  complement: "",
  district_name: "",
  city: "",
  state: "",
  zip_code: "",
  is_primary: false,
};

const AddressForm: React.FC<AddressFormProps> = ({
  initialData, onSubmit, onCancel, isSaving
}) => {
  const { values, handleChange, handleManualChange, handleSubmit, setAllValues, isDirty, errors, setErrors } = useForm<Address>(initialFormState, validateForm);

  useEffect(() => {
    if (initialData) {
      setAllValues(initialData); // Preenche o formulário com dados existentes
    } else {
      setAllValues(initialFormState); // Reseta para o estado inicial para "novo endereço"
    }
  }, [initialData, setAllValues]);

  function validateForm(formData: Address): { [key: string]: string } {
    const newErrors: { [key: string]: string } = {};
    if (!formData.street.trim()) newErrors.street = "Rua é obrigatória.";
    if (!formData.number.trim()) newErrors.number = "Número é obrigatório.";
    if (!formData.district_name.trim()) newErrors.district_name = "Bairro é obrigatório.";
    if (!formData.city.trim()) newErrors.city = "Cidade é obrigatória.";
    if (!formData.state.trim()) newErrors.state = "Estado é obrigatório.";
    if (!formData.zip_code.trim()) newErrors.zip_code = "CEP é obrigatório.";
    return newErrors;
  }

  const submitForm = async () => {
    // O id e user_id serão tratados pelo backend ou no componente pai antes de chamar onSubmit
    await onSubmit(values);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(submitForm)} sx={{ p: 2 }}>
      <TextField
        fullWidth
        label="Rua"
        name="street"
        value={values.street}
        onChange={handleChange}
        margin="normal"
        required
        error={!!errors.street}
        helperText={errors.street}
      />
      <TextField
        fullWidth
        label="Número"
        name="number"
        value={values.number}
        onChange={handleChange}
        margin="normal"
        required
        error={!!errors.number}
        helperText={errors.number}
      />
      <TextField
        fullWidth
        label="Complemento (ex: Apartamento 101)"
        name="complement"
        value={values.complement}
        onChange={handleChange}
        margin="normal"
      />
      <TextField
        fullWidth
        label="Bairro"
        name="district_name"
        value={values.district_name}
        onChange={handleChange}
        margin="normal"
        required
        error={!!errors.district_name}
        helperText={errors.district_name}
      />
      <TextField
        fullWidth
        label="Cidade"
        name="city"
        value={values.city}
        onChange={handleChange}
        margin="normal"
        required
        error={!!errors.city}
        helperText={errors.city}
      />
      <TextField
        fullWidth
        label="Estado (UF)"
        name="state"
        value={values.state}
        onChange={handleChange}
        margin="normal"
        required
        error={!!errors.state}
        helperText={errors.state}
      />
      <TextField
        fullWidth
        label="CEP"
        name="zip_code"
        value={values.zip_code}
        onChange={handleChange}
        margin="normal"
        required
        error={!!errors.zip_code}
        helperText={errors.zip_code}
      />
      {initialData && ( // A opção de tornar primário só aparece ao editar um endereço existente
        <FormControlLabel
          control={
            <Switch
              checked={values.is_primary}
              onChange={(e) => handleManualChange('is_primary', e.target.checked)}
              color="primary"
            />
          }
          label="Endereço Principal"
          sx={{ mt: 2 }}
        />
      )}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button onClick={onCancel} color="inherit" sx={{ mr: 1 }} disabled={isSaving}>
          Cancelar
        </Button>
        <Button type="submit" variant="contained" color="primary" disabled={isSaving || !isDirty}>
          {isSaving ? <CircularProgress size={24} /> : 'Salvar Endereço'}
        </Button>
      </Box>
    </Box>
  );
};

export default AddressForm;