// src/modules/shared/services/AuthService.ts

// Serviço de autenticação para chamadas à API
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const AuthService = {
  clientLogin: async (email, password ) => {
    try {
      console.log("Realizando login de cliente com:", email);
      const response = await axios.post(`${API_BASE_URL}/auth//login`, {
        email,
        password
      });
      
      const { access_token, user } = response.data;
      localStorage.setItem('authUser', JSON.stringify(user));
      localStorage.setItem('Token', access_token);
      
      return response.data;
    } catch (error) {
      console.error("Erro no login de cliente:", error);
      throw error.response?.data?.message || "Erro ao realizar login. Verifique suas credenciais.";
    }
  },

  clientRegister: async (userData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
      return response.data;
    } catch (error) {
      console.error("Erro no registro de cliente:", error);
      throw error.response?.data?.message || "Erro ao registrar cliente. Verifique os dados informados.";
    }
  },

  adminLogin: async (email, password) => {
    try {
      console.log("Realizando login de administrador com:", email);
      const response = await axios.post(`${API_BASE_URL}/auth/admin`, {
        email,
        password
      });
      console.log(response.data)
      const { access_token, user } = response.data;
      localStorage.setItem('authUser', JSON.stringify(user));
      localStorage.setItem('Token', JSON.stringify(access_token));
      return response.data;
    } catch (error) {
      console.error("Erro no login de administrador:", error);
      throw error.response?.data?.message || "Erro ao realizar login. Verifique suas credenciais.";
    }
  },

  // Logout com chamada real à API
  logout: async () => {
    try {
      // Obtém o token atual para enviar no cabeçalho da requisição
      const token = localStorage.getItem('Token');
      
      // Realiza a chamada à API para invalidar o token no backend
      if (token) {
        await axios.post(`${API_BASE_URL}/logout`, {}, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
      
      // Independente da resposta da API, remove os dados do localStorage
      localStorage.removeItem('authUser');
      localStorage.removeItem('Token');
      
      return { message: "Logout realizado com sucesso" };
    } catch (error) {
      console.error("Erro ao realizar logout:", error);
      
      // Mesmo com erro na API, remove os dados do localStorage para garantir logout local
      localStorage.removeItem('authUser');
      localStorage.removeItem('Token');
      
      return { message: "Logout realizado localmente" };
    }
  },

  // Método para obter o token armazenado
  getToken: () => {
    return localStorage.getItem('Token');
  },

  // Método para obter o usuário armazenado
  getUser: () => {
    const userStr = localStorage.getItem('authUser');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Verificar se o usuário está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem('Token');
  },
  
  // Configurar cabeçalhos de autenticação para outras chamadas à API
  getAuthHeaders: () => {
    const token = localStorage.getItem('Token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
};

export default AuthService;