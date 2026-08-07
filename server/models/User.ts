// This file is for: User Mongoose model — all 4 roles in one model
// Module: Database Models (Module 3)
// Owner: Developer 1 (Backend Engineer)
// Schema fields: firstName, lastName, email, password (bcrypt), role (admin|client|driver|executive),
//                phone, company, licenseNumber, contractRate, isActive
// Pre-save hook: bcrypt hash password (12 rounds)
// Instance method: comparePassword()
// Indexes: email, role, role+isActive

import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import type { UserRole } from '../types';

export interface UserDocument extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  company?: string;
  licenseNumber?: string;
  contractRate?: number;
  isActive: boolean;
  fullName: string;
  comparePassword(candidate: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    firstName: { type: String, required: [true, 'First name is required'], trim: true },
    lastName: { type: String, required: [true, 'Last name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'client', 'driver', 'executive'],
      required: [true, 'Role is required'],
      default: 'client',
    },
    phone: { type: String, trim: true },
    company: { type: String, trim: true },
    licenseNumber: { type: String, trim: true },
    contractRate: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.password;
        return ret;
      },
    },
  }
);

userSchema.index({ role: 1 });
userSchema.index({ role: 1, isActive: 1 });

userSchema.pre('save', async function (next) {
  const user = this;
  if (!user.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(user.password, salt);
    return next();
  } catch (err) {
    return next(err as Error);
  }
});

userSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  const user = this as UserDocument;
  return bcrypt.compare(candidate, user.password);
};

userSchema.virtual('fullName').get(function (this: UserDocument) {
  return `${this.firstName} ${this.lastName}`;
});

const User = model<UserDocument>('User', userSchema);
export default User;
