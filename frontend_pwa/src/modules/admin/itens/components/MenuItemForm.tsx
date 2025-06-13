import React, { useEffect, useState } from 'react';
import {
  TextField, Button, Box, FormControl, InputLabel, Select, MenuItem,
  Switch, FormControlLabel, Grid, Typography, Checkbox, FormGroup, FormLabel,
} from '@mui/material';
import { ImageUpload } from '../../../../components/UI/ImageUpload';
import { useForm } from '../../../../hooks/useForm';
import { type MenuItem as MenuItemType, type Category, type AddonCategory, type MenuItemFormData } from '../../../../types';

interface MenuItemFormProps {
  initialData?: MenuItemType | null;
  categories: Category[];
  addonCategories: AddonCategory[];
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

// Estado inicial do formulário para um novo item
const initialFormState: MenuItemFormData = {
  name: "",
  category_id: "",
  price: "0.00", // Preço como string para TextField
  description: "",
  available: true,
  image_url: "", // URL da imagem existente
  has_addons: false,
  addon_category_ids: [],
};

const MenuItemForm: React.FC<MenuItemFormProps> = ({
  initialData, categories, addonCategories, onSubmit, onCancel, isSaving
}) => {
  const { values, handleChange, handleManualChange, handleSubmit, setAllValues, isDirty, errors, setErrors } = useForm<MenuItemFormData>(initialFormState, validateForm);
  const [imageFile, setImageFile] = useState<File | null>(null); 

  useEffect(() => {
    if (initialData) {
      setAllValues({
        name: initialData.name,
        category_id: String(initialData.category_id), 
        price: initialData.price.toFixed(2), 
        description: initialData.description || "",
        available: initialData.available,
        image_url: initialData.image_url || "",
        has_addons: initialData.has_addons,
        addon_category_ids: initialData.addon_categories?.map(ac => String(ac.id)) || [],
      });
    } else {
      // Se não há initialData, reinicia o formulário para o estado inicial
      // Define a primeira categoria como padrão se houver categorias disponíveis
      setAllValues({
        ...initialFormState,
        category_id: categories.length > 0 ? String(categories[0].id) : "", 
      });
    }
    setImageFile(null); // Garante que nenhum arquivo de imagem anterior persista
  }, [initialData, categories, setAllValues]); // Dependências

  // Função de validação para o useForm
  function validateForm(formData: MenuItemFormData): { [key: string]: string } {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = "Nome é obrigatório.";
    if (!formData.category_id) newErrors.category_id = "Categoria é obrigatória.";

    const parsedPrice = parseFloat(formData.price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      newErrors.price = "Preço deve ser um número positivo.";
    }

    if (formData.has_addons && formData.addon_category_ids.length === 0) {
      newErrors.addon_category_ids = "Se o item possui adicionais, selecione ao menos uma categoria de adicional.";
    }
    return newErrors;
  }

  // Lidar com upload/remoção de imagem
  const handleImageUpload = (file: File) => {
    setImageFile(file);
    handleManualChange('image_url', URL.createObjectURL(file)); 
  };

  const handleImageRemove = () => {
    setImageFile(null);
    handleManualChange('image_url', ""); 
  };

  const handleHasAddonsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleManualChange('has_addons', event.target.checked);
    if (!event.target.checked) {
      handleManualChange('addon_category_ids', []); 
    }
  };

  const handleAddonCategorySelectionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    const currentAddonIds = values.addon_category_ids;

    if (checked) {
      handleManualChange('addon_category_ids', [...currentAddonIds, value]);
    } else {
      handleManualChange('addon_category_ids', currentAddonIds.filter(id => id !== value));
    }
  };

  const submitForm = async () => {
    const data = new FormData();
    data.append("name", values.name);
    data.append("category_id", values.category_id);
    data.append("price", parseFloat(values.price).toFixed(2)); 
    data.append("description", values.description || "");
    data.append("available", values.available.toString());
    data.append("has_addons", values.has_addons.toString());

    if (values.has_addons && values.addon_category_ids) {
      values.addon_category_ids.forEach(id => {
        data.append("addon_category_ids[]", id); 
      });
    }

    if (imageFile) {
      data.append("image", imageFile); 
    } else if (values.image_url === "" && initialData?.image_url) {
      data.append("remove_image", "true"); 
    }

    await onSubmit(data); 
  };

  return (
    <Box component="form" onSubmit={handleSubmit(submitForm)} sx={{ p: 2 }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Nome do Item"
            name="name"
            value={values.name}
            onChange={handleChange}
            margin="normal"
            required
            error={!!errors.name}
            helperText={errors.name}
          />
          <FormControl fullWidth margin="normal" required error={!!errors.category_id}>
            <InputLabel id="category-select-label">Categoria</InputLabel>
            <Select
              labelId="category-select-label"
              name="category_id"
              value={values.category_id}
              onChange={handleChange}
              label="Categoria"
              MenuProps={{ PaperProps: { sx: { maxHeight: 200 } } }} // Limita altura do menu
            >
              {categories.length === 0 ? (
                <MenuItem value="" disabled>
                  Nenhuma categoria disponível
                </MenuItem>
              ) : (
                categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))
              )}
            </Select>
            {errors.category_id && <Typography color="error" variant="caption">{errors.category_id}</Typography>}
          </FormControl>
          <TextField
            fullWidth
            label="Preço (R$)"
            name="price"
            value={values.price}
            onChange={handleChange}
            margin="normal"
            type="number"
            inputProps={{ min: 0, step: 0.01 }}
            required
            error={!!errors.price}
            helperText={errors.price}
          />
          <TextField
            fullWidth
            label="Descrição"
            name="description"
            value={values.description}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={4}
          />
          <FormControlLabel
            control={
              <Switch
                checked={values.available}
                onChange={(e) => handleManualChange('available', e.target.checked)}
                color="primary"
              />
            }
            label="Disponível"
            sx={{ mt: 2 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={values.has_addons}
                onChange={handleHasAddonsChange}
                color="primary"
              />
            }
            label="Possui Adicionais"
            sx={{ mt: 2 }}
          />

          {values.has_addons && (
            <Box sx={{ mt: 2, border: '1px solid', borderColor: errors.addon_category_ids ? 'error.main' : 'grey.300', borderRadius: 1, p: 2 }}>
              <FormLabel component="legend" error={!!errors.addon_category_ids}>
                Categorias de Adicionais para este Item:
              </FormLabel>
              <FormGroup>
                {addonCategories.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Nenhuma categoria de adicional cadastrada. Crie uma na aba "Adicionais".
                  </Typography>
                ) : (
                  addonCategories.map(cat => (
                    <FormControlLabel
                      key={cat.id}
                      control={
                        <Checkbox
                          checked={values.addon_category_ids.includes(String(cat.id))}
                          onChange={handleAddonCategorySelectionChange}
                          value={String(cat.id)}
                        />
                      }
                      label={cat.name}
                    />
                  ))
                )}
              </FormGroup>
              {errors.addon_category_ids && <Typography color="error" variant="caption">{errors.addon_category_ids}</Typography>}
            </Box>
          )}
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="subtitle1" gutterBottom>
            Imagem do Item
          </Typography>
          <ImageUpload
            onImageUpload={handleImageUpload}
            onImageRemove={handleImageRemove}
            previewUrl={values.image_url}
            isUploading={isSaving} 
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Adicione uma imagem atraente do seu produto para melhorar as vendas.
            Recomendamos imagens com fundo claro e boa iluminação.
          </Typography>
        </Grid>
      </Grid>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button onClick={onCancel} color="inherit" sx={{ mr: 1 }} disabled={isSaving}>
          Cancelar
        </Button>
        <Button type="submit" variant="contained" color="primary" disabled={isSaving || !isDirty}>
          {isSaving ? "Salvando..." : "Salvar"}
        </Button>
      </Box>
    </Box>
  );
};

export default MenuItemForm;