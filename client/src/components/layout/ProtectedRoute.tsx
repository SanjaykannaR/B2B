import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export const ROLE_HOME: Record<string, string> = {
  admin: '/admin',
  client: '/client',
  driver: '/driver',
  executive: '/executive/analytics',
};

interface ProtectedRouteProps {
  /** Roles allowed to view the nested routes. Admin always passes — full access. */
  allowedRoles?: string[];
}

/**
 * ProtectedRoute — auth guard + role-based access control.
 * - No JWT token        → redirect to /login (remembers the requested path)
 * - Wrong role          → redirect to that role's default dashboard
 * - Admin on any route  → allowed (full access to every page/role route)
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const location = useLocation();
  const { isAuthenticated } = useSelector((s: any) => s.auth);
  const role = (JSON.parse(localStorage.getItem('user') || 'null') || {}).role;

  if (!isAuthenticated && !localStorage.getItem('token')) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }

  const isAllowed =
    !allowedRoles || allowedRoles.length === 0 || role === 'admin' || allowedRoles.includes(role);

  if (!isAllowed) {
    return <Navigate to={ROLE_HOME[role] || '/admin'} replace />;
  }

  return <Outlet />;
};
