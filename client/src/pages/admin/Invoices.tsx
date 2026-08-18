import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Receipt,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FilePlus,
  X,
  Wallet,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { StatusBadge } from '../../components/admin/shared/StatusBadge';
import { AnimatedCard } from '../../components/admin/shared/AnimatedCard';
import { Skeleton } from '../../components/admin/shared/Skeleton';
import { StatCard } from '../../components/admin/shared/StatCard';
import { ConfirmModal } from '../../components/shared/ConfirmModal';
import * as invoiceApi from '../../services/invoiceApi';
import * as manifestApi from '../../services/manifestApi';
import { formatDateTime, formatCurrency } from '../../utils/formatters';

type StatusFilter = 'ALL' | 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
const STATUS_TABS: StatusFilter[] = ['ALL', 'PENDING', 'PAID', 'OVERDUE', 'CANCELLED'];

export const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [stats, setStats] = useState<any>(null);
  const [payTarget, setPayTarget] = useState<any | null>(null);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [deliveredManifests, setDeliveredManifests] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await invoiceApi.getInvoices();
      const list = res?.invoices || res || [];
      setInvoices(list);
      const s = await invoiceApi.getInvoiceStats();
      setStats(s?.data || s);
    } catch {
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [pageSize]);

  const filtered = useMemo(() => {
    let result = invoices;
    if (statusFilter !== 'ALL') {
      result = result.filter((i) => i.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.invoiceNumber?.toLowerCase().includes(q) ||
          i.client?.name?.toLowerCase().includes(q) ||
          i.manifest?.trackingId?.toLowerCase().includes(q),
      );
    }
    return result;
  }, [invoices, search, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: invoices.length };
    invoices.forEach((i) => {
      counts[i.status] = (counts[i.status] || 0) + 1;
    });
    return counts;
  }, [invoices]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  const handleMarkPaid = async () => {
    if (!payTarget) return;
    try {
      await invoiceApi.markPaid(payTarget._id);
      toast.success(`Invoice ${payTarget.invoiceNumber} marked as paid`);
      setPayTarget(null);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to mark invoice as paid');
    }
  };

  const openGenerate = async () => {
    setGenerateOpen(true);
    try {
      const res = await manifestApi.getManifests({ status: 'DELIVERED', limit: 100 });
      const list = res?.manifests || res || [];
      const existing = new Set(invoices.map((i) => i.manifest?._id));
      setDeliveredManifests(list.filter((m: any) => !existing.has(m._id)));
    } catch {
      setDeliveredManifests([]);
    }
  };

  const handleGenerate = async (manifestId: string) => {
    try {
      setGenerating(true);
      await invoiceApi.generateInvoice(manifestId);
      toast.success('Invoice generated');
      setGenerateOpen(false);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to generate invoice');
    } finally {
      setGenerating(false);
    }
  };

  const currency = stats?.currency || 'INR';

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
                Invoices
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                {filtered.length} invoice{filtered.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>
          <button
            onClick={openGenerate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 min-h-[44px]"
            style={{ background: 'var(--color-accent)', boxShadow: '0 2px 8px rgba(255,107,44,0.3)' }}
          >
            <FilePlus size={16} /> Generate Invoice
          </button>
        </div>
      </AnimatedCard>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Billed" value={stats?.billed ?? 0} icon={Wallet} color="#8B5CF6" />
        <StatCard title="Paid" value={stats?.paid ?? 0} icon={CheckCircle2} color="#10B981" />
        <StatCard title="Pending" value={stats?.pending ?? 0} icon={Clock} color="#F59E0B" />
        <StatCard title="Overdue" value={stats?.overdue ?? 0} icon={AlertTriangle} color="#EF4444" />
      </div>

      {/* Search + Filters */}
      <AnimatedCard delay={80}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Search by invoice #, client, tracking ID..."
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none border transition-all duration-200 focus:ring-2 focus:ring-[var(--color-accent)] min-h-[44px]"
              style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

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
                  <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider">Invoice #</th>
                  <th className="hidden sm:table-cell px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider">Client</th>
                  <th className="hidden md:table-cell px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider">Manifest</th>
                  <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider">Amount</th>
                  <th className="hidden lg:table-cell px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider">Issued</th>
                  <th className="hidden lg:table-cell px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider">Due</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="hidden sm:table-cell px-5 py-4"><Skeleton className="h-4 w-28" /></td>
                      <td className="hidden md:table-cell px-5 py-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-5 py-4"><Skeleton className="h-4 w-16 ml-auto" /></td>
                      <td className="hidden lg:table-cell px-5 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="hidden lg:table-cell px-5 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-5 py-4"><Skeleton className="h-5 w-20 rounded-full" /></td>
                      <td className="px-5 py-4"><Skeleton className="h-5 w-20" /></td>
                    </tr>
                  ))
                ) : pageItems.length > 0 ? (
                  pageItems.map((inv, i) => (
                    <tr
                      key={inv._id || inv.invoiceNumber}
                      className="row-glow transition-colors"
                      style={{ borderBottom: '1px solid var(--color-border-light)', animationDelay: `${i * 40}ms` }}
                    >
                      <td
                        className="px-6 py-3.5 font-bold whitespace-nowrap"
                        style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}
                      >
                        {inv.invoiceNumber}
                      </td>
                      <td className="hidden sm:table-cell px-5 py-3.5 whitespace-nowrap" style={{ color: 'var(--color-text-primary)' }}>
                        {inv.client?.name || '—'}
                      </td>
                      <td className="hidden md:table-cell px-5 py-3.5 whitespace-nowrap text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
                        {inv.manifest?.trackingId || '—'}
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
                        {formatCurrency(inv.amount, inv.currency || currency)}
                      </td>
                      <td className="hidden lg:table-cell px-5 py-3.5 whitespace-nowrap text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {formatDateTime(inv.issuedDate)}
                      </td>
                      <td className="hidden lg:table-cell px-5 py-3.5 whitespace-nowrap text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {formatDateTime(inv.dueDate)}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={inv.status} />
                      </td>
                      <td className="px-5 py-3.5">
                        {(inv.status === 'PENDING' || inv.status === 'OVERDUE') && (
                          <button
                            onClick={() => setPayTarget(inv)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all duration-200 min-h-[44px]"
                            style={{ background: '#10B981', boxShadow: '0 2px 6px rgba(16,185,129,0.3)' }}
                          >
                            <CheckCircle2 size={13} /> Mark Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-20 text-center">
                      <Receipt size={36} className="mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
                      <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>No invoices found</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                        Invoices are auto-generated when a delivery is completed
                      </p>
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
              Showing {filtered.length === 0 ? 0 : start + 1}–{Math.min(start + pageSize, filtered.length)} of {filtered.length}
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

      {/* Mark Paid confirm modal */}
      <ConfirmModal
        isOpen={!!payTarget}
        onConfirm={handleMarkPaid}
        onCancel={() => setPayTarget(null)}
        title="Mark invoice as paid?"
        message={`Confirm payment for invoice ${payTarget?.invoiceNumber} (${payTarget ? formatCurrency(payTarget.amount, payTarget.currency || currency) : ''})?`}
        confirmText="Mark Paid"
        variant="default"
      />

      {/* Generate Invoice modal */}
      {generateOpen && (
        <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setGenerateOpen(false)} />
          <div
            className="relative w-full max-w-xl rounded-2xl border p-5 sm:p-6 max-h-[80vh] overflow-y-auto"
            style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-modal)' }}
          >
            <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--color-border-light)' }}>
              <div>
                <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>Generate Invoice</h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  Pick a delivered manifest that has no invoice yet
                </p>
              </div>
              <button
                onClick={() => setGenerateOpen(false)}
                className="p-2 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                style={{ color: 'var(--color-text-muted)' }}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2 mt-4">
              {deliveredManifests.length === 0 ? (
                <p className="text-sm py-10 text-center" style={{ color: 'var(--color-text-muted)' }}>
                  No delivered manifests awaiting invoices.
                </p>
              ) : (
                deliveredManifests.map((m) => (
                  <button
                    key={m._id}
                    onClick={() => handleGenerate(m._id)}
                    disabled={generating}
                    className="w-full flex items-center justify-between gap-4 px-4 py-3 rounded-xl border text-left transition-all duration-200 min-h-[44px] hover:border-[var(--color-accent)] disabled:opacity-50"
                    style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
                  >
                    <div>
                      <p className="text-sm font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
                        {m.trackingId}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                        {m.client?.name || '—'} · {m.routing?.origin?.city || 'Origin'} → {m.routing?.destination?.city || 'Destination'}
                      </p>
                    </div>
                    <span
                      className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                      style={{ background: 'var(--color-accent)' }}
                    >
                      Generate
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};