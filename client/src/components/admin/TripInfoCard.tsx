// TripInfoCard — Enhanced floating info card over Live Ops map
// Shows: tracking ID, status, driver, goods, route, progress, ETA, delay reason.
// Live position is read from the shared positionRef (1s poll) — no per-frame re-render.
// Owner: Developer 2 (Web Frontend Engineer)

import React, { useEffect, useState } from 'react';
import { StatusBadge } from './shared/StatusBadge';
import { formatDuration, formatDistance } from '../../utils/formatters';
import { haversineKm, clamp, type LatLng } from '../../utils/geo';
import { X, Truck, MapPin, Clock, ChevronRight, Package, AlertTriangle, Phone } from 'lucide-react';

interface TripInfoCardProps {
  manifest: any | null;
  fleet: { total: number; inTransit: number; delayed: number };
  positionRef: React.MutableRefObject<Record<string, LatLng>>;
  onSelect?: (mnf: any) => void;
  onViewDetails?: (manifestId: string) => void;
}

const AVG_SPEED_KMPH = 40; // demo ETA assumption

export const TripInfoCard: React.FC<TripInfoCardProps> = ({
  manifest,
  fleet,
  positionRef,
  onSelect,
  onViewDetails,
}) => {
  const [livePos, setLivePos] = useState<LatLng | null>(null);

  const manifestId = manifest?._id || manifest?.id || '';

  // Poll the shared per-frame position 1x/sec for the progress bar / ETA
  useEffect(() => {
    if (!manifestId) return;
    setLivePos(positionRef.current[manifestId] ?? null);
    const iv = setInterval(() => {
      setLivePos(positionRef.current[manifestId] ?? null);
    }, 1000);
    return () => clearInterval(iv);
  }, [manifestId, positionRef]);

  /* ---------- fleet summary (nothing selected) ---------- */
  if (!manifest) {
    return (
      <div
        className="rounded-2xl overflow-hidden animate-fade-in-up"
        style={{ background: 'rgba(15, 27, 51, 0.88)', backdropFilter: 'blur(12px)', boxShadow: 'var(--shadow-xl)' }}
      >
        <div className="px-4 py-3.5">
          <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--color-accent)' }}>
            Live Fleet
          </p>
          <p className="text-xl font-bold mt-0.5" style={{ color: '#fff' }}>
            {fleet.total} truck{fleet.total === 1 ? '' : 's'} on the road
          </p>
          <div className="flex gap-3 mt-2 text-xs">
            <span className="inline-flex items-center gap-1.5 font-semibold" style={{ color: '#A78BFA' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#8B5CF6' }} />
              {fleet.inTransit} in transit
            </span>
            <span className="inline-flex items-center gap-1.5 font-semibold" style={{ color: '#F87171' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#EF4444' }} />
              {fleet.delayed} delayed
            </span>
          </div>
        </div>
        <div className="px-4 py-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)' }}>
          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Select a trip to follow it on the map
          </p>
        </div>
      </div>
    );
  }

  /* ---------- selected trip card ---------- */
  const origin = manifest.origin?.coordinates as [number, number] | undefined;
  const dest = manifest.destination?.coordinates as [number, number] | undefined;
  const current: [number, number] | undefined = livePos
    ? [livePos.lng, livePos.lat]
    : manifest.currentLocation?.coordinates;

  const totalKm = origin && dest ? haversineKm(origin, dest) : 0;
  const remainingKm = current && dest ? haversineKm(current, dest) : 0;
  const progress = totalKm > 0 ? clamp(1 - remainingKm / totalKm, 0, 1) : 0;
  const etaMin = remainingKm > 0 ? (remainingKm / AVG_SPEED_KMPH) * 60 : 0;

  const isDelayed = (manifest.status || '').toUpperCase() === 'DELAYED';
  const driver = manifest.driver;
  const cargo = manifest.cargoDetails;
  const delayReason = manifest.delayReason;

  return (
    <div
      className="rounded-2xl overflow-hidden animate-scale-in"
      style={{ background: 'rgba(15, 27, 51, 0.92)', backdropFilter: 'blur(12px)', boxShadow: 'var(--shadow-xl)' }}
    >
      {/* Header — tracking ID + status + close */}
      <div className="flex items-start justify-between gap-2 px-4 pt-3.5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold" style={{ color: '#fff' }}>
              #{manifest.trackingId || manifestId}
            </span>
            <StatusBadge status={manifest.status} />
          </div>
          <p className="text-xs font-semibold mt-1 truncate" style={{ color: 'rgba(255,255,255,0.85)' }}>
            {manifest.client?.name || 'Unknown client'}
          </p>
        </div>
        <button
          onClick={() => onSelect?.(manifest)}
          className="shrink-0 rounded-full p-2.5 transition-colors hover:bg-white/10 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Close trip details"
          style={{ color: 'rgba(255,255,255,0.6)' }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Driver info */}
      {driver && (
        <div className="flex items-center gap-2.5 px-4 mt-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold"
            style={{ background: 'rgba(255,107,44,0.2)', color: 'var(--color-accent)' }}
          >
            {driver.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold truncate" style={{ color: '#fff' }}>{driver.name}</p>
            <p className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>{driver.phone}</p>
          </div>
          {driver.phone && (
            <a
              href={`tel:${driver.phone}`}
              className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: '#10B981', color: '#fff' }}
              title={`Call ${driver.name}`}
            >
              <Phone size={11} />
            </a>
          )}
        </div>
      )}

      {/* Vehicle */}
      <div className="flex items-center gap-2 px-4 mt-2">
        <Truck size={12} style={{ color: 'rgba(255,255,255,0.4)' }} />
        <span className="text-[11px] font-mono font-semibold" style={{ color: 'rgba(255,255,255,0.65)' }}>
          {manifest.vehicle?.registrationNumber || 'Unassigned'}
          {manifest.vehicle?.make ? ` • ${manifest.vehicle.make}` : ''}
        </span>
      </div>

      {/* Route */}
      <div className="flex items-center gap-2 px-4 mt-2">
        <MapPin size={12} style={{ color: '#10B981' }} />
        <span className="text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.55)' }}>
          {manifest.origin?.city || 'Origin'} → {manifest.destination?.city || 'Destination'}
        </span>
      </div>

      {/* Cargo */}
      {cargo && (
        <div className="flex items-center gap-2 px-4 mt-2">
          <Package size={12} style={{ color: 'rgba(255,255,255,0.4)' }} />
          <span className="text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.55)' }}>
            {cargo.description || 'General Cargo'}
            {cargo.totalWeightKg ? ` • ${cargo.totalWeightKg.toLocaleString()} kg` : ''}
          </span>
        </div>
      )}

      {/* Progress bar */}
      <div className="px-4 mt-3">
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.12)' }}>
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${Math.round(progress * 100)}%`,
              background: isDelayed
                ? 'linear-gradient(90deg, #EF4444, #F87171)'
                : 'linear-gradient(90deg, var(--color-accent), #FF8F5C)',
              boxShadow: isDelayed
                ? '0 0 8px rgba(239,68,68,0.6)'
                : '0 0 8px rgba(255,107,44,0.6)',
            }}
          />
        </div>
        <div className="flex justify-between mt-1.5 text-[10px] font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>
          <span>{Math.round(progress * 100)}% complete</span>
          <span>{formatDistance(remainingKm)} to go</span>
        </div>
      </div>

      {/* Delay reason banner */}
      {isDelayed && delayReason && (
        <div className="mx-4 mt-3 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}>
          <div className="flex items-start gap-2">
            <AlertTriangle size={13} className="shrink-0 mt-0.5" style={{ color: '#F87171' }} />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#F87171' }}>Delay Reason</p>
              <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>{delayReason}</p>
            </div>
          </div>
        </div>
      )}

      {/* ETA + actions */}
      <div className="flex items-center justify-between gap-2 px-4 pt-3 pb-3.5">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold" style={{ color: isDelayed ? '#F87171' : '#A78BFA' }}>
          <Clock size={12} />
          ETA {etaMin > 0 ? `≈ ${formatDuration(etaMin)}` : '—'}
        </span>
        <button
          onClick={() => onViewDetails?.(manifestId)}
          className="inline-flex items-center gap-1 text-[11px] font-bold transition-colors hover:opacity-80"
          style={{ color: 'var(--color-accent)' }}
        >
          View Details <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
};
