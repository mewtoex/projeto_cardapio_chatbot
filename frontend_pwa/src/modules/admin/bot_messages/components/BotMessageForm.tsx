// frontend_pwa/src/modules/admin/bot_messages/components/BotMessageForm.tsx
import React, { useEffect } from 'react';
import { TextField, Button, Box, CircularProgress, Typography } from '@mui/material';
import { useForm } from '../../../../hooks/useForm';
import { type BotMessage, type BotMessageFormData } from '../../../../types';

interface BotMessageFormProps {
  initialData?: BotMessage | null;
  onSubmit: (formData: BotMessageFormData) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

const initialFormState: BotMessageFormData = {
  command_keyword: "",
  response_text: "",
};

const BotMessageForm: React.FC<BotMessageFormProps> = ({
  initialData, onSubmit, onCancel, isSaving
}) => {
  const { values, handleChange, handleSubmit, setAllValues, isDirty, errors, setErrors } = useForm<BotMessageFormData>(initialFormState, validateForm);

  useEffect(() => {
    if (initialData) {
      setAllValues({
        command_keyword: initialData.command_keyword,
        response_text: initialData.response_text,
      });
    } else {
      setAllValues(initialFormState); // Reseta para o estado inicial para "nova mensagem"
    }
  }, [initialData, setAllValues]);

  function validateForm(formData: BotMessageFormData): { [key: string]: string } {
    const newErrors: { [key: string]: string } = {};
    if (!formData.command_keyword.trim()) {
      newErrors.command_keyword = "Comando/Palavra-chave é obrigatório.";
    }
    if (!formData.response_text.trim()) {
      newErrors.response_text = "Resposta é obrigatória.";
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
        label="Comando / Palavra-chave"
        name="command_keyword"
        value={values.command_keyword}
        onChange={handleChange}
        margin="normal"
        required
        error={!!errors.command_keyword}
        helperText={errors.command_keyword}
        placeholder="Ex: 'olá', 'cardápio', 'status pedido'"
      />
      <TextField
        fullWidth
        label="Texto da Resposta"
        name="response_text"
        value={values.response_text}
        onChange={handleChange}
        margin="normal"
        multiline
        rows={4}
        required
        error={!!errors.response_text}
        helperText={errors.response_text}
        placeholder="Ex: 'Olá! Em que posso ajudar?'"
      />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button onClick={onCancel} color="inherit" sx={{ mr: 1 }} disabled={isSaving}>
          Cancelar
        </Button>
        <Button type="submit" variant="contained" color="primary" disabled={isSaving || !isDirty}>
          {isSaving ? <CircularProgress size={24} /> : 'Salvar Mensagem'}
        </Button>
      </Box>
    </Box>
  );
};

export default BotMessageForm;