// frontend_pwa/src/modules/auth/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AuthService from '../../shared/services/AuthService'; // O serviço de persistência de token
import api from '../../../api/api'; // O novo serviço de API para autenticação
import { useNotification } from '../../../contexts/NotificationContext'; // Para feedback ao usuário
import { type User, type AuthResponse, type UserLoginData, type UserRegisterData } from '../../../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: UserLoginData, isAdmin?: boolean) => Promise<void>;
  register: (userData: UserRegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean; // Adiciona estado de carregamento
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(AuthService.getUserData());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(AuthService.isAuthenticated());
  const [loading, setLoading] = useState<boolean>(false);
  const notification = useNotification();

  // Efeito para carregar dados do usuário ao iniciar, se houver token
  useEffect(() => {
    const token = AuthService.getToken();
    const storedUser = AuthService.getUserData();
    if (token && storedUser && !user) { // Se token e user data existem no storage, mas não no estado
      setUser(storedUser);
      setIsAuthenticated(true);
    } else if (!token && user) { // Se não há token, mas user está no estado, limpa o estado
      setUser(null);
      setIsAuthenticated(false);
    }
  }, [user]);

  const handleAuthResponse = useCallback((response: AuthResponse) => {
    AuthService.setToken(response.access_token);
    AuthService.setUserData(response.user);
    setUser(response.user);
    setIsAuthenticated(true);
  }, []);

  const login = useCallback(async (credentials: UserLoginData, isAdmin: boolean = false) => {
    setLoading(true);
    try {
      const response = isAdmin 
        ? await api.adminLogin(credentials)
        : await api.clientLogin(credentials);
      handleAuthResponse(response);
      notification.showSuccess("Login realizado com sucesso!");
    } catch (err: any) {
      notification.showError(err.message || "Erro ao fazer login. Verifique suas credenciais.");
      throw err; // Propaga o erro para o componente se precisar de tratamento específico
    } finally {
      setLoading(false);
    }
  }, [handleAuthResponse, notification]);

  const register = useCallback(async (userData: UserRegisterData) => {
    setLoading(true);
    try {
      const response = await api.clientRegister(userData);
      handleAuthResponse(response);
      notification.showSuccess("Cadastro realizado com sucesso!");
    } catch (err: any) {
      notification.showError(err.message || "Erro ao registrar. Tente novamente.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleAuthResponse, notification]);

  const logout = useCallback(() => {
    AuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
    notification.showInfo("Você foi desconectado.");
  }, [notification]);

  const contextValue = {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};