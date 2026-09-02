import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface AddEditVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  initialData?: any | null;
}

export const AddEditVehicleModal: React.FC<AddEditVehicleModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [form, setForm] = useState({
    registrationNumber: '', make: '', model: '', year: new Date().getFullYear(),
    status: 'AVAILABLE', weightCapacity: 0, volumeCapacity: 0, fuelEfficiency: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        registrationNumber: initialData.registrationNumber || '', make: initialData.make || '',
        model: initialData.model || '', year: initialData.year || new Date().getFullYear(),
        status: initialData.status || 'AVAILABLE', weightCapacity: initialData.capacity?.weight || 0,
        volumeCapacity: initialData.capacity?.volume || 0, fuelEfficiency: initialData.fuelEfficiency || 0,
      });
    } else {
      setForm({ registrationNumber: '', make: '', model: '', year: new Date().getFullYear(),
        status: 'AVAILABLE', weightCapacity: 0, volumeCapacity: 0, fuelEfficiency: 0 });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({ ...form, capacity: { weight: form.weightCapacity, volume: form.volumeCapacity } });
      onClose();
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const inputCls = 'w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--color-accent)] border';

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'var(--color-surface-modal)', zIndex: 10000 }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden animate-scale-in"
        style={{ background: 'var(--color-surface-card)', boxShadow: 'var(--shadow-modal)' }}>
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b" style={{ borderColor: 'var(--color-border-light)' }}>
          <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
            {initialData ? 'Edit Vehicle' : 'Add New Vehicle'}
          </h2>
          <button onClick={onClose} className="p-2.5 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            style={{ color: 'var(--color-text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Registration */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
              Registration Number
            </label>
            <input type="text" required className={inputCls}
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              value={form.registrationNumber}
              onChange={(e) => setForm({ ...form, registrationNumber: e.target.value.toUpperCase() })}
              placeholder="e.g. MH-12-AB-1234" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Make</label>
              <input type="text" required className={inputCls}
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Model</label>
              <input type="text" required className={inputCls}
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Weight (kg)</label>
              <input type="number" min="0" required className={`${inputCls} tabular-nums`}
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                value={form.weightCapacity} onChange={(e) => setForm({ ...form, weightCapacity: Number(e.target.value) })} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-muted)' }}>Volume (m³)</label>
              <input type="number" min="0" required className={`${inputCls} tabular-nums`}
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                value={form.volumeCapacity} onChange={(e) => setForm({ ...form, volumeCapacity: Number(e.target.value) })} />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-4" style={{ borderTop: '1px solid var(--color-border-light)' }}>
            <button type="button" onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors min-h-[44px]"
              style={{ color: 'var(--color-text-secondary)' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 min-h-[44px]"
              style={{ background: 'var(--color-accent)', boxShadow: '0 4px 14px rgba(255,107,44,0.3)' }}>
              {loading ? 'Saving...' : 'Save Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
