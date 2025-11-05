/**
 * useAuth Hook
 * 
 * Custom React hook for managing authentication state and operations.
 * This hook provides authentication functionality including login, registration,
 * logout, and user session management.
 * 
 * Features:
 * - Automatic session restoration from localStorage
 * - Token management (access and refresh tokens)
 * - User profile management
 * - Error handling
 * - Loading states
 * 
 * @module hooks/useAuth
 */

import { useState, useEffect, useCallback } from 'react';
import { authAPI, User, AuthResponse, RegisterDTO, LoginDTO } from '@/api/auth.api';

/**
 * Authentication state interface
 * 
 * @interface AuthState
 */
interface AuthState {
  /** Current authenticated user */
  user: User | null;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Loading state */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
}

/**
 * Return type for the useAuth hook
 * 
 * @interface UseAuthReturn
 * @extends AuthState
 */
export interface UseAuthReturn extends AuthState {
  /** Login function */
  login: (credentials: LoginDTO) => Promise<void>;
  /** Registration function */
  register: (data: RegisterDTO) => Promise<void>;
  /** Logout function */
  logout: () => Promise<void>;
  /** Refresh user profile from server */
  refreshUser: () => Promise<void>;
  /** Clear error state */
  clearError: () => void;
}

/**
 * localStorage keys for authentication data
 */
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
};

/**
 * useAuth Hook
 * 
 * Provides authentication functionality for the application.
 * Automatically restores user session from localStorage on mount.
 * 
 * @returns {UseAuthReturn} Authentication state and functions
 * 
 * @example
 * // Basic usage
 * const { user, isAuthenticated, login, logout } = useAuth();
 * 
 * const handleLogin = async () => {
 *   try {
 *     await login({ email: 'user@example.com', password: 'password123' });
 *   } catch (error) {
 *     console.error('Login failed:', error);
 *   }
 * };
 * 
 * @example
 * // Check authentication status
 * const { isAuthenticated, isLoading } = useAuth();
 * 
 * if (isLoading) return <Spinner />;
 * if (!isAuthenticated) return <LoginPage />;
 * return <Dashboard />;
 */
export const useAuth = (): UseAuthReturn => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  /**
   * Load user session from localStorage on component mount
   * Also attempts to refresh user data from server
   */
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
        const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

        // If we have stored user and token, restore session
        if (storedUser && accessToken) {
          const user = JSON.parse(storedUser);
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Try to refresh user data from server to ensure it's up-to-date
          try {
            const freshUser = await authAPI.getProfile();
            setAuthState((prev) => ({
              ...prev,
              user: freshUser,
            }));
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(freshUser));
          } catch (error) {
            // If refresh fails, keep stored user (token might be expired)
            console.warn('Failed to refresh user data:', error);
          }
        } else {
          // No stored session
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        // Handle errors during session restoration
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

  /**
   * Login function
   * 
   * Authenticates user with email and password, stores tokens and user data.
   * 
   * @param {LoginDTO} credentials - Login credentials (email, password)
   * @throws {Error} If login fails
   */
  const login = useCallback(async (credentials: LoginDTO) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

      const response: AuthResponse = await authAPI.login(credentials);

      // Store tokens and user in localStorage
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

  /**
   * Registration function
   * 
   * Registers a new user, stores tokens and user data.
   * 
   * @param {RegisterDTO} data - Registration data (email, password, name, etc.)
   * @throws {Error} If registration fails
   */
  const register = useCallback(async (data: RegisterDTO) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

      const response: AuthResponse = await authAPI.register(data);

      // Store tokens and user in localStorage
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

  /**
   * Logout function
   * 
   * Logs out the user, clears tokens and user data from localStorage.
   * Attempts to call logout API, but clears local data regardless of API call success.
   */
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

  /**
   * Refresh user profile
   * 
   * Fetches fresh user data from server and updates state.
   * If refresh fails, logs out user (token might be expired).
   */
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
      // If refresh fails, logout user (token expired or invalid)
      await logout();
    }
  }, [logout]);

  /**
   * Clear error state
   * 
   * Removes any error message from the auth state.
   */
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
