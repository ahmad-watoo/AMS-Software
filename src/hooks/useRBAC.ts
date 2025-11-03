import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { rbacAPI, Role, Permission } from '../api/rbac.api';

interface UseRBACReturn {
  roles: Role[];
  permissions: Permission[];
  isLoading: boolean;
  error: string | null;
  hasRole: (roleName: string) => boolean;
  hasPermission: (module: string, action: string) => boolean;
  hasAnyRole: (roleNames: string[]) => boolean;
  hasAnyPermission: (perms: Array<{ module: string; action: string }>) => boolean;
  refreshRoles: () => Promise<void>;
  refreshPermissions: () => Promise<void>;
}

export const useRBAC = (userId?: string): UseRBACReturn => {
  const { user } = useAuthContext();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const targetUserId = userId || user?.id;

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

  useEffect(() => {
    if (targetUserId) {
      loadRoles();
      loadPermissions();
    }
  }, [targetUserId, loadRoles, loadPermissions]);

  const hasRole = useCallback(
    (roleName: string): boolean => {
      return roles.some((role) => role.name === roleName);
    },
    [roles]
  );

  const hasAnyRole = useCallback(
    (roleNames: string[]): boolean => {
      return roleNames.some((roleName) => hasRole(roleName));
    },
    [hasRole]
  );

  const hasPermission = useCallback(
    (module: string, action: string): boolean => {
      return permissions.some((perm) => perm.module === module && perm.action === action);
    },
    [permissions]
  );

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

