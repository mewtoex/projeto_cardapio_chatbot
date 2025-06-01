import axios from 'axios';
import AuthService from '../modules/shared/services/AuthService'; 
import { useNotification } from '../contexts/NotificationContext'; 

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Sua URL base da API
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    let token = AuthService.getToken(); 
    if (token && typeof token === 'string' && token.startsWith('"') && token.endsWith('"')) {
      token = token.slice(1, -1); 
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('Erro da API:', error.response.status, error.response.data);
      if (error.response.status === 401) {
        AuthService.logout(); 
        window.location.href = '/login'; 
      }
      return Promise.reject(error.response.data.message || error.response.statusText || 'Erro desconhecido da API');
    } else if (error.request) {
      console.error('Erro de rede:', error.request);
      return Promise.reject('Erro de rede. Verifique sua conexão.');
    } else {
      console.error('Erro ao configurar a requisição:', error.message);
      return Promise.reject('Erro interno da aplicação.');
    }
  }
);

export default api;