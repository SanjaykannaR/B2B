// This file is for: JWT verification middleware + user attach
// Module: Backend Middleware (Module 2)
// Owner: Developer 1 (Backend Engineer)
//
// What goes here:
// - Read token from Authorization: Bearer <token> header
// - Verify token using JWT_SECRET
// - Decode payload, find user by ID
// - Attach user object to req.user
// - Return 401 if no token or invalid token

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import env from '../config/env';
import ApiError from '../utils/ApiError';
import User from '../models/User';
import type { AuthUser } from '../types';

interface JwtPayload {
  id: string;
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw new ApiError(401, 'No token provided. Please log in.');
    }

    const token = header.split(' ')[1];
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    } catch {
      throw new ApiError(401, 'Invalid or expired token.');
    }

    const user = await User.findById(decoded.id).select('-password').lean();
    if (!user || !user.isActive) {
      throw new ApiError(401, 'User no longer exists or is deactivated.');
    }

    req.user = {
      _id: user._id as AuthUser['_id'],
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      company: user.company,
      phone: user.phone,
      licenseNumber: user.licenseNumber,
      contractRate: user.contractRate,
    };

    next();
  } catch (err) {
    next(err);
  }
}

export default authMiddleware;
