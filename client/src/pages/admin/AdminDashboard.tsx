import { useEffect, useState } from 'react';
import { FiPackage, FiTruck, FiClock, FiAlertTriangle } from 'react-icons/fi';
import MetricCard from '../../components/shared/MetricCard';

interface DashboardStats {
  totalManifests: number;
  activeVehicles: number;
  pendingOrders: number;
  alerts: number;
}

const STATS: DashboardStats = {
  totalManifests: 1248,
  activeVehicles: 34,
  pendingOrders: 12,
  alerts: 3,
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>(STATS);
  const [, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { getDashboardStats } = await import('../../services/dashboardApi');
        const data = await getDashboardStats();
        if (!cancelled && data) setStats(data);
      } catch {
        /* use defaults */
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto', padding: '1.5rem 1rem 3rem 1rem', minWidth: 0, overflowX: 'hidden' }}>
      <div
        style={{
          backgroundColor: '#1B2A4A',
          color: '#FFFFFF',
          borderRadius: '1rem',
          padding: '2rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, #1B2A4A 0%, #0F1B33 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
            <span style={{ backgroundColor: '#FF6B2C', color: '#FFF', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em' }}>
              ADMIN DASHBOARD
            </span>
            <span style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>Fleet &amp; manifest overview</span>
          </div>

          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#FFFFFF' }}>
            Admin Dashboard
          </h1>
          <p style={{ color: '#94A3B8', margin: 0, fontSize: '0.9375rem', maxWidth: '640px' }}>
            Fleet utilization, manifest totals, pending orders, and active alerts — real-time operational overview for dispatchers and admins.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <MetricCard
          label="TOTAL MANIFESTS"
          value={stats.totalManifests.toLocaleString()}
          icon={<FiPackage size={22} color="#2563EB" />}
          accentColor="#2563EB"
          themeColor="#2563EB"
        />
        <MetricCard
          label="ACTIVE VEHICLES"
          value={stats.activeVehicles.toString()}
          icon={<FiTruck size={22} color="#10B981" />}
          accentColor="#10B981"
          themeColor="#10B981"
        />
        <MetricCard
          label="PENDING ORDERS"
          value={stats.pendingOrders.toString()}
          icon={<FiClock size={22} color="#F59E0B" />}
          accentColor="#F59E0B"
          themeColor="#F59E0B"
        />
        <MetricCard
          label="ALERTS / DELAYS"
          value={stats.alerts.toString()}
          icon={<FiAlertTriangle size={22} color="#EF4444" />}
          accentColor="#EF4444"
          themeColor="#EF4444"
        />
      </div>
    </div>
  );
}
