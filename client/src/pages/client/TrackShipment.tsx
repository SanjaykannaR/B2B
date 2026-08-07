import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Search, Loader2, Package, MapPin, CalendarClock, AlertTriangle } from 'lucide-react';
import { AnimatedCard } from '../../components/admin/shared/AnimatedCard';
import { StatusBadge } from '../../components/admin/shared/StatusBadge';
import { getManifest, getMyManifests } from '../../services/manifestApi';

const DEMO_MANIFESTS = [
  {
    _id: 'm1',
    trackingId: 'TRK-8841',
    cargoDetails: { description: 'Industrial CNC Machine Parts' },
    routing: { origin: { city: 'Mumbai' }, destination: { city: 'Pune' } },
    currentStatus: 'IN_TRANSIT',
    createdAt: new Date().toISOString(),
  },
];

const fmtDate = (d?: string | number) =>
  d ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

export const TrackShipment: React.FC = () => {
  const [query, setQuery] = useState('');
  const [my, setMy] = useState<any[]>([]);
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getMyManifests()
      .then((res) => {
        const data = res.manifests || res.data?.manifests || [];
        setMy(data.length > 0 ? data : DEMO_MANIFESTS);
      })
      .catch(() => setMy(DEMO_MANIFESTS));
  }, []);

  const track = async (id?: string) => {
    const key = (id || query).trim();
    if (!key) {
      toast.error('Enter a tracking ID');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await getManifest(key);
      const m = res.manifest || res.data?.manifest;
      setResult(m);
      if (!m) toast.error('Shipment not found');
    } catch {
      toast.error('Shipment not found');
    } finally {
      setLoading(false);
    }
  };

  const timeline = result?.statusTimeline || [];

  return (
    <div className="p-5 sm:p-7 lg:p-8 max-w-[1000px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
          Track Shipment
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Enter a tracking ID to see live status and history
        </p>
      </div>

      {/* Search */}
      <AnimatedCard>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && track()}
              placeholder="TRK-XXXX or manifest ID"
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none border transition-all duration-200 focus:ring-2 focus:ring-[var(--color-accent)]"
              style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            />
          </div>
          <button
            onClick={() => track()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 min-h-[48px] disabled:opacity-60"
            style={{ background: 'var(--color-accent)', boxShadow: '0 8px 20px rgba(255,107,44,0.3)' }}
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />} Track
          </button>
        </div>
      </AnimatedCard>

      {/* Result */}
      {result && (
        <AnimatedCard>
          <div className="rounded-2xl border p-6 space-y-5" style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-card)' }}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                  Tracking ID
                </p>
                <p className="text-lg font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
                  {result.trackingId}
                </p>
              </div>
              <StatusBadge status={result.currentStatus} />
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="rounded-xl p-4" style={{ background: 'var(--color-surface)' }}>
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>
                  <MapPin size={12} style={{ color: 'var(--color-accent)' }} /> Route
                </p>
                <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {result.routing?.origin?.city || '—'} → {result.routing?.destination?.city || '—'}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  ≈ {result.routing?.estimatedDistanceKm ? `${Math.round(result.routing.estimatedDistanceKm).toLocaleString()} km` : 'distance TBD'}
                  {result.routing?.estimatedDurationMinutes ? ` · ${Math.round(result.routing.estimatedDurationMinutes / 60)} hrs` : ''}
                </p>
              </div>
              <div className="rounded-xl p-4" style={{ background: 'var(--color-surface)' }}>
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-text-muted)' }}>
                  <Package size={12} style={{ color: 'var(--color-accent)' }} /> Cargo
                </p>
                <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {result.cargoDetails?.description || '—'}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  {result.cargoDetails?.totalWeightKg} kg
                  {result.cargoDetails?.totalVolumeCubicMeters ? ` · ${result.cargoDetails.totalVolumeCubicMeters} m³` : ''}
                  {result.cargoDetails?.isHazardous && (
                    <span className="inline-flex items-center gap-1 ml-2 font-bold" style={{ color: 'var(--color-warning)' }}>
                      <AlertTriangle size={11} /> HAZMAT
                    </span>
                  )}
                </p>
              </div>
            </div>

            {result.lastLocation && (
              <div className="rounded-xl p-4 flex items-center gap-2 text-xs" style={{ background: 'rgba(255,107,44,0.06)' }}>
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: 'var(--color-accent)', animation: 'dotPulse 2s ease-in-out infinite' }} />
                <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  Live location:
                </span>
                <span style={{ color: 'var(--color-text-secondary)' }}>
                  {result.lastLocation.lat?.toFixed(4)}, {result.lastLocation.lng?.toFixed(4)}
                  {' · '}updated {fmtDate(result.lastLocation.updatedAt)}
                </span>
              </div>
            )}

            {timeline.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-muted)' }}>
                  Timeline
                </p>
                <ol className="space-y-3">
                  {timeline.map((t: any, i: number) => (
                    <li key={i} className="relative pl-5">
                      <span
                        className="absolute left-0 top-1.5 w-2 h-2 rounded-full"
                        style={{ background: i === 0 ? 'var(--color-accent)' : 'var(--color-border)' }}
                      />
                      <p className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        {t.status?.replace(/_/g, ' ')}
                        <span className="ml-2 text-[10px] font-medium" style={{ color: 'var(--color-text-muted)' }}>
                          <CalendarClock size={10} className="inline mr-0.5" /> {fmtDate(t.timestamp)}
                        </span>
                      </p>
                      {t.note && <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{t.note}</p>}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </AnimatedCard>
      )}

      {/* My shipments */}
      <AnimatedCard delay={120}>
        <div className="rounded-2xl border overflow-hidden" style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-card)' }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--color-border-light)' }}>
            <h2 className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>My Shipments</h2>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--color-border-light)' }}>
            {my.length === 0 && (
              <p className="px-5 py-10 text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>No shipments yet</p>
            )}
            {my.map((m) => (
              <button
                key={m._id}
                onClick={() => track(m._id)}
                className="w-full flex items-center justify-between gap-3 px-5 py-3.5 text-left transition-colors hover:bg-[var(--color-surface-hover)]"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
                    {m.trackingId}
                  </p>
                  <p className="text-[11px] truncate mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                    {m.cargoDetails?.description} · {m.routing?.origin?.city} → {m.routing?.destination?.city}
                  </p>
                </div>
                <StatusBadge status={m.currentStatus} />
              </button>
            ))}
          </div>
        </div>
      </AnimatedCard>
    </div>
  );
};
