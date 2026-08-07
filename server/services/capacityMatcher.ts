// Service for: Auto-match cargo to compatible vehicles by weight/volume
// Module: Backend Services (Module 6) | Owner: Developer 1

import Vehicle, { VehicleDocument } from '../models/Vehicle';

export interface CargoRequirements {
  weight: number;
  volume: number;
}

/**
 * Find available vehicles that can carry the given weight & volume.
 * Results are sorted by total capacity (ascending) so the smallest
 * adequate vehicle is preferred.
 */
export async function findMatchingVehicles(
  cargo: CargoRequirements,
  limit = 5
): Promise<VehicleDocument[]> {
  return Vehicle.find({
    status: 'Available',
    maxWeightKg: { $gte: cargo.weight },
    maxVolumeCubicMeters: { $gte: cargo.volume },
  })
    .sort({ maxWeightKg: 1, maxVolumeCubicMeters: 1 })
    .limit(limit)
    .lean<VehicleDocument[]>();
}

export default { findMatchingVehicles };
