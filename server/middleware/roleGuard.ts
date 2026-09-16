import { NextFunction, Request, Response } from 'express';
import { sendError } from '../utils/ApiResponse';

/**
 * Role-based access control. Pass the allowed roles:
 *   roleGuard('admin')  roleGuard('admin', 'executive')
 *
 * Requirement: the ADMIN role has FULL access to every page — the admin
 * passes for any allowed-role list. Everyone else must be in the list.
 */
export const roleGuard =
  (...allowedRoles: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    const role = req.user?.role;
    if (!role) {
      return sendError(res, 401, 'Not authorized.');
    }
    if (role === 'admin') {
      return next();
    }
    if (allowedRoles.includes(role)) {
      return next();
    }
    return sendError(
      res,
      403,
      `Forbidden. Role '${role}' is not allowed to access this resource.`,
    );
  };
