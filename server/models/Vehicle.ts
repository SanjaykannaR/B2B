// This file is for: Vehicle Mongoose model — fleet asset registry
// Module: Database Models (Module 3)
// Owner: Developer 1 (Backend Engineer)
// Schema fields: registrationNumber, model, make, year, maxWeightKg, maxVolumeCubicMeters,
//                status (Available|In-Transit|Maintenance), currentDriver, fuelEfficiency, lastMaintenanceDate
// Indexes: status, registrationNumber

import { Schema, model, Types, InferSchemaType } from 'mongoose';

const vehicleSchema = new Schema(
  {
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    make: { type: String, required: [true, 'Make is required'], trim: true },
    model: { type: String, required: [true, 'Model is required'], trim: true },
    year: { type: Number, required: [true, 'Year is required'], min: 1980, max: 2100 },
    maxWeightKg: { type: Number, required: [true, 'Max weight is required'], min: 0 },
    maxVolumeCubicMeters: { type: Number, required: [true, 'Max volume is required'], min: 0 },
    status: {
      type: String,
      enum: ['Available', 'In-Transit', 'Maintenance'],
      default: 'Available',
      required: true,
    },
    currentDriver: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    fuelEfficiency: { type: Number, min: 0 },
    lastMaintenanceDate: { type: Date },
  },
  { timestamps: true }
);

export type VehicleStatus = InferSchemaType<typeof vehicleSchema>['status'];
export interface VehicleDocument extends InferSchemaType<typeof vehicleSchema> {
  _id: Types.ObjectId;
}

vehicleSchema.index({ status: 1 });

const Vehicle = model<VehicleDocument>('Vehicle', vehicleSchema);
export default Vehicle;
