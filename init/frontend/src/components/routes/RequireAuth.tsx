import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { getStoredAuthUser } from "@/utils/authStorage";

interface RequireAuthProps {
  children: ReactNode;
  unauthenticatedPath?: string;
  unauthorizedPath?: string;
  requiredRoles?: string[];
}

/**
 * Route guard that checks for a stored user.
 * Token validity is enforced server-side via httpOnly cookies;
 * the 401-refresh interceptor in authService handles expiration.
 */
const RequireAuth = ({
  children,
  unauthenticatedPath = "/login",
  unauthorizedPath = "/unauthorized",
  requiredRoles,
}: RequireAuthProps) => {
  const location = useLocation();
  const user = getStoredAuthUser();

  if (!user) {
    return <Navigate to={unauthenticatedPath} replace state={{ from: location.pathname }} />;
  }

  if (requiredRoles && requiredRoles.length > 0) {
    const hasRole = user.roles?.some((role) => requiredRoles.includes(role.name)) ?? false;
    if (!hasRole) {
      return <Navigate to={unauthorizedPath} replace state={{ from: location.pathname }} />;
    }
  }

  return <>{children}</>;
};

export default RequireAuth;
