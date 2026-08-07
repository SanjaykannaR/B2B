// Manifest API service — CRUD + assign + status lifecycle
// Module: Frontend API Services (Module 10)
// Owner: Developer 2 (Web Frontend Engineer)

import api from './api';

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
  status: string;
  at: string;
  note?: string;
}

export interface Manifest {
  _id: string;
  trackingId: string;
  currentStatus: string;
  statusTimeline: StatusTimelineEntry[];
  routing: RoutingInfo;
  cargoDetails: CargoDetails;
  scheduledPickup: string;
  scheduledDeliveryWindowClose: string;
  actualDeliveryTime?: string;
  driver?: { firstName: string; lastName: string; email: string; phone?: string } | null;
  vehicle?: { registrationNumber: string; make: string; model: string } | null;
  createdAt: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateManifestPayload {
  client?: string;
  cargoDetails: {
    description: string;
    weight: number;
    volume: number;
    itemCount: number;
    hazardous?: boolean;
  };
  routing: {
    origin: GeoPoint;
    destination: GeoPoint;
  };
  scheduledPickup?: string;
  scheduledDeliveryWindowClose?: string;
}

export async function getMyManifests(params?: { page?: number; limit?: number }): Promise<Paginated<Manifest>> {
  const { data } = await api.get<Paginated<Manifest>>('/manifests/my', { params });
  return data;
}

export async function getManifest(id: string): Promise<Manifest> {
  const { data } = await api.get<Manifest>(`/manifests/${id}`);
  return data;
}

export async function getManifestByTrackingId(trackingId: string): Promise<Manifest> {
  const { data } = await api.get<Manifest>(`/manifests/track/${trackingId}`);
  return data;
}

export async function createManifest(payload: CreateManifestPayload): Promise<Manifest> {
  const { data } = await api.post<Manifest>('/manifests', payload);
  return data;
}
