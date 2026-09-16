import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import env from '../config/env';
import { User } from '../models/User';
import { sendError } from '../utils/ApiResponse';

export interface JwtPayload {
  id: string;
  role: string;
}

/**
 * Reads `Authorization: Bearer <token>`, verifies the JWT, loads the user
 * (password field excluded) and attaches it to `req.user`.
 * 401 on missing / invalid / expired token or inactive account.
 */
export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      return sendError(res, 401, 'Not authorized. No token provided.');
    }

    const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return sendError(res, 401, 'Not authorized. User not found or inactive.');
    }

    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    return sendError(res, 401, 'Not authorized. Invalid or expired token.');
  }
};
