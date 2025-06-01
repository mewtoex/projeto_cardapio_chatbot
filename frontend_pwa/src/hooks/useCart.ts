import { useState, useEffect, useCallback, useRef } from 'react';
import { useNotification } from '../contexts/NotificationContext'; 
import { AddonOption } from '../modules/client/pages/ClientMenuPage'; 

export interface ICartItem {
    id: number;
    name: string;
    quantity: number;
    price: number; // Preço base do item do menu
    image_url?: string;
    category_name: string;
    observations?: string;
    selectedAddons?: AddonOption[];
    totalItemPrice: number; 
}

const useCart = () => {
    const notification = useNotification();
    const isInitialMount = useRef(true);

    const [cartItems, setCartItems] = useState<{[key: string]: ICartItem}>(() => {
        try {
            const savedCart = localStorage.getItem('cartItems');
            return savedCart ? JSON.parse(savedCart) : {};
        } catch (e) {
            console.error('Erro ao inicializar carrinho do localStorage:', e);
            notification.showError('Erro ao carregar o carrinho salvo. Seu carrinho foi limpo.');
            return {};
        }
    });
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        try {
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
            window.dispatchEvent(new Event('storage'));
        } catch (e) {
            console.error('Erro ao salvar carrinho no localStorage:', e);
            notification.showError('Erro ao salvar alterações no carrinho.');
        }
    }, [cartItems, notification]);

    const generateItemKey = useCallback((item: Omit<ICartItem, 'quantity' | 'totalItemPrice'>) => {
        const addonsHash = item.selectedAddons?.map(a => a.id).sort().join(',') || '';
        const observationsHash = item.observations ? item.observations.slice(0, 50) : '';
        return `<span class="math-inline">\{item\.id\}\-</span>{addonsHash}-${observationsHash}`;
    }, []);

    const addItem = useCallback((itemData: Omit<ICartItem, 'quantity' | 'totalItemPrice'>, quantity: number, totalItemPrice: number) => {
        const itemKey = generateItemKey(itemData);
        setCartItems(prev => {
            const newCart = { ...prev };
            if (newCart[itemKey]) {
                newCart[itemKey].quantity += quantity;
            } else {
                newCart[itemKey] = { ...itemData, quantity, totalItemPrice };
            }
            notification.showSuccess(`${itemData.name} adicionado ao carrinho!`);
            return newCart;
        });
    }, [generateItemKey, notification]);

    const updateItemQuantity = useCallback((itemKey: string, newQuantity: number) => {
        setCartItems(prev => {
            const newCart = { ...prev };
            if (newQuantity <= 0) {
                delete newCart[itemKey];
                const removedItem = prev[itemKey];
                if (removedItem) {
                    notification.showInfo(`${removedItem.name} removido do carrinho.`);
                }
            } else if (newCart[itemKey]) {
                newCart[itemKey] = { ...newCart[itemKey], quantity: newQuantity };
                notification.showSuccess('Quantidade atualizada.');
            }
            return newCart;
        });
    }, [notification]);

    const removeItem = useCallback((itemKey: string) => {
        setCartItems(prev => {
            const newCart = { ...prev };
            const removedItem = prev[itemKey];
            delete newCart[itemKey];
            if (removedItem) {
                notification.showInfo(`${removedItem.name} removido do carrinho.`);
            }
            return newCart;
        });
    }, [notification]);

    const clearCart = useCallback(() => {
        setCartItems({});
        notification.showInfo('Carrinho limpo.');
    }, [notification]);

    const getTotalItems = useCallback(() => {
        return Object.values(cartItems).reduce((sum, item) => sum + item.quantity, 0);
    }, [cartItems]);

    const getSubtotal = useCallback(() => {
        return Object.values(cartItems).reduce((sum, item) => sum + item.totalItemPrice * item.quantity, 0);
    }, [cartItems]);

    return {
        cartItems: Object.values(cartItems), 
        addItem,
        updateItemQuantity,
        removeItem,
        clearCart,
        getTotalItems,
        getSubtotal,
        generateItemKey 
    };
};

export default useCart;