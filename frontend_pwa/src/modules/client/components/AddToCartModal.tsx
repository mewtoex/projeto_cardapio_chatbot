// frontend_pwa/src/modules/client/components/AddToCartModal.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, IconButton, TextField, Typography, Box,
  FormControl, FormLabel, RadioGroup, Radio, FormGroup, Checkbox,
} from '@mui/material';
import { Close as CloseIcon, Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { type MenuItem, type AddonCategory, type AddonOption } from '../../../types';
import { useNotification } from '../../../contexts/NotificationContext';
import { useCart } from '../../../hooks/useCart';

interface AddToCartModalProps {
  open: boolean;
  onClose: () => void;
  menuItem: MenuItem | null;
}

const AddToCartModal: React.FC<AddToCartModalProps> = ({ open, onClose, menuItem }) => {
  const notification = useNotification();
  const { addToCart } = useCart();

  const [itemObservations, setItemObservations] = useState<string>('');
  // selectedAddons armazena um objeto onde a chave é o categoryId e o valor é um array de AddonOption selecionadas
  const [selectedAddons, setSelectedAddons] = useState<{ [categoryId: string]: AddonOption[] }>({});
  const [currentItemQuantity, setCurrentItemQuantity] = useState(1);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  // Resetar o estado do modal quando um novo item é aberto
  useEffect(() => {
    if (menuItem) {
      setItemObservations('');
      setCurrentItemQuantity(1);
      setSelectedAddons({});
      setValidationErrors({});

      // Pré-selecionar adicionais obrigatórios se houver min_selections > 0 e for 'radio' (max_selections = 1)
      menuItem.addon_categories?.forEach(cat => {
        if (cat.is_required && cat.max_selections === 1 && cat.options.length > 0) {
          // Seleciona a primeira opção como padrão se for obrigatório e de seleção única
          setSelectedAddons(prev => ({
            ...prev,
            [cat.id]: [cat.options[0]]
          }));
        }
      });
    }
  }, [menuItem]);

  // Lidar com a seleção de adicionais (checkbox ou radio)
  const handleAddonSelectionChange = useCallback((categoryId: string, option: AddonOption, type: 'checkbox' | 'radio') => {
    setSelectedAddons(prev => {
      const currentCategorySelections = prev[categoryId] || [];
      let newSelections: AddonOption[] = [];
      const addonCategory = menuItem?.addon_categories?.find(cat => cat.id === categoryId);

      if (!addonCategory) return prev; // Retorna o estado anterior se a categoria não for encontrada

      if (type === 'checkbox') {
        if (currentCategorySelections.some(s => s.id === option.id)) {
          // Remover se já selecionado
          newSelections = currentCategorySelections.filter(s => s.id !== option.id);
        } else {
          // Adicionar se não selecionado, verificando o limite máximo
          if (addonCategory.max_selections > 0 && currentCategorySelections.length >= addonCategory.max_selections) {
            notification.showWarning(`Você pode selecionar no máximo ${addonCategory.max_selections} opção(ões) para "${addonCategory.name}".`);
            return prev; // Não permite adicionar se o limite for atingido
          }
          newSelections = [...currentCategorySelections, option];
        }
      } else { // type === 'radio' (seleção única)
        newSelections = [option];
      }

      // Limpar erros de validação para esta categoria ao mudar a seleção
      setValidationErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[categoryId];
        return newErrors;
      });

      return {
        ...prev,
        [categoryId]: newSelections
      };
    });
  }, [menuItem, notification]); // Adicionado menuItem e notification nas dependências

  // Calcular o preço total dos adicionais selecionados
  const calculateAddonsPrice = useCallback(() => {
    let price = 0;
    Object.values(selectedAddons).forEach(options => {
      options.forEach(option => {
        price += option.price;
      });
    });
    return price;
  }, [selectedAddons]);

  const handleAddQuantity = () => {
    setCurrentItemQuantity(prev => prev + 1);
  };

  const handleRemoveQuantity = () => {
    setCurrentItemQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  const handleAddToCart = () => {
    if (!menuItem) return;

    let isValid = true;
    const newValidationErrors: { [key: string]: string } = {};

    // Validar adicionais obrigatórios e limites de seleção
    menuItem.addon_categories?.forEach(cat => {
      const currentSelections = selectedAddons[cat.id] || [];
      if (cat.is_required && currentSelections.length < cat.min_selections) {
        newValidationErrors[cat.id] = `Selecione no mínimo ${cat.min_selections} opção(ões) para "${cat.name}".`;
        isValid = false;
      }
      if (cat.max_selections > 0 && currentSelections.length > cat.max_selections) {
        newValidationErrors[cat.id] = `Selecione no máximo ${cat.max_selections} opção(ões) para "${cat.name}".`;
        isValid = false;
      }
    });

    setValidationErrors(newValidationErrors);

    if (!isValid) {
      notification.showError("Verifique as seleções de adicionais obrigatórias ou excedentes.");
      return;
    }

    // Adicionar item ao carrinho
    addToCart(menuItem, currentItemQuantity, itemObservations, Object.values(selectedAddons).flat());
    notification.showSuccess(`${currentItemQuantity}x ${menuItem.name} adicionado(s) ao carrinho!`);
    onClose();
  };

  if (!menuItem) return null;

  // Calcula o preço total considerando a quantidade e os adicionais
  const totalItemPrice = (menuItem.price + calculateAddonsPrice()) * currentItemQuantity;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {menuItem.name}
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {menuItem.description}
          </Typography>

          <TextField
            fullWidth
            label="Observações (opcional)"
            multiline
            rows={2}
            value={itemObservations}
            onChange={(e) => setItemObservations(e.target.value)}
            sx={{ mb: 3 }}
          />

          {menuItem.has_addons && menuItem.addon_categories && menuItem.addon_categories.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Adicionais
              </Typography>
              {menuItem.addon_categories.map(cat => (
                <FormControl 
                  component="fieldset" 
                  fullWidth 
                  key={cat.id} 
                  sx={{ mb: 2, border: '1px solid', borderColor: validationErrors[cat.id] ? 'error.main' : 'grey.300', p: 1, borderRadius: 1 }}
                  error={!!validationErrors[cat.id]}
                >
                  <FormLabel component="legend" error={!!validationErrors[cat.id]}>
                    {cat.name} ({cat.is_required ? 'Obrigatório' : 'Opcional'}
                    {cat.max_selections > 0 ? `, máx: ${cat.max_selections}` : ''})
                  </FormLabel>
                  {validationErrors[cat.id] && (
                    <Typography color="error" variant="caption" sx={{ ml: 1 }}>
                      {validationErrors[cat.id]}
                    </Typography>
                  )}
                  {cat.max_selections === 1 ? ( // Renderiza como Radio se for seleção única
                    <RadioGroup
                      value={selectedAddons[cat.id]?.[0]?.id || ''}
                      onChange={(e) => {
                        const selectedOption = cat.options.find(opt => String(opt.id) === e.target.value);
                        if (selectedOption) {
                          handleAddonSelectionChange(cat.id, selectedOption, 'radio');
                        }
                      }}
                    >
                      {cat.options.map(option => (
                        <FormControlLabel
                          key={option.id}
                          value={String(option.id)}
                          control={<Radio />}
                          label={`${option.name} (R$ ${option.price.toFixed(2)})`}
                        />
                      ))}
                    </RadioGroup>
                  ) : ( // Renderiza como Checkbox para múltiplas seleções
                    <FormGroup>
                      {cat.options.map(option => (
                        <FormControlLabel
                          key={option.id}
                          control={
                            <Checkbox
                              checked={selectedAddons[cat.id]?.some(s => s.id === option.id) || false}
                              onChange={() => handleAddonSelectionChange(cat.id, option, 'checkbox')}
                            />
                          }
                          label={`${option.name} (R$ ${option.price.toFixed(2)})`}
                        />
                      ))}
                    </FormGroup>
                  )}
                </FormControl>
              ))}
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton onClick={handleRemoveQuantity} disabled={currentItemQuantity <= 1}>
                <RemoveIcon />
              </IconButton>
              <Typography variant="h6" sx={{ mx: 2 }}>
                {currentItemQuantity}
              </Typography>
              <IconButton onClick={handleAddQuantity}>
                <AddIcon />
              </IconButton>
            </Box>
            <Typography variant="h5" color="primary">
              Total: R$ {totalItemPrice.toFixed(2)}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleAddToCart}
          startIcon={<AddIcon />}
        >
          Adicionar ao Carrinho
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddToCartModal;