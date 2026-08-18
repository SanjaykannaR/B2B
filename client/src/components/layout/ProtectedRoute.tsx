// Route guard wrapper. Login page is removed for now (pending a decision on how
// auth will work), so all routes render directly — no token/role gate.
// Re-introduce auth checks here when login is rebuilt.

import React from 'react';
import { Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  /** Roles allowed to view the nested routes (reserved for future auth rework). */
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = () => {
  return <Outlet />;
};