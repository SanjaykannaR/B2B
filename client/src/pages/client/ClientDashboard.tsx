import { useState, useMemo, useCallback, useEffect } from 'react';
import { Package, Activity, Truck, Clock, FileText, ArrowRight, MapPin, Search, ChevronDown, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import type { RootState } from '../../store/store';
import ClientNavbar from '../../components/client/ClientNavbar';
import { getMyManifests, Manifest } from '../../services/manifestApi';
import { getMyInvoices, markInvoicePaid, Invoice } from '../../services/invoiceApi';
import { getErrorMessage } from '../../services/errorMessage';

/* ─────────────────────── Types ─────────────────────── */
interface Shipment {
  id: string;
  origin: string;
  destination: string;
  status: string;
  date: string;
  eta: string;
  weight: string;
}

interface InvoiceView {
  _id: string;
  id: string;
  amount: number;
  dueDate: string;
  status: string;
}

/* ─────────── Helpers ─────────── */
const formatINR = (amount: number) => '₹' + amount.toLocaleString('en-IN');

function formatDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function toShipment(m: Manifest): Shipment {
  return {
    id: m.trackingId,
    origin: m.routing.origin.name,
    destination: m.routing.destination.name,
    status: m.currentStatus,
    date: formatDate(m.scheduledPickup),
    eta: m.currentStatus === 'Delivered' || m.currentStatus === 'Cancelled'
      ? '—'
      : `${m.routing.distanceKm.toFixed(0)} km · ${formatDuration(m.routing.estimatedDurationMinutes)}`,
    weight: `${m.cargoDetails.weight.toLocaleString()} kg`,
  };
}

function toInvoiceView(i: Invoice): InvoiceView {
  return { _id: i._id, id: i.invoiceNumber, amount: i.amount, dueDate: formatDate(i.dueDate), status: i.status };
}

/* ─────────────────────── Responsive Styles ─────────────────────── */
const dashboardStyles = `
/* ── Modal ── */
.dash-modal-overlay {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(0,0,0,0.6); backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  padding: 20px; animation: dashFadeIn 0.25s ease;
}
.dash-modal {
  background: #ffffff; border: 1px solid #e2e8f0;
  border-radius: 20px; max-width: 500px; width: 100%;
  padding: 32px; box-shadow: 0 32px 80px rgba(0,0,0,0.4);
  animation: dashPopIn 0.3s cubic-bezier(0.34,1.56,0.64,1);
  max-height: 90vh; overflow-y: auto;
}
@keyframes dashFadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes dashPopIn { from { opacity: 0; transform: scale(0.9) translateY(16px); } to { opacity: 1; transform: scale(1) translateY(0); } }

/* Filter Dropdown Animation */
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.animate-slideDown {
  animation: slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* ── Mobile (≤640px) ── */
@media (max-width: 640px) {
  .dash-container { padding: 16px; }
  .dash-header-actions { width: 100%; }
  .dash-header-actions button { flex: 1; justify-content: center; }
  .dash-header-actions button span { display: inline; }
  .dash-search-bar { gap: 12px; }
  .dash-main-grid { gap: 16px; }
  .dash-section-header { padding: 16px; }
  .dash-invoice-item { padding: 16px; }
  .dash-modal { padding: 24px; }
}
`;

/* ─────────────────────── Subcomponents ─────────────────────── */
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'Delivered': 'bg-green-500/15 text-green-600 border-green-500/30',
    'Paid': 'bg-green-500/15 text-green-600 border-green-500/30',
    'In-Transit': 'bg-blue-500/15 text-blue-600 border-blue-500/30',
    'Assigned': 'bg-purple-500/15 text-purple-600 border-purple-500/30',
    'Pending': 'bg-orange-500/15 text-orange-600 border-orange-500/30',
    'Overdue': 'bg-red-500/15 text-red-600 border-red-500/30',
  };
  return (
    <span className={`px-3 py-1 text-xs font-bold rounded-full border whitespace-nowrap ${styles[status] || 'bg-slate-500/15 text-slate-500 border-slate-500/30'}`}>
      {status}
    </span>
  );
}

function ProgressStepper({ status }: { status: string }) {
  const steps = ['Pending', 'Assigned', 'In-Transit', 'Delivered'];
  const colorMap: Record<string, { bg: string; border: string }> = {
    Pending: { bg: 'bg-orange-500', border: 'border-orange-500' },
    Assigned: { bg: 'bg-purple-500', border: 'border-purple-500' },
    'In-Transit': { bg: 'bg-blue-500', border: 'border-blue-500' },
    Delivered: { bg: 'bg-emerald-500', border: 'border-emerald-500' },
  };

  const currentIndex = Math.max(steps.indexOf(status), 0);

  return (
    <div className="flex items-center space-x-2">
      {steps.map((step, idx) => {
        const isCompleted = idx <= currentIndex;
        const isActive = idx === currentIndex;
        const { bg, border } = colorMap[step] || { bg: 'bg-slate-500', border: 'border-slate-500' };
        
        return (
          <div
            key={step}
            className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
              isActive
                ? `${bg} ${border} shadow-[0_0_8px_rgba(255,255,255,0.8)] scale-110`
                : isCompleted
                ? `${bg} ${border}`
                : 'bg-transparent border-slate-300'
            }`}
            title={step}
          />
        );
      })}
    </div>
  );
}


/* ─────────────────────── Custom Animated Dropdown ─────────────────────── */
function AnimatedDropdown({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const options = ['All', 'Pending', 'Assigned', 'In-Transit', 'Delivered'];
  
  const displayMap: Record<string, string> = {
    'All': 'All Status',
    'Pending': 'Pending',
    'Assigned': 'Assigned',
    'In-Transit': 'In-Transit',
    'Delivered': 'Delivered'
  };

  return (
    <div className="relative z-50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white border border-slate-200 rounded-full h-[46px] px-5 pr-10 text-sm text-slate-900 font-medium outline-none focus:border-orange-500 focus:shadow-md transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md relative flex items-center min-w-[140px] group"
      >
        <span>{displayMap[value]}</span>
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
              <span>{displayMap[opt]}</span>
              {value === opt && <Check className="w-4 h-4 text-orange-500 animate-in zoom-in" />}
            </button>
          ))}
        </div>
      )}
      
      {/* Invisible backdrop to close dropdown when clicking outside */}
      {isOpen && (
        <div className="fixed inset-0 z-[-1]" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}

/* ─────────────────────── Main Dashboard ─────────────────────── */
export default function ClientDashboard() {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  // ── State ──
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [invoices, setInvoices] = useState<InvoiceView[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [, setSelectedShipment] = useState<Shipment | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceView | null>(null);

  // ── Data Loading ──
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [manifestsRes, invoicesRes] = await Promise.all([
        getMyManifests({ limit: 5 }),
        getMyInvoices({ limit: 5 }),
      ]);
      setShipments(manifestsRes.items.map(toShipment));
      setInvoices(invoicesRes.items.map(toInvoiceView));
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to load dashboard data.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);
  
  // ── Filtered Shipments ──
  const filteredShipments = useMemo(() => {
    return shipments.filter((s) => {
      const matchesSearch = searchQuery === '' ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.origin.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [shipments, searchQuery, statusFilter]);

  // ── Computed Stats ──
  const stats = useMemo(() => {
    const outstanding = shipments.filter(s => s.status !== 'Delivered').length;
    const totalSpent = invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.amount, 0);
    const delivered = shipments.filter(s => s.status === 'Delivered').length;
    const fulfillment = shipments.length > 0 ? Math.round((delivered / shipments.length) * 100) : 0;
    const pending = shipments.filter(s => s.status === 'Pending').length;
    
    const totalShipments = shipments.length;
    const pendingInvoices = invoices.filter(i => i.status === 'Pending').length;
    
    return { outstanding, totalSpent, fulfillment, pending, totalShipments, delivered, pendingInvoices };
  }, [shipments, invoices]);

  const totalPending = useMemo(() => {
    return invoices.filter(i => i.status === 'Pending').reduce((sum, i) => sum + i.amount, 0);
  }, [invoices]);

  // ── Actions ──
  const markAsPaid = useCallback(async (invoice: InvoiceView) => {
    try {
      await markInvoicePaid(invoice._id);
      setInvoices(prev => prev.map(inv => inv._id === invoice._id ? { ...inv, status: 'Paid' } : inv));
      toast.success('Invoice marked as paid.');
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to mark invoice as paid.'));
    }
  }, []);

  return (
    <div className="dash-container min-h-screen bg-[#f5f6f8] font-sans text-slate-900 flex flex-col">
      <style>{dashboardStyles}</style>

      {/* ── Global Navbar ── */}
      <ClientNavbar active="dashboard" />

      <div className="flex-1 max-w-7xl mx-auto w-full space-y-6 md:space-y-8 p-5 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both">

        {/* ═══ Header ═══ */}
        <div className="dash-header flex flex-col md:flex-row md:items-end md:justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-700 ease-out">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 text-slate-900">
              Welcome back, <span className="text-orange-500">{user?.name?.split(' ')[0] || 'B2B Client'}</span>
            </h1>
            <p className="text-slate-600 font-medium text-base">{loading ? 'Loading your freight data…' : "Here's what's happening with your freight today."}</p>
          </div>
        </div>

        {/* ═══ Overview Stats ═══ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Total Shipments */}
          <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-500/10 hover:border-slate-300 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group cursor-default">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-300">
              <Package className="w-10 h-10 text-slate-600 group-hover:-rotate-12 transition-transform duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-slate-500 font-semibold mb-1">Total Shipments</span>
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{stats.totalShipments}</span>
            </div>
          </div>

          {/* Active Shipments */}
          <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-orange-500/10 hover:border-orange-300 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group cursor-default">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-300">
              <Activity className="w-10 h-10 text-orange-600 group-hover:-rotate-12 transition-transform duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-slate-500 font-semibold mb-1">Active Shipments</span>
              <span className="text-3xl font-extrabold text-orange-500 tracking-tight">{stats.outstanding}</span>
            </div>
          </div>

          {/* Delivered Shipments */}
          <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-green-500/10 hover:border-green-300 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group cursor-default">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-300">
              <Check className="w-10 h-10 text-green-600 group-hover:rotate-12 transition-transform duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-slate-500 font-semibold mb-1">Delivered</span>
              <span className="text-3xl font-extrabold text-green-500 tracking-tight">{stats.delivered}</span>
            </div>
          </div>

          {/* Pending Invoices */}
          <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-red-500/10 hover:border-red-300 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group cursor-default">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-300">
              <FileText className="w-10 h-10 text-red-600 group-hover:-rotate-12 transition-transform duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-slate-500 font-semibold mb-1">Pending Invoices</span>
              <div className="flex items-end space-x-2">
                <span className="text-3xl font-extrabold text-red-500 tracking-tight">{stats.pendingInvoices}</span>
                <span className="text-sm text-slate-400 font-medium pb-1">({formatINR(totalPending)})</span>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ Search & Filter Bar ═══ */}
        <div className="dash-search-bar flex flex-wrap items-center gap-3 md:gap-6">
          <div className="relative group w-[46px] focus-within:w-[280px] md:focus-within:w-[350px] h-[46px] transition-all duration-300 ease-in-out">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shipments by ID..."
              className="absolute left-0 w-full h-full bg-white border border-slate-200 rounded-full pl-11 pr-4 text-sm text-slate-900 placeholder-transparent focus:placeholder-slate-400 font-medium outline-none focus:border-orange-500 focus:shadow-md transition-all duration-300 ease-in-out cursor-pointer focus:cursor-text shadow-sm hover:shadow-md"
            />
            <div className="absolute left-0 top-0 w-[46px] h-[46px] flex items-center justify-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-500 group-focus-within:text-orange-500 transition-colors" />
            </div>
          </div>

          <AnimatedDropdown value={statusFilter} onChange={setStatusFilter} />

          <div className="flex-1 h-px bg-gradient-to-r from-red-800 via-slate-400 to-transparent"></div>
        </div>

        {/* ═══ Main Content Grid ═══ */}
        <div className="dash-main-grid grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

          {/* ── Recent Shipments Table ── */}
          <div className="lg:col-span-2 h-full">
            <div className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-slate-300 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
              <div className="dash-section-header flex justify-between items-center p-6 border-b border-slate-200">
                <h2 className="dash-section-title text-lg font-bold flex items-center text-slate-900">
                  <Truck className="w-5 h-5 mr-2.5 text-orange-500" /> Recent Shipments
                  <span className="ml-2 text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{filteredShipments.length}</span>
                </h2>
                <button
                  onClick={() => navigate('/client/track')}
                  className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center transition-all hover:scale-105 active:scale-95"
                >
                  View all <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </button>
              </div>

              <div className="overflow-x-auto flex-1">
                {filteredShipments.length === 0 ? (
                  <div className="p-8 md:p-12 text-center">
                    <Search className="w-10 h-10 text-slate-500 mx-auto mb-4 opacity-40" />
                    <p className="text-slate-500 font-medium text-sm">No shipments match your search.</p>
                    <button onClick={() => { setSearchQuery(''); setStatusFilter('All'); }} className="text-orange-500 text-sm font-bold mt-2 hover:underline">Clear filters</button>
                  </div>
                ) : (
                  <table className="dash-shipment-table w-full text-left">
                    <thead>
                      <tr className="bg-slate-100 text-slate-500 text-[11px] uppercase tracking-wider">
                        <th className="px-6 py-3.5 font-bold">Tracking ID</th>
                        <th className="px-6 py-3.5 font-bold">Route</th>
                        <th className="px-6 py-3.5 font-bold">Status</th>
                        <th className="px-6 py-3.5 font-bold">Progress</th>
                        <th className="px-6 py-3.5 font-bold text-right">ETA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredShipments.map((shipment) => (
                        <tr
                          key={shipment.id}
                          onClick={() => setSelectedShipment(shipment)}
                          className="hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <td className="px-6 py-4 font-mono font-bold text-sm text-orange-500/90">{shipment.id}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-start space-x-2">
                              <MapPin className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <div className="text-sm font-semibold text-slate-900">{shipment.destination}</div>
                                <div className="text-xs text-slate-500 mt-0.5">from {shipment.origin} · {shipment.date}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={shipment.status} />
                          </td>
                          <td className="px-6 py-4">
                            <ProgressStepper status={shipment.status} />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-sm font-semibold text-slate-600">{shipment.eta}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* ── Invoices Panel ── */}
          <div className="h-full">
            <div className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-slate-300 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
              <div className="dash-section-header flex justify-between items-center p-6 border-b border-slate-200">
                <h2 className="dash-section-title text-lg font-bold flex items-center text-slate-900">
                  <FileText className="w-5 h-5 mr-2.5 text-orange-500" /> Invoices
                </h2>
                <button
                  onClick={() => navigate('/client/invoices')}
                  className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center transition-all hover:scale-105 active:scale-95"
                >
                  View all <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </button>
              </div>

              <div className="divide-y divide-slate-200 flex-1">
                {invoices.map((inv) => (
                  <div
                    key={inv.id}
                    onClick={() => setSelectedInvoice(inv)}
                    className="dash-invoice-item p-5 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm font-bold text-slate-900/90">{inv.id}</span>
                      <StatusBadge status={inv.status} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-slate-500 font-medium">
                        <Clock className="w-3 h-3 mr-1.5" /> Due {inv.dueDate}
                      </div>
                      <span className="text-base font-black text-slate-900">{formatINR(inv.amount)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total bar */}
              <div className="p-5 bg-orange-50 border-t border-orange-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Total Pending</span>
                  <span className="text-xl font-black text-orange-600">{formatINR(totalPending)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <div className="dash-modal-overlay" onClick={() => setSelectedInvoice(null)}>
          <div className="dash-modal relative" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
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
                className="flex-1 bg-white border border-slate-200 text-slate-700 px-4 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              {selectedInvoice.status !== 'Paid' && (
                <button
                  onClick={() => {
                    markAsPaid(selectedInvoice);
                    setSelectedInvoice(null);
                  }}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-xl font-bold transition-all shadow-lg shadow-orange-500/30"
                >
                  Mark as Paid
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
