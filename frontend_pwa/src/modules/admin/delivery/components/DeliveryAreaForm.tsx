// frontend_pwa/src/modules/admin/delivery/components/DeliveryAreaForm.tsx
import React, { useEffect } from 'react';
import { TextField, Button, Box, CircularProgress, Typography } from '@mui/material';
import { useForm } from '../../../../hooks/useForm';
import { type DeliveryArea } from '../../../../types';

interface DeliveryAreaFormProps {
  initialData?: DeliveryArea | null;
  onSubmit: (formData: { district_name: string; delivery_fee: number }) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

interface DeliveryAreaFormData {
  district_name: string;
  delivery_fee: string; // Para TextField, manter como string inicialmente
}

const initialFormState: DeliveryAreaFormData = {
  district_name: "",
  delivery_fee: "0.00",
};

const DeliveryAreaForm: React.FC<DeliveryAreaFormProps> = ({
  initialData, onSubmit, onCancel, isSaving
}) => {
  const { values, handleChange, handleSubmit, setAllValues, isDirty, errors, setErrors } = useForm<DeliveryAreaFormData>(initialFormState, validateForm);

  useEffect(() => {
    if (initialData) {
      setAllValues({
        district_name: initialData.district_name,
        delivery_fee: initialData.delivery_fee.toFixed(2),
      });
    } else {
      setAllValues(initialFormState);
    }
  }, [initialData, setAllValues]);

  function validateForm(formData: DeliveryAreaFormData): { [key: string]: string } {
    const newErrors: { [key: string]: string } = {};
    if (!formData.district_name.trim()) {
      newErrors.district_name = "Nome do bairro é obrigatório.";
    }
    const parsedFee = parseFloat(formData.delivery_fee);
    if (isNaN(parsedFee) || parsedFee < 0) {
      newErrors.delivery_fee = "Taxa de entrega deve ser um número não negativo.";
    }
    return newErrors;
  }

  const submitForm = async () => {
    await onSubmit({
      district_name: values.district_name,
      delivery_fee: parseFloat(values.delivery_fee),
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit(submitForm)} sx={{ p: 2 }}>
      <TextField
        fullWidth
        label="Nome do Bairro"
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
        label="Taxa de Entrega (R$)"
        name="delivery_fee"
        type="number"
        inputProps={{ min: 0, step: 0.01 }}
        value={values.delivery_fee}
        onChange={handleChange}
        margin="normal"
        required
        error={!!errors.delivery_fee}
        helperText={errors.delivery_fee}
      />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button onClick={onCancel} color="inherit" sx={{ mr: 1 }} disabled={isSaving}>
          Cancelar
        </Button>
        <Button type="submit" variant="contained" color="primary" disabled={isSaving || !isDirty}>
          {isSaving ? <CircularProgress size={24} /> : 'Salvar Área'}
        </Button>
      </Box>
    </Box>
  );
};

export default DeliveryAreaForm;