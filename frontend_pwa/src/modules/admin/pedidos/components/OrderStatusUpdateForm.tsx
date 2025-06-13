// frontend_pwa/src/modules/admin/pedidos/components/OrderStatusUpdateForm.tsx
import React, { useEffect } from 'react';
import {
  TextField, Button, Box, CircularProgress, FormControl, InputLabel, Select, MenuItem, Typography,
  Chip
} from '@mui/material';
import { useForm } from '../../../../hooks/useForm';
import { OrderStatus, OrderStatusMapping } from '../../../../types';

interface OrderStatusUpdateFormProps {
  currentStatus: OrderStatus;
  onSubmit: (newStatus: OrderStatus) => Promise<void>;
  onCancel: () => void;
  isUpdating: boolean;
}

interface OrderStatusFormData {
  status: OrderStatus;
}

const OrderStatusUpdateForm: React.FC<OrderStatusUpdateFormProps> = ({
  currentStatus, onSubmit, onCancel, isUpdating
}) => {
  const initialFormState: OrderStatusFormData = { status: currentStatus };
  const { values, handleChange, handleSubmit, setAllValues, isDirty, errors } = useForm<OrderStatusFormData>(initialFormState);

  useEffect(() => {
    setAllValues({ status: currentStatus });
  }, [currentStatus, setAllValues]);

  const submitForm = async () => {
    await onSubmit(values.status);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
  e.preventDefault(); 
  submitForm(); 
};


  return (
    <Box component="form" onSubmit={handleFormSubmit} sx={{ p: 2 }}>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Status atual: <Chip label={OrderStatusMapping[currentStatus]} color="info" size="small" />
      </Typography>
      <FormControl fullWidth margin="normal">
        <InputLabel id="status-select-label">Novo Status</InputLabel>
        <Select
          labelId="status-select-label"
          name="status"
          value={values.status}
          onChange={handleChange}
          label="Novo Status"
        >
          {Object.entries(OrderStatusMapping).map(([key, value]) => (
            <MenuItem key={key} value={key} disabled={key === currentStatus || key === OrderStatus.SOLICITADO_CANCELAMENTO}>
              {value}
            </MenuItem>
          ))}
        </Select>
        {errors.status && <Typography color="error" variant="caption">{errors.status}</Typography>}
      </FormControl>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button onClick={onCancel} color="inherit" sx={{ mr: 1 }} disabled={isUpdating}>
          Cancelar
        </Button>
        <Button type="submit" variant="contained" color="primary" disabled={isUpdating || !isDirty}>
          {isUpdating ? <CircularProgress size={24} /> : 'Atualizar Status'}
        </Button>
      </Box>
    </Box>
  );
};

export default OrderStatusUpdateForm;