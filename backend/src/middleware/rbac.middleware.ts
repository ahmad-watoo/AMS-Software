import { Request, Response, NextFunction } from 'express';
import { RBACService } from '@/services/rbac.service';
import { AuthorizationError } from '@/utils/errors';

const rbacService = new RBACService();

/**
 * Middleware to check if user has a specific role
 */
export const requireRole = (roleName: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user.userId) {
        throw new AuthorizationError('User not authenticated');
      }

      const hasRole = await rbacService.hasRole(req.user.userId, roleName);

      if (!hasRole) {
        throw new AuthorizationError(`Required role: ${roleName}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user has any of the specified roles
 */
export const requireAnyRole = (roleNames: string[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user.userId) {
        throw new AuthorizationError('User not authenticated');
      }

      const hasAnyRole = await Promise.all(
        roleNames.map((roleName) => rbacService.hasRole(req.user!.userId, roleName))
      ).then((results) => results.some((result) => result === true));

      if (!hasAnyRole) {
        throw new AuthorizationError(`Required one of roles: ${roleNames.join(', ')}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user has a specific permission
 */
export const requirePermission = (module: string, action: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user.userId) {
        throw new AuthorizationError('User not authenticated');
      }

      const hasPermission = await rbacService.hasPermission(req.user.userId, module, action);

      if (!hasPermission) {
        throw new AuthorizationError(`Required permission: ${module}.${action}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user has any of the specified permissions
 */
export const requireAnyPermission = (permissions: Array<{ module: string; action: string }>) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user || !req.user.userId) {
        throw new AuthorizationError('User not authenticated');
      }

      const hasAnyPermission = await Promise.all(
        permissions.map((perm) => rbacService.hasPermission(req.user!.userId, perm.module, perm.action))
      ).then((results) => results.some((result) => result === true));

      if (!hasAnyPermission) {
        throw new AuthorizationError('Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Attach user roles and permissions to request object
 */
export const attachUserPermissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.user && req.user.userId) {
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
    // Just log and continue
    console.error('Error attaching user permissions:', error);
    next();
  }
};

