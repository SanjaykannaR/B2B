import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import env from '../config/env';
import { User } from '../models/User';
import { sendError, sendSuccess } from '../utils/ApiResponse';
import { sanitizeUser } from '../utils/helpers';

const signToken = (user: any): string =>
  jwt.sign({ id: user._id.toString(), role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as any,
  });

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return sendError(res, 400, 'Email and password are required');
    }

    const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
    if (!user || typeof user.comparePassword !== 'function') {
      return sendError(res, 401, 'Invalid email or password');
    }

    const isMatch = await user.comparePassword(String(password));
    if (!isMatch) {
      return sendError(res, 401, 'Invalid email or password');
    }

    if (!user.isActive) {
      return sendError(res, 401, 'Account is deactivated. Contact your administrator.');
    }

    const token = signToken(user);
    return sendSuccess(res, { user: sanitizeUser(user), token }, 'Login successful');
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return sendSuccess(res, { user: sanitizeUser(req.user) }, 'OK');
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const token = signToken(user);
    return sendSuccess(res, { user: sanitizeUser(user), token }, 'Token refreshed');
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return sendError(res, 400, 'Current and new password are required');
    }
    if (String(newPassword).length < 6) {
      return sendError(res, 400, 'New password must be at least 6 characters');
    }

    const user = await User.findById(req.user!._id).select('+password');
    if (!user) {
      return sendError(res, 401, 'User not found');
    }

    const isMatch = await user.comparePassword(String(currentPassword));
    if (!isMatch) {
      return sendError(res, 400, 'Current password is incorrect');
    }

    user.password = String(newPassword);
    await user.save();
    return sendSuccess(res, {}, 'Password updated successfully');
  } catch (err) {
    next(err);
  }
};
