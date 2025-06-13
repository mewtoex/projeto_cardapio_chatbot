
// frontend_pwa/src/modules/client/profile/components/AddressList.tsx
import React from 'react';
import {
  List, ListItem, ListItemText, ListItemSecondaryAction, IconButton,
  Typography, Box, Chip
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Star as StarIcon, StarBorder as StarBorderIcon } from '@mui/icons-material';
import { type Address } from '../../../../types';
import ConfirmationDialog from '../../../../components/ui/ConfirmationDialog'; // Para confirmação de exclusão

interface AddressListProps {
  addresses: Address[];
  onEdit: (address: Address) => void;
  onDelete: (addressId: string) => Promise<void>;
  onSetPrimary: (addressId: string) => Promise<void>;
}

const AddressList: React.FC<AddressListProps> = ({ addresses, onEdit, onDelete, onSetPrimary }) => {
  const [openConfirmDelete, setOpenConfirmDelete] = React.useState(false);
  const [addressToDeleteId, setAddressToDeleteId] = React.useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setAddressToDeleteId(id);
    setOpenConfirmDelete(true);
  };

  const confirmDelete = async () => {
    if (addressToDeleteId) {
      await onDelete(addressToDeleteId);
      setOpenConfirmDelete(false);
      setAddressToDeleteId(null);
    }
  };

  return (
    <Box>
      {addresses.length === 0 ? (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
          Nenhum endereço cadastrado.
        </Typography>
      ) : (
        <List>
          {addresses.map((address) => (
            <ListItem key={address.id} divider sx={{ py: 1.5 }}>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body1" component="span" sx={{ fontWeight: 'bold' }}>
                      {address.street}, {address.number}
                    </Typography>
                    {address.is_primary && (
                      <Chip
                        label="Principal"
                        size="small"
                        color="primary"
                        sx={{ ml: 1, height: 20 }}
                      />
                    )}
                  </Box>
                }
                secondary={
                  <>
                    <Typography variant="body2" color="text.secondary">
                      {address.district_name}, {address.city} - {address.state}, {address.zip_code}
                    </Typography>
                    {address.complement && (
                      <Typography variant="body2" color="text.secondary">
                        Complemento: {address.complement}
                      </Typography>
                    )}
                  </>
                }
              />
              <ListItemSecondaryAction>
                {!address.is_primary && (
                  <IconButton edge="end" aria-label="set primary" onClick={() => onSetPrimary(address.id.toString())}>
                    <StarBorderIcon color="action" />
                  </IconButton>
                )}
                <IconButton edge="end" aria-label="edit" onClick={() => onEdit(address)}>
                  <EditIcon color="primary" />
                </IconButton>
                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteClick(address.id.toString())}>
                  <DeleteIcon color="error" />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      <ConfirmationDialog
        open={openConfirmDelete}
        onClose={() => setOpenConfirmDelete(false)}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão de Endereço"
        message="Tem certeza que deseja remover este endereço? Esta ação não pode ser desfeita."
        confirmButtonText="Remover"
        confirmButtonColor="error"
      />
    </Box>
  );
};

export default AddressList;