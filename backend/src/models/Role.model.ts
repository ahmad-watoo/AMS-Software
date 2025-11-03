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

export interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  grantedAt: string;
}

export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  campusId?: string;
  departmentId?: string;
  assignedAt: string;
  assignedBy?: string;
  isActive: boolean;
}

export interface CreateRoleDTO {
  name: string;
  description?: string;
  level: number;
}

export interface CreatePermissionDTO {
  name: string;
  module: string;
  action: string;
  description?: string;
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

