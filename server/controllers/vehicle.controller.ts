import { NextFunction, Request, Response } from 'express';
import { Vehicle, VEHICLE_STATUSES } from '../models/Vehicle';
import { sendError, sendSuccess } from '../utils/ApiResponse';
import { paginate, toObjectId } from '../utils/helpers';

/** Client-facing vehicle shape: capacity + driver mapped for the UI. */
const serializeVehicle = (v: any): any => {
  const doc = v.toObject ? v.toObject() : v;
  const { currentDriver, maxWeightKg, maxVolumeCubicMeters, fuelEfficiencyKmPerLiter, ...rest } = doc;

  const driver = currentDriver
    ? {
        name: `${currentDriver.firstName || ''} ${currentDriver.lastName || ''}`.trim(),
        phone: currentDriver.phone,
        license: currentDriver.licenseNumber,
      }
    : undefined;

  return {
    ...rest,
    capacity: { weight: maxWeightKg ?? 0, volume: maxVolumeCubicMeters ?? 0 },
    fuelEfficiency: fuelEfficiencyKmPerLiter ?? 0,
    driver,
  };
};

export const listVehicles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const filter: Record<string, unknown> = {};

    if (req.query.status) filter.status = String(req.query.status);
    const search = String(req.query.search || '').trim();
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(escaped, 'i');
      filter.$or = [{ registrationNumber: re }, { make: re }, { model: re }];
    }

    const [vehicles, total] = await Promise.all([
      Vehicle.find(filter).populate('currentDriver').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Vehicle.countDocuments(filter),
    ]);

    return sendSuccess(res, {
      vehicles: vehicles.map(serializeVehicle),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

export const getAvailable = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vehicles = await Vehicle.find({ status: 'AVAILABLE' })
      .populate('currentDriver')
      .sort({ maxWeightKg: 1 });
    return sendSuccess(res, { vehicles: vehicles.map(serializeVehicle) });
  } catch (err) {
    next(err);
  }
};

export const getStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [total, available, inTransit, maintenance] = await Promise.all([
      Vehicle.countDocuments({}),
      Vehicle.countDocuments({ status: 'AVAILABLE' }),
      Vehicle.countDocuments({ status: 'IN_TRANSIT' }),
      Vehicle.countDocuments({ status: 'MAINTENANCE' }),
    ]);
    return sendSuccess(res, { total, available, inTransit, maintenance });
  } catch (err) {
    next(err);
  }
};

/** Map flexible create/update payloads (capacity.weight/volume) to schema fields. */
const mapVehicleInput = (body: Record<string, any>) => {
  const capacity = body.capacity || {};
  return {
    registrationNumber: body.registrationNumber,
    make: body.make,
    model: body.model,
    year: body.year,
    maxWeightKg: Number(body.weightCapacity ?? capacity.weight ?? body.maxWeightKg ?? 0),
    maxVolumeCubicMeters: Number(
      body.volumeCapacity ?? capacity.volume ?? body.maxVolumeCubicMeters ?? 0,
    ),
    status: body.status ?? 'AVAILABLE',
    currentDriver: body.currentDriver ?? body.driverId,
    fuelEfficiencyKmPerLiter: Number(body.fuelEfficiency ?? body.fuelEfficiencyKmPerLiter ?? 0),
    lastMaintenanceDate: body.lastMaintenanceDate,
  };
};

export const createVehicle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = mapVehicleInput(req.body);
    if (!data.registrationNumber || !data.make || !data.model) {
      return sendError(res, 400, 'registrationNumber, make and model are required');
    }
    if (!VEHICLE_STATUSES.includes(data.status)) {
      return sendError(res, 400, 'Invalid vehicle status');
    }

    const dup = await Vehicle.findOne({ registrationNumber: data.registrationNumber });
    if (dup) return sendError(res, 409, 'A vehicle with this registration number already exists');

    const vehicle = await Vehicle.create(data);
    return sendSuccess(
      res,
      { vehicle: serializeVehicle(vehicle) },
      'Vehicle created',
      201,
    );
  } catch (err) {
    next(err);
  }
};

export const updateVehicle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = toObjectId(req.params.id);
    const vehicle = id ? await Vehicle.findById(id).populate('currentDriver') : null;
    if (!vehicle) return sendError(res, 404, 'Vehicle not found');

    const data = mapVehicleInput(req.body);
    if (data.status && !VEHICLE_STATUSES.includes(data.status)) {
      return sendError(res, 400, 'Invalid vehicle status');
    }

    Object.assign(vehicle, {
      ...(data.registrationNumber ? { registrationNumber: data.registrationNumber } : {}),
      ...(data.make ? { make: data.make } : {}),
      ...(data.model ? { model: data.model } : {}),
      ...(data.year ? { year: data.year } : {}),
      ...(data.maxWeightKg !== 0 ? { maxWeightKg: data.maxWeightKg } : {}),
      ...(data.maxVolumeCubicMeters !== 0
        ? { maxVolumeCubicMeters: data.maxVolumeCubicMeters }
        : {}),
      ...(data.status ? { status: data.status } : {}),
      ...(data.fuelEfficiencyKmPerLiter !== 0
        ? { fuelEfficiencyKmPerLiter: data.fuelEfficiencyKmPerLiter }
        : {}),
      ...(data.lastMaintenanceDate ? { lastMaintenanceDate: data.lastMaintenanceDate } : {}),
    });
    if (data.currentDriver !== undefined) vehicle.currentDriver = data.currentDriver;

    await vehicle.save();
    const updated = await Vehicle.findById(vehicle._id).populate('currentDriver');
    return sendSuccess(res, { vehicle: serializeVehicle(updated) }, 'Vehicle updated');
  } catch (err) {
    next(err);
  }
};

export const updateVehicleStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = toObjectId(req.params.id);
    const vehicle = id ? await Vehicle.findById(id).populate('currentDriver') : null;
    if (!vehicle) return sendError(res, 404, 'Vehicle not found');

    const { status } = req.body;
    if (!VEHICLE_STATUSES.includes(status)) {
      return sendError(res, 400, 'Invalid vehicle status');
    }

    vehicle.status = status;
    if (status === 'AVAILABLE') vehicle.currentDriver = undefined;

    await vehicle.save();
    const updated = await Vehicle.findById(vehicle._id).populate('currentDriver');
    return sendSuccess(res, { vehicle: serializeVehicle(updated) }, 'Vehicle status updated');
  } catch (err) {
    next(err);
  }
};

export const deleteVehicle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = toObjectId(req.params.id);
    const vehicle = id ? await Vehicle.findById(id) : null;
    if (!vehicle) return sendError(res, 404, 'Vehicle not found');

    if (vehicle.status === 'IN_TRANSIT') {
      return sendError(res, 400, 'Cannot delete a vehicle that is currently In-Transit');
    }

    await vehicle.deleteOne();
    return sendSuccess(res, {}, 'Vehicle deleted');
  } catch (err) {
    next(err);
  }
};
