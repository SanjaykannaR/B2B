import { Types } from 'mongoose';
import crypto from 'crypto';

export const randomDigits = (len: number): string => {
  return crypto.randomInt(0, 10 ** len).toString().padStart(len, '0');
};

export const generateTrackingId = (): string => `TRK-${randomDigits(6)}`;

export const generateInvoiceNumber = (): string => {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(
    d.getDate(),
  ).padStart(2, '0')}`;
  return `INV-${ymd}-${randomDigits(5)}`;
};

export interface PaginationInfo {
  page: number;
  limit: number;
  skip: number;
}

export const paginate = (pageInput: unknown, limitInput: unknown): PaginationInfo => {
  const page = Math.max(1, parseInt(String(pageInput), 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(limitInput), 10) || 20));
  return { page, limit, skip: (page - 1) * limit };
};

/** Human-friendly relative time, e.g. "2 min ago" (used by notification `time`). */
export const relativeTime = (dateInput?: Date | string | null): string => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? 's' : ''} ago`;
};

export const toObjectId = (id: string): Types.ObjectId | null => {
  if (Types.ObjectId.isValid(id)) return new Types.ObjectId(id);
  return null;
};

export const safeNum = (v: unknown, fallback = 0): number => {
  const n = Number(v);
  return isNaN(n) ? fallback : n;
};

/** Strip password from a user doc (also removes password via select:false anyway). */
export const sanitizeUser = (user: any): any => {
  if (!user) return null;
  const doc = user.toObject ? user.toObject() : user;
  const { password, __v, ...rest } = doc;
  return rest;
};

/** Compact user shape used for populated `client` / `driver` references. */
export const userDisplay = (user: any): any => {
  if (!user) return null;
  const id = user._id?.toString ? user._id.toString() : user._id;
  return {
    _id: id,
    name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Unknown',
    company: user.company,
    email: user.email,
    phone: user.phone,
  };
};
