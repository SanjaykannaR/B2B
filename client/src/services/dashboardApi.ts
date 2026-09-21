export interface DashboardStats {
  totalManifests: number;
  activeVehicles: number;
  pendingOrders: number;
  alerts: number;
}

export async function getDashboardStats(): Promise<DashboardStats | null> {
  try {
    const res = await fetch('/api/admin/dashboard-stats', {
      headers: { Authorization: `Bearer ${localStorage.getItem('b2b_auth_token') ?? ''}` },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
