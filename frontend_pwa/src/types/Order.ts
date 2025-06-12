// frontend_pwa/src/types/Order.ts
import { type AddonOption } from './Addon';
import { type UserProfile } from './User';
import { type Address } from './Address';

export interface OrderItem {
    id?: string;
    order_id?: string;
    menu_item_id: number;
    quantity: number;
    price_at_order_time: number;
    observations?: string;
    menu_item_name?: string; 
    menu_item_description?: string;
    selected_addons?: AddonOption[]; 
}

export interface OrderCreateItem {
    menu_item_id: number;
    quantity: number;
    observations?: string;
    selected_addons?: { id: number; name: string; price: number }[]; 
}

export interface Order {
    id: string;
    user_id: string;
    address_id: string;
    order_date: string;
    status: string;
    total_amount: number;
    payment_method: string;
    cash_provided?: number;
    created_at?: string;
    updated_at?: string;
    
    user?: UserProfile;
    address?: Address;
    items?: OrderItem[];
    user_name?: string; 
    user_email?: string; 
}

export interface OrderFilters {
    status?: string;
    data_inicio?: string; 
    data_fim?: string;   
    cliente_id?: string;
}

export interface CartItemData {
    id: number;
    name: string;
    quantity: number;
    price: number; 
    image_url?: string;
    category_name: string;
    observations?: string;
    selectedAddons?: AddonOption[];
    totalItemPrice: number;
}