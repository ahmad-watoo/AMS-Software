/**
 * Authentication API Client
 * 
 * Frontend API client for authentication endpoints.
 * Provides typed functions for all authentication operations.
 * 
 * @module api/auth.api
 */

import apiClient from './client';

/**
 * User Registration Data Transfer Object
 * 
 * @interface RegisterDTO
 */
export interface RegisterDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  cnic?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
}

/**
 * User Login Data Transfer Object
 * 
 * @interface LoginDTO
 */
export interface LoginDTO {
  email: string;
  password: string;
}

/**
 * User Interface
 * 
 * @interface User
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  cnic?: string;
  isActive: boolean;
  isVerified: boolean;
}

/**
 * Authentication Response
 * 
 * Returned after successful login or registration.
 * 
 * @interface AuthResponse
 */
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Standard API Response Wrapper
 * 
 * @interface ApiResponse
 * @template T - Type of the data being returned
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  message?: string;
}

/**
 * Authentication API Client
 * 
 * Provides methods for all authentication operations.
 */
export const authAPI = {
  /**
   * Register a new user
   * 
   * Creates a new user account and returns authentication tokens.
   * 
   * @param {RegisterDTO} data - User registration data
   * @returns {Promise<AuthResponse>} User data with access and refresh tokens
   * @throws {Error} If registration fails
   * 
   * @example
   * const response = await authAPI.register({
   *   email: 'user@example.com',
   *   password: 'SecurePass123!',
   *   firstName: 'John',
   *   lastName: 'Doe'
   * });
   * localStorage.setItem('accessToken', response.accessToken);
   */
  register: async (data: RegisterDTO): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Registration failed');
    }
    return response.data.data;
  },

  /**
   * Login user
   * 
   * Authenticates user with email and password, returns tokens.
   * 
   * @param {LoginDTO} data - Login credentials
   * @returns {Promise<AuthResponse>} User data with access and refresh tokens
   * @throws {Error} If login fails
   * 
   * @example
   * const response = await authAPI.login({
   *   email: 'user@example.com',
   *   password: 'SecurePass123!'
   * });
   * localStorage.setItem('accessToken', response.accessToken);
   */
  login: async (data: LoginDTO): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Login failed');
    }
    return response.data.data;
  },

  /**
   * Refresh access token
   * 
   * Obtains a new access token using a refresh token.
   * 
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<{accessToken: string, expiresIn: number}>} New access token and expiration
   * @throws {Error} If token refresh fails
   * 
   * @example
   * const { accessToken } = await authAPI.refreshToken(refreshToken);
   * localStorage.setItem('accessToken', accessToken);
   */
  refreshToken: async (refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> => {
    const response = await apiClient.post<ApiResponse<{ accessToken: string; expiresIn: number }>>(
      '/auth/refresh-token',
      { refreshToken }
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Token refresh failed');
    }
    return response.data.data;
  },

  /**
   * Logout user
   * 
   * Logs out the current user (client should remove tokens from storage).
   * 
   * @returns {Promise<void>}
   * 
   * @example
   * await authAPI.logout();
   * localStorage.removeItem('accessToken');
   * localStorage.removeItem('refreshToken');
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  /**
   * Get current user profile
   * 
   * Retrieves the profile of the currently authenticated user.
   * 
   * @returns {Promise<User>} Current user's profile
   * @throws {Error} If request fails or user is not authenticated
   * 
   * @example
   * const user = await authAPI.getProfile();
   * console.log(user.email); // 'user@example.com'
   */
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/profile');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to get profile');
    }
    return response.data.data;
  },
};
