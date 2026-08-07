import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Navigation, Check, X, MapPin, Package, Loader2, Clock } from 'lucide-react';
import { AnimatedCard } from '../../components/admin/shared/AnimatedCard';
import { StatusBadge } from '../../components/admin/shared/StatusBadge';
import { getDriverManifests } from '../../services/manifestApi';
import api from '../../services/api';

const DEMO_REQUESTS: any[] = [];

const fmtDate = (d?: string | number) =>
  d ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

export const DriverDashboard: React.FC = () => {
  const [manifests, setManifests] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    Promise.allSettled([
      getDriverManifests(),
      api.get('/delivery-requests/my'),
    ])
      .then(([mRes, rRes]) => {
        const mData = (mRes as any).value?.manifests || (mRes as any).value?.data?.manifests || [];
        const rData = (rRes as any).value?.manifests || (rRes as any).value?.data?.manifests || [];
        setManifests(mData.length > 0 ? mData : []);
        setRequests(rData.length > 0 ? rData : DEMO_REQUESTS);
      })
      .catch(() => { setManifests([]); setRequests(DEMO_REQUESTS); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const respond = async (requestId: string, action: 'accept' | 'decline') => {
    setBusyId(requestId);
    try {
      await api.patch(`/delivery-requests/${requestId}/${action}`);
      toast.success(action === 'accept' ? 'Delivery accepted' : 'Delivery declined');
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || `Failed to ${action}`);
    } finally {
      setBusyId(null);
    }
  };

  const active = manifests.filter((m) => ['ASSIGNED', 'IN_TRANSIT'].includes(m.status || m.currentStatus));
  const history = manifests.filter((m) => ['DELIVERED', 'DELAYED', 'CANCELLED'].includes(m.status || m.currentStatus));
  const pending = requests.filter((r) => r.driverRequest?.status === 'pending');

  return (
    <div className="p-5 sm:p-7 lg:p-8 max-w-[1200px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
          My Deliveries
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          {active.length} active · {pending.length} pending request{pending.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Pending requests */}
      {pending.length > 0 && (
        <AnimatedCard>
          <div className="rounded-2xl border p-5 sm:p-6" style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-card)' }}>
            <h2 className="flex items-center gap-2 text-sm font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              <Clock size={15} style={{ color: 'var(--color-warning)' }} /> New delivery requests
            </h2>
            <div className="space-y-3">
              {pending.map((r) => (
                <div key={r._id} className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border p-4" style={{ borderColor: 'var(--color-border)', background: 'rgba(255,107,44,0.03)' }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
                      {r.trackingId}
                    </p>
                    <p className="text-xs mt-0.5 flex items-center gap-1.5 flex-wrap" style={{ color: 'var(--color-text-secondary)' }}>
                      <MapPin size={11} style={{ color: 'var(--color-accent)' }} />
                      {r.routing?.origin?.city} → {r.routing?.destination?.city}
                      <span className="inline-flex items-center gap-1 ml-1 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                        <Package size={11} /> {r.cargoDetails?.description} · {r.cargoDetails?.totalWeightKg} kg
                      </span>
                    </p>
                    <p className="text-[11px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
                      Sent {fmtDate(r.driverRequest?.sentAt)}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => respond(r.driverRequest?._id, 'decline')}
                      disabled={busyId !== null}
                      className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold min-h-[44px] transition-all duration-200 disabled:opacity-50"
                      style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444' }}
                    >
                      <X size={14} /> Decline
                    </button>
                    <button
                      onClick={() => respond(r.driverRequest?._id, 'accept')}
                      disabled={busyId !== null}
                      className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white min-h-[44px] transition-all duration-200 disabled:opacity-50"
                      style={{ background: 'var(--color-success)', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}
                    >
                      {busyId === r.driverRequest?._id ? <Loader2 size={13} className="animate-spin" /> : <Check size={14} />} Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedCard>
      )}

      {/* Active deliveries */}
      <AnimatedCard delay={100}>
        <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-card)' }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--color-border-light)' }}>
            <h2 className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>Active Deliveries</h2>
          </div>
          {loading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
            </div>
          ) : active.length === 0 ? (
            <p className="px-5 py-12 text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
              No active deliveries right now
            </p>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--color-border-light)' }}>
              {active.map((m) => (
                <Link
                  key={m._id}
                  to={`/driver/delivery/${m._id}`}
                  className="flex items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-[var(--color-surface-hover)]"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5">
                      <p className="text-sm font-bold truncate" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
                        {m.trackingId}
                      </p>
                      <StatusBadge status={m.status || m.currentStatus} />
                    </div>
                    <p className="text-xs mt-1 flex items-center gap-1.5 truncate" style={{ color: 'var(--color-text-secondary)' }}>
                      <MapPin size={11} style={{ color: 'var(--color-accent)' }} />
                      {m.routing?.origin?.city} → {m.routing?.destination?.city}
                      <span className="hidden sm:inline text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                        · {m.cargoDetails?.description}
                      </span>
                    </p>
                  </div>
                  <Navigation size={18} className="shrink-0" style={{ color: 'var(--color-accent)' }} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </AnimatedCard>

      {/* History */}
      {history.length > 0 && (
        <AnimatedCard delay={180}>
          <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-card)' }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--color-border-light)' }}>
              <h2 className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>History</h2>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--color-border-light)' }}>
              {history.slice(0, 5).map((m) => (
                <div key={m._id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
                      {m.trackingId}
                    </p>
                    <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--color-text-muted)' }}>
                      {m.routing?.origin?.city} → {m.routing?.destination?.city}
                    </p>
                  </div>
                  <StatusBadge status={m.status || m.currentStatus} />
                </div>
              ))}
            </div>
          </div>
        </AnimatedCard>
      )}
    </div>
  );
};
