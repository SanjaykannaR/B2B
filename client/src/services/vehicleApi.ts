// This file is for: Vehicle API service — CRUD + availability + stats
// Module: Frontend API Services (Module 10)
// Owner: Developer 2 (Web Frontend Engineer)

import api from './api';

/**
 * Retrieves all vehicles in the fleet, optionally filtered.
 * @param filters - Optional query parameters like status, model, capacity
 * @returns Promise with list of vehicles
 */
export const getVehicles = async (filters?: Record<string, any>) => {
  // Call GET /vehicles with filters parsed as query string params
  const response = await api.get('/vehicles', { params: filters });
  return response.data;
};

/**
 * Retrieves only currently available vehicles.
 * @returns Promise with list of available vehicles
 */
export const getAvailableVehicles = async () => {
  // Call GET /vehicles/available to find active, idle fleet assets
  const response = await api.get('/vehicles/available');
  return response.data;
};

/**
 * Retrieves statistics for the entire vehicle fleet.
 * @returns Promise containing total count, active, maintenance, and available counts
 */
export const getVehicleStats = async () => {
  // Call GET /vehicles/stats to retrieve state summary counts
  const response = await api.get('/vehicles/stats');
  return response.data;
};

/**
 * Creates a new vehicle asset in the system database.
 * @param data - The vehicle fields (registration, model, make, load limit, etc.)
 * @returns Promise with newly created vehicle object
 */
export const createVehicle = async (data: Record<string, any>) => {
  // Call POST /vehicles with new asset specifications
  const response = await api.post('/vehicles', data);
  return response.data;
};

/**
 * Updates an existing vehicle asset details.
 * @param id - The ID of the vehicle to update
 * @param data - The fields to update
 * @returns Promise with updated vehicle object
 */
export const updateVehicle = async (id: string, data: Record<string, any>) => {
  // Call PUT /vehicles/:id with updated asset details
  const response = await api.put(`/vehicles/${id}`, data);
  return response.data;
};

/**
 * Patches a vehicle's operational status (e.g. available, in-transit, maintenance).
 * @param id - The ID of the vehicle
 * @param status - The new vehicle status string
 * @returns Promise with status patch outcome
 */
export const updateVehicleStatus = async (id: string, status: string) => {
  // Call PATCH /vehicles/:id/status to change the state field
  const response = await api.patch(`/vehicles/${id}/status`, { status });
  return response.data;
};

/**
 * Deletes a vehicle asset from the system.
 * @param id - The ID of the vehicle to delete
 * @returns Promise with deletion confirmation response
 */
export const deleteVehicle = async (id: string) => {
  // Call DELETE /vehicles/:id to remove the vehicle record
  const response = await api.delete(`/vehicles/${id}`);
  return response.data;
};
