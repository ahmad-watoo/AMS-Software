import { RoleRepository } from '@/repositories/role.repository';
import { Role, Permission, UserRole, CreateRoleDTO, CreatePermissionDTO } from '@/models/Role.model';
import { NotFoundError, ValidationError } from '@/utils/errors';
import { logger } from '@/config/logger';

export class RBACService {
  private roleRepository: RoleRepository;

  constructor() {
    this.roleRepository = new RoleRepository();
  }

  async getAllRoles(): Promise<Role[]> {
    return this.roleRepository.findAllRoles();
  }

  async getRoleById(id: string): Promise<Role> {
    const role = await this.roleRepository.findRoleById(id);
    if (!role) {
      throw new NotFoundError('Role');
    }
    return role;
  }

  async createRole(roleData: CreateRoleDTO): Promise<Role> {
    // Validate role data
    if (!roleData.name || roleData.name.trim().length === 0) {
      throw new ValidationError('Role name is required');
    }

    if (roleData.level < 0 || roleData.level > 10) {
      throw new ValidationError('Role level must be between 0 and 10');
    }

    return this.roleRepository.createRole(roleData);
  }

  async updateRole(id: string, roleData: Partial<CreateRoleDTO>): Promise<Role> {
    return this.roleRepository.updateRole(id, roleData);
  }

  async deleteRole(id: string): Promise<void> {
    const role = await this.roleRepository.findRoleById(id);
    if (!role) {
      throw new NotFoundError('Role');
    }
    return this.roleRepository.deleteRole(id);
  }

  async getUserRoles(userId: string): Promise<UserRole[]> {
    return this.roleRepository.getUserRoles(userId);
  }

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

  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    return this.roleRepository.removeRoleFromUser(userId, roleId);
  }

  async getRolePermissions(roleId: string): Promise<Permission[]> {
    const role = await this.roleRepository.findRoleById(roleId);
    if (!role) {
      throw new NotFoundError('Role');
    }
    return this.roleRepository.getRolePermissions(roleId);
  }

  async assignPermissionToRole(roleId: string, permissionId: string): Promise<void> {
    const role = await this.roleRepository.findRoleById(roleId);
    if (!role) {
      throw new NotFoundError('Role');
    }
    return this.roleRepository.assignPermissionToRole(roleId, permissionId);
  }

  async removePermissionFromRole(roleId: string, permissionId: string): Promise<void> {
    return this.roleRepository.removePermissionFromRole(roleId, permissionId);
  }

  async getAllPermissions(): Promise<Permission[]> {
    return this.roleRepository.findAllPermissions();
  }

  async getUserPermissions(userId: string): Promise<Permission[]> {
    try {
      // Get all roles for user
      const userRoles = await this.roleRepository.getUserRoles(userId);
      const roleIds = userRoles.map((ur) => ur.roleId);

      if (roleIds.length === 0) {
        return [];
      }

      // Get all permissions for these roles
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

  async hasPermission(userId: string, module: string, action: string): Promise<boolean> {
    try {
      const permissions = await this.getUserPermissions(userId);
      return permissions.some((perm) => perm.module === module && perm.action === action);
    } catch (error) {
      logger.error('Error checking permission:', error);
      return false;
    }
  }

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
      return false;
    }
  }

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

