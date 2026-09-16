import { Schema, model, Model, Types } from 'mongoose';

export const VEHICLE_STATUSES = ['AVAILABLE', 'IN_TRANSIT', 'MAINTENANCE'] as const;
export type VehicleStatus = (typeof VEHICLE_STATUSES)[number];

export interface IVehicle {
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  maxWeightKg: number;
  maxVolumeCubicMeters: number;
  status: VehicleStatus;
  currentDriver?: Types.ObjectId;
  fuelEfficiencyKmPerLiter?: number;
  lastMaintenanceDate?: Date;
}

export interface VehicleModel extends Model<IVehicle> {}

const vehicleSchema = new Schema<IVehicle, VehicleModel>(
  {
    registrationNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    make: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    year: { type: Number, required: true, min: 1990, max: 2100 },
    maxWeightKg: { type: Number, required: true, min: 0, default: 0 },
    maxVolumeCubicMeters: { type: Number, required: true, min: 0, default: 0 },
    status: {
      type: String,
      enum: VEHICLE_STATUSES,
      default: 'AVAILABLE',
    },
    currentDriver: { type: Schema.Types.ObjectId, ref: 'User' },
    fuelEfficiencyKmPerLiter: { type: Number, min: 0 },
    lastMaintenanceDate: { type: Date },
  },
  { timestamps: true },
);

vehicleSchema.index({ status: 1 });
vehicleSchema.index({ registrationNumber: 1 });

export const Vehicle = model<IVehicle, VehicleModel>('Vehicle', vehicleSchema);
