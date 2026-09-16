import { useState, useCallback } from 'react';
import { Search, Package, MapPin, Clock, Truck, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import ClientNavbar from '../../components/client/ClientNavbar';
import { getManifest } from '../../services/manifestApi';
import { getErrorMessage } from '../../services/errorMessage';

function formatDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

type StatusKey = 'PENDING' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED' | 'DELAYED' | 'CANCELLED';

const STATUS_STEPS: StatusKey[] = ['PENDING', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED'];

const STATUS_CONFIG: Record<StatusKey, { label: string; color: string; bg: string; icon: any }> = {
  PENDING: { label: 'Pending', color: 'text-yellow-600', bg: 'bg-yellow-500', icon: Clock },
  ASSIGNED: { label: 'Assigned', color: 'text-purple-600', bg: 'bg-purple-500', icon: Truck },
  IN_TRANSIT: { label: 'In Transit', color: 'text-blue-600', bg: 'bg-blue-500', icon: Truck },
  DELIVERED: { label: 'Delivered', color: 'text-green-600', bg: 'bg-green-500', icon: CheckCircle2 },
  DELAYED: { label: 'Delayed', color: 'text-red-600', bg: 'bg-red-500', icon: AlertCircle },
  CANCELLED: { label: 'Cancelled', color: 'text-slate-600', bg: 'bg-slate-500', icon: AlertCircle },
};

const DEFAULT_STATUS = STATUS_CONFIG.PENDING;

function getConfig(status: string) {
  return STATUS_CONFIG[status as StatusKey] || DEFAULT_STATUS;
}

export default function TrackShipment() {
  const [trackingId, setTrackingId] = useState('');
  const [manifest, setManifest] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) {
      toast.error('Please enter a tracking ID.');
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const res = await getManifest(trackingId.trim());
      setManifest(res.manifest || res.data?.manifest || res);
    } catch (err: any) {
      setManifest(null);
      toast.error(getErrorMessage(err, 'Shipment not found.'));
    } finally {
      setLoading(false);
    }
  }, [trackingId]);

  const currentStep = manifest ? STATUS_STEPS.indexOf(manifest.currentStatus || manifest.status) : -1;
  const statusCfg = manifest ? getConfig(manifest.currentStatus || manifest.status) : DEFAULT_STATUS;

  return (
    <div className="min-h-screen bg-[#f5f6f8] font-sans text-slate-900 flex flex-col">
      <ClientNavbar active="track" />

      <div className="flex-1 max-w-4xl mx-auto w-full space-y-6 p-5 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 text-slate-900">
            Track Shipment
          </h1>
          <p className="text-slate-600 font-medium text-base">
            Enter your tracking ID to view shipment status and details.
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="Enter tracking ID (e.g., TRK-001)"
              className="w-full pl-11 pr-4 py-4 rounded-2xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>

        {/* Results */}
        {loading && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <div className="w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Searching for shipment...</p>
          </div>
        )}

        {!loading && searched && !manifest && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No shipment found with this tracking ID.</p>
          </div>
        )}

        {!loading && manifest && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Status Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Tracking ID</p>
                  <p className="text-xl font-extrabold font-mono text-orange-500">{manifest.trackingId}</p>
                </div>
                <div className={`px-4 py-2 rounded-xl font-bold text-sm ${statusCfg.color}`} style={{ background: `${statusCfg.bg}15` }}>
                  {statusCfg.label}
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="flex items-center justify-between mb-8">
                {STATUS_STEPS.map((step, idx) => {
                  const isCompleted = idx <= currentStep;
                  const isActive = idx === currentStep;
                  const cfg = getConfig(step);
                  return (
                    <div key={step} className="flex-1 flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isActive ? `${cfg.bg} text-white shadow-lg scale-110` :
                        isCompleted ? `${cfg.bg} text-white` :
                        'bg-slate-200 text-slate-400'
                      }`}>
                        <cfg.icon size={18} />
                      </div>
                      <p className={`text-[10px] font-bold mt-2 ${isActive ? cfg.color : isCompleted ? 'text-slate-700' : 'text-slate-400'}`}>
                        {cfg.label}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Route Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={14} className="text-green-500" />
                    <p className="text-xs font-bold text-slate-500 uppercase">Origin</p>
                  </div>
                  <p className="text-sm font-bold text-slate-900">
                    {manifest.routing?.origin?.city || manifest.routing?.origin?.name || '—'}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={14} className="text-red-500" />
                    <p className="text-xs font-bold text-slate-500 uppercase">Destination</p>
                  </div>
                  <p className="text-sm font-bold text-slate-900">
                    {manifest.routing?.destination?.city || manifest.routing?.destination?.name || '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Details Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Shipment Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1">Distance</p>
                  <p className="text-sm font-bold text-slate-900">
                    {manifest.routing?.estimatedDistanceKm ? `${manifest.routing.estimatedDistanceKm.toFixed(0)} km` : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1">Est. Duration</p>
                  <p className="text-sm font-bold text-slate-900">
                    {manifest.routing?.estimatedDurationMinutes ? formatDuration(manifest.routing.estimatedDurationMinutes) : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1">Weight</p>
                  <p className="text-sm font-bold text-slate-900">
                    {manifest.cargoDetails?.totalWeightKg ? `${manifest.cargoDetails.totalWeightKg} kg` : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1">Scheduled Pickup</p>
                  <p className="text-sm font-bold text-slate-900">
                    {formatDate(manifest.scheduledPickup)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
