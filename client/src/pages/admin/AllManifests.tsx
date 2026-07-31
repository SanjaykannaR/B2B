import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Package, Download } from 'lucide-react';
import { StatusBadge } from '../../components/admin/shared/StatusBadge';
import { AnimatedCard } from '../../components/admin/shared/AnimatedCard';
import { Skeleton } from '../../components/admin/shared/Skeleton';
import { ManifestDetailModal } from '../../components/admin/ManifestDetailModal';
import * as manifestApi from '../../services/manifestApi';
import { formatDateTime } from '../../utils/formatters';

const DEMO_MANIFESTS = [
  { _id: '1', trackingId: 'TRK-8841', status: 'IN_TRANSIT', client: { name: 'Acme Corp' }, origin: { city: 'Mumbai', address: 'Factory A, Andheri' }, destination: { city: 'Delhi', address: 'Warehouse B, Noida' }, cargoDetails: { description: '200 TVs', totalWeightKg: 4000, isHazardous: false }, vehicle: { registrationNumber: 'MH-12-AB-1234' }, createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), updatedAt: new Date(Date.now() - 3600000).toISOString() },
  { _id: '2', trackingId: 'TRK-8842', status: 'DELIVERED', client: { name: 'GlobalTrade' }, origin: { city: 'Chennai', address: 'Port Trust, Ennore' }, destination: { city: 'Bangalore', address: 'DC Whitefield' }, cargoDetails: { description: '500 Boxes Electronics', totalWeightKg: 8500, isHazardous: false }, vehicle: { registrationNumber: 'TN-07-EF-9012' }, createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date(Date.now() - 7200000).toISOString() },
  { _id: '3', trackingId: 'TRK-8843', status: 'PENDING', client: { name: 'QuickShip' }, origin: { city: 'Kolkata', address: 'Haldia Dock' }, destination: { city: 'Hyderabad', address: 'Moula Ali SCD' }, cargoDetails: { description: 'Industrial Parts', totalWeightKg: 12000, isHazardous: true }, vehicle: null, createdAt: new Date(Date.now() - 7200000).toISOString(), updatedAt: new Date(Date.now() - 10800000).toISOString() },
  { _id: '4', trackingId: 'TRK-8844', status: 'DELAYED', client: { name: 'FastFreight' }, origin: { city: 'Pune', address: 'Chakan MIDC' }, destination: { city: 'Ahmedabad', address: 'Sanand GIDC' }, cargoDetails: { description: 'Furniture Set', totalWeightKg: 3200, isHazardous: false }, vehicle: { registrationNumber: 'GJ-06-IJ-7890' }, createdAt: new Date(Date.now() - 172800000).toISOString(), updatedAt: new Date(Date.now() - 14400000).toISOString() },
  { _id: '5', trackingId: 'TRK-8845', status: 'ASSIGNED', client: { name: 'LogiPrime' }, origin: { city: 'Jaipur', address: 'Sitapura Industrial' }, destination: { city: 'Lucknow', address: 'Aminabad Market' }, cargoDetails: { description: 'Auto Components', totalWeightKg: 6800, isHazardous: false }, vehicle: { registrationNumber: 'KA-05-GH-3456' }, createdAt: new Date(Date.now() - 259200000).toISOString(), updatedAt: new Date(Date.now() - 18000000).toISOString() },
  { _id: '6', trackingId: 'TRK-8846', status: 'IN_TRANSIT', client: { name: 'Acme Corp' }, origin: { city: 'Surat', address: 'Textile Market' }, destination: { city: 'Mumbai', address: 'Bhiwandi Warehouse' }, cargoDetails: { description: 'Textile Roll', totalWeightKg: 2200, isHazardous: false }, vehicle: { registrationNumber: 'MH-12-AB-1234' }, createdAt: new Date(Date.now() - 43200000).toISOString(), updatedAt: new Date(Date.now() - 21600000).toISOString() },
  { _id: '7', trackingId: 'TRK-8847', status: 'DELIVERED', client: { name: 'GlobalTrade' }, origin: { city: 'Coimbatore', address: 'SIDCO Estate' }, destination: { city: 'Chennai', address: 'Ambattur OT' }, cargoDetails: { description: 'Machine Parts', totalWeightKg: 5400, isHazardous: false }, vehicle: { registrationNumber: 'TN-07-EF-9012' }, createdAt: new Date(Date.now() - 345600000).toISOString(), updatedAt: new Date(Date.now() - 259200000).toISOString() },
  { _id: '8', trackingId: 'TRK-8848', status: 'PENDING', client: { name: 'QuickShip' }, origin: { city: 'Nagpur', address: 'Mihan SEZ' }, destination: { city: 'Raipur', address: 'Mana Industrial' }, cargoDetails: { description: 'Chemical Drums', totalWeightKg: 9000, isHazardous: true }, vehicle: null, createdAt: new Date(Date.now() - 14400000).toISOString(), updatedAt: new Date(Date.now() - 14400000).toISOString() },
  { _id: '9', trackingId: 'TRK-8849', status: 'CANCELLED', client: { name: 'FastFreight' }, origin: { city: 'Vadodara', address: 'GIDC Phase 3' }, destination: { city: 'Rajkot', address: 'Aji GIDC' }, cargoDetails: { description: 'Ceramic Tiles', totalWeightKg: 7600, isHazardous: false }, vehicle: null, createdAt: new Date(Date.now() - 432000000).toISOString(), updatedAt: new Date(Date.now() - 345600000).toISOString() },
  { _id: '10', trackingId: 'TRK-8850', status: 'IN_TRANSIT', client: { name: 'LogiPrime' }, origin: { city: 'Bhopal', address: 'Mandideep Industrial' }, destination: { city: 'Indore', address: 'Pithampur Hub' }, cargoDetails: { description: 'Pharmaceuticals', totalWeightKg: 1800, isHazardous: false }, vehicle: { registrationNumber: 'KA-05-GH-3456' }, createdAt: new Date(Date.now() - 5400000).toISOString(), updatedAt: new Date(Date.now() - 3600000).toISOString() },
];

type StatusFilter = 'ALL' | 'PENDING' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED' | 'DELAYED' | 'CANCELLED';

export const AllManifests: React.FC = () => {
  const [manifests, setManifests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [selected, setSelected] = useState<any | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const STATUS_TABS: StatusFilter[] = ['ALL', 'PENDING', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'DELAYED', 'CANCELLED'];

  // Reset to page 1 whenever the search or status filter changes
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await manifestApi.getManifests({ page: 1, limit: pageSize });
        const data = res.manifests || res || [];
        setManifests(data.length > 0 ? data : DEMO_MANIFESTS);
      } catch {
        setManifests(DEMO_MANIFESTS);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [pageSize]);

  const filtered = useMemo(() => {
    let result = manifests;
    if (statusFilter !== 'ALL') {
      result = result.filter((m) => m.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.trackingId?.toLowerCase().includes(q) ||
          m.client?.name?.toLowerCase().includes(q) ||
          m.origin?.city?.toLowerCase().includes(q) ||
          m.destination?.city?.toLowerCase().includes(q) ||
          m.cargoDetails?.description?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [manifests, search, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: manifests.length };
    manifests.forEach((m) => {
      counts[m.status] = (counts[m.status] || 0) + 1;
    });
    return counts;
  }, [manifests]);

  // Pagination (client-side slice over the filtered set)
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  return (
    <div className="p-5 sm:p-7 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <AnimatedCard>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/admin"
              className="p-2 rounded-lg transition-all duration-200"
              style={{ color: 'var(--color-text-muted)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-surface-hover)'; e.currentTarget.style.color = 'var(--color-text-primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-muted)'; }}
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
                All Manifests
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                {filtered.length} manifest{filtered.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 min-h-[44px]"
            style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            <Download size={16} /> Export
          </button>
        </div>
      </AnimatedCard>

      {/* Search + Filters */}
      <AnimatedCard delay={80}>
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Search by tracking ID, client, city, cargo..."
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none border transition-all duration-200 focus:ring-2 focus:ring-[var(--color-accent)] min-h-[44px]"
              style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2 mt-4">
          {STATUS_TABS.map((tab) => {
            const isActive = statusFilter === tab;
            const count = statusCounts[tab] || 0;
            return (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 min-h-[36px]"
                style={{
                  background: isActive ? 'var(--color-accent)' : 'var(--color-surface-hover)',
                  color: isActive ? '#fff' : 'var(--color-text-secondary)',
                  boxShadow: isActive ? '0 2px 8px rgba(255,107,44,0.2)' : 'none',
                }}
              >
                {tab.replace('_', ' ')}
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                  style={{
                    background: isActive ? 'rgba(255,255,255,0.2)' : 'var(--color-surface-card)',
                    color: isActive ? '#fff' : 'var(--color-text-muted)',
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </AnimatedCard>

      {/* Table */}
      <AnimatedCard delay={160}>
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-card)' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border-light)' }}>
                  <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider">Tracking ID</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider">Client</th>
                  <th className="hidden sm:table-cell px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider">Origin</th>
                  <th className="hidden sm:table-cell px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider">Destination</th>
                  <th className="hidden lg:table-cell px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider">Cargo</th>
                  <th className="hidden md:table-cell px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider">Weight</th>
                  <th className="hidden lg:table-cell px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider">Vehicle</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider">Status</th>
                  <th className="hidden md:table-cell px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-5 py-4"><Skeleton className="h-4 w-28" /></td>
                      <td className="hidden sm:table-cell px-5 py-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="hidden sm:table-cell px-5 py-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="hidden lg:table-cell px-5 py-4"><Skeleton className="h-4 w-28" /></td>
                      <td className="hidden md:table-cell px-5 py-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="hidden lg:table-cell px-5 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-5 py-4"><Skeleton className="h-5 w-20 rounded-full" /></td>
                      <td className="hidden md:table-cell px-5 py-4"><Skeleton className="h-4 w-24" /></td>
                    </tr>
                  ))
                ) : pageItems.length > 0 ? (
                  pageItems.map((m, i) => (
                    <tr
                      key={m._id || m.trackingId}
                      className="row-glow transition-colors cursor-pointer"
                      style={{ borderBottom: '1px solid var(--color-border-light)', animationDelay: `${i * 40}ms` }}
                      onClick={() => setSelected(m)}
                    >
                      <td
                        className="px-6 py-3.5 font-bold whitespace-nowrap"
                        style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}
                      >
                        #{m.trackingId}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap" style={{ color: 'var(--color-text-primary)' }}>
                        {m.client?.name || '—'}
                      </td>
                      <td className="hidden sm:table-cell px-5 py-3.5 whitespace-nowrap" style={{ color: 'var(--color-text-secondary)' }}>
                        {m.origin?.city || '—'}
                      </td>
                      <td className="hidden sm:table-cell px-5 py-3.5 whitespace-nowrap" style={{ color: 'var(--color-text-secondary)' }}>
                        {m.destination?.city || '—'}
                      </td>
                      <td className="hidden lg:table-cell px-5 py-3.5 whitespace-nowrap max-w-[160px] truncate" style={{ color: 'var(--color-text-secondary)' }}>
                        {m.cargoDetails?.description || '—'}
                        {m.cargoDetails?.isHazardous && (
                          <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444' }}>
                            HAZ
                          </span>
                        )}
                      </td>
                      <td className="hidden md:table-cell px-5 py-3.5 whitespace-nowrap" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
                        {m.cargoDetails?.totalWeightKg ? `${m.cargoDetails.totalWeightKg.toLocaleString()} kg` : '—'}
                      </td>
                      <td className="hidden lg:table-cell px-5 py-3.5 whitespace-nowrap text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
                        {m.vehicle?.registrationNumber || '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={m.status} />
                      </td>
                      <td className="hidden md:table-cell px-5 py-3.5 whitespace-nowrap text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {formatDateTime(m.createdAt)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-6 py-20 text-center">
                      <Package size={36} className="mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
                      <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>No manifests found</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Try adjusting your search or filter</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination footer */}
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t"
            style={{ borderColor: 'var(--color-border-light)' }}
          >
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Showing {total === 0 ? 0 : start + 1}–{Math.min(start + pageSize, total)} of {total}
            </p>
            <div className="flex items-center gap-3">
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="px-3 py-2 rounded-xl text-xs outline-none border min-h-[36px]"
                style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                aria-label="Page size"
              >
                {[10, 25, 50, 100].map((n) => (
                  <option key={n} value={n}>{n} / page</option>
                ))}
              </select>
              <span className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                Page {safePage} of {totalPages}
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setPage(safePage - 1)}
                  disabled={safePage <= 1}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 min-h-[36px] disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage(safePage + 1)}
                  disabled={safePage >= totalPages}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 min-h-[36px] disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </AnimatedCard>

      {/* Row click → detail modal (read-only) */}
      <ManifestDetailModal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        manifest={selected}
      />
    </div>
  );
};
