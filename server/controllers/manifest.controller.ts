import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';
import { User } from '../models/User';
import { Vehicle } from '../models/Vehicle';
import { Manifest } from '../models/Manifest';
import { sendError, sendSuccess } from '../utils/ApiResponse';
import { paginate, toObjectId, userDisplay, generateTrackingId } from '../utils/helpers';
import { routeFromCoords } from '../services/routeCalculator';
import { notify } from '../services/notificationService';

const POPULATE = [
  { path: 'client', select: 'firstName lastName email phone company contractRate' },
  { path: 'driver', select: 'firstName lastName email phone company licenseNumber' },
  { path: 'vehicle', select: 'registrationNumber make model maxWeightKg maxVolumeCubicMeters' },
];

/** Client-facing manifest shape: uppercase status, populated refs, currentLocation. */
export const serializeManifest = (m: any): any => {
  const doc = m.toObject ? m.toObject() : m;
  const { currentStatus, lastLocation, client, driver, vehicle, ...rest } = doc;

  const displayRef = (u: any) =>
    u && typeof u === 'object' && (u.firstName || u.lastName || u.company)
      ? userDisplay(u)
      : u;

  return {
    ...rest,
    status: currentStatus,
    client: displayRef(client),
    driver: displayRef(driver),
    vehicle: vehicle
      ? {
          _id: vehicle._id?.toString?.() ?? vehicle._id,
          registrationNumber: vehicle.registrationNumber,
          make: vehicle.make,
          model: vehicle.model,
        }
      : vehicle,
    currentLocation:
      lastLocation && lastLocation.lat != null && lastLocation.lng != null
        ? {
            coordinates: [lastLocation.lng, lastLocation.lat],
            heading: lastLocation.heading,
            updatedAt: lastLocation.updatedAt,
          }
        : undefined,
  };
};

const notifyAdmins = async (
  title: string,
  message: string,
  type: 'info' | 'warning' | 'success' | 'error' = 'info',
  relatedManifest?: Types.ObjectId | null,
) => {
  const admins = await User.find({ role: 'admin', isActive: true }).select('_id');
  await Promise.all(
    admins.map((a) => notify({ recipient: a._id, title, message, type, relatedManifest })),
  );
};

const pushTimeline = (manifest: any, status: string, note: string, updatedBy: string) => {
  manifest.statusTimeline.push({ status, timestamp: new Date(), note, updatedBy });
};

const resolveClient = async (body: Record<string, any>, role: string, userId: Types.ObjectId) => {
  // Role-aware: a client always creates for itself.
  if (role === 'client') return userId;

  const explicit = body.clientId || body.client;
  if (explicit) {
    const id = toObjectId(explicit);
    const u = id ? await User.findById(id) : null;
    if (!u || u.role !== 'client') return null;
    return u._id;
  }

  // Wizard path: free-text client name → match by company or full name.
  if (body.clientName) {
    const name = String(body.clientName).trim();
    const re = new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const u = await User.findOne({
      role: 'client',
      isActive: true,
      $or: [{ company: re }, { $expr: { $regexMatch: { input: { $concat: ['$firstName', ' ', '$lastName'] }, regex: re } } }],
    });
    return u ? u._id : null;
  }
  return null;
};

export const listManifests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = paginate(req.query.page, req.query.limit);
    const filter: Record<string, unknown> = {};

    if (req.query.status) filter.currentStatus = String(req.query.status).toUpperCase();
    if (req.query.requestStatus) filter.requestStatus = String(req.query.requestStatus).toUpperCase();
    if (req.query.client) {
      const cid = toObjectId(String(req.query.client));
      if (cid) filter.client = cid;
    }
    if (req.query.startDate || req.query.endDate) {
      const dateFilter: { $gte?: Date; $lte?: Date } = {};
      if (req.query.startDate) dateFilter.$gte = new Date(String(req.query.startDate));
      if (req.query.endDate) dateFilter.$lte = new Date(String(req.query.endDate));
      filter.createdAt = dateFilter;
    }

    const search = String(req.query.search || '').trim();
    if (search) {
      const re = new RegExp(search, 'i');
      filter.$or = [
        { trackingId: re },
        { 'routing.origin.city': re },
        { 'routing.destination.city': re },
        { 'cargoDetails.description': re },
      ];
    }

    const [manifests, total] = await Promise.all([
      Manifest.find(filter).populate(POPULATE).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Manifest.countDocuments(filter),
    ]);

    return sendSuccess(res, {
      manifests: manifests.map(serializeManifest),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = toObjectId(req.params.id);
    let manifest = id ? await Manifest.findById(id).populate(POPULATE) : null;
    if (!manifest) {
      manifest = await Manifest.findOne({ trackingId: req.params.id }).populate(POPULATE);
    }
    if (!manifest) return sendError(res, 404, 'Manifest not found');

    const user = req.user!;
    if (user.role === 'client' && manifest.client.toString() !== user._id.toString()) {
      return sendError(res, 403, 'Forbidden. This manifest does not belong to you.');
    }
    if (user.role === 'driver') {
      const isOwn =
        manifest.driver?.toString() === user._id.toString() ||
        manifest.driverRequest?.driverId?.toString() === user._id.toString();
      if (!isOwn) return sendError(res, 403, 'Forbidden. This manifest is not assigned to you.');
    }

    return sendSuccess(res, { manifest: serializeManifest(manifest) });
  } catch (err) {
    next(err);
  }
};

// ── Client / Driver page endpoints (owned by another developer's team) ────────
// COMMENTED OUT pending their git merge — reconnect when their code lands.
// export const getMy = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const user = req.user!;
//     const manifests = await Manifest.find({ client: user._id })
//       .populate(POPULATE)
//       .sort({ createdAt: -1 });
//     return sendSuccess(res, { manifests: manifests.map(serializeManifest) });
//   } catch (err) {
//     next(err);
//   }
// };
//
// export const getDriverManifests = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const user = req.user!;
//     const manifests = await Manifest.find({
//       $or: [
//         { driver: user._id },
//         { 'driverRequest.driverId': user._id },
//       ],
//     })
//       .populate(POPULATE)
//       .sort({ createdAt: -1 });
//     return sendSuccess(res, { manifests: manifests.map(serializeManifest) });
//   } catch (err) {
//     next(err);
//   }
// };

export const createManifest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const body = req.body;

    const clientId = await resolveClient(body, user.role, user._id);
    if (!clientId) {
      return sendError(
        res,
        400,
        'Client not found. Create the client account first (Settings → Create User), or pass a valid clientId.',
      );
    }

    // Cargo details — supports both structured (cargoDetails) and wizard (flat) shapes.
    const cargoDetails = {
      description: body.cargoDetails?.description ?? body.description,
      totalWeightKg: Number(body.cargoDetails?.totalWeightKg ?? body.weight ?? 0),
      totalVolumeCubicMeters: Number(
        body.cargoDetails?.totalVolumeCubicMeters ?? body.volume ?? 0,
      ),
      itemCount: Number(body.cargoDetails?.itemCount ?? body.itemCount ?? 1),
      isHazardous: Boolean(body.cargoDetails?.isHazardous ?? body.hazmat ?? false),
    };
    if (!cargoDetails.description || cargoDetails.totalWeightKg <= 0) {
      return sendError(res, 400, 'Cargo description and positive weight are required');
    }

    // Routing — supports both nested (routing) and flat (origin/destination) shapes.
    const routingBody = body.routing || body;
    const origin = {
      address: routingBody.origin?.address,
      city: routingBody.origin?.city,
      state: routingBody.origin?.state,
      zipCode: routingBody.origin?.zipCode,
      country: routingBody.origin?.country,
      coordinates: routingBody.origin?.coordinates
        ? (routingBody.origin.coordinates as [number, number])
        : undefined,
    };
    const destination = {
      address: routingBody.destination?.address,
      city: routingBody.destination?.city,
      state: routingBody.destination?.state,
      zipCode: routingBody.destination?.zipCode,
      country: routingBody.destination?.country,
      coordinates: routingBody.destination?.coordinates
        ? (routingBody.destination.coordinates as [number, number])
        : undefined,
    };

    const estimate = routeFromCoords(origin.coordinates, destination.coordinates);

    const now = new Date();
    const manifest = await Manifest.create({
      trackingId: generateTrackingId(),
      client: clientId,
      gstNumber: body.gstNumber,
      vehicle: body.assignedVehicle || body.vehicle || undefined,
      cargoDetails,
      routing: {
        origin,
        destination,
        estimatedDistanceKm: estimate?.estimatedDistanceKm ?? body.estimatedDistanceKm,
        estimatedDurationMinutes:
          estimate?.estimatedDurationMinutes ?? body.estimatedDurationMinutes,
      },
      currentStatus: 'PENDING',
      requestStatus: 'PENDING',
      statusTimeline: [
        {
          status: 'PENDING',
          timestamp: now,
          note: user.role === 'client' ? 'Order placed by client' : 'Manifest created',
          updatedBy: user.role,
        },
      ],
      scheduledPickup: body.scheduledPickup,
      scheduledDeliveryWindowClose: body.scheduledDeliveryWindowClose,
    });

    // Notify admins of a new client order.
    if (user.role === 'client') {
      await notifyAdmins(
        `New client request: ${manifest.trackingId}`,
        `${user.firstName} ${user.lastName} placed a new delivery request (${cargoDetails.description}).`,
        'info',
        manifest._id,
      );
    }

    const full = await Manifest.findById(manifest._id).populate(POPULATE);
    return sendSuccess(res, { manifest: serializeManifest(full) }, 'Manifest created', 201);
  } catch (err) {
    next(err);
  }
};

export const updateManifest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = toObjectId(req.params.id);
    const manifest = id ? await Manifest.findById(id) : null;
    if (!manifest) return sendError(res, 404, 'Manifest not found');

    const { gstNumber, cargoDetails, routing, scheduledPickup, scheduledDeliveryWindowClose } =
      req.body;

    if (gstNumber !== undefined) manifest.gstNumber = gstNumber;
    if (cargoDetails !== undefined) {
      manifest.cargoDetails = { ...manifest.cargoDetails, ...cargoDetails };
    }
    if (routing !== undefined) {
      if (routing.origin) {
        manifest.routing.origin = { ...manifest.routing.origin, ...routing.origin };
      }
      if (routing.destination) {
        manifest.routing.destination = {
          ...manifest.routing.destination,
          ...routing.destination,
        };
      }
      const estimate = routeFromCoords(
        manifest.routing.origin.coordinates as [number, number] | undefined,
        manifest.routing.destination.coordinates as [number, number] | undefined,
      );
      if (estimate) {
        manifest.routing.estimatedDistanceKm = estimate.estimatedDistanceKm;
        manifest.routing.estimatedDurationMinutes = estimate.estimatedDurationMinutes;
      }
    }
    if (scheduledPickup !== undefined) manifest.scheduledPickup = scheduledPickup;
    if (scheduledDeliveryWindowClose !== undefined)
      manifest.scheduledDeliveryWindowClose = scheduledDeliveryWindowClose;

    pushTimeline(manifest, manifest.currentStatus, 'Manifest details updated', 'admin');
    await manifest.save();

    const full = await Manifest.findById(manifest._id).populate(POPULATE);
    return sendSuccess(res, { manifest: serializeManifest(full) }, 'Manifest updated');
  } catch (err) {
    next(err);
  }
};

export const approveManifest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = toObjectId(req.params.id);
    const manifest = id ? await Manifest.findById(id) : null;
    if (!manifest) return sendError(res, 404, 'Manifest not found');
    if (manifest.requestStatus !== 'PENDING') {
      return sendError(res, 400, `Request is already ${manifest.requestStatus}`);
    }

    manifest.requestStatus = 'APPROVED';
    pushTimeline(manifest, 'PENDING', 'Approved by admin — awaiting dispatch', 'admin');
    await manifest.save();

    await notify(
      {
        recipient: manifest.client,
        title: `Request approved: ${manifest.trackingId}`,
        message: 'Your delivery request has been approved. We will assign a vehicle shortly.',
        type: 'success',
        relatedManifest: manifest._id,
      },
    );

    const full = await Manifest.findById(manifest._id).populate(POPULATE);
    return sendSuccess(res, { manifest: serializeManifest(full) }, 'Request approved');
  } catch (err) {
    next(err);
  }
};

export const rejectManifest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = toObjectId(req.params.id);
    const manifest = id ? await Manifest.findById(id) : null;
    if (!manifest) return sendError(res, 404, 'Manifest not found');
    if (manifest.requestStatus !== 'PENDING') {
      return sendError(res, 400, `Request is already ${manifest.requestStatus}`);
    }

    const reason = String(req.body.reason || req.body.note || '').trim();
    manifest.requestStatus = 'REJECTED';
    manifest.currentStatus = 'CANCELLED';
    manifest.delayReason = reason || 'Rejected by admin';
    pushTimeline(manifest, 'CANCELLED', reason || 'Rejected by admin', 'admin');
    await manifest.save();

    await notify(
      {
        recipient: manifest.client,
        title: `Request rejected: ${manifest.trackingId}`,
        message: reason || 'Your delivery request was rejected.',
        type: 'error',
        relatedManifest: manifest._id,
      },
    );

    const full = await Manifest.findById(manifest._id).populate(POPULATE);
    return sendSuccess(res, { manifest: serializeManifest(full) }, 'Request rejected');
  } catch (err) {
    next(err);
  }
};

export const contactManifest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = toObjectId(req.params.id);
    const manifest = id ? await Manifest.findById(id) : null;
    if (!manifest) return sendError(res, 404, 'Manifest not found');

    manifest.requestStatus = 'CONTACTED';
    pushTimeline(manifest, manifest.currentStatus, 'Client contacted by admin', 'admin');
    await manifest.save();

    const full = await Manifest.findById(manifest._id).populate(POPULATE);
    return sendSuccess(res, { manifest: serializeManifest(full) }, 'Request marked as contacted');
  } catch (err) {
    next(err);
  }
};

export const sendDriverRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = toObjectId(req.params.id);
    const manifest = id ? await Manifest.findById(id) : null;
    if (!manifest) return sendError(res, 404, 'Manifest not found');

    if (!['PENDING', 'ASSIGNED'].includes(manifest.currentStatus)) {
      return sendError(res, 400, `Cannot dispatch a ${manifest.currentStatus} manifest`);
    }
    if (manifest.driverRequest?.status === 'pending') {
      return sendError(res, 400, 'A driver request is already pending. Wait for a response or decline.');
    }

    const { driverId, vehicleId } = req.body;
    const dId = toObjectId(driverId);
    const vId = toObjectId(vehicleId);
    if (!dId || !vId) return sendError(res, 400, 'driverId and vehicleId are required');

    const driver = await User.findById(dId);
    if (!driver || driver.role !== 'driver' || !driver.isActive) {
      return sendError(res, 400, 'Driver not found or inactive');
    }

    const vehicle = await Vehicle.findById(vId);
    if (!vehicle) return sendError(res, 404, 'Vehicle not found');
    if (vehicle.status !== 'AVAILABLE') {
      return sendError(res, 400, 'Vehicle is not available');
    }

    manifest.driverRequest = {
      driverId: dId,
      vehicleId: vId,
      status: 'pending',
      sentAt: new Date(),
    };
    pushTimeline(
      manifest,
      manifest.currentStatus,
      `Delivery request sent to ${driver.firstName} ${driver.lastName}`,
      'admin',
    );
    await manifest.save();

    await notify(
      {
        recipient: dId,
        title: `New delivery request: ${manifest.trackingId}`,
        message: `${manifest.cargoDetails.description} from ${manifest.routing.origin?.city || 'Origin'} to ${manifest.routing.destination?.city || 'Destination'}.`,
        type: 'info',
        relatedManifest: manifest._id,
      },
    );

    const full = await Manifest.findById(manifest._id).populate(POPULATE);
    return sendSuccess(res, { manifest: serializeManifest(full) }, 'Driver request sent');
  } catch (err) {
    next(err);
  }
};

// export const myDeliveryRequests = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const user = req.user!;
//     const manifests = await Manifest.find({
//       'driverRequest.driverId': user._id,
//       'driverRequest.status': 'pending',
//     })
//       .populate(POPULATE)
//       .sort({ 'driverRequest.sentAt': -1 });
//     return sendSuccess(res, { manifests: manifests.map(serializeManifest) });
//   } catch (err) {
//     next(err);
//   }
// };
//
// const findManifestByDriverRequestId = async (requestId: string) => {
//   const id = toObjectId(requestId);
//   return id ? Manifest.findOne({ 'driverRequest._id': id }) : null;
// };
//
// export const acceptDriverRequest = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const user = req.user!;
//     const manifest = await findManifestByDriverRequestId(req.params.id);
//     if (!manifest || manifest.driverRequest?.status !== 'pending') {
//       return sendError(res, 404, 'Pending delivery request not found');
//     }
//     if (manifest.driverRequest.driverId.toString() !== user._id.toString()) {
//       return sendError(res, 403, 'This request was not sent to you');
//     }
//
//     const driverId = manifest.driverRequest.driverId;
//     const vehicleId = manifest.driverRequest.vehicleId;
//
//     manifest.driverRequest.status = 'accepted';
//     manifest.driverRequest.respondedAt = new Date();
//     manifest.driver = driverId;
//     manifest.vehicle = vehicleId;
//     manifest.currentStatus = 'ASSIGNED';
//     pushTimeline(
//       manifest,
//       'ASSIGNED',
//       `${user.firstName} ${user.lastName} accepted the delivery request`,
//       'driver',
//     );
//     await manifest.save();
//
//     const vehicle = await Vehicle.findById(vehicleId);
//     if (vehicle) {
//       vehicle.status = 'IN_TRANSIT';
//       vehicle.currentDriver = driverId;
//       await vehicle.save();
//     }
//
//     const client = manifest.client;
//     await notifyAdmins(
//       `Driver accepted: ${manifest.trackingId}`,
//       `${user.firstName} ${user.lastName} accepted delivery for ${manifest.trackingId}.`,
//       'success',
//       manifest._id,
//     );
//     await notify(
//       {
//         recipient: client,
//         title: `Delivery assigned: ${manifest.trackingId}`,
//         message: 'A driver has accepted your delivery. Tracking will go live when the trip starts.',
//         type: 'success',
//         relatedManifest: manifest._id,
//       },
//     );
//
//     const full = await Manifest.findById(manifest._id).populate(POPULATE);
//     return sendSuccess(res, { manifest: serializeManifest(full) }, 'Delivery request accepted');
//   } catch (err) {
//     next(err);
//   }
// };
//
// export const declineDriverRequest = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const user = req.user!;
//     const manifest = await findManifestByDriverRequestId(req.params.id);
//     if (!manifest || manifest.driverRequest?.status !== 'pending') {
//       return sendError(res, 404, 'Pending delivery request not found');
//     }
//     if (manifest.driverRequest.driverId.toString() !== user._id.toString()) {
//       return sendError(res, 403, 'This request was not sent to you');
//     }
//
//     manifest.driverRequest.status = 'declined';
//     manifest.driverRequest.respondedAt = new Date();
//     pushTimeline(
//       manifest,
//       manifest.currentStatus,
//       `${user.firstName} ${user.lastName} declined the delivery request`,
//       'driver',
//     );
//     await manifest.save();
//
//     await notifyAdmins(
//       `Driver declined: ${manifest.trackingId}`,
//       `${user.firstName} ${user.lastName} declined the delivery request. Please pick another driver.`,
//       'warning',
//       manifest._id,
//     );
//
//     const full = await Manifest.findById(manifest._id).populate(POPULATE);
//     return sendSuccess(res, { manifest: serializeManifest(full) }, 'Delivery request declined');
//   } catch (err) {
//     next(err);
//   }
// };

export const assignManifest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = toObjectId(req.params.id);
    const manifest = id ? await Manifest.findById(id) : null;
    if (!manifest) return sendError(res, 404, 'Manifest not found');

    const { driverId, vehicleId } = req.body;
    const dId = toObjectId(driverId);
    const vId = toObjectId(vehicleId);
    if (!dId || !vId) return sendError(res, 400, 'driverId and vehicleId are required');

    const driver = await User.findById(dId);
    const vehicle = await Vehicle.findById(vId);
    if (!driver || driver.role !== 'driver') return sendError(res, 400, 'Driver not found');
    if (!vehicle) return sendError(res, 404, 'Vehicle not found');

    manifest.driver = dId;
    manifest.vehicle = vId;
    manifest.currentStatus = 'ASSIGNED';
    manifest.driverRequest = {
      driverId: dId,
      vehicleId: vId,
      status: 'accepted',
      sentAt: new Date(),
      respondedAt: new Date(),
    };
    pushTimeline(manifest, 'ASSIGNED', 'Direct assignment by admin', 'admin');
    await manifest.save();

    vehicle.status = 'IN_TRANSIT';
    vehicle.currentDriver = dId;
    await vehicle.save();

    await notify(
      {
        recipient: dId,
        title: `Assigned: ${manifest.trackingId}`,
        message: `You have been assigned delivery ${manifest.trackingId}.`,
        type: 'info',
        relatedManifest: manifest._id,
      },
    );

    const full = await Manifest.findById(manifest._id).populate(POPULATE);
    return sendSuccess(res, { manifest: serializeManifest(full) }, 'Manifest assigned');
  } catch (err) {
    next(err);
  }
};

// export const startTrip = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const id = toObjectId(req.params.id);
//     const manifest = id ? await Manifest.findById(id) : null;
//     if (!manifest) return sendError(res, 404, 'Manifest not found');
//     if (manifest.currentStatus === 'DELIVERED' || manifest.currentStatus === 'CANCELLED') {
//       return sendError(res, 400, `Cannot start a ${manifest.currentStatus} manifest`);
//     }
//
//     const ts = Number(req.body.timestamp ?? Date.now());
//     manifest.tripStartTimestamp = ts;
//     manifest.tripStartTime = new Date(ts);
//     manifest.currentStatus = 'IN_TRANSIT';
//     pushTimeline(
//       manifest,
//       'IN_TRANSIT',
//       `${req.user!.firstName} ${req.user!.lastName} started the trip`,
//       'driver',
//     );
//     await manifest.save();
//
//     await notifyAdmins(
//       `Trip started: ${manifest.trackingId}`,
//       'Goods loaded and trip is in transit. Live tracking is now active.',
//       'info',
//       manifest._id,
//     );
//     await notify(
//       {
//         recipient: manifest.client,
//         title: `In transit: ${manifest.trackingId}`,
//         message: 'Your shipment is on the way. Live tracking is now available.',
//         type: 'info',
//         relatedManifest: manifest._id,
//       },
//     );
//
//     const full = await Manifest.findById(manifest._id).populate(POPULATE);
//     return sendSuccess(res, { manifest: serializeManifest(full) }, 'Trip started');
//   } catch (err) {
//     next(err);
//   }
// };
//
// export const updateLocation = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const id = toObjectId(req.params.id);
//     const manifest = id ? await Manifest.findById(id) : null;
//     if (!manifest) return sendError(res, 404, 'Manifest not found');
//
//     const lat = Number(req.body.lat);
//     const lng = Number(req.body.lng);
//     if (isNaN(lat) || isNaN(lng)) {
//       return sendError(res, 400, 'Valid lat and lng are required');
//     }
//
//     manifest.lastLocation = {
//       lat,
//       lng,
//       heading: req.body.heading !== undefined ? Number(req.body.heading) : undefined,
//       updatedAt: new Date(),
//     };
//     await manifest.save();
//
//     const full = await Manifest.findById(manifest._id).populate(POPULATE);
//     return sendSuccess(res, { manifest: serializeManifest(full) }, 'Location updated');
//   } catch (err) {
//     next(err);
//   }
// };
//
// export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const id = toObjectId(req.params.id);
//     const manifest = id ? await Manifest.findById(id) : null;
//     if (!manifest) return sendError(res, 404, 'Manifest not found');
//
//     const status = String(req.body.status || '').toUpperCase();
//     if (!MANIFEST_STATUSES.includes(status as any)) {
//       return sendError(res, 400, `Invalid status. Must be one of: ${MANIFEST_STATUSES.join(', ')}`);
//     }
//
//     const note = String(req.body.note || '').trim();
//     manifest.currentStatus = status as any;
//     if (status === 'DELAYED') manifest.delayReason = note || manifest.delayReason || 'Delayed';
//     pushTimeline(
//       manifest,
//       status,
//       note || `Status changed to ${status}`,
//       req.user!.role,
//     );
//     await manifest.save();
//
//     await notifyAdmins(
//       `Status update: ${manifest.trackingId}`,
//       `${manifest.trackingId} is now ${status}.`,
//       status === 'DELAYED' ? 'warning' : 'info',
//       manifest._id,
//     );
//
//     const full = await Manifest.findById(manifest._id).populate(POPULATE);
//     return sendSuccess(res, { manifest: serializeManifest(full) }, 'Status updated');
//   } catch (err) {
//     next(err);
//   }
// };
//
// export const completeManifest = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const id = toObjectId(req.params.id);
//     const manifest = id ? await Manifest.findById(id) : null;
//     if (!manifest) return sendError(res, 404, 'Manifest not found');
//
//     manifest.currentStatus = 'DELIVERED';
//     manifest.requestStatus = 'APPROVED';
//     manifest.actualDeliveryTime = new Date();
//     pushTimeline(
//       manifest,
//       'DELIVERED',
//       `${req.user!.firstName} ${req.user!.lastName} completed the delivery`,
//       req.user!.role,
//     );
//     await manifest.save();
//
//     // Release the vehicle back to Available.
//     if (manifest.vehicle) {
//       const vehicle = await Vehicle.findById(manifest.vehicle);
//       if (vehicle) {
//         vehicle.status = 'AVAILABLE';
//         vehicle.currentDriver = undefined;
//         await vehicle.save();
//       }
//     }
//
//     // Auto-generate invoice from the delivered manifest.
//     const invoice = await generateInvoiceForManifest(manifest._id.toString());
//
//     await notifyAdmins(
//       `Delivery completed: ${manifest.trackingId}`,
//       'Shipment delivered successfully.',
//       'success',
//       manifest._id,
//     );
//     await notify(
//       {
//         recipient: manifest.client,
//         title: `Delivered: ${manifest.trackingId}`,
//         message: invoice
//           ? `Your shipment was delivered. Invoice ${invoice.invoiceNumber} has been generated.`
//           : 'Your shipment was delivered successfully.',
//         type: 'success',
//         relatedManifest: manifest._id,
//       },
//     );
//
//     const full = await Manifest.findById(manifest._id).populate(POPULATE);
//     return sendSuccess(res, { manifest: serializeManifest(full) }, 'Delivery completed');
//   } catch (err) {
//     next(err);
//   }
// };

export const deleteManifest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = toObjectId(req.params.id);
    const manifest = id ? await Manifest.findById(id) : null;
    if (!manifest) return sendError(res, 404, 'Manifest not found');

    if (!['PENDING', 'ASSIGNED'].includes(manifest.currentStatus)) {
      return sendError(res, 400, 'Only Pending or Assigned manifests can be cancelled');
    }

    manifest.currentStatus = 'CANCELLED';
    pushTimeline(manifest, 'CANCELLED', 'Cancelled by admin', 'admin');
    await manifest.save();

    await notify(
      {
        recipient: manifest.client,
        title: `Cancelled: ${manifest.trackingId}`,
        message: 'Your delivery request was cancelled.',
        type: 'warning',
        relatedManifest: manifest._id,
      },
    );

    return sendSuccess(res, {}, 'Manifest cancelled');
  } catch (err) {
    next(err);
  }
};
