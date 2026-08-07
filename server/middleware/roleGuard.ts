// This file is for: Role-based access control middleware
// Module: Backend Middleware (Module 2)
// Owner: Developer 1 (Backend Engineer)
//
// What goes here:
// - Takes array of allowed roles: roleGuard(['admin', 'executive'])
// - Checks req.user.role against allowed roles
// - Returns 403 Forbidden if user's role is not in the allowed list

import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/ApiError';
import type { UserRole } from '../types';

export function roleGuard(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as Request & { user?: { role?: string } }).user;
    if (!user || !user.role) {
      return next(new ApiError(401, 'Not authenticated.'));
    }
    if (!allowedRoles.includes(user.role as UserRole)) {
      return next(new ApiError(403, 'You do not have permission to access this resource.'));
    }
    next();
  };
}

export default roleGuard;
