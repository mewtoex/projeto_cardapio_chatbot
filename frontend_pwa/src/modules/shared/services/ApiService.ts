import AuthService from "./AuthService";
import {
  type Store,
  type Address,
  type DeliveryArea,
  type MenuItem,
  type Category,
  type Order,
  type OrderCreateItem,
  type OrderFilters,
  type AddonCategory,
  type AddonOption,
  type MenuItemFormData,
  type UserProfile
} from "../../../types";


const API_BASE_URL = "http://localhost:5000/api/";

const getAuthHeaders = () => {
  let token = AuthService.getToken();
  if (token && token.startsWith('"') && token.endsWith('"')) {
    token = token.slice(1, -1);
  }
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

const getAuthHeadersFormData = () => {
  let token = AuthService.getToken();
  if (token && token.startsWith('"') && token.endsWith('"')) {
    token = token.slice(1, -1);
  }
  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: response.statusText };
    }
    throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
  }
  if (response.status === 204) {
    return null;
  }
  return response.json();
};

const ApiService = {
  getMenuItems: async (filters?: { category_id?: string; available?: boolean; name?: string }): Promise<MenuItem[]> => {
    let url = `${API_BASE_URL}menu_items`;
    if (filters) {
      const params = new URLSearchParams();
      if (filters.category_id) params.append("category_id", filters.category_id);
      if (filters.available !== undefined) params.append("disponivel", String(filters.available));
      if (filters.name) params.append("name", filters.name);
      if (params.toString()) url += `?${params.toString()}`;
    }
    const response = await fetch(url, { headers: getAuthHeaders() });
    return handleResponse(response);
  },

  getMenuItemById: async (id_item: string): Promise<MenuItem> => {
    const response = await fetch(`${API_BASE_URL}menu_items/${id_item}`, { headers: getAuthHeaders() });
    return handleResponse(response);
  },

  createMenuItem: async (formData: FormData): Promise<MenuItem> => {
    const response = await fetch(`${API_BASE_URL}menu_items/admin`, {
      method: "POST",
      headers: getAuthHeadersFormData(),
      body: formData,
    });
    return handleResponse(response);
  },

  updateMenuItem: async (id_item: string, formData: FormData): Promise<MenuItem> => {
    const response = await fetch(`${API_BASE_URL}menu_items/admin/${id_item}`, {
      method: "PUT",
      headers: getAuthHeadersFormData(),
      body: formData,
    });
    return handleResponse(response);
  },

  deleteMenuItem: async (id_item: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/menu_items/admin/${id_item}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  updateMenuItemAvailability: async (id_item: string, available: boolean): Promise<MenuItem> => { // Admin
    const response = await fetch(`${API_BASE_URL}/menu_items/admin/${id_item}/availability`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ disponivel: available }),
    });
    return handleResponse(response);
  },

  // reorderMenuItems: async (reorderData: Array<{ id_item: string; nova_ordem: number }>) => { // Admin
  //   const response = await fetch(`${API_BASE_URL}/admin/menu_items/reordenar`, {
  //       method: "POST",
  //       headers: getAuthHeaders(),
  //       body: JSON.stringify(reorderData),
  //   });
  //   return handleResponse(response);
  // },

  getCategories: async (): Promise<Category[]> => {
    const response = await fetch(`${API_BASE_URL}categories`, { headers: getAuthHeaders() });
    return handleResponse(response);
  },

  getCategoryById_Admin: async (id_categoria: string): Promise<Category> => {
    const response = await fetch(`${API_BASE_URL}categories/${id_categoria}`, { headers: getAuthHeaders() });
    return handleResponse(response);
  },

  createCategory: async (data: { name: string; description?: string }): Promise<Category> => {
    const response = await fetch(`${API_BASE_URL}categories`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  updateCategory: async (id_categoria: string, data: { name?: string; description?: string }): Promise<Category> => {
    const response = await fetch(`${API_BASE_URL}categories/${id_categoria}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  deleteCategory: async (id_categoria: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}categories/${id_categoria}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  createOrder: async (orderData: { address_id: number; payment_method: string; items: OrderCreateItem[]; cash_provided?: number; total_amount: number }): Promise<Order> => {
    const response = await fetch(`${API_BASE_URL}orders`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData),
    });
    return handleResponse(response);
  },

  getClientOrders: async (filters?: OrderFilters): Promise<Order[]> => { // Client
    let url = `${API_BASE_URL}orders`;
    if (filters) {
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.data_inicio) params.append("data_inicio", filters.data_inicio);
      if (filters.data_fim) params.append("data_fim", filters.data_fim);
      if (params.toString()) url += `?${params.toString()}`;
    }
    const response = await fetch(url, { headers: getAuthHeaders() });
    return handleResponse(response);
  },

  getClientOrderById: async (id_pedido: string): Promise<Order> => {
    const response = await fetch(`${API_BASE_URL}orders/${id_pedido}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getAdminOrderById: async (id_pedido: string): Promise<Order> => {
    const response = await fetch(`${API_BASE_URL}orders/admin/${id_pedido}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getAdminOrders: async (filters?: OrderFilters): Promise<Order[]> => {
    let url = `${API_BASE_URL}orders/admin`;
    if (filters) {
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.data_inicio) params.append("data_inicio", filters.data_inicio);
      if (filters.data_fim) params.append("data_fim", filters.data_fim);
      if (filters.cliente_id) params.append("cliente_id", filters.cliente_id);
      if (params.toString()) url += `?${params.toString()}`;
    }
    const response = await fetch(url, { headers: getAuthHeaders() });
    return handleResponse(response);
  },

  getResumeOrders: async (): Promise<{ status_counts: { [key: string]: number }; filter_date: string; daily_total_amount: number }> => {
    let url = `${API_BASE_URL}admin/dashboard/metrics`;
    const response = await fetch(url, { headers: getAuthHeaders() });
    return handleResponse(response);
  },

  updateOrderStatus: async (id_pedido: string, status: string): Promise<Order> => {
    const response = await fetch(`${API_BASE_URL}orders/admin/${id_pedido}/status`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(response);
  },

  requestOrderCancellation_Client: async (id_pedido: string): Promise<Order> => {
    const response = await fetch(`${API_BASE_URL}/orders/${id_pedido}/cancel`, { 
      method: "PATCH",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  approveOrderCancellation_Admin: async (id_pedido: string): Promise<Order> => {
    const response = await fetch(`${API_BASE_URL}orders/admin/${id_pedido}/approve_cancellation`, { // Endpoint corrigido
      method: "PATCH",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  rejectOrderCancellation_Admin: async (id_pedido: string): Promise<Order> => {
    const response = await fetch(`${API_BASE_URL}orders/admin/${id_pedido}/reject_cancellation`, { // Endpoint corrigido
      method: "PATCH",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },


  getUserProfile: async (): Promise<UserProfile> => {
    const response = await fetch(`${API_BASE_URL}users/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  updateUserProfile: async (profileData: any): Promise<UserProfile> => {
    const response = await fetch(`${API_BASE_URL}users/me`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    return handleResponse(response);
  },

  getUserAddress: async (): Promise<Address[]> => {
    const response = await fetch(`${API_BASE_URL}users/me/addresses`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getItemsOrder: async (id_orden: string): Promise<any[]> => {
    const response = await fetch(`${API_BASE_URL}orders/order_items/${id_orden}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },


  addUserAddress: async (addressData: Address): Promise<Address> => {
    const response = await fetch(`${API_BASE_URL}users/me/addresses`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(addressData),
    });
    return handleResponse(response);
  },

  updateUserAddress: async (id_endereco: string, addressData: Partial<Address>): Promise<Address> => {
    const response = await fetch(`${API_BASE_URL}users/me/addresses/${id_endereco}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(addressData),
    });
    return handleResponse(response);
  },

  deleteUserAddress: async (id_endereco: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}users/me/addresses/${id_endereco}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  printOrder: async (orderId: string): Promise<Blob> => {
    const response = await fetch(`${API_BASE_URL}orders/admin/${orderId}/print`, {
      headers: {
        ...getAuthHeaders(),
        'Accept': 'application/pdf'
      }
    });
    if (!response.ok) {
      let errorData;
      try { errorData = await response.json(); } catch (e) { errorData = { message: response.statusText }; }
      throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
    }
    return response.blob();
  },

  getAddonCategories: async (): Promise<AddonCategory[]> => {
    const response = await fetch(`${API_BASE_URL}addons/categories`, { headers: getAuthHeaders() });
    return handleResponse(response);
  },

  createAddonCategory: async (data: { name: string; min_selections?: number; max_selections?: number; is_required?: boolean }): Promise<AddonCategory> => {
    const response = await fetch(`${API_BASE_URL}addons/categories`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  updateAddonCategory: async (id: string, data: { name?: string; min_selections?: number; max_selections?: number; is_required?: boolean }): Promise<AddonCategory> => {
    const response = await fetch(`${API_BASE_URL}addons/categories/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  deleteAddonCategory: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}addons/categories/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  createAddonOption: async (categoryId: string, data: { name: string; price: number }): Promise<AddonOption> => {
    const response = await fetch(`${API_BASE_URL}addons/categories/${categoryId}/options`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  updateAddonOption: async (id: string, data: { name?: string; price?: number }): Promise<AddonOption> => {
    const response = await fetch(`${API_BASE_URL}addons/options/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  deleteAddonOption: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}addons/options/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // NOVO: Rotas para Bot Messages
  getBotMessages: async (): Promise<any[]> => { 
    const response = await fetch(`${API_BASE_URL}bot_messages`, { headers: getAuthHeaders() });
    return handleResponse(response);
  },

  getAllBotMessagesAdmin: async (): Promise<any[]> => { 
    const response = await fetch(`${API_BASE_URL}bot_messages/admin`, { headers: getAuthHeaders() });
    return handleResponse(response);
  },

  createBotMessage: async (data: { command: string; response_text: string; is_active?: boolean }): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}bot_messages/admin`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  updateBotMessage: async (id: string, data: { command?: string; response_text?: string; is_active?: boolean }): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}bot_messages/admin/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  deleteBotMessage: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}bot_messages/admin/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getMyStore: async (): Promise<Store> => {
    const response = await fetch(`${API_BASE_URL}admin/stores/me`, { headers: getAuthHeaders() });
    return handleResponse(response);
  },

  createMyStore: async (storeData: Store): Promise<Store> => {
    const response = await fetch(`${API_BASE_URL}admin/stores/me`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(storeData),
    });
    return handleResponse(response);
  },

  updateMyStore: async (storeData: Store): Promise<Store> => {
    const response = await fetch(`${API_BASE_URL}admin/stores/me`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(storeData),
    });
    return handleResponse(response);
  },

  getDeliveryAreas: async (): Promise<DeliveryArea[]> => {
    const response = await fetch(`${API_BASE_URL}admin/delivery_areas`, { headers: getAuthHeaders() });
    return handleResponse(response);
  },

  createDeliveryArea: async (areaData: { district_name: string; delivery_fee: number }): Promise<DeliveryArea> => {
    const response = await fetch(`${API_BASE_URL}admin/delivery_areas`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(areaData),
    });
    return handleResponse(response);
  },

  updateDeliveryArea: async (id: string, areaData: { district_name?: string; delivery_fee?: number }): Promise<DeliveryArea> => {
    const response = await fetch(`${API_BASE_URL}admin/delivery_areas/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(areaData),
    });
    return handleResponse(response);
  },

  deleteDeliveryArea: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}admin/delivery_areas/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  calculateDeliveryFee: async (addressId: string): Promise<{ delivery_fee: number; message?: string }> => {
    const response = await fetch(`${API_BASE_URL}delivery_fee/calculate`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ address_id: addressId }),
    });
    return handleResponse(response);
  },

};

export default ApiService;