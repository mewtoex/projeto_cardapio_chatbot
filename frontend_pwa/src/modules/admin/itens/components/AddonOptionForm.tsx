// frontend_pwa/src/modules/admin/itens/components/AddonOptionForm.tsx
import React, { useEffect } from 'react';
import { TextField, Button, Box, CircularProgress, Typography } from '@mui/material';
import { useForm } from '../../../../hooks/useForm';
import { type AddonOption } from '../../../../types';

interface AddonOptionFormProps {
  initialData?: AddonOption | null;
  onSubmit: (formData: { name: string; price: number }) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

interface AddonOptionFormData {
  name: string;
  price: string; // Para TextField, manter como string
}

const initialFormState: AddonOptionFormData = {
  name: "",
  price: "0.00",
};

const AddonOptionForm: React.FC<AddonOptionFormProps> = ({
  initialData, onSubmit, onCancel, isSaving
}) => {
  const { values, handleChange, handleSubmit, setAllValues, isDirty, errors, setErrors } = useForm<AddonOptionFormData>(initialFormState, validateForm);

  useEffect(() => {
    if (initialData) {
      setAllValues({
        name: initialData.name,
        price: initialData.price.toFixed(2),
      });
    } else {
      setAllValues(initialFormState);
    }
  }, [initialData, setAllValues]);

  function validateForm(formData: AddonOptionFormData): { [key: string]: string } {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) {
      newErrors.name = "Nome da opção é obrigatório.";
    }
    const parsedPrice = parseFloat(formData.price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      newErrors.price = "Preço deve ser um número não negativo.";
    }
    return newErrors;
  }

  const submitForm = async () => {
    await onSubmit({
      name: values.name,
      price: parseFloat(values.price),
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit(submitForm)} sx={{ p: 2 }}>
      <TextField
        fullWidth
        label="Nome da Opção"
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
        label="Preço (R$)"
        name="price"
        type="number"
        inputProps={{ min: 0, step: 0.01 }}
        value={values.price}
        onChange={handleChange}
        margin="normal"
        required
        error={!!errors.price}
        helperText={errors.price}
      />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button onClick={onCancel} color="inherit" sx={{ mr: 1 }} disabled={isSaving}>
          Cancelar
        </Button>
        <Button type="submit" variant="contained" color="primary" disabled={isSaving || !isDirty}>
          {isSaving ? <CircularProgress size={24} /> : 'Salvar Opção'}
        </Button>
      </Box>
    </Box>
  );
};

export default AddonOptionForm;