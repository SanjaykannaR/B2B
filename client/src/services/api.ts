// This file is for: Axios instance with base URL, JWT interceptor, 401 auto-redirect
// Module: Frontend API Services (Module 10)
// Owner: Developer 2 (Web Frontend Engineer)

import axios from 'axios';

// Get base API URL from environment variables, fallback to Vite proxy path (/api → localhost:5000)
const baseURL = (import.meta as any).env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token from localStorage if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle errors, particularly 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear local storage auth credentials on token expiration / unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Force redirect to login page (avoid using router if outside React context)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
