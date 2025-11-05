/**
 * Permission Guard Component
 * 
 * A higher-order component that conditionally renders children based on user permissions.
 * This component is used throughout the application to control access to UI elements
 * based on the user's role-based access control (RBAC) permissions.
 * 
 * Features:
 * - Single permission check (module + action)
 * - Multiple permissions check (any of the provided permissions)
 * - Custom fallback UI when permission is denied
 * - Supports both `module` and `permission` props for backward compatibility
 * 
 * @module components/common/PermissionGuard
 */

import React from 'react';
import { useRBAC } from '@/hooks/useRBAC';

/**
 * Props for the PermissionGuard component
 * 
 * @interface PermissionGuardProps
 */
interface PermissionGuardProps {
  /** Module name (e.g., 'student', 'admission', 'finance') */
  module?: string;
  /** Alias for module prop - used for backward compatibility */
  permission?: string;
  /** Action name (e.g., 'create', 'read', 'update', 'delete') */
  action: string;
  /** Array of permissions for "any of" check - if provided, checks if user has any of these */
  permissions?: Array<{ module: string; action: string }>;
  /** Children to render if permission check passes */
  children: React.ReactNode;
  /** Optional fallback UI to render if permission check fails (default: null) */
  fallback?: React.ReactNode;
}

/**
 * Permission Guard Component
 * 
 * Conditionally renders children based on user permissions. If the user doesn't have
 * the required permission(s), the fallback component is rendered instead.
 * 
 * Usage Examples:
 * 
 * @example
 * // Single permission check
 * <PermissionGuard module="student" action="create">
 *   <Button>Create Student</Button>
 * </PermissionGuard>
 * 
 * @example
 * // Multiple permissions (any of)
 * <PermissionGuard 
 *   permissions={[
 *     { module: 'student', action: 'create' },
 *     { module: 'student', action: 'update' }
 *   ]}
 * >
 *   <Button>Edit Student</Button>
 * </PermissionGuard>
 * 
 * @example
 * // With custom fallback
 * <PermissionGuard 
 *   module="finance" 
 *   action="view" 
 *   fallback={<Alert message="Access Denied" />}
 * >
 *   <FinancialReport />
 * </PermissionGuard>
 * 
 * @param {PermissionGuardProps} props - Component props
 * @returns {JSX.Element} Rendered children or fallback
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

  // If multiple permissions are provided, check if user has any of them
  if (permissions && permissions.length > 0) {
    return hasAnyPermission(permissions) ? <>{children}</> : <>{fallback}</>;
  }

  // Single permission check - support both `module` and `permission` props for compatibility
  const targetModule = permission ?? module ?? '';
  return hasPermission(targetModule, action) ? <>{children}</> : <>{fallback}</>;
};

// Provide default export for convenience
const DefaultPermissionGuard = PermissionGuard;
export default DefaultPermissionGuard;
