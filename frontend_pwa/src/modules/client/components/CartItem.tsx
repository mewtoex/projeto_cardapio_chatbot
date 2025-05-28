// src/modules/client/components/CartItem.tsx
import React from 'react';

interface CartItemProps {
  item: {
    id: number;
    name: string;
    quantity: number;
    price: number;
  };
  onUpdateQuantity: (itemId: number, newQuantity: number) => void;
  onRemoveItem: (itemId: number) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onUpdateQuantity, onRemoveItem }) => {
  return (
    <div style={{ border: '1px solid #eee', padding: '10px', marginBottom: '10px' }}>
      <h4>{item.name}</h4>
      <p>Preço Unitário: R$ {item.price.toFixed(2)}</p>
      <div>
        <label htmlFor={`quantity-${item.id}`}>Quantidade: </label>
        <input 
          type="number" 
          id={`quantity-${item.id}`} 
          value={item.quantity} 
          min="1" 
          onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value, 10))}
          style={{width: "50px", marginRight: "10px"}}
        />
      </div>
      <p>Subtotal: R$ {(item.price * item.quantity).toFixed(2)}</p>
      <button onClick={() => onRemoveItem(item.id)}>Remover</button>
    </div>
  );
};

export default CartItem;

