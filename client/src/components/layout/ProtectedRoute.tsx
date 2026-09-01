import { Navigate, Outlet } from 'react-router-dom';
import LoadingSpinner from '../shared/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import { DEFAULT_ROUTES, type Role } from '../../utils/constants';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, loading, role } = useAuth();

  if (loading) {
    return <LoadingSpinner fullPage label="Checking your session…" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to={DEFAULT_ROUTES[role]} replace />;
  }

  return <Outlet />;
}
