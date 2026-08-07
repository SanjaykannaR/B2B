// Controller for: Manifest lifecycle - create, assign, start-trip, status, complete
// Module: Backend Controllers (Module 5) | Owner: Developer 1
// Handles: cargo validation, route calc, timeline, driver assignment, invoice trigger

import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Manifest, { ManifestDocument, ManifestStatus } from '../models/Manifest';
import Vehicle, { VehicleDocument } from '../models/Vehicle';
import Notification from '../models/Notification';
import ApiError from '../utils/ApiError';
import { ok } from '../utils/ApiResponse';
import { generateTrackingId, parsePage, toPaginationMeta } from '../utils/helpers';
import { calculateRoute } from '../services/routeCalculator';
import { findMatchingVehicles } from '../services/capacityMatcher';
import { generateInvoice } from '../services/invoiceGenerator';

const VALID_STATUSES: ManifestStatus[] = ['Pending', 'Assigned', 'In-Transit', 'Delivered', 'Delayed', 'Cancelled'];

function pushTimeline(manifest: ManifestDocument, status: ManifestStatus, note?: string): void {
  manifest.statusTimeline.push({ status, at: new Date(), note });
  manifest.currentStatus = status;
}

export async function listManifests(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { page, limit } = parsePage(req.query as Record<string, unknown>);
    const filter: Record<string, unknown> = {};

    const status = req.query.status as string | undefined;
    if (status) {
      if (!VALID_STATUSES.includes(status as ManifestStatus)) {
        throw new ApiError(400, `Invalid status filter. Allowed: ${VALID_STATUSES.join(', ')}`);
      }
      filter.currentStatus = status;
    }

    if (req.query.client) {
      filter.client = req.query.client;
    }

    const search = req.query.search as string | undefined;
    if (search) {
      filter.$or = [
        { trackingId: { $regex: search, $options: 'i' } },
        { 'routing.origin.name': { $regex: search, $options: 'i' } },
        { 'routing.destination.name': { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Manifest.countDocuments(filter);
    const manifests = await Manifest.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('client', 'firstName lastName email company')
      .populate('driver', 'firstName lastName email')
      .populate('vehicle', 'registrationNumber make model');

    res.json(ok({ items: manifests, ...toPaginationMeta(total, page, limit) }));
  } catch (err) {
    next(err);
  }
}

export async function getMyManifests(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { page, limit } = parsePage(req.query as Record<string, unknown>);
    const clientId = (req as Request & { user: { _id: unknown } }).user._id;
    const filter = { client: clientId };
    const total = await Manifest.countDocuments(filter);
    const manifests = await Manifest.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('driver', 'firstName lastName email')
      .populate('vehicle', 'registrationNumber make model');

    res.json(ok({ items: manifests, ...toPaginationMeta(total, page, limit) }));
  } catch (err) {
    next(err);
  }
}

export async function getDriverManifests(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const driverId = (req as Request & { user: { _id: unknown } }).user._id;
    const manifests = await Manifest.find({ driver: driverId })
      .sort({ scheduledPickup: 1 })
      .populate('client', 'firstName lastName email company')
      .populate('vehicle', 'registrationNumber make model');

    res.json(ok(manifests));
  } catch (err) {
    next(err);
  }
}

export async function getManifest(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const manifest = await Manifest.findById(req.params.id)
      .populate('client', 'firstName lastName email company phone')
      .populate('driver', 'firstName lastName email phone licenseNumber')
      .populate('vehicle', 'registrationNumber make model maxWeightKg maxVolumeCubicMeters');
    if (!manifest) {
      throw new ApiError(404, 'Manifest not found.');
    }
    res.json(ok(manifest));
  } catch (err) {
    next(err);
  }
}

export async function getManifestByTrackingId(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const manifest = await Manifest.findOne({ trackingId: req.params.trackingId })
      .populate('client', 'firstName lastName email company')
      .populate('driver', 'firstName lastName email phone')
      .populate('vehicle', 'registrationNumber make model');
    if (!manifest) {
      throw new ApiError(404, `No shipment found with tracking ID ${req.params.trackingId}.`);
    }
    res.json(ok(manifest));
  } catch (err) {
    next(err);
  }
}

export async function createManifest(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { client, cargoDetails, routing, scheduledPickup, scheduledDeliveryWindowClose, driver, vehicle } = req.body as {
      client?: string;
      cargoDetails: { description: string; weight: number; volume: number; itemCount: number; hazardous?: boolean };
      routing: {
        origin: { name: string; latitude: number; longitude: number };
        destination: { name: string; latitude: number; longitude: number };
      };
      scheduledPickup?: string;
      scheduledDeliveryWindowClose?: string;
      driver?: string;
      vehicle?: string;
    };

    // Clients self-serve: their manifests are always created in their own name.
    const role = req.user?.role;
    const clientId = role === 'client' ? req.user!.id : client;

    if (!clientId || !cargoDetails || !routing?.origin || !routing?.destination) {
      throw new ApiError(400, 'client, cargoDetails and routing (origin + destination) are required.');
    }

    if (typeof cargoDetails.weight !== 'number' || cargoDetails.weight <= 0) {
      throw new ApiError(400, 'Cargo weight must be a positive number.');
    }
    if (typeof cargoDetails.volume !== 'number' || cargoDetails.volume <= 0) {
      throw new ApiError(400, 'Cargo volume must be a positive number.');
    }

    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      throw new ApiError(400, 'Invalid client ID.');
    }

    if (vehicle) {
      const found = await Vehicle.findById(vehicle);
      if (!found) throw new ApiError(400, 'Selected vehicle not found.');
      if (found.maxWeightKg < cargoDetails.weight || found.maxVolumeCubicMeters < cargoDetails.volume) {
        throw new ApiError(400, `Selected vehicle lacks capacity (max ${found.maxWeightKg} kg / ${found.maxVolumeCubicMeters} m³).`);
      }
    }

    const { distanceKm, estimatedDurationMinutes } = calculateRoute(routing.origin, routing.destination);

    const trackingId = generateTrackingId();
    const statusTimeline = [{ status: 'Pending' as ManifestStatus, at: new Date(), note: 'Manifest created' }];

    const manifest = await Manifest.create({
      trackingId,
      client: clientId,
      driver: driver || undefined,
      vehicle: vehicle || undefined,
      cargoDetails: {
        description: cargoDetails.description,
        weight: cargoDetails.weight,
        volume: cargoDetails.volume,
        itemCount: cargoDetails.itemCount,
        hazardous: cargoDetails.hazardous ?? false,
      },
      routing: {
        origin: routing.origin,
        destination: routing.destination,
        distanceKm,
        estimatedDurationMinutes,
      },
      currentStatus: 'Pending',
      statusTimeline,
      scheduledPickup: scheduledPickup ? new Date(scheduledPickup) : new Date(),
      scheduledDeliveryWindowClose: scheduledDeliveryWindowClose
        ? new Date(scheduledDeliveryWindowClose)
        : new Date(Date.now() + estimatedDurationMinutes * 60000),
    });

    res.status(201).json(ok(manifest, 'Manifest created successfully.'));
  } catch (err) {
    next(err);
  }
}

export async function updateManifest(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const manifest = await Manifest.findById(req.params.id);
    if (!manifest) {
      throw new ApiError(404, 'Manifest not found.');
    }
    if (manifest.currentStatus !== 'Pending') {
      throw new ApiError(400, 'Only Pending manifests can be edited.');
    }

    const allowedFields = ['cargoDetails', 'routing', 'scheduledPickup', 'scheduledDeliveryWindowClose'] as const;
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        (manifest as unknown as Record<string, unknown>)[field] = req.body[field];
      }
    }

    if (req.body.routing?.origin?.latitude !== undefined && req.body.routing?.destination?.latitude !== undefined) {
      const { distanceKm, estimatedDurationMinutes } = calculateRoute(
        manifest.routing.origin,
        manifest.routing.destination
      );
      manifest.routing.distanceKm = distanceKm;
      manifest.routing.estimatedDurationMinutes = estimatedDurationMinutes;
    }

    await manifest.save();
    res.json(ok(manifest, 'Manifest updated successfully.'));
  } catch (err) {
    next(err);
  }
}

export async function assignManifest(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { driverId, vehicleId } = req.body as { driverId?: string; vehicleId?: string };
    if (!driverId || !vehicleId) {
      throw new ApiError(400, 'Both driverId and vehicleId are required.');
    }

    const manifest = await Manifest.findById(req.params.id);
    if (!manifest) {
      throw new ApiError(404, 'Manifest not found.');
    }
    if (manifest.currentStatus !== 'Pending' && manifest.currentStatus !== 'Delayed') {
      throw new ApiError(400, `Cannot assign a manifest with status "${manifest.currentStatus}".`);
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      throw new ApiError(400, 'Vehicle not found.');
    }
    if (vehicle.status !== 'Available') {
      throw new ApiError(400, `Vehicle is ${vehicle.status} and cannot be assigned.`);
    }
    if (vehicle.maxWeightKg < manifest.cargoDetails.weight || vehicle.maxVolumeCubicMeters < manifest.cargoDetails.volume) {
      throw new ApiError(400, 'Vehicle lacks capacity for this cargo.');
    }

    manifest.driver = driverId as unknown as ManifestDocument['driver'];
    manifest.vehicle = vehicleId as unknown as ManifestDocument['vehicle'];
    pushTimeline(manifest, 'Assigned', `Assigned to vehicle ${vehicle.registrationNumber}`);

    await manifest.save();

    vehicle.status = 'In-Transit';
    vehicle.currentDriver = driverId as unknown as VehicleDocument['currentDriver'];
    await vehicle.save();

    await Notification.create({
      recipient: driverId,
      title: 'New Delivery Assigned',
      message: `You have been assigned manifest ${manifest.trackingId} (${manifest.routing.origin.name} → ${manifest.routing.destination.name}).`,
      type: 'info',
      relatedManifest: manifest._id,
    });

    res.json(ok(manifest, 'Manifest assigned successfully.'));
  } catch (err) {
    next(err);
  }
}

export async function startTrip(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const manifest = await Manifest.findById(req.params.id);
    if (!manifest) {
      throw new ApiError(404, 'Manifest not found.');
    }
    if (manifest.currentStatus !== 'Assigned') {
      throw new ApiError(400, `Only Assigned manifests can start a trip (current: ${manifest.currentStatus}).`);
    }

    const timestamp = req.body.timestamp ? new Date(req.body.timestamp) : new Date();
    manifest.tripStartTimestamp = timestamp;
    pushTimeline(manifest, 'In-Transit', 'Trip started');

    await manifest.save();
    res.json(ok(manifest, 'Trip started.'));
  } catch (err) {
    next(err);
  }
}

export async function updateManifestStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { status, note } = req.body as { status?: ManifestStatus; note?: string };
    if (!status || !VALID_STATUSES.includes(status)) {
      throw new ApiError(400, `Invalid status. Allowed: ${VALID_STATUSES.join(', ')}`);
    }

    const manifest = await Manifest.findById(req.params.id);
    if (!manifest) {
      throw new ApiError(404, 'Manifest not found.');
    }

    pushTimeline(manifest, status, note || `Status changed to ${status}`);
    if (status === 'In-Transit' && !manifest.tripStartTimestamp) {
      manifest.tripStartTimestamp = new Date();
    }
    if (status === 'Delivered' && !manifest.actualDeliveryTime) {
      manifest.actualDeliveryTime = new Date();
    }

    await manifest.save();
    res.json(ok(manifest, `Status updated to ${status}.`));
  } catch (err) {
    next(err);
  }
}

export async function completeDelivery(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const manifest = await Manifest.findById(req.params.id)
      .populate('client', 'firstName lastName email company contractRate');
    if (!manifest) {
      throw new ApiError(404, 'Manifest not found.');
    }
    if (manifest.currentStatus === 'Delivered') {
      throw new ApiError(400, 'Manifest is already delivered.');
    }

    manifest.actualDeliveryTime = new Date();
    pushTimeline(manifest, 'Delivered', req.body?.note || 'Delivery completed');

    await manifest.save();

    const vehicle = manifest.vehicle ? await Vehicle.findById(manifest.vehicle) : null;
    if (vehicle) {
      vehicle.status = 'Available';
      vehicle.currentDriver = undefined;
      await vehicle.save();
    }

    const client = manifest.client as unknown as { _id: string; contractRate?: number };
    await generateInvoice({
      manifestId: manifest._id.toString(),
      clientId: client._id.toString(),
      distanceKm: manifest.routing.distanceKm,
      weight: manifest.cargoDetails.weight,
      contractRate: client.contractRate ?? 0,
      description: manifest.cargoDetails.description,
    });

    await Notification.create({
      recipient: manifest.client,
      title: 'Delivery Completed',
      message: `Shipment ${manifest.trackingId} was delivered successfully. An invoice has been generated.`,
      type: 'success',
      relatedManifest: manifest._id,
    });

    res.json(ok(manifest, 'Delivery completed and invoice generated.'));
  } catch (err) {
    next(err);
  }
}

export async function cancelManifest(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const manifest = await Manifest.findById(req.params.id);
    if (!manifest) {
      throw new ApiError(404, 'Manifest not found.');
    }
    if (['Delivered', 'Cancelled'].includes(manifest.currentStatus)) {
      throw new ApiError(400, `Cannot cancel a manifest with status "${manifest.currentStatus}".`);
    }

    pushTimeline(manifest, 'Cancelled', req.body?.note || 'Cancelled');

    const vehicle = manifest.vehicle ? await Vehicle.findById(manifest.vehicle) : null;
    if (vehicle && vehicle.status === 'In-Transit') {
      vehicle.status = 'Available';
      vehicle.currentDriver = undefined;
      await vehicle.save();
    }

    await manifest.save();
    res.json(ok(manifest, 'Manifest cancelled.'));
  } catch (err) {
    next(err);
  }
}

export async function getCapacitySuggestions(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const manifest = await Manifest.findById(req.params.id);
    if (!manifest) {
      throw new ApiError(404, 'Manifest not found.');
    }
    const vehicles = await findMatchingVehicles(manifest.cargoDetails, 5);
    res.json(ok(vehicles));
  } catch (err) {
    next(err);
  }
}

export default {
  listManifests,
  getMyManifests,
  getDriverManifests,
  getManifest,
  getManifestByTrackingId,
  createManifest,
  updateManifest,
  assignManifest,
  startTrip,
  updateManifestStatus,
  completeDelivery,
  cancelManifest,
  getCapacitySuggestions,
};
