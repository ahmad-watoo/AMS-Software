/**
 * useRBAC Hook
 * 
 * Custom React hook for managing Role-Based Access Control (RBAC) functionality.
 * This hook provides access to user roles and permissions, as well as helper functions
 * to check if a user has specific roles or permissions.
 * 
 * Features:
 * - Automatic loading of user roles and permissions
 * - Role checking (single and multiple)
 * - Permission checking (single and multiple)
 * - Manual refresh capabilities
 * - Loading and error states
 * 
 * @module hooks/useRBAC
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { rbacAPI, Role, Permission } from '@/api/rbac.api';

/**
 * Return type for the useRBAC hook
 * 
 * @interface UseRBACReturn
 */
interface UseRBACReturn {
  /** Array of user roles */
  roles: Role[];
  /** Array of user permissions */
  permissions: Permission[];
  /** Loading state - true while fetching roles/permissions */
  isLoading: boolean;
  /** Error message if loading fails */
  error: string | null;
  /** Check if user has a specific role */
  hasRole: (roleName: string) => boolean;
  /** Check if user has a specific permission (module + action) */
  hasPermission: (module: string, action: string) => boolean;
  /** Check if user has any of the specified roles */
  hasAnyRole: (roleNames: string[]) => boolean;
  /** Check if user has any of the specified permissions */
  hasAnyPermission: (perms: Array<{ module: string; action: string }>) => boolean;
  /** Manually refresh user roles */
  refreshRoles: () => Promise<void>;
  /** Manually refresh user permissions */
  refreshPermissions: () => Promise<void>;
}

/**
 * useRBAC Hook
 * 
 * Provides RBAC functionality for the current user or a specified user.
 * 
 * @param {string} [userId] - Optional user ID to check roles/permissions for (defaults to current user)
 * @returns {UseRBACReturn} RBAC state and helper functions
 * 
 * @example
 * // Basic usage
 * const { hasPermission, hasRole, isLoading } = useRBAC();
 * 
 * if (hasPermission('student', 'create')) {
 *   // Show create button
 * }
 * 
 * @example
 * // Check multiple permissions
 * const { hasAnyPermission } = useRBAC();
 * 
 * const canEdit = hasAnyPermission([
 *   { module: 'student', action: 'update' },
 *   { module: 'student', action: 'delete' }
 * ]);
 * 
 * @example
 * // Manual refresh
 * const { refreshRoles, refreshPermissions } = useRBAC();
 * 
 * // After updating roles/permissions
 * await refreshRoles();
 * await refreshPermissions();
 */
export const useRBAC = (userId?: string): UseRBACReturn => {
  const { user } = useAuthContext();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine which user's roles/permissions to load
  const targetUserId = userId || user?.id;

  /**
   * Load user roles from API
   * 
   * @private
   */
  const loadRoles = useCallback(async () => {
    if (!targetUserId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const userRoles = await rbacAPI.getUserRoles(targetUserId);
      setRoles(userRoles);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load roles';
      setError(errorMessage);
      console.error('Error loading roles:', err);
    } finally {
      setIsLoading(false);
    }
  }, [targetUserId]);

  /**
   * Load user permissions from API
   * 
   * @private
   */
  const loadPermissions = useCallback(async () => {
    if (!targetUserId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const userPermissions = await rbacAPI.getUserPermissions(targetUserId);
      setPermissions(userPermissions);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load permissions';
      setError(errorMessage);
      console.error('Error loading permissions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [targetUserId]);

  // Load roles and permissions when user ID changes
  useEffect(() => {
    if (targetUserId) {
      loadRoles();
      loadPermissions();
    }
  }, [targetUserId, loadRoles, loadPermissions]);

  /**
   * Check if user has a specific role
   * 
   * @param {string} roleName - Role name to check
   * @returns {boolean} True if user has the role
   */
  const hasRole = useCallback(
    (roleName: string): boolean => {
      return roles.some((role) => role.name === roleName);
    },
    [roles]
  );

  /**
   * Check if user has any of the specified roles
   * 
   * @param {string[]} roleNames - Array of role names to check
   * @returns {boolean} True if user has any of the roles
   */
  const hasAnyRole = useCallback(
    (roleNames: string[]): boolean => {
      return roleNames.some((roleName) => hasRole(roleName));
    },
    [hasRole]
  );

  /**
   * Check if user has a specific permission
   * 
   * @param {string} module - Module name (e.g., 'student', 'admission')
   * @param {string} action - Action name (e.g., 'create', 'read', 'update', 'delete')
   * @returns {boolean} True if user has the permission
   */
  const hasPermission = useCallback(
    (module: string, action: string): boolean => {
      return permissions.some((perm) => perm.module === module && perm.action === action);
    },
    [permissions]
  );

  /**
   * Check if user has any of the specified permissions
   * 
   * @param {Array<{module: string, action: string}>} perms - Array of permission objects
   * @returns {boolean} True if user has any of the permissions
   */
  const hasAnyPermission = useCallback(
    (perms: Array<{ module: string; action: string }>): boolean => {
      return perms.some((perm) => hasPermission(perm.module, perm.action));
    },
    [hasPermission]
  );

  return {
    roles,
    permissions,
    isLoading,
    error,
    hasRole,
    hasPermission,
    hasAnyRole,
    hasAnyPermission,
    refreshRoles: loadRoles,
    refreshPermissions: loadPermissions,
  };
};
