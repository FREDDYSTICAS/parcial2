import React, { useState, useEffect, type ReactNode } from 'react';
import { authService } from '../services/api';
import { AuthContext } from './AuthContext';
import type { AuthContextType, User } from './AuthContext.types';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      console.log('🔍 Inicializando autenticación:', { token: !!token, userData });
      
      if (token && userData && userData !== 'undefined' && userData !== 'null') {
        try {
          const parsedUser = JSON.parse(userData);
          console.log('👤 Usuario parseado:', parsedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } else {
        console.log('❌ No hay datos de usuario válidos');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Iniciando login con:', { email });
      const response = await authService.login({ email, password });
      
      console.log('✅ Login exitoso, guardando datos:', response);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
      console.log('👤 Usuario establecido:', response.user);
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
