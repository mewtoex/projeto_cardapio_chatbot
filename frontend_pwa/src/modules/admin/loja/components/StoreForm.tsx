import React, { useEffect, useCallback } from 'react';
import { TextField, Button, Box, CircularProgress, Typography, FormControlLabel, Switch } from '@mui/material';
import { useForm } from '../../../../hooks/useForm';
import { type Store } from '../../../../types';
import { ImageUpload } from '../../../../components/UI/ImageUpload';
import axios from 'axios';
import InputMask from 'react-input-mask'; 

const initialFormState: Store = {
  name: '',
  phone: '',
  address_street: '',
  address_number: '',
  address_complement: '',
  address_district: '',
  address_city: '',
  address_state: '',
  address_cep: '',
  logo_url: '',
  is_open: false,
};

interface StoreFormProps {
  initialData?: Store | null;
  onSubmit: (formData: Store) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

const StoreForm: React.FC<StoreFormProps> = ({ initialData, onSubmit, onCancel, isSaving }) => {
  const { values, handleChange, handleManualChange, handleSubmit, setAllValues, isDirty, errors, setErrors } = useForm<Store>(initialFormState, validateForm);

  useEffect(() => {
    if (initialData) {
      setAllValues({
        ...initialData,
        address_complement: initialData.address_complement || '',
        logo_url: initialData.logo_url || '',
        is_open: initialData.is_open || false,
      });
    } else {
      setAllValues(initialFormState);
    }
  }, [initialData, setAllValues]);

  const fetchAddressByCep = useCallback(async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      if (cleanCep === '') {
        setErrors(prev => ({ ...prev, address_cep: "" }));
      } else {
        setErrors(prev => ({ ...prev, address_cep: "CEP inválido." }));
      }
      return;
    }
    setErrors(prev => ({ ...prev, address_cep: "" }));

    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = response.data;

      if (data.erro) {
        setErrors(prev => ({ ...prev, address_cep: "CEP não encontrado." }));
        return;
      }

      handleManualChange('address_street', data.logradouro);
      handleManualChange('address_district', data.bairro);
      handleManualChange('address_city', data.localidade);
      handleManualChange('address_state', data.uf);
    } catch (error) {
      console.error("Erro ao buscar CEP para a loja:", error);
      setErrors(prev => ({ ...prev, address_cep: "Erro ao buscar CEP. Verifique sua conexão." }));
    }
  }, [handleManualChange, setErrors]);

  const handleStoreCepChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    handleChange(event);
    if (value.replace(/\D/g, '').length === 8) {
      fetchAddressByCep(value);
    }
  }, [handleChange, fetchAddressByCep]);

  const handlePhoneChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    handleChange(event);
    const cleanPhone = value.replace(/\D/g, '');
    if (cleanPhone.length > 0 && (cleanPhone.length < 10 || cleanPhone.length > 11)) {
        setErrors(prev => ({ ...prev, phone: "Telefone inválido." }));
    } else {
        setErrors(prev => ({ ...prev, phone: "" }));
    }
  }, [handleChange, setErrors]);

  function validateForm(formData: Store): { [key: string]: string } {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = "Nome da loja é obrigatório.";
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Telefone é obrigatório.";
    } else {
      const cleanPhone = formData.phone.replace(/\D/g, '');
      if (cleanPhone.length < 10 || cleanPhone.length > 11) {
        newErrors.phone = "Telefone inválido (mínimo 10, máximo 11 dígitos com DDD).";
      }
    }

    if (!formData.address_street.trim()) newErrors.address_street = "Rua é obrigatória.";
    if (!formData.address_number.trim()) newErrors.address_number = "Número é obrigatório.";
    if (!formData.address_district.trim()) newErrors.address_district = "Bairro é obrigatório.";
    if (!formData.address_city.trim()) newErrors.address_city = "Cidade é obrigatória.";
    if (!formData.address_state.trim()) newErrors.address_state = "Estado é obrigatório.";
    if (!formData.address_cep.trim()) {
      newErrors.address_cep = "CEP é obrigatório.";
    } else if (formData.address_cep.replace(/\D/g, '').length !== 8) {
      newErrors.address_cep = "CEP deve conter 8 dígitos.";
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
      <InputMask
        mask="99999-999"
        value={values.address_cep}
        onChange={handleStoreCepChange}
        maskChar="_"
      >
        {(inputProps: any) => (
          <TextField
            {...inputProps}
            fullWidth
            label="CEP"
            name="address_cep"
            margin="normal"
            required
            error={!!errors.address_cep}
            helperText={errors.address_cep}
            placeholder="Ex: 12345-678"
          />
        )}
      </InputMask>
      <TextField
        fullWidth
        label="Rua"
        name="address_street"
        value={values.address_street}
        onChange={handleChange}
        margin="normal"
        required
        error={!!errors.address_street}
        helperText={errors.address_street}
      />
      <TextField
        fullWidth
        label="Número"
        name="address_number"
        value={values.address_number}
        onChange={handleChange}
        margin="normal"
        required
        error={!!errors.address_number}
        helperText={errors.address_number}
      />
      <TextField
        fullWidth
        label="Complemento"
        name="address_complement"
        value={values.address_complement}
        onChange={handleChange}
        margin="normal"
      />
      <TextField
        fullWidth
        label="Bairro"
        name="address_district"
        value={values.address_district}
        onChange={handleChange}
        margin="normal"
        required
        error={!!errors.address_district}
        helperText={errors.address_district}
      />
      <TextField
        fullWidth
        label="Cidade"
        name="address_city"
        value={values.address_city}
        onChange={handleChange}
        margin="normal"
        required
        error={!!errors.address_city}
        helperText={errors.address_city}
      />
      <TextField
        fullWidth
        label="Estado (UF)"
        name="address_state"
        value={values.address_state}
        onChange={handleChange}
        margin="normal"
        required
        error={!!errors.address_state}
        helperText={errors.address_state}
      />
      <ImageUpload
        currentImage={values.logo_url}
        onImageUpload={(url) => handleManualChange('logo_url', url)}
        label="Logo da Loja"
      />

      <FormControlLabel
        control={
          <Switch
            checked={values.is_open}
            onChange={(e) => handleManualChange('is_open', e.target.checked)}
            name="is_open"
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