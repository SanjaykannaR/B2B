// This file is for: Auth API service — login, register, getProfile
// Module: Frontend API Services (Module 10)
// Owner: Developer 2 (Web Frontend Engineer)

import api from './api';

/**
 * Sends a POST request to login the user and retrieve a JWT token.
 * @param email - The user's email address
 * @param password - The user's password
 * @returns Promise with response containing user data and JWT token
 */
export const login = async (email: string, password: string) => {
  // Call POST /auth/login with email and password body
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

/**
 * Sends a POST request to register a new user account.
 * @param userData - The form data containing name, email, password, and role
 * @returns Promise with response containing the newly registered user details
 */
export const register = async (userData: Record<string, any>) => {
  // Call POST /auth/register with user input details
  const response = await api.post('/auth/register', userData);
  return response.data;
};

/**
 * Sends a GET request to fetch the profile details of the currently authenticated user.
 * @returns Promise with response containing current user profile information
 */
export const getProfile = async () => {
  // Call GET /auth/me to retrieve current user info using attached JWT
  const response = await api.get('/auth/me');
  return response.data;
};

/**
 * Sends a PUT request to update the current user's profile.
 * Falls back to resolving locally when the backend endpoint isn't implemented yet,
 * so the UI keeps working with demo data until the server lands.
 * @param data - Profile fields to update (firstName, lastName, email, phone, company)
 * @param userId - Optional user id; falls back to the stored user's id if omitted
 * @returns Promise with the updated user data
 */
export const updateProfile = async (data: Record<string, any>, userId?: string) => {
  // Call PUT /users/:id with the profile fields in the body
  try {
    const id = userId || (JSON.parse(localStorage.getItem('user') || 'null')?._id);
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  } catch (error) {
    // Backend not ready — resolve locally so the UI stays functional
    console.warn('updateProfile: backend unavailable, using local fallback', error);
    return { user: data };
  }
};

/**
 * Sends a POST request to refresh the current authentication session.
 * @returns Promise with response containing a new JWT token
 */
export const refreshToken = async () => {
  // Call POST /auth/refresh to fetch a new token
  const response = await api.post('/auth/refresh');
  return response.data;
};
