import { useState, useMemo, useCallback, useEffect } from 'react';
import { FileText, Search, RefreshCw, ChevronDown, Check, Download, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import ClientNavbar from '../../components/client/ClientNavbar';
import StatusBadge from '../../components/shared/StatusBadge';
import StatCard from '../../components/shared/StatCard';
import DataTable from '../../components/shared/DataTable';
import ConfirmModal from '../../components/shared/ConfirmModal';
import { getMyInvoices, getInvoiceStats, markInvoicePaid, Invoice as ApiInvoice, InvoiceStats } from '../../services/invoiceApi';
import { getErrorMessage } from '../../services/errorMessage';

/* ─────────────────────── Types ─────────────────────── */
interface InvoiceView {
  _id: string;
  id: string;
  amount: number;
  dueDate: string;
  status: string;
  clientName: string;
}

/* ─────────── Currency Helper ─────────── */
const formatINR = (amount: number) => '₹' + amount.toLocaleString('en-IN');

function formatDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function toInvoiceView(i: ApiInvoice): InvoiceView {
  return {
    _id: i._id,
    id: i.invoiceNumber,
    amount: i.amount,
    dueDate: formatDate(i.dueDate),
    status: i.status,
    clientName: i.manifest?.trackingId ? `Manifest ${i.manifest.trackingId}` : '—',
  };
}

const EMPTY_STATS: InvoiceStats = {
  totalAmount: 0,
  totalCount: 0,
  pending: { count: 0, amount: 0 },
  paid: { count: 0, amount: 0 },
  overdue: { count: 0, amount: 0 },
  cancelled: { count: 0, amount: 0 },
};

/* ─────────────────────── Responsive Styles ─────────────────────── */
const dashboardStyles = `
/* Filter Dropdown Animation */
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.animate-slideDown {
  animation: slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes dashFadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes dashPopIn { from { opacity: 0; transform: scale(0.9) translateY(16px); } to { opacity: 1; transform: scale(1) translateY(0); } }
`;

/* ─────────────────────── Subcomponents ─────────────────────── */
// StatusBadge is now imported from shared components.

function AnimatedDropdown({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const options = ['All', 'Pending', 'Paid', 'Overdue'];
  
  return (
    <div className="relative z-50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white border border-slate-200 rounded-full h-[46px] px-5 pr-10 text-sm text-slate-900 font-medium outline-none focus:border-orange-500 focus:shadow-md transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md relative flex items-center min-w-[140px] group"
      >
        <span>{value === 'All' ? 'All Invoices' : value}</span>
        <ChevronDown className={`absolute right-4 w-4 h-4 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-orange-500' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-full min-w-[160px] bg-white border border-slate-100 rounded-2xl shadow-xl p-2 animate-slideDown origin-top flex flex-col space-y-1">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-between group ${value === opt ? 'bg-orange-50 text-orange-600' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <span>{opt === 'All' ? 'All Invoices' : opt}</span>
              {value === opt && <Check className="w-4 h-4 text-orange-500 animate-in zoom-in" />}
            </button>
          ))}
        </div>
      )}
      
      {isOpen && (
        <div className="fixed inset-0 z-[-1]" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}

export default function ClientInvoices() {
  const [invoices, setInvoices] = useState<InvoiceView[]>([]);
  const [stats, setStats] = useState<InvoiceStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceView | null>(null);

  // ── Data Loading ──
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [invoicesRes, statsRes] = await Promise.all([
        getMyInvoices({ limit: 50 }),
        getInvoiceStats(),
      ]);
      setInvoices(invoicesRes.items.map(toInvoiceView));
      setStats(statsRes);
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to load invoices.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Computed Stats (fallback to server aggregate) ──
  const statsView = useMemo(() => ({
    totalBilled: stats.totalAmount,
    totalPaid: stats.paid.amount,
    totalPending: stats.pending.amount,
    totalOverdue: stats.overdue.amount,
  }), [stats]);

  // ── Filtered Invoices ──
  const filteredInvoices = useMemo(() => {
    return invoices.filter((i) => {
      const matchesSearch = searchQuery === '' ||
        i.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.clientName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || i.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchQuery, statusFilter]);

  // ── Actions ──
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setSearchQuery('');
    setStatusFilter('All');
    await loadData();
    setIsRefreshing(false);
  }, [loadData]);

  const markAsPaid = useCallback(async (id: string) => {
    try {
      await markInvoicePaid(id);
      setInvoices(prev => prev.map(inv => inv._id === id ? { ...inv, status: 'Paid' } : inv));
      setStats(prev => ({
        ...prev,
        paid: { count: prev.paid.count + 1, amount: prev.paid.amount + (invoices.find(i => i._id === id)?.amount || 0) },
        pending: { count: Math.max(prev.pending.count - 1, 0), amount: Math.max(prev.pending.amount - (invoices.find(i => i._id === id)?.amount || 0), 0) },
      }));
      toast.success('Invoice marked as paid.');
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to mark invoice as paid.'));
    }
  }, [invoices]);

  return (
    <div className="dash-container min-h-screen bg-[#f5f6f8] font-sans text-slate-900 flex flex-col">
      <style>{dashboardStyles}</style>
      
      {/* ── Global Navbar ── */}
      <ClientNavbar active="invoices" />

      <div className="max-w-7xl mx-auto w-full space-y-6 md:space-y-8 p-5 md:p-10 flex-1">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 animate-[dashPopIn_0.4s_ease-out]">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 text-slate-900">
              Billing & <span className="text-orange-500">Invoices</span>
            </h1>
            <p className="text-slate-600 font-medium text-base">{loading ? 'Loading your billing data…' : 'Manage your payments and billing history.'}</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleRefresh}
              className="bg-slate-100 border border-slate-300 hover:border-orange-500/40 text-slate-900 w-11 h-11 flex items-center justify-center rounded-xl transition-all"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 animate-[dashPopIn_0.5s_ease-out_both]">
          <StatCard title="Total Billed" value={formatINR(statsView.totalBilled)} icon={FileText} colorTheme="default" />
          <StatCard title="Total Paid" value={formatINR(statsView.totalPaid)} icon={ArrowUpRight} colorTheme="emerald" />
          <StatCard title="Pending" value={formatINR(statsView.totalPending)} icon={Clock} colorTheme="orange" />
          <StatCard title="Overdue" value={formatINR(statsView.totalOverdue)} icon={ArrowDownRight} colorTheme="red" />
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between animate-[dashPopIn_0.6s_ease-out_both] relative z-20">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by invoice ID or client..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-full h-[46px] pl-11 pr-4 text-sm font-medium focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all shadow-sm"
            />
          </div>
          <AnimatedDropdown value={statusFilter} onChange={setStatusFilter} />
        </div>

        {/* Invoice List */}
        <DataTable 
          columns={[
            {
              header: 'Invoice ID',
              render: (invoice: InvoiceView) => (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{invoice.id}</span>
                </div>
              )
            },
            {
              header: 'Manifest',
              hiddenOnMobile: true,
              render: (invoice: InvoiceView) => <span className="font-semibold text-slate-700">{invoice.clientName}</span>
            },
            {
              header: 'Amount',
              render: (invoice: InvoiceView) => <span className="font-extrabold text-slate-900">{formatINR(invoice.amount)}</span>
            },
            {
              header: 'Due Date',
              hiddenOnMobile: true,
              render: (invoice: InvoiceView) => <span className="font-medium text-slate-600">{invoice.dueDate}</span>
            },
            {
              header: 'Status',
              render: (invoice: InvoiceView) => <StatusBadge status={invoice.status} />
            },
            {
              header: 'Download',
              align: 'center',
              render: (invoice: InvoiceView) => (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const content = `INVOICE RECEIPT\n------------------\nInvoice ID: ${invoice.id}\nManifest: ${invoice.clientName}\nDue Date: ${invoice.dueDate}\nStatus: ${invoice.status}\n\nTOTAL AMOUNT: ${formatINR(invoice.amount)}\n`;
                    const blob = new Blob([content], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${invoice.id}.txt`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    URL.revokeObjectURL(url);
                    toast.success(`Downloaded ${invoice.id}`);
                  }}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 mx-auto"
                  title="Download Invoice"
                >
                  <Download className="w-4 h-4" />
                </button>
              )
            },
            {
              header: 'Action',
              align: 'right',
              hiddenOnMobile: true,
              render: (invoice: InvoiceView) => (
                invoice.status !== 'Paid' ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsPaid(invoice._id);
                    }}
                    className="bg-white border border-slate-200 hover:border-orange-500 hover:text-orange-600 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm hover:shadow-md inline-flex items-center space-x-1"
                  >
                    <Check className="w-3 h-3" />
                    <span>Mark Paid</span>
                  </button>
                ) : (
                  <span className="text-slate-400 text-xs font-bold inline-flex items-center space-x-1 px-3 py-1.5">
                    <Check className="w-3 h-3" />
                    <span>Paid</span>
                  </span>
                )
              )
            }
          ]}
          data={filteredInvoices}
          onRowClick={(invoice: InvoiceView) => setSelectedInvoice(invoice)}
          emptyMessage="No invoices found. Try adjusting your search or filters."
          emptyIcon={<FileText className="w-12 h-12 text-slate-300 mb-4" />}
        />

      </div>

      {/* Invoice Details Modal */}
      <ConfirmModal isOpen={!!selectedInvoice} onClose={() => setSelectedInvoice(null)}>
        {selectedInvoice && (
          <>
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold mr-4">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">{selectedInvoice.id}</h3>
                <p className="text-sm font-medium text-slate-500">Invoice Details</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Client</span>
                  <span className="text-sm font-bold text-slate-900">{selectedInvoice.clientName}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Due Date</span>
                  <span className="text-sm font-bold text-slate-900">{selectedInvoice.dueDate}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Status</span>
                  <StatusBadge status={selectedInvoice.status} />
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-200">
                  <span className="text-sm font-bold text-slate-500 uppercase">Total Amount</span>
                  <span className="text-2xl font-black text-slate-900">{formatINR(selectedInvoice.amount)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="flex-1 bg-white border border-slate-200 text-slate-700 px-4 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors hover:scale-105 active:scale-95"
              >
                Close
              </button>
              {selectedInvoice.status !== 'Paid' && (
                <button
                  onClick={() => {
                    markAsPaid(selectedInvoice._id);
                    setSelectedInvoice(null);
                  }}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-xl font-bold transition-all shadow-lg shadow-orange-500/30"
                >
                  Mark as Paid
                </button>
              )}
            </div>
          </>
        )}
      </ConfirmModal>

    </div>
  );
}
