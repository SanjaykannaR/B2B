// Controller for: Vehicle CRUD - create, update, status, delete, availability
// Module: Backend Controllers (Module 5) | Owner: Developer 1

import { Request, Response, NextFunction } from 'express';
import Vehicle, { VehicleDocument, VehicleStatus } from '../models/Vehicle';
import ApiError from '../utils/ApiError';
import { ok } from '../utils/ApiResponse';
import { parsePage, toPaginationMeta } from '../utils/helpers';

export async function listVehicles(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { page, limit } = parsePage(req.query as Record<string, unknown>);
    const filter: Record<string, unknown> = {};

    const status = req.query.status as string | undefined;
    if (status) {
      const valid = ['Available', 'In-Transit', 'Maintenance'];
      if (!valid.includes(status)) {
        throw new ApiError(400, `Invalid status filter. Allowed: ${valid.join(', ')}`);
      }
      filter.status = status;
    }

    const search = req.query.search as string | undefined;
    if (search) {
      filter.$or = [
        { registrationNumber: { $regex: search, $options: 'i' } },
        { make: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Vehicle.countDocuments(filter);
    const vehicles = await Vehicle.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('currentDriver', 'firstName lastName email');

    res.json(ok({ items: vehicles, ...toPaginationMeta(total, page, limit) }));
  } catch (err) {
    next(err);
  }
}

export async function getAvailableVehicles(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const vehicles = await Vehicle.find({ status: 'Available' }).sort({ maxWeightKg: 1 }).populate('currentDriver', 'firstName lastName email');
    res.json(ok(vehicles));
  } catch (err) {
    next(err);
  }
}

export async function getVehicleStats(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const [total, available, inTransit, maintenance] = await Promise.all([
      Vehicle.countDocuments(),
      Vehicle.countDocuments({ status: 'Available' }),
      Vehicle.countDocuments({ status: 'In-Transit' }),
      Vehicle.countDocuments({ status: 'Maintenance' }),
    ]);
    res.json(ok({ total, available, inTransit, maintenance }));
  } catch (err) {
    next(err);
  }
}

export async function getVehicle(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate('currentDriver', 'firstName lastName email');
    if (!vehicle) {
      throw new ApiError(404, 'Vehicle not found.');
    }
    res.json(ok(vehicle));
  } catch (err) {
    next(err);
  }
}

export async function createVehicle(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const existing = await Vehicle.findOne({ registrationNumber: (req.body.registrationNumber || '').toUpperCase() });
    if (existing) {
      throw new ApiError(409, 'A vehicle with this registration number already exists.');
    }
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json(ok(vehicle, 'Vehicle created successfully.'));
  } catch (err) {
    next(err);
  }
}

export async function updateVehicle(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('currentDriver', 'firstName lastName email');
    if (!vehicle) {
      throw new ApiError(404, 'Vehicle not found.');
    }
    res.json(ok(vehicle, 'Vehicle updated successfully.'));
  } catch (err) {
    next(err);
  }
}

export async function updateVehicleStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { status } = req.body as { status?: VehicleStatus };
    const valid: VehicleStatus[] = ['Available', 'In-Transit', 'Maintenance'];
    if (!status || !valid.includes(status)) {
      throw new ApiError(400, `Invalid status. Allowed: ${valid.join(', ')}`);
    }

    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      throw new ApiError(404, 'Vehicle not found.');
    }
    vehicle.status = status;
    await vehicle.save();
    res.json(ok(vehicle, `Vehicle status updated to ${status}.`));
  } catch (err) {
    next(err);
  }
}

export async function deleteVehicle(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) {
      throw new ApiError(404, 'Vehicle not found.');
    }
    res.json(ok({ id: req.params.id, deleted: true }, 'Vehicle deleted successfully.'));
  } catch (err) {
    next(err);
  }
}

export default {
  listVehicles,
  getVehicle,
  getAvailableVehicles,
  getVehicleStats,
  createVehicle,
  updateVehicle,
  updateVehicleStatus,
  deleteVehicle,
};
