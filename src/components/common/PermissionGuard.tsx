import React from 'react';
import { useRBAC } from '../../hooks/useRBAC';

interface PermissionGuardProps {
  module?: string; // original prop
  permission?: string; // alias used across app; treated same as module
  action: string;
  permissions?: Array<{ module: string; action: string }>; // For "any of" check
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component to conditionally render children based on user permission
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  module,
  permission,
  action,
  permissions,
  children,
  fallback = null,
}) => {
  const { hasPermission, hasAnyPermission } = useRBAC();

  if (permissions && permissions.length > 0) {
    // Check if user has any of the required permissions
    return hasAnyPermission(permissions) ? <>{children}</> : <>{fallback}</>;
  }

  // Check if user has the required permission (support both `module` and `permission` props)
  const targetModule = permission ?? module ?? '';
  return hasPermission(targetModule, action) ? <>{children}</> : <>{fallback}</>;
};

// Provide default export for convenience
const DefaultPermissionGuard = PermissionGuard;
export default DefaultPermissionGuard;
