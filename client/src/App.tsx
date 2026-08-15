import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store/store';
import Login from './pages/Login';
import ClientDashboard from './pages/client/ClientDashboard';
import TrackShipment from './pages/client/TrackShipment';

import ClientInvoices from './pages/client/ClientInvoices';
import PlaceOrder from './pages/client/PlaceOrder';
import ClientSettings from './pages/client/ClientSettings';

import AdminDashboard from './pages/admin/AdminDashboard';
import FleetMonitor from './pages/admin/FleetMonitor';
import LiveOperations from './pages/admin/LiveOperations';
import ManifestCreate from './pages/admin/ManifestCreate';

// Temporary placeholders for role dashboards not yet wired (Modules 14/16/17).
function RolePlaceholder({ title }: { title: string }) {
  return (
    <div className="min-h-screen bg-[#f5f6f8] flex items-center justify-center font-sans">
      <div className="text-center p-6 sm:p-10">
        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">{title}</h1>
        <p className="text-slate-500">This workspace is under construction. Log in with a client account to use the live portal.</p>
        <a href="/login" className="inline-block mt-6 text-orange-500 font-bold hover:underline">Sign out</a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 600 },
          }}
        />

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/client/dashboard" replace />} />

          <Route path="/client/dashboard" element={<ClientDashboard />} />
          <Route path="/client/place-order" element={<PlaceOrder />} />
          <Route path="/client/track" element={<TrackShipment />} />
          <Route path="/client/invoices" element={<ClientInvoices />} />
          <Route path="/client/settings" element={<ClientSettings />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/fleet" element={<FleetMonitor />} />
          <Route path="/admin/operations" element={<LiveOperations />} />
          <Route path="/admin/manifest/create" element={<ManifestCreate />} />

          {/* Role dashboards — replace placeholders when Modules 16/17 land */}
          <Route path="/driver/dashboard" element={<RolePlaceholder title="Driver Dashboard" />} />
          <Route path="/executive/analytics" element={<RolePlaceholder title="Executive Analytics" />} />

          <Route path="*" element={<Navigate to="/client/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}
