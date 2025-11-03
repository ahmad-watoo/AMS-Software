import apiClient from './client';

export interface Role {
  id: string;
  name: string;
  description?: string;
  level: number;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  module: string;
  action: string;
  description?: string;
  createdAt: string;
}

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

export interface CreateRoleDTO {
  name: string;
  description?: string;
  level: number;
}

export interface AssignRoleDTO {
  userId: string;
  roleId: string;
  campusId?: string;
  departmentId?: string;
}

export interface AssignPermissionDTO {
  roleId: string;
  permissionId: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export const rbacAPI = {
  /**
   * Get all roles
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
   */
  deleteRole: async (id: string): Promise<void> => {
    await apiClient.delete(`/rbac/roles/${id}`);
  },

  /**
   * Get all roles for a user
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
   */
  removeRoleFromUser: async (userId: string, roleId: string): Promise<void> => {
    await apiClient.post('/rbac/users/remove-role', { userId, roleId });
  },

  /**
   * Get all permissions for a role
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
   */
  assignPermissionToRole: async (data: AssignPermissionDTO): Promise<void> => {
    await apiClient.post('/rbac/roles/assign-permission', data);
  },

  /**
   * Remove permission from role
   */
  removePermissionFromRole: async (roleId: string, permissionId: string): Promise<void> => {
    await apiClient.post('/rbac/roles/remove-permission', { roleId, permissionId });
  },

  /**
   * Get all permissions
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
   */
  getUserPermissions: async (userId: string): Promise<Permission[]> => {
    const response = await apiClient.get<ApiResponse<Permission[]>>(`/rbac/users/${userId}/permissions`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error?.message || 'Failed to fetch user permissions');
    }
    return response.data.data;
  },
};

