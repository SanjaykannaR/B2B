// Controller for: Auth - register, login, getMe, refreshToken
// Module: Backend Controllers (Module 5) | Owner: Developer 1
// Handles: email uniqueness, password hashing, JWT generation, token validation

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import env from '../config/env';
import ApiError from '../utils/ApiError';
import { ok } from '../utils/ApiResponse';
import type { UserRole } from '../types';

export interface PublicUser {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  company?: string;
  phone?: string;
  licenseNumber?: string;
  contractRate?: number;
}

export interface LoginResponse {
  token: string;
  user: PublicUser;
}

export function toPublicUser(user: {
  id?: string;
  _id?: unknown;
  fullName?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  company?: string;
  phone?: string;
  licenseNumber?: string;
  contractRate?: number;
}): PublicUser {
  return {
    id: user.id ?? String(user._id),
    name: user.fullName || `${user.firstName} ${user.lastName}`,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    company: user.company,
    phone: user.phone,
    licenseNumber: user.licenseNumber,
    contractRate: user.contractRate,
  };
}

export function signToken(userId: string): string {
  return jwt.sign({ id: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { firstName, lastName, email, password, role, phone, company, licenseNumber, contractRate } = req.body as {
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
      role?: UserRole;
      phone?: string;
      company?: string;
      licenseNumber?: string;
      contractRate?: number;
    };

    if (!firstName || !lastName || !email || !password) {
      throw new ApiError(400, 'firstName, lastName, email and password are required.');
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      throw new ApiError(409, 'An account with this email already exists.');
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role || 'client',
      phone,
      company,
      licenseNumber,
      contractRate: contractRate ?? 0,
    });

    const token = signToken(user._id.toString());
    res.status(201).json(ok<LoginResponse>({ token, user: toPublicUser(user) }, 'Account created successfully.'));
  } catch (err) {
    next(err);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required.');
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !user.isActive) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    const token = signToken(user._id.toString());
    res.json(ok<LoginResponse>({ token, user: toPublicUser(user) }, 'Login successful.'));
  } catch (err) {
    next(err);
  }
}

export async function getMe(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated.');
    }
    res.json(ok<PublicUser>(toPublicUser(req.user)));
  } catch (err) {
    next(err);
  }
}

export async function refreshToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { token } = req.body as { token?: string };
    const header = req.headers.authorization;
    const candidate = token || (header?.startsWith('Bearer ') ? header.split(' ')[1] : undefined);

    if (!candidate) {
      throw new ApiError(401, 'A token is required to refresh.');
    }

    const decoded = jwt.verify(candidate, env.JWT_SECRET) as { id: string };
    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) {
      throw new ApiError(401, 'User no longer exists or is deactivated.');
    }

    const newToken = signToken(user._id.toString());
    res.json(ok<{ token: string; user: PublicUser }>({ token: newToken, user: toPublicUser(user) }));
  } catch (err) {
    next(err);
  }
}

export default { register, login, getMe, refreshToken, signToken, toPublicUser };
