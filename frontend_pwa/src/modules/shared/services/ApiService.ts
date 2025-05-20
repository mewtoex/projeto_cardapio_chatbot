// src/modules/shared/services/ApiService.ts
import AuthService from "./AuthService"; // Supondo que AuthService.ts está no mesmo diretório e exporta getToken

const API_BASE_URL = "http://localhost:5000/api/"; // Atualizado para /api/v1

const getAuthHeaders = () => {
  const token = AuthService.getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

const getAuthHeadersFormData = () => {
  const token = AuthService.getToken();
  const headers: HeadersInit = {}; // Content-Type é definido automaticamente pelo browser para FormData
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
  if (response.status === 204) { // No Content
    return null;
  }
  return response.json();
};

const ApiService = {
  getMenuItems: async (filters?: { categoria_id?: string; disponivel?: boolean; nome?: string }) => {
    let url = `${API_BASE_URL}menu_items`;
    if (filters) {
      const params = new URLSearchParams();
      if (filters.categoria_id) params.append("categoria_id", filters.categoria_id);
      if (filters.disponivel !== undefined) params.append("disponivel", String(filters.disponivel));
      if (filters.nome) params.append("nome", filters.nome);
      if (params.toString()) url += `?${params.toString()}`;
    }
    const response = await fetch(url, { headers: getAuthHeaders() });
    return handleResponse(response);
  },

  getMenuItemById: async (id_item: string) => {
    const response = await fetch(`${API_BASE_URL}/menu_items/${id_item}`, { headers: getAuthHeaders() });
    return handleResponse(response);
  },

  createMenuItem: async (formData: FormData) => { // Admin
    const response = await fetch(`${API_BASE_URL}/admin/menu_items`, {
      method: "POST",
      headers: getAuthHeadersFormData(),
      body: formData,
    });
    return handleResponse(response);
  },

  updateMenuItem: async (id_item: string, formData: FormData) => { // Admin
    const response = await fetch(`${API_BASE_URL}/admin/menu_items/${id_item}`, {
      method: "PUT",
      headers: getAuthHeadersFormData(),
      body: formData,
    });
    return handleResponse(response);
  },

  deleteMenuItem: async (id_item: string) => { // Admin
    const response = await fetch(`${API_BASE_URL}/admin/menu_items/${id_item}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  updateMenuItemAvailability: async (id_item: string, disponivel: boolean) => { // Admin
    const response = await fetch(`${API_BASE_URL}/admin/menu_items/${id_item}/disponibilidade`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ disponivel }),
    });
    return handleResponse(response);
  },

  reorderMenuItems: async (reorderData: Array<{ id_item: string; nova_ordem: number }>) => { // Admin
    const response = await fetch(`${API_BASE_URL}/admin/menu_items/reordenar`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(reorderData),
    });
    return handleResponse(response);
  },

  // Categories - /categorias
  getCategories: async () => {
    const response = await fetch(`${API_BASE_URL}categories`, { headers: getAuthHeaders() });
    return handleResponse(response);
  },

  getCategoryById_Admin: async (id_categoria: string) => { // Admin
    const response = await fetch(`${API_BASE_URL}/admin/categories/${id_categoria}`, { headers: getAuthHeaders() });
    return handleResponse(response);
  },

  createCategory: async (data: { nome: string; descricao?: string }) => { // Admin
    const response = await fetch(`${API_BASE_URL}/admin/categories`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  updateCategory: async (id_categoria: string, data: { nome: string; descricao?: string }) => { // Admin
    const response = await fetch(`${API_BASE_URL}/admin/categories/${id_categoria}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  deleteCategory: async (id_categoria: string) => { // Admin
    const response = await fetch(`${API_BASE_URL}/admin/categories/${id_categoria}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Orders - /pedidos
  createOrder: async (orderData: any) => { // Client
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData),
    });
    return handleResponse(response);
  },

  getClientOrders: async (filters?: { status?: string; data_inicio?: string; data_fim?: string }) => { // Client
    let url = `${API_BASE_URL}/pedidos/me`;
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

  getClientOrderById: async (id_pedido: string) => { // Client
    const response = await fetch(`${API_BASE_URL}/pedidos/me/${id_pedido}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
  
  getAdminOrderById: async (id_pedido: string) => { // Admin
    const response = await fetch(`${API_BASE_URL}/admin/pedidos/${id_pedido}`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getAdminOrders: async (filters?: { status?: string; data_inicio?: string; data_fim?: string; cliente_id?: string }) => { // Admin
    let url = `${API_BASE_URL}/admin/pedidos`;
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

  updateOrderStatus: async (id_pedido: string, status: string) => { // Admin
    const response = await fetch(`${API_BASE_URL}/admin/pedidos/${id_pedido}/status`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(response);
  },

  requestOrderCancellation_Client: async (id_pedido: string) => { // Client
    const response = await fetch(`${API_BASE_URL}/pedidos/me/${id_pedido}/solicitar-cancelamento`, {
      method: "PATCH",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  approveOrderCancellation_Admin: async (id_pedido: string) => { // Admin
    const response = await fetch(`${API_BASE_URL}/admin/pedidos/${id_pedido}/confirmar-cancelamento`, {
      method: "PATCH",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  rejectOrderCancellation_Admin: async (id_pedido: string) => { // Admin
    const response = await fetch(`${API_BASE_URL}/admin/pedidos/${id_pedido}/recusar-cancelamento`, {
      method: "PATCH",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Promotions - /promocoes
  getPromotions: async (filters?: { ativa?: boolean }) => {
    let url = `${API_BASE_URL}/promocoes`;
    if (filters) {
        const params = new URLSearchParams();
        if (filters.ativa !== undefined) params.append("ativa", String(filters.ativa));
        if (params.toString()) url += `?${params.toString()}`;
    }
    const response = await fetch(url, { headers: getAuthHeaders() });
    return handleResponse(response);
  },

  getPromotionById: async (id_promocao: string) => {
    const response = await fetch(`${API_BASE_URL}/promocoes/${id_promocao}`, { headers: getAuthHeaders() });
    return handleResponse(response);
  },

  createPromotion: async (promotionData: any) => { // Admin
    const response = await fetch(`${API_BASE_URL}/admin/promocoes`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(promotionData),
    });
    return handleResponse(response);
  },

  updatePromotion: async (id_promocao: string, promotionData: any) => { // Admin
    const response = await fetch(`${API_BASE_URL}/admin/promocoes/${id_promocao}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(promotionData),
    });
    return handleResponse(response);
  },

  deletePromotion: async (id_promocao: string) => { // Admin
    const response = await fetch(`${API_BASE_URL}/admin/promocoes/${id_promocao}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // User Profile (Client) - /clientes/me
  getUserProfile: async () => { // Client
    const response = await fetch(`${API_BASE_URL}/clientes/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  updateUserProfile: async (profileData: any) => { // Client
    const response = await fetch(`${API_BASE_URL}/clientes/me`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    return handleResponse(response);
  },

  addUserAddress: async (addressData: any) => { // Client
    const response = await fetch(`${API_BASE_URL}/clientes/me/enderecos`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(addressData),
    });
    return handleResponse(response);
  },

  updateUserAddress: async (id_endereco: string, addressData: any) => { // Client
    const response = await fetch(`${API_BASE_URL}/clientes/me/enderecos/${id_endereco}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(addressData),
    });
    return handleResponse(response);
  },

  deleteUserAddress: async (id_endereco: string) => { // Client
    const response = await fetch(`${API_BASE_URL}/clientes/me/enderecos/${id_endereco}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Admin: User Management - /admin/clientes
  getAdminUsers: async (filters?: { nome?: string; email?: string }) => { // Admin
    let url = `${API_BASE_URL}/admin/clientes`;
    if (filters) {
        const params = new URLSearchParams();
        if (filters.nome) params.append("nome", filters.nome);
        if (filters.email) params.append("email", filters.email);
        if (params.toString()) url += `?${params.toString()}`;
    }
    const response = await fetch(url, { headers: getAuthHeaders() });
    return handleResponse(response);
  },

  getAdminUserById: async (id_cliente: string) => { // Admin
    const response = await fetch(`${API_BASE_URL}/admin/clientes/${id_cliente}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  toggleUserActive_Admin: async (id_cliente: string) => { // Admin
    const response = await fetch(`${API_BASE_URL}/admin/clientes/${id_cliente}/toggle-active`, {
        method: "PUT", // Ou PATCH, dependendo da API real
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Admin: Dashboard - /admin/dashboard
  getAdminDashboardMetrics: async () => { // Admin
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/estatisticas`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

export default ApiService;

