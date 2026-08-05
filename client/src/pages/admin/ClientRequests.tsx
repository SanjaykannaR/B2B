import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, ClipboardList, Download, MessageCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { AnimatedCard } from '../../components/admin/shared/AnimatedCard';
import { Skeleton } from '../../components/admin/shared/Skeleton';
import { ClientRequestDetailModal } from '../../components/admin/ClientRequestDetailModal';

// Demo data — used when backend is unavailable, same pattern as AllManifests
const DEMO_REQUESTS = [
  {
    _id: 'r1',
    clientName: 'Rajesh Kumar',
    companyName: 'Acme Industries Pvt Ltd',
    gstNumber: '27AABCU9603R1ZM',
    phone: '+91 98765 43210',
    email: 'rajesh@acmeindustries.com',
    goodsDescription: 'Industrial CNC Machine Parts',
    goodsQuantity: 50,
    goodsWeightKg: 2500,
    originCity: 'Mumbai',
    destinationCity: 'Pune',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    notes: 'Fragile items, need careful handling. Prefer enclosed truck.',
  },
  {
    _id: 'r2',
    clientName: 'Priya Sharma',
    companyName: 'GlobalTrade Exports',
    gstNumber: '07AAACG1234F1Z5',
    phone: '+91 87654 32109',
    email: 'priya@globaltrade.co.in',
    goodsDescription: 'Packaged Food Products — 500 Cartons',
    goodsQuantity: 500,
    goodsWeightKg: 8000,
    originCity: 'Delhi',
    destinationCity: 'Jaipur',
    status: 'APPROVED',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    _id: 'r3',
    clientName: 'Amit Patel',
    companyName: 'FastFreight Logistics',
    gstNumber: '24AABCF5678G1Z2',
    phone: '+91 76543 21098',
    email: 'amit@fastfreight.com',
    goodsDescription: 'Auto Components — Brake Assemblies',
    goodsQuantity: 200,
    goodsWeightKg: 3200,
    originCity: 'Ahmedabad',
    destinationCity: 'Chennai',
    status: 'REJECTED',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    notes: 'Rejected: Route not available for this destination.',
  },
  {
    _id: 'r4',
    clientName: 'Sneha Reddy',
    companyName: 'QuickShip Solutions',
    gstNumber: '36AABCQ9012H1Z8',
    phone: '+91 65432 10987',
    email: 'sneha@quickship.in',
    goodsDescription: 'Pharmaceutical Raw Materials',
    goodsQuantity: 100,
    goodsWeightKg: 1500,
    originCity: 'Hyderabad',
    destinationCity: 'Bangalore',
    status: 'CONTACTED',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    notes: 'Called client — confirmed cold storage requirement.',
  },
  {
    _id: 'r5',
    clientName: 'Vikram Singh',
    companyName: 'LogiPrime Transport',
    gstNumber: '09AABCL3456I1Z1',
    phone: '+91 54321 09876',
    email: 'vikram@logiprime.com',
    goodsDescription: 'Textile Fabrics — 800 Rolls',
    goodsQuantity: 800,
    goodsWeightKg: 4800,
    originCity: 'Surat',
    destinationCity: 'Mumbai',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    _id: 'r6',
    clientName: 'Meera Joshi',
    companyName: 'SwiftCargo Movers',
    gstNumber: '29AABCS7890J1Z4',
    phone: '+91 43210 98765',
    email: 'meera@swiftcargo.in',
    goodsDescription: 'Ceramic Tiles — 2000 Pieces',
    goodsQuantity: 2000,
    goodsWeightKg: 9600,
    originCity: 'Bangalore',
    destinationCity: 'Kolkata',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 5400000).toISOString(),
    notes: 'Heavy load — may need multi-axle truck.',
  },
  {
    _id: 'r7',
    clientName: 'Arjun Mehta',
    companyName: 'NovaTech Systems',
    gstNumber: '27AABCN1122K1Z7',
    phone: '+91 32109 87654',
    email: 'arjun@novatech.co.in',
    goodsDescription: 'Server Racks — 15 Units',
    goodsQuantity: 15,
    goodsWeightKg: 1200,
    originCity: 'Pune',
    destinationCity: 'Delhi',
    status: 'APPROVED',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    _id: 'r8',
    clientName: 'Kavita Nair',
    companyName: 'Pacific Shipping Co',
    gstNumber: '32AABCP4455L1Z3',
    phone: '+91 21098 76543',
    email: 'kavita@pacificshipping.com',
    goodsDescription: 'Marine Engine Parts',
    goodsQuantity: 30,
    goodsWeightKg: 6000,
    originCity: 'Kochi',
    destinationCity: 'Mumbai',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 10800000).toISOString(),
  },
];

// Inline status config — avoids touching shared StatusBadge
const STATUS_STYLE: Record<string, { text: string; bg: string; dot: string }> = {
  PENDING:   { text: '#D97706', bg: '#FEF3C7', dot: '#F59E0B' },
  APPROVED:  { text: '#059669', bg: '#D1FAE5', dot: '#10B981' },
  REJECTED:  { text: '#DC2626', bg: '#FEE2E2', dot: '#EF4444' },
  CONTACTED: { text: '#2563EB', bg: '#DBEAFE', dot: '#3B82F6' },
};

type StatusFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CONTACTED';

export const ClientRequests: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [selected, setSelected] = useState<any | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const STATUS_TABS: StatusFilter[] = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CONTACTED'];

  // Reset to page 1 when search or filter changes
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  // Load requests — API-ready with demo fallback
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // TODO: replace with real API call when backend is ready
        // const res = await clientRequestApi.getClientRequests();
        // const data = res.requests || res || [];
        // setRequests(data.length > 0 ? data : DEMO_REQUESTS);
        await new Promise((r) => setTimeout(r, 400)); // simulate network
        setRequests(DEMO_REQUESTS);
      } catch {
        setRequests(DEMO_REQUESTS);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Client-side filter + search
  const filtered = useMemo(() => {
    let result = requests;
    if (statusFilter !== 'ALL') {
      result = result.filter((r) => r.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.clientName?.toLowerCase().includes(q) ||
          r.companyName?.toLowerCase().includes(q) ||
          r.gstNumber?.toLowerCase().includes(q) ||
          r.phone?.toLowerCase().includes(q) ||
          r.email?.toLowerCase().includes(q) ||
          r.goodsDescription?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [requests, search, statusFilter]);

  // Counts per status for tab badges
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: requests.length };
    requests.forEach((r) => { counts[r.status] = (counts[r.status] || 0) + 1; });
    return counts;
  }, [requests]);

  // Pagination
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  // Action handlers — wired to local state for now
  const handleApprove = (id: string) => {
    setRequests((prev) => prev.map((r) => (r._id === id ? { ...r, status: 'APPROVED' } : r)));
    setSelected((prev: any) => (prev?._id === id ? { ...prev, status: 'APPROVED' } : prev));
  };

  const handleReject = (id: string) => {
    setRequests((prev) => prev.map((r) => (r._id === id ? { ...r, status: 'REJECTED' } : r)));
    setSelected((prev: any) => (prev?._id === id ? { ...prev, status: 'REJECTED' } : prev));
  };

  const handleContact = (id: string) => {
    setRequests((prev) => prev.map((r) => (r._id === id ? { ...r, status: 'CONTACTED' } : r)));
    setSelected((prev: any) => (prev?._id === id ? { ...prev, status: 'CONTACTED' } : prev));
  };

  return (
    <div className="p-5 sm:p-7 lg:p-8 max-w-[1400px] mx-auto space-y-6">

      {/* ── Header ────────────────────────────────────────────── */}
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
              <h1
                className="text-2xl sm:text-3xl font-bold tracking-tight"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Client Requests
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                {filtered.length} request{filtered.length !== 1 ? 's' : ''} found
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

      {/* ── KPI Cards — clickable, filter table on click ─────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {([
          { label: 'Total', value: requests.length, color: 'var(--color-accent)', icon: ClipboardList, filter: 'ALL' as StatusFilter },
          { label: 'Pending', value: requests.filter((r) => r.status === 'PENDING').length, color: '#F59E0B', icon: Clock, filter: 'PENDING' as StatusFilter },
          { label: 'Approved', value: requests.filter((r) => r.status === 'APPROVED').length, color: '#10B981', icon: CheckCircle, filter: 'APPROVED' as StatusFilter },
          { label: 'Rejected', value: requests.filter((r) => r.status === 'REJECTED').length, color: '#EF4444', icon: XCircle, filter: 'REJECTED' as StatusFilter },
        ]).map((kpi, i) => {
          const isActive = statusFilter === kpi.filter;
          const Icon = kpi.icon;
          return (
            <AnimatedCard key={kpi.label} delay={60 * (i + 1)}>
              <button
                onClick={() => setStatusFilter(kpi.filter)}
                className="group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg h-full text-left w-full"
                style={{
                  background: isActive ? `${kpi.color}08` : 'var(--color-surface-card)',
                  borderColor: isActive ? kpi.color : 'var(--color-border)',
                  boxShadow: isActive ? `0 4px 20px ${kpi.color}18` : 'none',
                }}
              >
                {/* Top accent line — thicker when active */}
                <div
                  className="w-full transition-all duration-300"
                  style={{
                    height: isActive ? '3px' : '2px',
                    background: `linear-gradient(90deg, ${kpi.color}, transparent)`,
                  }}
                />
                <div className="p-5 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                      {kpi.label}
                    </p>
                    <p
                      className="text-2xl font-bold tracking-tight mt-1"
                      style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}
                    >
                      {kpi.value}
                    </p>
                  </div>
                  {/* Icon orb */}
                  <div
                    className="p-2.5 rounded-xl shrink-0 transition-all duration-300 group-hover:scale-110"
                    style={{ background: `${kpi.color}12`, color: kpi.color }}
                  >
                    <Icon size={20} strokeWidth={1.8} />
                  </div>
                </div>
              </button>
            </AnimatedCard>
          );
        })}
      </div>

      {/* ── Search + Status Tabs ──────────────────────────────── */}
      <AnimatedCard delay={160}>
        <div
          className="rounded-2xl border p-5"
          style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-card)' }}
        >
          {/* Search input */}
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--color-text-muted)' }}
            />
            <input
              type="text"
              placeholder="Search by client, company, GST, phone, email, goods..."
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none border transition-all duration-200 focus:ring-2 focus:ring-[var(--color-accent)] min-h-[44px]"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Status filter tabs */}
          <div className="flex flex-wrap gap-2 mt-4">
            {STATUS_TABS.map((tab) => {
              const isActive = statusFilter === tab;
              const count = statusCounts[tab] || 0;
              return (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 min-h-[44px]"
                  style={{
                    background: isActive ? 'var(--color-accent)' : 'var(--color-surface-hover)',
                    color: isActive ? '#fff' : 'var(--color-text-secondary)',
                    boxShadow: isActive ? '0 2px 8px rgba(255,107,44,0.2)' : 'none',
                  }}
                >
                  {tab}
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
        </div>
      </AnimatedCard>

      {/* ── Data Table ────────────────────────────────────────── */}
      <AnimatedCard delay={240}>
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-card)' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border-light)' }}>
                  <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider">Client</th>
                  <th className="hidden sm:table-cell px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider">Company</th>
                  <th className="hidden lg:table-cell px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider">GST Number</th>
                  <th className="hidden md:table-cell px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider">Phone</th>
                  <th className="hidden lg:table-cell px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider">Email</th>
                  <th className="hidden sm:table-cell px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider">Goods</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Loading skeletons */}
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-28" /></td>
                      <td className="hidden sm:table-cell px-5 py-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="hidden lg:table-cell px-5 py-4"><Skeleton className="h-4 w-36" /></td>
                      <td className="hidden md:table-cell px-5 py-4"><Skeleton className="h-4 w-28" /></td>
                      <td className="hidden lg:table-cell px-5 py-4"><Skeleton className="h-4 w-40" /></td>
                      <td className="hidden sm:table-cell px-5 py-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-5 py-4"><Skeleton className="h-5 w-20 rounded-full" /></td>
                      <td className="px-5 py-4"><Skeleton className="h-4 w-24" /></td>
                    </tr>
                  ))
                ) : pageItems.length > 0 ? (
                  pageItems.map((req, i) => {
                    const sc = (STATUS_STYLE[req.status as keyof typeof STATUS_STYLE] ?? STATUS_STYLE.PENDING) as { text: string; bg: string; dot: string };
                    return (
                      <tr
                        key={req._id}
                        className="row-glow transition-colors"
                        style={{ borderBottom: '1px solid var(--color-border-light)', animationDelay: `${i * 40}ms` }}
                      >
                        {/* Client name */}
                        <td
                          className="px-6 py-3.5 font-semibold whitespace-nowrap cursor-pointer"
                          style={{ color: 'var(--color-text-primary)' }}
                          onClick={() => setSelected(req)}
                        >
                          {req.clientName}
                        </td>
                        {/* Company */}
                        <td
                          className="hidden sm:table-cell px-5 py-3.5 whitespace-nowrap cursor-pointer"
                          style={{ color: 'var(--color-text-secondary)' }}
                          onClick={() => setSelected(req)}
                        >
                          {req.companyName}
                        </td>
                        {/* GST */}
                        <td
                          className="hidden lg:table-cell px-5 py-3.5 whitespace-nowrap cursor-pointer"
                          style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)', fontSize: '12px' }}
                          onClick={() => setSelected(req)}
                        >
                          {req.gstNumber}
                        </td>
                        {/* Phone */}
                        <td
                          className="hidden md:table-cell px-5 py-3.5 whitespace-nowrap cursor-pointer"
                          style={{ color: 'var(--color-text-secondary)' }}
                          onClick={() => setSelected(req)}
                        >
                          {req.phone}
                        </td>
                        {/* Email */}
                        <td
                          className="hidden lg:table-cell px-5 py-3.5 whitespace-nowrap cursor-pointer max-w-[180px] truncate"
                          style={{ color: 'var(--color-text-secondary)' }}
                          onClick={() => setSelected(req)}
                        >
                          {req.email}
                        </td>
                        {/* Goods description */}
                        <td
                          className="hidden sm:table-cell px-5 py-3.5 whitespace-nowrap cursor-pointer max-w-[160px] truncate"
                          style={{ color: 'var(--color-text-secondary)' }}
                          onClick={() => setSelected(req)}
                        >
                          {req.goodsDescription}
                        </td>
                        {/* Inline status pill */}
                        <td className="px-5 py-3.5">
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider whitespace-nowrap"
                            style={{ color: sc.text, background: sc.bg }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: sc.dot }} />
                            {req.status}
                          </span>
                        </td>
                        {/* Action buttons — inline, only for PENDING */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            {/* Contact — always shown */}
                            <button
                              onClick={(e) => { e.stopPropagation(); handleContact(req._id); }}
                              className="p-2 rounded-lg text-xs font-semibold transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
                              title="Contact Client"
                              style={{
                                background: 'rgba(255,107,44,0.08)',
                                color: 'var(--color-accent)',
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-accent)'; e.currentTarget.style.color = '#fff'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,107,44,0.08)'; e.currentTarget.style.color = 'var(--color-accent)'; }}
                            >
                              <MessageCircle size={14} />
                            </button>
                            {/* Approve — only for PENDING */}
                            {req.status === 'PENDING' && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleApprove(req._id); }}
                                className="p-2 rounded-lg text-xs font-semibold transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
                                title="Approve"
                                style={{ background: 'rgba(16,185,129,0.08)', color: '#10B981' }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = '#10B981'; e.currentTarget.style.color = '#fff'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(16,185,129,0.08)'; e.currentTarget.style.color = '#10B981'; }}
                              >
                                <CheckCircle size={14} />
                              </button>
                            )}
                            {/* Reject — only for PENDING */}
                            {req.status === 'PENDING' && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleReject(req._id); }}
                                className="p-2 rounded-lg text-xs font-semibold transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
                                title="Reject"
                                style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444' }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = '#EF4444'; e.currentTarget.style.color = '#fff'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#EF4444'; }}
                              >
                                <XCircle size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  /* Empty state */
                  <tr>
                    <td colSpan={8} className="px-6 py-20 text-center">
                      <ClipboardList size={36} className="mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
                      <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>No requests found</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Try adjusting your search or filter</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination footer ──────────────────────────────── */}
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
                className="px-3 py-2 rounded-xl text-xs outline-none border min-h-[44px]"
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
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 min-h-[44px] disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage(safePage + 1)}
                  disabled={safePage >= totalPages}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 min-h-[44px] disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </AnimatedCard>

      {/* ── Detail Modal ──────────────────────────────────────── */}
      <ClientRequestDetailModal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        request={selected}
        onApprove={handleApprove}
        onReject={handleReject}
        onContact={handleContact}
      />
    </div>
  );
};
