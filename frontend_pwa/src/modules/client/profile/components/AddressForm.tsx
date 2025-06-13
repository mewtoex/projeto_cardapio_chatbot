// frontend_pwa/src/modules/client/profile/components/AddressForm.tsx
import React, { useEffect, useCallback } from 'react';
import { TextField, Button, Box, CircularProgress, FormControlLabel, Switch, Typography } from '@mui/material';
import { useForm } from '../../../../hooks/useForm';
import { type Address } from '../../../../types';
import axios from 'axios';
import InputMask from 'react-input-mask'; // Importe InputMask

interface AddressFormProps {
  initialData?: Address | null;
  onSubmit: (formData: Address) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

const initialFormState: Address = {
  street: "",
  number: "",
  complement: "",
  district: "",
  city: "",
  state: "",
  cep: "",
  is_primary: false,
};

const AddressForm: React.FC<AddressFormProps> = ({
  initialData, onSubmit, onCancel, isSaving
}) => {
  const { values, handleChange, handleManualChange, handleSubmit, setAllValues, isDirty, errors, setErrors } = useForm<Address>(initialFormState, validateForm);

  useEffect(() => {
    if (initialData) {
      setAllValues({
        ...initialData,
        complement: initialData.complement || "",
      });
    } else {
      setAllValues(initialFormState);
    }
  }, [initialData, setAllValues]);

  const fetchAddressByCep = useCallback(async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      if (cleanCep === '') {
        setErrors(prev => ({ ...prev, cep: "" }));
      } else {
        setErrors(prev => ({ ...prev, cep: "CEP inválido." }));
      }
      return;
    }
    setErrors(prev => ({ ...prev, cep: "" }));

    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = response.data;

      if (data.erro) {
        setErrors(prev => ({ ...prev, cep: "CEP não encontrado." }));
        return;
      }

      handleManualChange('street', data.logradouro);
      handleManualChange('district', data.bairro);
      handleManualChange('city', data.localidade);
      handleManualChange('state', data.uf);
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      setErrors(prev => ({ ...prev, cep: "Erro ao buscar CEP. Verifique sua conexão." }));
    }
  }, [handleManualChange, setErrors]);

  const handleCepChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    handleChange(event);
    if (value.replace(/\D/g, '').length === 8) {
      fetchAddressByCep(value);
    }
  }, [handleChange, fetchAddressByCep]);

  function validateForm(formData: Address): { [key: string]: string } {
    const newErrors: { [key: string]: string } = {};
    if (!formData.street.trim()) newErrors.street = "Rua é obrigatória.";
    if (!formData.number.trim()) newErrors.number = "Número é obrigatório.";
    if (!formData.district.trim()) newErrors.district = "Bairro é obrigatório.";
    if (!formData.city.trim()) newErrors.city = "Cidade é obrigatória.";
    if (!formData.state.trim()) newErrors.state = "Estado é obrigatório.";
    if (!formData.cep.trim()) {
      newErrors.cep = "CEP é obrigatório.";
    } else if (formData.cep.replace(/\D/g, '').length !== 8) {
      newErrors.cep = "CEP deve conter 8 dígitos.";
    }
    return newErrors;
  }

  const submitForm = async () => {
    await onSubmit(values);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(submitForm)} sx={{ p: 2 }}>
      <InputMask
        mask="99999-999"
        value={values.cep}
        onChange={handleCepChange}
        maskChar="_"
      >
        {(inputProps: any) => (
          <TextField
            {...inputProps}
            fullWidth
            label="CEP"
            name="cep"
            margin="normal"
            required
            error={!!errors.cep}
            helperText={errors.cep}
            placeholder="Ex: 12345-678"
          />
        )}
      </InputMask>
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
        name="district"
        value={values.district}
        onChange={handleChange}
        margin="normal"
        required
        error={!!errors.district}
        helperText={errors.district}
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
      
      {initialData && (
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