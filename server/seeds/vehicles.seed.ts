// Seed data: Sample fleet (TRK-001 to TRK-005)
// Module: Database Seed (Module 7) | Owner: Developer 1

import type { VehicleStatus } from '../models/Vehicle';

export interface VehicleSeed {
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  maxWeightKg: number;
  maxVolumeCubicMeters: number;
  status: VehicleStatus;
  fuelEfficiency: number;
  lastMaintenanceDate: Date;
}

export const vehicleSeeds: VehicleSeed[] = [
  { registrationNumber: 'TRK-001', make: 'Volvo', model: 'FH16 750', year: 2022, maxWeightKg: 25000, maxVolumeCubicMeters: 120, status: 'Available', fuelEfficiency: 3.2, lastMaintenanceDate: new Date('2026-06-15') },
  { registrationNumber: 'TRK-002', make: 'Mercedes-Benz', model: 'Actros 1845', year: 2021, maxWeightKg: 24000, maxVolumeCubicMeters: 115, status: 'Available', fuelEfficiency: 3.0, lastMaintenanceDate: new Date('2026-05-28') },
  { registrationNumber: 'TRK-003', make: 'Iveco', model: 'S-Way 570', year: 2023, maxWeightKg: 26000, maxVolumeCubicMeters: 130, status: 'In-Transit', fuelEfficiency: 3.5, lastMaintenanceDate: new Date('2026-07-01') },
  { registrationNumber: 'TRK-004', make: 'MAN', model: 'TGX 18.640', year: 2020, maxWeightKg: 23000, maxVolumeCubicMeters: 110, status: 'Available', fuelEfficiency: 2.9, lastMaintenanceDate: new Date('2026-06-22') },
  { registrationNumber: 'TRK-005', make: 'DAF', model: 'XF 480', year: 2022, maxWeightKg: 24000, maxVolumeCubicMeters: 118, status: 'Maintenance', fuelEfficiency: 3.1, lastMaintenanceDate: new Date('2026-07-18') },
  { registrationNumber: 'TRK-006', make: 'Scania', model: 'R500', year: 2023, maxWeightKg: 25000, maxVolumeCubicMeters: 125, status: 'Available', fuelEfficiency: 3.3, lastMaintenanceDate: new Date('2026-06-30') },
  { registrationNumber: 'TRK-007', make: 'Volvo', model: 'FH 460', year: 2019, maxWeightKg: 22000, maxVolumeCubicMeters: 105, status: 'Available', fuelEfficiency: 2.8, lastMaintenanceDate: new Date('2026-05-10') },
  { registrationNumber: 'TRK-008', make: 'Kenworth', model: 'T680', year: 2022, maxWeightKg: 20000, maxVolumeCubicMeters: 100, status: 'In-Transit', fuelEfficiency: 3.0, lastMaintenanceDate: new Date('2026-07-05') },
];
