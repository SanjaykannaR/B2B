import { useState } from 'react';
import { Package, MapPin, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ClientNavbar from '../../components/client/ClientNavbar';
import { createManifest } from '../../services/manifestApi';
import { getErrorMessage } from '../../services/errorMessage';

export default function PlaceOrder() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    originCity: '',
    originAddress: '',
    destinationCity: '',
    destinationAddress: '',
    cargoDescription: '',
    weight: '',
    volume: '',
    pickupDate: '',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.originCity || !form.destinationCity || !form.weight || !form.pickupDate) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      await createManifest({
        routing: {
          origin: { city: form.originCity, address: form.originAddress },
          destination: { city: form.destinationCity, address: form.destinationAddress },
        },
        cargoDetails: {
          description: form.cargoDescription,
          totalWeightKg: parseFloat(form.weight) || 0,
          totalVolumeCubicMeters: parseFloat(form.volume) || 0,
        },
        scheduledPickup: form.pickupDate,
        notes: form.notes,
      });
      setSuccess(true);
      toast.success('Order placed successfully!');
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to place order.'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#f5f6f8] font-sans text-slate-900 flex flex-col">
        <ClientNavbar active="place-order" />
        <div className="flex-1 flex items-center justify-center p-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm max-w-md animate-in fade-in zoom-in duration-500">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Order Placed!</h2>
            <p className="text-slate-600 mb-8">Your freight request has been submitted. Our team will review and assign a vehicle shortly.</p>
            <div className="flex gap-3">
              <button
                onClick={() => { setSuccess(false); setForm({ originCity: '', originAddress: '', destinationCity: '', destinationAddress: '', cargoDescription: '', weight: '', volume: '', pickupDate: '', notes: '' }); }}
                className="flex-1 px-6 py-3 border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all"
              >
                New Order
              </button>
              <button
                onClick={() => navigate('/client/dashboard')}
                className="flex-1 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-orange-500/20"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f6f8] font-sans text-slate-900 flex flex-col">
      <ClientNavbar active="place-order" />

      <div className="flex-1 max-w-3xl mx-auto w-full space-y-6 p-5 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both">
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 text-slate-900">
            Place Order
          </h1>
          <p className="text-slate-600 font-medium text-base">
            Submit a new freight shipment request.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Route Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-orange-500" /> Route Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Origin City *</label>
                <input
                  type="text"
                  name="originCity"
                  value={form.originCity}
                  onChange={handleChange}
                  placeholder="e.g., Mumbai"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Origin Address</label>
                <input
                  type="text"
                  name="originAddress"
                  value={form.originAddress}
                  onChange={handleChange}
                  placeholder="Full pickup address"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Destination City *</label>
                <input
                  type="text"
                  name="destinationCity"
                  value={form.destinationCity}
                  onChange={handleChange}
                  placeholder="e.g., Delhi"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Destination Address</label>
                <input
                  type="text"
                  name="destinationAddress"
                  value={form.destinationAddress}
                  onChange={handleChange}
                  placeholder="Full delivery address"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Cargo Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Package size={18} className="text-orange-500" /> Cargo Details
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                <input
                  type="text"
                  name="cargoDescription"
                  value={form.cargoDescription}
                  onChange={handleChange}
                  placeholder="e.g., Electronics, Furniture, Raw Materials"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Weight (kg) *</label>
                  <input
                    type="number"
                    name="weight"
                    value={form.weight}
                    onChange={handleChange}
                    placeholder="Total weight in kg"
                    required
                    min="0"
                    step="0.1"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Volume (m³)</label>
                  <input
                    type="number"
                    name="volume"
                    value={form.volume}
                    onChange={handleChange}
                    placeholder="Total volume in cubic meters"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-orange-500" /> Schedule
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Preferred Pickup Date *</label>
                <input
                  type="date"
                  name="pickupDate"
                  value={form.pickupDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Additional Notes</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Special instructions, handling requirements, etc."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Place Order <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
