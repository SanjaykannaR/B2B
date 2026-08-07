import { PackageSearch, Activity, MapPin, FileText, RefreshCw, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import OrderForm from '../../components/client/OrderForm';

export default function PlaceOrder() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-[#f5f6f8] text-slate-900 font-sans flex flex-col relative">
      
      {/* ── Global Navbar ── */}
      <nav className="bg-white border-b border-slate-200 py-4 px-4 md:px-8 sticky top-0 z-50 shadow-md">
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
            <button onClick={() => navigate('/track')} className="text-slate-600 hover:text-orange-500 transition-colors flex items-center space-x-1.5">
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
                className="text-orange-500 transition-colors flex items-center space-x-1.5"
              >
                <Package className="w-4 h-4" />
                <span>New Shipment</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <div className="flex-1 w-full flex flex-col items-center justify-start pt-12 p-4 md:p-8">
        <div className="w-full max-w-5xl mx-auto">
          <OrderForm />
        </div>
      </div>
    </div>
  );
}
