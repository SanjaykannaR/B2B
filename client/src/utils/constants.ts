// This file is for: Constants — status enums, role names, route paths, status-to-color mapping
// Module: Frontend Utilities (Module 10)
// Owner: Developer 2 (Web Frontend Engineer)

export enum ROLES {
  ADMIN = 'admin',
  CLIENT = 'client',
  DRIVER = 'driver',
  EXECUTIVE = 'executive',
}

export enum MANIFEST_STATUSES {
  PENDING = 'Pending',
  ASSIGNED = 'Assigned',
  IN_TRANSIT = 'In-Transit',
  DELIVERED = 'Delivered',
  DELAYED = 'Delayed',
  CANCELLED = 'Cancelled',
}

export enum VEHICLE_STATUSES {
  AVAILABLE = 'Available',
  IN_TRANSIT = 'In-Transit',
  MAINTENANCE = 'Maintenance',
}

export enum INVOICE_STATUSES {
  PENDING = 'Pending',
  PAID = 'Paid',
  OVERDUE = 'Overdue',
  CANCELLED = 'Cancelled',
}

export enum NOTIFICATION_TYPES {
  INFO = 'info',
  WARNING = 'warning',
  SUCCESS = 'success',
  ERROR = 'error',
}

export const STATUS_COLORS: Record<string, { text: string; bg: string }> = {
  Pending: { text: 'var(--color-status-pending)', bg: 'var(--color-status-pending-bg)' },
  Assigned: { text: 'var(--color-status-assigned)', bg: 'var(--color-status-assigned-bg)' },
  'In-Transit': { text: 'var(--color-status-in-transit)', bg: 'var(--color-status-in-transit-bg)' },
  Delivered: { text: 'var(--color-status-delivered)', bg: 'var(--color-status-delivered-bg)' },
  Delayed: { text: 'var(--color-status-delayed)', bg: 'var(--color-status-delayed-bg)' },
  Cancelled: { text: 'var(--color-status-cancelled)', bg: 'var(--color-status-cancelled-bg)' },
  Available: { text: 'var(--color-status-available)', bg: 'var(--color-status-available-bg)' },
  Maintenance: { text: 'var(--color-status-maintenance)', bg: 'var(--color-status-maintenance-bg)' },
  Paid: { text: 'var(--color-status-delivered)', bg: 'var(--color-status-delivered-bg)' },
  Overdue: { text: 'var(--color-status-delayed)', bg: 'var(--color-status-delayed-bg)' },
};

export const ROUTE_PATHS = {
  LOGIN: '/login',
  
  // Admin routes
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_FLEET: '/admin/fleet',
  ADMIN_MANIFEST_CREATE: '/admin/create',
  ADMIN_LIVE_OPS: '/admin/live',
  
  // Client routes
  CLIENT_DASHBOARD: '/client/dashboard',
  CLIENT_ORDER: '/client/order',
  CLIENT_TRACK: '/client/track',
  CLIENT_INVOICES: '/client/invoices',
  
  // Driver routes
  DRIVER_DASHBOARD: '/driver/dashboard',
  
  // Executive routes
  EXECUTIVE_ANALYTICS: '/executive/analytics',
};
