import { useState, useEffect, useCallback } from 'react';
import { FileText, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import ClientNavbar from '../../components/client/ClientNavbar';
import { getMyInvoices, markPaid } from '../../services/invoiceApi';
import { getErrorMessage } from '../../services/errorMessage';

interface Invoice {
  _id: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  status: string;
  manifestId?: { trackingId?: string };
  issuedDate?: string;
}

const formatINR = (amount: number) => '₹' + amount.toLocaleString('en-IN');

function formatDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PAID: 'bg-green-500/15 text-green-600 border-green-500/30',
    PENDING: 'bg-orange-500/15 text-orange-600 border-orange-500/30',
    OVERDUE: 'bg-red-500/15 text-red-600 border-red-500/30',
    CANCELLED: 'bg-slate-500/15 text-slate-500 border-slate-500/30',
  };
  const labels: Record<string, string> = {
    PAID: 'Paid',
    PENDING: 'Pending',
    OVERDUE: 'Overdue',
    CANCELLED: 'Cancelled',
  };
  return (
    <span className={`px-3 py-1 text-xs font-bold rounded-full border whitespace-nowrap ${styles[status] || 'bg-slate-500/15 text-slate-500 border-slate-500/30'}`}>
      {labels[status] || status}
    </span>
  );
}

export default function ClientInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyInvoices();
      setInvoices(res.invoices || res.data?.invoices || []);
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to load invoices.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch = searchQuery === '' ||
      inv.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.manifestId?.trackingId?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: invoices.length,
    pending: invoices.filter(i => i.status === 'PENDING').length,
    paid: invoices.filter(i => i.status === 'PAID').length,
    totalPending: invoices.filter(i => i.status === 'PENDING').reduce((sum, i) => sum + i.amount, 0),
    totalPaid: invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.amount, 0),
  };

  const handleMarkPaid = async (invoice: Invoice) => {
    try {
      await markPaid(invoice._id);
      setInvoices(prev => prev.map(inv => inv._id === invoice._id ? { ...inv, status: 'PAID' } : inv));
      toast.success('Invoice marked as paid.');
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to mark invoice as paid.'));
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] font-sans text-slate-900 flex flex-col">
      <ClientNavbar active="invoices" />

      <div className="flex-1 max-w-7xl mx-auto w-full space-y-6 p-5 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 text-slate-900">
            Invoices
          </h1>
          <p className="text-slate-600 font-medium text-base">
            {loading ? 'Loading invoices...' : 'Manage and track your freight invoices.'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Total Invoices</p>
            <p className="text-2xl font-extrabold text-slate-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Pending</p>
            <p className="text-2xl font-extrabold text-orange-500">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Paid</p>
            <p className="text-2xl font-extrabold text-green-500">{stats.paid}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Total Pending</p>
            <p className="text-2xl font-extrabold text-red-500">{formatINR(stats.totalPending)}</p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by invoice or tracking ID..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-orange-500 cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="OVERDUE">Overdue</option>
          </select>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-500 font-medium">Loading invoices...</p>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No invoices found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider">
                    <th className="px-6 py-4 font-bold">Invoice</th>
                    <th className="px-6 py-4 font-bold">Tracking ID</th>
                    <th className="px-6 py-4 font-bold">Amount</th>
                    <th className="px-6 py-4 font-bold">Issued</th>
                    <th className="px-6 py-4 font-bold">Due Date</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInvoices.map((inv) => (
                    <tr key={inv._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-sm text-slate-900">{inv.invoiceNumber}</td>
                      <td className="px-6 py-4 font-mono text-sm text-orange-500">{inv.manifestId?.trackingId || '—'}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">{formatINR(inv.amount)}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{formatDate(inv.issuedDate)}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{formatDate(inv.dueDate)}</td>
                      <td className="px-6 py-4"><StatusBadge status={inv.status} /></td>
                      <td className="px-6 py-4 text-right">
                        {inv.status === 'PENDING' && (
                          <button
                            onClick={() => handleMarkPaid(inv)}
                            className="text-xs font-bold text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-all"
                          >
                            Mark Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
