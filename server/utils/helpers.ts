// Utility: Shared helpers - generateTrackingId, formatDate, paginate
// Module: Backend Utils | Owner: Developer 1

const TRACKING_PREFIX = 'TRK';

export function generateTrackingId(seed?: number): string {
  const year = new Date().getFullYear();
  const random = seed ?? Math.floor(1000 + Math.random() * 9000);
  return `${TRACKING_PREFIX}-${year}-${random}`;
}

export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear().toString().slice(-2);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `INV-${year}${random}-${Math.floor(100 + Math.random() * 900)}`;
}

export function formatDate(date: Date | string): string {
  return new Date(date).toISOString();
}

export function todayISO(): string {
  return new Date().toISOString();
}

export function addDaysISO(days: number, from: Date = new Date()): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d;
}

export interface PaginationResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function paginate<T>(items: T[], page = 1, limit = 10): PaginationResult<T> {
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, Math.min(100, limit));
  const start = (safePage - 1) * safeLimit;
  return {
    items: items.slice(start, start + safeLimit),
    total: items.length,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.max(1, Math.ceil(items.length / safeLimit)),
  };
}

export function toPaginationMeta(total: number, page = 1, limit = 10) {
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, Math.min(100, limit));
  return {
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.max(1, Math.ceil(total / safeLimit)),
  };
}

export function parsePage(query: Record<string, unknown>): { page: number; limit: number } {
  const page = typeof query.page === 'string' ? parseInt(query.page, 10) || 1 : 1;
  const limit = typeof query.limit === 'string' ? parseInt(query.limit, 10) || 10 : 10;
  return { page, limit };
}
