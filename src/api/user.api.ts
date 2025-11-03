import apiClient from './client';
import { User } from './auth.api';

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

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export const userAPI = {
  /**
   * Get all users with pagination
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
   */
  deleteUser: async (id: string, softDelete: boolean = true): Promise<void> => {
    await apiClient.delete(`/users/${id}?soft=${softDelete}`);
  },

  /**
   * Activate a user
   */
  activateUser: async (id: string): Promise<void> => {
    await apiClient.post(`/users/${id}/activate`);
  },

  /**
   * Deactivate a user
   */
  deactivateUser: async (id: string): Promise<void> => {
    await apiClient.post(`/users/${id}/deactivate`);
  },
};

export type { User } from './auth.api';

