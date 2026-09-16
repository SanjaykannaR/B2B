import { Vehicle } from '../models/Vehicle';

/**
 * Auto-suggest compatible vehicles for a manifest's weight/volume.
 * Used by Manifest Wizard Step 3 / capacity hints.
 * Returns only AVAILABLE vehicles that fit BOTH constraints (when provided).
 */
export const capacityMatcher = async (
  weightKg?: number,
  volumeM3?: number,
): Promise<any[]> => {
  const query: Record<string, unknown> = { status: 'AVAILABLE' };
  if (weightKg && weightKg > 0) query.maxWeightKg = { $gte: weightKg };
  if (volumeM3 && volumeM3 > 0) query.maxVolumeCubicMeters = { $gte: volumeM3 };
  return Vehicle.find(query).populate('currentDriver').sort({ maxWeightKg: 1 }).exec();
};
