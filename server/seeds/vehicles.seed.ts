import { Vehicle } from '../models/Vehicle';

export const seedVehicles = async () => {
  const vehicles = [
    {
      registrationNumber: 'MH-12-AB-1234',
      make: 'Tata',
      model: 'Ace Gold',
      year: 2024,
      maxWeightKg: 2500,
      maxVolumeCubicMeters: 8,
      status: 'AVAILABLE',
      fuelEfficiencyKmPerLiter: 12,
    },
    {
      registrationNumber: 'DL-01-CD-5678',
      make: 'Mahindra',
      model: 'Blazo X',
      year: 2023,
      maxWeightKg: 16000,
      maxVolumeCubicMeters: 48,
      status: 'AVAILABLE',
      fuelEfficiencyKmPerLiter: 6,
    },
    {
      registrationNumber: 'TN-07-EF-9012',
      make: 'Eicher',
      model: 'Pro 2049',
      year: 2025,
      maxWeightKg: 5000,
      maxVolumeCubicMeters: 18,
      status: 'MAINTENANCE',
      fuelEfficiencyKmPerLiter: 10,
      lastMaintenanceDate: new Date(),
    },
    {
      registrationNumber: 'KA-05-GH-3456',
      make: 'Ashok Leyland',
      model: 'Dost+',
      year: 2024,
      maxWeightKg: 1500,
      maxVolumeCubicMeters: 6,
      status: 'AVAILABLE',
      fuelEfficiencyKmPerLiter: 14,
    },
    {
      registrationNumber: 'GJ-06-IJ-7890',
      make: 'Tata',
      model: 'Prima LX',
      year: 2023,
      maxWeightKg: 25000,
      maxVolumeCubicMeters: 70,
      status: 'AVAILABLE',
      fuelEfficiencyKmPerLiter: 4,
    },
  ];

  const created = await Vehicle.insertMany(vehicles);
  console.log(`[seed] ${created.length} vehicles created`);
  return created;
};
