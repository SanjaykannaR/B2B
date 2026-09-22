import api from './api';

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

function formatStatus(raw: string): string {
  const map: Record<string, string> = {
    PENDING: 'Pending',
    ASSIGNED: 'Assigned',
    IN_TRANSIT: 'In-Transit',
    DELIVERED: 'Delivered',
    DELAYED: 'Delayed',
    CANCELLED: 'Cancelled',
  };
  return map[raw] || raw;
}

function mapManifest(m: any): ManifestItem {
  const origin = m.origin || m.routing?.origin || {};
  const destination = m.destination || m.routing?.destination || {};
  const cargo = m.cargoDetails || m.cargo || {};
  const schedule = m.schedule || {};
  const rawStatus = m.currentStatus || m.status || 'ASSIGNED';

  return {
    id: m._id || m.trackingId,
    trackingId: m.trackingId || m._id,
    clientName: m.client?.name || m.client?.firstName || 'Unknown',
    status: formatStatus(rawStatus),
    origin: origin.city || origin.address || 'Unknown Origin',
    destination: destination.city || destination.address || 'Unknown Destination',
    distanceKm: m.distanceKm || m.routing?.estimatedDistanceKm || 0,
    estimatedDuration: m.estimatedDuration || '',
    cargo: {
      weightKg: cargo.totalWeightKg || cargo.weightKg || 0,
      volumeM3: cargo.totalVolumeCubicMeters || cargo.volumeM3 || 0,
      itemCount: cargo.itemCount || 1,
      isHazmat: cargo.isHazardous || cargo.isHazmat || false,
      hazmatClass: cargo.hazmatClass || null,
    },
    schedule: {
      pickupTime: m.scheduledPickup || schedule.pickupTime || m.createdAt || '',
      deliveryWindowClose: m.scheduledDeliveryWindowClose || schedule.deliveryWindowClose || '',
      actualDeliveryTime: m.actualDeliveryTime || schedule.actualDeliveryTime || null,
    },
    activityLog: (m.statusTimeline || m.activityLog || []).map((item: any, i: number) => ({
      id: item.id || i,
      status: formatStatus(item.status) || item.status || '',
      timestamp: item.timestamp || item.createdAt || '',
      note: item.note || '',
      actor: item.updatedBy || item.actor || 'System',
    })),
  };
}

export async function getStoredManifests(): Promise<ManifestItem[]> {
  try {
    const response = await api.get('/manifests/driver/my');
    const data = response.data?.manifests || response.data?.data?.manifests || response.data || [];
    return Array.isArray(data) ? data.map(mapManifest) : [];
  } catch {
    return [];
  }
}

export async function getManifestById(id: string): Promise<ManifestItem | null> {
  try {
    const response = await api.get(`/manifests/${id}`);
    const m = response.data?.manifest || response.data?.data?.manifest || response.data;
    return m ? mapManifest(m) : null;
  } catch {
    return null;
  }
}

export async function updateManifestStatus(id: string, newStatus: string, note: string = ''): Promise<ManifestItem | null> {
  try {
    const statusMap: Record<string, string> = {
      'In-Transit': 'IN_TRANSIT',
      'Delayed': 'DELAYED',
      'Delivered': 'DELIVERED',
    };
    const backendStatus = statusMap[newStatus] || newStatus.toUpperCase();
    const response = await api.patch(`/manifests/${id}/status`, { status: backendStatus, note });
    const m = response.data?.manifest || response.data?.data?.manifest || response.data;
    return m ? mapManifest(m) : null;
  } catch {
    return null;
  }
}
