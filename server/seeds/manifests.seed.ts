import { User } from '../models/User';
import { Vehicle } from '../models/Vehicle';
import { Manifest } from '../models/Manifest';
import { Invoice } from '../models/Invoice';
import { generateTrackingId, generateInvoiceNumber } from '../utils/helpers';
import { routeFromCoords } from '../services/routeCalculator';
import { Types } from 'mongoose';

type SeedUser = { _id: Types.ObjectId; role: string; firstName: string; email: string; company?: string; phone?: string; contractRate?: number };
type SeedVehicle = { _id: Types.ObjectId; status: string; currentDriver?: Types.ObjectId; save: () => Promise<unknown> };

const city = (name: string, coordinates: [number, number]) => ({
  city: name,
  address: `${name} Industrial Area`,
  state: 'Maharashtra',
  zipCode: '400001',
  coordinates,
});

// Indian city coordinates as [lng, lat]
const COORDS = {
  Mumbai: [72.8777, 19.076],
  Delhi: [77.1025, 28.7041],
  Chennai: [80.2707, 13.0827],
  Bangalore: [77.5946, 12.9716],
  Pune: [73.8567, 18.5204],
  Ahmedabad: [72.5714, 23.0225],
  Kolkata: [88.3639, 22.5726],
  Hyderabad: [78.4867, 17.385],
  Jaipur: [75.7873, 26.9124],
  Lucknow: [80.9462, 26.8467],
  Surat: [72.8311, 21.1702],
  Nagpur: [79.0882, 21.1458],
  Indore: [75.8573, 22.7196],
  Kochi: [76.2667, 9.9312],
} as const;

export const seedManifests = async (users: SeedUser[], vehicles: SeedVehicle[]) => {
  const client = (i: number) => users.filter((u) => u.role === 'client')[i];
  const driver = (i: number) => users.filter((u) => u.role === 'driver')[i];
  const vehicle = (i: number) => vehicles[i];

  const now = Date.now();
  const hours = (n: number) => new Date(now - n * 3600000);
  const midPoint = (o: [number, number], d: [number, number]): [number, number] => [
    (o[0] + d[0]) / 2 + (Math.random() - 0.5) * 0.4,
    (o[1] + d[1]) / 2 + (Math.random() - 0.5) * 0.4,
  ];

  interface SeedManifest {
    client: number;
    driver?: number;
    vehicle?: number;
    origin: keyof typeof COORDS;
    destination: keyof typeof COORDS;
    cargo: { description: string; totalWeightKg: number; totalVolumeCubicMeters: number; itemCount: number; isHazardous: boolean };
    gstNumber?: string;
    currentStatus: string;
    requestStatus: string;
    driverRequestStatus?: 'pending' | 'accepted' | 'declined';
    inTransitForHours?: number;
    delayedReason?: string;
    createdAtHoursAgo: number;
  }

  const seeds: SeedManifest[] = [
    // ── IN TRANSIT (live map trucks) ──
    { client: 0, driver: 0, vehicle: 0, origin: 'Mumbai', destination: 'Delhi', cargo: { description: '200 LED TVs — Fragile', totalWeightKg: 4000, totalVolumeCubicMeters: 18, itemCount: 200, isHazardous: false }, gstNumber: '27AABCU9603R1ZM', currentStatus: 'IN_TRANSIT', requestStatus: 'APPROVED', driverRequestStatus: 'accepted', inTransitForHours: 1.5, createdAtHoursAgo: 30 },
    { client: 1, driver: 1, vehicle: 1, origin: 'Chennai', destination: 'Bangalore', cargo: { description: '500 Cartons — Packaged Food', totalWeightKg: 8500, totalVolumeCubicMeters: 32, itemCount: 500, isHazardous: false }, gstNumber: '07AAACG1234F1Z5', currentStatus: 'IN_TRANSIT', requestStatus: 'APPROVED', driverRequestStatus: 'accepted', inTransitForHours: 2.5, createdAtHoursAgo: 26 },
    { client: 2, driver: 4, vehicle: 4, origin: 'Pune', destination: 'Ahmedabad', cargo: { description: 'Industrial Machine Parts', totalWeightKg: 12000, totalVolumeCubicMeters: 42, itemCount: 40, isHazardous: true }, gstNumber: '24AABCF5678G1Z2', currentStatus: 'IN_TRANSIT', requestStatus: 'APPROVED', driverRequestStatus: 'accepted', inTransitForHours: 4, createdAtHoursAgo: 48 },

    // ── DELAYED (red truck + warning) ──
    { client: 3, driver: 3, vehicle: 3, origin: 'Nagpur', destination: 'Indore', cargo: { description: 'Chemical Drums', totalWeightKg: 9000, totalVolumeCubicMeters: 20, itemCount: 90, isHazardous: true }, gstNumber: '36AABCQ9012H1Z8', currentStatus: 'DELAYED', requestStatus: 'APPROVED', driverRequestStatus: 'accepted', inTransitForHours: 9, delayedReason: 'Heavy rainfall near Nashik — road blocked, waiting for clearance', createdAtHoursAgo: 72 },

    // ── ASSIGNED (waiting to start trip) ──
    { client: 4, driver: 2, vehicle: 2, origin: 'Surat', destination: 'Mumbai', cargo: { description: 'Textile Rolls — 800 Rolls', totalWeightKg: 4800, totalVolumeCubicMeters: 26, itemCount: 800, isHazardous: false }, gstNumber: '09AABCL3456I1Z1', currentStatus: 'ASSIGNED', requestStatus: 'APPROVED', driverRequestStatus: 'accepted', createdAtHoursAgo: 12 },

    // ── APPROVED (awaiting dispatch) ──
    { client: 0, origin: 'Kolkata', destination: 'Hyderabad', cargo: { description: 'Packaged Electronics', totalWeightKg: 3200, totalVolumeCubicMeters: 14, itemCount: 150, isHazardous: false }, gstNumber: '27AABCU9603R1ZM', currentStatus: 'PENDING', requestStatus: 'APPROVED', createdAtHoursAgo: 8 },

    // ── PENDING (client requests board) ──
    { client: 1, origin: 'Delhi', destination: 'Jaipur', cargo: { description: 'Furniture Set — 120 Pieces', totalWeightKg: 6200, totalVolumeCubicMeters: 24, itemCount: 120, isHazardous: false }, gstNumber: '07AAACG1234F1Z5', currentStatus: 'PENDING', requestStatus: 'PENDING', createdAtHoursAgo: 2 },
    { client: 2, origin: 'Ahmedabad', destination: 'Chennai', cargo: { description: 'Auto Components — Brake Assemblies', totalWeightKg: 7200, totalVolumeCubicMeters: 18, itemCount: 200, isHazardous: false }, gstNumber: '24AABCF5678G1Z2', currentStatus: 'PENDING', requestStatus: 'PENDING', createdAtHoursAgo: 5 },
    { client: 3, origin: 'Bangalore', destination: 'Kolkata', cargo: { description: 'Ceramic Tiles — 2000 Pieces', totalWeightKg: 9600, totalVolumeCubicMeters: 30, itemCount: 2000, isHazardous: false }, gstNumber: '36AABCQ9012H1Z8', currentStatus: 'PENDING', requestStatus: 'PENDING', createdAtHoursAgo: 1 },
    { client: 4, origin: 'Kochi', destination: 'Mumbai', cargo: { description: 'Marine Engine Parts', totalWeightKg: 6000, totalVolumeCubicMeters: 16, itemCount: 30, isHazardous: false }, gstNumber: '09AABCL3456I1Z1', currentStatus: 'PENDING', requestStatus: 'PENDING', createdAtHoursAgo: 3 },
    { client: 0, origin: 'Pune', destination: 'Delhi', cargo: { description: 'Server Racks — 15 Units', totalWeightKg: 1200, totalVolumeCubicMeters: 8, itemCount: 15, isHazardous: false }, gstNumber: '27AABCU9603R1ZM', currentStatus: 'PENDING', requestStatus: 'PENDING', createdAtHoursAgo: 6 },

    // ── DELIVERED (with invoices) ──
    { client: 1, driver: 0, vehicle: 0, origin: 'Mumbai', destination: 'Pune', cargo: { description: 'CNC Machine Parts', totalWeightKg: 2500, totalVolumeCubicMeters: 10, itemCount: 50, isHazardous: false }, gstNumber: '07AAACG1234F1Z5', currentStatus: 'DELIVERED', requestStatus: 'APPROVED', driverRequestStatus: 'accepted', createdAtHoursAgo: 120 },
    { client: 2, driver: 1, vehicle: 1, origin: 'Hyderabad', destination: 'Bangalore', cargo: { description: 'Pharmaceutical Raw Materials', totalWeightKg: 1500, totalVolumeCubicMeters: 6, itemCount: 100, isHazardous: false }, gstNumber: '24AABCF5678G1Z2', currentStatus: 'DELIVERED', requestStatus: 'APPROVED', driverRequestStatus: 'accepted', createdAtHoursAgo: 96 },
    { client: 3, driver: 4, vehicle: 4, origin: 'Jaipur', destination: 'Lucknow', cargo: { description: 'Pharmaceuticals', totalWeightKg: 1800, totalVolumeCubicMeters: 7, itemCount: 60, isHazardous: false }, gstNumber: '36AABCQ9012H1Z8', currentStatus: 'DELIVERED', requestStatus: 'APPROVED', driverRequestStatus: 'accepted', createdAtHoursAgo: 72 },

    // ── REJECTED / CANCELLED ──
    { client: 4, origin: 'Surat', destination: 'Kochi', cargo: { description: 'Textile Raw Cotton', totalWeightKg: 11000, totalVolumeCubicMeters: 40, itemCount: 300, isHazardous: false }, gstNumber: '09AABCL3456I1Z1', currentStatus: 'CANCELLED', requestStatus: 'REJECTED', createdAtHoursAgo: 48 },
  ];

  const createdManifests = [];
  for (const s of seeds) {
    const c = client(s.client);
    const d = s.driver !== undefined ? driver(s.driver) : null;
    const v = s.vehicle !== undefined ? vehicle(s.vehicle) : null;
    const o = COORDS[s.origin];
    const dest = COORDS[s.destination];
    const route = routeFromCoords(o as [number, number], dest as [number, number]);

    const timeline = [
      { status: 'PENDING', timestamp: hours(s.createdAtHoursAgo), note: 'Order placed', updatedBy: 'client' },
    ];
    if (s.requestStatus === 'APPROVED') {
      timeline.push({ status: 'PENDING', timestamp: hours(s.createdAtHoursAgo - 4), note: 'Approved by admin', updatedBy: 'admin' });
    }
    if (s.driverRequestStatus === 'accepted') {
      timeline.push({ status: 'ASSIGNED', timestamp: hours(s.createdAtHoursAgo - 8), note: 'Driver accepted', updatedBy: 'driver' });
    }
    if (s.currentStatus === 'IN_TRANSIT') {
      timeline.push({ status: 'IN_TRANSIT', timestamp: hours(s.inTransitForHours || 2), note: 'Trip started', updatedBy: 'driver' });
    }
    if (s.currentStatus === 'DELAYED') {
      timeline.push({ status: 'DELAYED', timestamp: hours(1), note: s.delayedReason || 'Delayed', updatedBy: 'system' });
    }
    if (s.currentStatus === 'DELIVERED') {
      timeline.push({ status: 'IN_TRANSIT', timestamp: hours(s.createdAtHoursAgo - 16), note: 'Trip started', updatedBy: 'driver' });
      timeline.push({ status: 'DELIVERED', timestamp: hours(s.createdAtHoursAgo - 20), note: 'Delivered', updatedBy: 'driver' });
    }
    if (s.currentStatus === 'CANCELLED') {
      timeline.push({ status: 'CANCELLED', timestamp: hours(s.createdAtHoursAgo - 2), note: 'Rejected by admin', updatedBy: 'admin' });
    }

    const lastLocation =
      s.currentStatus === 'IN_TRANSIT' || s.currentStatus === 'DELAYED'
        ? (() => {
            const mid = midPoint(o as [number, number], dest as [number, number]);
            return { lat: mid[1], lng: mid[0], heading: 90, updatedAt: hours(0.05) };
          })()
        : undefined;

    const manifest = await Manifest.create({
      trackingId: generateTrackingId(),
      client: c._id,
      gstNumber: s.gstNumber,
      driver: d?._id,
      vehicle: v?._id,
      cargoDetails: s.cargo,
      routing: { origin: city(s.origin, o as [number, number]), destination: city(s.destination, dest as [number, number]), estimatedDistanceKm: route?.estimatedDistanceKm, estimatedDurationMinutes: route?.estimatedDurationMinutes },
      currentStatus: s.currentStatus,
      requestStatus: s.requestStatus,
      driverRequest:
        s.driverRequestStatus && d && v
          ? { driverId: d._id, vehicleId: v._id, status: s.driverRequestStatus, sentAt: hours(s.createdAtHoursAgo - 9), respondedAt: hours(s.createdAtHoursAgo - 8) }
          : undefined,
      lastLocation,
      statusTimeline: timeline,
      delayReason: s.delayedReason,
      scheduledPickup: hours(s.createdAtHoursAgo - 10),
      scheduledDeliveryWindowClose: new Date(now + 72 * 3600000),
      tripStartTime: s.currentStatus === 'IN_TRANSIT' || s.currentStatus === 'DELAYED' ? hours(s.inTransitForHours || 2) : undefined,
      tripStartTimestamp: s.currentStatus === 'IN_TRANSIT' || s.currentStatus === 'DELAYED' ? Date.now() - (s.inTransitForHours || 2) * 3600000 : undefined,
      actualDeliveryTime: s.currentStatus === 'DELIVERED' ? hours(s.createdAtHoursAgo - 20) : undefined,
      createdAt: hours(s.createdAtHoursAgo),
      updatedAt: hours(s.currentStatus === 'PENDING' ? s.createdAtHoursAgo : 0.05),
    });

    // Lock vehicles that are actively in transit / assigned.
    if (v && (s.currentStatus === 'IN_TRANSIT' || s.currentStatus === 'ASSIGNED')) {
      v.status = 'IN_TRANSIT';
      v.currentDriver = d?._id;
      await v.save();
    }

    // Generate invoices for delivered manifests.
    if (s.currentStatus === 'DELIVERED' && route) {
      const rate = c.contractRate || 12;
      const amount = Math.round(route.estimatedDistanceKm * rate * 100) / 100;
      const issued = hours(s.createdAtHoursAgo - 20);
      const due = new Date(issued.getTime() + 30 * 86400000);
      await Invoice.create({
        invoiceNumber: generateInvoiceNumber(),
        manifest: manifest._id,
        client: c._id,
        amount,
        currency: 'INR',
        status: 'PENDING',
        issuedDate: issued,
        dueDate: due,
        lineItems: [
          { description: `Freight: ${manifest.trackingId} (${s.origin} → ${s.destination})`, quantity: 1, unitPrice: amount, total: amount },
        ],
      });
    }

    createdManifests.push(manifest);
  }

  console.log(`[seed] ${createdManifests.length} manifests created`);
  return createdManifests;
};
