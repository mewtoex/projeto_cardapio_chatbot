import React from 'react';
import {
  FormControl, FormLabel, RadioGroup, FormControlLabel, Radio,
  Typography, Box, Chip
} from '@mui/material';
import { type Address } from '../../../types';
import { LocationOn as LocationOnIcon } from '@mui/icons-material';

interface AddressSelectionProps {
  addresses: Address[];
  selectedAddressId: string | null;
  onSelectAddress: (addressId: string) => void;
}

const AddressSelection: React.FC<AddressSelectionProps> = ({ addresses, selectedAddressId, onSelectAddress }) => {
  return (
    <FormControl component="fieldset" fullWidth>
      <FormLabel component="legend" sx={{ mb: 1 }}>
        Escolha um endereço de entrega:
      </FormLabel>
      {addresses.length === 0 ? (
        <Box sx={{ p: 2, border: '1px dashed grey', borderRadius: 1, textAlign: 'center' }}>
          <LocationOnIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Nenhum endereço cadastrado. Por favor, adicione um em seu perfil para prosseguir.
          </Typography>
        </Box>
      ) : (
        <RadioGroup
          name="selectedAddress"
          value={selectedAddressId}
          onChange={(e) => onSelectAddress(e.target.value)}
        >
          {addresses.map((address) => (
            <FormControlLabel
              key={address.id}
              value={String(address.id)}
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body1">{address.street}, {address.number}</Typography>
                    {address.is_primary && (
                      <Chip label="Principal" size="small" color="primary" sx={{ ml: 1, height: 20 }} />
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {address.district}, {address.city} - {address.state}
                    {address.complement && `, ${address.complement}`}
                  </Typography>
                </Box>
              }
              sx={{
                mb: 1,
                border: '1px solid',
                borderColor: selectedAddressId === String(address.id) ? 'primary.main' : 'grey.300',
                borderRadius: 1,
                p: 1.5,
                mr: 0,
                width: '100%',
                alignItems: 'flex-start',
              }}
            />
          ))}
        </RadioGroup>
      )}
    </FormControl>
  );
};

export default AddressSelection;