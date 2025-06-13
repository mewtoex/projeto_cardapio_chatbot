// frontend_pwa/src/modules/client/components/CartItem.tsx
import React from 'react';
import { Box, Typography, IconButton, Card, CardContent, CardMedia, Grid, Chip } from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon, Delete as DeleteIcon, Image as ImageIcon } from '@mui/icons-material';
import { type CartItemData } from '../../../types';
import { useCart } from '../../../hooks/useCart'; // Usando o hook useCart

interface CartItemProps {
  item: CartItemData;
  itemKey: string; // A chave única do item no objeto cartItems
}

const CartItem: React.FC<CartItemProps> = ({ item, itemKey }) => {
  const { updateCartItemQuantity, removeCartItem } = useCart();

  const handleIncreaseQuantity = () => {
    updateCartItemQuantity(itemKey, item.quantity + 1);
  };

  const handleDecreaseQuantity = () => {
    updateCartItemQuantity(itemKey, item.quantity - 1);
  };

  const handleRemoveItem = () => {
    removeCartItem(itemKey);
  };

  return (
    <Card sx={{ display: 'flex', mb: 2, boxShadow: 1 }}>
      {item.image_url ? (
        <CardMedia
          component="img"
          sx={{ width: 100, height: 100, objectFit: 'cover' }}
          image={item.image_url}
          alt={item.name}
        />
      ) : (
        <Box sx={{ width: 100, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100' }}>
          <ImageIcon color="action" sx={{ fontSize: 50 }} />
        </Box>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <CardContent sx={{ flex: '1 0 auto' }}>
          <Typography component="div" variant="h6">
            {item.name}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            R$ {(item.totalItemPrice).toFixed(2)} / un.
          </Typography>
          {item.selectedAddons && item.selectedAddons.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Adicionais:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                {item.selectedAddons.map(addon => (
                  <Chip key={addon.id} label={`${addon.name} (R$ ${addon.price.toFixed(2)})`} size="small" variant="outlined" />
                ))}
              </Box>
            </Box>
          )}
          {item.observations && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Obs: {item.observations}
            </Typography>
          )}
        </CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={handleDecreaseQuantity} disabled={item.quantity <= 1}>
              <RemoveIcon />
            </IconButton>
            <Typography variant="subtitle1" sx={{ mx: 1 }}>
              {item.quantity}
            </Typography>
            <IconButton onClick={handleIncreaseQuantity}>
              <AddIcon />
            </IconButton>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" color="primary" sx={{ mr: 2 }}>
              R$ {(item.totalItemPrice * item.quantity).toFixed(2)}
            </Typography>
            <IconButton color="error" onClick={handleRemoveItem}>
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Card>
  );
};

export default CartItem;