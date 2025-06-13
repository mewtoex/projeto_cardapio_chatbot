// frontend_pwa/src/modules/client/components/PaymentMethodSelection.tsx
import React from 'react';
import {
  FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Typography, Box
} from '@mui/material';
import { CreditCard as CreditCardIcon, Money as MoneyIcon, Pix as PixIcon } from '@mui/icons-material';

interface PaymentMethodSelectionProps {
  selectedMethod: string | null;
  onSelectMethod: (method: string) => void;
}

const paymentMethods = [
  { value: 'cartao_credito', label: 'Cartão de Crédito', icon: <CreditCardIcon /> },
  { value: 'cartao_debito', label: 'Cartão de Débito', icon: <CreditCardIcon /> },
  { value: 'dinheiro', label: 'Dinheiro', icon: <MoneyIcon /> },
  { value: 'pix', label: 'Pix', icon: <PixIcon /> },
  // Adicione outros métodos de pagamento aqui
];

const PaymentMethodSelection: React.FC<PaymentMethodSelectionProps> = ({ selectedMethod, onSelectMethod }) => {
  return (
    <FormControl component="fieldset" fullWidth>
      <FormLabel component="legend" sx={{ mb: 1 }}>
        Escolha o método de pagamento:
      </FormLabel>
      <RadioGroup
        name="paymentMethod"
        value={selectedMethod}
        onChange={(e) => onSelectMethod(e.target.value)}
      >
        {paymentMethods.map((method) => (
          <FormControlLabel
            key={method.value}
            value={method.value}
            control={<Radio />}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {method.icon && <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>{method.icon}</Box>}
                <Typography variant="body1">{method.label}</Typography>
              </Box>
            }
            sx={{
              mb: 1,
              border: '1px solid',
              borderColor: selectedMethod === method.value ? 'secondary.main' : 'grey.300',
              borderRadius: 1,
              p: 1.5,
              mr: 0,
              width: '100%',
            }}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
};

export default PaymentMethodSelection;