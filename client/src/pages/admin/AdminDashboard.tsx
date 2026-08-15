import { useState, useEffect, useCallback, useMemo } from 'react';
import { Package, Truck, Clock, AlertTriangle, FileText, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminNavbar from '../../components/admin/AdminNavbar';
import StatCard from '../../components/shared/StatCard';
import DataTable from '../../components/shared/DataTable';
import StatusBadge from '../../components/shared/StatusBadge';
import { getAllManifests, Manifest } from '../../services/manifestApi';
import { getVehicleStats, VehicleStats } from '../../services/vehicleApi';
import { getErrorMessage } from '../../services/errorMessage';

function formatDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AdminDashboard() {
  const [manifests, setManifests] = useState<Manifest[]>([]);
  const [stats, setStats] = useState<VehicleStats | null>(null);
  const [totalManifests, setTotalManifests] = useState(0);

  const loadData = useCallback(async () => {
    try {
      const [manifestsRes, statsRes] = await Promise.all([
        getAllManifests({ limit: 8 }),
        getVehicleStats(),
      ]);
      setManifests(manifestsRes.items);
      setTotalManifests(manifestsRes.total);
      setStats(statsRes);
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to load admin dashboard data.'));
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const pendingOrders = useMemo(
    () => manifests.filter((m) => m.currentStatus === 'Pending').length,
    [manifests]
  );
  const overdueOrders = useMemo(
    () => manifests.filter((m) => m.currentStatus === 'Delayed').length,
    [manifests]
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <AdminNavbar active="dashboard" />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Overview of manifests, fleet status, and pending work.</p>
        </header>

        {/* ── Stat Cards Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard title="Total Manifests" value={totalManifests} icon={Package} colorTheme="blue" />
          <StatCard title="Active Vehicles" value={stats?.total || 0} icon={Truck} colorTheme="orange" />
          <StatCard title="Pending Orders" value={pendingOrders} icon={Clock} colorTheme="purple" />
          <StatCard title="Overdue / Delayed" value={overdueOrders} icon={AlertTriangle} colorTheme="red" />
        </div>

        {/* ── Recent Manifests ── */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden flex flex-col hover:shadow-md transition-shadow">
          <div className="p-5 md:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-500" /> Recent Manifests
            </h2>
            <a
              href="/admin/manifest/create"
              className="inline-flex items-center text-xs font-bold text-orange-500 hover:text-orange-600 transition-all hover:scale-105 active:scale-95"
            >
              Create Manifest <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </a>
          </div>

          <DataTable
            columns={[
              {
                header: 'Tracking ID',
                render: (m: Manifest) => <span className="font-bold text-slate-900 font-mono tracking-wider">{m.trackingId}</span>,
              },
              {
                header: 'Route',
                render: (m: Manifest) => (
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-800 text-sm">{m.routing.destination.name}</span>
                    <span className="text-xs text-slate-500">from {m.routing.origin.name}</span>
                  </div>
                ),
              },
              {
                header: 'Cargo',
                render: (m: Manifest) => (
                  <span className="font-medium text-slate-600 text-sm">
                    {m.cargoDetails.weight.toLocaleString()} kg / {m.cargoDetails.itemCount} items
                  </span>
                ),
              },
              {
                header: 'Scheduled Pickup',
                render: (m: Manifest) => <span className="font-medium text-slate-600 text-sm">{formatDate(m.scheduledPickup)}</span>,
              },
              {
                header: 'Status',
                render: (m: Manifest) => <StatusBadge status={m.currentStatus} />,
              },
            ]}
            data={manifests}
            emptyMessage="No manifests found yet. Create one to get started."
            emptyIcon={<Package className="w-10 h-10 text-slate-300 mx-auto" />}
          />
        </div>
      </main>
    </div>
  );
}
