import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, CheckCircle2, Clock, MapPin, ArrowRight, Receipt } from 'lucide-react';
import { StatCard } from '../../components/admin/shared/StatCard';
import { StatusBadge } from '../../components/admin/shared/StatusBadge';
import { AnimatedCard } from '../../components/admin/shared/AnimatedCard';
import { getMyManifests } from '../../services/manifestApi';
import { getMyInvoices } from '../../services/invoiceApi';

const DEMO_MANIFESTS = [
  {
    _id: 'm1',
    trackingId: 'TRK-8841',
    cargoDetails: { description: 'Industrial CNC Machine Parts' },
    routing: { origin: { city: 'Mumbai' }, destination: { city: 'Pune' } },
    currentStatus: 'IN_TRANSIT',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    _id: 'm2',
    trackingId: 'TRK-8842',
    cargoDetails: { description: 'Packaged Food — 500 Cartons' },
    routing: { origin: { city: 'Delhi' }, destination: { city: 'Jaipur' } },
    currentStatus: 'DELIVERED',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    _id: 'm3',
    trackingId: 'TRK-8843',
    cargoDetails: { description: 'Auto Components' },
    routing: { origin: { city: 'Ahmedabad' }, destination: { city: 'Chennai' } },
    currentStatus: 'PENDING',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
];

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

export const ClientDashboard: React.FC = () => {
  const [manifests, setManifests] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.allSettled([getMyManifests(), getMyInvoices()])
      .then(([mRes, iRes]) => {
        if (!mounted) return;
        const mData = (mRes as any).value?.manifests || (mRes as any).value?.data?.manifests || [];
        const iData = (iRes as any).value?.invoices || (iRes as any).value?.data?.invoices || [];
        setManifests(mData.length > 0 ? mData : DEMO_MANIFESTS);
        setInvoices(Array.isArray(iData) ? iData : []);
      })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const active = manifests.filter((m) => ['PENDING', 'ASSIGNED', 'IN_TRANSIT'].includes(m.currentStatus));
  const delivered = manifests.filter((m) => m.currentStatus === 'DELIVERED');
  const outstanding = invoices
    .filter((inv) => inv.status === 'PENDING')
    .reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);

  return (
    <div className="p-5 sm:p-7 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            Client Dashboard
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Track your shipments and manage freight requests
          </p>
        </div>
        <Link
          to="/client/place-order"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white transition-all duration-200"
          style={{ background: 'var(--color-accent)', boxShadow: '0 8px 20px rgba(255,107,44,0.3)' }}
        >
          Place Order <ArrowRight size={15} />
        </Link>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Shipments" value={active.length} icon={Truck} color="#8B5CF6" to="/client/track" />
        <StatCard title="Delivered" value={delivered.length} icon={CheckCircle2} color="#10B981" to="/client/track" />
        <StatCard title="Pending Orders" value={manifests.filter((m) => m.currentStatus === 'PENDING').length} icon={Clock} color="#F59E0B" to="/client/place-order" />
        <StatCard title="Outstanding (₹)" value={outstanding} icon={Receipt} color="#FF6B2C" to="/client/invoices" />
      </div>

      {/* Recent shipments */}
      <AnimatedCard delay={120}>
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-card)' }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--color-border-light)' }}>
            <h2 className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
              Recent Shipments
            </h2>
            <Link to="/client/track" className="text-xs font-semibold" style={{ color: 'var(--color-accent)' }}>
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border-light)' }}>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Tracking ID</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Goods</th>
                  <th className="hidden sm:table-cell px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Route</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Status</th>
                  <th className="hidden md:table-cell px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Created</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                      <td className="px-5 py-4"><div className="skeleton h-4 w-24" /></td>
                      <td className="px-5 py-4"><div className="skeleton h-4 w-32" /></td>
                      <td className="hidden sm:table-cell px-5 py-4"><div className="skeleton h-4 w-36" /></td>
                      <td className="px-5 py-4"><div className="skeleton h-5 w-20 rounded-full" /></td>
                      <td className="hidden md:table-cell px-5 py-4"><div className="skeleton h-4 w-28" /></td>
                      <td className="px-5 py-4" />
                    </tr>
                  ))
                ) : manifests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <Package size={32} className="mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
                      <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>No shipments yet</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Place your first order to get started</p>
                    </td>
                  </tr>
                ) : (
                  manifests.slice(0, 6).map((m) => (
                    <tr key={m._id} className="row-glow transition-colors" style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                      <td className="px-5 py-3.5 font-semibold whitespace-nowrap" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
                        {m.trackingId}
                      </td>
                      <td className="px-5 py-3.5 max-w-[180px] truncate" style={{ color: 'var(--color-text-secondary)' }}>
                        {m.cargoDetails?.description}
                      </td>
                      <td className="hidden sm:table-cell px-5 py-3.5 whitespace-nowrap" style={{ color: 'var(--color-text-secondary)' }}>
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin size={12} style={{ color: 'var(--color-accent)' }} />
                          {m.routing?.origin?.city}
                          <span style={{ color: 'var(--color-text-muted)' }}>→</span>
                          {m.routing?.destination?.city}
                        </span>
                      </td>
                      <td className="px-5 py-3.5"><StatusBadge status={m.currentStatus} /></td>
                      <td className="hidden md:table-cell px-5 py-3.5 whitespace-nowrap text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {fmtDate(m.createdAt)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link to="/client/track" className="text-xs font-semibold whitespace-nowrap" style={{ color: 'var(--color-accent)' }}>
                          Track →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </AnimatedCard>
    </div>
  );
};
