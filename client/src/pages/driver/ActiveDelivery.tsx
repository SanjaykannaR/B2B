import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, MapPin, Package, Truck, Loader2, Flag, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from '../../components/admin/shared/StatusBadge';
import { getManifest, startTrip, updateStatus, completeDelivery } from '../../services/manifestApi';

const fmtDate = (d?: string | number) =>
  d ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

const fmtElapsed = (start?: number, now = Date.now()) => {
  if (!start) return '—';
  const mins = Math.max(0, Math.floor((now - start) / 60000));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
};

export const ActiveDelivery: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [m, setM] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(Date.now());

  const load = () => {
    setLoading(true);
    getManifest(id!)
      .then((res) => setM(res.manifest || res.data?.manifest))
      .catch((err: any) => toast.error(err?.response?.data?.message || 'Delivery not found'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (id) load(); }, [id]);

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  const tripStartMs = m?.tripStartTimestamp || (m?.tripStartTime ? new Date(m.tripStartTime).getTime() : 0);

  const act = async (fn: Promise<any>, msg: string) => {
    setBusy(true);
    try {
      const res = await fn;
      setM(res.manifest || res.data?.manifest || (res as any)?.manifest);
      toast.success(msg);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Action failed');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center pt-24">
        <Loader2 size={28} className="animate-spin" style={{ color: 'var(--color-accent)' }} />
      </div>
    );
  }

  if (!m) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Delivery not found</p>
        <Link to="/driver" className="inline-block mt-4 text-xs font-bold" style={{ color: 'var(--color-accent)' }}>
          ← Back to deliveries
        </Link>
      </div>
    );
  }

  const status = m.status || m.currentStatus;
  const timeline = m.statusTimeline || [];

  return (
    <div className="p-5 sm:p-7 lg:p-8 max-w-[1000px] mx-auto space-y-6">
      <Link to="/driver" className="inline-flex items-center gap-2 text-xs font-bold" style={{ color: 'var(--color-text-muted)' }}>
        <ArrowLeft size={14} /> My Deliveries
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
            {m.trackingId}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            {m.cargoDetails?.description}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {status === 'IN_TRANSIT' && (
            <span className="text-sm font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-accent)' }}>
              ⏱ {fmtElapsed(tripStartMs, now)}
            </span>
          )}
          <StatusBadge status={status} />
        </div>
      </div>

      {/* Route + cargo */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border p-5" style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-card)' }}>
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>
            <MapPin size={12} style={{ color: 'var(--color-accent)' }} /> Route
          </p>
          <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {m.routing?.origin?.city} → {m.routing?.destination?.city}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            {m.routing?.origin?.address || '—'} → {m.routing?.destination?.address || '—'}
          </p>
          {m.routing?.estimatedDistanceKm && (
            <p className="text-xs mt-2" style={{ color: 'var(--color-text-secondary)' }}>
              ≈ {Math.round(m.routing.estimatedDistanceKm).toLocaleString()} km · {Math.round((m.routing.estimatedDurationMinutes || 0) / 60)} hrs
            </p>
          )}
        </div>
        <div className="rounded-2xl border p-5" style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-card)' }}>
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>
            <Package size={12} style={{ color: 'var(--color-accent)' }} /> Cargo & Vehicle
          </p>
          <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {m.cargoDetails?.totalWeightKg} kg{m.cargoDetails?.totalVolumeCubicMeters ? ` · ${m.cargoDetails.totalVolumeCubicMeters} m³` : ''}
            {m.cargoDetails?.itemCount ? ` · ${m.cargoDetails.itemCount} items` : ''}
          </p>
          {m.vehicle && (
            <p className="text-xs mt-1 flex items-center gap-1.5" style={{ color: 'var(--color-text-secondary)' }}>
              <Truck size={12} /> {m.vehicle.registrationNumber} · {m.vehicle.make} {m.vehicle.model}
            </p>
          )}
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Client: {m.client?.name || m.client?.company || '—'} · {m.client?.phone || ''}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {status === 'ASSIGNED' && (
          <button
            onClick={() => act(startTrip(m._id, Date.now()), 'Trip started')}
            disabled={busy}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 min-h-[48px] disabled:opacity-60"
            style={{ background: 'var(--color-accent)', boxShadow: '0 8px 20px rgba(255,107,44,0.3)' }}
          >
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Flag size={15} />} Start Trip
          </button>
        )}
        {status === 'IN_TRANSIT' && (
          <>
            <button
              onClick={() => act(updateStatus(m._id, 'DELAYED', 'Delayed by driver'), 'Marked as delayed')}
              disabled={busy}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-200 min-h-[48px] disabled:opacity-60"
              style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444' }}
            >
              {busy ? <Loader2 size={15} className="animate-spin" /> : <AlertTriangle size={15} />} Report Delay
            </button>
            <button
              onClick={() => act(completeDelivery(m._id), 'Delivery completed')}
              disabled={busy}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 min-h-[48px] disabled:opacity-60"
              style={{ background: 'var(--color-success)', boxShadow: '0 8px 20px rgba(16,185,129,0.3)' }}
            >
              {busy ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />} Mark Delivered
            </button>
          </>
        )}
        {status === 'DELAYED' && (
          <button
            onClick={() => act(updateStatus(m._id, 'IN_TRANSIT', 'Resumed transit'), 'Resumed trip')}
            disabled={busy}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 min-h-[48px] disabled:opacity-60"
            style={{ background: 'var(--color-accent)', boxShadow: '0 8px 20px rgba(255,107,44,0.3)' }}
          >
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Clock size={15} />} Resume Trip
          </button>
        )}
      </div>

      {/* Timeline */}
      <div className="rounded-2xl border p-6" style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-card)' }}>
        <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Trip Timeline</h2>
        {timeline.length === 0 ? (
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>No events yet</p>
        ) : (
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
                    {fmtDate(t.timestamp)}
                  </span>
                </p>
                {t.note && <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{t.note}</p>}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
};
