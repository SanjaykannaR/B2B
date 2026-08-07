// Seed data: 15 sample shipments across all statuses with US coordinates
// Module: Database Seed (Module 7) | Owner: Developer 1

import { Types } from 'mongoose';
import type { ManifestStatus, ManifestDocument, CargoDetails } from '../models/Manifest';
import { calculateRoute } from '../services/routeCalculator';

interface SeedRefs {
  clients: Types.ObjectId[];
  drivers: Types.ObjectId[];
  vehicles: Types.ObjectId[];
}

interface ManifestSeedInput {
  trackingId: string;
  client: Types.ObjectId;
  driver?: Types.ObjectId;
  vehicle?: Types.ObjectId;
  routing: {
    origin: { name: string; latitude: number; longitude: number };
    destination: { name: string; latitude: number; longitude: number };
    distanceKm: number;
    estimatedDurationMinutes: number;
  };
  cargoDetails: CargoDetails;
  currentStatus: ManifestStatus;
  scheduledPickup: Date;
  scheduledDeliveryWindowClose: Date;
  actualDeliveryTime?: Date;
  tripStartTimestamp?: Date;
  statusTimeline: { status: ManifestStatus; at: Date; note?: string }[];
}

function buildManifest(
  refs: SeedRefs,
  data: {
    idx: number;
    clientIndex: number;
    driverIndex?: number;
    vehicleIndex?: number;
    origin: { name: string; latitude: number; longitude: number };
    destination: { name: string; latitude: number; longitude: number };
    cargoDetails: CargoDetails;
    currentStatus: ManifestStatus;
    daysAgoPickup: number;
    daysAgoWindowClose: number;
    deliveredDaysAgo?: number;
    tripDaysAgo?: number;
  }
): ManifestSeedInput {
  const { distanceKm, estimatedDurationMinutes } = calculateRoute(data.origin, data.destination);

  const timeline: ManifestSeedInput['statusTimeline'] = [{ status: 'Pending', at: new Date(Date.now() - data.daysAgoPickup * 86400000 - 86400000), note: 'Manifest created' }];
  if (data.currentStatus !== 'Pending') {
    timeline.push({ status: 'Assigned', at: new Date(Date.now() - data.daysAgoPickup * 86400000), note: 'Assigned by operations' });
  }
  if (data.currentStatus === 'In-Transit' || data.currentStatus === 'Delivered' || data.currentStatus === 'Delayed') {
    timeline.push({ status: 'In-Transit', at: new Date(Date.now() - data.daysAgoPickup * 86400000 + estimatedDurationMinutes * 60000), note: 'Trip started' });
  }
  if (data.currentStatus === 'Delayed') {
    timeline.push({
      status: 'Delayed',
      at: new Date(Date.now() - data.daysAgoWindowClose * 86400000),
      note: 'Delivery window closed — marked Delayed',
    });
  }
  if (data.currentStatus === 'Delivered') {
    timeline.push({
      status: 'Delivered',
      at: new Date(Date.now() - (data.deliveredDaysAgo ?? 0) * 86400000),
      note: 'Delivery completed',
    });
  }

  return {
    trackingId: `TRK-2026-${String(1000 + data.idx)}`,
    client: refs.clients[data.clientIndex % refs.clients.length],
    driver: data.driverIndex !== undefined ? refs.drivers[data.driverIndex % refs.drivers.length] : undefined,
    vehicle: data.vehicleIndex !== undefined ? refs.vehicles[data.vehicleIndex % refs.vehicles.length] : undefined,
    routing: {
      origin: data.origin,
      destination: data.destination,
      distanceKm,
      estimatedDurationMinutes,
    },
    cargoDetails: data.cargoDetails,
    currentStatus: data.currentStatus,
    scheduledPickup: new Date(Date.now() - data.daysAgoPickup * 86400000),
    scheduledDeliveryWindowClose: new Date(Date.now() - data.daysAgoWindowClose * 86400000),
    actualDeliveryTime: data.deliveredDaysAgo !== undefined ? new Date(Date.now() - data.deliveredDaysAgo * 86400000) : undefined,
    tripStartTimestamp: data.tripDaysAgo !== undefined ? new Date(Date.now() - data.tripDaysAgo * 86400000) : undefined,
    statusTimeline: timeline,
  };
}

export function buildManifestSeeds(refs: SeedRefs): ManifestSeedInput[] {
  return [
    buildManifest(refs, {
      idx: 0, clientIndex: 0, driverIndex: 0, vehicleIndex: 0,
      origin: { name: 'Detroit Hub', latitude: 42.3314, longitude: -83.0458 },
      destination: { name: 'Warehouse B, Detroit', latitude: 42.3601, longitude: -83.0916 },
      cargoDetails: { description: 'Automotive parts — 24 pallets', weight: 12000, volume: 55, itemCount: 24, hazardous: false },
      currentStatus: 'In-Transit', daysAgoPickup: 1, daysAgoWindowClose: -1, tripDaysAgo: 1,
    }),
    buildManifest(refs, {
      idx: 1, clientIndex: 1, driverIndex: 1, vehicleIndex: 1,
      origin: { name: 'Chicago DC', latitude: 41.8781, longitude: -87.6298 },
      destination: { name: 'Assembly Line D, MI', latitude: 42.6158, longitude: -83.4182 },
      cargoDetails: { description: 'Electronics components — 12 pallets', weight: 4500, volume: 30, itemCount: 12, hazardous: false },
      currentStatus: 'Assigned', daysAgoPickup: 0, daysAgoWindowClose: 2,
    }),
    buildManifest(refs, {
      idx: 2, clientIndex: 0, driverIndex: 0, vehicleIndex: 2,
      origin: { name: 'NYC Depot', latitude: 40.7128, longitude: -74.0060 },
      destination: { name: 'Retail Store F, CT', latitude: 41.1865, longitude: -73.1952 },
      cargoDetails: { description: 'Textiles & apparel — 18 bales', weight: 3800, volume: 45, itemCount: 18, hazardous: false },
      currentStatus: 'Delivered', daysAgoPickup: 12, daysAgoWindowClose: 10, deliveredDaysAgo: 12, tripDaysAgo: 11,
    }),
    buildManifest(refs, {
      idx: 3, clientIndex: 1, vehicleIndex: 3,
      origin: { name: 'LA Terminal', latitude: 34.0522, longitude: -118.2437 },
      destination: { name: 'Factory G, Phoenix', latitude: 33.4484, longitude: -112.0740 },
      cargoDetails: { description: 'Machinery equipment — 4 units', weight: 18500, volume: 60, itemCount: 4, hazardous: false },
      currentStatus: 'Pending', daysAgoPickup: -1, daysAgoWindowClose: 5,
    }),
    buildManifest(refs, {
      idx: 4, clientIndex: 0, driverIndex: 1, vehicleIndex: 4,
      origin: { name: 'Dallas Yard', latitude: 32.7767, longitude: -96.7970 },
      destination: { name: 'Port H, Houston', latitude: 29.7604, longitude: -95.3698 },
      cargoDetails: { description: 'Industrial chemicals (non-haz) — 8 drums', weight: 9600, volume: 20, itemCount: 8, hazardous: true },
      currentStatus: 'In-Transit', daysAgoPickup: 2, daysAgoWindowClose: 0, tripDaysAgo: 2,
    }),
    buildManifest(refs, {
      idx: 5, clientIndex: 1, driverIndex: 0, vehicleIndex: 5,
      origin: { name: 'Seattle Freight Hub', latitude: 47.6062, longitude: -122.3321 },
      destination: { name: 'Portland Distribution', latitude: 45.5152, longitude: -122.6784 },
      cargoDetails: { description: 'Beverage cases — 30 pallets', weight: 14000, volume: 70, itemCount: 30, hazardous: false },
      currentStatus: 'Delivered', daysAgoPickup: 20, daysAgoWindowClose: 18, deliveredDaysAgo: 20, tripDaysAgo: 19,
    }),
    buildManifest(refs, {
      idx: 6, clientIndex: 0, vehicleIndex: 6,
      origin: { name: 'Boston Terminal', latitude: 42.3601, longitude: -71.0589 },
      destination: { name: 'Philadelphia DC', latitude: 39.9526, longitude: -75.1652 },
      cargoDetails: { description: 'Furniture & fixtures — 16 pallets', weight: 8200, volume: 55, itemCount: 16, hazardous: false },
      currentStatus: 'Pending', daysAgoPickup: -2, daysAgoWindowClose: 3,
    }),
    buildManifest(refs, {
      idx: 7, clientIndex: 1, driverIndex: 1, vehicleIndex: 7,
      origin: { name: 'Miami Port', latitude: 25.7617, longitude: -80.1918 },
      destination: { name: 'Orlando Distribution Ctr', latitude: 28.5383, longitude: -81.3792 },
      cargoDetails: { description: 'Perishable goods — refrigerated', weight: 7200, volume: 40, itemCount: 22, hazardous: false },
      currentStatus: 'Delayed', daysAgoPickup: 8, daysAgoWindowClose: 4, tripDaysAgo: 8,
    }),
    buildManifest(refs, {
      idx: 8, clientIndex: 0, driverIndex: 0, vehicleIndex: 0,
      origin: { name: 'Denver Logistics Park', latitude: 39.7392, longitude: -104.9903 },
      destination: { name: 'Salt Lake City DC', latitude: 40.7608, longitude: -111.8910 },
      cargoDetails: { description: 'Outdoor equipment — 10 pallets', weight: 5100, volume: 35, itemCount: 10, hazardous: false },
      currentStatus: 'Delivered', daysAgoPickup: 32, daysAgoWindowClose: 30, deliveredDaysAgo: 31, tripDaysAgo: 31,
    }),
    buildManifest(refs, {
      idx: 9, clientIndex: 1, vehicleIndex: 1,
      origin: { name: 'Atlanta Hub', latitude: 33.7490, longitude: -84.3880 },
      destination: { name: 'Nashville Warehouse', latitude: 36.1627, longitude: -86.7816 },
      cargoDetails: { description: 'Packaged food — 20 pallets', weight: 11000, volume: 50, itemCount: 20, hazardous: false },
      currentStatus: 'Pending', daysAgoPickup: -1, daysAgoWindowClose: 4,
    }),
    buildManifest(refs, {
      idx: 10, clientIndex: 0, driverIndex: 1, vehicleIndex: 2,
      origin: { name: 'Minneapolis Yard', latitude: 44.9778, longitude: -93.2650 },
      destination: { name: 'Kansas City DC', latitude: 39.0997, longitude: -94.5786 },
      cargoDetails: { description: 'Paper products — 26 pallets', weight: 13500, volume: 65, itemCount: 26, hazardous: false },
      currentStatus: 'In-Transit', daysAgoPickup: 1, daysAgoWindowClose: -1, tripDaysAgo: 1,
    }),
    buildManifest(refs, {
      idx: 11, clientIndex: 1, driverIndex: 0, vehicleIndex: 3,
      origin: { name: 'San Diego Terminal', latitude: 32.7157, longitude: -117.1611 },
      destination: { name: 'Las Vegas DC', latitude: 36.1699, longitude: -115.1398 },
      cargoDetails: { description: 'Consumer electronics — 8 pallets', weight: 2900, volume: 22, itemCount: 8, hazardous: false },
      currentStatus: 'Delivered', daysAgoPickup: 26, daysAgoWindowClose: 24, deliveredDaysAgo: 25, tripDaysAgo: 25,
    }),
    buildManifest(refs, {
      idx: 12, clientIndex: 0, vehicleIndex: 4,
      origin: { name: 'Columbus DC', latitude: 39.9612, longitude: -82.9988 },
      destination: { name: 'Pittsburgh Warehouse', latitude: 40.4406, longitude: -79.9959 },
      cargoDetails: { description: 'Auto glass — 6 crates', weight: 7800, volume: 25, itemCount: 6, hazardous: false },
      currentStatus: 'Pending', daysAgoPickup: 0, daysAgoWindowClose: 3,
    }),
    buildManifest(refs, {
      idx: 13, clientIndex: 1, driverIndex: 1, vehicleIndex: 5,
      origin: { name: 'Charlotte Hub', latitude: 35.2271, longitude: -80.8431 },
      destination: { name: 'Raleigh Distribution', latitude: 35.7796, longitude: -78.6382 },
      cargoDetails: { description: 'Pharmaceuticals (temp-controlled)', weight: 3200, volume: 15, itemCount: 9, hazardous: false },
      currentStatus: 'Delivered', daysAgoPickup: 15, daysAgoWindowClose: 13, deliveredDaysAgo: 12, tripDaysAgo: 14,
    }),
    buildManifest(refs, {
      idx: 14, clientIndex: 0, driverIndex: 0, vehicleIndex: 6,
      origin: { name: 'St. Louis Depot', latitude: 38.6270, longitude: -90.1994 },
      destination: { name: 'Tulsa Warehouse', latitude: 36.1540, longitude: -95.9928 },
      cargoDetails: { description: 'Tires & rubber — 14 pallets', weight: 8900, volume: 42, itemCount: 14, hazardous: false },
      currentStatus: 'In-Transit', daysAgoPickup: 3, daysAgoWindowClose: 0, tripDaysAgo: 3,
    }),
  ];
}

export default { buildManifestSeeds };
