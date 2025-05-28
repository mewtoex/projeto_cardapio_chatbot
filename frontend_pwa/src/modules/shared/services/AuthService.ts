// src/modules/shared/services/AuthService.ts

// Serviço de autenticação para chamadas à API
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const AuthService = {
  clientLogin: async (email, password ) => {
    try {
      console.log("Realizando login de cliente com:", email);
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { // Corrigido o endpoint para /auth/login
        email,
        password
      });
      
      const { access_token, user } = response.data;
      localStorage.setItem('authUser', JSON.stringify(user));
      localStorage.setItem('authToken', access_token); // Salvar como 'authToken' para consistência
      
      return response.data;
    } catch (error) {
      console.error("Erro no login de cliente:", error);
      throw error.response?.data?.message || "Erro ao realizar login. Verifique suas credenciais.";
    }
  },

  clientRegister: async (userData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
      // Se o registro já retorna user e access_token, pode-se usar diretamente
      const { access_token, user } = response.data;
      localStorage.setItem('authUser', JSON.stringify(user));
      localStorage.setItem('authToken', access_token); // Salvar como 'authToken'
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
      localStorage.setItem('authToken', access_token); // Salvar como 'authToken'
      return response.data;
    } catch (error) {
      console.error("Erro no login de administrador:", error);
      throw error.response?.data?.message || "Erro ao realizar login. Verifique suas credenciais.";
    }
  },

  logout: async () => {
    try {
      const token = localStorage.getItem('authToken'); // Usar 'authToken'
      if (token) {
        // Se houver um endpoint de logout no backend para invalidar o token
        // await axios.post(`${API_BASE_URL}/logout`, {}, {
        //   headers: {
        //     'Authorization': `Bearer ${token}`
        //   }
        // });
      }
      
      localStorage.removeItem('authUser');
      localStorage.removeItem('authToken'); // Remover 'authToken'
      
      return { message: "Logout realizado com sucesso" };
    } catch (error) {
      console.error("Erro ao realizar logout:", error);
      localStorage.removeItem('authUser');
      localStorage.removeItem('authToken');
      return { message: "Logout realizado localmente" };
    }
  },

  getToken: () => {
    return localStorage.getItem('authToken'); // Usar 'authToken'
  },

  getUser: () => {
    const userStr = localStorage.getItem('authUser');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('authToken'); // Usar 'authToken'
  },
  
  getAuthHeaders: () => {
    const token = localStorage.getItem('authToken'); // Usar 'authToken'
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
};

export default AuthService;