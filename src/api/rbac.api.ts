/**
 * RBAC API Client
 * 
 * Frontend API client for Role-Based Access Control endpoints.
 * Provides typed functions for all RBAC operations including role management,
 * permission management, and user-role assignments.
 * 
 * @module api/rbac.api
 */

import apiClient from './client';

/**
 * Role Interface
 * 
 * @interface Role
 */
export interface Role {
  id: string;
  name: string;
  description?: string;
  level: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Permission Interface
 * 
 * @interface Permission
 */
export interface Permission {
  id: string;
  name: string;
  module: string;
  action: string;
  description?: string;
  createdAt: string;
}

/**
 * User Role Assignment Interface
 * 
 * @interface UserRole
 */
export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  role?: Role;
  campusId?: string;
  departmentId?: string;
  assignedAt: string;
  isActive: boolean;
}

/**
 * Create Role Data Transfer Object
 * 
 * @interface CreateRoleDTO
 */
export interface CreateRoleDTO {
  name: string;
  description?: string;
  level: number;
}

/**
 * Assign Role Data Transfer Object
 * 
 * @interface AssignRoleDTO
 */
export interface AssignRoleDTO {
  userId: string;
  roleId: string;
  campusId?: string;
  departmentId?: string;
}

/**
 * Assign Permission Data Transfer Object
 * 
 * @interface AssignPermissionDTO
 */
export interface AssignPermissionDTO {
  roleId: string;
  permissionId: string;
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
 * RBAC API Client
 * 
 * Provides methods for all RBAC operations.
 */
export const rbacAPI = {
  /**
   * Get all roles
   * 
   * Retrieves all roles in the system.
   * 
   * @returns {Promise<Role[]>} Array of all roles
   * @throws {Error} If request fails
   */
  getRoles: async (): Promise<Role[]> => {
    const response = await apiClient.get<ApiResponse<Role[]>>('/rbac/roles');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch roles');
    }
    return response.data.data;
  },

  /**
   * Get role by ID
   * 
   * Retrieves a specific role by its ID.
   * 
   * @param {string} id - Role ID
   * @returns {Promise<Role>} Role object
   * @throws {Error} If request fails or role not found
   */
  getRole: async (id: string): Promise<Role> => {
    const response = await apiClient.get<ApiResponse<Role>>(`/rbac/roles/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch role');
    }
    return response.data.data;
  },

  /**
   * Create a new role
   * 
   * Creates a new role in the system.
   * Requires admin permissions.
   * 
   * @param {CreateRoleDTO} data - Role creation data
   * @returns {Promise<Role>} Created role
   * @throws {Error} If request fails or validation fails
   */
  createRole: async (data: CreateRoleDTO): Promise<Role> => {
    const response = await apiClient.post<ApiResponse<Role>>('/rbac/roles', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to create role');
    }
    return response.data.data;
  },

  /**
   * Update a role
   * 
   * Updates an existing role.
   * Requires admin permissions.
   * 
   * @param {string} id - Role ID
   * @param {Partial<CreateRoleDTO>} data - Partial role data to update
   * @returns {Promise<Role>} Updated role
   * @throws {Error} If request fails or role not found
   */
  updateRole: async (id: string, data: Partial<CreateRoleDTO>): Promise<Role> => {
    const response = await apiClient.put<ApiResponse<Role>>(`/rbac/roles/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to update role');
    }
    return response.data.data;
  },

  /**
   * Delete a role
   * 
   * Deletes a role from the system.
   * Requires admin permissions.
   * 
   * @param {string} id - Role ID
   * @returns {Promise<void>}
   * @throws {Error} If request fails or role not found
   */
  deleteRole: async (id: string): Promise<void> => {
    await apiClient.delete(`/rbac/roles/${id}`);
  },

  /**
   * Get all roles for a user
   * 
   * Retrieves all roles assigned to a specific user.
   * 
   * @param {string} userId - User ID
   * @returns {Promise<Role[]>} Array of roles with assignment details
   * @throws {Error} If request fails
   */
  getUserRoles: async (userId: string): Promise<Role[]> => {
    const response = await apiClient.get<ApiResponse<Role[]>>(`/rbac/users/${userId}/roles`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch user roles');
    }
    return response.data.data;
  },

  /**
   * Assign role to user
   * 
   * Assigns a role to a user, optionally scoped to a campus or department.
   * Requires admin permissions.
   * 
   * @param {AssignRoleDTO} data - Assignment data
   * @returns {Promise<UserRole>} User-role assignment
   * @throws {Error} If request fails or validation fails
   */
  assignRoleToUser: async (data: AssignRoleDTO): Promise<UserRole> => {
    const response = await apiClient.post<ApiResponse<UserRole>>('/rbac/users/assign-role', data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to assign role');
    }
    return response.data.data;
  },

  /**
   * Remove role from user
   * 
   * Removes a role assignment from a user.
   * Requires admin permissions.
   * 
   * @param {string} userId - User ID
   * @param {string} roleId - Role ID
   * @returns {Promise<void>}
   * @throws {Error} If request fails
   */
  removeRoleFromUser: async (userId: string, roleId: string): Promise<void> => {
    await apiClient.post('/rbac/users/remove-role', { userId, roleId });
  },

  /**
   * Get all permissions for a role
   * 
   * Retrieves all permissions assigned to a specific role.
   * 
   * @param {string} roleId - Role ID
   * @returns {Promise<Permission[]>} Array of permissions
   * @throws {Error} If request fails or role not found
   */
  getRolePermissions: async (roleId: string): Promise<Permission[]> => {
    const response = await apiClient.get<ApiResponse<Permission[]>>(`/rbac/roles/${roleId}/permissions`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch role permissions');
    }
    return response.data.data;
  },

  /**
   * Assign permission to role
   * 
   * Assigns a permission to a role.
   * Requires admin permissions.
   * 
   * @param {AssignPermissionDTO} data - Assignment data
   * @returns {Promise<void>}
   * @throws {Error} If request fails or validation fails
   */
  assignPermissionToRole: async (data: AssignPermissionDTO): Promise<void> => {
    await apiClient.post('/rbac/roles/assign-permission', data);
  },

  /**
   * Remove permission from role
   * 
   * Removes a permission from a role.
   * Requires admin permissions.
   * 
   * @param {string} roleId - Role ID
   * @param {string} permissionId - Permission ID
   * @returns {Promise<void>}
   * @throws {Error} If request fails
   */
  removePermissionFromRole: async (roleId: string, permissionId: string): Promise<void> => {
    await apiClient.post('/rbac/roles/remove-permission', { roleId, permissionId });
  },

  /**
   * Get all permissions
   * 
   * Retrieves all permissions in the system.
   * 
   * @returns {Promise<Permission[]>} Array of all permissions
   * @throws {Error} If request fails
   */
  getPermissions: async (): Promise<Permission[]> => {
    const response = await apiClient.get<ApiResponse<Permission[]>>('/rbac/permissions');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch permissions');
    }
    return response.data.data;
  },

  /**
   * Get all permissions for a user
   * 
   * Retrieves all permissions for a user (aggregated from all user's roles).
   * Returns unique permissions only.
   * 
   * @param {string} userId - User ID
   * @returns {Promise<Permission[]>} Array of unique permissions
   * @throws {Error} If request fails
   */
  getUserPermissions: async (userId: string): Promise<Permission[]> => {
    const response = await apiClient.get<ApiResponse<Permission[]>>(`/rbac/users/${userId}/permissions`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch user permissions');
    }
    return response.data.data;
  },
};
