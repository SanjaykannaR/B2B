import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, Clock, AlertTriangle, ArrowRight, Plus, FileDown } from 'lucide-react';
import { StatCard } from '../../components/admin/shared/StatCard';
import { StatusBadge } from '../../components/admin/shared/StatusBadge';
import { AnimatedCard } from '../../components/admin/shared/AnimatedCard';
import { PageHeader } from '../../components/admin/shared/PageHeader';
import { Skeleton } from '../../components/admin/shared/Skeleton';
import * as manifestApi from '../../services/manifestApi';
import { formatDateTime } from '../../utils/formatters';

/** Demo data shown when backend is offline */
const DEMO_MANIFESTS = [
  { _id: '1', trackingId: 'TRK-8841', status: 'IN_TRANSIT', client: { name: 'Acme Corp' }, origin: { city: 'Mumbai' }, destination: { city: 'Delhi' }, updatedAt: new Date(Date.now() - 3600000).toISOString() },
  { _id: '2', trackingId: 'TRK-8842', status: 'DELIVERED', client: { name: 'GlobalTrade' }, origin: { city: 'Chennai' }, destination: { city: 'Bangalore' }, updatedAt: new Date(Date.now() - 7200000).toISOString() },
  { _id: '3', trackingId: 'TRK-8843', status: 'PENDING', client: { name: 'QuickShip' }, origin: { city: 'Kolkata' }, destination: { city: 'Hyderabad' }, updatedAt: new Date(Date.now() - 10800000).toISOString() },
  { _id: '4', trackingId: 'TRK-8844', status: 'DELAYED', client: { name: 'FastFreight' }, origin: { city: 'Pune' }, destination: { city: 'Ahmedabad' }, updatedAt: new Date(Date.now() - 14400000).toISOString() },
  { _id: '5', trackingId: 'TRK-8845', status: 'ASSIGNED', client: { name: 'LogiPrime' }, origin: { city: 'Jaipur' }, destination: { city: 'Lucknow' }, updatedAt: new Date(Date.now() - 18000000).toISOString() },
];

const STATUS_SEGMENTS = [
  { label: 'Pending', count: 28, color: '#F59E0B' },
  { label: 'In Transit', count: 45, color: '#8B5CF6' },
  { label: 'Delivered', count: 112, color: '#10B981' },
  { label: 'Delayed', count: 8, color: '#EF4444' },
];

export const AdminDashboard: React.FC = () => {
  const [manifests, setManifests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await manifestApi.getManifests({ limit: 5 });
        setManifests(res.manifests || res || []);
      } catch {
        setManifests(DEMO_MANIFESTS);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const total = STATUS_SEGMENTS.reduce((s, x) => s + x.count, 0);

  return (
    <div className="p-5 sm:p-7 lg:p-8 max-w-[1400px] mx-auto space-y-7">
      {/* ── Header ── */}
      <AnimatedCard>
        <PageHeader
          title="Dashboard"
          subtitle="Welcome back, Admin. Here's what's happening today."
          secondaryAction={
            <button
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                transition-all duration-200 border shrink-0 min-h-[44px]"
              style={{
                background: 'var(--color-surface-card)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-secondary)',
              }}
            >
              <FileDown size={16} /> Export
            </button>
          }
          action={
            <Link
              to="/admin/manifests/new"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white
                transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg shrink-0 whitespace-nowrap min-h-[44px]"
              style={{ background: 'var(--color-accent)', boxShadow: '0 4px 14px rgba(255,107,44,0.3)' }}
            >
              <Plus size={16} /> New Manifest
            </Link>
          }
        />
      </AnimatedCard>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <AnimatedCard delay={80}>
          <StatCard title="Total Manifests" value={1248} icon={Package} color="#3B82F6" trend={{ value: '12%', isPositive: true }} to="/admin/manifests" />
        </AnimatedCard>
        <AnimatedCard delay={160}>
          <StatCard title="Active Vehicles" value={34} icon={Truck} color="#10B981" trend={{ value: '4%', isPositive: true }} to="/admin/fleet" />
        </AnimatedCard>
        <AnimatedCard delay={240}>
          <StatCard title="Pending Orders" value={12} icon={Clock} color="#F59E0B" trend={{ value: '8%', isPositive: false }} to="/admin/manifests" />
        </AnimatedCard>
        <AnimatedCard delay={320}>
          <StatCard title="Alerts / Delayed" value={3} icon={AlertTriangle} color="#EF4444" to="/admin/live" />
        </AnimatedCard>
      </div>

      {/* ── Bottom Grid: Table + Status Sidebar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Manifests Table — 2 cols */}
        <AnimatedCard delay={400} className="lg:col-span-2">
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)' }}
          >
            <div
              className="px-6 py-4 flex items-center justify-between border-b"
              style={{ borderColor: 'var(--color-border-light)' }}
            >
              <h2 className="text-base font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Recent Manifests
              </h2>
              <Link
                to="/admin/manifests"
                className="flex items-center gap-1 text-xs font-semibold transition-colors"
                style={{ color: 'var(--color-accent)' }}
              >
                View All <ArrowRight size={14} />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border-light)' }}>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Tracking ID</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Client</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Route</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                        <td className="px-5 py-4"><Skeleton className="h-4 w-28" /></td>
                        <td className="px-5 py-4"><Skeleton className="h-4 w-32" /></td>
                        <td className="px-5 py-4"><Skeleton className="h-5 w-20 rounded-full" /></td>
                        <td className="px-5 py-4"><Skeleton className="h-4 w-28" /></td>
                      </tr>
                    ))
                  ) : manifests.length > 0 ? (
                    manifests.map((m, i) => (
                      <tr
                        key={m._id || m.trackingId}
                        className="row-glow transition-colors cursor-pointer"
                        style={{
                          borderBottom: '1px solid var(--color-border-light)',
                          animationDelay: `${i * 60}ms`,
                        }}
                      >
                        <td
                          className="px-6 py-3.5 font-bold whitespace-nowrap"
                          style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}
                        >
                          #{m.trackingId || 'MNF-XX'}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap" style={{ color: 'var(--color-text-primary)' }}>
                          {m.client?.name || 'Unknown'}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap" style={{ color: 'var(--color-text-secondary)' }}>
                          {m.origin?.city} → {m.destination?.city}
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={m.status} />
                        </td>
                        <td className="px-5 py-3.5 text-right whitespace-nowrap" style={{ color: 'var(--color-text-muted)' }}>
                          {formatDateTime(m.updatedAt)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center" style={{ color: 'var(--color-text-muted)' }}>
                        No recent manifests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </AnimatedCard>

        {/* ── Right Sidebar: Status Distribution + Quick Actions ── */}
        <AnimatedCard delay={480} className="space-y-5">
          {/* Status Distribution */}
          <div
            className="rounded-2xl border p-6"
            style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)' }}
          >
            <h3 className="text-sm font-bold mb-5" style={{ color: 'var(--color-text-primary)' }}>
              Status Distribution
            </h3>
            <div className="space-y-4">
              {STATUS_SEGMENTS.map((seg) => (
                <div key={seg.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                      {seg.label}
                    </span>
                    <span className="text-xs font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
                      {seg.count}
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-hover)' }}>
                    <div
                      className="h-full rounded-full animate-bar-grow"
                      style={{
                        width: `${(seg.count / total) * 100}%`,
                        background: seg.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div
            className="rounded-2xl border p-6"
            style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)' }}
          >
            <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Quick Actions
            </h3>
            <div className="space-y-1.5">
              {[
                { label: 'Create Manifest', icon: Plus, href: '/admin/manifests/new', color: '#3B82F6' },
                { label: 'Fleet Monitor', icon: Truck, href: '/admin/fleet', color: '#10B981' },
                { label: 'Live Operations', icon: Package, href: '/admin/live', color: '#8B5CF6' },
              ].map(({ label, icon: I, href, color }) => (
                <a
                  key={href}
                  href={href}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200
                    hover:-translate-x-0.5 group/action min-h-[44px]"
                  style={{ color: 'var(--color-text-primary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--color-surface-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-lg transition-transform duration-200 group-hover/action:scale-110 shrink-0"
                    style={{ background: `${color}15`, color }}
                  >
                    <I size={16} />
                  </div>
                  <span className="text-sm font-semibold">{label}</span>
                  <ArrowRight size={14} className="ml-auto opacity-0 group-hover/action:opacity-100 transition-opacity shrink-0"
                    style={{ color: 'var(--color-text-muted)' }} />
                </a>
              ))}
            </div>
          </div>
        </AnimatedCard>
      </div>
    </div>
  );
};
