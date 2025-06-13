// frontend_pwa/src/hooks/useCart.ts
import { useState, useEffect, useCallback } from 'react';
import { type CartItemData, type AddonOption, type MenuItem } from '../types';

interface UseCartResult {
  cartItems: { [key: string]: CartItemData };
  addToCart: (item: MenuItem, quantity: number, observations?: string, selectedAddons?: AddonOption[]) => void;
  updateCartItemQuantity: (itemKey: string, newQuantity: number) => void;
  removeCartItem: (itemKey: string) => void;
  clearCart: () => void;
  getTotalCartItems: () => number;
  getCartSubtotal: () => number;
}

export function useCart(): UseCartResult {
  const [cartItems, setCartItems] = useState<{ [key: string]: CartItemData }>(() => {
    try {
      const savedCart = localStorage.getItem('cartItems');
      return savedCart ? JSON.parse(savedCart) : {};
    } catch (e) {
      console.error('Erro ao carregar carrinho do localStorage:', e);
      return {};
    }
  });

  // Salva no localStorage sempre que cartItems muda
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const calculateItemKey = useCallback((itemId: number, selectedAddons?: AddonOption[], observations?: string) => {
    // Cria uma chave única para o item no carrinho, incluindo ID, adicionais e observações
    const addonsHash = selectedAddons?.map(a => a.id).sort().join(',') || '';
    const observationsHash = observations ? observations.trim().slice(0, 50) : ''; // Limita o tamanho
    return `${itemId}-${addonsHash}-${observationsHash}`;
  }, []);

  const addToCart = useCallback((item: MenuItem, quantity: number, observations: string = '', selectedAddons: AddonOption[] = []) => {
    const addonsPrice = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
    const totalItemPricePerUnit = item.price + addonsPrice; // Preço de uma unidade com adicionais

    const itemToAdd: CartItemData = {
      id: item.id,
      name: item.name,
      price: item.price, // Preço base do item
      quantity: quantity,
      image_url: item.image_url,
      category_name: item.category_name,
      observations: observations.trim(),
      selectedAddons: selectedAddons,
      totalItemPrice: totalItemPricePerUnit, // Preço total de 1 unidade do item configurado
    };

    const itemKey = calculateItemKey(item.id, selectedAddons, observations);

    setCartItems(prev => {
      const newCart = { ...prev };
      if (newCart[itemKey]) {
        // Se o item (com a mesma configuração) já existe, apenas atualiza a quantidade
        newCart[itemKey] = {
          ...newCart[itemKey],
          quantity: newCart[itemKey].quantity + quantity,
        };
      } else {
        // Se é um novo item/configuração, adiciona
        newCart[itemKey] = itemToAdd;
      }
      return newCart;
    });
  }, [calculateItemKey]);

  const updateCartItemQuantity = useCallback((itemKey: string, newQuantity: number) => {
    setCartItems(prev => {
      const newCart = { ...prev };
      if (newCart[itemKey]) {
        if (newQuantity <= 0) {
          delete newCart[itemKey]; // Remove se a quantidade for 0 ou menos
        } else {
          newCart[itemKey] = { ...newCart[itemKey], quantity: newQuantity };
        }
      }
      return newCart;
    });
  }, []);

  const removeCartItem = useCallback((itemKey: string) => {
    setCartItems(prev => {
      const newCart = { ...prev };
      delete newCart[itemKey];
      return newCart;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartItems({});
  }, []);

  const getTotalCartItems = useCallback(() => {
    return Object.values(cartItems).reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  const getCartSubtotal = useCallback(() => {
    return Object.values(cartItems).reduce((sum, item) => sum + item.totalItemPrice * item.quantity, 0);
  }, [cartItems]);


  return {
    cartItems,
    addToCart,
    updateCartItemQuantity,
    removeCartItem,
    clearCart,
    getTotalCartItems,
    getCartSubtotal,
  };
}