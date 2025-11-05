/**
 * RBAC (Role-Based Access Control) Service
 * 
 * This service handles all RBAC-related business logic including:
 * - Role management (CRUD operations)
 * - Permission management
 * - User-role assignments
 * - Role-permission assignments
 * - Permission checking and validation
 * 
 * The RBAC system follows a hierarchical model where:
 * - Users have roles
 * - Roles have permissions
 * - Permissions are defined as module.action (e.g., 'student.create', 'finance.view')
 * 
 * @module services/rbac.service
 */

import { RoleRepository } from '@/repositories/role.repository';
import { Role, Permission, UserRole, CreateRoleDTO, CreatePermissionDTO } from '@/models/Role.model';
import { NotFoundError, ValidationError } from '@/utils/errors';
import { logger } from '@/config/logger';

export class RBACService {
  private roleRepository: RoleRepository;

  constructor() {
    this.roleRepository = new RoleRepository();
  }

  /**
   * Get all roles
   * 
   * Retrieves all roles in the system.
   * 
   * @returns {Promise<Role[]>} Array of all roles
   */
  async getAllRoles(): Promise<Role[]> {
    return this.roleRepository.findAllRoles();
  }

  /**
   * Get role by ID
   * 
   * Retrieves a specific role by its ID.
   * 
   * @param {string} id - Role ID
   * @returns {Promise<Role>} Role object
   * @throws {NotFoundError} If role not found
   */
  async getRoleById(id: string): Promise<Role> {
    const role = await this.roleRepository.findRoleById(id);
    if (!role) {
      throw new NotFoundError('Role');
    }
    return role;
  }

  /**
   * Create a new role
   * 
   * Creates a new role with validation.
   * Role level is used for hierarchy (0-10, higher = more privileges).
   * 
   * @param {CreateRoleDTO} roleData - Role creation data
   * @returns {Promise<Role>} Created role
   * @throws {ValidationError} If role data is invalid
   * 
   * @example
   * const role = await rbacService.createRole({
   *   name: 'faculty',
   *   description: 'Faculty member',
   *   level: 5
   * });
   */
  async createRole(roleData: CreateRoleDTO): Promise<Role> {
    // Validate role name
    if (!roleData.name || roleData.name.trim().length === 0) {
      throw new ValidationError('Role name is required');
    }

    // Validate role level (0-10 range)
    if (roleData.level < 0 || roleData.level > 10) {
      throw new ValidationError('Role level must be between 0 and 10');
    }

    return this.roleRepository.createRole(roleData);
  }

  /**
   * Update a role
   * 
   * Updates an existing role with new data.
   * 
   * @param {string} id - Role ID
   * @param {Partial<CreateRoleDTO>} roleData - Partial role data to update
   * @returns {Promise<Role>} Updated role
   */
  async updateRole(id: string, roleData: Partial<CreateRoleDTO>): Promise<Role> {
    return this.roleRepository.updateRole(id, roleData);
  }

  /**
   * Delete a role
   * 
   * Deletes a role from the system.
   * Note: This may affect user-role assignments.
   * 
   * @param {string} id - Role ID
   * @returns {Promise<void>}
   * @throws {NotFoundError} If role not found
   */
  async deleteRole(id: string): Promise<void> {
    const role = await this.roleRepository.findRoleById(id);
    if (!role) {
      throw new NotFoundError('Role');
    }
    return this.roleRepository.deleteRole(id);
  }

  /**
   * Get user roles
   * 
   * Retrieves all roles assigned to a user.
   * 
   * @param {string} userId - User ID
   * @returns {Promise<UserRole[]>} Array of user-role assignments
   */
  async getUserRoles(userId: string): Promise<UserRole[]> {
    return this.roleRepository.getUserRoles(userId);
  }

  /**
   * Assign role to user
   * 
   * Assigns a role to a user, optionally scoped to a campus or department.
   * 
   * @param {string} userId - User ID
   * @param {string} roleId - Role ID
   * @param {string} [campusId] - Optional campus ID for scoped assignment
   * @param {string} [departmentId] - Optional department ID for scoped assignment
   * @returns {Promise<UserRole>} User-role assignment
   * @throws {NotFoundError} If role not found
   * 
   * @example
   * // Global role assignment
   * await rbacService.assignRoleToUser('user123', 'role456');
   * 
   * @example
   * // Campus-scoped role assignment
   * await rbacService.assignRoleToUser('user123', 'role456', 'campus789');
   */
  async assignRoleToUser(
    userId: string,
    roleId: string,
    campusId?: string,
    departmentId?: string
  ): Promise<UserRole> {
    // Validate role exists
    const role = await this.roleRepository.findRoleById(roleId);
    if (!role) {
      throw new NotFoundError('Role');
    }

    return this.roleRepository.assignRoleToUser(userId, roleId, campusId, departmentId);
  }

  /**
   * Remove role from user
   * 
   * Removes a role assignment from a user.
   * 
   * @param {string} userId - User ID
   * @param {string} roleId - Role ID
   * @returns {Promise<void>}
   */
  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    return this.roleRepository.removeRoleFromUser(userId, roleId);
  }

  /**
   * Get role permissions
   * 
   * Retrieves all permissions assigned to a role.
   * 
   * @param {string} roleId - Role ID
   * @returns {Promise<Permission[]>} Array of permissions
   * @throws {NotFoundError} If role not found
   */
  async getRolePermissions(roleId: string): Promise<Permission[]> {
    const role = await this.roleRepository.findRoleById(roleId);
    if (!role) {
      throw new NotFoundError('Role');
    }
    return this.roleRepository.getRolePermissions(roleId);
  }

  /**
   * Assign permission to role
   * 
   * Assigns a permission to a role.
   * 
   * @param {string} roleId - Role ID
   * @param {string} permissionId - Permission ID
   * @returns {Promise<void>}
   * @throws {NotFoundError} If role not found
   */
  async assignPermissionToRole(roleId: string, permissionId: string): Promise<void> {
    const role = await this.roleRepository.findRoleById(roleId);
    if (!role) {
      throw new NotFoundError('Role');
    }
    return this.roleRepository.assignPermissionToRole(roleId, permissionId);
  }

  /**
   * Remove permission from role
   * 
   * Removes a permission from a role.
   * 
   * @param {string} roleId - Role ID
   * @param {string} permissionId - Permission ID
   * @returns {Promise<void>}
   */
  async removePermissionFromRole(roleId: string, permissionId: string): Promise<void> {
    return this.roleRepository.removePermissionFromRole(roleId, permissionId);
  }

  /**
   * Get all permissions
   * 
   * Retrieves all permissions in the system.
   * 
   * @returns {Promise<Permission[]>} Array of all permissions
   */
  async getAllPermissions(): Promise<Permission[]> {
    return this.roleRepository.findAllPermissions();
  }

  /**
   * Get user permissions
   * 
   * Retrieves all permissions for a user (aggregated from all user's roles).
   * Returns unique permissions (no duplicates).
   * 
   * @param {string} userId - User ID
   * @returns {Promise<Permission[]>} Array of unique permissions
   * 
   * @example
   * const permissions = await rbacService.getUserPermissions('user123');
   * // Returns all permissions from all roles assigned to the user
   */
  async getUserPermissions(userId: string): Promise<Permission[]> {
    try {
      // Get all roles for user
      const userRoles = await this.roleRepository.getUserRoles(userId);
      const roleIds = userRoles.map((ur) => ur.roleId);

      if (roleIds.length === 0) {
        return [];
      }

      // Get all permissions for these roles (using Map to deduplicate)
      const permissionsMap = new Map<string, Permission>();

      for (const roleId of roleIds) {
        const permissions = await this.roleRepository.getRolePermissions(roleId);
        permissions.forEach((perm) => {
          permissionsMap.set(perm.id, perm);
        });
      }

      return Array.from(permissionsMap.values());
    } catch (error) {
      logger.error('Error getting user permissions:', error);
      throw new Error('Failed to get user permissions');
    }
  }

  /**
   * Check if user has permission
   * 
   * Checks if a user has a specific permission (module.action).
   * 
   * @param {string} userId - User ID
   * @param {string} module - Module name (e.g., 'student', 'finance')
   * @param {string} action - Action name (e.g., 'create', 'read', 'update', 'delete')
   * @returns {Promise<boolean>} True if user has the permission
   * 
   * @example
   * const canCreate = await rbacService.hasPermission('user123', 'student', 'create');
   */
  async hasPermission(userId: string, module: string, action: string): Promise<boolean> {
    try {
      const permissions = await this.getUserPermissions(userId);
      return permissions.some((perm) => perm.module === module && perm.action === action);
    } catch (error) {
      logger.error('Error checking permission:', error);
      return false; // Fail closed - return false on error
    }
  }

  /**
   * Check if user has role
   * 
   * Checks if a user has a specific role by name.
   * 
   * @param {string} userId - User ID
   * @param {string} roleName - Role name (e.g., 'admin', 'faculty', 'student')
   * @returns {Promise<boolean>} True if user has the role
   * 
   * @example
   * const isAdmin = await rbacService.hasRole('user123', 'admin');
   */
  async hasRole(userId: string, roleName: string): Promise<boolean> {
    try {
      const userRoles = await this.roleRepository.getUserRoles(userId);
      const roleNames = await Promise.all(
        userRoles.map(async (ur) => {
          const role = await this.roleRepository.findRoleById(ur.roleId);
          return role?.name;
        })
      );
      return roleNames.includes(roleName);
    } catch (error) {
      logger.error('Error checking role:', error);
      return false; // Fail closed - return false on error
    }
  }

  /**
   * Get user roles with details
   * 
   * Retrieves all roles for a user with full role details and assignment timestamp.
   * 
   * @param {string} userId - User ID
   * @returns {Promise<Array<Role & { assignedAt: string }>>} Array of roles with assignment details
   * 
   * @example
   * const roles = await rbacService.getUserRolesWithDetails('user123');
   * // Returns roles with when they were assigned
   */
  async getUserRolesWithDetails(userId: string): Promise<Array<Role & { assignedAt: string }>> {
    try {
      const userRoles = await this.roleRepository.getUserRoles(userId);
      const rolesWithDetails = await Promise.all(
        userRoles.map(async (ur) => {
          const role = await this.roleRepository.findRoleById(ur.roleId);
          if (!role) return null;
          return {
            ...role,
            assignedAt: ur.assignedAt,
          };
        })
      );
      return rolesWithDetails.filter((r) => r !== null) as Array<Role & { assignedAt: string }>;
    } catch (error) {
      logger.error('Error getting user roles with details:', error);
      throw new Error('Failed to get user roles with details');
    }
  }
}
