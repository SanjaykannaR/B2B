import { Schema, model, Model, Types } from 'mongoose';

export const MANIFEST_STATUSES = [
  'PENDING',
  'ASSIGNED',
  'IN_TRANSIT',
  'DELIVERED',
  'DELAYED',
  'CANCELLED',
] as const;
export type ManifestStatus = (typeof MANIFEST_STATUSES)[number];

export const REQUEST_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'CONTACTED'] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const DRIVER_REQUEST_STATUSES = ['pending', 'accepted', 'declined', 'cancelled'] as const;
export type DriverRequestStatus = (typeof DRIVER_REQUEST_STATUSES)[number];

export interface ITimelineEntry {
  status: string;
  timestamp: Date;
  note?: string;
  updatedBy?: string;
}

export interface ICargoDetails {
  description: string;
  totalWeightKg: number;
  totalVolumeCubicMeters?: number;
  itemCount?: number;
  isHazardous?: boolean;
}

export interface IPlace {
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  coordinates?: [number, number];
}

export interface IRouting {
  origin: IPlace;
  destination: IPlace;
  estimatedDistanceKm?: number;
  estimatedDurationMinutes?: number;
}

export interface IDriverRequest {
  driverId: Types.ObjectId;
  vehicleId: Types.ObjectId;
  status: DriverRequestStatus;
  sentAt: Date;
  respondedAt?: Date;
}

export interface ILastLocation {
  lat: number;
  lng: number;
  heading?: number;
  updatedAt: Date;
}

export interface IManifest {
  trackingId: string;
  client: Types.ObjectId;
  gstNumber?: string;
  driver?: Types.ObjectId;
  vehicle?: Types.ObjectId;
  cargoDetails: ICargoDetails;
  routing: IRouting;
  currentStatus: ManifestStatus;
  requestStatus: RequestStatus;
  driverRequest?: IDriverRequest;
  lastLocation?: ILastLocation;
  statusTimeline: ITimelineEntry[];
  delayReason?: string;
  scheduledPickup?: Date;
  scheduledDeliveryWindowClose?: Date;
  actualDeliveryTime?: Date;
  tripStartTime?: Date;
  tripStartTimestamp?: number;
}

export interface ManifestModel extends Model<IManifest> {}

const timelineEntrySchema = new Schema<ITimelineEntry>(
  {
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    note: { type: String },
    updatedBy: { type: String },
  },
  { _id: false },
);

const placeSchema = new Schema<IPlace>(
  {
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zipCode: { type: String, trim: true },
    country: { type: String, trim: true },
    coordinates: { type: [Number], default: undefined },
  },
  { _id: false },
);

const cargoDetailsSchema = new Schema<ICargoDetails>(
  {
    description: { type: String, required: true, trim: true },
    totalWeightKg: { type: Number, required: true, min: 0 },
    totalVolumeCubicMeters: { type: Number, min: 0 },
    itemCount: { type: Number, min: 1, default: 1 },
    isHazardous: { type: Boolean, default: false },
  },
  { _id: false },
);

const driverRequestSchema = new Schema<IDriverRequest>(
  {
    driverId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    status: { type: String, enum: DRIVER_REQUEST_STATUSES, default: 'pending' },
    sentAt: { type: Date, default: Date.now },
    respondedAt: { type: Date },
  },
  { _id: true },
);

const lastLocationSchema = new Schema<ILastLocation>(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    heading: { type: Number },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const manifestSchema = new Schema<IManifest, ManifestModel>(
  {
    trackingId: { type: String, unique: true, index: true },
    client: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    gstNumber: { type: String, trim: true },
    driver: { type: Schema.Types.ObjectId, ref: 'User' },
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
    cargoDetails: { type: cargoDetailsSchema, required: true },
    routing: {
      origin: { type: placeSchema, default: () => ({}) },
      destination: { type: placeSchema, default: () => ({}) },
      estimatedDistanceKm: { type: Number },
      estimatedDurationMinutes: { type: Number },
    },
    currentStatus: {
      type: String,
      enum: MANIFEST_STATUSES,
      default: 'PENDING',
      index: true,
    },
    requestStatus: {
      type: String,
      enum: REQUEST_STATUSES,
      default: 'PENDING',
      index: true,
    },
    driverRequest: { type: driverRequestSchema },
    lastLocation: { type: lastLocationSchema },
    statusTimeline: { type: [timelineEntrySchema], default: [] },
    delayReason: { type: String, trim: true },
    scheduledPickup: { type: Date },
    scheduledDeliveryWindowClose: { type: Date },
    actualDeliveryTime: { type: Date },
    tripStartTime: { type: Date },
    tripStartTimestamp: { type: Number },
  },
  { timestamps: true },
);

manifestSchema.index({ client: 1, createdAt: -1 });
manifestSchema.index({ driver: 1, currentStatus: 1 });
manifestSchema.index({ scheduledDeliveryWindowClose: 1, currentStatus: 1 });
manifestSchema.index({ 'driverRequest.driverId': 1, 'driverRequest.status': 1 });

export const Manifest = model<IManifest, ManifestModel>('Manifest', manifestSchema);
