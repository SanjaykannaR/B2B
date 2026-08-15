// Vehicle API service — fleet CRUD, availability, stats
// Module: Frontend API Services (Module 10) | Owner: Developer 2

import api from './api';

export type VehicleStatus = 'Available' | 'In-Transit' | 'Maintenance';

export interface Vehicle {
  _id: string;
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  maxWeightKg: number;
  maxVolumeCubicMeters: number;
  status: VehicleStatus;
  currentDriver?: { _id: string; firstName: string; lastName: string; email: string } | null;
  fuelEfficiency?: number;
  lastMaintenanceDate?: string;
  createdAt: string;
}

export interface VehicleStats {
  total: number;
  available: number;
  inTransit: number;
  maintenance: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface VehiclePayload {
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  maxWeightKg: number;
  maxVolumeCubicMeters: number;
  fuelEfficiency?: number;
}

export async function listVehicles(params?: {
  page?: number;
  limit?: number;
  status?: VehicleStatus;
  search?: string;
}): Promise<Paginated<Vehicle>> {
  const { data } = await api.get<Paginated<Vehicle>>('/vehicles', { params });
  return data;
}

export async function getAvailableVehicles(): Promise<Vehicle[]> {
  const { data } = await api.get<Vehicle[]>('/vehicles/available');
  return data;
}

export async function getVehicleStats(): Promise<VehicleStats> {
  const { data } = await api.get<VehicleStats>('/vehicles/stats');
  return data;
}

export async function getVehicle(id: string): Promise<Vehicle> {
  const { data } = await api.get<Vehicle>(`/vehicles/${id}`);
  return data;
}

export async function createVehicle(payload: VehiclePayload): Promise<Vehicle> {
  const { data } = await api.post<Vehicle>('/vehicles', payload);
  return data;
}

export async function updateVehicle(id: string, payload: Partial<VehiclePayload>): Promise<Vehicle> {
  const { data } = await api.put<Vehicle>(`/vehicles/${id}`, payload);
  return data;
}

export async function updateVehicleStatus(id: string, status: VehicleStatus): Promise<Vehicle> {
  const { data } = await api.patch<Vehicle>(`/vehicles/${id}/status`, { status });
  return data;
}

export async function deleteVehicle(id: string): Promise<{ id: string; deleted: boolean }> {
  const { data } = await api.delete<{ id: string; deleted: boolean }>(`/vehicles/${id}`);
  return data;
}
