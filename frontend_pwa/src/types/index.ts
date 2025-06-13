export interface User {
    id: number;
    email: string;
    name: string;
    phone: string;
    role: 'cliente' | 'admin';
}

export interface UserProfile extends User {
}

export interface UserLoginData {
    email: string;
    password: string;
}

export interface UserRegisterData {
    name: string;
    email: string;
    password: string;
    phone: string;
    address: string; 
}

export interface AuthResponse {
    access_token: string;
    user: User;
}

export interface Address_ {
    id: number;
    user_id: number;
    street: string;
    number: string;
    complement?: string;
    district_name: string;
    city: string;
    state: string;
    zip_code: string;
    is_primary: boolean;
}

export interface DeliveryArea {
    id: number;
    district_name: string;
    delivery_fee: number;
}

export interface Category {
    id: number;
    name: string;
    description?: string;
}

export interface AddonOption {
    id: number;
    addon_category_id: number;
    name: string;
    price: number;
}

export interface AddonCategory {
    id: number;
    name: string;
    min_selections: number;
    max_selections: number;
    is_required: boolean;
    options: AddonOption[];
}

export interface MenuItem {
    id: number;
    name: string;
    description?: string;
    price: number;
    image_url?: string;
    category_id: number;
    category_name: string; 
    available: boolean;
    has_addons: boolean;
    addon_categories?: AddonCategory[]; 
}

export interface MenuItemFormData {
    name: string;
    category_id: string; 
    price: string; 
    description: string;
    available: boolean;
    image_url: string; 
    has_addons: boolean;
    addon_category_ids: string[]; 
}

export interface BotMessageFormData {
    command_keyword: string;
    response_text: string;
}

export interface BotMessage {
    id: number;
    command_keyword: string;
    response_text: string;
}


export interface CartItemData {
    id: number; 
    name: string;
    price: number; 
    quantity: number;
    image_url?: string;
    category_name: string;
    observations: string;
    selectedAddons: AddonOption[];
    totalItemPrice: number; 
}

export interface CartUpdateItem {
    itemKey: string; 
    newQuantity: number;
}

export enum OrderStatus {
    PENDENTE = 'pendente',
    EM_PREPARO = 'em_preparo',
    A_CAMINHO = 'a_caminho',
    CONCLUIDO = 'concluido',
    CANCELADO = 'cancelado',
    SOLICITADO_CANCELAMENTO = 'solicitado_cancelamento', 
}

export const OrderStatusMapping: { [key in OrderStatus]: string } = {
  [OrderStatus.PENDENTE]: 'Pendente',
  [OrderStatus.EM_PREPARO]: 'Em Preparo',
  [OrderStatus.A_CAMINHO]: 'A Caminho',
  [OrderStatus.CONCLUIDO]: 'Concluído',
  [OrderStatus.CANCELADO]: 'Cancelado',
  [OrderStatus.SOLICITADO_CANCELAMENTO]: 'Cancelamento Solicitado',
};

export interface OrderItem {
    id: number;
    order_id: number;
    menu_item_id: number;
    menu_item_name: string;
    quantity: number;
    price: number;
    observations?: string;
    addon_options?: AddonOption[]; 
}

export interface OrderCreateItem {
    menu_item_id: number;
    quantity: number;
    observations?: string;
    addon_options_ids?: number[]; 
}

export interface Order {
    id: number;
    client_id: number;
    client_name: string;
    order_date: string; 
    status: OrderStatus;
    total_amount: number;
    payment_method: string;
    cash_provided?: number; 
    delivery_address: Address_ | null; 
    items: OrderItem[];
    delivery_fee?: number;
}

export interface OrderFilters {
    status?: string;
    data_inicio?: string;
    data_fim?: string;
    cliente_id?: string; 
}

export interface Store_ {
    id?: number; 
    name: string;
    address: string;
    phone: string;
    is_open: boolean;
    opening_hours: string; 
    avg_preparation_time_minutes: number;
}

export interface Promotion {
  id: number;
  name: string;
  description: string;
  discount_percentage: number;
  active: boolean;
}

export interface ProductPriceHistory {
  id: number;
  menu_item_id: number;
  old_price: number;
  new_price: number;
  change_date: string;
}
export * from './Auth';
export * from './User';
export * from './Address';
export * from './Category';
export * from './Addon';
export * from './Product';
export * from './Order';
export * from './Store';
export * from './Delivery';
export * from './BotMessage';
