import React from 'react';
import { formatDateTime } from '../../utils/formatters';
import { StatusBadge } from './shared/StatusBadge';
import { Navigation, Clock, Eye } from 'lucide-react';
import { useRecovery } from '../../hooks/useRecovery';

interface DispatchPanelProps {
  manifests: any[];
  onSelect: (manifest: any) => void;
  selectedId: string | null;
  onViewDetails?: (manifestId: string) => void;
}

const TripTimer: React.FC<{ manifestId: string; startTime: string | Date }> = ({ manifestId, startTime }) => {
  const elapsedMs = useRecovery(`trip_timer_${manifestId}`, new Date(startTime).getTime());
  const pad = (n: number) => n.toString().padStart(2, '0');
  const h = Math.floor(elapsedMs / 3600000);
  const m = Math.floor((elapsedMs % 3600000) / 60000);
  const s = Math.floor((elapsedMs % 60000) / 1000);

  return (
    <div
      className="flex items-center gap-1.5 font-mono text-xs font-bold px-2 py-1 rounded-lg"
      style={{ color: '#8B5CF6', background: 'rgba(139,92,246,0.08)' }}
    >
      <Clock size={12} />
      <span>{pad(h)}:{pad(m)}:{pad(s)}</span>
    </div>
  );
};

export const DispatchPanel: React.FC<DispatchPanelProps> = ({ manifests, onSelect, selectedId, onViewDetails }) => {
  return (
    <div
      className="w-full md:w-[380px] flex-shrink-0 h-full border-r flex flex-col"
      style={{
        background: 'var(--color-surface-card)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Panel Header */}
      <div className="p-4 border-b shrink-0" style={{ borderColor: 'var(--color-border-light)' }}>
        <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
          <Navigation size={16} style={{ color: 'var(--color-accent)' }} />
          Live Dispatch
        </h2>
        <p className="text-[11px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
          {manifests.length} active trip{manifests.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Manifest Cards */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {manifests.length > 0 ? (
          manifests.map((mnf) => {
            const id = mnf._id || mnf.id;
            const isSelected = selectedId === id;
            const isInTransit = mnf.status === 'IN_TRANSIT';

            return (
              <div
                key={id}
                onClick={() => onSelect(mnf)}
                className="p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-200"
                style={{
                  borderColor: isSelected ? 'var(--color-accent)' : 'var(--color-border-light)',
                  background: isSelected ? 'rgba(255,107,44,0.03)' : 'var(--color-surface)',
                  boxShadow: isSelected ? '0 4px 12px rgba(255,107,44,0.08)' : 'none',
                }}
              >
                {/* Top row: tracking ID + status */}
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
                    #{mnf.trackingId}
                  </span>
                  <StatusBadge status={mnf.status} />
                </div>

                {/* Client + route */}
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                  {mnf.client?.name || 'Unknown'}
                </p>
                <p className="text-[11px] flex items-center gap-1.5" style={{ color: 'var(--color-text-muted)' }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: isInTransit ? '#8B5CF6' : '#F59E0B' }} />
                  {mnf.origin?.city} → {mnf.destination?.city}
                </p>

                {/* Bottom row: vehicle + timer */}
                <div
                  className="flex items-center justify-between mt-3 pt-2.5"
                  style={{ borderTop: '1px solid var(--color-border-light)' }}
                >
                  <span className="text-[10px] font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                    {mnf.vehicle?.registrationNumber || 'Unassigned'}
                  </span>
                  {isInTransit ? (
                    <TripTimer manifestId={id} startTime={mnf.updatedAt || new Date()} />
                  ) : (
                    <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                      {formatDateTime(mnf.updatedAt)}
                    </span>
                  )}
                </div>

                {/* View details link */}
                <button
                  onClick={(e) => { e.stopPropagation(); onViewDetails?.(id); }}
                  className="w-full mt-2 pt-2 text-[11px] font-bold flex items-center justify-center gap-1
                    transition-colors rounded-lg"
                  style={{
                    borderTop: '1px solid var(--color-border-light)',
                    color: 'var(--color-accent)',
                  }}
                >
                  <Eye size={12} /> View Details
                </button>
              </div>
            );
          })
        ) : (
          <div className="h-full flex items-center justify-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
            No active trips.
          </div>
        )}
      </div>
    </div>
  );
};
