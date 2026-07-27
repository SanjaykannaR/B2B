// This file is for: Manifest API service — CRUD + assign + status lifecycle
// Module: Frontend API Services (Module 10)
// Owner: Developer 2 (Web Frontend Engineer)

import api from './api';

/**
 * Retrieves all delivery manifests, optionally filtered by status, dates, or clients.
 * @param filters - Query filters (e.g. status, startDate, endDate, client)
 * @returns Promise with list of manifests
 */
export const getManifests = async (filters?: Record<string, any>) => {
  // Call GET /manifests with filters parsed as query string params
  const response = await api.get('/manifests', { params: filters });
  return response.data;
};

/**
 * Retrieves manifests belonging to the logged-in client.
 * @returns Promise with list of the client's manifests
 */
export const getMyManifests = async () => {
  // Call GET /manifests/my to retrieve client-specific shipments
  const response = await api.get('/manifests/my');
  return response.data;
};

/**
 * Retrieves manifests assigned to the logged-in driver.
 * @returns Promise with list of the driver's manifests
 */
export const getDriverManifests = async () => {
  // Call GET /manifests/driver/my to retrieve driver-specific deliveries
  const response = await api.get('/manifests/driver/my');
  return response.data;
};

/**
 * Retrieves detailed info of a single manifest.
 * @param id - The manifest ID
 * @returns Promise with manifest details
 */
export const getManifest = async (id: string) => {
  // Call GET /manifests/:id to fetch full cargo details and status timeline
  const response = await api.get(`/manifests/${id}`);
  return response.data;
};

/**
 * Creates a new cargo delivery manifest.
 * @param data - The manifest details (client, cargo, origin, destination, etc.)
 * @returns Promise with newly created manifest
 */
export const createManifest = async (data: Record<string, any>) => {
  // Call POST /manifests to submit new shipment details
  const response = await api.post('/manifests', data);
  return response.data;
};

/**
 * Updates details of an existing manifest.
 * @param id - The manifest ID to update
 * @param data - The fields to update
 * @returns Promise with updated manifest object
 */
export const updateManifest = async (id: string, data: Record<string, any>) => {
  // Call PUT /manifests/:id to edit manifest fields
  const response = await api.put(`/manifests/${id}`, data);
  return response.data;
};

/**
 * Assigns a driver and vehicle to a pending manifest.
 * @param id - The manifest ID
 * @param driverId - The ID of the driver to assign
 * @param vehicleId - The ID of the vehicle to assign
 * @returns Promise with assignment status
 */
export const assignManifest = async (id: string, driverId: string, vehicleId: string) => {
  // Call PATCH /manifests/:id/assign with assignment payload
  const response = await api.patch(`/manifests/${id}/assign`, { driverId, vehicleId });
  return response.data;
};

/**
 * Marks a manifest shipment transit as started (start trip).
 * @param id - The manifest ID
 * @param timestamp - The UNIX timestamp or date string of transit start
 * @returns Promise with updated manifest state
 */
export const startTrip = async (id: string, timestamp: string | number) => {
  // Call PATCH /manifests/:id/start-trip with start timestamp
  const response = await api.patch(`/manifests/${id}/start-trip`, { timestamp });
  return response.data;
};

/**
 * Updates a manifest's status and records a timeline note.
 * @param id - The manifest ID
 * @param status - The new status value (e.g. Delayed, In-Transit)
 * @param note - An optional description note detailing the update context
 * @returns Promise with updated status status response
 */
export const updateStatus = async (id: string, status: string, note?: string) => {
  // Call PATCH /manifests/:id/status with status details
  const response = await api.patch(`/manifests/${id}/status`, { status, note });
  return response.data;
};

/**
 * Marks a manifest delivery as successfully completed.
 * @param id - The manifest ID
 * @returns Promise with updated manifest
 */
export const completeDelivery = async (id: string) => {
  // Call PATCH /manifests/:id/complete to close the shipment lifecycle
  const response = await api.patch(`/manifests/${id}/complete`);
  return response.data;
};

/**
 * Cancels a manifest shipment record.
 * @param id - The manifest ID
 * @returns Promise with deletion confirmation
 */
export const cancelManifest = async (id: string) => {
  // Call DELETE /manifests/:id to cancel and remove manifest
  const response = await api.delete(`/manifests/${id}`);
  return response.data;
};
