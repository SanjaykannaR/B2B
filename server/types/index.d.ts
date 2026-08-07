// Shared TypeScript declarations for Express augmentation
// Module: Backend Types | Owner: Developer 1

import { Types } from 'mongoose';

export type UserRole = 'admin' | 'client' | 'driver' | 'executive';

export interface AuthUser {
  _id: Types.ObjectId;
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  company?: string;
  phone?: string;
  licenseNumber?: string;
  contractRate?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
