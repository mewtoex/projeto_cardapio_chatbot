export interface User {
    id: number;
    email: string;
    name: string;
    phone: string;
    role: 'cliente' | 'admin';
}

export interface UserProfile extends User {
  // Dados adicionais do perfil, se houver
  // ex: birthday: string;
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
    address: string; // Endereço inicial para o registro
}

export interface AuthResponse {
    access_token: string;
    user: User;
}

// --- Endereços ---
export interface Address {
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

// --- Cardápio e Itens ---
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
    category_name: string; // Adicionado para facilitar exibição
    available: boolean;
    has_addons: boolean;
    addon_categories?: AddonCategory[]; // Categorias de adicionais associadas a este item
}

// Tipo para dados de formulário de item de menu (inclui campos para FormData)
export interface MenuItemFormData {
    name: string;
    category_id: string; // string para o Select
    price: string; // string para o TextField
    description: string;
    available: boolean;
    image_url: string; // URL para preview
    has_addons: boolean;
    addon_category_ids: string[]; // IDs das categorias de adicionais selecionadas
}

// Tipo para dados de formulário de mensagem do bot
export interface BotMessageFormData {
    command_keyword: string;
    response_text: string;
}

export interface BotMessage {
    id: number;
    command_keyword: string;
    response_text: string;
}


// --- Carrinho ---
export interface CartItemData {
    id: number; // ID do MenuItem original
    name: string;
    price: number; // Preço base do MenuItem
    quantity: number;
    image_url?: string;
    category_name: string;
    observations: string;
    selectedAddons: AddonOption[];
    totalItemPrice: number; // Preço de uma unidade do item com os adicionais selecionados
}

export interface CartUpdateItem {
    itemKey: string; // Chave única do item no carrinho
    newQuantity: number;
}

// --- Pedidos ---
export enum OrderStatus {
    PENDENTE = 'pendente',
    EM_PREPARO = 'em_preparo',
    A_CAMINHO = 'a_caminho',
    CONCLUIDO = 'concluido',
    CANCELADO = 'cancelado',
    SOLICITADO_CANCELAMENTO = 'solicitado_cancelamento', // Novo status para solicitação de cancelamento pelo cliente
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
    price: number; // Preço unitário do item no momento do pedido
    observations?: string;
    addon_options?: AddonOption[]; // Adicionais específicos deste item no pedido
}

export interface OrderCreateItem {
    menu_item_id: number;
    quantity: number;
    observations?: string;
    addon_options_ids?: number[]; // IDs dos adicionais selecionados para este item
}

export interface Order {
    id: number;
    client_id: number;
    client_name: string;
    order_date: string; // ISO string
    status: OrderStatus;
    total_amount: number;
    payment_method: string;
    cash_provided?: number; // Valor em dinheiro dado pelo cliente para troco
    delivery_address: Address | null; // Pode ser nulo se for retirada
    items: OrderItem[];
    // Campos adicionais para o admin
    delivery_fee?: number;
    // ... outros campos que podem ser retornados pela API
}

export interface OrderFilters {
    status?: string;
    data_inicio?: string;
    data_fim?: string;
    cliente_id?: string; // Para filtro de admin
}

// --- Loja ---
export interface Store {
    id?: number; // Pode ser nulo se for uma nova loja sendo criada
    name: string;
    address: string;
    phone: string;
    is_open: boolean;
    opening_hours: string; // Ex: "09:00-23:00"
    avg_preparation_time_minutes: number;
    // ... outros dados da loja
}

// Você pode ter outros tipos aqui, como Promoção, Histórico de Preços, etc.
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
