import React from 'react';
import { useRBAC } from '../../hooks/useRBAC';

interface RoleGuardProps {
  requiredRole: string;
  requiredRoles?: string[]; // For "any of" check
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component to conditionally render children based on user role
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  requiredRole,
  requiredRoles,
  children,
  fallback = null,
}) => {
  const { hasRole, hasAnyRole } = useRBAC();

  if (requiredRoles && requiredRoles.length > 0) {
    // Check if user has any of the required roles
    return hasAnyRole(requiredRoles) ? <>{children}</> : <>{fallback}</>;
  }

  // Check if user has the required role
  return hasRole(requiredRole) ? <>{children}</> : <>{fallback}</>;
};

