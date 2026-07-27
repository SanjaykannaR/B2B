import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { StatusBadge } from './shared/StatusBadge';
import { Skeleton } from './shared/Skeleton';

interface FleetGridProps {
  vehicles: any[];
  loading: boolean;
  onEdit: (v: any) => void;
  onDelete: (id: string) => void;
}

export const FleetGrid: React.FC<FleetGridProps> = ({ vehicles, loading, onEdit, onDelete }) => {
  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)' }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ color: 'var(--color-text-muted)' }}>
              {['Registration', 'Model', 'Status', 'Capacity', 'Actions'].map((h) => (
                <th key={h} className={`px-6 py-3 text-[11px] font-semibold uppercase tracking-wider ${h === 'Actions' ? 'text-right' : 'text-left'}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-5 w-20 rounded-full" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
                </tr>
              ))
            ) : vehicles.length > 0 ? (
              vehicles.map((v) => (
                <tr
                  key={v._id || v.id}
                  className="row-glow transition-colors group"
                  style={{ borderBottom: '1px solid var(--color-border-light)' }}
                >
                  <td className="px-6 py-3.5 font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
                    {v.registrationNumber}
                  </td>
                  <td className="px-6 py-3.5" style={{ color: 'var(--color-text-primary)' }}>
                    {v.make} {v.model}
                    <span className="ml-1.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>({v.year})</span>
                  </td>
                  <td className="px-6 py-3.5">
                    <StatusBadge status={v.status || 'AVAILABLE'} />
                  </td>
                  <td className="px-6 py-3.5 tabular-nums" style={{ color: 'var(--color-text-secondary)' }}>
                    {v.capacity?.weight || 0} kg
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEdit(v)}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: 'var(--color-text-muted)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#3B82F6'; e.currentTarget.style.background = '#3B82F615'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                        title="Edit"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => onDelete(v._id || v.id)}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: 'var(--color-text-muted)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = '#EF444415'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center" style={{ color: 'var(--color-text-muted)' }}>
                  No vehicles found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
