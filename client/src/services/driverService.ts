export interface ActivityItem {
  id: number | string;
  status: string;
  timestamp: string;
  note: string;
  actor: string;
}

export interface ManifestItem {
  id: string;
  trackingId: string;
  clientName: string;
  status: string;
  origin: string;
  destination: string;
  distanceKm: number;
  estimatedDuration: string;
  cargo: {
    weightKg: number;
    volumeM3: number;
    itemCount: number;
    isHazmat: boolean;
    hazmatClass: string | null;
  };
  schedule: {
    pickupTime: string;
    deliveryWindowClose: string;
    actualDeliveryTime: string | null;
  };
  activityLog: ActivityItem[];
}

const MOCK_MANIFESTS: ManifestItem[] = [
  {
    id: 'TRK-8902-NY',
    trackingId: 'TRK-8902-NY',
    clientName: 'Apex Industrial Corp',
    status: 'Assigned',
    origin: 'New York Port (Hub A)',
    destination: 'Boston Distribution Center',
    distanceKm: 345,
    estimatedDuration: '4h 30m',
    cargo: {
      weightKg: 12500,
      volumeM3: 42.5,
      itemCount: 150,
      isHazmat: true,
      hazmatClass: 'Class 3 (Flammable Liquid)',
    },
    schedule: {
      pickupTime: '2026-07-30T08:00:00Z',
      deliveryWindowClose: '2026-07-30T18:00:00Z',
      actualDeliveryTime: null,
    },
    activityLog: [
      { id: 2, status: 'Assigned', timestamp: '2026-07-30T08:00:00Z', note: 'Manifest assigned to Driver John Doe', actor: 'Dispatch System' },
      { id: 1, status: 'Pending', timestamp: '2026-07-30T07:15:00Z', note: 'Shipment manifest created by Apex Industrial', actor: 'Client Portal' },
    ],
  },
  {
    id: 'TRK-7410-PA',
    trackingId: 'TRK-7410-PA',
    clientName: 'Global Freight Supply',
    status: 'In-Transit',
    origin: 'Philadelphia Terminal (Gate 4)',
    destination: 'Baltimore Freight Hub',
    distanceKm: 160,
    estimatedDuration: '2h 15m',
    cargo: {
      weightKg: 8200,
      volumeM3: 28.0,
      itemCount: 95,
      isHazmat: false,
      hazmatClass: null,
    },
    schedule: {
      pickupTime: '2026-07-30T06:30:00Z',
      deliveryWindowClose: '2026-07-30T15:30:00Z',
      actualDeliveryTime: null,
    },
    activityLog: [
      { id: 3, status: 'In-Transit', timestamp: '2026-07-30T06:45:00Z', note: 'Departed Philadelphia Terminal. Trip timer active.', actor: 'Driver' },
      { id: 2, status: 'Assigned', timestamp: '2026-07-30T06:00:00Z', note: 'Driver assigned to vehicle Volvo FH16 (V-102)', actor: 'Dispatch System' },
      { id: 1, status: 'Pending', timestamp: '2026-07-29T21:30:00Z', note: 'Order confirmed and staged for pickup', actor: 'System' },
    ],
  },
  {
    id: 'TRK-6192-NJ',
    trackingId: 'TRK-6192-NJ',
    clientName: 'ChemTech Logistics',
    status: 'In-Transit',
    origin: 'Newark Cargo Center',
    destination: 'Hartford Logistics Hub',
    distanceKm: 220,
    estimatedDuration: '3h 10m',
    cargo: {
      weightKg: 18000,
      volumeM3: 55.0,
      itemCount: 210,
      isHazmat: true,
      hazmatClass: 'Class 8 (Corrosive Substances)',
    },
    schedule: {
      pickupTime: '2026-07-30T07:15:00Z',
      deliveryWindowClose: '2026-07-30T17:00:00Z',
      actualDeliveryTime: null,
    },
    activityLog: [
      { id: 3, status: 'In-Transit', timestamp: '2026-07-30T07:30:00Z', note: 'HAZMAT inspection cleared. En route to Hartford.', actor: 'Driver' },
      { id: 2, status: 'Assigned', timestamp: '2026-07-30T06:30:00Z', note: 'Assigned to qualified HAZMAT certified driver', actor: 'Dispatch System' },
      { id: 1, status: 'Pending', timestamp: '2026-07-29T18:00:00Z', note: 'HAZMAT permit verified & manifest created', actor: 'System' },
    ],
  },
  {
    id: 'TRK-5120-DC',
    trackingId: 'TRK-5120-DC',
    clientName: 'Metro Retail Distribution',
    status: 'Delivered',
    origin: 'Washington DC Hub',
    destination: 'Richmond Fleet Depot',
    distanceKm: 175,
    estimatedDuration: '2h 30m',
    cargo: {
      weightKg: 6400,
      volumeM3: 22.0,
      itemCount: 80,
      isHazmat: false,
      hazmatClass: null,
    },
    schedule: {
      pickupTime: '2026-07-29T09:00:00Z',
      deliveryWindowClose: '2026-07-29T18:00:00Z',
      actualDeliveryTime: '2026-07-29T16:45:00Z',
    },
    activityLog: [
      { id: 4, status: 'Delivered', timestamp: '2026-07-29T16:45:00Z', note: 'Delivery completed. Receiver signature captured.', actor: 'Driver' },
      { id: 3, status: 'In-Transit', timestamp: '2026-07-29T09:15:00Z', note: 'Departed DC Hub en route to Richmond', actor: 'Driver' },
      { id: 2, status: 'Assigned', timestamp: '2026-07-29T08:30:00Z', note: 'Manifest assigned to Driver John Doe', actor: 'Dispatch System' },
      { id: 1, status: 'Pending', timestamp: '2026-07-28T14:00:00Z', note: 'Order created', actor: 'Client Portal' },
    ],
  },
  {
    id: 'TRK-4089-VA',
    trackingId: 'TRK-4089-VA',
    clientName: 'Atlantic Coast Supply',
    status: 'Delayed',
    origin: 'Norfolk Marine Terminal',
    destination: 'Roanoke Distribution Center',
    distanceKm: 390,
    estimatedDuration: '5h 15m',
    cargo: {
      weightKg: 14100,
      volumeM3: 48.0,
      itemCount: 175,
      isHazmat: false,
      hazmatClass: null,
    },
    schedule: {
      pickupTime: '2026-07-29T10:00:00Z',
      deliveryWindowClose: '2026-07-29T19:00:00Z',
      actualDeliveryTime: null,
    },
    activityLog: [
      { id: 4, status: 'Delayed', timestamp: '2026-07-29T14:20:00Z', note: 'Reported Delay: Highway accident & lane closure on I-64', actor: 'Driver' },
      { id: 3, status: 'In-Transit', timestamp: '2026-07-29T10:30:00Z', note: 'Departed Norfolk Terminal', actor: 'Driver' },
      { id: 2, status: 'Assigned', timestamp: '2026-07-29T09:00:00Z', note: 'Driver assigned', actor: 'Dispatch System' },
      { id: 1, status: 'Pending', timestamp: '2026-07-28T16:20:00Z', note: 'Manifest created', actor: 'Client Portal' },
    ],
  },
];

const LOCAL_STORAGE_MANIFESTS_KEY = 'b2b_driver_manifests_store';

export function getStoredManifests(): ManifestItem[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_MANIFESTS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error reading driver manifests from localStorage:', e);
  }
  try {
    localStorage.setItem(LOCAL_STORAGE_MANIFESTS_KEY, JSON.stringify(MOCK_MANIFESTS));
  } catch (e) {
    console.error('Error saving initial manifests to localStorage:', e);
  }
  return MOCK_MANIFESTS;
}

export function saveStoredManifests(manifests: ManifestItem[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_MANIFESTS_KEY, JSON.stringify(manifests));
  } catch (e) {
    console.error('Error updating driver manifests in localStorage:', e);
  }
}

export function getManifestById(id: string): ManifestItem | null {
  const manifests = getStoredManifests();
  return manifests.find((m) => m.id === id || m.trackingId === id) || null;
}

export function updateManifestStatus(id: string, newStatus: string, note: string = ''): ManifestItem | undefined {
  const manifests = getStoredManifests();
  const updated = manifests.map((m) => {
    if (m.id === id || m.trackingId === id) {
      const nowIso = new Date().toISOString();
      const newActivity: ActivityItem = {
        id: Date.now(),
        status: newStatus,
        timestamp: nowIso,
        note: note || `Status updated to ${newStatus}`,
        actor: 'Driver',
      };

      const newSchedule = { ...m.schedule };
      if (newStatus === 'Delivered') {
        newSchedule.actualDeliveryTime = nowIso;
      }

      return {
        ...m,
        status: newStatus,
        schedule: newSchedule,
        activityLog: [newActivity, ...m.activityLog],
      };
    }
    return m;
  });

  saveStoredManifests(updated);
  return updated.find((m) => m.id === id || m.trackingId === id);
}
