import React, { 
  createContext, 
  useState, 
  useEffect, 
  useCallback, 
  type ReactNode, 
  useContext 
} from 'react';
import AuthService from '../../shared/services/AuthService';
import api from '../../../api/api';
import { useNotification } from '../../../contexts/NotificationContext';
import { 
  type User, 
  type AuthResponse, 
  type UserLoginData, 
  type UserRegisterData,
  type AuthContextType
} from '../../../types';



export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(AuthService.getUserData());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(AuthService.isAuthenticated());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const notification = useNotification();

  useEffect(() => {
    const checkAuth = async () => {
      const token = AuthService.getToken();
      if (token && !user) {
        try {
          setLoading(true);
          const userData = await api.getUserProfile();
          setUser(userData);
          setIsAuthenticated(true);
        } catch (err) {
          AuthService.logout();
          setUser(null);
          setIsAuthenticated(false);
        } finally {
          setLoading(false);
        }
      }
    };
    checkAuth();
  }, []);

  const handleAuthResponse = useCallback((response: AuthResponse) => {
    AuthService.setToken(response.access_token);
    AuthService.setUserData(response.user);
    setUser(response.user);
    setIsAuthenticated(true);
    setError(null);
  }, []);

  const login = useCallback(async (credentials: UserLoginData, isAdmin: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      const response = isAdmin 
        ? await api.adminLogin(credentials)
        : await api.clientLogin(credentials);
      handleAuthResponse(response);
      notification.showSuccess("Login realizado com sucesso!");
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login");
      notification.showError(err.message || "Erro ao fazer login. Verifique suas credenciais.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [handleAuthResponse, notification]);

  const register = useCallback(async (userData: UserRegisterData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.clientRegister(userData);
      handleAuthResponse(response);
      notification.showSuccess("Cadastro realizado com sucesso!");
    } catch (err: any) {
      setError(err.message || "Erro ao registrar");
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
    setError(null);
    notification.showInfo("Você foi desconectado.");
  }, [notification]);

  const contextValue = {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    loading,
    error
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};