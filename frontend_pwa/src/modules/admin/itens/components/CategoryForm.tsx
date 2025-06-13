// frontend_pwa/src/modules/admin/itens/components/CategoryForm.tsx
import React, { useEffect } from 'react';
import { TextField, Button, Box, CircularProgress, Typography } from '@mui/material';
import { useForm } from '../../../../hooks/useForm';
import { type Category } from '../../../../types';

interface CategoryFormProps {
  initialData?: Category | null;
  onSubmit: (formData: { name: string; description?: string }) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

interface CategoryFormData {
  name: string;
  description: string;
}

const initialFormState: CategoryFormData = {
  name: "",
  description: "",
};

const CategoryForm: React.FC<CategoryFormProps> = ({
  initialData, onSubmit, onCancel, isSaving
}) => {
  const { values, handleChange, handleSubmit, setAllValues, isDirty, errors, setErrors } = useForm<CategoryFormData>(initialFormState, validateForm);

  useEffect(() => {
    if (initialData) {
      setAllValues({
        name: initialData.name,
        description: initialData.description || "",
      });
    } else {
      setAllValues(initialFormState);
    }
  }, [initialData, setAllValues]);

  function validateForm(formData: CategoryFormData): { [key: string]: string } {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) {
      newErrors.name = "Nome da categoria é obrigatório.";
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
        label="Nome da Categoria"
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
        label="Descrição da Categoria (opcional)"
        name="description"
        value={values.description}
        onChange={handleChange}
        margin="normal"
        multiline
        rows={3}
      />
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

export default CategoryForm;