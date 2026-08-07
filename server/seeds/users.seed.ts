// Seed data: Demo users (admin, clients, drivers, executive)
// Module: Database Seed (Module 7) | Owner: Developer 1

import type { UserRole } from '../types';

export interface UserSeed {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  phone: string;
  company?: string;
  licenseNumber?: string;
  contractRate: number;
}

export const userSeeds: UserSeed[] = [
  {
    firstName: 'Admin',
    lastName: 'Platform',
    email: 'admin@logistics.com',
    password: 'admin123',
    role: 'admin',
    phone: '+1-555-0100',
    company: 'B2B Logistics',
    contractRate: 0,
  },
  {
    firstName: 'Alex',
    lastName: 'Executive',
    email: 'exec@logistics.com',
    password: 'exec123',
    role: 'executive',
    phone: '+1-555-0101',
    company: 'B2B Logistics',
    contractRate: 0,
  },
  {
    firstName: 'ABC',
    lastName: 'Manufacturing',
    email: 'client@abc.com',
    password: 'client123',
    role: 'client',
    phone: '+1-555-0102',
    company: 'ABC Manufacturing',
    contractRate: 2.75,
  },
  {
    firstName: 'XYZ',
    lastName: 'Distributors',
    email: 'client@xyz.com',
    password: 'client123',
    role: 'client',
    phone: '+1-555-0103',
    company: 'XYZ Distributors',
    contractRate: 3.1,
  },
  {
    firstName: 'Mike',
    lastName: 'Rodriguez',
    email: 'driver1@logistics.com',
    password: 'driver123',
    role: 'driver',
    phone: '+1-555-0104',
    licenseNumber: 'DL-77821',
    contractRate: 0,
  },
  {
    firstName: 'Sarah',
    lastName: 'Chen',
    email: 'driver2@logistics.com',
    password: 'driver123',
    role: 'driver',
    phone: '+1-555-0105',
    licenseNumber: 'DL-55890',
    contractRate: 0,
  },
];
