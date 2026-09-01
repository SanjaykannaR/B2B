import { useState } from 'react';
import { MapPin, Calendar, Truck, ChevronRight, ShieldCheck, CheckCircle2, Navigation, Clock, RefreshCw, AlertTriangle, Hash, PackageSearch } from 'lucide-react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import type { RootState } from '../../store/store';
import { createManifest, Manifest, GeoPoint } from '../../services/manifestApi';
import { getErrorMessage } from '../../services/errorMessage';

interface FormState {
  origin: string;
  destination: string;
  description: string;
  weight: string;
  volume: string;
  itemCount: string;
  hazardous: boolean;
  pickupDate: string;
  windowClose: string;
}

const INITIAL_FORM: FormState = {
  origin: '',
  destination: '',
  description: '',
  weight: '',
  volume: '',
  itemCount: '1',
  hazardous: false,
  pickupDate: '',
  windowClose: '',
};

const formatINR = (amount: number) => '₹' + amount.toLocaleString('en-IN');

function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const la1 = toRad(a.latitude);
  const la2 = toRad(b.latitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

async function geocode(query: string): Promise<GeoPoint | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
      { headers: { Accept: 'application/json' } }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { display_name?: string; lat?: string; lon?: string }[];
    if (!Array.isArray(data) || data.length === 0 || !data[0]?.lat || !data[0]?.lon) return null;
    return {
      name: data[0].display_name ?? query,
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon),
    };
  } catch {
    return null;
  }
}

export default function OrderForm() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [route, setRoute] = useState<{ origin: GeoPoint; destination: GeoPoint; distanceKm: number; estimatedDurationMinutes: number } | null>(null);
  const [created, setCreated] = useState<Manifest | null>(null);

  const setField = (key: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const prevStep = () => {
    setStep((s) => Math.max(s - 1, 1));
  };

  const goToQuote = async () => {
    if (!form.origin.trim() || !form.destination.trim()) {
      toast.error('Please enter both pickup and delivery addresses.');
      return;
    }
    setIsGeocoding(true);
    try {
      const [origin, destination] = await Promise.all([geocode(form.origin), geocode(form.destination)]);
      if (!origin || !destination) {
        toast.error('Could not locate one of the addresses. Try a more specific address (e.g. "Chicago, IL").');
        return;
      }
      const distanceKm = haversineKm(origin, destination);
      setRoute({
        origin,
        destination,
        distanceKm,
        estimatedDurationMinutes: Math.round(distanceKm),
      });
      setStep(3);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!route) return;

    const weight = parseFloat(form.weight);
    const volume = parseFloat(form.volume);
    const itemCount = parseInt(form.itemCount, 10);

    if (!form.description.trim()) {
      toast.error('Please describe your cargo.');
      return;
    }
    if (isNaN(weight) || weight <= 0) {
      toast.error('Cargo weight must be a positive number.');
      return;
    }
    if (isNaN(volume) || volume <= 0) {
      toast.error('Cargo volume must be a positive number.');
      return;
    }
    if (isNaN(itemCount) || itemCount < 1) {
      toast.error('Item count must be at least 1.');
      return;
    }

    setIsSubmitting(true);
    try {
      const manifest = await createManifest({
        client: user?.id,
        cargoDetails: {
          description: form.description.trim(),
          weight,
          volume,
          itemCount,
          hazardous: form.hazardous,
        },
        routing: { origin: route.origin, destination: route.destination },
        scheduledPickup: form.pickupDate ? new Date(form.pickupDate).toISOString() : undefined,
        scheduledDeliveryWindowClose: form.windowClose ? new Date(form.windowClose).toISOString() : undefined,
      });
      setCreated(manifest);
      toast.success('Manifest created successfully.');
      setStep(4);
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to create shipment. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setRoute(null);
    setCreated(null);
    setStep(1);
  };

  const inputClass = "w-full bg-white/60 hover:bg-white backdrop-blur-md border border-slate-200/60 rounded-2xl pl-12 pr-4 py-4 text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all duration-500 font-medium placeholder:text-slate-400 shadow-sm hover:shadow-md hover:-translate-y-0.5";

  const renderStepIcon = (idx: number, active: boolean, completed: boolean) => {
    if (completed) return <CheckCircle2 className="w-5 h-5 text-white" />;
    return <span className={`text-sm font-bold ${active || completed ? 'text-white' : 'text-slate-400'}`}>{idx}</span>;
  };

  return (
    <div className="w-full h-auto lg:h-[85vh] min-h-[80vh] flex flex-col lg:flex-row bg-white rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-200/60 overflow-hidden animate-[dashPopIn_0.7s_ease-out_both]">
      
      {/* Custom Keyframes */}
      <style>{`
        @keyframes driveTruck {
          0% { transform: translateX(-100px); opacity: 0; }
          10% { opacity: 0.1; }
          90% { opacity: 0.1; }
          100% { transform: translateX(400px); opacity: 0; }
        }
      `}</style>

      {/* Left Sidebar - Branding & Progress */}
      <div className="lg:w-[380px] lg:h-full bg-white border-r border-slate-200 p-3 md:p-3 lg:p-7 flex flex-col justify-between relative overflow-hidden shrink-0">
        
        {/* Animated Background Truck */}
        <div className="absolute top-1/2 left-0 pointer-events-none opacity-5" style={{ animation: 'driveTruck 8s linear infinite' }}>
          <Truck className="w-48 h-48 text-slate-400" strokeWidth={1} />
        </div>
        
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-orange-500 rounded-full blur-[120px] opacity-10 pointer-events-none"></div>

        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 bg-orange-50 border border-orange-100 rounded-full px-4 py-1.5 mb-6 md:mb-8">
            <Truck className="w-4 h-4 text-orange-500" />
            <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">Enterprise Freight</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-2 md:mb-2 tracking-tight leading-tight">
            Create<br />Shipment
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-6 md:mb-10">
            Configure logistics details below to instantly route your cargo and generate a secure tracking ID.
          </p>

          {/* Stepper */}
          <div className="space-y-7">
            {['Origin & Destination', 'Cargo Specifications', 'Scheduling & Quote'].map((label, idx) => {
              const num = idx + 1;
              const isActive = step === num;
              const isPast = step > num;
              return (
                <div key={idx} className="flex items-center space-x-4 relative">
                  {idx < 2 && (
                    <div className={`absolute top-10 left-[1.15rem] bottom-[-2rem] w-px transition-colors duration-700 ${isPast ? 'bg-orange-500' : 'bg-slate-200'}`} />
                  )}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center relative z-10 transition-all duration-700 shadow-lg ${isActive ? 'bg-orange-500 shadow-orange-500/40 scale-110 text-white' : isPast ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                    {renderStepIcon(num, isActive, isPast)}
                  </div>
                  <span className={`font-bold transition-all duration-500 ${isActive ? 'text-slate-900 text-base' : isPast ? 'text-slate-500 text-sm' : 'text-slate-400 text-sm'}`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative z-6 mt-auto pt-6 border-t border-slate-200/60">
          <div className="flex justify-center items-center space-x-2 opacity-60 text-slate-500">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">End-to-End Encrypted</span>
          </div>
        </div>
      </div>

      {/* Right Main Content Area */}
      <div className="flex-1 bg-slate-50/30 p-1 md:p-6 relative overflow-hidden min-h-[600px] lg:h-auto">
        
        {/* Step 1: Routing */}
        <div className={`absolute inset-0 p-5 md:p-12 overflow-y-auto transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${step === 1 ? 'opacity-100 translate-x-0 z-10' : 'opacity-0 -translate-x-32 pointer-events-none'}`}>
          <div className="max-w-2xl mx-auto space-y-6 md:space-y-8 animate-in fade-in slide-in-from-right-8 duration-700 delay-100 fill-mode-both">
            <div>
              <h3 className="text-2xl font-extrabold text-slate-800 mb-2">Routing Details</h3>
              <p className="text-slate-500 font-medium">Where is this cargo heading?</p>
            </div>
            
            <div className="space-y-6">
              <div className="group">
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-2 group-focus-within:text-orange-500 transition-colors">Pickup Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Navigation className="h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                  </div>
                  <input type="text" required placeholder="e.g. 123 Factory Row, Chicago IL" className={inputClass}
                    value={form.origin} onChange={(e) => setField('origin', e.target.value)} />
                </div>
              </div>
              <div className="group animate-in fade-in slide-in-from-right-8 duration-700 delay-200 fill-mode-both">
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-2 group-focus-within:text-orange-500 transition-colors">Delivery Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                  </div>
                  <input type="text" required placeholder="e.g. 456 Warehouse Ave, Detroit MI" className={inputClass}
                    value={form.destination} onChange={(e) => setField('destination', e.target.value)} />
                </div>
              </div>

              <div className="pt-6 md:pt-8 flex justify-end animate-in fade-in slide-in-from-right-8 duration-700 delay-300 fill-mode-both">
                <button type="button" onClick={() => { setStep(2); }} className="group flex items-center bg-slate-900 hover:bg-orange-500 text-white px-8 py-4 rounded-2xl font-bold transition-all duration-300 shadow-xl shadow-slate-900/10 hover:shadow-orange-500/30 hover:-translate-y-1">
                  Continue to Cargo <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Cargo */}
        <div className={`absolute inset-0 p-5 md:p-12 overflow-y-auto transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${step === 2 ? 'opacity-100 translate-x-0 z-10' : step > 2 ? 'opacity-0 -translate-x-32 pointer-events-none' : 'opacity-0 translate-x-32 pointer-events-none'}`}>
          <div className="max-w-2xl mx-auto space-y-5 md:space-y-6">
            <div>
              <h3 className="text-2xl font-extrabold text-slate-800 mb-2">Cargo Specifications</h3>
              <p className="text-slate-500 font-medium">What are we transporting?</p>
            </div>

            <div className="space-y-6">
              <div className="group animate-in fade-in slide-in-from-right-8 duration-700 delay-100 fill-mode-both">
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-2 group-focus-within:text-orange-500 transition-colors">Cargo Description</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <PackageSearch className="h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                  </div>
                  <input type="text" required placeholder="e.g. Automotive components, palletized" className={inputClass}
                    value={form.description} onChange={(e) => setField('description', e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 animate-in fade-in slide-in-from-right-8 duration-700 delay-200 fill-mode-both">
                <div className="group">
                  <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-2 group-focus-within:text-orange-500 transition-colors">Total Weight</label>
                  <div className="relative">
                    <input type="number" min="0" step="any" placeholder="0.00" className={`${inputClass} !pl-6`}
                      value={form.weight} onChange={(e) => setField('weight', e.target.value)} />
                    <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 font-bold text-sm pointer-events-none">kg</span>
                  </div>
                </div>
                <div className="group">
                  <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-2 group-focus-within:text-orange-500 transition-colors">Total Volume</label>
                  <div className="relative">
                    <input type="number" min="0" step="any" placeholder="0.00" className={`${inputClass} !pl-6`}
                      value={form.volume} onChange={(e) => setField('volume', e.target.value)} />
                    <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 font-bold text-sm pointer-events-none">m³</span>
                  </div>
                </div>
                <div className="group">
                  <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-2 group-focus-within:text-orange-500 transition-colors">Item Count</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Hash className="h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                    </div>
                    <input type="number" min="1" step="1" placeholder="1" className={inputClass}
                      value={form.itemCount} onChange={(e) => setField('itemCount', e.target.value)} />
                  </div>
                </div>
              </div>

              <label className="animate-in fade-in slide-in-from-right-8 duration-700 delay-300 fill-mode-both flex items-start space-x-4 p-5 md:p-6 rounded-2xl border-2 border-slate-100 bg-white/60 backdrop-blur-md cursor-pointer hover:border-orange-500 hover:bg-orange-50/50 transition-all duration-300 group shadow-sm hover:shadow-md hover:-translate-y-1">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input type="checkbox" checked={form.hazardous} onChange={(e) => setField('hazardous', e.target.checked)}
                    className="peer appearance-none w-6 h-6 border-2 border-slate-300 rounded-lg checked:bg-orange-500 checked:border-orange-500 transition-all cursor-pointer" />
                  <ShieldCheck className="w-4 h-4 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-slate-900 group-hover:text-orange-600 transition-colors">Hazardous Materials (HAZMAT)</p>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">Check this box if your shipment contains specialized or dangerous goods requiring certified handling.</p>
                </div>
              </label>

              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-6 md:pt-8 animate-in fade-in slide-in-from-right-8 duration-700 delay-500 fill-mode-both">
                <button type="button" onClick={prevStep} className="w-full sm:w-auto text-center text-sm font-bold text-slate-500 hover:text-slate-900 transition-all duration-300 uppercase tracking-widest px-6 py-4 hover:bg-slate-200/50 rounded-xl hover:-translate-y-1 hover:shadow-sm">
                  Go Back
                </button>
                <button type="button" onClick={goToQuote} disabled={isGeocoding}
                  className="group w-full sm:w-auto justify-center flex items-center bg-slate-900 hover:bg-orange-500 text-white px-8 py-4 rounded-2xl font-bold transition-all duration-300 shadow-xl shadow-slate-900/10 hover:shadow-orange-500/30 hover:-translate-y-1 disabled:opacity-60 disabled:hover:translate-y-0">
                  {isGeocoding ? (
                    <span className="flex items-center">Locating <RefreshCw className="w-5 h-5 ml-2 animate-spin" /></span>
                  ) : (
                    <span className="flex items-center">Generate Quote <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" /></span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Scheduling & Review */}
        <div className={`absolute inset-0 p-5 md:p-12 overflow-y-auto transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${step === 3 ? 'opacity-100 translate-x-0 z-10' : step > 3 ? 'opacity-0 -translate-x-32 pointer-events-none' : 'opacity-0 translate-x-32 pointer-events-none'}`}>
          <div className="max-w-2xl mx-auto space-y-6 md:space-y-8">
            <div>
              <h3 className="text-2xl font-extrabold text-slate-800 mb-2">Scheduling & Quote</h3>
              <p className="text-slate-500 font-medium">Finalize logistics timing and review the manifest.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 animate-in fade-in slide-in-from-right-8 duration-700 delay-100 fill-mode-both">
                <div className="group">
                  <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-2 group-focus-within:text-orange-500 transition-colors">Requested Pickup Date</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                    </div>
                    <input type="datetime-local" className={inputClass}
                      value={form.pickupDate} onChange={(e) => setField('pickupDate', e.target.value)} />
                  </div>
                </div>
                <div className="group">
                  <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-2 group-focus-within:text-orange-500 transition-colors">Delivery Window Close</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <Clock className="h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                    </div>
                    <input type="datetime-local" className={inputClass}
                      value={form.windowClose} onChange={(e) => setField('windowClose', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Premium Dark Order Summary Card */}
              <div className="bg-slate-900 rounded-[2rem] p-4 md:p-5 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 fill-mode-both hover:-translate-y-1 transition-all">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Truck className="w-64 h-64 -mt-20 -mr-20" />
                </div>
                <h4 className="font-extrabold text-lg mb-6 md:mb-8 flex items-center relative z-10 text-orange-400">
                  <Clock className="w-5 h-5 mr-3" />
                  Estimated Logistics Profile
                </h4>

                <div className="space-y-1 relative z-10">
                  <div className="flex flex-col sm:flex-row justify-between pb-3 border-b border-white/10 gap-2">
                    <span className="text-slate-400 font-medium text-sm uppercase tracking-widest">Route</span>
                    <span className="font-semibold text-right">{form.origin} → {form.destination}</span>
                  </div>
                  <div className="flex justify-between items-center pb-5 border-b border-white/10">
                    <span className="text-slate-400 font-medium text-sm uppercase tracking-widest">Transport Distance</span>
                    <span className="font-bold text-lg">{route ? `${route.distanceKm.toFixed(0)} km` : '—'}</span>
                  </div>
                  <div className="flex justify-between items-center pb-5 border-b border-white/10">
                    <span className="text-slate-400 font-medium text-sm uppercase tracking-widest">Est. Duration</span>
                    <span className="font-bold text-lg">
                      {route ? `${Math.floor(route.estimatedDurationMinutes / 60)}h ${route.estimatedDurationMinutes % 60}m` : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-5 border-b border-white/10">
                    <span className="text-slate-400 font-medium text-sm uppercase tracking-widest">Cargo Weight</span>
                    <span className="font-bold text-lg">{form.weight ? `${form.weight} kg` : '—'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-3 pt-4">
                    <span className="font-bold text-white uppercase tracking-widest">Total Quote</span>
                    <span className="text-orange-400 font-bold text-3xl sm:text-4xl tabular-nums tracking-tight">
                      {route && form.weight ? formatINR(Math.round(route.distanceKm * (parseFloat(form.weight) / 1000) * 5 + route.distanceKm * 2)) : '—'}
                    </span>
                  </div>
                </div>
              </div>

              {form.hazardous && (
                <div className="flex items-center space-x-2 bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-600 px-6 py-4 rounded-2xl text-sm font-bold animate-in fade-in duration-500 delay-300 fill-mode-both">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <span>HAZMAT flagged — certified driver assignment required.</span>
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 md:pt-3 animate-in fade-in slide-in-from-right-8 duration-700 delay-500 fill-mode-both">
                <button type="button" onClick={prevStep} className="w-full sm:w-auto text-center text-sm font-bold text-slate-500 hover:text-slate-900 transition-all duration-300 uppercase tracking-widest px-6 py-4 hover:bg-slate-200/50 rounded-xl hover:-translate-y-1 hover:shadow-sm">
                  Go Back
                </button>
                <button type="submit" disabled={isSubmitting} className="group w-full sm:w-auto justify-center flex items-center bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-2xl font-bold transition-all duration-300 shadow-xl shadow-orange-500/30 hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0">
                  {isSubmitting ? (
                    <span className="flex items-center">Processing <RefreshCw className="w-5 h-5 ml-2 animate-spin" /></span>
                  ) : (
                    <span className="flex items-center">Confirm Dispatch <CheckCircle2 className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" /></span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Step 4: Success */}
        <div className={`absolute inset-0 p-5 md:p-12 overflow-y-auto flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${step === 4 ? 'opacity-100 translate-y-0 z-20' : 'opacity-0 translate-y-32 pointer-events-none'}`}>
          <div className="w-full max-w-lg text-center space-y-3 md:space-y-2">
            <div className="relative w-full h-40 mx-auto overflow-hidden rounded-3xl bg-orange-50/50 border border-orange-100 flex items-center justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-200/40 via-transparent to-transparent opacity-50"></div>
              
              <div
                className="absolute bottom-12 flex flex-col items-center justify-end transition-all"
                style={{
                  transform: step === 4 ? 'translateX(0px)' : 'translateX(-200px)',
                  opacity: step === 4 ? 1 : 0,
                  transition: 'all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s',
                }}
              >
                <div className="relative">
                  <Truck className="w-20 h-20 text-orange-500 drop-shadow-xl" />
                  <div className="absolute top-1/2 right-full mr-2 w-48 h-1.5 bg-gradient-to-l from-orange-500/40 to-transparent rounded-full -translate-y-1/2"></div>
                </div>
              </div>

              <div
                className="absolute bottom-12 ml-16 bg-white rounded-full p-1.5 shadow-xl transition-all"
                style={{
                  transform: step === 4 ? 'scale(1)' : 'scale(0)',
                  opacity: step === 4 ? 1 : 0,
                  transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 1.2s',
                }}
              >
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
              <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Dispatch Confirmed</h3>
              <p className="text-slate-500 text-lg leading-relaxed">
                Your freight request has been securely logged and is awaiting driver assignment.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500 fill-mode-both">
              <p className="text-xs text-slate-400 uppercase font-extrabold tracking-widest mb-3">Secure Tracking ID</p>
              <p className="font-mono text-slate-900 text-2xl md:text-3xl font-extrabold tracking-widest break-all">{created?.trackingId ?? '—'}</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-in fade-in duration-700 delay-700 fill-mode-both">
              <button
                onClick={resetForm}
                className="w-full sm:w-auto text-sm font-extrabold text-slate-500 hover:text-slate-900 transition-all uppercase tracking-widest px-8 py-4 rounded-2xl hover:bg-slate-100 hover:-translate-y-1"
              >
                New Shipment
              </button>
              <a
                href="/client/track"
                className="w-full sm:w-auto text-sm font-extrabold text-white bg-orange-500 hover:bg-orange-600 transition-all uppercase tracking-widest px-8 py-4 rounded-2xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-1 text-center"
              >
                Track Cargo
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
