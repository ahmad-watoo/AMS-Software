/**
 * API Client Configuration
 * 
 * This module sets up the Axios instance for making HTTP requests to the backend API.
 * It includes:
 * - Request interceptor to automatically add authentication tokens
 * - Response interceptor to handle token refresh on 401 errors
 * - Automatic retry logic for failed requests due to expired tokens
 * 
 * @module api/client
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

/**
 * Base URL for the API.
 * Defaults to localhost:5000 in development.
 * Should be set via REACT_APP_API_URL environment variable in production.
 */
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

/**
 * Axios instance configured for API requests.
 * 
 * Features:
 * - Base URL configured
 * - JSON content type by default
 * - 10 second timeout
 * - Automatic token injection
 * - Automatic token refresh on 401 errors
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

/**
 * Request Interceptor
 * 
 * Automatically adds the JWT access token to all outgoing requests.
 * The token is retrieved from localStorage and added to the Authorization header.
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    // If request setup fails, reject the promise
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * 
 * Handles automatic token refresh when a 401 Unauthorized error is received.
 * 
 * Flow:
 * 1. If response is 401 and we haven't retried yet
 * 2. Attempt to refresh the token using the refresh token
 * 3. If successful, retry the original request with new token
 * 4. If refresh fails, clear all auth data and redirect to login
 */
apiClient.interceptors.response.use(
  (response) => {
    // Success response - pass through unchanged
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Prevent infinite retry loops

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          // Attempt to refresh the access token
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken,
          });

          const { accessToken } = response.data.data;
          
          // Store the new access token
          localStorage.setItem('accessToken', accessToken);

          // Retry the original request with the new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Token refresh failed - user needs to login again
        // Clear all authentication data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Redirect to login page
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // For other errors, reject the promise as-is
    return Promise.reject(error);
  }
);

export default apiClient;
