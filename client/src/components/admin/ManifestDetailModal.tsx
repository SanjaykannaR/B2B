import React from 'react';
import { X, MapPin, Truck, User, Package, Clock, CheckCircle, AlertTriangle, Play, Check, XCircle } from 'lucide-react';
import { StatusBadge } from './shared/StatusBadge';
import { formatDateTime, formatWeight, formatVolume } from '../../utils/formatters';

interface ManifestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  manifest: any | null;
  onAction?: (action: string, manifestId: string) => void;
}

const STEPS = ['PENDING', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED'];

export const ManifestDetailModal: React.FC<ManifestDetailModalProps> = ({ isOpen, onClose, manifest, onAction }) => {
  if (!isOpen || !manifest) return null;

  const id = manifest._id || manifest.id;
  const handle = (action: string) => onAction?.(action, id);
  const stepIdx = STEPS.indexOf(manifest.status);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'var(--color-surface-modal)' }}
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] rounded-2xl flex flex-col overflow-hidden animate-scale-in"
        style={{ background: 'var(--color-surface-card)', boxShadow: 'var(--shadow-modal)' }}
      >
        {/* Header */}
        <div
          className="flex justify-between items-center p-5 border-b shrink-0"
          style={{ borderColor: 'var(--color-border-light)' }}
        >
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
              #{manifest.trackingId}
            </h2>
            <StatusBadge status={manifest.status} />
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-surface-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Progress Stepper */}
          <div className="px-2">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 rounded-full z-0"
                style={{ background: 'var(--color-surface-hover)' }} />
              {STEPS.map((step, i) => {
                const done = stepIdx >= i;
                const active = manifest.status === step;
                const isCancelled = manifest.status === 'CANCELLED' && active;
                const isDelayed = manifest.status === 'DELAYED' && step === 'IN_TRANSIT';
                let bg = done ? 'var(--color-accent)' : 'var(--color-border)';
                if (isCancelled) bg = '#EF4444';
                if (isDelayed) bg = '#F59E0B';
                return (
                  <div key={step} className="relative z-10 flex flex-col items-center gap-1.5 bg-white dark:bg-slate-900 px-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: bg }}>
                      {done ? <Check size={14} /> : i + 1}
                    </div>
                    <span className="text-[10px] font-semibold"
                      style={{ color: active ? 'var(--color-accent)' : 'var(--color-text-muted)' }}>
                      {step.replace('_', ' ')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detail Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: 'Route Details', icon: MapPin, content: (
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: '#3B82F6' }} />
                    <div><p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Origin</p>
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{manifest.origin?.address || manifest.origin?.city || 'N/A'}</p></div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: '#10B981' }} />
                    <div><p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Destination</p>
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{manifest.destination?.address || manifest.destination?.city || 'N/A'}</p></div>
                  </div>
                </div>
              )},
              { title: 'Cargo Details', icon: Package, content: (
                <div className="space-y-2">
                  <div><p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Description</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{manifest.cargo?.description || manifest.description || 'General Cargo'}</p></div>
                  <div className="flex gap-4">
                    <div><p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Weight</p>
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{formatWeight(manifest.cargo?.weight || manifest.weight)}</p></div>
                    <div><p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Volume</p>
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{formatVolume(manifest.cargo?.volume || manifest.volume)}</p></div>
                  </div>
                </div>
              )},
              { title: 'Assignment', icon: Truck, content: (
                <div className="space-y-3">
                  <div><p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Vehicle</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {manifest.vehicle?.registrationNumber || 'Unassigned'}
                    {manifest.vehicle?.make && ` • ${manifest.vehicle.make}`}
                  </p></div>
                  <div><p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Driver</p>
                  <div className="flex items-center gap-1.5">
                    <User size={12} style={{ color: 'var(--color-text-muted)' }} />
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{manifest.driver?.name || 'Unassigned'}</p>
                  </div></div>
                </div>
              )},
              { title: 'Timestamps', icon: Clock, content: (
                <div className="space-y-2">
                  <div><p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Created</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{formatDateTime(manifest.createdAt)}</p></div>
                  <div><p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Last Updated</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{formatDateTime(manifest.updatedAt)}</p></div>
                </div>
              )},
            ].map(({ title, icon: I, content }) => (
              <div key={title} className="rounded-xl border p-4" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border-light)' }}>
                <h3 className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 mb-3" style={{ color: 'var(--color-text-muted)' }}>
                  <I size={13} /> {title}
                </h3>
                {content}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div
          className="p-4 border-t flex justify-end gap-2 shrink-0"
          style={{ borderColor: 'var(--color-border-light)', background: 'var(--color-surface)' }}
        >
          {manifest.status === 'PENDING' && (
            <ActionBtn onClick={() => handle('assign')} color="#3B82F6" icon={Truck} label="Assign Vehicle" />
          )}
          {manifest.status === 'ASSIGNED' && (
            <ActionBtn onClick={() => handle('start')} color="#10B981" icon={Play} label="Start Trip" />
          )}
          {['IN_TRANSIT', 'DELAYED'].includes(manifest.status) && (
            <>
              <ActionBtn onClick={() => handle('delay')} color="#F59E0B" icon={AlertTriangle} label="Report Delay" />
              <ActionBtn onClick={() => handle('complete')} color="#10B981" icon={CheckCircle} label="Complete" />
            </>
          )}
          {['PENDING', 'ASSIGNED'].includes(manifest.status) && (
            <ActionBtn onClick={() => handle('cancel')} color="#EF4444" icon={XCircle} label="Cancel" variant="outline" />
          )}
        </div>
      </div>
    </div>
  );
};

const ActionBtn: React.FC<{ onClick: () => void; color: string; icon: React.FC<any>; label: string; variant?: 'solid' | 'outline' }> = ({
  onClick, color, icon: I, label, variant = 'solid',
}) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 hover:-translate-y-0.5"
    style={variant === 'solid' ? {
      background: color, color: '#fff', boxShadow: `0 4px 14px ${color}40`,
    } : {
      background: 'var(--color-surface-card)', color, border: `1px solid ${color}40`,
    }}
  >
    <I size={14} /> {label}
  </button>
);
