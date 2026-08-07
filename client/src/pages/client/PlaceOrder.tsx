import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Send, Loader2, Package, MapPin, AlertTriangle } from 'lucide-react';
import { AnimatedCard } from '../../components/admin/shared/AnimatedCard';
import { createManifest } from '../../services/manifestApi';

const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune',
  'Ahmedabad', 'Jaipur', 'Lucknow', 'Surat', 'Nagpur', 'Indore', 'Kochi',
];

const inputCls =
  'w-full px-4 py-3 rounded-xl text-sm outline-none border transition-all duration-200 focus:ring-2 focus:ring-[var(--color-accent)]';
const labelCls = 'text-[11px] font-semibold uppercase tracking-wider';

export const PlaceOrder: React.FC = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    description: '',
    weight: '',
    volume: '',
    itemCount: '1',
    hazmat: false,
    gstNumber: '',
    originCity: '',
    originAddress: '',
    destinationCity: '',
    destinationAddress: '',
    scheduledPickup: '',
  });

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description.trim() || !form.weight || !form.originCity || !form.destinationCity) {
      toast.error('Description, weight, origin and destination are required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await createManifest({
        description: form.description.trim(),
        weight: Number(form.weight),
        volume: Number(form.volume) || undefined,
        itemCount: Number(form.itemCount) || 1,
        hazmat: form.hazmat,
        gstNumber: form.gstNumber.trim() || undefined,
        origin: { city: form.originCity, address: form.originAddress.trim() || undefined },
        destination: { city: form.destinationCity, address: form.destinationAddress.trim() || undefined },
        scheduledPickup: form.scheduledPickup || undefined,
      });
      const m = res.manifest || res.data?.manifest;
      toast.success(`Order placed — ${m?.trackingId || 'request submitted'}`);
      navigate('/client/track');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-5 sm:p-7 lg:p-8 max-w-[1000px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
          Place Order
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Submit a freight request — our team will assign a driver and vehicle
        </p>
      </div>

      <AnimatedCard>
        <form onSubmit={submit} className="rounded-2xl border p-6 sm:p-8 space-y-7" style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-border)', boxShadow: 'var(--shadow-card)' }}>
          {/* Cargo */}
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
              <Package size={15} style={{ color: 'var(--color-accent)' }} /> Cargo details
            </h2>
            <div>
              <label className={labelCls} style={{ color: 'var(--color-text-muted)' }}>Description *</label>
              <input
                className={`${inputCls} mt-1.5`}
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                placeholder="e.g. Industrial machine parts — 50 crates"
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className={labelCls} style={{ color: 'var(--color-text-muted)' }}>Weight (kg) *</label>
                <input
                  type="number" min="1"
                  className={`${inputCls} mt-1.5`}
                  style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  placeholder="2500"
                  value={form.weight}
                  onChange={(e) => set('weight', e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls} style={{ color: 'var(--color-text-muted)' }}>Volume (m³)</label>
                <input
                  type="number" min="0" step="0.1"
                  className={`${inputCls} mt-1.5`}
                  style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  placeholder="8"
                  value={form.volume}
                  onChange={(e) => set('volume', e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls} style={{ color: 'var(--color-text-muted)' }}>Item count</label>
                <input
                  type="number" min="1"
                  className={`${inputCls} mt-1.5`}
                  style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  value={form.itemCount}
                  onChange={(e) => set('itemCount', e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls} style={{ color: 'var(--color-text-muted)' }}>GST Number</label>
                <input
                  className={`${inputCls} mt-1.5`}
                  style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  placeholder="27AABCU9603R1ZM"
                  value={form.gstNumber}
                  onChange={(e) => set('gstNumber', e.target.value)}
                />
              </div>
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.hazmat}
                onChange={(e) => set('hazmat', e.target.checked)}
                className="w-4 h-4 accent-[var(--color-accent)]"
              />
              <AlertTriangle size={14} style={{ color: 'var(--color-warning)' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                Hazardous / sensitive material
              </span>
            </label>
          </section>

          {/* Route */}
          <section className="space-y-4">
            <h2 className="flex items-center gap-2 text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
              <MapPin size={15} style={{ color: 'var(--color-accent)' }} /> Route
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls} style={{ color: 'var(--color-text-muted)' }}>Origin city *</label>
                <select
                  className={`${inputCls} mt-1.5`}
                  style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  value={form.originCity}
                  onChange={(e) => set('originCity', e.target.value)}
                >
                  <option value="">Select city</option>
                  {INDIAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls} style={{ color: 'var(--color-text-muted)' }}>Destination city *</label>
                <select
                  className={`${inputCls} mt-1.5`}
                  style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  value={form.destinationCity}
                  onChange={(e) => set('destinationCity', e.target.value)}
                >
                  <option value="">Select city</option>
                  {INDIAN_CITIES.filter((c) => c !== form.originCity).map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls} style={{ color: 'var(--color-text-muted)' }}>Origin address</label>
                <input
                  className={`${inputCls} mt-1.5`}
                  style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  placeholder="Industrial area, gate no."
                  value={form.originAddress}
                  onChange={(e) => set('originAddress', e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls} style={{ color: 'var(--color-text-muted)' }}>Destination address</label>
                <input
                  className={`${inputCls} mt-1.5`}
                  style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  placeholder="Warehouse / DC address"
                  value={form.destinationAddress}
                  onChange={(e) => set('destinationAddress', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className={labelCls} style={{ color: 'var(--color-text-muted)' }}>Scheduled pickup</label>
              <input
                type="datetime-local"
                className={`${inputCls} mt-1.5`}
                style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                value={form.scheduledPickup}
                onChange={(e) => set('scheduledPickup', e.target.value)}
              />
            </div>
          </section>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200 min-h-[48px] disabled:opacity-60"
            style={{ background: 'var(--color-accent)', boxShadow: '0 8px 20px rgba(255,107,44,0.35)' }}
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {submitting ? 'Submitting…' : 'Submit freight request'}
          </button>
        </form>
      </AnimatedCard>
    </div>
  );
};
