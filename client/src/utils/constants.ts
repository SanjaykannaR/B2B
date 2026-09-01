export const ROLES = {
  ADMIN: 'admin',
  CLIENT: 'client',
  DRIVER: 'driver',
  EXECUTIVE: 'executive',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const MANIFEST_STATUSES = {
  PENDING: 'Pending',
  ASSIGNED: 'Assigned',
  IN_TRANSIT: 'In-Transit',
  DELIVERED: 'Delivered',
  DELAYED: 'Delayed',
  CANCELLED: 'Cancelled',
} as const;

export const STATUS_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  'Pending': { bg: '#FEF3C7', color: '#D97706', border: '#FCD34D' },
  'Assigned': { bg: '#DBEAFE', color: '#2563EB', border: '#93C5FD' },
  'In-Transit': { bg: '#EDE9FE', color: '#7C3AED', border: '#C4B5FD' },
  'Delivered': { bg: '#D1FAE5', color: '#059669', border: '#6EE7B7' },
  'Delayed': { bg: '#FEE2E2', color: '#DC2626', border: '#FCA5A5' },
  'Cancelled': { bg: '#F3F4F6', color: '#4B5563', border: '#D1D5DB' },
};

export const ROUTE_PATHS = {
  LOGIN: '/login',
  DRIVER_DASHBOARD: '/driver',
  ACTIVE_DELIVERY: '/driver/delivery/:id',
  ADMIN_DASHBOARD: '/admin/dashboard',
  CLIENT_DASHBOARD: '/client/dashboard',
  EXECUTIVE_ANALYTICS: '/executive/analytics',
} as const;

export const DEFAULT_ROUTES: Record<Role, string> = {
  admin: '/admin/dashboard',
  client: '/client/dashboard',
  driver: '/driver',
  executive: '/executive/analytics',
};
