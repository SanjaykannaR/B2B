import { User } from '../models/User';

export const seedUsers = async () => {
  const users = [
    {
      firstName: 'Admin',
      lastName: 'Logistics',
      email: 'admin@logistics.com',
      password: 'admin123',
      role: 'admin',
      company: 'B2B Logistics',
      phone: '+91 90000 00001',
    },
    {
      firstName: 'Executive',
      lastName: 'Analytics',
      email: 'exec@logistics.com',
      password: 'exec123',
      role: 'executive',
      company: 'B2B Logistics',
      phone: '+91 90000 00002',
    },
    // ── Clients ──
    {
      firstName: 'Rajesh',
      lastName: 'Kumar',
      email: 'client@abc.com',
      password: 'client123',
      role: 'client',
      company: 'Acme Industries',
      phone: '+91 90000 00101',
      contractRate: 12,
    },
    {
      firstName: 'Priya',
      lastName: 'Sharma',
      email: 'priya@globaltrade.co.in',
      password: 'client123',
      role: 'client',
      company: 'GlobalTrade Exports',
      phone: '+91 90000 00102',
      contractRate: 14,
    },
    {
      firstName: 'Amit',
      lastName: 'Patel',
      email: 'amit@fastfreight.com',
      password: 'client123',
      role: 'client',
      company: 'FastFreight Logistics',
      phone: '+91 90000 00103',
      contractRate: 11,
    },
    {
      firstName: 'Sneha',
      lastName: 'Reddy',
      email: 'sneha@quickship.in',
      password: 'client123',
      role: 'client',
      company: 'QuickShip Solutions',
      phone: '+91 90000 00104',
      contractRate: 13,
    },
    {
      firstName: 'Vikram',
      lastName: 'Singh',
      email: 'vikram@logiprime.com',
      password: 'client123',
      role: 'client',
      company: 'LogiPrime Transport',
      phone: '+91 90000 00105',
      contractRate: 12.5,
    },
    // ── Drivers ──
    {
      firstName: 'Ramesh',
      lastName: 'Patil',
      email: 'driver1@logistics.com',
      password: 'driver123',
      role: 'driver',
      company: 'B2B Logistics',
      phone: '+91 90000 00201',
      licenseNumber: 'MH-12-2024-001',
    },
    {
      firstName: 'Suresh',
      lastName: 'Kumar',
      email: 'driver2@logistics.com',
      password: 'driver123',
      role: 'driver',
      company: 'B2B Logistics',
      phone: '+91 90000 00202',
      licenseNumber: 'DL-01-2023-045',
    },
    {
      firstName: 'Anil',
      lastName: 'Sharma',
      email: 'driver3@logistics.com',
      password: 'driver123',
      role: 'driver',
      company: 'B2B Logistics',
      phone: '+91 90000 00203',
      licenseNumber: 'TN-07-2025-012',
    },
    {
      firstName: 'Venkat',
      lastName: 'Reddy',
      email: 'driver4@logistics.com',
      password: 'driver123',
      role: 'driver',
      company: 'B2B Logistics',
      phone: '+91 90000 00204',
      licenseNumber: 'KA-05-2024-078',
    },
    {
      firstName: 'Mohammed',
      lastName: 'Khan',
      email: 'driver5@logistics.com',
      password: 'driver123',
      role: 'driver',
      company: 'B2B Logistics',
      phone: '+91 90000 00205',
      licenseNumber: 'GJ-06-2023-033',
    },
  ];

  // Use create() (not insertMany) so the pre('save') bcrypt hook hashes passwords.
  const created: any[] = [];
  for (const u of users) {
    created.push(await User.create(u));
  }
  console.log(`[seed] ${created.length} users created`);
  return created;
};
