/**
 * User Management API Client
 * 
 * Frontend API client for user management endpoints.
 * Provides typed functions for all user operations including CRUD,
 * activation/deactivation, and search.
 * 
 * @module api/user.api
 */

import apiClient from './client';
import { User } from './auth.api';

/**
 * Create User Data Transfer Object
 * 
 * @interface CreateUserDTO
 */
export interface CreateUserDTO {
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
 * Update User Data Transfer Object
 * 
 * @interface UpdateUserDTO
 */
export interface UpdateUserDTO {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  profilePictureUrl?: string;
}

/**
 * Users Response with Pagination
 * 
 * @interface UsersResponse
 */
export interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
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
  };
}

/**
 * User Management API Client
 * 
 * Provides methods for all user management operations.
 */
export const userAPI = {
  /**
   * Get all users with pagination
   * 
   * Retrieves users with pagination and optional search.
   * 
   * @param {number} [page=1] - Page number
   * @param {number} [limit=20] - Items per page
   * @param {string} [search] - Optional search query
   * @returns {Promise<UsersResponse>} Users array and pagination info
   * @throws {Error} If request fails
   * 
   * @example
   * const response = await userAPI.getUsers(1, 20, 'john');
   * console.log(response.users); // Array of users
   * console.log(response.pagination.total); // Total count
   */
  getUsers: async (page: number = 1, limit: number = 20, search?: string): Promise<UsersResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      params.append('search', search);
    }

    const response = await apiClient.get<ApiResponse<UsersResponse>>(`/users?${params.toString()}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch users');
    }
    return response.data.data;
  },

  /**
   * Get user by ID
   * 
   * Retrieves a specific user by their ID.
   * 
   * @param {string} id - User ID
   * @returns {Promise<User>} User object
   * @throws {Error} If request fails or user not found
   * 
   * @example
   * const user = await userAPI.getUser('user123');
   * console.log(user.email); // 'user@example.com'
   */
  getUser: async (id: string): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch user');
    }
    return response.data.data;
  },

  /**
   * Create a new user
   * 
   * Creates a new user account.
   * Requires user.create permission.
   * 
   * @param {CreateUserDTO} data - User creation data
   * @returns {Promise<User>} Created user
   * @throws {Error} If request fails or validation fails
   * 
   * @example
   * const user = await userAPI.createUser({
   *   email: 'user@example.com',
   *   password: 'SecurePass123!',
   *   firstName: 'John',
   *   lastName: 'Doe'
   * });
   */
  createUser: async (data: CreateUserDTO): Promise<User> => {
    const response = await apiClient.post<ApiResponse<User>>('/users', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create user');
    }
    return response.data.data;
  },

  /**
   * Update a user
   * 
   * Updates an existing user's information.
   * Requires user.update permission or own profile.
   * 
   * @param {string} id - User ID
   * @param {UpdateUserDTO} data - Partial user data to update
   * @returns {Promise<User>} Updated user
   * @throws {Error} If request fails or user not found
   * 
   * @example
   * const user = await userAPI.updateUser('user123', {
   *   firstName: 'Jane',
   *   phone: '+92-300-1234567'
   * });
   */
  updateUser: async (id: string, data: UpdateUserDTO): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>(`/users/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to update user');
    }
    return response.data.data;
  },

  /**
   * Delete a user
   * 
   * Deletes a user (soft delete by default).
   * Requires user.delete permission.
   * 
   * @param {string} id - User ID
   * @param {boolean} [softDelete=true] - Whether to soft delete (default: true)
   * @returns {Promise<void>}
   * @throws {Error} If request fails or user not found
   * 
   * @example
   * // Soft delete (recommended)
   * await userAPI.deleteUser('user123', true);
   */
  deleteUser: async (id: string, softDelete: boolean = true): Promise<void> => {
    await apiClient.delete(`/users/${id}?soft=${softDelete}`);
  },

  /**
   * Activate a user
   * 
   * Activates a user account, allowing them to login.
   * Requires admin role.
   * 
   * @param {string} id - User ID
   * @returns {Promise<void>}
   * @throws {Error} If request fails or user not found
   * 
   * @example
   * await userAPI.activateUser('user123');
   */
  activateUser: async (id: string): Promise<void> => {
    await apiClient.post(`/users/${id}/activate`);
  },

  /**
   * Deactivate a user
   * 
   * Deactivates a user account, preventing them from logging in.
   * Requires admin role.
   * 
   * @param {string} id - User ID
   * @returns {Promise<void>}
   * @throws {Error} If request fails or user not found
   * 
   * @example
   * await userAPI.deactivateUser('user123');
   */
  deactivateUser: async (id: string): Promise<void> => {
    await apiClient.post(`/users/${id}/deactivate`);
  },
};

/**
 * Export User type for convenience
 */
export type { User } from './auth.api';
