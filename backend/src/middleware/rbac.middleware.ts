/**
 * RBAC Middleware
 * 
 * Express middleware for Role-Based Access Control (RBAC).
 * Provides middleware functions to check user roles and permissions before allowing access to routes.
 * 
 * Features:
 * - Role checking (single and multiple roles)
 * - Permission checking (single and multiple permissions)
 * - Automatic user permissions attachment
 * 
 * @module middleware/rbac.middleware
 */

import { Request, Response, NextFunction } from 'express';
import { RBACService } from '@/services/rbac.service';
import { AuthorizationError } from '@/utils/errors';

const rbacService = new RBACService();

/**
 * Require Role Middleware Factory
 * 
 * Creates middleware that requires the user to have a specific role.
 * 
 * @param {string} roleName - Required role name (e.g., 'admin', 'faculty')
 * @returns {Function} Express middleware function
 * 
 * @example
 * // In route definition
 * router.post('/admin/users', requireRole('admin'), controller.createUser);
 * 
 * @example
 * // Multiple roles on different routes
 * router.get('/faculty', requireRole('faculty'), controller.getFaculty);
 * router.get('/admin', requireRole('admin'), controller.getAdmin);
 */
export const requireRole = (roleName: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Check if user is authenticated
      if (!req.user || !req.user.userId) {
        throw new AuthorizationError('User not authenticated');
      }

      // Check if user has the required role
      const hasRole = await rbacService.hasRole(req.user.userId, roleName);

      if (!hasRole) {
        throw new AuthorizationError(`Required role: ${roleName}`);
      }

      // User has required role - continue
      next();
    } catch (error) {
      next(error); // Pass to error middleware
    }
  };
};

/**
 * Require Any Role Middleware Factory
 * 
 * Creates middleware that requires the user to have at least one of the specified roles.
 * 
 * @param {string[]} roleNames - Array of role names (user needs at least one)
 * @returns {Function} Express middleware function
 * 
 * @example
 * // User needs to be either admin or super_admin
 * router.get('/settings', requireAnyRole(['admin', 'super_admin']), controller.getSettings);
 */
export const requireAnyRole = (roleNames: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Check if user is authenticated
      if (!req.user || !req.user.userId) {
        throw new AuthorizationError('User not authenticated');
      }

      // Check if user has any of the required roles
      const hasAnyRole = await Promise.all(
        roleNames.map((roleName) => rbacService.hasRole(req.user!.userId, roleName))
      ).then((results) => results.some((result) => result === true));

      if (!hasAnyRole) {
        throw new AuthorizationError(`Required one of roles: ${roleNames.join(', ')}`);
      }

      // User has at least one required role - continue
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Require Permission Middleware Factory
 * 
 * Creates middleware that requires the user to have a specific permission (module.action).
 * 
 * @param {string} module - Module name (e.g., 'student', 'finance', 'admission')
 * @param {string} action - Action name (e.g., 'create', 'read', 'update', 'delete')
 * @returns {Function} Express middleware function
 * 
 * @example
 * // Require permission to create students
 * router.post('/students', requirePermission('student', 'create'), controller.createStudent);
 * 
 * @example
 * // Require permission to view finances
 * router.get('/finance/reports', requirePermission('finance', 'view'), controller.getReports);
 */
export const requirePermission = (module: string, action: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Check if user is authenticated
      if (!req.user || !req.user.userId) {
        throw new AuthorizationError('User not authenticated');
      }

      // Check if user has the required permission
      const hasPermission = await rbacService.hasPermission(req.user.userId, module, action);

      if (!hasPermission) {
        throw new AuthorizationError(`Required permission: ${module}.${action}`);
      }

      // User has required permission - continue
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Require Any Permission Middleware Factory
 * 
 * Creates middleware that requires the user to have at least one of the specified permissions.
 * 
 * @param {Array<{module: string, action: string}>} permissions - Array of permission objects
 * @returns {Function} Express middleware function
 * 
 * @example
 * // User needs either student.create OR student.update permission
 * router.post('/students', 
 *   requireAnyPermission([
 *     { module: 'student', action: 'create' },
 *     { module: 'student', action: 'update' }
 *   ]), 
 *   controller.manageStudent
 * );
 */
export const requireAnyPermission = (permissions: Array<{ module: string; action: string }>) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Check if user is authenticated
      if (!req.user || !req.user.userId) {
        throw new AuthorizationError('User not authenticated');
      }

      // Check if user has any of the required permissions
      const hasAnyPermission = await Promise.all(
        permissions.map((perm) => rbacService.hasPermission(req.user!.userId, perm.module, perm.action))
      ).then((results) => results.some((result) => result === true));

      if (!hasAnyPermission) {
        throw new AuthorizationError('Insufficient permissions');
      }

      // User has at least one required permission - continue
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Attach User Permissions Middleware
 * 
 * Middleware that attaches user roles and permissions to the request object.
 * This allows controllers to access user permissions without additional queries.
 * 
 * Usage:
 * - Add early in middleware chain (after authentication)
 * - Makes req.user.roles and req.user.permissions available
 * - Non-blocking: continues even if permission loading fails
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * 
 * @example
 * // In app.ts or route file
 * router.use(authenticate);
 * router.use(attachUserPermissions);
 * 
 * // In controller
 * const userRoles = req.user?.roles; // ['admin', 'faculty']
 * const userPerms = req.user?.permissions; // ['student.create', 'finance.view']
 */
export const attachUserPermissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.user && req.user.userId) {
      // Load user roles and permissions
      const roles = await rbacService.getUserRolesWithDetails(req.user.userId);
      const permissions = await rbacService.getUserPermissions(req.user.userId);

      // Attach to request for use in controllers
      req.user = {
        ...req.user,
        roles: roles.map((r) => r.name),
        permissions: permissions.map((p) => `${p.module}.${p.action}`),
      };
    }
    next();
  } catch (error) {
    // Don't fail the request if we can't load permissions
    // Just log and continue (user might still have valid token)
    console.error('Error attaching user permissions:', error);
    next();
  }
};
