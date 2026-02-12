"use client";

import { type ReactNode } from "react";
import { useCurrentUser } from "./user-context";
import { type Role, type Resource, type Action } from "./permissions";
import { Loader2 } from "lucide-react";

interface RoleGuardProps {
  children: ReactNode;
  /** Allowed roles - user must have one of these roles */
  roles?: Role[];
  /** Minimum role required (based on hierarchy) */
  minRole?: Role;
  /** What to show if access denied */
  fallback?: ReactNode;
  /** Show loading state while checking */
  showLoading?: boolean;
}

/**
 * Guard component that renders children only if user has required role
 */
export function RoleGuard({
  children,
  roles,
  minRole,
  fallback = null,
  showLoading = true,
}: RoleGuardProps) {
  const { user, loading, hasRole, hasMinimumRole } = useCurrentUser();

  if (loading && showLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
      </div>
    );
  }

  if (!user) {
    return <>{fallback}</>;
  }

  // Check specific roles
  if (roles && roles.length > 0) {
    const hasAllowedRole = roles.some((role) => hasRole(role));
    if (!hasAllowedRole) {
      return <>{fallback}</>;
    }
  }

  // Check minimum role
  if (minRole && !hasMinimumRole(minRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface PermissionGuardProps {
  children: ReactNode;
  /** Resource to check permission for */
  resource: Resource;
  /** Action to check permission for */
  action: Action;
  /** What to show if access denied */
  fallback?: ReactNode;
  /** Show loading state while checking */
  showLoading?: boolean;
}

/**
 * Guard component that renders children only if user has required permission
 */
export function PermissionGuard({
  children,
  resource,
  action,
  fallback = null,
  showLoading = true,
}: PermissionGuardProps) {
  const { user, loading, can } = useCurrentUser();

  if (loading && showLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
      </div>
    );
  }

  if (!user || !can(resource, action)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface CanProps {
  children: ReactNode;
  /** Resource to check */
  resource: Resource;
  /** Action to check */
  action: Action;
  /** Alternative content if no permission */
  else?: ReactNode;
}

/**
 * Simple conditional render based on permission
 * Usage: <Can resource="leads" action="delete">{...}</Can>
 */
export function Can({ children, resource, action, else: elseContent = null }: CanProps) {
  const { can, loading } = useCurrentUser();

  if (loading) return null;

  return can(resource, action) ? <>{children}</> : <>{elseContent}</>;
}

interface CannotProps {
  children: ReactNode;
  /** Resource to check */
  resource: Resource;
  /** Action to check */
  action: Action;
}

/**
 * Inverse of Can - shows content when user DOESN'T have permission
 * Useful for showing upgrade prompts or restricted notices
 */
export function Cannot({ children, resource, action }: CannotProps) {
  const { can, loading } = useCurrentUser();

  if (loading) return null;

  return !can(resource, action) ? <>{children}</> : null;
}

interface AdminOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Shorthand for admin-only content
 */
export function AdminOnly({ children, fallback = null }: AdminOnlyProps) {
  const { isAdmin, loading } = useCurrentUser();

  if (loading) return null;

  return isAdmin ? <>{children}</> : <>{fallback}</>;
}

interface ManagerOrAboveProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Shorthand for manager or above content
 */
export function ManagerOrAbove({ children, fallback = null }: ManagerOrAboveProps) {
  const { hasMinimumRole, loading } = useCurrentUser();

  if (loading) return null;

  return hasMinimumRole("manager") ? <>{children}</> : <>{fallback}</>;
}

/**
 * Access denied component with styled message
 */
export function AccessDenied({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-slate-900 mb-2">Access Denied</h2>
      <p className="text-slate-500 max-w-md">
        {message || "You don't have permission to access this resource. Please contact your administrator if you believe this is an error."}
      </p>
    </div>
  );
}

/**
 * Hook for using guards programmatically
 */
export function useGuard() {
  const { can, hasRole, hasMinimumRole, user, loading } = useCurrentUser();

  return {
    /** Check if user can perform action on resource */
    canAccess: (resource: Resource, action: Action) => !loading && can(resource, action),
    /** Check if user has specific role */
    hasRole: (role: Role) => !loading && hasRole(role),
    /** Check if user has minimum role level */
    hasMinimumRole: (role: Role) => !loading && hasMinimumRole(role),
    /** Check if user is authenticated */
    isAuthenticated: !loading && !!user,
    /** Loading state */
    isLoading: loading,
  };
}
