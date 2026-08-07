// Controller for: User CRUD - list, get, update, deactivate
// Module: Backend Controllers (Module 5) | Owner: Developer 1
// Handles: paginated listing with role filter, soft-delete via isActive

import { Request, Response, NextFunction } from 'express';
import User, { UserDocument } from '../models/User';
import ApiError from '../utils/ApiError';
import { ok } from '../utils/ApiResponse';
import { toPublicUser } from './auth.controller';
import { parsePage, toPaginationMeta } from '../utils/helpers';
import type { UserRole } from '../types';

const ALLOWED_FILTER_ROLES: UserRole[] = ['admin', 'client', 'driver', 'executive'];

export async function listUsers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { page, limit } = parsePage(req.query as Record<string, unknown>);
    const filter: Record<string, unknown> = {};

    const role = req.query.role as string | undefined;
    if (role) {
      if (!ALLOWED_FILTER_ROLES.includes(role as UserRole)) {
        throw new ApiError(400, `Invalid role filter. Allowed: ${ALLOWED_FILTER_ROLES.join(', ')}`);
      }
      filter.role = role;
    }

    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json(ok({
      items: users.map((u) => toPublicUser(u as UserDocument)),
      ...toPaginationMeta(total, page, limit),
    }));
  } catch (err) {
    next(err);
  }
}

export async function listDrivers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const drivers = await User.find({ role: 'driver', isActive: true }).sort({ firstName: 1 });
    res.json(ok(drivers.map((u) => toPublicUser(u as UserDocument))));
  } catch (err) {
    next(err);
  }
}

export async function listClients(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const clients = await User.find({ role: 'client', isActive: true }).sort({ firstName: 1 });
    res.json(ok(clients.map((u) => toPublicUser(u as UserDocument))));
  } catch (err) {
    next(err);
  }
}

export async function getUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new ApiError(404, 'User not found.');
    }
    res.json(ok(toPublicUser(user)));
  } catch (err) {
    next(err);
  }
}

export async function updateUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new ApiError(404, 'User not found.');
    }

    const allowedFields = ['firstName', 'lastName', 'phone', 'company', 'licenseNumber', 'contractRate', 'role'] as const;
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        (user as unknown as Record<string, unknown>)[field] = req.body[field];
      }
    }

    if (req.body.email !== undefined && req.body.email !== user.email) {
      const existing = await User.findOne({ email: req.body.email.toLowerCase() });
      if (existing && existing._id.toString() !== user._id.toString()) {
        throw new ApiError(409, 'An account with this email already exists.');
      }
      user.email = req.body.email;
    }

    await user.save();
    res.json(ok(toPublicUser(user), 'User updated successfully.'));
  } catch (err) {
    next(err);
  }
}

export async function deactivateUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new ApiError(404, 'User not found.');
    }
    if (user.role === 'admin') {
      throw new ApiError(400, 'Cannot deactivate an admin account.');
    }
    user.isActive = false;
    await user.save();
    res.json(ok({ id: user._id.toString(), isActive: false }, 'User deactivated.'));
  } catch (err) {
    next(err);
  }
}

export default { listUsers, listDrivers, listClients, getUser, updateUser, deactivateUser };
