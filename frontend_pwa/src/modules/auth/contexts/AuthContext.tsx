// src/modules/auth/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthUser {
  name: string;
  email: string;
  role: 'client' | 'admin';
  // Add other user properties as needed
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
  login: (userData: AuthUser, token: string) => void;
  logout: () => void;
  // Add register function if needed for context updates post-registration
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!localStorage.getItem('authToken'));
  const [user, setUser] = useState<AuthUser | null>(() => {
    const storedUser = localStorage.getItem('authUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('authToken'));

  const login = (userData: AuthUser, authToken: string) => {
    localStorage.setItem('authUser', JSON.stringify(userData));
    localStorage.setItem('authToken', authToken);
    setUser(userData);
    setToken(authToken);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('authUser');
    localStorage.removeItem('authToken');
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    // TODO: redirect to login page or home
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

