import apiClient from './client';

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

export interface LoginDTO {
  email: string;
  password: string;
}

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

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

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

export const authAPI = {
  /**
   * Register a new user
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
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/profile');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to get profile');
    }
    return response.data.data;
  },
};

