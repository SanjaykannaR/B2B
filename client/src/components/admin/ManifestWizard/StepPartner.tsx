import React, { useEffect, useState } from 'react';
import * as userApi from '../../../services/userApi';

interface StepPartnerProps {
  data: any;
  updateData: (patch: any) => void;
}

const inputCls = `w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200
  focus:ring-2 focus:ring-[var(--color-accent)] border`;

const DEMO_CLIENTS = [
  { _id: 'c1', company: 'Acme Industries', firstName: 'Rajesh', lastName: 'Kumar' },
  { _id: 'c2', company: 'GlobalTrade Exports', firstName: 'Priya', lastName: 'Sharma' },
  { _id: 'c3', company: 'FastFreight Logistics', firstName: 'Amit', lastName: 'Patel' },
  { _id: 'c4', company: 'QuickShip Solutions', firstName: 'Sneha', lastName: 'Reddy' },
  { _id: 'c5', company: 'LogiPrime Transport', firstName: 'Vikram', lastName: 'Singh' },
];

const clientLabel = (c: any) =>
  c.company || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Unknown Client';

export const StepPartner: React.FC<StepPartnerProps> = ({ data, updateData }) => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await userApi.getUsers({ role: 'client', isActive: true });
        const list = res.users || res || [];
        setClients(list.length > 0 ? list : DEMO_CLIENTS);
      } catch {
        setClients(DEMO_CLIENTS);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const onSelectClient = (clientId: string) => {
    const selected = clients.find((c) => c._id === clientId);
    updateData({
      clientId,
      clientName: selected ? clientLabel(selected) : '',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Partner & Route</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Enter client details and shipment route.
        </p>
      </div>

      {/* Client Selection */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
          Client
        </label>
        <select
          className={inputCls}
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
          value={data.clientId || ''}
          onChange={(e) => onSelectClient(e.target.value)}
          disabled={loading}
        >
          <option value="">{loading ? 'Loading clients…' : 'Select a client…'}</option>
          {clients.map((c) => (
            <option key={c._id} value={c._id}>
              {clientLabel(c)}
            </option>
          ))}
        </select>
      </div>

      {/* Client Name */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
          Client Name (optional — for a client not listed above)
        </label>
        <input
          type="text"
          className={inputCls}
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
          value={data.clientName}
          onChange={(e) => updateData({ clientName: e.target.value })}
          placeholder="e.g. Acme Corp"
        />
      </div>

      {/* Origin / Destination */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { key: 'origin', label: 'Origin', dotColor: '#3B82F6' },
          { key: 'destination', label: 'Destination', dotColor: '#10B981' },
        ].map(({ key, label, dotColor }) => (
          <div
            key={key}
            className="rounded-xl border p-4 space-y-3"
            style={{ background: 'var(--color-surface-hover)', borderColor: 'var(--color-border-light)' }}
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: dotColor }} />
              <span className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>{label}</span>
            </div>
            <input
              type="text"
              placeholder="Address"
              className={inputCls}
              style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
              value={data[key].address}
              onChange={(e) => updateData({ [key]: { ...data[key], address: e.target.value } })}
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="City"
                className={`w-1/2 ${inputCls}`}
                style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                value={data[key].city}
                onChange={(e) => updateData({ [key]: { ...data[key], city: e.target.value } })}
              />
              <input
                type="text"
                placeholder="Zip"
                className={`w-1/2 ${inputCls}`}
                style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                value={data[key].zipCode}
                onChange={(e) => updateData({ [key]: { ...data[key], zipCode: e.target.value } })}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};