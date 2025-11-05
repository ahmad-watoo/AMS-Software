/**
 * Role Guard Component
 * 
 * A higher-order component that conditionally renders children based on user roles.
 * This component is used to control access to UI elements based on the user's role.
 * 
 * Features:
 * - Single role check
 * - Multiple roles check (any of the provided roles)
 * - Custom fallback UI when role requirement is not met
 * 
 * @module components/common/RoleGuard
 */

import React from 'react';
import { useRBAC } from '@/hooks/useRBAC';

/**
 * Props for the RoleGuard component
 * 
 * @interface RoleGuardProps
 */
interface RoleGuardProps {
  /** Required role name (e.g., 'admin', 'student', 'faculty') */
  requiredRole: string;
  /** Array of roles for "any of" check - if provided, checks if user has any of these roles */
  requiredRoles?: string[];
  /** Children to render if role check passes */
  children: React.ReactNode;
  /** Optional fallback UI to render if role check fails (default: null) */
  fallback?: React.ReactNode;
}

/**
 * Role Guard Component
 * 
 * Conditionally renders children based on user roles. If the user doesn't have
 * the required role(s), the fallback component is rendered instead.
 * 
 * Usage Examples:
 * 
 * @example
 * // Single role check
 * <RoleGuard requiredRole="admin">
 *   <AdminPanel />
 * </RoleGuard>
 * 
 * @example
 * // Multiple roles (any of)
 * <RoleGuard 
 *   requiredRoles={['admin', 'super_admin']}
 *   fallback={<Alert message="Admin access required" />}
 * >
 *   <AdminSettings />
 * </RoleGuard>
 * 
 * @example
 * // With custom fallback
 * <RoleGuard 
 *   requiredRole="faculty" 
 *   fallback={<div>Faculty access required</div>}
 * >
 *   <GradeManagement />
 * </RoleGuard>
 * 
 * @param {RoleGuardProps} props - Component props
 * @returns {JSX.Element} Rendered children or fallback
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  requiredRole,
  requiredRoles,
  children,
  fallback = null,
}) => {
  const { hasRole, hasAnyRole } = useRBAC();

  // If multiple roles are provided, check if user has any of them
  if (requiredRoles && requiredRoles.length > 0) {
    return hasAnyRole(requiredRoles) ? <>{children}</> : <>{fallback}</>;
  }

  // Single role check
  return hasRole(requiredRole) ? <>{children}</> : <>{fallback}</>;
};
