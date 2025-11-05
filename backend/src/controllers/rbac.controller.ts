/**
 * RBAC Controller
 * 
 * Handles HTTP requests for Role-Based Access Control endpoints.
 * Manages roles, permissions, and user-role assignments.
 * 
 * @module controllers/rbac.controller
 */

import { Request, Response, NextFunction } from 'express';
import { RBACService } from '@/services/rbac.service';
import { CreateRoleDTO, AssignRoleDTO, AssignPermissionDTO } from '@/models/Role.model';
import { sendSuccess, sendError } from '@/utils/response';
import { ValidationError } from '@/utils/errors';
import { logger } from '@/config/logger';

export class RBACController {
  private rbacService: RBACService;

  constructor() {
    this.rbacService = new RBACService();
  }

  /**
   * Get All Roles Endpoint Handler
   * 
   * @route GET /api/v1/rbac/roles
   * @access Private
   */
  getAllRoles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const roles = await this.rbacService.getAllRoles();
      sendSuccess(res, roles);
    } catch (error) {
      logger.error('Get all roles error:', error);
      next(error);
    }
  };

  /**
   * Get Role By ID Endpoint Handler
   * 
   * @route GET /api/v1/rbac/roles/:id
   * @access Private
   */
  getRoleById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const role = await this.rbacService.getRoleById(id);
      sendSuccess(res, role);
    } catch (error) {
      logger.error('Get role by ID error:', error);
      next(error);
    }
  };

  /**
   * Create Role Endpoint Handler
   * 
   * @route POST /api/v1/rbac/roles
   * @access Private (Admin only)
   */
  createRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const roleData: CreateRoleDTO = {
        name: req.body.name,
        description: req.body.description,
        level: req.body.level,
      };

      if (!roleData.name) {
        throw new ValidationError('Role name is required');
      }

      if (roleData.level === undefined || roleData.level === null) {
        throw new ValidationError('Role level is required');
      }

      const role = await this.rbacService.createRole(roleData);
      sendSuccess(res, role, 'Role created successfully', 201);
    } catch (error) {
      logger.error('Create role error:', error);
      next(error);
    }
  };

  /**
   * Update Role Endpoint Handler
   * 
   * @route PUT /api/v1/rbac/roles/:id
   * @access Private (Admin only)
   */
  updateRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const roleData: Partial<CreateRoleDTO> = {
        name: req.body.name,
        description: req.body.description,
        level: req.body.level,
      };

      const role = await this.rbacService.updateRole(id, roleData);
      sendSuccess(res, role, 'Role updated successfully');
    } catch (error) {
      logger.error('Update role error:', error);
      next(error);
    }
  };

  /**
   * Delete Role Endpoint Handler
   * 
   * @route DELETE /api/v1/rbac/roles/:id
   * @access Private (Admin only)
   */
  deleteRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.rbacService.deleteRole(id);
      sendSuccess(res, null, 'Role deleted successfully');
    } catch (error) {
      logger.error('Delete role error:', error);
      next(error);
    }
  };

  /**
   * Get User Roles Endpoint Handler
   * 
   * @route GET /api/v1/rbac/users/:userId/roles
   * @access Private
   */
  getUserRoles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;
      const roles = await this.rbacService.getUserRolesWithDetails(userId);
      sendSuccess(res, roles);
    } catch (error) {
      logger.error('Get user roles error:', error);
      next(error);
    }
  };

  /**
   * Assign Role To User Endpoint Handler
   * 
   * @route POST /api/v1/rbac/users/assign-role
   * @access Private (Admin only)
   */
  assignRoleToUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const assignData: AssignRoleDTO = {
        userId: req.body.userId,
        roleId: req.body.roleId,
        campusId: req.body.campusId,
        departmentId: req.body.departmentId,
      };

      if (!assignData.userId || !assignData.roleId) {
        throw new ValidationError('userId and roleId are required');
      }

      const userRole = await this.rbacService.assignRoleToUser(
        assignData.userId,
        assignData.roleId,
        assignData.campusId,
        assignData.departmentId
      );
      sendSuccess(res, userRole, 'Role assigned successfully', 201);
    } catch (error) {
      logger.error('Assign role to user error:', error);
      next(error);
    }
  };

  /**
   * Remove Role From User Endpoint Handler
   * 
   * @route POST /api/v1/rbac/users/remove-role
   * @access Private (Admin only)
   */
  removeRoleFromUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, roleId } = req.body;

      if (!userId || !roleId) {
        throw new ValidationError('userId and roleId are required');
      }

      await this.rbacService.removeRoleFromUser(userId, roleId);
      sendSuccess(res, null, 'Role removed successfully');
    } catch (error) {
      logger.error('Remove role from user error:', error);
      next(error);
    }
  };

  /**
   * Get Role Permissions Endpoint Handler
   * 
   * @route GET /api/v1/rbac/roles/:roleId/permissions
   * @access Private
   */
  getRolePermissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { roleId } = req.params;
      const permissions = await this.rbacService.getRolePermissions(roleId);
      sendSuccess(res, permissions);
    } catch (error) {
      logger.error('Get role permissions error:', error);
      next(error);
    }
  };

  /**
   * Assign Permission To Role Endpoint Handler
   * 
   * @route POST /api/v1/rbac/roles/assign-permission
   * @access Private (Admin only)
   */
  assignPermissionToRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const assignData: AssignPermissionDTO = {
        roleId: req.body.roleId,
        permissionId: req.body.permissionId,
      };

      if (!assignData.roleId || !assignData.permissionId) {
        throw new ValidationError('roleId and permissionId are required');
      }

      await this.rbacService.assignPermissionToRole(assignData.roleId, assignData.permissionId);
      sendSuccess(res, null, 'Permission assigned successfully', 201);
    } catch (error) {
      logger.error('Assign permission to role error:', error);
      next(error);
    }
  };

  /**
   * Remove Permission From Role Endpoint Handler
   * 
   * @route POST /api/v1/rbac/roles/remove-permission
   * @access Private (Admin only)
   */
  removePermissionFromRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { roleId, permissionId } = req.body;

      if (!roleId || !permissionId) {
        throw new ValidationError('roleId and permissionId are required');
      }

      await this.rbacService.removePermissionFromRole(roleId, permissionId);
      sendSuccess(res, null, 'Permission removed successfully');
    } catch (error) {
      logger.error('Remove permission from role error:', error);
      next(error);
    }
  };

  /**
   * Get All Permissions Endpoint Handler
   * 
   * @route GET /api/v1/rbac/permissions
   * @access Private
   */
  getAllPermissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const permissions = await this.rbacService.getAllPermissions();
      sendSuccess(res, permissions);
    } catch (error) {
      logger.error('Get all permissions error:', error);
      next(error);
    }
  };

  /**
   * Get User Permissions Endpoint Handler
   * 
   * @route GET /api/v1/rbac/users/:userId/permissions
   * @access Private
   */
  getUserPermissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;
      const permissions = await this.rbacService.getUserPermissions(userId);
      sendSuccess(res, permissions);
    } catch (error) {
      logger.error('Get user permissions error:', error);
      next(error);
    }
  };
}
