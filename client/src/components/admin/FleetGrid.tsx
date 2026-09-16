import React from 'react';
import { Edit2, Trash2, Send, Phone, User } from 'lucide-react';
import { StatusBadge } from './shared/StatusBadge';
import { Skeleton } from './shared/Skeleton';

interface FleetGridProps {
  vehicles: any[];
  loading: boolean;
  onEdit: (v: any) => void;
  onDelete: (id: string) => void;
  onRequestDriver?: (v: any) => void;
}

export const FleetGrid: React.FC<FleetGridProps> = ({
  vehicles,
  loading,
  onEdit,
  onDelete,
  onRequestDriver,
}) => {
  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)' }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border-light)' }}>
              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Registration</th>
              <th className="hidden sm:table-cell px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Model</th>
              <th className="hidden md:table-cell px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Driver</th>
              <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Status</th>
              <th className="hidden lg:table-cell px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">Capacity</th>
              <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Loading skeletons */}
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                  <td className="px-5 py-4"><Skeleton className="h-4 w-28" /></td>
                  <td className="hidden sm:table-cell px-5 py-4"><Skeleton className="h-4 w-32" /></td>
                  <td className="hidden md:table-cell px-5 py-4"><Skeleton className="h-4 w-28" /></td>
                  <td className="px-5 py-4"><Skeleton className="h-5 w-20 rounded-full" /></td>
                  <td className="hidden lg:table-cell px-5 py-4"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-5 py-4"><Skeleton className="h-4 w-24 ml-auto" /></td>
                </tr>
              ))
            ) : vehicles.length > 0 ? (
              vehicles.map((v) => {
                const driver = v.driver || null;
                return (
                  <tr
                    key={v._id || v.id}
                    className="row-glow transition-colors group"
                    style={{ borderBottom: '1px solid var(--color-border-light)' }}
                  >
                    {/* Vehicle registration */}
                    <td className="px-5 py-3.5 font-bold whitespace-nowrap" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
                      {v.registrationNumber}
                    </td>

                    {/* Vehicle model — hidden on mobile */}
                    <td className="hidden sm:table-cell px-5 py-3.5" style={{ color: 'var(--color-text-primary)' }}>
                      {v.make} {v.model}
                      <span className="ml-1.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>({v.year})</span>
                    </td>

                    {/* Driver info — hidden on mobile, visible md+ */}
                    <td className="hidden md:table-cell px-5 py-3.5">
                      {driver ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold"
                            style={{ background: 'var(--color-accent-50)', color: 'var(--color-accent)' }}
                          >
                            {driver.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                              {driver.name}
                            </p>
                            <p className="text-[11px] truncate" style={{ color: 'var(--color-text-muted)' }}>
                              {driver.phone}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>No driver</span>
                      )}
                    </td>

                    {/* Status badge */}
                    <td className="px-5 py-3.5">
                      <StatusBadge status={v.status || 'AVAILABLE'} />
                    </td>

                    {/* Capacity — hidden on small screens */}
                    <td className="hidden lg:table-cell px-5 py-3.5 tabular-nums" style={{ color: 'var(--color-text-secondary)' }}>
                      {v.capacity?.weight || 0} kg
                    </td>

                    {/* Actions — all buttons 44px touch targets */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex justify-end items-center gap-1">
                        {/* Contact Driver by Phone */}
                        {driver?.phone && (
                          <a
                            href={`tel:${driver.phone}`}
                            className="p-2.5 rounded-lg transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
                            title={`Call ${driver.name}`}
                            style={{ color: 'var(--color-text-muted)' }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = '#10B981'; e.currentTarget.style.background = '#10B98112'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                          >
                            <Phone size={15} />
                          </a>
                        )}

                        {/* Send Request to Driver */}
                        {driver && (
                          <button
                            onClick={() => onRequestDriver?.(v)}
                            className="p-2.5 rounded-lg transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
                            title="Send Request to Driver"
                            style={{ color: 'var(--color-text-muted)' }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-accent)'; e.currentTarget.style.background = 'rgba(255,107,44,0.08)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                          >
                            <Send size={15} />
                          </button>
                        )}

                        {/* Edit */}
                        <button
                          onClick={() => onEdit(v)}
                          className="p-2.5 rounded-lg transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
                          style={{ color: 'var(--color-text-muted)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = '#3B82F6'; e.currentTarget.style.background = '#3B82F612'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => onDelete(v._id || v.id)}
                          className="p-2.5 rounded-lg transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
                          style={{ color: 'var(--color-text-muted)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = '#EF444412'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              /* Empty state */
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <User size={36} className="mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} />
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>No vehicles found</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Try adjusting your filter</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
