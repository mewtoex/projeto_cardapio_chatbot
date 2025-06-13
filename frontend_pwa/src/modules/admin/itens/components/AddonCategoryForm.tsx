// frontend_pwa/src/modules/admin/itens/components/AddonCategoryForm.tsx
import React, { useEffect } from 'react';
import { TextField, Button, Box, CircularProgress, FormControlLabel, Switch, Typography } from '@mui/material';
import { useForm } from '../../../../hooks/useForm';
import { type AddonCategory } from '../../../../types';

interface AddonCategoryFormProps {
  initialData?: AddonCategory | null;
  onSubmit: (formData: { name: string; min_selections?: number; max_selections?: number; is_required?: boolean }) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

interface AddonCategoryFormData {
  name: string;
  min_selections: string;
  max_selections: string;
  is_required: boolean;
}

const initialFormState: AddonCategoryFormData = {
  name: "",
  min_selections: "0",
  max_selections: "0",
  is_required: false,
};

const AddonCategoryForm: React.FC<AddonCategoryFormProps> = ({
  initialData, onSubmit, onCancel, isSaving
}) => {
  const { values, handleChange, handleManualChange, handleSubmit, setAllValues, isDirty, errors, setErrors } = useForm<AddonCategoryFormData>(initialFormState, validateForm);

  useEffect(() => {
    if (initialData) {
      setAllValues({
        name: initialData.name,
        min_selections: String(initialData.min_selections),
        max_selections: String(initialData.max_selections),
        is_required: initialData.is_required,
      });
    } else {
      setAllValues(initialFormState);
    }
  }, [initialData, setAllValues]);

  function validateForm(formData: AddonCategoryFormData): { [key: string]: string } {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) {
      newErrors.name = "Nome da categoria é obrigatório.";
    }
    const min = parseInt(formData.min_selections, 10);
    const max = parseInt(formData.max_selections, 10);

    if (isNaN(min) || min < 0) {
      newErrors.min_selections = "Mínimo deve ser um número não negativo.";
    }
    if (isNaN(max) || max < 0) {
      newErrors.max_selections = "Máximo deve ser um número não negativo.";
    }
    if (!isNaN(min) && !isNaN(max) && min > max && max !== 0) {
      newErrors.max_selections = "Máximo deve ser maior ou igual ao mínimo (ou 0 para ilimitado).";
    }
    if (formData.is_required && min === 0) {
        newErrors.min_selections = "Se a categoria é obrigatória, o mínimo de seleções não pode ser 0.";
    }
    return newErrors;
  }

  const submitForm = async () => {
    await onSubmit({
      name: values.name,
      min_selections: parseInt(values.min_selections, 10),
      max_selections: parseInt(values.max_selections, 10),
      is_required: values.is_required,
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit(submitForm)} sx={{ p: 2 }}>
      <TextField
        fullWidth
        label="Nome da Categoria de Adicional"
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
        label="Mínimo de Seleções"
        name="min_selections"
        type="number"
        inputProps={{ min: 0 }}
        value={values.min_selections}
        onChange={handleChange}
        margin="normal"
        error={!!errors.min_selections}
        helperText={errors.min_selections}
      />
      <TextField
        fullWidth
        label="Máximo de Seleções (0 para ilimitado)"
        name="max_selections"
        type="number"
        inputProps={{ min: 0 }}
        value={values.max_selections}
        onChange={handleChange}
        margin="normal"
        error={!!errors.max_selections}
        helperText={errors.max_selections}
      />
      <FormControlLabel
        control={
          <Switch
            checked={values.is_required}
            onChange={(e) => handleManualChange('is_required', e.target.checked)}
            color="primary"
          />
        }
        label="Seleção Obrigatória"
        sx={{ mt: 2 }}
      />
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Se marcado, o cliente precisará selecionar ao menos o número mínimo de opções desta categoria.
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button onClick={onCancel} color="inherit" sx={{ mr: 1 }} disabled={isSaving}>
          Cancelar
        </Button>
        <Button type="submit" variant="contained" color="primary" disabled={isSaving || !isDirty}>
          {isSaving ? <CircularProgress size={24} /> : 'Salvar Categoria'}
        </Button>
      </Box>
    </Box>
  );
};

export default AddonCategoryForm;