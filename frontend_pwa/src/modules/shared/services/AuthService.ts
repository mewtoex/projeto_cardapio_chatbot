// src/modules/shared/services/AuthService.ts

// Serviço de autenticação para chamadas à API
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const AuthService = {
  // Login de cliente com chamada real à API
  clientLogin: async (email, password ) => {
    try {
      console.log("Realizando login de cliente com:", email);
      const response = await axios.post(`${API_BASE_URL}/auth//login`, {
        email,
        password
      });
      
      // Se a requisição for bem-sucedida, armazena os dados no localStorage
      const { token, user } = response.data;
      localStorage.setItem('authUser', JSON.stringify(user));
      localStorage.setItem('authToken', token);
      
      return response.data;
    } catch (error) {
      console.error("Erro no login de cliente:", error);
      throw error.response?.data?.message || "Erro ao realizar login. Verifique suas credenciais.";
    }
  },

  // Registro de cliente com chamada real à API
  clientRegister: async (userData) => {
    try {
      console.log("Registrando novo cliente:", userData.email);
      const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
      return response.data;
    } catch (error) {
      console.error("Erro no registro de cliente:", error);
      throw error.response?.data?.message || "Erro ao registrar cliente. Verifique os dados informados.";
    }
  },

  // Login de administrador com chamada real à API
  adminLogin: async (email, password) => {
    try {
      console.log("Realizando login de administrador com:", email);
      const response = await axios.post(`${API_BASE_URL}/auth/admin`, {
        email,
        password
      });
      
      // Se a requisição for bem-sucedida, armazena os dados no localStorage
      const { token, user } = response.data;
      localStorage.setItem('authUser', JSON.stringify(user));
      localStorage.setItem('authToken', token);
      
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
      const token = localStorage.getItem('authToken');
      
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
      localStorage.removeItem('authToken');
      
      return { message: "Logout realizado com sucesso" };
    } catch (error) {
      console.error("Erro ao realizar logout:", error);
      
      // Mesmo com erro na API, remove os dados do localStorage para garantir logout local
      localStorage.removeItem('authUser');
      localStorage.removeItem('authToken');
      
      return { message: "Logout realizado localmente" };
    }
  },

  // Método para obter o token armazenado
  getToken: () => {
    return localStorage.getItem('authToken');
  },

  // Método para obter o usuário armazenado
  getUser: () => {
    const userStr = localStorage.getItem('authUser');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Verificar se o usuário está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },
  
  // Configurar cabeçalhos de autenticação para outras chamadas à API
  getAuthHeaders: () => {
    const token = localStorage.getItem('authToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
};

export default AuthService;