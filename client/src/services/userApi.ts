// This file is for: User API service — admin user management (CRUD + lifecycle)
// Module: Frontend API Services (Module 10)
// Owner: Developer 2 (Web Frontend Engineer)

import api from './api';

/**
 * Retrieves users, optionally filtered by role / search / active state (admin-only).
 * @param params - Query filters (role, search, isActive, page, limit)
 * @returns Promise with list of users + pagination
 */
export const getUsers = async (params?: Record<string, any>) => {
  const response = await api.get('/users', { params });
  return response.data;
};

/**
 * Creates a new role-based user (admin-only). The ONLY account-creation path.
 * @param data - { firstName, lastName, email, password, role, company?, phone?, licenseNumber?, contractRate? }
 * @returns Promise with the created user
 */
export const createUser = async (data: Record<string, any>) => {
  const response = await api.post('/users', data);
  return response.data;
};

/**
 * Updates a user's profile / role / active state (admin-only).
 * @param id - The user ID
 * @param data - Fields to update (firstName, lastName, email, phone, company, role, contractRate, isActive)
 * @returns Promise with the updated user
 */
export const updateUser = async (id: string, data: Record<string, any>) => {
  const response = await api.put(`/users/${id}`, data);
  return response.data;
};

/**
 * Deactivates a user (soft-delete — blocks login).
 * @param id - The user ID
 * @returns Promise with the deactivated user
 */
export const deactivateUser = async (id: string) => {
  const response = await api.patch(`/users/${id}/deactivate`);
  return response.data;
};

/**
 * Resets a user's password (admin-only).
 * @param id - The user ID
 * @param password - The new password (min 6 chars)
 * @returns Promise with confirmation
 */
export const resetPassword = async (id: string, password: string) => {
  const response = await api.post(`/users/${id}/reset-password`, { password });
  return response.data;
};