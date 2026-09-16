import React from 'react';
import { Package, AlertTriangle } from 'lucide-react';

interface StepCargoProps {
  data: any;
  updateData: (patch: any) => void;
}

const inputCls = `w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200
  focus:ring-2 focus:ring-[var(--color-accent)] border tabular-nums`;

export const StepCargo: React.FC<StepCargoProps> = ({ data, updateData }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Cargo Details</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Describe the shipment contents and dimensions.
        </p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
          Description
        </label>
        <textarea
          rows={3}
          className={`${inputCls} resize-none`}
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
          value={data.description}
          onChange={(e) => updateData({ description: e.target.value })}
          placeholder="Describe the cargo contents..."
        />
      </div>

      {/* Weight / Volume / Items */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Weight (kg)', key: 'weight', unit: 'kg', icon: null },
          { label: 'Volume (m³)', key: 'volume', unit: 'm³', icon: null },
          { label: 'Item Count', key: 'itemCount', unit: null, icon: <Package size={14} /> },
        ].map(({ label, key, unit, icon }) => (
          <div key={key}>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
              {label}
            </label>
            <div className="relative">
              {icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }}>
                  {icon}
                </div>
              )}
              <input
                type="number"
                min="0"
                className={`${inputCls} ${icon ? 'pl-10' : 'pl-4'} pr-10`}
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                value={data[key] || ''}
                onChange={(e) => updateData({ [key]: Number(e.target.value) })}
              />
              {unit && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono"
                  style={{ color: 'var(--color-text-muted)' }}>
                  {unit}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Hazmat Toggle */}
      <div
        className="rounded-xl border p-4 transition-colors duration-200 cursor-pointer"
        style={{
          background: data.hazmat ? 'rgba(239,68,68,0.04)' : 'var(--color-surface-hover)',
          borderColor: data.hazmat ? 'rgba(239,68,68,0.3)' : 'var(--color-border-light)',
        }}
        onClick={() => updateData({ hazmat: !data.hazmat })}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{
                background: data.hazmat ? 'rgba(239,68,68,0.1)' : 'var(--color-surface)',
                color: data.hazmat ? '#EF4444' : 'var(--color-text-muted)',
              }}
            >
              <AlertTriangle size={18} />
            </div>
            <div>
              <h4 className="text-sm font-bold" style={{ color: data.hazmat ? '#EF4444' : 'var(--color-text-primary)' }}>
                Hazardous Materials (HAZMAT)
              </h4>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Does this shipment contain dangerous goods?
              </p>
            </div>
          </div>
          {/* Toggle */}
          <div
            className="relative w-11 h-6 rounded-full transition-colors duration-200"
            style={{ background: data.hazmat ? '#EF4444' : 'var(--color-border)' }}
          >
            <div
              className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-200"
              style={{ transform: data.hazmat ? 'translateX(20px)' : 'translateX(0)' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
