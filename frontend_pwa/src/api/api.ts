// frontend_pwa/src/api/api.ts
import axios, { type AxiosInstance, type AxiosError } from 'axios';
import AuthService from '../modules/shared/services/AuthService'; 

import { 
  type Store, type Address, type DeliveryArea, type MenuItem, 
  type Category, type Order, type OrderCreateItem, type OrderFilters, 
  type AddonCategory, type AddonOption, type MenuItemFormData, 
  type UserProfile, type AuthResponse, type UserLoginData, type UserRegisterData,
  type BotMessage, type BotMessageFormData, type CartItemData, type CartUpdateItem,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = AuthService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    let errorMessage: string = 'Ocorreu um erro inesperado. Por favor, tente novamente.';
    if (error.response) {
      const { data, status } = error.response;
      if (typeof data === 'object' && data !== null && 'message' in data) {
        errorMessage = (data as { message: string }).message;
      } else if (typeof data === 'string') {
        errorMessage = data;
      }
      
      switch (status) {
        case 400:
          errorMessage = errorMessage || 'Requisição inválida. Verifique os dados fornecidos.';
          if (typeof data === 'object' && data !== null && 'errors' in data) {
            const validationErrors = (data as { errors: { [key: string]: string[] } }).errors;
            const detailedErrors = Object.values(validationErrors).flat().join('; ');
            if (detailedErrors) {
                errorMessage += `: ${detailedErrors}`;
            }
          }
          break;
        case 401:
          errorMessage = errorMessage || 'Não autorizado. Por favor, faça login novamente.';
          AuthService.logout();
          window.location.href = '/login';
          break;
        case 403:
          errorMessage = errorMessage || 'Acesso negado. Você não tem permissão para esta ação.';
          break;
        case 404:
          errorMessage = errorMessage || 'Recurso não encontrado.';
          break;
        case 409:
          errorMessage = errorMessage || 'Conflito. O recurso já existe ou há um problema de concorrência.';
          break;
        case 422:
          errorMessage = errorMessage || 'Dados inválidos. Por favor, revise suas entradas.';
           if (typeof data === 'object' && data !== null && 'errors' in data) {
            const validationErrors = (data as { errors: { [key: string]: string[] } }).errors;
            const detailedErrors = Object.values(validationErrors).flat().join('; ');
            if (detailedErrors) {
                errorMessage += `: ${detailedErrors}`;
            }
          }
          break;
        case 500:
          errorMessage = errorMessage || 'Erro interno do servidor. Tente novamente mais tarde.';
          break;
        case 503:
          errorMessage = errorMessage || 'Serviço indisponível. Tente novamente mais tarde.';
          break;
        default:
          errorMessage = errorMessage || `Erro do servidor: ${status}.`;
          break;
      }
    } else if (error.request) {
      errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão de internet.';
    } else {
      errorMessage = error.message;
    }
    return Promise.reject(new Error(errorMessage)); 
  }
);

const apiFormDataClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
  },
});

apiFormDataClient.interceptors.request.use(
  (config) => {
    const token = AuthService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiFormDataClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    let errorMessage: string = 'Ocorreu um erro no upload. Por favor, tente novamente.';
    if (error.response) {
      const { data } = error.response;
      if (typeof data === 'object' && data !== null && 'message' in data) {
        errorMessage = (data as { message: string }).message;
      } else if (typeof data === 'string') {
        errorMessage = data;
      }
    } else if (error.request) {
      errorMessage = 'Não foi possível conectar ao servidor para upload. Verifique sua conexão.';
    } else {
      errorMessage = error.message;
    }
    return Promise.reject(new Error(errorMessage));
  }
);


const api = {
  clientLogin: async (data: UserLoginData): Promise<AuthResponse> => {
    const response = await apiClient.post('auth/login', data);
    return response.data;
  },

  clientRegister: async (data: UserRegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post('auth/register', data);
    return response.data;
  },

  adminLogin: async (data: UserLoginData): Promise<AuthResponse> => {
    const response = await apiClient.post('auth/admin', data);
    return response.data;
  },

  forgotPassword: async (email: string): Promise<any> => {
    const response = await apiClient.post('auth/forgot_password', { email });
    return response.data;
  },

  resetPassword: async (token: string, new_password: string): Promise<any> => {
    const response = await apiClient.post('auth/reset_password', { token, new_password });
    return response.data;
  },

  getUserProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get('users/me');
    return response.data;
  },

  updateUserProfile: async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
    const response = await apiClient.put('users/me', profileData);
    return response.data;
  },

  getUserAddresses: async (): Promise<Address[]> => {
    const response = await apiClient.get('users/me/addresses');
    return response.data;
  },

  addUserAddress: async (addressData: Address): Promise<Address> => {
    const response = await apiClient.post('users/me/addresses', addressData);
    return response.data;
  },

  updateUserAddress: async (id: string, addressData: Partial<Address>): Promise<Address> => {
    const response = await apiClient.put(`users/me/addresses/${id}`, addressData);
    return response.data;
  },

  deleteUserAddress: async (id: string): Promise<void> => {
    await apiClient.delete(`users/me/addresses/${id}`);
  },

  setPrimaryAddress: async (id: string): Promise<Address> => {
    const response = await apiClient.patch(`users/me/addresses/${id}/set_primary`);
    return response.data;
  },

  getMenuItems: async (filters?: { category_id?: string; available?: boolean; name?: string }): Promise<MenuItem[]> => {
    const params = new URLSearchParams();
    if (filters?.category_id) params.append("category_id", filters.category_id);
    if (filters?.available !== undefined) params.append("disponivel", String(filters.available));
    if (filters?.name) params.append("name", filters.name);
    const response = await apiClient.get(`menu_items?${params.toString()}`);
    return response.data;
  },

  getMenuItemById: async (id: string): Promise<MenuItem> => {
    const response = await apiClient.get(`menu_items/${id}`);
    return response.data;
  },

  createMenuItem: async (formData: FormData): Promise<MenuItem> => {
    const response = await apiFormDataClient.post('menu_items/admin', formData);
    return response.data;
  },

  updateMenuItem: async (id: string, formData: FormData): Promise<MenuItem> => {
    const response = await apiFormDataClient.put(`menu_items/admin/${id}`, formData);
    return response.data;
  },

  deleteMenuItem: async (id: string): Promise<void> => {
    await apiClient.delete(`menu_items/admin/${id}`);
  },

  updateMenuItemAvailability: async (id: string, available: boolean): Promise<MenuItem> => {
    const response = await apiClient.patch(`menu_items/admin/${id}/availability`, { disponivel: available });
    return response.data;
  },

  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get('categories');
    return response.data;
  },

  createCategory: async (data: { name: string; description?: string }): Promise<Category> => {
    const response = await apiClient.post('categories', data);
    return response.data;
  },

  updateCategory: async (id: string, data: { name?: string; description?: string }): Promise<Category> => {
    const response = await apiClient.put(`categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await apiClient.delete(`categories/${id}`);
  },

  getAddonCategories: async (): Promise<AddonCategory[]> => {
    const response = await apiClient.get('addons/categories');
    return response.data;
  },

  createAddonCategory: async (data: { name: string; min_selections?: number; max_selections?: number; is_required?: boolean }): Promise<AddonCategory> => {
    const response = await apiClient.post('addons/categories', data);
    return response.data;
  },

  updateAddonCategory: async (id: string, data: { name?: string; min_selections?: number; max_selections?: number; is_required?: boolean }): Promise<AddonCategory> => {
    const response = await apiClient.put(`addons/categories/${id}`, data);
    return response.data;
  },

  deleteAddonCategory: async (id: string): Promise<void> => {
    await apiClient.delete(`addons/categories/${id}`);
  },

  createAddonOption: async (categoryId: string, data: { name: string; price: number }): Promise<AddonOption> => {
    const response = await apiClient.post(`addons/categories/${categoryId}/options`, data);
    return response.data;
  },

  updateAddonOption: async (id: string, data: { name?: string; price?: number }): Promise<AddonOption> => {
    const response = await apiClient.put(`addons/options/${id}`, data);
    return response.data;
  },

  deleteAddonOption: async (id: string): Promise<void> => {
    await apiClient.delete(`addons/options/${id}`);
  },

  createOrder: async (orderData: { address_id: number; payment_method: string; items: OrderCreateItem[]; cash_provided?: number }): Promise<Order> => {
    const response = await apiClient.post('orders', orderData);
    return response.data;
  },

  getClientOrders: async (filters?: OrderFilters): Promise<Order[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.data_inicio) params.append("data_inicio", filters.data_inicio);
    if (filters?.data_fim) params.append("data_fim", filters.data_fim);
    const response = await apiClient.get(`orders?${params.toString()}`);
    return response.data;
  },

  getClientOrderDetails: async (id: string): Promise<Order> => {
    const response = await apiClient.get(`orders/${id}`);
    return response.data;
  },

  cancelClientOrder: async (id: string): Promise<Order> => {
    const response = await apiClient.patch(`orders/${id}/cancel`);
    return response.data;
  },
  
  getItemsOrder: async (orderId: string): Promise<any[]> => {
    const response = await apiClient.get(`orders/order_items/${orderId}`);
    return response.data;
  },

  getAdminOrders: async (filters?: OrderFilters): Promise<Order[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.data_inicio) params.append("data_inicio", filters.data_inicio);
    if (filters?.data_fim) params.append("data_fim", filters.data_fim);
    if (filters?.cliente_id) params.append("cliente_id", filters.cliente_id);
    const response = await apiClient.get(`orders/admin?${params.toString()}`);
    return response.data;
  },

  getAdminOrderDetails: async (id: string): Promise<Order> => {
    const response = await apiClient.get(`orders/admin/${id}`);
    return response.data;
  },

  updateOrderStatus: async (id: string, newStatus: string): Promise<Order> => {
    const response = await apiClient.patch(`orders/admin/${id}/status`, { status: newStatus });
    return response.data;
  },

  approveOrderCancellationAdmin: async (id: string): Promise<Order> => {
    const response = await apiClient.patch(`orders/admin/${id}/approve_cancellation`);
    return response.data;
  },

  rejectOrderCancellationAdmin: async (id: string): Promise<Order> => {
    const response = await apiClient.patch(`orders/admin/${id}/reject_cancellation`);
    return response.data;
  },

  printOrder: async (orderId: string): Promise<Blob> => {
    const response = await apiClient.get(`orders/admin/${orderId}/print`, {
      responseType: 'blob',
      headers: {
        'Accept': 'application/pdf'
      }
    });
    return response.data;
  },

  getDashboardResumeOrders: async (dateFilter?: string): Promise<{ status_counts: { [key: string]: number }; filter_date: string; daily_total_amount: number }> => {
    const params = new URLSearchParams();
    if (dateFilter) params.append("order_date", dateFilter);
    const response = await apiClient.get(`admin/dashboard/metrics?${params.toString()}`);
    return response.data;
  },

  getBotMessages: async (): Promise<BotMessage[]> => {
    const response = await apiClient.get('bot_messages');
    return response.data;
  },

  getAllBotMessagesAdmin: async (): Promise<BotMessage[]> => {
    const response = await apiClient.get('bot_messages/admin');
    return response.data;
  },

  createBotMessage: async (data: BotMessageFormData): Promise<BotMessage> => {
    const response = await apiClient.post('bot_messages/admin', data);
    return response.data;
  },

  updateBotMessage: async (id: string, data: Partial<BotMessageFormData>): Promise<BotMessage> => {
    const response = await apiClient.put(`bot_messages/admin/${id}`, data);
    return response.data;
  },

  deleteBotMessage: async (id: string): Promise<void> => {
    await apiClient.delete(`bot_messages/admin/${id}`);
  },

  getMyStore: async (): Promise<Store | null> => {
    const response = await apiClient.get('admin/stores/me');
    return response.data.length > 0 ? response.data[0] : null;
  },

  createMyStore: async (storeData: Store): Promise<Store> => {
    const response = await apiClient.post('admin/stores/me', storeData);
    return response.data;
  },

  updateMyStore: async (storeData: Store): Promise<Store> => {
    const response = await apiClient.put('admin/stores/me', storeData);
    return response.data;
  },

  getDeliveryAreas: async (): Promise<DeliveryArea[]> => {
    const response = await apiClient.get('admin/delivery_areas');
    return response.data;
  },

  createDeliveryArea: async (data: { district_name: string; delivery_fee: number }): Promise<DeliveryArea> => {
    const response = await apiClient.post('admin/delivery_areas', data);
    return response.data;
  },

  updateDeliveryArea: async (id: string, data: { district_name?: string; delivery_fee?: number }): Promise<DeliveryArea> => {
    const response = await apiClient.put(`admin/delivery_areas/${id}`, data);
    return response.data;
  },

  deleteDeliveryArea: async (id: string): Promise<void> => {
    await apiClient.delete(`admin/delivery_areas/${id}`);
  },

  calculateDeliveryFee: async (addressId: string): Promise<{ delivery_fee: number; message?: string }> => {
    const response = await apiClient.post('delivery_fee/calculate', { address_id: addressId });
    return response.data;
  },
};

export default api;