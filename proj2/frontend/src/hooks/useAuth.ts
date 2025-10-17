import { useState, useEffect, useCallback } from 'react';
import { apiClient, TokenManager, isTokenExpired } from '../api';
import { User, LoginRequest, RegisterRequest } from '../api/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: LoginRequest) => Promise<boolean>;
  register: (userData: RegisterRequest) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

export function useAuth(): AuthState & AuthActions {
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
            // Token is valid, fetch user data
            const response = await apiClient.get<User>('/users/me');
            if (response.data) {
              setState(prev => ({
                ...prev,
                user: response.data!,
                isAuthenticated: true,
                isLoading: false,
              }));
            } else {
              // Token might be invalid, clear it
              TokenManager.clearTokens();
              setState(prev => ({
                ...prev,
                isAuthenticated: false,
                isLoading: false,
              }));
            }
          } else {
            // Token is expired or invalid
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

  const login = useCallback(async (credentials: LoginRequest): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiClient.post<{ access_token: string; refresh_token: string; token_type: string }>(
        '/auth/login',
        credentials,
        false
      );
      
      if (response.data) {
        // store tokens
        TokenManager.setTokens(response.data.access_token, response.data.refresh_token);
        // Login successful, fetch user data
        const userResponse = await apiClient.get<User>('/users/me');
        if (userResponse.data) {
          setState(prev => ({
            ...prev,
            user: userResponse.data!,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          }));
          return true;
        }
      }
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: response.error || 'Login failed',
      }));
      return false;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }));
      return false;
    }
  }, []);

  const register = useCallback(async (userData: RegisterRequest): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiClient.post<User>('/users/register', userData, false);
      
      if (response.data) {
        // Registration successful, now login
        return await login({ email: userData.email, password: userData.password });
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
    const token = TokenManager.getAccessToken();
    if (!token || isTokenExpired(token)) return;

    try {
      const response = await apiClient.get<User>('/users/me');
      if (response.data) {
        setState(prev => ({
          ...prev,
          user: response.data!,
        }));
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  }, []);

  return {
    ...state,
    login,
    register,
    logout,
    clearError,
    refreshUser,
  };
}

