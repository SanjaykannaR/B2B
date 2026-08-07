import { useState } from 'react';
import { 
  Search, Package, MapPin, Navigation, 
  CheckCircle2, Clock, Truck, FileText
} from 'lucide-react';
import ProgressStepper from '../shared/ProgressStepper';

const mockShipments = [
  {
    id: 'TRK-2026-0001',
    status: 'In-Transit',
    origin: 'Factory A, Chicago, IL',
    destination: 'Warehouse B, Detroit, MI',
    distance: '280 miles',
    duration: '4h 30m',
    weight: '4,000 kg',
    volume: '15 m³',
    items: 200,
    hazmat: false,
    driver: 'Dave Johnson',
    vehicle: 'TRK-002 (Mercedes Actros)',
    timeline: [
      { status: 'In-Transit', note: 'Departed distribution hub', time: 'Today, 08:30 AM' },
      { status: 'Assigned', note: 'Driver assigned to manifest', time: 'Yesterday, 14:00 PM' },
      { status: 'Pending', note: 'Order received from client', time: 'Yesterday, 10:15 AM' }
    ]
  },
  {
    id: 'TRK-2026-0002',
    status: 'Delivered',
    origin: 'Warehouse E, NY',
    destination: 'Retail Store F, CT',
    distance: '120 miles',
    duration: '2h 15m',
    weight: '3,200 kg',
    volume: '8 m³',
    items: 50,
    hazmat: false,
    driver: 'Mike Smith',
    vehicle: 'TRK-001 (Volvo FH16)',
    timeline: [
      { status: 'Delivered', note: 'Proof of delivery signed by store manager', time: 'Jul 26, 16:45 PM' }
    ]
  }
];

const statusConfig: any = {
  'Pending': { color: 'text-slate-500', bg: 'bg-slate-400/10', border: 'border-slate-400/20', icon: Clock },
  'Assigned': { color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', icon: FileText },
  'In-Transit': { color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/20', icon: Truck },
  'Delivered': { color: 'text-success', bg: 'bg-success/10', border: 'border-success/20', icon: CheckCircle2 }
};

export default function ShipmentTracker() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeId, setActiveId] = useState(mockShipments[0]!.id);

  const filteredShipments = mockShipments.filter(s => 
    s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeShipment = (mockShipments.find(s => s.id === activeId) || mockShipments[0]) as typeof mockShipments[0];

  return (
    <div className="flex flex-col md:flex-row h-[75vh] border border-slate-200 rounded-2xl overflow-hidden shadow-xl bg-[#f5f6f8] animate-[dashPopIn_0.7s_ease-out_both]">
      
      {/* LEFT PANEL: SEARCH & LIST */}
      <div className="w-full md:w-80 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col h-[40%] md:h-full relative z-20">
        <div className="p-3 border-b border-slate-200 bg-white">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-600 group-focus-within:text-accent transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search ID..."
              className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all placeholder-text-secondary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredShipments.map((shipment) => {
            const isSelected = shipment.id === activeId;
            const StatusIcon = statusConfig[shipment.status].icon;
            
            return (
              <div 
                key={shipment.id}
                onClick={() => setActiveId(shipment.id)}
                className={`p-3 rounded-xl cursor-pointer transition-all duration-200 border ${
                  isSelected 
                    ? 'bg-accent/10 border-accent shadow-[0_0_10px_rgba(255,107,44,0.1)]' 
                    : 'bg-white border-transparent hover:border-slate-200 hover:bg-white/80'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className={`font-mono text-sm font-bold ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>
                    {shipment.id}
                  </span>
                  <StatusIcon className={`w-3.5 h-3.5 ${statusConfig[shipment.status].color}`} />
                </div>
                <div className="text-xs text-slate-500 truncate flex items-center">
                  <MapPin className="w-3 h-3 mr-1 inline" /> {shipment.destination}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT PANEL: DETAILS */}
      <div className="flex-1 overflow-y-auto bg-[#f5f6f8] relative z-10 p-1 md:p-2">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200">
          <div>
            <h2 className="text-xs font-bold text-accent uppercase tracking-widest mb-1">Manifest</h2>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono">{activeShipment.id}</h1>
          </div>
          <div className={`flex items-center px-3 py-1.5 rounded-lg border ${statusConfig[activeShipment.status].bg} ${statusConfig[activeShipment.status].border}`}>
            <span className={`text-sm font-bold ${statusConfig[activeShipment.status].color}`}>{activeShipment.status}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-3">
            <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center"><Navigation className="w-4 h-4 mr-2 text-accent" /> Route Info</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-600 uppercase font-bold mb-1">Origin</p>
                <p className="text-sm text-slate-900">{activeShipment.origin}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600 uppercase font-bold mb-1">Destination</p>
                <p className="text-sm text-slate-900">{activeShipment.destination}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center"><Package className="w-4 h-4 mr-2 text-accent" /> Cargo Specs</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-600 mb-1">Weight</p>
                <p className="font-mono text-slate-900 font-bold">{activeShipment.weight}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600 mb-1">Volume</p>
                <p className="font-mono text-slate-900 font-bold">{activeShipment.volume}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Stepper */}
        <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-3 overflow-hidden mt-6">
          <h3 className="text-sm font-bold text-slate-900 mb-6">Delivery Progress</h3>
          <ProgressStepper currentStatus={activeShipment.status} />
        </div>

      </div>
    </div>
  );
}

