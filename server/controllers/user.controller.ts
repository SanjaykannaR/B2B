import { NextFunction, Request, Response } from 'express';
import { User, ROLES } from '../models/User';
import { sendError, sendSuccess } from '../utils/ApiResponse';
import { paginate, sanitizeUser, toObjectId } from '../utils/helpers';

export const listUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const filter: Record<string, unknown> = {};

    if (req.query.role) filter.role = String(req.query.role);
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

    const search = String(req.query.search || '').trim();
    if (search) {
      const re = new RegExp(search, 'i');
      filter.$or = [
        { firstName: re },
        { lastName: re },
        { email: re },
        { company: re },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    return sendSuccess(res, {
      users: users.map(sanitizeUser),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

export const getDrivers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const drivers = await User.find({ role: 'driver', isActive: true }).sort({
      firstName: 1,
    });
    return sendSuccess(res, { users: drivers.map(sanitizeUser) });
  } catch (err) {
    next(err);
  }
};

export const getClients = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clients = await User.find({ role: 'client', isActive: true }).sort({
      firstName: 1,
    });
    return sendSuccess(res, { users: clients.map(sanitizeUser) });
  } catch (err) {
    next(err);
  }
};

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = toObjectId(req.params.id);
    const user = id ? await User.findById(id) : null;
    if (!user) return sendError(res, 404, 'User not found');
    return sendSuccess(res, { user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, email, password, role, company, phone, licenseNumber, contractRate } =
      req.body;

    if (!firstName || !lastName || !email || !password || !role) {
      return sendError(res, 400, 'firstName, lastName, email, password and role are required');
    }
    if (!ROLES.includes(role)) {
      return sendError(res, 400, `Invalid role. Must be one of: ${ROLES.join(', ')}`);
    }

    const existing = await User.findOne({ email: String(email).toLowerCase() });
    if (existing) {
      return sendError(res, 409, 'A user with this email already exists');
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
      company,
      phone,
      licenseNumber,
      contractRate,
    });

    return sendSuccess(res, { user: sanitizeUser(user) }, `${role} user created`, 201);
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = toObjectId(req.params.id);
    const user = id ? await User.findById(id) : null;
    if (!user) return sendError(res, 404, 'User not found');

    const { firstName, lastName, email, phone, company, role, contractRate, licenseNumber, isActive } =
      req.body;

    if (firstName !== undefined) user.firstName = String(firstName);
    if (lastName !== undefined) user.lastName = String(lastName);
    if (phone !== undefined) user.phone = phone ? String(phone) : undefined;
    if (company !== undefined) user.company = company ? String(company) : undefined;
    if (licenseNumber !== undefined)
      user.licenseNumber = licenseNumber ? String(licenseNumber) : undefined;
    if (contractRate !== undefined) user.contractRate = Number(contractRate);

    if (role !== undefined) {
      if (!ROLES.includes(role)) return sendError(res, 400, 'Invalid role');
      user.role = role;
    }

    if (isActive !== undefined) user.isActive = Boolean(isActive);

    if (email !== undefined && String(email).toLowerCase() !== user.email) {
      const dup = await User.findOne({
        email: String(email).toLowerCase(),
        _id: { $ne: user._id },
      });
      if (dup) return sendError(res, 409, 'A user with this email already exists');
      user.email = String(email).toLowerCase();
    }

    await user.save();
    return sendSuccess(res, { user: sanitizeUser(user) }, 'User updated');
  } catch (err) {
    next(err);
  }
};

export const deactivateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = toObjectId(req.params.id);
    const user = id ? await User.findById(id) : null;
    if (!user) return sendError(res, 404, 'User not found');
    user.isActive = false;
    await user.save();
    return sendSuccess(res, { user: sanitizeUser(user) }, 'User deactivated');
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = toObjectId(req.params.id);
    const user = id ? await User.findById(id) : null;
    if (!user) return sendError(res, 404, 'User not found');

    const { password } = req.body;
    if (!password || String(password).length < 6) {
      return sendError(res, 400, 'Password must be at least 6 characters');
    }

    user.password = String(password);
    await user.save();
    return sendSuccess(res, {}, 'Password reset successfully');
  } catch (err) {
    next(err);
  }
};
