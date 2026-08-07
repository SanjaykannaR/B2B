import { Schema, model, Model, HydratedDocument } from 'mongoose';

export const ROLES = ['admin', 'client', 'driver', 'executive'] as const;
export type UserRole = (typeof ROLES)[number];

export interface IUser {
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
}

export interface UserMethods {
  comparePassword(candidate: string): Promise<boolean>;
}

export interface UserModel extends Model<IUser, {}, UserMethods> {}

const userSchema = new Schema<IUser, UserModel>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, required: true, default: 'client' },
    phone: { type: String, trim: true },
    company: { type: String, trim: true },
    licenseNumber: { type: String, trim: true },
    contractRate: { type: Number, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ role: 1, isActive: 1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await (await import('bcryptjs')).genSalt(12);
  this.password = await (await import('bcryptjs')).hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(candidate, this.password);
};

export const User = model<IUser, UserModel>('User', userSchema);
export type UserDocument = HydratedDocument<IUser, UserMethods>;
