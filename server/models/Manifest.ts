// This file is for: Manifest Mongoose model — core shipment lifecycle model
// Module: Database Models (Module 3)
// Owner: Developer 1 (Backend Engineer)
// Schema: trackingId, client, driver, vehicle, cargoDetails (description, weight, volume, itemCount, hazardous),
//         routing (origin/destination with coordinates), currentStatus, statusTimeline[],
//         scheduledPickup, scheduledDeliveryWindowClose, actualDeliveryTime, tripStartTimestamp
// Status lifecycle: Pending → Assigned → In-Transit → Delivered (or → Delayed/Cancelled)
// Indexes: trackingId, currentStatus, client+createdAt, driver+status, deliveryWindow+status

import { Schema, model, Document, Types } from 'mongoose';

export type ManifestStatus = 'Pending' | 'Assigned' | 'In-Transit' | 'Delivered' | 'Delayed' | 'Cancelled';

export interface GeoPoint {
  name: string;
  latitude: number;
  longitude: number;
}

export interface RoutingInfo {
  origin: GeoPoint;
  destination: GeoPoint;
  distanceKm: number;
  estimatedDurationMinutes: number;
}

export interface CargoDetails {
  description: string;
  weight: number;
  volume: number;
  itemCount: number;
  hazardous: boolean;
}

export interface StatusTimelineEntry {
  status: ManifestStatus;
  at: Date;
  note?: string;
}

export interface ManifestDocument extends Document {
  trackingId: string;
  client: Types.ObjectId;
  driver?: Types.ObjectId;
  vehicle?: Types.ObjectId;
  cargoDetails: CargoDetails;
  routing: RoutingInfo;
  currentStatus: ManifestStatus;
  statusTimeline: StatusTimelineEntry[];
  scheduledPickup: Date;
  scheduledDeliveryWindowClose: Date;
  actualDeliveryTime?: Date;
  tripStartTimestamp?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const manifestSchema = new Schema<ManifestDocument>(
  {
    trackingId: {
      type: String,
      required: [true, 'Tracking ID is required'],
      unique: true,
      trim: true,
    },
    client: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    driver: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', default: null },
    cargoDetails: {
      description: { type: String, required: [true, 'Cargo description is required'], trim: true },
      weight: { type: Number, required: [true, 'Cargo weight is required'], min: 0 },
      volume: { type: Number, required: [true, 'Cargo volume is required'], min: 0 },
      itemCount: { type: Number, required: [true, 'Item count is required'], min: 1 },
      hazardous: { type: Boolean, default: false },
    },
    routing: {
      origin: {
        name: { type: String, required: true, trim: true },
        latitude: { type: Number, required: true, min: -90, max: 90 },
        longitude: { type: Number, required: true, min: -180, max: 180 },
      },
      destination: {
        name: { type: String, required: true, trim: true },
        latitude: { type: Number, required: true, min: -90, max: 90 },
        longitude: { type: Number, required: true, min: -180, max: 180 },
      },
      distanceKm: { type: Number, required: true, min: 0 },
      estimatedDurationMinutes: { type: Number, required: true, min: 0 },
    },
    currentStatus: {
      type: String,
      enum: ['Pending', 'Assigned', 'In-Transit', 'Delivered', 'Delayed', 'Cancelled'],
      default: 'Pending',
      required: true,
    },
    statusTimeline: [
      {
        status: {
          type: String,
          enum: ['Pending', 'Assigned', 'In-Transit', 'Delivered', 'Delayed', 'Cancelled'],
          required: true,
        },
        at: { type: Date, default: Date.now },
        note: { type: String, trim: true },
      },
    ],
    scheduledPickup: { type: Date, required: true },
    scheduledDeliveryWindowClose: { type: Date, required: true },
    actualDeliveryTime: { type: Date },
    tripStartTimestamp: { type: Date },
  },
  { timestamps: true }
);

manifestSchema.index({ currentStatus: 1 });
manifestSchema.index({ client: 1, createdAt: 1 });
manifestSchema.index({ driver: 1, currentStatus: 1 });
manifestSchema.index({ scheduledDeliveryWindowClose: 1, currentStatus: 1 });

const Manifest = model<ManifestDocument>('Manifest', manifestSchema);
export default Manifest;
