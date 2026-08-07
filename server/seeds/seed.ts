// Seed: Master runner - populates DB with demo data
// Module: Database Seed (Module 7) | Owner: Developer 1
// Idempotent: clears existing data before seeding. Run: npm run seed

import mongoose from 'mongoose';
import connectDB from '../config/db';
import User from '../models/User';
import Vehicle from '../models/Vehicle';
import Manifest from '../models/Manifest';
import Invoice from '../models/Invoice';
import Notification from '../models/Notification';
import { userSeeds } from './users.seed';
import { vehicleSeeds } from './vehicles.seed';
import { buildManifestSeeds } from './manifests.seed';
import { generateInvoice } from '../services/invoiceGenerator';

async function clearDatabase(): Promise<void> {
  await Promise.all([
    Notification.deleteMany({}),
    Invoice.deleteMany({}),
    Manifest.deleteMany({}),
    Vehicle.deleteMany({}),
    User.deleteMany({}),
  ]);
}

async function runSeeds(): Promise<void> {
  try {
    await connectDB();
    console.log('\n========== B2B LOGISTICS SEED ==========\n');

    await clearDatabase();
    console.log('✔ Cleared existing data');

    // ── Users ──
    const users = await User.create(userSeeds);
    console.log(`✔ Seeded ${users.length} users`);

    const admin = users.find((u) => u.email === 'admin@logistics.com');
    const clients = users.filter((u) => u.role === 'client');
    const drivers = users.filter((u) => u.role === 'driver');

    // ── Vehicles ──
    const vehicles = await Vehicle.create(vehicleSeeds);
    console.log(`✔ Seeded ${vehicles.length} vehicles`);

    // ── Manifests ──
    const manifestSeeds = buildManifestSeeds({
      clients: clients.map((c) => c._id),
      drivers: drivers.map((d) => d._id),
      vehicles: vehicles.map((v) => v._id),
    });

    const manifests = await Manifest.create(manifestSeeds);
    console.log(`✔ Seeded ${manifests.length} manifests`);

    // Sync vehicle status with their assigned manifests (only active trips)
    const activeVehicleIds = manifests
      .filter((m) => m.vehicle && (m.currentStatus === 'In-Transit' || m.currentStatus === 'Assigned'))
      .map((m) => m.vehicle as mongoose.Types.ObjectId);
    await Vehicle.updateMany(
      { _id: { $in: activeVehicleIds } },
      { $set: { status: 'In-Transit' } }
    );

    // ── Invoices for delivered manifests ──
    const delivered = manifests.filter((m) => m.currentStatus === 'Delivered');
    for (const manifest of delivered) {
      const clientUser = users.find((u) => u._id.toString() === manifest.client.toString());
      await generateInvoice({
        manifestId: manifest._id.toString(),
        clientId: manifest.client.toString(),
        distanceKm: manifest.routing.distanceKm,
        weight: manifest.cargoDetails.weight,
        contractRate: clientUser?.contractRate ?? 0,
        description: manifest.cargoDetails.description,
      });
    }
    console.log(`✔ Generated ${delivered.length} invoices for delivered manifests`);

    // ── Notifications for recent activity ──
    const recent = manifests.slice(0, 6);
    await Notification.create(
      recent.map((m) => ({
        recipient: m.client,
        title: 'Shipment Status Update',
        message: `Shipment ${m.trackingId} (${m.routing.origin.name} → ${m.routing.destination.name}) is now ${m.currentStatus}.`,
        type: m.currentStatus === 'Delivered' ? 'success' : 'info',
        relatedManifest: m._id,
      }))
    );
    console.log(`✔ Seeded ${recent.length} notifications`);

    console.log('\n────────── DEMO ACCOUNTS ──────────');
    console.table(
      userSeeds.map((u) => ({ Role: u.role, Email: u.email, Password: u.password }))
    );

    if (admin) {
      console.log('\nSeeding complete. You can now log in on the frontend.');
    }
  } catch (err) {
    console.error('\n❌ Seed failed:', (err as Error).message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('\nMongoDB disconnected.');
  }
}

runSeeds();
