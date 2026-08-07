import React, { useEffect, useState } from 'react';
import { Receipt, Download } from 'lucide-react';
import { AnimatedCard } from '../../components/admin/shared/AnimatedCard';
import { StatusBadge } from '../../components/admin/shared/StatusBadge';
import { getMyInvoices } from '../../services/invoiceApi';

const DEMO_INVOICES = [
  {
    _id: 'inv1',
    invoiceNumber: 'INV-2026-0001',
    amount: 15480,
    currency: 'INR',
    status: 'PENDING',
    issuedDate: new Date(Date.now() - 86400000 * 10).toISOString(),
    dueDate: new Date(Date.now() + 86400000 * 20).toISOString(),
    manifest: { trackingId: 'TRK-8841' },
  },
  {
    _id: 'inv2',
    invoiceNumber: 'INV-2026-0002',
    amount: 32250,
    currency: 'INR',
    status: 'PAID',
    issuedDate: new Date(Date.now() - 86400000 * 40).toISOString(),
    dueDate: new Date(Date.now() - 86400000 * 10).toISOString(),
    manifest: { trackingId: 'TRK-8800' },
  },
];

const fmtMoney = (amt: number, cur = 'INR') =>
  `${cur === 'INR' ? '₹' : cur + ' '}${Number(amt || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export const ClientInvoices: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getMyInvoices()
      .then((res) => {
        if (!mounted) return;
        const data = res.invoices || res.data?.invoices || [];
        setInvoices(data.length > 0 ? data : DEMO_INVOICES);
      })
      .catch(() => { if (mounted) setInvoices(DEMO_INVOICES); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const total = invoices.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const paid = invoices.filter((i) => i.status === 'PAID').reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const pending = total - paid;

  return (
    <div className="p-5 sm:p-7 lg:p-8 max-w-[1200px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
          Invoices
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Billing statements for your shipments
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {([
          { label: 'Total billed', value: fmtMoney(total), color: '#FF6B2C' },
          { label: 'Paid', value: fmtMoney(paid), color: '#10B981' },
          { label: 'Outstanding', value: fmtMoney(pending), color: '#F59E0B' },
          { label: 'Invoices', value: String(invoices.length), color: '#3B82F6' },
        ]).map((kpi, i) => (
          <AnimatedCard key={kpi.label} delay={60 * (i + 1)}>
            <div
              className="rounded-2xl border p-5 h-full"
              style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-card)' }}
            >
              <div className="h-1 w-full rounded-full mb-3" style={{ background: `linear-gradient(90deg, ${kpi.color}, transparent)` }} />
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                {kpi.label}
              </p>
              <p className="text-2xl font-bold tracking-tight mt-1 truncate" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
                {kpi.value}
              </p>
            </div>
          </AnimatedCard>
        ))}
      </div>

      {/* Table */}
      <AnimatedCard delay={160}>
        <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-card)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border-light)' }}>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider">Invoice</th>
                  <th className="hidden md:table-cell px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider">Shipment</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider">Issued</th>
                  <th className="hidden sm:table-cell px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider">Due</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                      <td className="px-5 py-4"><div className="skeleton h-4 w-28" /></td>
                      <td className="hidden md:table-cell px-5 py-4"><div className="skeleton h-4 w-24" /></td>
                      <td className="px-5 py-4"><div className="skeleton h-4 w-24" /></td>
                      <td className="hidden sm:table-cell px-5 py-4"><div className="skeleton h-4 w-24" /></td>
                      <td className="px-5 py-4"><div className="skeleton h-5 w-20 rounded-full" /></td>
                      <td className="px-5 py-4"><div className="skeleton h-4 w-20 ml-auto" /></td>
                    </tr>
                  ))
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <Receipt size={32} className="mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
                      <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>No invoices yet</p>
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv._id} className="row-glow transition-colors" style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold whitespace-nowrap" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
                          {inv.invoiceNumber}
                        </p>
                      </td>
                      <td className="hidden md:table-cell px-5 py-3.5 whitespace-nowrap" style={{ color: 'var(--color-text-secondary)' }}>
                        {inv.manifest?.trackingId || '—'}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        {fmtDate(inv.issuedDate)}
                      </td>
                      <td className="hidden sm:table-cell px-5 py-3.5 whitespace-nowrap text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {fmtDate(inv.dueDate)}
                      </td>
                      <td className="px-5 py-3.5"><StatusBadge status={inv.status} /></td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
                        {fmtMoney(inv.amount, inv.currency)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-4 border-t flex items-center justify-end gap-2" style={{ borderColor: 'var(--color-border-light)' }}>
            <button
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-200"
              style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
            >
              <Download size={13} /> Export
            </button>
          </div>
        </div>
      </AnimatedCard>
    </div>
  );
};
