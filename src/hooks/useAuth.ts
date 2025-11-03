import { useState, useEffect, useCallback } from 'react';
import { authAPI, User, AuthResponse, RegisterDTO, LoginDTO } from '../api/auth.api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface UseAuthReturn extends AuthState {
  login: (credentials: LoginDTO) => Promise<void>;
  register: (data: RegisterDTO) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
};

export const useAuth = (): UseAuthReturn => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
        const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

        if (storedUser && accessToken) {
          const user = JSON.parse(storedUser);
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Try to refresh user data from server
          try {
            const freshUser = await authAPI.getProfile();
            setAuthState((prev) => ({
              ...prev,
              user: freshUser,
            }));
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(freshUser));
          } catch (error) {
            // If refresh fails, keep stored user
            console.warn('Failed to refresh user data:', error);
          }
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Failed to load user session',
        });
      }
    };

    loadUser();
  }, []);

  const login = useCallback(async (credentials: LoginDTO) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

      const response: AuthResponse = await authAPI.login(credentials);

      // Store tokens and user
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));

      setAuthState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        isAuthenticated: false,
      }));
      throw error;
    }
  }, []);

  const register = useCallback(async (data: RegisterDTO) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

      const response: AuthResponse = await authAPI.register(data);

      // Store tokens and user
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));

      setAuthState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        isAuthenticated: false,
      }));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);

      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const user = await authAPI.getProfile();
      setAuthState((prev) => ({
        ...prev,
        user,
      }));
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // If refresh fails, logout user
      await logout();
    }
  }, [logout]);

  const clearError = useCallback(() => {
    setAuthState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...authState,
    login,
    register,
    logout,
    refreshUser,
    clearError,
  };
};

