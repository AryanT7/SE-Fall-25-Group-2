import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, LoginRequest, RegisterRequest } from '../api/types'; // adjust import path
import { apiClient } from '../api/client';
import { TokenManager, isTokenExpired } from '../api/client'; // adjust import path

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<User | null>;
  register: (userData: RegisterRequest) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = TokenManager.getAccessToken();
        if (token) {
          if (token && !isTokenExpired(token)) {
            const response = await apiClient.get<User>('/users/me');
            if (response.data) {
              setState(prev => ({
                ...prev,
                user: response.data!,
                isAuthenticated: true,
                isLoading: false,
              }));
            } else {
              TokenManager.clearTokens();
              setState(prev => ({
                ...prev,
                isAuthenticated: false,
                isLoading: false,
              }));
            }
          } else {
            TokenManager.clearTokens();
            setState(prev => ({
              ...prev,
              isAuthenticated: false,
              isLoading: false,
            }));
          }
        } else {
          setState(prev => ({
            ...prev,
            isAuthenticated: false,
            isLoading: false,
          }));
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setState(prev => ({
          ...prev,
          isAuthenticated: false,
          isLoading: false,
          error: 'Authentication check failed',
        }));
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (credentials: LoginRequest): Promise<User | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiClient.post<{ access_token: string; refresh_token: string; token_type: string }>(
        '/auth/login',
        credentials,
        false
      );
      
      if (response.data) {
        TokenManager.setTokens(response.data.access_token, response.data.refresh_token);
        const userResponse = await apiClient.get<User>('/users/me');
        if (userResponse.data) {
          setState(prev => ({
            ...prev,
            user: userResponse.data!,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          }));
          return userResponse.data;
        }
      }
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: response.error || 'Login failed',
      }));
      return null;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }));
      return null;
    }
  }, []);

  const register = useCallback(async (userData: RegisterRequest): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log('Registering user:', userData);
      const response = await apiClient.post<User>('/users/register', userData, false);
      console.log('Registration response:', response);
      
      if (response.data) {
        const loggedInUser = await login({ email: userData.email, password: userData.password });
        return !!loggedInUser;
      }
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: response.error || 'Registration failed',
      }));
      return false;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      }));
      return false;
    }
  }, [login]);

  const logout = useCallback(() => {
    TokenManager.clearTokens();
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await apiClient.get<User>('/users/me');
      if (response.data) {
        setState(prev => ({
          ...prev,
          user: response.data!,
        }));
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        clearError,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}