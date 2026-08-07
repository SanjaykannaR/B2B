import { useState, useCallback, useEffect } from 'react';
import {
  Search, Package, MapPin, Navigation,
  Calendar, CheckCircle2, Clock, AlertTriangle,
  Truck, FileText, Hash, ShieldCheck, PackageSearch, Activity, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getMyManifests, Manifest } from '../../services/manifestApi';

interface ShipmentView {
  id: string;
  status: string;
  origin: string;
  destination: string;
  distance: string;
  duration: string;
  weight: string;
  volume: string;
  items: number;
  hazmat: boolean;
  driver: string | null;
  vehicle: string | null;
  timeline: { status: string; note: string; time: string }[];
  coords: { origin: [number, number]; dest: [number, number]; current: [number, number] };
}

const statusConfig: any = {
  'Pending': { color: 'text-slate-500', bg: 'bg-slate-400/10', border: 'border-slate-400/20', icon: Clock },
  'Assigned': { color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', icon: FileText },
  'In-Transit': { color: 'text-accent', bg: 'bg-orange-400/10', border: 'border-orange-400/20', icon: Truck },
  'Delivered': { color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', icon: CheckCircle2 },
  'Delayed': { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20', icon: AlertTriangle },
  'Cancelled': { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20', icon: AlertTriangle },
};

function formatDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatDateTime(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function currentPosition(m: Manifest): [number, number] {
  const o = m.routing.origin;
  const d = m.routing.destination;
  if (m.currentStatus === 'Delivered') return [d.latitude, d.longitude];
  if (m.currentStatus === 'In-Transit' || m.currentStatus === 'Delayed') {
    return [o.latitude + (d.latitude - o.latitude) * 0.4, o.longitude + (d.longitude - o.longitude) * 0.4];
  }
  return [o.latitude, o.longitude];
}

function toShipmentView(m: Manifest): ShipmentView {
  const driver = m.driver ? `${m.driver.firstName} ${m.driver.lastName}` : null;
  const vehicle = m.vehicle ? `${m.vehicle.registrationNumber} · ${m.vehicle.make} ${m.vehicle.model}` : null;
  const timeline = [...m.statusTimeline]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .map((e) => ({ status: e.status, note: e.note ?? '', time: formatDateTime(e.at) }));

  return {
    id: m.trackingId,
    status: m.currentStatus,
    origin: m.routing.origin.name,
    destination: m.routing.destination.name,
    distance: `${m.routing.distanceKm.toFixed(0)} km`,
    duration: formatDuration(m.routing.estimatedDurationMinutes),
    weight: `${m.cargoDetails.weight.toLocaleString()} kg`,
    volume: `${m.cargoDetails.volume} m³`,
    items: m.cargoDetails.itemCount,
    hazmat: m.cargoDetails.hazardous,
    driver,
    vehicle,
    timeline,
    coords: {
      origin: [m.routing.origin.latitude, m.routing.origin.longitude],
      dest: [m.routing.destination.latitude, m.routing.destination.longitude],
      current: currentPosition(m),
    },
  };
}

export default function TrackShipment() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [shipments, setShipments] = useState<ShipmentView[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyManifests({ limit: 50 });
      const views = res.items.map(toShipmentView);
      setShipments(views);
      setActiveId((prev) => prev && views.some((v) => v.id === prev) ? prev : (views[0]?.id ?? null));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load shipments.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredShipments = shipments.filter(s =>
    s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeShipment = shipments.find((s) => s.id === activeId) ?? null;

  return (
    <div className="min-h-screen bg-[#f5f6f8] text-slate-700 font-sans flex flex-col">

      {/* ── Global Navbar ── */}
      <nav className="bg-white border-b border-slate-200 py-4 px-4 md:px-8 sticky top-0 z-[100] shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/client/dashboard')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-[#0a0a0a] border border-orange-500 shadow-sm">
              <PackageSearch className="w-5 h-5 text-orange-500" />
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-slate-900 leading-tight">B2B Logistics</span>
              <span className="text-[10px] font-semibold text-slate-500 leading-tight">Freight Operations Console</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6 text-sm font-semibold">
            <button onClick={() => navigate('/dashboard')} className="text-slate-600 hover:text-orange-500 transition-colors flex items-center space-x-1.5">
              <Activity className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <button onClick={() => navigate('/track')} className="text-orange-500 flex items-center space-x-1.5">
              <MapPin className="w-4 h-4" />
              <span>Live Tracking</span>
            </button>
            <button onClick={() => navigate('/client-invoices')} className="text-slate-600 hover:text-orange-500 transition-colors flex items-center space-x-1.5">
              <FileText className="w-4 h-4" />
              <span>Billing</span>
            </button>
            
            {/* Actions */}
            <div className="flex items-center space-x-6 border-l border-slate-200 pl-6">
              <button
                onClick={() => window.location.reload()}
                className="text-slate-600 hover:text-orange-500 transition-colors flex items-center space-x-1.5"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden lg:inline">Refresh</span>
              </button>
              <button
                onClick={() => navigate('/place-order')}
                className="text-slate-600 hover:text-orange-500 transition-colors flex items-center space-x-1.5"
              >
                <Package className="w-4 h-4" />
                <span>New Shipment</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col md:flex-row relative">
        {/* LEFT PANEL: SEARCH & LIST */}
        <div className="track-list-panel w-full md:w-96 bg-white border-r border-slate-200 flex flex-col h-[calc(100vh-76px)] sticky top-[76px] z-50">

          <div className="p-6 border-b border-slate-200 bg-white z-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Track Shipments</h1>

            <div className="relative group w-[46px] focus-within:w-full max-w-[260px] h-[46px] transition-all duration-300 ease-in-out">
              <div className="absolute inset-y-0 left-0 flex items-center justify-center w-[46px] h-[46px] pointer-events-none z-10">
                <Search className="h-5 w-5 text-slate-500 group-focus-within:text-orange-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search ID..."
                className="absolute right-0 w-full h-full bg-white border border-slate-200 rounded-full pl-11 pr-4 text-sm text-slate-900 placeholder-transparent focus:placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300 ease-in-out cursor-pointer focus:cursor-text shadow-sm hover:shadow-md hover:border-slate-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {loading && shipments.length === 0 && (
              <div className="text-center py-10 text-slate-500">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-20 animate-pulse" />
                <p>Loading your shipments…</p>
              </div>
            )}
            {!loading && filteredShipments.length === 0 && (
              <div className="text-center py-10 text-slate-500">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No shipments found. Place an order to get started.</p>
              </div>
            )}
            {filteredShipments.map((shipment) => {
              const isSelected = shipment.id === activeId;
              const StatusIcon = statusConfig[shipment.status]?.icon ?? Clock;

              return (
                <div
                  key={shipment.id}
                  onClick={() => setActiveId(shipment.id)}
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-300 border ${isSelected
                    ? 'bg-accent/10 border-accent/50 shadow-[0_0_15px_rgba(249,115,22,0.1)]'
                    : 'bg-white border-slate-300 hover:border-slate-400 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2">
                      <Hash className={`w-4 h-4 ${isSelected ? 'text-accent' : 'text-slate-500'}`} />
                      <span className={`font-bold ${isSelected ? 'text-slate-900' : 'text-slate-200'}`}>
                        {shipment.id}
                      </span>
                    </div>
                    <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig[shipment.status]?.bg} ${statusConfig[shipment.status]?.color} ${statusConfig[shipment.status]?.border}`}>
                      <StatusIcon className="w-3 h-3" />
                      <span>{shipment.status}</span>
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <div className="flex items-center text-sm">
                      <MapPin className="w-4 h-4 text-slate-500 mr-2 flex-shrink-0" />
                      <span className="truncate text-slate-500">{shipment.origin}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Navigation className="w-4 h-4 text-accent mr-2 flex-shrink-0" />
                      <span className="truncate text-slate-700">{shipment.destination}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANEL: DETAILS */}
        <div className="flex-1 overflow-y-auto bg-[#f5f6f8] relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none"></div>

          {activeShipment ? (
            <div className="max-w-4xl mx-auto p-6 md:p-12 relative z-10">

              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-200">
                <div>
                  <h2 className="text-sm font-bold text-accent uppercase tracking-widest mb-1">Manifest Details</h2>
                  <div className="flex items-center space-x-3">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">{activeShipment.id}</h1>
                  </div>
                </div>

                <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${statusConfig[activeShipment.status]?.bg} ${statusConfig[activeShipment.status]?.border}`}>
                  <div className={`w-2.5 h-2.5 rounded-full ${statusConfig[activeShipment.status]?.bg.replace('/10', '')} animate-pulse`}></div>
                  <span className={`font-bold ${statusConfig[activeShipment.status]?.color}`}>{activeShipment.status}</span>
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="bg-white border border-slate-200 rounded-2xl p-8 mb-8 shadow-xl overflow-hidden">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Delivery Progress</h3>
                <ProgressStepper currentStatus={activeShipment.status} />
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Route Info */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-200">
                    <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Route Information</h3>
                  </div>

                  <div className="space-y-6 relative">
                    <div className="absolute left-3 top-6 bottom-6 w-px bg-slate-300"></div>

                    <div className="flex items-start relative z-10">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center mr-4 flex-shrink-0 border-2 border-slate-50 shadow-sm relative z-10">
                        <MapPin className="w-3 h-3 text-slate-500" />
                      </div>
                      <div className="pt-0.5">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Origin</p>
                        <p className="font-medium text-slate-700">{activeShipment.origin}</p>
                      </div>
                    </div>

                    <div className="flex items-start relative z-10">
                      <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center mr-4 flex-shrink-0 border-2 border-slate-50 shadow-[0_0_10px_rgba(249,115,22,0.4)] relative z-10">
                        <Navigation className="w-3 h-3 text-white" />
                      </div>
                      <div className="pt-0.5">
                        <p className="text-xs font-bold text-accent uppercase mb-1">Destination</p>
                        <p className="font-medium text-slate-900">{activeShipment.destination}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-4 pt-6 border-t border-slate-200">
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 mb-1">Distance</p>
                      <p className="font-bold text-slate-700">{activeShipment.distance}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-500 mb-1">Est. Duration</p>
                      <p className="font-bold text-slate-700">{activeShipment.duration}</p>
                    </div>
                  </div>
                </div>

                {/* Cargo & Assignment Info */}
                <div className="flex flex-col gap-6">

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 backdrop-blur-sm flex-1">
                    <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-200">
                      <div className="bg-accent/20 p-2 rounded-lg text-accent">
                        <Package className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">Cargo Details</h3>
                      {activeShipment.hazmat && (
                        <div className="ml-auto bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-bold flex items-center">
                          <AlertTriangle className="w-3 h-3 mr-1.5" /> HAZMAT
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-100/50 rounded-xl p-3 border border-slate-200">
                        <p className="text-xs text-slate-500 mb-1">Total Weight</p>
                        <p className="font-bold text-slate-900">{activeShipment.weight}</p>
                      </div>
                      <div className="bg-slate-100/50 rounded-xl p-3 border border-slate-200">
                        <p className="text-xs text-slate-500 mb-1">Volume</p>
                        <p className="font-bold text-slate-900">{activeShipment.volume}</p>
                      </div>
                      <div className="bg-slate-100/50 rounded-xl p-3 border border-slate-200 col-span-2">
                        <p className="text-xs text-slate-500 mb-1">Item Count</p>
                        <p className="font-bold text-slate-900">{activeShipment.items} Units</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 backdrop-blur-sm">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">Assignment</h3>
                    </div>

                    {activeShipment.driver ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-500">Driver</span>
                          <span className="text-sm font-bold text-slate-900">{activeShipment.driver}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-500">Vehicle</span>
                          <span className="text-sm font-bold text-slate-900">{activeShipment.vehicle}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-slate-500 italic py-2">
                        Pending assignment
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* Bottom Grid: Activity & Map */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

                {/* Activity Timeline */}
                <div className="bg-slate-100 border border-slate-200 rounded-2xl p-8 backdrop-blur-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-8">Activity Log</h3>
                  <div className="space-y-8 relative z-0">
                    <div className="absolute left-6 top-6 bottom-6 w-px bg-slate-300 -translate-x-1/2 z-[-1]"></div>

                    {activeShipment.timeline.map((event, idx) => {
                      const isLatest = idx === 0;
                      const EventIcon = statusConfig[event.status]?.icon ?? Clock;

                      return (
                        <div key={idx} className="flex items-center relative z-10 group">
                          <div className={`w-12 h-12 rounded-full flex flex-shrink-0 items-center justify-center border-4 border-slate-100 ${isLatest ? statusConfig[event.status]?.bg : 'bg-white'
                            } ${isLatest ? statusConfig[event.status]?.color : 'text-slate-500'} shadow-sm z-10 transition-transform group-hover:scale-110`}>
                            <EventIcon className="w-5 h-5" />
                          </div>

                          <div className="ml-6">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
                              <span className={`font-bold ${isLatest ? 'text-slate-900' : 'text-slate-700'}`}>
                                {event.status}
                              </span>
                              <span className="hidden sm:block w-1 h-1 rounded-full bg-slate-600"></span>
                              <span className="text-xs text-slate-500 font-medium flex items-center">
                                <Calendar className="w-3 h-3 mr-1" /> {event.time}
                              </span>
                            </div>
                            <p className={`text-sm ${isLatest ? 'text-slate-700' : 'text-slate-500'}`}>
                              {event.note || '—'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Live GPS Tracking */}
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl min-h-[400px] flex flex-col relative">
                  <div className="p-6 border-b border-slate-200 flex items-center justify-between z-10 bg-white">
                    <div className="flex items-center space-x-3">
                      <div className="bg-accent/20 p-2 rounded-lg text-accent">
                        <Navigation className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">Live GPS Tracking</h3>
                    </div>
                    <div className="flex items-center space-x-2 bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span>LIVE</span>
                    </div>
                  </div>
                  <div className="flex-1 relative bg-slate-50 z-0 h-full min-h-[300px]">
                    {activeShipment.coords && (
                      <LiveMap coords={activeShipment.coords} />
                    )}
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 py-32">
              <Package className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-bold text-slate-700">Select a shipment to view details</p>
              <p className="text-sm mt-1">Shipments appear here after you place an order.</p>
            </div>
          )}
        </div>
      </div>

      {/* Custom styles for scrollbar hidden inside tailwind class for simplicity */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }

        @media (max-width: 767px) {
          .track-list-panel { height: 50vh; }
        }
      `}} />
    </div>
  );
}

// Progress Stepper Subcomponent
function ProgressStepper({ currentStatus }: { currentStatus: string }) {
  const steps = [
    { label: 'Pending', icon: Clock },
    { label: 'Assigned', icon: FileText },
    { label: 'In-Transit', icon: Truck },
    { label: 'Delivered', icon: CheckCircle2 }
  ];

  const stepLabels = steps.map(s => s.label);
  let currentIndex = stepLabels.indexOf(currentStatus);
  if (currentStatus === 'Delayed') currentIndex = 2;
  if (currentIndex === -1) currentIndex = 0;

  return (
    <div className="w-full max-w-3xl mx-auto px-2 py-4">
      <div className="flex justify-between w-full relative">
        {steps.map((step, idx) => {
          const isCompleted = idx <= currentIndex;
          const isActive = idx === currentIndex;
          const isLast = idx === steps.length - 1;
          const Icon = step.icon;

          return (
            <div key={step.label} className="flex flex-col items-center w-1/4 relative group">
              {!isLast && (
                <div className="absolute top-5 left-1/2 w-full h-1 bg-slate-200 -translate-y-1/2 z-0">
                  <div
                    className="h-full bg-accent transition-all duration-1000 shadow-[0_0_8px_rgba(255,107,44,0.4)]"
                    style={{ width: currentIndex > idx ? '100%' : '0%' }}
                  ></div>
                </div>
              )}

              <div className={`w-10 h-10 rounded-full border-4 flex items-center justify-center transition-all duration-300 bg-white relative z-10 ${isActive
                ? 'border-accent text-accent shadow-md scale-110'
                : isCompleted
                  ? 'border-accent text-accent'
                  : 'border-slate-200 text-slate-400'
                }`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className={`mt-3 text-[11px] font-bold text-center uppercase tracking-wider w-full px-1 break-words relative z-10 ${isActive ? 'text-accent' :
                isCompleted ? 'text-slate-900' :
                  'text-slate-400'
                }`}>
                {step.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Live Map Subcomponent using react-leaflet
function LiveMap({ coords }: { coords: { origin: [number, number], dest: [number, number], current: [number, number] } }) {

  const originIcon = L.divIcon({
    className: 'bg-transparent',
    html: `<div class="w-8 h-8 rounded-full bg-slate-900 border-4 border-white flex items-center justify-center shadow-lg"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32]
  });

  const destIcon = L.divIcon({
    className: 'bg-transparent',
    html: `<div class="w-8 h-8 rounded-full bg-emerald-500 border-4 border-white flex items-center justify-center shadow-lg"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32]
  });

  const truckIcon = L.divIcon({
    className: 'bg-transparent',
    html: `<div class="w-12 h-12 rounded-full bg-accent border-4 border-white flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.6)] animate-pulse"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg></div>`,
    iconSize: [48, 48],
    iconAnchor: [24, 24]
  });

  const bounds = L.latLngBounds([coords.origin, coords.dest]);
  const polylinePositions = [coords.origin, coords.current, coords.dest];

  return (
    <MapContainer bounds={bounds} boundsOptions={{ padding: [50, 50] }} className="absolute inset-0 w-full h-full z-0 rounded-b-2xl" zoomControl={false}>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <Polyline positions={polylinePositions} pathOptions={{ color: '#f97316', weight: 4, dashArray: '10, 10' }} />
      <Marker position={coords.origin} icon={originIcon} />
      <Marker position={coords.dest} icon={destIcon} />
      <Marker position={coords.current} icon={truckIcon} zIndexOffset={1000} />
    </MapContainer>
  );
}
