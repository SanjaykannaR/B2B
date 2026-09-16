import { connectDB } from '../config/db';
import { User } from '../models/User';
import { Vehicle } from '../models/Vehicle';
import { Manifest } from '../models/Manifest';
import { Invoice } from '../models/Invoice';
import { Notification } from '../models/Notification';
import { seedUsers } from './users.seed';
import { seedVehicles } from './vehicles.seed';
import { seedManifests } from './manifests.seed';

const run = async () => {
  try {
    await connectDB();

    // Idempotent: clear existing data before re-seeding.
    await Promise.all([
      Notification.deleteMany({}),
      Invoice.deleteMany({}),
      Manifest.deleteMany({}),
      Vehicle.deleteMany({}),
      User.deleteMany({}),
    ]);
    console.log('[seed] cleared existing data');

    const users = await seedUsers();
    const vehicles = await seedVehicles();
    await seedManifests(users, vehicles);

    console.log('[seed] Done. Login: admin@logistics.com / admin123 (admin)');
    process.exit(0);
  } catch (err) {
    console.error('[seed] Failed:', err);
    process.exit(1);
  }
};

run();
